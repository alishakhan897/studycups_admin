import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import SmartRenderer from "./SmartRenderer";
import { API_BASE_URL } from "../services/apiService";

interface CourseEditPageProps {
  courseSlug: string;
  onBack: () => void;
}

const StatCard: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {String(value)}
      </p>
    </div>
  );
};

const CourseEditPage: React.FC<CourseEditPageProps> = ({ courseSlug, onBack }) => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseApiResponse = async (res: Response) => {
    const text = await res.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        throw new Error(
          `Server returned HTML instead of JSON for ${res.url} (${res.status} ${res.statusText})`
        );
      }

      throw new Error(text);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        setCourse(null);

        const res = await fetch(`${API_BASE_URL}/main-course-card/${courseSlug}`);

        if (!res.ok) {
          throw new Error("Failed to load course");
        }

        const json = await parseApiResponse(res);
        const nextCourse = json?.course ?? json?.data ?? null;

        if (!json?.success || !nextCourse) {
          throw new Error("Course not found");
        }

        if (mounted) {
          setCourse(nextCourse);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load course");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [courseSlug]);

  const handleSave = async () => {
    if (!course) return;

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE_URL}/main-course-card/${courseSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(course),
      });

      const json = await parseApiResponse(res);
      const nextCourse = json?.course ?? json?.data ?? course;

      if (!json?.success) {
        throw new Error(json?.message || "Course save failed");
      }

      setCourse(nextCourse);
      alert("Course saved successfully");
    } catch (err: any) {
      alert(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading course data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
        <div className="mt-4">
          <button onClick={onBack} className="text-blue-600 underline">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-blue-600">
            Back to Courses
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Edit Course
          </h1>

          <p className="text-sm text-gray-500">
            {course.name || course.course_name}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded px-6 py-2 text-white ${
            saving
              ? "cursor-not-allowed bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save Course"}
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              Main Course CMS
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Edit course details, TOC sections and syllabus CMS
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Yahan se course detail page ke CMS fields update honge aur save par DB me persist honge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {course.source_url && (
              <a
                href={course.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
              >
                <ExternalLink size={16} />
                Source URL
              </a>
            )}

            {course.final_url && (
              <a
                href={course.final_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
              >
                <ExternalLink size={16} />
                Final URL
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Slug" value={course.slug} />
            <StatCard label="Stream" value={course.stream} />
            <StatCard label="Level" value={course.level || course.course_level} />
            <StatCard label="Colleges" value={course.totalColleges || course.total_college_count} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
            <SmartRenderer
              value={course}
              onChange={setCourse}
              useFlatObjectTable={false}
              allowAddField={true}
              hiddenKeys={["_id", "id", "__v", "slug"]}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseEditPage;
