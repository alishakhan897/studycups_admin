import React, { useState } from "react";
import { 
  Plus, Trash2, Type, Table as TableIcon, 
  List as ListIcon, Image as ImageIcon, 
  ChevronRight, ChevronDown, Columns, Rows, Layers
} from "lucide-react";

// --- CONSTANTS ---
const NO_BLOCK_FIELDS = [
  "_id",
  "id",
  "__v",
  "heroDownloaded",
  "url", 
];

// In fields par Action Icons (+Text, +Table, +List) nahi dikhenge
const EXCLUDED_FIELDS = [
  "name", "fees", "rating", "reviews", "courseCount", 
  "duration", "eligibility", "applicationDate", "course_count", 
  "application_date", "title", "location", "rating_count" , "mode" , "exam_type" , "date", "blog_count", "enquiry_count", "event_count" , "application_dates"
];

// --- 1. INNER TABLE RENDERER ---
interface InnerTableProps {
  data: string[][];
  onChange: (v: string[][]) => void;
}

const InnerTableEditor: React.FC<InnerTableProps> = ({ data, onChange }) => {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [["", ""]];
  
  const addRow = () => onChange([...safeData, Array(safeData[0].length).fill("")]);
  const addColumn = () => onChange(safeData.map(row => [...row, ""]));
  const removeColumn = (colIdx: number) => {
    if (safeData[0].length <= 1) return;
    onChange(safeData.map(row => row.filter((_, i) => i !== colIdx)));
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
                       <button onClick={() => removeColumn(ci)} title="Delete Column" className="absolute -top-1 -right-1 opacity-0 group-hover/cell:opacity-100 bg-red-500 text-white rounded-full p-0.5 shadow-sm z-10">
                        <Trash2 size={8}/>
                       </button>
                    )}
                  </td>
                ))}
                <td className="w-8 text-center bg-slate-50/30 sticky right-0 border-l border-slate-200">
                  <button onClick={() => onChange(safeData.filter((_, i) => i !== ri))} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={12}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={addRow} className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-100 transition-colors">
          <Plus size={10}/> ADD ROW
        </button>
        <button onClick={addColumn} className="flex items-center gap-1 text-[9px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors">
          <Plus size={10}/> ADD COLUMN
        </button>
      </div>
    </div>
  );
};

// --- 2. ACCORDION WRAPPER ---
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isDefaultOpen?: boolean;
  variant?: 'primary' | 'nested';
}

