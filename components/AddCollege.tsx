import React, { useState } from "react";
import ManualCollegeBasicEditor, {
  createEmptyFormattedAbout,
  createEmptyStructuredTocSection,
} from "./ManualCollegeBasicEditor";
import ManualCollegeCourseEditor, { createEmptyCollegeCourse } from "./ManualCollegeCourseEditor";
import SmartRenderer from "./SmartRenderer";
import { MANUAL_COLLEGE_API_URL } from "../services/apiService";

interface AddCollegeProps {
  onBack: () => void;
  onSaved?: () => void;
}

const createEmptyRichContent = () => ({
  blocks: [],
});

const createEmptyHighlight = () => ({
  label: "",
  value: "",
});

const createEmptyTocSection = () => ({
  section: "",
  content: "",
});

const createEmptyTypedContentItem = (type: "text" | "table" | "list" = "text") =>
  type === "table"
    ? { type: "table", value: [["", ""]] }
    : type === "list"
      ? { type: "list", value: [""] }
      : { type: "text", value: "" };

const createEmptyIndexedTocSection = () => ({
  section: "",
  content: [createEmptyTypedContentItem("text")],
});

const createEmptyImportantDate = () => ({
  event: "",
  date: "",
});

const createEmptyImportantDates = () => ({
  important_events: [createEmptyImportantDate()],
  expired_events: [],
});

const createEmptyWhatStudentsSay = () => ({
  likes: [""],
  dislikes: [""],
});

const createEmptyReviewBreakdown = () => ({
  "5": "",
  "4": "",
  "3": "",
  "2": "",
  "1": "",
});

const createEmptyCategoryRatings = () => ({
  Academic: "",
  Faculty: "",
  Infrastructure: "",
  Accommodation: "",
});

const createEmptyReviewsPage = () => ({
  what_students_say: createEmptyWhatStudentsSay(),
  overall_rating: {
    score: "",
    total_reviews: "",
    breakdown: createEmptyReviewBreakdown(),
  },
  category_ratings: createEmptyCategoryRatings(),
  gallery_images: [],
});

const createEmptyFacultyMember = () => ({
  name: "",
  designation: "",
  department: "",
  qualification: "",
  image: "",
});

const createEmptyQnaAnswer = () => ({
  author: "",
  qualification: "",
  posted_on: "",
  answer: "",
});

const createEmptyQnaItem = () => ({
  question: "",
  answers: [createEmptyQnaAnswer()],
});

const createEmptyPackageHighlights = () => ({
  highest_package: "",
  average_package: "",
  top_recruiters: [""],
});

const isPlainObject = (value: any): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getStringValue = (value: any) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const extractPlainText = (value: any): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => extractPlainText(item)).filter(Boolean).join("\n");
  }

  if (!isPlainObject(value)) {
    return "";
  }

  if (typeof value.value === "string") {
    return value.value;
  }

  if (typeof value.text === "string") {
    return value.text;
  }

  if (Array.isArray(value.blocks)) {
    return value.blocks
      .map((block: any) => extractPlainText(block?.data?.text ?? block?.value ?? ""))
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

const normalizeStringList = (value: any) =>
  Array.isArray(value) ? value.map((item) => getStringValue(item)).filter(Boolean) : [];

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const normalizeTableValue = (value: any) => {
  if (Array.isArray(value) && value.every((row) => Array.isArray(row))) {
    return value.map((row) => row.map((cell) => getStringValue(cell)));
  }

  if (isPlainObject(value) && Array.isArray(value.columns) && Array.isArray(value.rows)) {
    const columns = value.columns.map((column: any) => getStringValue(column));
    const rows = value.rows.map((row: any) =>
      Array.isArray(row) ? row.map((cell: any) => getStringValue(cell)) : [getStringValue(row)]
    );

    return [columns, ...rows];
  }

  return [["", ""]];
};

const normalizeTocContentItem = (item: any) => {
  const rawType =
    typeof item?.type === "string"
      ? item.type.toLowerCase()
      : typeof item?.data?.type === "string"
        ? item.data.type.toLowerCase()
        : "text";

  if (rawType === "table") {
    return {
      type: "table",
      value: normalizeTableValue(item?.value ?? item?.data),
    };
  }

  if (rawType === "list") {
    return {
      type: "list",
      value: Array.isArray(item?.value)
        ? item.value.map((entry: any) => getStringValue(entry)).filter(Boolean)
        : splitLines(extractPlainText(item?.value ?? item?.data?.items ?? item)),
    };
  }

  return {
    type: "text",
    value: extractPlainText(item?.value ?? item?.data?.text ?? item),
  };
};

const normalizeTocSections = (value: any) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((section: any) => {
    const content = Array.isArray(section?.content)
      ? section.content.map((item: any) => normalizeTocContentItem(item))
      : extractPlainText(section?.content)
        ? [
            {
              type: "text",
              value: extractPlainText(section?.content),
            },
          ]
        : [];

    return {
      section: extractPlainText(section?.section),
      content,
    };
  });
};

