import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Layers, Plus, Trash2 } from "lucide-react";

interface ManualCollegeCourseEditorProps {
  value: any;
  onChange: (value: any) => void;
}

const isPlainObject = (value: any): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStringValue = (value: any) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const toLines = (value: any[]) =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (isPlainObject(item)) {
            return getStringValue(item.value || item.src || item.url || "");
          }

          return "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const matrixToText = (value: any) => {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((row) => (Array.isArray(row) ? row.map((cell) => getStringValue(cell)).join(" | ") : getStringValue(row)))
    .join("\n");
};

const textToMatrix = (value: string) => {
  const rows = value
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split("|").map((cell) => cell.trim()));

  return rows.length > 0 ? rows : [["", ""]];
};

const listToText = (value: any) =>
  Array.isArray(value) ? value.map((item) => getStringValue(item)).filter(Boolean).join("\n") : "";

const textToList = (value: string) => splitLines(value);

export const createEmptyCourseCmsTextNode = (value = "") => ({
  type: "text",
  value,
});

export const createEmptyCourseCmsContent = (type: "text" | "table" | "list" = "text") =>
  type === "table"
    ? { type: "table", value: [["", ""]] }
    : type === "list"
      ? { type: "list", value: [""] }
      : { type: "text", value: "" };

export const createEmptyCourseCmsSection = () => ({
  section: "",
  content: [createEmptyCourseCmsContent("text")],
});

export const createEmptyCourseDetail = () => ({
  url: "",
  page_heading: "",
  about: [],
  toc_sections: [],
});

export const createEmptySubCourse = () => ({
  name: createEmptyCourseCmsTextNode(),
  url: createEmptyCourseCmsTextNode(),
  slug_url: createEmptyCourseCmsTextNode(),
  rating: "",
  reviews: "",
  fees: {
    summary: "",
  },
  application_date: "",
  cutoff: "",
  course_detail: createEmptyCourseDetail(),
});

export const createEmptyCourseItem = () => ({
  course_name: "",
  course_url: "",
  slug_url: "",
  rating: "",
  reviews: "",
  sub_course_count: "",
  fees: {
    summary: "",
  },
  duration: "",
  eligibility: "",
  application_date: "",
  college_id: "",
  course_detail: createEmptyCourseDetail(),
  sub_courses: [],
});

export const createEmptyCollegeCourse = () => ({
  source: "manual",
  url: "",
  college_id: "",
  courses: [createEmptyCourseItem()],
});

const ensureTextNode = (value: any) => {
  if (isPlainObject(value)) {
    return {
      type: typeof value.type === "string" ? value.type : "text",
      value: getStringValue(value.value),
    };
  }

  return createEmptyCourseCmsTextNode(getStringValue(value));
};

const normalizeCourseCmsContentItem = (item: any) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "text";

  if (type === "table") {
    return {
      type: "table",
      value: Array.isArray(item?.value)
        ? item.value.map((row: any) => (Array.isArray(row) ? row.map((cell: any) => getStringValue(cell)) : [getStringValue(row)]))
        : [["", ""]],
    };
  }

  if (type === "list") {
    return {
      type: "list",
      value: Array.isArray(item?.value)
        ? item.value.map((entry: any) => getStringValue(entry)).filter(Boolean)
        : splitLines(getStringValue(item?.value)),
    };
  }

  return {
    type: "text",
    value: getStringValue(item?.value),
  };
};

const normalizeSection = (value: any) => ({
  section: getStringValue(value?.section),
  content: Array.isArray(value?.content)
    ? value.content.map((item: any) => normalizeCourseCmsContentItem(item))
    : getStringValue(value?.content)
      ? [{ type: "text", value: getStringValue(value?.content) }]
      : [createEmptyCourseCmsContent("text")],
});

const normalizeCourseDetail = (value: any) => ({
  ...createEmptyCourseDetail(),
  ...(isPlainObject(value) ? value : {}),
  about: Array.isArray(value?.about) ? value.about.map((item: any) => getStringValue(item)).filter(Boolean) : [],
  toc_sections: Array.isArray(value?.toc_sections)
    ? value.toc_sections.map((section: any) => normalizeSection(section))
    : [],
});

