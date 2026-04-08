import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

interface ManualCollegeBasicEditorProps {
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

const extractText = (value: any): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => extractText(item)).filter(Boolean).join("\n");
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
      .map((block: any) => extractText(block?.data?.text ?? block?.value ?? ""))
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

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

export const createEmptyFormattedAbout = () => ({
  format: "text",
  value: "",
});

export const createEmptyStructuredTocContent = (type: "text" | "table" | "list" = "text") =>
  type === "table"
    ? { type: "table", value: [["", ""]] }
    : type === "list"
      ? { type: "list", value: [""] }
    : { type: "text", value: "" };

export const createEmptyStructuredTocSection = () => ({
  section: "",
  content: [createEmptyStructuredTocContent("text")],
});

const createEmptyHighlight = () => ({
  label: "",
  value: "",
});

const normalizeStringList = (value: any) =>
  Array.isArray(value) ? value.map((item) => getStringValue(item)).filter(Boolean) : [];

const normalizeTocContentItem = (item: any) => {
  const type = typeof item?.type === "string" ? item.type.toLowerCase() : "text";

  if (type === "table") {
    const rawValue = Array.isArray(item?.value) ? item.value : Array.isArray(item?.data?.rows) ? [item.data.columns || [], ...item.data.rows] : [["", ""]];
    return { type: "table", value: rawValue };
  }

  if (type === "list") {
    return {
      type: "list",
      value: Array.isArray(item?.value) ? item.value.map((entry: any) => getStringValue(entry)).filter(Boolean) : splitLines(extractText(item?.value ?? item?.data?.items ?? item)),
    };
  }

  return {
    type: "text",
    value: extractText(item?.value ?? item?.data?.text ?? item),
  };
};

const normalizeTocSection = (value: any) => ({
  section: extractText(value?.section),
  content: Array.isArray(value?.content)
    ? value.content.map((item: any) => normalizeTocContentItem(item))
    : extractText(value?.content)
      ? [{ type: "text", value: extractText(value?.content) }]
      : [createEmptyStructuredTocContent("text")],
});

const normalizeBasic = (value: any) => {
  const basic = isPlainObject(value) ? value : {};

  return {
    name: getStringValue(basic.name),
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
      value: extractText(basic.about),
    },
    about_highlights: Array.isArray(basic.about_highlights)
      ? basic.about_highlights.map((item: any) => ({
          label: getStringValue(item?.label),
          value: getStringValue(item?.value),
        }))
      : [createEmptyHighlight()],
    toc_sections: Array.isArray(basic.toc_sections)
      ? basic.toc_sections.map((section: any) => normalizeTocSection(section))
      : [createEmptyStructuredTocSection()],
  };
};

const Card = ({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div>
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {isOpen ? "Close" : "Open"}
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {isOpen && <div className="p-5">{children}</div>}
    </div>
  );
};

const Label = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="mb-1 flex items-center justify-between gap-3">
    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</span>
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </div>
);