const normalizeBasicSection = (value: any) => {
  const basic = isPlainObject(value) ? value : {};

  return {
    ...basic,
    name: getStringValue(basic.name).trim(),
    logo: getStringValue(basic.logo),
    location: getStringValue(basic.location),
    city: getStringValue(basic.city),
    state: getStringValue(basic.state),
    college_type: getStringValue(basic.college_type),
    established_year: getStringValue(basic.established_year),
    accreditation: normalizeStringList(basic.accreditation),
    affiliations: normalizeStringList(basic.affiliations),
    rating: getStringValue(basic.rating),
    reviews: getStringValue(basic.reviews),
    about: {
      format: "text",
      value: extractPlainText(basic.about),
    },
    about_highlights: Array.isArray(basic.about_highlights)
      ? basic.about_highlights.map((item: any) => ({
          label: getStringValue(item?.label),
          value: getStringValue(item?.value),
        }))
      : [],
    toc_sections: normalizeTocSections(basic.toc_sections),
  };
};

const normalizeSectionWithToc = (value: any) => {
  if (!isPlainObject(value)) {
    return value;
  }

  return {
    ...value,
    toc_sections: normalizeTocSections(value.toc_sections),
  };
};

const normalizeStructuredContentItems = (value: any) => {
  const finalizeItems = (items: any[]) => {
    const normalizedItems = items.filter((item) => {
      if (item?.type === "text") {
        return Boolean(getStringValue(item?.value).trim());
      }

      if (item?.type === "list") {
        return Array.isArray(item?.value) && item.value.some((entry: any) => getStringValue(entry).trim());
      }

      if (item?.type === "table") {
        return Array.isArray(item?.value) && item.value.some((row: any) => Array.isArray(row) && row.some((cell: any) => getStringValue(cell).trim()));
      }

      return false;
    });

    return normalizedItems.length > 0 ? normalizedItems : [createEmptyTypedContentItem("text")];
  };

  if (Array.isArray(value)) {
    return finalizeItems(value.map((item: any) => normalizeTocContentItem(item)));
  }

  if (isPlainObject(value) && Array.isArray(value.blocks)) {
    return finalizeItems(value.blocks.map((item: any) => normalizeTocContentItem(item)));
  }

  const text = extractPlainText(value).trim();

  return text
    ? splitLines(text).map((line) => ({
        type: "text",
        value: line,
      }))
    : [createEmptyTypedContentItem("text")];
};

const normalizeIndexedTocSection = (value: any) => ({
  section: extractPlainText(value?.section),
  content: Array.isArray(value?.content)
    ? value.content.map((item: any) => normalizeTocContentItem(item))
    : extractPlainText(value?.content)
      ? [{ type: "text", value: extractPlainText(value?.content) }]
      : [createEmptyTypedContentItem("text")],
});

