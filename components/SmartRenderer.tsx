import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  List as ListIcon,
  Plus,
  Table as TableIcon,
  Trash2,
  Type,
} from "lucide-react";

const NO_BLOCK_FIELDS = ["_id", "id", "__v", "heroDownloaded", "url"];

const EXCLUDED_FIELDS = [
  "name",
  "fees",
  "rating",
  "reviews",
  "courseCount",
  "duration",
  "eligibility",
  "applicationDate",
  "course_count",
  "application_date",
  "title",
  "location",
  "rating_count",
  "mode",
  "exam_type",
  "date",
  "blog_count",
  "enquiry_count",
  "event_count",
  "application_dates",
];

type BlockType = "text" | "table" | "list" | "image";

const IMAGE_OBJECT_KEYS = ["url", "src", "image", "alt", "caption", "title"];

const formatKey = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");

const isPlainObject = (value: any): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPrimitive = (value: any) =>
  value === null ||
  value === undefined ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

const looksLikeImageField = (fieldKey?: string) =>
  Boolean(fieldKey && /(image|logo|banner|cover|thumbnail|icon|photo|gallery|hero)/i.test(fieldKey));

const getImageUrl = (value: any) => {
  if (typeof value === "string") {
    return value;
  }

  if (!isPlainObject(value)) {
    return "";
  }

  const candidate = value.url ?? value.src ?? value.image ?? "";
  return typeof candidate === "string" ? candidate : "";
};

const isImageString = (value: any) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return (
    /^data:image\//i.test(trimmed) ||
    /^blob:/i.test(trimmed) ||
    /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(trimmed) ||
    trimmed.startsWith("/")
  );
};

const isImageObject = (value: any, fieldKey?: string) => {
  if (!isPlainObject(value)) {
    return false;
  }

  const keys = Object.keys(value);
  const url = getImageUrl(value);
  const hasImageKeys = keys.some((key) => IMAGE_OBJECT_KEYS.includes(key));
  const isCompactImageObject = keys.length > 0 && keys.every((key) => IMAGE_OBJECT_KEYS.includes(key));

  if (looksLikeImageField(fieldKey)) {
    return hasImageKeys || keys.length === 0;
  }

  return isCompactImageObject && (Boolean(url) || hasImageKeys);
};

const isImageArray = (value: any[], fieldKey?: string) => {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.length === 0) {
    return looksLikeImageField(fieldKey);
  }

  if (looksLikeImageField(fieldKey)) {
    return true;
  }

  return value.every((item) => {
    if (typeof item === "string") {
      return isImageString(item);
    }

    if (!isPlainObject(item) || !isImageObject(item, fieldKey)) {
      return false;
    }

    const url = getImageUrl(item);
    return Boolean(url) ? isImageString(url) || Boolean(url.trim()) : true;
  });
};

const isPrimitiveList = (value: any[]) =>
  Array.isArray(value) && value.length > 0 && value.every((item) => isPrimitive(item));

const isStringMatrix = (value: any[]) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((row) => Array.isArray(row) && row.every((cell) => isPrimitive(cell)));

const isCmsBlock = (value: any) =>
  isPlainObject(value) &&
  ["text", "table", "list", "image"].includes(value.type) &&
  isPlainObject(value.data);

const isCmsBlockArray = (value: any[]) =>
  Array.isArray(value) && value.length > 0 && value.every((item) => isCmsBlock(item));

const isBlockContainer = (value: any) =>
  isPlainObject(value) && Array.isArray(value.blocks);

const isTextDataObject = (value: any) =>
  isPlainObject(value) && Object.keys(value).length === 1 && typeof value.text === "string";

const isListDataObject = (value: any) =>
  isPlainObject(value) && Object.keys(value).length === 1 && Array.isArray(value.items);

const isTableDataObject = (value: any) =>
  isPlainObject(value) && Array.isArray(value.columns) && Array.isArray(value.rows);