const AccordionField: React.FC<AccordionProps> = ({ title, children, isDefaultOpen = false, variant = 'primary' }) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const styles = variant === 'primary' 
    ? "border border-slate-200 rounded-xl bg-white shadow-sm mb-4" 
    : "border border-blue-100 rounded-lg bg-blue-50/20 mb-2";

  return (
    <div className={`${styles} overflow-hidden transition-all duration-300`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${isOpen ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          {variant === 'nested' && <Layers size={14} className="text-blue-400" />}
          <span className={`${variant === 'primary' ? 'text-[11px]' : 'text-[10px]'} font-bold text-slate-700 uppercase tracking-wider`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{isOpen ? 'Close' : 'Expand'}</span>
           {isOpen ? <ChevronDown size={16} className="text-blue-500" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>
      {isOpen && (
        <div className={`p-4 border-t border-slate-100 animate-in fade-in duration-300`}>
          {children}
        </div>
      )}
    </div>
  );
};

// --- 3. NESTED ARRAY EDITOR ---
const NestedListEditor = ({ items, onChange }: { items: any[]; onChange: (v: any[]) => void }) => {
  if (!Array.isArray(items)) return null;
  return (
    <div className="space-y-2 mt-2 border-l-2 border-orange-400 pl-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 group/nested items-start">
          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
          <textarea
            rows={1}
            className="flex-1 text-[12px] p-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            value={typeof item === 'string' ? item : JSON.stringify(item)}
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
      <button onClick={() => onChange([...items, ""])} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 ml-4">
        <Plus size={10}/> ADD LINE
      </button>
    </div>
  );
};

// --- ACTION ICONS ---
const ActionIcons = ({ onAdd }: { onAdd: (type: "text" | "table" | "list") => void }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
    <button onClick={() => onAdd("text")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all shadow-sm">
      <Type size={12} className="text-slate-400"/> + TEXT
    </button>
    <button onClick={() => onAdd("table")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-emerald-400 transition-all shadow-sm">
      <TableIcon size={12} className="text-slate-400"/> + TABLE
    </button>
    <button onClick={() => onAdd("list")} className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-orange-400 transition-all shadow-sm">
      <ListIcon size={12} className="text-slate-400"/> + LIST
    </button>
  </div>
);

// --- 4. SMART AUTO DATA TABLE ---
// --- 4. SMART AUTO DATA TABLE (CMS SAFE) ---
const AutoDataTable = ({
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
    type: "text" | "table" | "list"
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
const formatKey = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/_/g, " ");

const HeroImageEditor = ({ images, onChange }: { images: any[]; onChange: (v: any[]) => void }) => {
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
const SmartRenderer: React.FC<{ value: any; onChange: (v: any) => void; depth?: number }> = ({ value, onChange, depth = 0 }) => {
  const handleAddBlock = (key: string, type: "text" | "table" | "list") => {
  let newBlock;

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

  const blocks = value[key]?.blocks || [];
  onChange({
    ...value,
    [key]: {
      ...value[key],
      blocks: [...blocks, newBlock]
    }
  });
};


  if (typeof value !== "object" || value === null) {
    return <textarea className="w-full border border-slate-200 p-2 rounded-lg text-[12px] outline-none focus:border-blue-400 min-h-[60px]" value={String(value)} onChange={(e) => onChange(e.target.value)} />;
  }

  if (Array.isArray(value)) {
    if (isFlatObjectArray(value)) return <AutoDataTable data={value} onChange={onChange} />;
    return (
      <div className="space-y-4">
        {value.map((v, i) => (
          <div key={i} className="relative bg-white border border-slate-100 p-4 rounded-xl shadow-sm group">
            <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 p-1.5 rounded-md transition-all z-10"><Trash2 size={14}/></button>
            {Array.isArray(v) && Array.isArray(v[0]) ? (
                <InnerTableEditor data={v} onChange={(nv) => { const copy = [...value]; copy[i] = nv; onChange(copy); }} />
            ) : Array.isArray(v) ? (
                <NestedListEditor items={v} onChange={(nv) => { const copy = [...value]; copy[i] = nv; onChange(copy); }} />
            ) : (
                <SmartRenderer value={v} onChange={(nv) => { const copy = [...value]; copy[i] = nv; onChange(copy); }} depth={depth + 1} />
            )}
          </div>
        ))}
        <button onClick={() => onChange([...value, ""])} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all">+ ADD NEW ITEM</button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${depth > 0 ? "mt-2" : ""}`}>
      {Object.entries(value).filter(([key]) => !NO_BLOCK_FIELDS.includes(key)).map(([key, val]) => {
        const isImg = Array.isArray(val) && (key.toLowerCase().includes("image") || key === "heroImages");
        // Logic: Agar image hai ya field 'EXCLUDED_FIELDS' list mein hai, toh buttons nahi dikhane
        const showControls = !isImg && !NO_BLOCK_FIELDS.includes(key) && !EXCLUDED_FIELDS.includes(key);

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
              {isImg ? (
                <HeroImageEditor images={val as any[]} onChange={(nv) => onChange({...value, [key]: nv})}/>
              ) : (
                <SmartRenderer 
                value={val} 
                onChange={(nv) => onChange({...value, [key]: nv})} depth={depth + 1}/>
              )}
            </div>
          </AccordionField>
        );
      })}
    </div>
  );
};

const isFlatObjectArray = (val: any[]) => {
  if (!Array.isArray(val) || val.length === 0) return false;
  const first = val[0];
  return typeof first === "object" && first !== null && !Array.isArray(first) && !first.type;
};

export default SmartRenderer;