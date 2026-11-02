"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";

type CourseOption = {
  id: string;
  code: string;
  title: string;
  programme: {
    name: string;
    department: { name: string };
  };
};

export function HandbookUploadForm({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <label htmlFor="handbook-title" className="text-sm font-medium">
          Handbook title
        </label>
        <input
          id="handbook-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          placeholder="e.g. Introduction to Programming"
          className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="handbook-course" className="text-sm font-medium">
          Course
        </label>
        <select
          id="handbook-course"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          required
          className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} — {course.title} · {course.programme.name} · {course.programme.department.name}
            </option>
          ))}
        </select>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
          No courses are available. Add courses to the academic catalogue before uploading a handbook.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">PDF file</p>
          <UploadDropzone
            endpoint="handbookUploader"
            input={{ courseId, title: title.trim() }}
            disabled={!courseId || !title.trim() || uploaded}
            onClientUploadComplete={() => {
              setUploaded(true);
              router.push("/handbooks");
              router.refresh();
            }}
            onUploadError={(error) => {
              console.error("Handbook upload failed:", error);
            }}
            appearance={{
              container: "rounded-2xl border border-dashed border-border bg-muted/20",
              label: "text-foreground hover:text-primary",
              allowedContent: "text-muted-foreground",
              button: "rounded-2xl bg-primary text-primary-foreground",
            }}
          />
          <p className="text-xs text-muted-foreground">
            PDF only. Maximum file size: 16 MB. The handbook will become available after processing completes.
          </p>
        </div>
      )}
    </div>
  );
}