const normalizeIndexedTocSections = (value: any) => {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.map((section: any, index: number) => [String(index), normalizeIndexedTocSection(section)]));
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return {};
    }

    return Object.fromEntries(
      entries.map(([key, section]) => [key, normalizeIndexedTocSection(section)])
    );
  }

  return {};
};

const normalizeRichContent = (value: any) => {
  if (isPlainObject(value) && Array.isArray(value.blocks)) {
    return {
      ...value,
      blocks: value.blocks,
    };
  }

  const text = extractPlainText(value).trim();

  return text
    ? {
        blocks: [
          {
            type: "text",
            data: {
              text,
            },
          },
        ],
      }
    : createEmptyRichContent();
};

const buildImportantDateStatus = (value: string) => {
  const date = getStringValue(value).trim();

  if (!date) {
    return [];
  }

  const cleanedRange = date.replace(/^(ongoing|tentative|expected|closed)\s+/i, "").trim();
  const rangeParts = cleanedRange.split(/\s+-\s+/);

  if (rangeParts.length >= 2) {
    const start = rangeParts[0].trim();
    const end = rangeParts.slice(1).join(" - ").trim();

    return [cleanedRange, start, `- ${end}`].filter(Boolean);
  }

  return [date];
};

const getLastDateFromString = (value: string) => {
  const date = getStringValue(value).trim();

  if (!date) {
    return null;
  }

  const matches = date.match(/[A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}/g);

  if (!matches || matches.length === 0) {
    return null;
  }

  const lastMatch = matches[matches.length - 1];
  const parsed = new Date(lastMatch);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isExpiredImportantDate = (value: string) => {
  const parsedDate = getLastDateFromString(value);

  if (!parsedDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  return parsedDate < today;
};

const normalizeImportantDateItem = (value: any) => {
  const event = extractPlainText(value?.event ?? value?.title ?? value?.name).trim();
  const date = extractPlainText(value?.date ?? value?.value).trim();
  const status = Array.isArray(value?.status)
    ? value.status.map((item: any) => getStringValue(item)).filter(Boolean)
    : buildImportantDateStatus(date);

  return {
    event,
    date,
    status,
  };
};

const normalizeImportantDates = (value: any) => {
  const base = isPlainObject(value) ? { ...value } : {};

  const rawImportantEvents = Array.isArray(value?.important_events)
    ? value.important_events
    : Array.isArray(value)
      ? value
      : [];

  const rawExpiredEvents = Array.isArray(value?.expired_events) ? value.expired_events : [];

  const normalizedImportantEvents = rawImportantEvents
    .map((item: any) => normalizeImportantDateItem(item))
    .filter((item) => item.event || item.date);

  const normalizedExpiredEvents = rawExpiredEvents
    .map((item: any) => normalizeImportantDateItem(item))
    .filter((item) => item.event || item.date);

  const important_events = normalizedImportantEvents.filter((item) => !isExpiredImportantDate(item.date));
  const expired_events = [
    ...normalizedExpiredEvents,
    ...normalizedImportantEvents.filter((item) => isExpiredImportantDate(item.date)),
  ];

  delete base.important_events;
  delete base.expired_events;

  return {
    ...base,
    important_events,
    expired_events,
  };
};

const normalizeAdmissionSection = (value: any) => {
  if (!isPlainObject(value)) {
    return value;
  }

  return {
    ...normalizeSectionWithToc(value),
    about: normalizeRichContent(value.about),
    important_dates: normalizeImportantDates(value.important_dates),
  };
};

const normalizeRankingSection = (value: any) => {
  if (!isPlainObject(value)) {
    return value;
  }

  return {
    ...value,
    about: normalizeStructuredContentItems(value.about),
    toc_sections: normalizeIndexedTocSections(value.toc_sections),
  };
};

const normalizeNumericValue = (value: any) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : "";
  }

  const text = getStringValue(value).trim();

  if (!text) {
    return "";
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : text;
};

const normalizeReviewList = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((item) => extractPlainText(item).trim()).filter(Boolean);
  }

  return splitLines(extractPlainText(value));
};

