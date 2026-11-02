import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
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

async function loadCatalogue() {
  const [departments, programmes, courses] = await Promise.all([
    readFile(new URL("../data/departments.json", import.meta.url), "utf8"),
    readFile(new URL("../data/programmes.json", import.meta.url), "utf8"),
    readFile(new URL("../data/courses.json", import.meta.url), "utf8"),
  ]);

  return {
    departments: JSON.parse(departments) as string[],
    programmes: JSON.parse(programmes) as ProgrammeSeed[],
    courses: JSON.parse(courses) as CourseSeed[],
  };
}

function validateCatalogue(
  departments: string[],
  programmes: ProgrammeSeed[],
  courses: CourseSeed[],
) {
  const departmentNames = new Set(departments);
  const programmeCodes = new Set(programmes.map(({ code }) => code));
  const courseKeys = new Set(courses.map(({ programmeCode, code }) => `${programmeCode}:${code}`));

  if (departmentNames.size !== departments.length) {
    throw new Error("The academic catalogue contains duplicate departments.");
  }
  if (programmeCodes.size !== programmes.length) {
    throw new Error("The academic catalogue contains duplicate programme codes.");
  }
  if (courseKeys.size !== courses.length) {
    throw new Error("The academic catalogue contains duplicate course assignments.");
  }

  for (const programme of programmes) {
    if (!departmentNames.has(programme.departmentName)) {
      throw new Error(`Unknown department "${programme.departmentName}" for programme "${programme.code}".`);
    }
  }

  for (const course of courses) {
    if (!programmeCodes.has(course.programmeCode)) {
      throw new Error(`Unknown programme "${course.programmeCode}" for course "${course.code}".`);
    }
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the academic catalogue.");
  }

  const { departments, programmes, courses } = await loadCatalogue();
  validateCatalogue(departments, programmes, courses);

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await prisma.department.createMany({
      data: departments.map((name) => ({ name })),
      skipDuplicates: true,
    });

    const departmentRecords = await prisma.department.findMany({
      where: { name: { in: departments } },
      select: { id: true, name: true },
    });
    const departmentIds = new Map(
      departmentRecords.map(({ id, name }) => [name, id]),
    );

    await prisma.programme.createMany({
      data: programmes.map((programme) => {
        const departmentId = departmentIds.get(programme.departmentName);
        if (!departmentId) {
          throw new Error(`Department "${programme.departmentName}" was not created.`);
        }

        return {
          code: programme.code,
          name: programme.name,
          departmentId,
        };
      }),
      skipDuplicates: true,
    });

    const programmeRecords = await prisma.programme.findMany({
      where: { code: { in: programmes.map(({ code }) => code) } },
      select: { id: true, code: true },
    });
    const programmeIds = new Map(
      programmeRecords.map(({ id, code }) => [code, id]),
    );

    await prisma.course.createMany({
      data: courses.map((course) => {
        const programmeId = programmeIds.get(course.programmeCode);
        if (!programmeId) {
          throw new Error(`Programme "${course.programmeCode}" was not created.`);
        }

        return {
          programmeId,
          code: course.code,
          title: course.title,
        };
      }),
      skipDuplicates: true,
    });

    console.info(
      `Seeded academic catalogue: ${departments.length} departments, ${programmes.length} programmes and ${courses.length} programme courses.`,
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
