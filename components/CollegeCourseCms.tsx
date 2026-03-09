import React from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import SmartRenderer from "./SmartRenderer";

interface CollegeCourseCmsProps {
  data: any;
  loading: boolean;
  error: string | null;
  onChange: (value: any) => void;
  onSave: () => void;
  saving: boolean;
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
      <p className="mt-1 text-sm font-medium text-slate-800 break-words">
        {String(value)}
      </p>
    </div>
  );
};

const CollegeCourseCms: React.FC<CollegeCourseCmsProps> = ({
  data,
  loading,
  error,
  onChange,
  onSave,
  saving,
}) => {
  const courseCount = Array.isArray(data?.courses) ? data.courses.length : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
            College Course CMS
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Edit courses, course details and sub-courses
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Yahan se aap field add, delete aur update kar sakte ho. Save Changes par ye course CMS DB me update hoga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {data?.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
            >
              <ExternalLink size={16} />
              Source URL
            </a>
          )}

          <button
            onClick={onSave}
            disabled={loading || !!error || !data || saving}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              loading || !!error || !data || saving
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save Course CMS"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8 text-slate-600">
          <Loader2 size={18} className="animate-spin" />
          Loading course and fee data...
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !data && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
          Is college ke liye abhi course-fees data available nahi hai.
        </div>
      )}

      {!loading && !error && data && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Source" value={data.source} />
            <StatCard label="College Id" value={data.college_id} />
            <StatCard label="Courses" value={courseCount} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
            <SmartRenderer
              value={data}
              onChange={onChange}
              useFlatObjectTable={false}
              showCmsBlockControls={false}
              allowAddField={true}
              hiddenKeys={["_id", "id", "__v", "heroDownloaded"]}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default CollegeCourseCms;