const normalizeWhatStudentsSay = (value: any) => {
  const hasBuckets = isPlainObject(value) && (Array.isArray(value.likes) || Array.isArray(value.dislikes));
  const fallbackLikes = hasBuckets ? [] : normalizeReviewList(value);

  return {
    likes: hasBuckets ? normalizeReviewList(value.likes) : fallbackLikes,
    dislikes: hasBuckets ? normalizeReviewList(value.dislikes) : [],
  };
};

const normalizeReviewBreakdown = (value: any) => {
  const source = isPlainObject(value) ? value : {};

  return {
    "5": normalizeNumericValue(source["5"]),
    "4": normalizeNumericValue(source["4"]),
    "3": normalizeNumericValue(source["3"]),
    "2": normalizeNumericValue(source["2"]),
    "1": normalizeNumericValue(source["1"]),
  };
};

const normalizeCategoryRatings = (value: any) => {
  const source = isPlainObject(value) ? value : {};
  const result: Record<string, any> = {
    Academic: normalizeNumericValue(source.Academic ?? source.academic ?? source.academics),
    Faculty: normalizeNumericValue(source.Faculty ?? source.faculty),
    Infrastructure: normalizeNumericValue(source.Infrastructure ?? source.infrastructure),
    Accommodation: normalizeNumericValue(source.Accommodation ?? source.accommodation),
  };

  const matchedKeys = new Set([
    "Academic",
    "academic",
    "academics",
    "Faculty",
    "faculty",
    "Infrastructure",
    "infrastructure",
    "Accommodation",
    "accommodation",
  ]);

  Object.entries(source).forEach(([key, entryValue]) => {
    if (!matchedKeys.has(key)) {
      result[key] = normalizeNumericValue(entryValue);
    }
  });

  return result;
};

const normalizeReviewsPage = (value: any) => {
  const reviewPage = isPlainObject(value) ? value : {};

  return {
    what_students_say: normalizeWhatStudentsSay(reviewPage.what_students_say),
    overall_rating: {
      score: normalizeNumericValue(reviewPage.overall_rating?.score ?? reviewPage.overall_rating?.rating),
      total_reviews: normalizeNumericValue(reviewPage.overall_rating?.total_reviews),
      breakdown: normalizeReviewBreakdown(reviewPage.overall_rating?.breakdown),
    },
    category_ratings: normalizeCategoryRatings(reviewPage.category_ratings),
    gallery_images: normalizeStringList(reviewPage.gallery_images),
  };
};

const createEmptyCollege = () => ({
  basic: {
    name: "",
    logo: "",
    location: "",
    city: "",
    state: "",
    college_type: "",
    established_year: "",
    accreditation: [""],
    affiliations: [""],
    rating: "",
    reviews: "",
    about: createEmptyFormattedAbout(),
    about_highlights: [createEmptyHighlight()],
    toc_sections: [createEmptyStructuredTocSection()],
  },
  college_course: createEmptyCollegeCourse(),
  admission: {
    about: createEmptyRichContent(),
    about_highlights: [createEmptyHighlight()],
    toc_sections: [createEmptyTocSection()],
    important_dates: createEmptyImportantDates(),
  },
  reviews_page: createEmptyReviewsPage(),
  ranking: {
    about: [createEmptyTypedContentItem("text")],
    toc_sections: {
      0: createEmptyIndexedTocSection(),
    },
  },
  placement: {
    about: [""],
    package_highlights: createEmptyPackageHighlights(),
    toc_sections: [createEmptyTocSection()],
  },
  faculty: {
    members: [createEmptyFacultyMember()],
  },
  cutoff: {
    about: [""],
    toc_sections: [createEmptyTocSection()],
  },
  scholarship: {
    toc_sections: [createEmptyTocSection()],
  },
  gallery: [],
  fees_range: {
    min: "",
    max: "",
  },
  hero_image: "",
  hero_images: [],
  location: "",
  updated_at: "",
  qna: [createEmptyQnaItem()],
  avg_fees: "",
  featured_college: "",
});