const normalizeTableData = (value: any) => {
  if (isTableDataObject(value)) {
    const safeColumns =
      value.columns.length > 0
        ? value.columns.map((column: any, index: number) => String(column ?? `Header ${index + 1}`))
        : ["Header 1", "Header 2"];

    const safeRows =
      Array.isArray(value.rows) && value.rows.length > 0
        ? value.rows
        : [Array(safeColumns.length).fill("")];

    return {
      columns: safeColumns,
      rows: safeRows.map((row: any) =>
        Array.from({ length: safeColumns.length }, (_, index) =>
          row?.[index] === null || row?.[index] === undefined ? "" : String(row[index])
        )
      ),
    };
  }

  if (isStringMatrix(value)) {
    const columnCount = value[0]?.length || 2;
    return {
      columns: Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`),
      rows: value.map((row) =>
        Array.from({ length: columnCount }, (_, index) =>
          row?.[index] === null || row?.[index] === undefined ? "" : String(row[index])
        )
      ),
    };
  }

  return {
    columns: ["Header 1", "Header 2"],
    rows: [["", ""]],
  };
};

const createBlock = (type: BlockType) => {
  if (type === "text") {
    return { type: "text", data: { text: "" } };
  }

  if (type === "list") {
    return { type: "list", data: { items: [""] } };
  }

  if (type === "image") {
    return { type: "image", data: { url: "", alt: "", caption: "" } };
  }

  return {
    type: "table",
    data: {
      columns: ["Header 1", "Header 2"],
      rows: [["", ""]],
    },
  };
};

const getDefaultFieldValue = (fieldType: string | null) => {
  switch ((fieldType || "text").trim().toLowerCase()) {
    case "object":
      return {};
    case "array":
    case "list":
      return [];
    case "table":
      return { columns: ["Header 1", "Header 2"], rows: [["", ""]] };
    case "number":
      return 0;
    case "boolean":
      return false;
    case "image":
      return "";
    default:
      return "";
  }
};

const buildEmptyLike = (value: any): any => {
  if (isCmsBlock(value)) {
    return createBlock(value.type as BlockType);
  }

  if (isBlockContainer(value)) {
    const meta = Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "blocks")
        .map(([key, val]) => [key, buildEmptyLike(val)])
    );

    return { ...meta, blocks: [] };
  }

  if (isTextDataObject(value)) {
    return { text: "" };
  }

  if (isListDataObject(value)) {
    return { items: [] };
  }

  if (isTableDataObject(value)) {
    const tableData = normalizeTableData(value);
    return {
      columns: [...tableData.columns],
      rows: [Array(tableData.columns.length).fill("")],
    };
  }

  if (Array.isArray(value)) {
    if (isStringMatrix(value)) {
      const columnCount = value[0]?.length || 2;
      return [Array(columnCount).fill("")];
    }

    return [];
  }

  if (isImageObject(value)) {
    return Object.fromEntries(Object.keys(value).map((key) => [key, ""]));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, buildEmptyLike(val)]));
  }

  if (typeof value === "number") {
    return 0;
  }

  if (typeof value === "boolean") {
    return false;
  }

  return "";
};

const extractBlocksFromValue = (value: any, fieldKey?: string) => {
  if (isBlockContainer(value)) {
    return value.blocks;
  }

  if (isCmsBlock(value)) {
    return [value];
  }

  if (isCmsBlockArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    if (!value.trim()) {
      return [];
    }

    if (isImageString(value) || looksLikeImageField(fieldKey)) {
      return [{ type: "image", data: { url: value, alt: "", caption: "" } }];
    }

    return [{ type: "text", data: { text: value } }];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }

    if (isImageArray(value, fieldKey)) {
      return value.map((item) => ({
        type: "image",
        data: {
          url: getImageUrl(item) || String(item ?? ""),
          alt: isPlainObject(item) ? item.alt || "" : "",
          caption: isPlainObject(item) ? item.caption || item.title || "" : "",
        },
      }));
    }

    if (isStringMatrix(value)) {
      return [{ type: "table", data: normalizeTableData(value) }];
    }

    if (isPrimitiveList(value)) {
      return [{ type: "list", data: { items: value.map((item) => (item === null || item === undefined ? "" : String(item))) } }];
    }

    return [];
  }

  if (isTextDataObject(value)) {
    return value.text ? [{ type: "text", data: { text: value.text } }] : [];
  }

  if (isListDataObject(value)) {
    return [{ type: "list", data: { items: Array.isArray(value.items) ? value.items : [] } }];
  }

  if (isTableDataObject(value)) {
    return [{ type: "table", data: normalizeTableData(value) }];
  }

  if (isImageObject(value, fieldKey)) {
    return [{ type: "image", data: { url: getImageUrl(value), alt: value.alt || "", caption: value.caption || value.title || "" } }];
  }

  return [];
};

const appendBlockToValue = (currentValue: any, type: BlockType, fieldKey?: string) => {
  const nextBlock = createBlock(type);

  if (isBlockContainer(currentValue)) {
    return { ...currentValue, blocks: [...currentValue.blocks, nextBlock] };
  }

  if (isCmsBlockArray(currentValue)) {
    return [...currentValue, nextBlock];
  }

  if (
    isCmsBlock(currentValue) ||
    typeof currentValue === "string" ||
    Array.isArray(currentValue) ||
    isTextDataObject(currentValue) ||
    isListDataObject(currentValue) ||
    isTableDataObject(currentValue) ||
    isImageObject(currentValue, fieldKey)
  ) {
    return { blocks: [...extractBlocksFromValue(currentValue, fieldKey), nextBlock] };
  }

  if (isPlainObject(currentValue)) {
    return { ...currentValue, blocks: [...extractBlocksFromValue(currentValue, fieldKey), nextBlock] };
  }

  return { blocks: [...extractBlocksFromValue(currentValue, fieldKey), nextBlock] };
};

interface InnerTableProps {
  data: string[][];
  onChange: (v: string[][]) => void;
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isDefaultOpen?: boolean;
  variant?: "primary" | "nested";
}

const InnerTableEditor: React.FC<InnerTableProps> = ({ data, onChange }) => {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [["", ""]];

  const addRow = () => onChange([...safeData, Array(safeData[0].length).fill("")]);
  const addColumn = () => onChange(safeData.map((row) => [...row, ""]));
  const removeColumn = (colIdx: number) => {
    if (safeData[0].length <= 1) {
      return;
    }

    onChange(safeData.map((row) => row.filter((_, i) => i !== colIdx)));
  };

  return (
    <div className="space-y-2 mt-2 w-full overflow-hidden border-l-2 border-emerald-400 pl-3 py-1">
      <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white shadow-sm scrollbar-thin scrollbar-thumb-slate-200">
        <table className="min-w-full border-collapse text-[11px] table-fixed">
          <tbody>
            {safeData.map((row, ri) => (
              <tr key={ri} className="border-b last:border-0 hover:bg-slate-50/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="border-r last:border-0 p-0 relative group/cell min-w-[120px]">
                    <textarea
                      rows={2}
                      className="w-full p-2 outline-none bg-transparent resize-y focus:bg-blue-50/30 transition-all leading-tight"
                      value={cell}
                      onChange={(e) => {
                        const newData = [...safeData];
                        newData[ri] = [...newData[ri]];
                        newData[ri][ci] = e.target.value;
                        onChange(newData);
                      }}
                    />
                    {ri === 0 && (
                      <button
                        onClick={() => removeColumn(ci)}
                        title="Delete Column"
                        className="absolute -top-1 -right-1 opacity-0 group-hover/cell:opacity-100 bg-red-500 text-white rounded-full p-0.5 shadow-sm z-10"
                      >
                        <Trash2 size={8} />
                      </button>
                    )}
                  </td>
                ))}
                <td className="w-8 text-center bg-slate-50/30 sticky right-0 border-l border-slate-200">
                  <button
                    onClick={() => {
                      const nextRows = safeData.filter((_, i) => i !== ri);
                      onChange(nextRows.length > 0 ? nextRows : [Array(safeData[0].length).fill("")]);
                    }}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={addRow} className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-100 transition-colors">
          <Plus size={10} /> ADD ROW
        </button>
        <button onClick={addColumn} className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors">
          <Plus size={10} /> ADD COLUMN
        </button>
      </div>
    </div>
  );
};

const AccordionField: React.FC<AccordionProps> = ({
  title,
  children,
  isDefaultOpen = false,
  variant = "primary",
}) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const styles =
    variant === "primary"
      ? "border border-slate-200 rounded-xl bg-white shadow-sm mb-4"
      : "border border-blue-100 rounded-lg bg-blue-50/20 mb-2";

  return (
    <div className={`${styles} overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${isOpen ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
      >
        <div className="flex items-center gap-2">
          {variant === "nested" && <Layers size={14} className="text-blue-400" />}
          <span className={`${variant === "primary" ? "text-[11px]" : "text-[10px]"} font-bold text-slate-700 uppercase tracking-wider`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
            {isOpen ? "Close" : "Expand"}
          </span>
          {isOpen ? <ChevronDown size={16} className="text-blue-500" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>
      {isOpen && <div className="p-4 border-t border-slate-100 animate-in fade-in duration-300">{children}</div>}
    </div>
  );
};

const NestedListEditor = ({ items, onChange }: { items: any[]; onChange: (v: any[]) => void }) => {
  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <div className="space-y-2 mt-2 border-l-2 border-orange-400 pl-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 group/nested items-start">
          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
          <textarea
            rows={1}
            className="flex-1 text-[12px] p-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            value={item === null || item === undefined ? "" : typeof item === "string" ? item : String(item)}
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value;
              onChange(newItems);
            }}
          />
          <button onClick={() => onChange(items.filter((_, i) => i !== idx))} className="opacity-0 group-hover/nested:opacity-100 p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...(items || []), ""])} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 ml-4">
        <Plus size={10} /> ADD LINE
      </button>
    </div>
  );
};

const ActionIcons = ({
  onAdd,
  compact = false,
}: {
  onAdd: (type: BlockType) => void;
  compact?: boolean;
}) => (
  <div className={`flex flex-wrap items-center gap-2 ${compact ? "mb-2" : "mb-3 pb-2 border-b border-slate-100"}`}>
    <button onClick={() => onAdd("text")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all shadow-sm">
      <Type size={12} className="text-slate-400" /> + TEXT
    </button>
    <button onClick={() => onAdd("table")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-emerald-400 transition-all shadow-sm">
      <TableIcon size={12} className="text-slate-400" /> + TABLE
    </button>
    <button onClick={() => onAdd("list")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-orange-400 transition-all shadow-sm">
      <ListIcon size={12} className="text-slate-400" /> + LIST
    </button>
    <button onClick={() => onAdd("image")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-pink-400 transition-all shadow-sm">
      <ImageIcon size={12} className="text-slate-400" /> + IMAGE
    </button>
  </div>
);

// --- 4. SMART AUTO DATA TABLE ---
// --- 4. SMART AUTO DATA TABLE (CMS SAFE) ---
const LegacyAutoDataTable = ({
  data,
  onChange
}: {
  data: any[];
  onChange: (v: any[]) => void;
}) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const headers = Array.from(
    new Set(
      data.flatMap(row =>
        row && typeof row === "object" ? Object.keys(row) : []
      )
    )
  ).filter(k => !NO_BLOCK_FIELDS.includes(k));

  const addBlockToField = (
    rowIndex: number,
    field: string,
    type: BlockType
  ) => {
    let newBlock: any;

    if (type === "text") {
      newBlock = {
        type: "text",
        data: { text: "" }
      };
    }

    if (type === "list") {
      newBlock = {
        type: "list",
        data: { items: [""] }
      };
    }

    if (type === "table") {
      newBlock = {
        type: "table",
        data: {
          columns: ["Header 1", "Header 2"],
          rows: [["", ""]]
        }
      };
    }

    if (type === "image") {
      newBlock = {
        type: "image",
        data: { url: "", alt: "", caption: "" }
      };
    }

    const newData = [...data];
    const currentVal = newData[rowIndex][field];

    const blocks = Array.isArray(currentVal?.blocks)
      ? currentVal.blocks
      : [];

    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: {
        ...(currentVal || {}),
        blocks: [...blocks, newBlock]
      }
    };

    onChange(newData);
  };

  return (
    <div className="my-2 border border-slate-200 rounded-2xl shadow-sm bg-slate-50/30 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full min-w-[1200px] border-collapse">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              {headers.map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r"
                >
                  {formatKey(h)}
                </th>
              ))}
              <th className="w-20 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b">
                {headers.map(h => {
                  const val = row[h];
                  const isExcluded = EXCLUDED_FIELDS.includes(h);

                  return (
                    <td key={h} className="p-4 align-top border-r">
                      {!isExcluded && (
                        <ActionIcons
                          onAdd={type =>
                            addBlockToField(rowIndex, h, type)
                          }
                        />
                      )}

                      {/* 🔒 ONLY CMS BLOCKS RENDER */}
                      {Array.isArray(val?.blocks) &&
                        val.blocks.map((block: any, i: number) => {
                          if (block.type === "text") {
                            return (
                              <textarea
                                key={i}
                                className="w-full border border-slate-200 p-2 rounded text-[12px] mb-2"
                                value={block.data.text}
                                onChange={e => {
                                  const copy = [...data];
                                  copy[rowIndex][h].blocks[i].data.text =
                                    e.target.value;
                                  onChange(copy);
                                }}
                              />
                            );
                          }

                          if (block.type === "list") {
                            return (
                            <React.Fragment key={i}>
  <NestedListEditor
    items={block.data.items}
    onChange={(items) => {
      const copy = [...data];
      copy[rowIndex][h].blocks[i].data.items = items;
      onChange(copy);
    }}
  />
</React.Fragment>

                            );
                          }

                          if (block.type === "table") {
                            return (
                              <InnerTableEditor
                                key={i}
                                data={block.data.rows}
                                onChange={rows => {
                                  const copy = [...data];
                                  copy[rowIndex][h].blocks[i].data.rows =
                                    rows;
                                  onChange(copy);
                                }}
                              />
                            );
                          }

                          return null;
                        })}
                    </td>
                  );
                })}

                <td className="text-center">
                  <button
                    onClick={() =>
                      onChange(data.filter((_, i) => i !== rowIndex))
                    }
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 border-t flex justify-center">
        <button
          onClick={() =>
            onChange([
              ...data,
              headers.reduce(
                (acc, h) => ({
                  ...acc,
                  [h]: { blocks: [] }
                }),
                {}
              )
            ])
          }
          className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition"
        >
          + ADD ROW
        </button>
      </div>
    </div>
  );
};


// --- UTILS ---
const legacyFormatKey = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/_/g, " ");