const TextInput = ({
  title,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label className="block">
    <Label title={title} />
    <input
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const TextArea = ({
  title,
  value,
  onChange,
  hint,
  rows = 4,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) => (
  <label className="block">
    <Label title={title} hint={hint} />
    <textarea
      rows={rows}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const HighlightsEditor = ({
  value,
  onChange,
}: {
  value: any[];
  onChange: (value: any[]) => void;
}) => {
  const items = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">About Highlights</p>
          <p className="text-xs text-slate-500">Short label/value pairs shown in the overview.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...(items || []), createEmptyHighlight()])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add Highlight
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_2fr_auto]">
          <TextInput
            title="Label"
            value={getStringValue(item?.label)}
            onChange={(nextValue) => {
              const nextItems = [...items];
              nextItems[index] = { ...item, label: nextValue };
              onChange(nextItems);
            }}
            placeholder="Campus"
          />

          <TextInput
            title="Value"
            value={getStringValue(item?.value)}
            onChange={(nextValue) => {
              const nextItems = [...items];
              nextItems[index] = { ...item, value: nextValue };
              onChange(nextItems);
            }}
            placeholder="Urban campus"
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

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
          onClick={() => onChange([...(items || []), createEmptyStructuredTocContent("text")])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add Text
        </button>
        <button
          type="button"
          onClick={() => onChange([...(items || []), createEmptyStructuredTocContent("table")])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
        >
          <Plus size={16} />
          Add Table
        </button>
        <button
          type="button"
          onClick={() => onChange([...(items || []), createEmptyStructuredTocContent("list")])}
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
                  const nextType = event.target.value === "table" ? "table" : "text";
                  const nextItems = [...items];
                  nextItems[index] = createEmptyStructuredTocContent(nextType);
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
                title="Text Content"
                value={extractText(item?.value)}
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
                title="List Items"
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
                title="Table Content"
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
  const sections = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">TOC Sections</p>
          <p className="text-xs text-slate-500">Save each section as title + content items, exactly in DB-friendly format.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...(sections || []), createEmptyStructuredTocSection()])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add TOC Section
        </button>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Section {index + 1}</p>
            <button
              type="button"
              onClick={() => onChange(sections.filter((_, sectionIndex) => sectionIndex !== index))}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <TextInput
              title="Section Title"
              value={getStringValue(section?.section)}
              onChange={(nextValue) => {
                const nextSections = [...sections];
                nextSections[index] = { ...section, section: nextValue };
                onChange(nextSections);
              }}
              placeholder="ATLAS SkillTech Admission Dates 2026"
            />

            <TocContentEditor
              value={section?.content}
              onChange={(nextValue) => {
                const nextSections = [...sections];
                nextSections[index] = { ...section, content: nextValue };
                onChange(nextSections);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ManualCollegeBasicEditor = ({ value, onChange }: ManualCollegeBasicEditorProps) => {
  const basic = normalizeBasic(value);

  return (
    <Card
      title="Basic College Info"
      subtitle="Simple editor for fields that need strict DB format"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput title="College Name" value={basic.name} onChange={(nextValue) => onChange({ ...basic, name: nextValue })} placeholder="ATLAS SkillTech University" />
          <TextInput title="Logo URL" value={basic.logo} onChange={(nextValue) => onChange({ ...basic, logo: nextValue })} placeholder="https://..." />
          <TextInput title="Location" value={basic.location} onChange={(nextValue) => onChange({ ...basic, location: nextValue })} placeholder="Mumbai, Maharashtra" />
          <TextInput title="City" value={basic.city} onChange={(nextValue) => onChange({ ...basic, city: nextValue })} placeholder="Mumbai" />
          <TextInput title="State" value={basic.state} onChange={(nextValue) => onChange({ ...basic, state: nextValue })} placeholder="Maharashtra" />
          <TextInput title="College Type" value={basic.college_type} onChange={(nextValue) => onChange({ ...basic, college_type: nextValue })} placeholder="Private" />
          <TextInput title="Established Year" value={basic.established_year} onChange={(nextValue) => onChange({ ...basic, established_year: nextValue })} placeholder="2021" />
          <TextInput title="Rating" value={basic.rating} onChange={(nextValue) => onChange({ ...basic, rating: nextValue })} placeholder="4.3" />
          <TextInput title="Reviews" value={basic.reviews} onChange={(nextValue) => onChange({ ...basic, reviews: nextValue })} placeholder="128" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            title="Accreditation"
            hint="One line per item"
            value={basic.accreditation.join("\n")}
            onChange={(nextValue) => onChange({ ...basic, accreditation: splitLines(nextValue) })}
            placeholder={"UGC\nAICTE"}
            rows={4}
          />
          <TextArea
            title="Affiliations"
            hint="One line per item"
            value={basic.affiliations.join("\n")}
            onChange={(nextValue) => onChange({ ...basic, affiliations: splitLines(nextValue) })}
            placeholder={"AIU\nNAAC"}
            rows={4}
          />
        </div>

        <TextArea
          title="About"
          hint="Will save as format/value object"
          value={getStringValue(basic.about?.value)}
          onChange={(nextValue) =>
            onChange({
              ...basic,
              about: {
                format: "text",
                value: nextValue,
              },
            })
          }
          placeholder="ATLAS SkillTech University, Mumbai..."
          rows={6}
        />

        <HighlightsEditor
          value={basic.about_highlights}
          onChange={(nextValue) => onChange({ ...basic, about_highlights: nextValue })}
        />

        <TocSectionsEditor
          value={basic.toc_sections}
          onChange={(nextValue) => onChange({ ...basic, toc_sections: nextValue })}
        />
      </div>
    </Card>
  );
};

export default ManualCollegeBasicEditor;