const AddCollege: React.FC<AddCollegeProps> = ({ onBack, onSaved }) => {
  const [college, setCollege] = useState<any>(() => createEmptyCollege());
  const [saving, setSaving] = useState(false);

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

  const buildSavePayload = (currentCollege: any) => {
    const payload = { ...currentCollege };
    payload.basic = normalizeBasicSection(payload.basic);
    payload.admission = normalizeAdmissionSection(payload.admission);
    payload.reviews_page = normalizeReviewsPage(payload.reviews_page);
    payload.placement = normalizeSectionWithToc(payload.placement);
    payload.cutoff = normalizeSectionWithToc(payload.cutoff);
    payload.scholarship = normalizeSectionWithToc(payload.scholarship);
    payload.ranking = normalizeRankingSection(payload.ranking);

    const basic = payload.basic || {};

    payload.name = String(payload.name || basic.name || "").trim();
    payload.logo = payload.logo || basic.logo || "";
    payload.city = payload.city || basic.city || "";
    payload.state = payload.state || basic.state || "";
    payload.location =
      payload.location ||
      basic.location ||
      [payload.city, payload.state].filter(Boolean).join(", ");

    if (!payload.name) {
      throw new Error("Basic > Name is required");
    }

    payload.content = payload.content || {};
    payload.content.about = payload.content.about || {
      title: "About College",
      blocks: [],
    };

    if (payload.college_course && typeof payload.college_course === "object") {
      payload.college_course = {
        ...payload.college_course,
        source: payload.college_course.source || "manual",
        college_id:
          payload.college_course.college_id ||
          payload.college_id ||
          "",
        courses: Array.isArray(payload.college_course.courses)
          ? payload.college_course.courses.map((course: any) => ({
              ...course,
              college_id:
                course?.college_id ||
                payload.college_course.college_id ||
                payload.college_id ||
                "",
              sub_course_count: Array.isArray(course?.sub_courses)
                ? course.sub_courses.length
                : course?.sub_course_count || "",
            }))
          : createEmptyCollegeCourse().courses,
      };
    }

    return payload;
  };

  const handleSaveCollege = async () => {
    try {
      setSaving(true);

      const collegePayload = buildSavePayload(college);
      const res = await fetch(MANUAL_COLLEGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collegePayload),
      });

      const json = await parseApiResponse(res);

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to create college");
      }

      alert("College created successfully");
      onSaved?.();
    } catch (err: any) {
      const message =
        err?.name === "TypeError" && /fetch/i.test(err?.message || "")
          ? `Failed to reach ${MANUAL_COLLEGE_API_URL}. Check that the local backend is running on the same protocol.`
          : err.message || "Failed to create college";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-blue-600">
            Back to Colleges
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Add New College
          </h1>

          <p className="text-sm text-gray-500">
            Blank CMS form for manual college entry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollege(createEmptyCollege())}
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>

          <button
            onClick={handleSaveCollege}
            disabled={saving}
            className={`rounded px-6 py-2 text-white ${
              saving
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save College"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Sections ready hain. College details ke liye normal CMS form use karo, aur courses ke liye simple easy-entry section niche diya gaya hai.
        </p>
      </div>

      <ManualCollegeBasicEditor
        value={college.basic}
        onChange={(nextBasic) =>
          setCollege((prev: any) => ({
            ...prev,
            basic: nextBasic,
          }))
        }
      />

      <ManualCollegeCourseEditor
        value={college.college_course}
        onChange={(nextCollegeCourse) =>
          setCollege((prev: any) => ({
            ...prev,
            college_course: nextCollegeCourse,
          }))
        }
      />

      <div className="space-y-4">
        <SmartRenderer value={college} onChange={setCollege} hiddenKeys={["basic", "college_course"]} />
      </div>
    </div>
  );
};

export default AddCollege;