const normalizeSubCourse = (value: any) => ({
  ...createEmptySubCourse(),
  ...(isPlainObject(value) ? value : {}),
  name: ensureTextNode(value?.name),
  url: ensureTextNode(value?.url),
  slug_url: ensureTextNode(value?.slug_url),
  fees: {
    summary: getStringValue(value?.fees?.summary),
    ...(isPlainObject(value?.fees) ? value.fees : {}),
  },
  course_detail: normalizeCourseDetail(value?.course_detail),
});

const normalizeCourse = (value: any) => ({
  ...createEmptyCourseItem(),
  ...(isPlainObject(value) ? value : {}),
  fees: {
    summary: getStringValue(value?.fees?.summary),
    ...(isPlainObject(value?.fees) ? value.fees : {}),
  },
  course_detail: normalizeCourseDetail(value?.course_detail),
  sub_courses: Array.isArray(value?.sub_courses)
    ? value.sub_courses.map((subCourse: any) => normalizeSubCourse(subCourse))
    : [],
});

const normalizeCollegeCourse = (value: any) => ({
  ...createEmptyCollegeCourse(),
  ...(isPlainObject(value) ? value : {}),
  source: getStringValue(value?.source || "manual") || "manual",
  url: getStringValue(value?.url),
  college_id: getStringValue(value?.college_id),
  courses: Array.isArray(value?.courses)
    ? value.courses.map((course: any) => normalizeCourse(course))
    : [createEmptyCourseItem()],
});

const SectionShell = ({
  title,
  subtitle,
  defaultOpen = true,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Icon size={16} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {isOpen ? "Close" : "Open"}
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {isOpen && <div className="border-t border-slate-100 p-5">{children}</div>}
    </div>
  );
};

const FieldLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <div className="mb-1 flex items-center justify-between gap-3">
    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </div>
);

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) => (
  <label className="block">
    <FieldLabel label={label} hint={hint} />
    <input
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) => (
  <label className="block">
    <FieldLabel label={label} hint={hint} />
    <textarea
      rows={rows}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const TocContentEditor = ({
  value,
  onChange,
}: {
  value: any[];
  onChange: (value: any[]) => void;
}) => {
  const items = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange([...(items || []), createEmptyCourseCmsContent("text")])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add Text
        </button>
        <button
          type="button"
          onClick={() => onChange([...(items || []), createEmptyCourseCmsContent("table")])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
        >
          <Plus size={16} />
          Add Table
        </button>
        <button
          type="button"
          onClick={() => onChange([...(items || []), createEmptyCourseCmsContent("list")])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
        >
          <Plus size={16} />
          Add List
        </button>
      </div>

      {items.map((item, index) => {
        const type = item?.type === "table" ? "table" : item?.type === "list" ? "list" : "text";

        return (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={type}
                onChange={(event) => {
                  const nextType =
                    event.target.value === "table"
                      ? "table"
                      : event.target.value === "list"
                        ? "list"
                        : "text";
                  const nextItems = [...items];
                  nextItems[index] = createEmptyCourseCmsContent(nextType);
                  onChange(nextItems);
                }}
              >
                <option value="text">Text</option>
                <option value="table">Table</option>
                <option value="list">List</option>
              </select>

              <button
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>

            {type === "text" ? (
              <TextArea
                label="Text Content"
                value={getStringValue(item?.value)}
                onChange={(nextValue) => {
                  const nextItems = [...items];
                  nextItems[index] = { type: "text", value: nextValue };
                  onChange(nextItems);
                }}
                rows={4}
                placeholder="Paste section paragraph here"
              />
            ) : type === "list" ? (
              <TextArea
                label="List Items"
                hint="One line per item"
                value={listToText(item?.value)}
                onChange={(nextValue) => {
                  const nextItems = [...items];
                  nextItems[index] = { type: "list", value: textToList(nextValue) };
                  onChange(nextItems);
                }}
                rows={5}
                placeholder={"UGC approved\nIndustry mentors\nScholarship support"}
              />
            ) : (
              <TextArea
                label="Table Content"
                hint="One row per line, columns with |"
                value={matrixToText(item?.value)}
                onChange={(nextValue) => {
                  const nextItems = [...items];
                  nextItems[index] = { type: "table", value: textToMatrix(nextValue) };
                  onChange(nextItems);
                }}
                rows={5}
                placeholder={"Particulars | Details\nMode | Full time"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const TocSectionsEditor = ({
  value,
  onChange,
}: {
  value: any[];
  onChange: (value: any[]) => void;
}) => {
  const sections = Array.isArray(value) ? value.map((item) => normalizeSection(item)) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Page Sections</p>
          <p className="text-xs text-slate-500">One section card per heading. Put one line per content point.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...(sections || []), createEmptyCourseCmsSection()])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          No page sections added yet.
        </div>
      )}

      {sections.map((section, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">
              Section {index + 1}
            </p>
            <button
              type="button"
              onClick={() => onChange(sections.filter((_, sectionIndex) => sectionIndex !== index))}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Section Title"
              value={section.section}
              onChange={(nextValue) => {
                const nextSections = [...sections];
                nextSections[index] = { ...section, section: nextValue };
                onChange(nextSections);
              }}
              placeholder="Highlights"
            />
          </div>

          <TocContentEditor
            value={section.content}
            onChange={(nextValue) => {
              const nextSections = [...sections];
              nextSections[index] = {
                ...section,
                content: nextValue,
              };
              onChange(nextSections);
            }}
          />
        </div>
      ))}
    </div>
  );
};

const CourseDetailEditor = ({
  value,
  onChange,
  title,
  subtitle,
  defaultOpen = false,
}: {
  value: any;
  onChange: (value: any) => void;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
}) => {
  const detail = normalizeCourseDetail(value);

  return (
    <SectionShell title={title} subtitle={subtitle} defaultOpen={defaultOpen}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Detail Page URL"
            value={getStringValue(detail.url)}
            onChange={(nextValue) => onChange({ ...detail, url: nextValue })}
            placeholder="https://example.com/course-details"
          />

          <TextInput
            label="Page Heading"
            value={getStringValue(detail.page_heading)}
            onChange={(nextValue) => onChange({ ...detail, page_heading: nextValue })}
            placeholder="MBA: Fees, Eligibility, Cutoff"
          />
        </div>

        <TextArea
          label="About"
          hint="One line = one point"
          rows={4}
          value={toLines(detail.about)}
          onChange={(nextValue) => onChange({ ...detail, about: splitLines(nextValue) })}
          placeholder={"Industry-focused program\nInternship support available"}
        />

        <TocSectionsEditor
          value={detail.toc_sections}
          onChange={(nextValue) => onChange({ ...detail, toc_sections: nextValue })}
        />
      </div>
    </SectionShell>
  );
};

const SubCourseCard = ({
  value,
  onChange,
  onDelete,
  index,
}: {
  value: any;
  onChange: (value: any) => void;
  onDelete: () => void;
  index: number;
}) => {
  const subCourse = normalizeSubCourse(value);

  return (
    <SectionShell
      title={getStringValue(subCourse.name.value) || `Sub-course ${index + 1}`}
      subtitle="Simple sub-course form"
      defaultOpen={index === 0}
      icon={Layers}
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
          Remove Sub-course
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput
            label="Sub-course Name"
            value={getStringValue(subCourse.name.value)}
            onChange={(nextValue) => onChange({ ...subCourse, name: createEmptyCourseCmsTextNode(nextValue) })}
            placeholder="Agri-Business Management"
          />

          <TextInput
            label="Sub-course URL"
            value={getStringValue(subCourse.url.value)}
            onChange={(nextValue) => onChange({ ...subCourse, url: createEmptyCourseCmsTextNode(nextValue) })}
            placeholder="https://example.com/sub-course"
          />

          <TextInput
            label="Slug URL"
            value={getStringValue(subCourse.slug_url.value)}
            onChange={(nextValue) => onChange({ ...subCourse, slug_url: createEmptyCourseCmsTextNode(nextValue) })}
            placeholder="agri-business-management"
          />

          <TextInput
            label="Rating"
            value={getStringValue(subCourse.rating)}
            onChange={(nextValue) => onChange({ ...subCourse, rating: nextValue })}
            placeholder="4.2"
          />

          <TextInput
            label="Reviews"
            value={getStringValue(subCourse.reviews)}
            onChange={(nextValue) => onChange({ ...subCourse, reviews: nextValue })}
            placeholder="53"
          />

          <TextInput
            label="Application Date"
            value={getStringValue(subCourse.application_date)}
            onChange={(nextValue) => onChange({ ...subCourse, application_date: nextValue })}
            placeholder="1 Aug - 13 Sept 2025"
          />

          <TextInput
            label="Cutoff"
            value={getStringValue(subCourse.cutoff)}
            onChange={(nextValue) => onChange({ ...subCourse, cutoff: nextValue })}
            placeholder="CAT 70 percentile"
          />
        </div>

        <TextArea
          label="Fees / Fee Notes"
          value={getStringValue(subCourse.fees?.summary)}
          onChange={(nextValue) =>
            onChange({
              ...subCourse,
              fees: {
                ...(isPlainObject(subCourse.fees) ? subCourse.fees : {}),
                summary: nextValue,
              },
            })
          }
          placeholder="Total fee: 12 lakh"
          rows={3}
        />

        <CourseDetailEditor
          value={subCourse.course_detail}
          onChange={(nextValue) => onChange({ ...subCourse, course_detail: nextValue })}
          title="Sub-course Detail Page"
          subtitle="Optional detailed content for this specialization"
        />
      </div>
    </SectionShell>
  );
};

const CourseCard = ({
  value,
  onChange,
  onDelete,
  index,
}: {
  value: any;
  onChange: (value: any) => void;
  onDelete: () => void;
  index: number;
}) => {
  const course = normalizeCourse(value);
  const subCourses = Array.isArray(course.sub_courses) ? course.sub_courses : [];

  return (
    <SectionShell
      title={getStringValue(course.course_name) || `Course ${index + 1}`}
      subtitle={`${subCourses.length} sub-course${subCourses.length === 1 ? "" : "s"} added`}
      defaultOpen={index === 0}
      icon={BookOpen}
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
          Remove Course
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput
            label="Course Name"
            value={getStringValue(course.course_name)}
            onChange={(nextValue) => onChange({ ...course, course_name: nextValue })}
            placeholder="Post Graduate Program in Management"
          />

          <TextInput
            label="Course URL"
            value={getStringValue(course.course_url)}
            onChange={(nextValue) => onChange({ ...course, course_url: nextValue })}
            placeholder="https://example.com/course"
          />

          <TextInput
            label="Slug URL"
            value={getStringValue(course.slug_url)}
            onChange={(nextValue) => onChange({ ...course, slug_url: nextValue })}
            placeholder="post-graduate-program-in-management"
          />

          <TextInput
            label="Duration"
            value={getStringValue(course.duration)}
            onChange={(nextValue) => onChange({ ...course, duration: nextValue })}
            placeholder="2 years"
          />

          <TextInput
            label="Eligibility"
            value={getStringValue(course.eligibility)}
            onChange={(nextValue) => onChange({ ...course, eligibility: nextValue })}
            placeholder="Graduation with 50% + CAT"
          />

          <TextInput
            label="Application Date"
            value={getStringValue(course.application_date)}
            onChange={(nextValue) => onChange({ ...course, application_date: nextValue })}
            placeholder="1 Aug - 13 Sept 2025"
          />

          <TextInput
            label="Rating"
            value={getStringValue(course.rating)}
            onChange={(nextValue) => onChange({ ...course, rating: nextValue })}
            placeholder="4.3"
          />

          <TextInput
            label="Reviews"
            value={getStringValue(course.reviews)}
            onChange={(nextValue) => onChange({ ...course, reviews: nextValue })}
            placeholder="53"
          />
        </div>

        <TextArea
          label="Fees / Fee Notes"
          value={getStringValue(course.fees?.summary)}
          onChange={(nextValue) =>
            onChange({
              ...course,
              fees: {
                ...(isPlainObject(course.fees) ? course.fees : {}),
                summary: nextValue,
              },
            })
          }
          placeholder="Annual fee: 8 lakh"
          rows={3}
        />

        <CourseDetailEditor
          value={course.course_detail}
          onChange={(nextValue) => onChange({ ...course, course_detail: nextValue })}
          title="Course Detail Page"
          subtitle="Page heading, about points and section content"
          defaultOpen
        />

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Sub-courses / Specializations</p>
              <p className="text-xs text-slate-500">Add only if this course has specializations.</p>
            </div>

            <button
              type="button"
              onClick={() => onChange({ ...course, sub_courses: [...subCourses, createEmptySubCourse()] })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} />
              Add Sub-course
            </button>
          </div>

          {subCourses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
              No sub-courses added yet.
            </div>
          )}

          <div className="space-y-3">
            {subCourses.map((subCourse, subCourseIndex) => (
              <SubCourseCard
                key={subCourseIndex}
                value={subCourse}
                index={subCourseIndex}
                onChange={(nextValue) => {
                  const nextSubCourses = [...subCourses];
                  nextSubCourses[subCourseIndex] = nextValue;
                  onChange({ ...course, sub_courses: nextSubCourses });
                }}
                onDelete={() =>
                  onChange({
                    ...course,
                    sub_courses: subCourses.filter((_, currentIndex) => currentIndex !== subCourseIndex),
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

const ManualCollegeCourseEditor = ({ value, onChange }: ManualCollegeCourseEditorProps) => {
  const collegeCourse = normalizeCollegeCourse(value);
  const courses = Array.isArray(collegeCourse.courses) ? collegeCourse.courses : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
          College Course
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Easy Course Entry
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Yeh section non-tech users ke liye simple form me banaya gaya hai. Basic details bharo, lines me content likho, aur zarurat ho tabhi sub-courses add karo.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput
            label="Source"
            value={getStringValue(collegeCourse.source)}
            onChange={(nextValue) => onChange({ ...collegeCourse, source: nextValue })}
            placeholder="manual"
          />

          <TextInput
            label="College Course URL"
            value={getStringValue(collegeCourse.url)}
            onChange={(nextValue) => onChange({ ...collegeCourse, url: nextValue })}
            placeholder="https://example.com/college-courses"
          />

          <TextInput
            label="College ID"
            value={getStringValue(collegeCourse.college_id)}
            onChange={(nextValue) => onChange({ ...collegeCourse, college_id: nextValue })}
            placeholder="25946"
          />
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Tip: start with only course name and URL. Detailed sections and sub-courses can be added later.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Courses</p>
            <p className="text-xs text-slate-500">Each course opens in a clean form instead of a raw nested CMS table.</p>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...collegeCourse, courses: [...courses, createEmptyCourseItem()] })}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>

        {courses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No courses added yet.
          </div>
        )}

        <div className="space-y-4">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              value={course}
              index={index}
              onChange={(nextValue) => {
                const nextCourses = [...courses];
                nextCourses[index] = {
                  ...nextValue,
                  sub_course_count: Array.isArray(nextValue?.sub_courses) ? nextValue.sub_courses.length : 0,
                };
                onChange({ ...collegeCourse, courses: nextCourses });
              }}
              onDelete={() =>
                onChange({
                  ...collegeCourse,
                  courses: courses.filter((_, currentIndex) => currentIndex !== index),
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManualCollegeCourseEditor;