const LegacyHeroImageEditor = ({ images, onChange }: { images: any[]; onChange: (v: any[]) => void }) => {
  const [newUrl, setNewUrl] = useState("");
  const getImageUrl = (item: any) => (typeof item === "string" ? item : item?.url || item?.src || "");
  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        {images?.map((img, i) => (
          <div key={i} className="relative group aspect-video rounded-xl border-2 border-white bg-white shadow-sm overflow-hidden">
            <img src={getImageUrl(img)} className="h-full w-full object-cover" alt="gallery" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="bg-red-500 text-white p-2 rounded-full transform scale-75 group-hover:scale-100 transition-transform"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-100/50">
            <ImageIcon className="text-slate-400" size={24}/>
        </div>
      </div>
      <div className="flex gap-2 bg-white p-2 rounded-xl border border-slate-200">
        <input className="flex-1 px-3 py-2 outline-none text-sm" placeholder="Paste Image URL here..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors" onClick={() => { if (newUrl) { onChange([...(images || []), newUrl]); setNewUrl(""); } }}>UPLOAD</button>
      </div>
    </div>
  );
};

// --- MAIN SMART RENDERER ---
interface SmartRendererProps {
  value: any;
  onChange: (v: any) => void;
  depth?: number;
  useFlatObjectTable?: boolean;
  showCmsBlockControls?: boolean;
  allowAddField?: boolean;
  hiddenKeys?: string[];
  fieldKey?: string;
}

const SmartRenderer: React.FC<SmartRendererProps> = ({
  value,
  onChange,
  depth = 0,
  useFlatObjectTable = true,
  showCmsBlockControls = true,
  allowAddField = true,
  hiddenKeys = NO_BLOCK_FIELDS,
  fieldKey,
}) => {
  const handleAddBlock = (key: string, type: BlockType) => {
    onChange({
      ...value,
      [key]: appendBlockToValue(value[key], type, key),
    });
  };

  const getDefaultFieldValue = (fieldType: string | null) => {
    switch ((fieldType || "text").trim().toLowerCase()) {
      case "object":
        return {};
      case "array":
      case "list":
        return [];
      case "table":
        return {
          columns: ["Header 1", "Header 2"],
          rows: [["", ""]],
        };
      case "number":
        return 0;
      case "boolean":
        return false;
      case "image":
        return "";
      default:
        return "";
    }
  };

  const handleAddField = () => {
    if (!allowAddField || typeof value !== "object" || value === null || Array.isArray(value)) {
      return;
    }

    const fieldName = window.prompt("Enter new field name");

    if (!fieldName) {
      return;
    }

    const trimmedFieldName = fieldName.trim();

    if (!trimmedFieldName) {
      return;
    }

    if (trimmedFieldName in value) {
      window.alert("Field already exists");
      return;
    }

    const fieldType = window.prompt(
      "Initial field type? text / object / array / list / table / number / boolean / image",
      "text"
    );

    onChange({
      ...value,
      [trimmedFieldName]: getDefaultFieldValue(fieldType),
    });
  };

  const getNewArrayItem = (items: any[]) => {
    const firstDefinedItem = items.find(
      item => item !== undefined && item !== null
    );

    if (firstDefinedItem === undefined) {
      const itemType = window.prompt(
        "Initial item type? text / object / array / list / table / number / boolean / image",
        "text"
      );

      return getDefaultFieldValue(itemType);
    }

    return buildEmptyLike(firstDefinedItem);
  };


  if (typeof value !== "object" || value === null) {
    if (
      (typeof value === "string" || value === undefined || value === null) &&
      (isImageString(value) || looksLikeImageField(fieldKey))
    ) {
      return (
        <SingleImageEditor
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          fieldKey={fieldKey}
        />
      );
    }

    if (typeof value === "boolean") {
      return (
        <select
          className="w-full rounded-lg border border-slate-200 p-2 text-[12px] outline-none focus:border-blue-400"
          value={String(value)}
          onChange={(e) => onChange(e.target.value === "true")}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (typeof value === "number") {
      return (
        <input
          type="number"
          className="w-full rounded-lg border border-slate-200 p-2 text-[12px] outline-none focus:border-blue-400"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      );
    }

    return <textarea className="w-full border border-slate-200 p-2 rounded-lg text-[12px] outline-none focus:border-blue-400 min-h-[60px]" value={value === null || value === undefined ? "" : String(value)} onChange={(e) => onChange(e.target.value)} />;
  }

  if (Array.isArray(value)) {
    if (isCmsBlockArray(value)) {
      return (
        <BlockArrayEditor
          blocks={value}
          onChange={onChange}
          showCmsBlockControls={showCmsBlockControls}
          fieldKey={fieldKey}
        />
      );
    }

    if (isImageArray(value, fieldKey)) {
      return <HeroImageEditor images={value} onChange={onChange} />;
    }

    if (isStringMatrix(value)) {
      return <InnerTableEditor data={value} onChange={onChange} />;
    }

    if (isPrimitiveList(value)) {
      return <NestedListEditor items={value} onChange={onChange} />;
    }

    if (useFlatObjectTable && isFlatObjectArray(value)) {
      return <AutoDataTable data={value} onChange={onChange} hiddenKeys={hiddenKeys} />;
    }

    return (
      <div className="space-y-4">
        {value.map((item, index) => (
          <div key={index} className="relative bg-white border border-slate-100 p-4 rounded-xl shadow-sm group">
            <button onClick={() => onChange(value.filter((_, idx) => idx !== index))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 p-1.5 rounded-md transition-all z-10">
              <Trash2 size={14} />
            </button>
            <SmartRenderer
              value={item}
              onChange={(nextValue) => {
                const copy = [...value];
                copy[index] = nextValue;
                onChange(copy);
              }}
              depth={depth + 1}
              useFlatObjectTable={useFlatObjectTable}
              showCmsBlockControls={showCmsBlockControls}
              allowAddField={allowAddField}
              hiddenKeys={hiddenKeys}
              fieldKey={fieldKey}
            />
          </div>
        ))}
        <button onClick={() => onChange([...value, getNewArrayItem(value)])} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all">+ ADD NEW ITEM</button>
      </div>
    );
  }

  if (isCmsBlock(value)) {
    return <CmsBlockEditor block={value} onChange={onChange} fieldKey={fieldKey} />;
  }

  if (isBlockContainer(value)) {
    return (
      <BlockCollectionEditor
        value={value}
        onChange={onChange}
        depth={depth}
        useFlatObjectTable={useFlatObjectTable}
        showCmsBlockControls={showCmsBlockControls}
        allowAddField={allowAddField}
        hiddenKeys={hiddenKeys}
        fieldKey={fieldKey}
      />
    );
  }

  if (isTableDataObject(value)) {
    return <CmsTableEditor data={value} onChange={onChange} />;
  }

  if (isListDataObject(value)) {
    return (
      <NestedListEditor
        items={Array.isArray(value.items) ? value.items : []}
        onChange={(items) => onChange({ ...value, items })}
      />
    );
  }

  if (isTextDataObject(value)) {
    return (
      <textarea
        className="w-full border border-slate-200 p-2 rounded-lg text-[12px] outline-none focus:border-blue-400 min-h-[60px]"
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
      />
    );
  }

  if (isImageObject(value, fieldKey)) {
    return <SingleImageEditor value={value} onChange={onChange} fieldKey={fieldKey} />;
  }

  return (
    <div className={`space-y-3 ${depth > 0 ? "mt-2" : ""}`}>
      {Object.entries(value).filter(([key]) => !hiddenKeys.includes(key)).map(([key, val]) => {
        const hasInlineBlockControls = isBlockContainer(val) || (Array.isArray(val) && isCmsBlockArray(val));
        const showControls = showCmsBlockControls && !EXCLUDED_FIELDS.includes(key) && !hasInlineBlockControls;

        return (
          <AccordionField key={key} title={formatKey(key)} variant={depth > 0 ? 'nested' : 'primary'}> 
           <div className="flex justify-end mb-2">
        <button
          onClick={() => {
            const copy = { ...value };
            delete copy[key];        // 👈 FIELD DELETE
            onChange(copy);
          }}
          className="text-red-500 text-xs font-bold flex items-center gap-1"
        >
          <Trash2 size={12} /> DELETE FIELD
        </button>
      </div>
            <div className="space-y-3">
              {showControls && <ActionIcons onAdd={(type) => handleAddBlock(key, type)} />}
              <SmartRenderer
                value={val}
                onChange={(nv) => onChange({ ...value, [key]: nv })}
                depth={depth + 1}
                useFlatObjectTable={useFlatObjectTable}
                showCmsBlockControls={showCmsBlockControls}
                allowAddField={allowAddField}
                hiddenKeys={hiddenKeys}
                fieldKey={key}
              />
            </div>
          </AccordionField>
        );
      })}
      {allowAddField && (
        <button
          onClick={handleAddField}
          className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2 text-[10px] font-bold text-slate-400 transition-all hover:border-blue-300 hover:text-blue-500"
        >
          + ADD FIELD
        </button>
      )}
    </div>
  );
};

const CmsTableEditor = ({
  data,
  onChange,
}: {
  data: any;
  onChange: (v: { columns: string[]; rows: string[][] }) => void;
}) => {
  const safeTable = normalizeTableData(data);

  const updateColumns = (columns: string[]) => {
    const rows = safeTable.rows.map((row) =>
      Array.from({ length: columns.length }, (_, index) => row[index] || "")
    );

    onChange({
      columns,
      rows: rows.length > 0 ? rows : [Array(columns.length).fill("")],
    });
  };

  return (
    <div className="space-y-2 mt-2 border-l-2 border-emerald-400 pl-3 py-1">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-[11px] table-fixed">
          <thead className="bg-slate-50">
            <tr>
              {safeTable.columns.map((column, columnIndex) => (
                <th key={columnIndex} className="border-r last:border-r-0 p-0 min-w-[140px]">
                  <div className="relative group/column">
                    <input
                      className="w-full bg-transparent px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 outline-none focus:bg-blue-50/40"
                      value={column}
                      onChange={(e) => {
                        const nextColumns = [...safeTable.columns];
                        nextColumns[columnIndex] = e.target.value;
                        updateColumns(nextColumns);
                      }}
                    />
                    <button
                      onClick={() => {
                        if (safeTable.columns.length <= 1) {
                          return;
                        }

                        updateColumns(safeTable.columns.filter((_, index) => index !== columnIndex));
                      }}
                      className="absolute right-1 top-1 opacity-0 group-hover/column:opacity-100 text-red-500 hover:bg-red-50 rounded-full p-1 transition"
                      title="Delete Column"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {safeTable.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-200">
                {safeTable.columns.map((_, columnIndex) => (
                  <td key={columnIndex} className="border-r last:border-r-0 p-0 align-top">
                    <textarea
                      rows={2}
                      className="w-full min-h-[68px] resize-y bg-transparent px-3 py-2 text-[12px] outline-none focus:bg-blue-50/30 transition-all"
                      value={row[columnIndex] || ""}
                      onChange={(e) => {
                        const nextRows = [...safeTable.rows];
                        nextRows[rowIndex] = [...nextRows[rowIndex]];
                        nextRows[rowIndex][columnIndex] = e.target.value;
                        onChange({ columns: safeTable.columns, rows: nextRows });
                      }}
                    />
                  </td>
                ))}
                <td className="text-center align-top pt-2">
                  <button
                    onClick={() => {
                      const nextRows = safeTable.rows.filter((_, index) => index !== rowIndex);
                      onChange({
                        columns: safeTable.columns,
                        rows: nextRows.length > 0 ? nextRows : [Array(safeTable.columns.length).fill("")],
                      });
                    }}
                    className="text-red-500 hover:bg-red-50 rounded-lg p-2 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            onChange({
              columns: safeTable.columns,
              rows: [...safeTable.rows, Array(safeTable.columns.length).fill("")],
            })
          }
          className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-100 transition-colors"
        >
          <Plus size={10} /> ADD ROW
        </button>
        <button
          onClick={() => updateColumns([...safeTable.columns, `Header ${safeTable.columns.length + 1}`])}
          className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
        >
          <Plus size={10} /> ADD COLUMN
        </button>
      </div>
    </div>
  );
};

const SingleImageEditor = ({
  value,
  onChange,
  fieldKey,
}: {
  value: any;
  onChange: (v: any) => void;
  fieldKey?: string;
}) => {
  const url = getImageUrl(value);
  const isObjectValue = isPlainObject(value);

  const updateUrl = (nextUrl: string) => {
    if (!isObjectValue) {
      onChange(nextUrl);
      return;
    }

    if ("url" in value || (!("src" in value) && !("image" in value))) {
      onChange({ ...value, url: nextUrl });
      return;
    }

    if ("src" in value) {
      onChange({ ...value, src: nextUrl });
      return;
    }

    onChange({ ...value, image: nextUrl });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white aspect-video">
        {url ? (
          <img src={url} alt="Preview" className="h-full w-full object-contain p-3" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageIcon size={28} />
          </div>
        )}
      </div>

      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] outline-none focus:border-blue-400"
        placeholder={looksLikeImageField(fieldKey) ? "Paste image URL..." : "Paste URL..."}
        value={url}
        onChange={(e) => updateUrl(e.target.value)}
      />

      {isObjectValue && ("alt" in value || "caption" in value || "title" in value) && (
        <div className="grid gap-2 md:grid-cols-2">
          {"alt" in value && (
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] outline-none focus:border-blue-400"
              placeholder="Alt text"
              value={value.alt || ""}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
            />
          )}
          {("caption" in value || "title" in value) && (
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] outline-none focus:border-blue-400"
              placeholder="Caption"
              value={value.caption || value.title || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  ...("caption" in value ? { caption: e.target.value } : { title: e.target.value }),
                })
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

const HeroImageEditor = ({ images, onChange }: { images: any[]; onChange: (v: any[]) => void }) => {
  const [newUrl, setNewUrl] = useState("");

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        {images?.map((img, i) => (
          <div key={i} className="relative group aspect-video rounded-xl border-2 border-white bg-white shadow-sm overflow-hidden">
            <img src={getImageUrl(img)} className="h-full w-full object-cover" alt="gallery" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="bg-red-500 text-white p-2 rounded-full transform scale-75 group-hover:scale-100 transition-transform">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        <div className="aspect-video rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-100/50">
          <ImageIcon className="text-slate-400" size={24} />
        </div>
      </div>
      <div className="flex gap-2 bg-white p-2 rounded-xl border border-slate-200">
        <input className="flex-1 px-3 py-2 outline-none text-sm" placeholder="Paste Image URL here..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
          onClick={() => {
            if (!newUrl.trim()) {
              return;
            }

            onChange([...(images || []), newUrl.trim()]);
            setNewUrl("");
          }}
        >
          UPLOAD
        </button>
      </div>
    </div>
  );
};

const CmsBlockEditor = ({
  block,
  onChange,
  onDelete,
  fieldKey,
}: {
  block: any;
  onChange: (v: any) => void;
  onDelete?: () => void;
  fieldKey?: string;
}) => {
  const blockType = isCmsBlock(block) ? (block.type as BlockType) : "text";
  const safeBlock = isCmsBlock(block) ? block : createBlock("text");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          {blockType}
        </span>
        {onDelete && (
          <button onClick={onDelete} className="text-red-500 hover:bg-red-50 rounded-lg p-2 transition" title="Delete Block">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {blockType === "text" && (
        <textarea
          className="w-full border border-slate-200 p-3 rounded-xl text-[12px] outline-none focus:border-blue-400 min-h-[110px]"
          value={safeBlock.data.text || ""}
          onChange={(e) => onChange({ ...safeBlock, data: { ...safeBlock.data, text: e.target.value } })}
        />
      )}

      {blockType === "list" && (
        <NestedListEditor
          items={Array.isArray(safeBlock.data.items) ? safeBlock.data.items : [""]}
          onChange={(items) => onChange({ ...safeBlock, data: { ...safeBlock.data, items } })}
        />
      )}

      {blockType === "table" && <CmsTableEditor data={safeBlock.data} onChange={(tableData) => onChange({ ...safeBlock, data: tableData })} />}

      {blockType === "image" && (
        <SingleImageEditor
          value={safeBlock.data}
          onChange={(imageData) => onChange({ ...safeBlock, data: imageData })}
          fieldKey={fieldKey}
        />
      )}
    </div>
  );
};

const BlockArrayEditor = ({
  blocks,
  onChange,
  showCmsBlockControls,
  fieldKey,
}: {
  blocks: any[];
  onChange: (v: any[]) => void;
  showCmsBlockControls: boolean;
  fieldKey?: string;
}) => (
  <div className="space-y-3">
    {showCmsBlockControls && <ActionIcons onAdd={(type) => onChange([...(blocks || []), createBlock(type)])} />}
    {blocks.map((block, index) => (
      <React.Fragment key={index}>
        <CmsBlockEditor
          block={block}
          onChange={(nextBlock) => {
            const nextBlocks = [...blocks];
            nextBlocks[index] = nextBlock;
            onChange(nextBlocks);
          }}
          onDelete={() => onChange(blocks.filter((_, blockIndex) => blockIndex !== index))}
          fieldKey={fieldKey}
        />
      </React.Fragment>
    ))}
    {blocks.length === 0 && (
      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-[11px] text-slate-400">
        No content blocks yet.
      </div>
    )}
  </div>
);

const BlockCollectionEditor = ({
  value,
  onChange,
  depth,
  useFlatObjectTable,
  showCmsBlockControls,
  allowAddField,
  hiddenKeys,
  fieldKey,
}: {
  value: Record<string, any>;
  onChange: (v: any) => void;
  depth: number;
  useFlatObjectTable: boolean;
  showCmsBlockControls: boolean;
  allowAddField: boolean;
  hiddenKeys: string[];
  fieldKey?: string;
}) => {
  const blocks = Array.isArray(value.blocks) ? value.blocks : [];
  const metaEntries = Object.entries(value).filter(([key]) => key !== "blocks");

  return (
    <div className="space-y-4">
      {metaEntries.length > 0 && (
        <SmartRenderer
          value={Object.fromEntries(metaEntries)}
          onChange={(nextMeta) => onChange({ ...value, ...nextMeta, blocks })}
          depth={depth + 1}
          useFlatObjectTable={useFlatObjectTable}
          showCmsBlockControls={showCmsBlockControls}
          allowAddField={allowAddField}
          hiddenKeys={hiddenKeys}
          fieldKey={fieldKey}
        />
      )}

      <BlockArrayEditor
        blocks={blocks}
        onChange={(nextBlocks) => onChange({ ...value, blocks: nextBlocks })}
        showCmsBlockControls={showCmsBlockControls}
        fieldKey={fieldKey}
      />
    </div>
  );
};

const AutoDataTable = ({
  data,
  onChange,
  hiddenKeys,
}: {
  data: any[];
  onChange: (v: any[]) => void;
  hiddenKeys: string[];
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const headers = Array.from(new Set(data.flatMap((row) => (row && typeof row === "object" ? Object.keys(row) : [])))).filter(
    (key) => !hiddenKeys.includes(key)
  );

  const updateCell = (rowIndex: number, field: string, nextValue: any) => {
    const nextData = [...data];
    nextData[rowIndex] = { ...nextData[rowIndex], [field]: nextValue };
    onChange(nextData);
  };

  return (
    <div className="my-2 border border-slate-200 rounded-2xl shadow-sm bg-slate-50/30 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full min-w-[1200px] border-collapse">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r align-top">
                  <div className="flex items-center justify-between gap-2">
                    <span>{formatKey(header)}</span>
                    <button
                      onClick={() =>
                        onChange(
                          data.map((row) => {
                            const nextRow = { ...row };
                            delete nextRow[header];
                            return nextRow;
                          })
                        )
                      }
                      className="text-red-500 hover:bg-red-50 rounded-full p-1 transition"
                      title="Delete Column"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-20 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b">
                {headers.map((header) => {
                  const cellValue = row?.[header];
                  const showCellControls =
                    !EXCLUDED_FIELDS.includes(header) &&
                    !isBlockContainer(cellValue) &&
                    !isCmsBlockArray(cellValue);

                  return (
                    <td key={header} className="p-4 align-top border-r min-w-[260px]">
                      {showCellControls && (
                        <ActionIcons compact onAdd={(type) => updateCell(rowIndex, header, appendBlockToValue(cellValue, type, header))} />
                      )}
                      <SmartRenderer
                        value={cellValue ?? ""}
                        onChange={(nextValue) => updateCell(rowIndex, header, nextValue)}
                        depth={1}
                        useFlatObjectTable={false}
                        showCmsBlockControls={true}
                        allowAddField={true}
                        hiddenKeys={hiddenKeys}
                        fieldKey={header}
                      />
                    </td>
                  );
                })}
                <td className="text-center align-top p-4">
                  <button onClick={() => onChange(data.filter((_, index) => index !== rowIndex))} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-4 border-t flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            const template = data[0] || {};
            const nextRow = headers.reduce<Record<string, any>>((acc, header) => {
              acc[header] = buildEmptyLike(template[header]);
              return acc;
            }, {});
            onChange([...data, nextRow]);
          }}
          className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition"
        >
          + ADD ROW
        </button>
        <button
          onClick={() => {
            const fieldName = window.prompt("Enter new column name");

            if (!fieldName) {
              return;
            }

            const trimmedFieldName = fieldName.trim();
            if (!trimmedFieldName) {
              return;
            }

            if (headers.includes(trimmedFieldName)) {
              window.alert("Column already exists");
              return;
            }

            const fieldType = window.prompt(
              "Initial field type? text / object / array / list / table / number / boolean / image",
              "text"
            );

            onChange(
              data.map((row) => ({
                ...row,
                [trimmedFieldName]: getDefaultFieldValue(fieldType),
              }))
            );
          }}
          className="px-6 py-2 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition"
        >
          + ADD COLUMN
        </button>
      </div>
    </div>
  );
};

const isFlatObjectArray = (val: any[]) => {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    val.every((item) => isPlainObject(item) && !isCmsBlock(item))
  );
};

export default SmartRenderer;
