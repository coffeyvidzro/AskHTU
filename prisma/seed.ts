import "dotenv/config";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/client";

type ProgrammeSeed = {
  code: string;
  name: string;
  departmentName: string;
};

type CourseSeed = {
  programmeCode: string;
  code: string;
  title: string;
};

async function inBatches<T>(
  items: T[],
  worker: (item: T) => Promise<unknown>,
  batchSize = 10,
) {
  for (let offset = 0; offset < items.length; offset += batchSize) {
    await Promise.all(items.slice(offset, offset + batchSize).map(worker));
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the academic catalogue.");
  }

  const compressed = await readFile(
    new URL("./seed-data/2026-27.csv.gz.base64", import.meta.url),
    "utf8",
  );
  const catalogue = gunzipSync(Buffer.from(compressed.trim(), "base64")).toString(
    "utf8",
  );

  const departmentNames: string[] = [];
  const programmes: ProgrammeSeed[] = [];
  const courses = new Map<string, CourseSeed>();

  for (const line of catalogue.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;

    const [type, ...fields] = line.split("|");

    if (type === "D" && fields[0]) {
      departmentNames.push(fields[0]);
    } else if (type === "P" && fields.length === 3) {
      programmes.push({
        code: fields[0],
        name: fields[1],
        departmentName: fields[2],
      });
    } else if (type === "C" && fields.length >= 3) {
      const course = {
        programmeCode: fields[0],
        code: fields[1],
        title: fields.slice(2).join("|"),
      };
      courses.set(`${course.programmeCode}:${course.code}`, course);
    }
  }

  const courseSeeds = [...courses.values()];
  if (
    departmentNames.length === 0 ||
    programmes.length === 0 ||
    courseSeeds.length === 0
  ) {
    throw new Error("The academic catalogue seed file is empty or invalid.");
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await inBatches(departmentNames, (name) =>
      prisma.department.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    );

    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    });
    const departmentIds = new Map(
      departments.map((department) => [department.name, department.id]),
    );

    await inBatches(programmes, (programme) => {
      const departmentId = departmentIds.get(programme.departmentName);
      if (!departmentId) {
        throw new Error(
          `Unknown department "${programme.departmentName}" for programme "${programme.code}".`,
        );
      }

      return prisma.programme.upsert({
        where: { code: programme.code },
        update: {
          name: programme.name,
          departmentId,
        },
        create: {
          code: programme.code,
          name: programme.name,
          departmentId,
        },
      });
    });

    const programmeRecords = await prisma.programme.findMany({
      select: { id: true, code: true },
    });
    const programmeIds = new Map(
      programmeRecords.map((programme) => [programme.code, programme.id]),
    );

    await inBatches(courseSeeds, (course) => {
      const programmeId = programmeIds.get(course.programmeCode);
      if (!programmeId) {
        throw new Error(
          `Unknown programme "${course.programmeCode}" for course "${course.code}".`,
        );
      }

      return prisma.course.upsert({
        where: {
          programmeId_code: {
            programmeId,
            code: course.code,
          },
        },
        update: { title: course.title },
        create: {
          programmeId,
          code: course.code,
          title: course.title,
        },
      });
    });

    console.info(
      `Seeded ${departmentNames.length} departments, ${programmes.length} programmes and ${courseSeeds.length} programme courses from the 2026-27 timetable.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Academic catalogue seeding failed:", error);
  process.exitCode = 1;
});
