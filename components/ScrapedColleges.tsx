import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { 
  Plus, Trash2, Save, Globe, Loader2, 
  ChevronDown, ChevronUp, Image as ImageIcon, 
  Table as TableIcon, BookOpen, Layers
} from "lucide-react";

/* ================== SOCKET & CONSTANTS ================== */
const socket = io("https://studycupsbackend-wb8p.onrender.com/api", { transports: ["websocket"] });
const EXCLUDED_KEYS = ["_id", "id", "createdAt", "updatedAt", "tempId"];

/* ================== INTERFACES ================== */
interface CourseItemProps {
  course: any;
  isSub?: boolean;
}

/* ================== COLLAPSIBLE COURSE UI ================== */

const CourseDetailRow: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  
  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1 tracking-wider">
        {label.replace(/_/g, ' ')}
      </span>
      <div className="text-sm text-gray-700 leading-relaxed">
        {Array.isArray(value) ? (
          <ul className="list-disc pl-5 space-y-1">
            {value.map((item, idx) => <li key={idx} className="hover:text-black">{item}</li>)}
          </ul>
        ) : typeof value === 'object' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="font-bold text-[11px] text-gray-500 uppercase">{k.replace(/_/g, ' ')}:</span>
                <span className="text-xs text-gray-800">{String(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{String(value)}</span>
        )}
      </div>
    </div>
  );
};

const CourseItem: React.FC<CourseItemProps> = ({ course, isSub = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const hasSubCourses = course.sub_courses && Array.isArray(course.sub_courses) && course.sub_courses.length > 0;
  const hasDetails = course.details && Object.keys(course.details).length > 0;

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden transition-all duration-200 ${
      isSub ? 'bg-white shadow-sm border-gray-200 ml-4 border-l-4 border-l-blue-400' : 'bg-gray-50 border-gray-300 shadow-md'
    }`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-blue-50/40 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isSub ? 'bg-blue-50 text-blue-500' : 'bg-blue-600 text-white'}`}>
            {isSub ? <Layers size={14} /> : <BookOpen size={20} />}
          </div>
          <div>
            <h4 className={`font-bold ${isSub ? 'text-[13px]' : 'text-base'} text-gray-900 uppercase leading-tight`}>
              {course.name}
            </h4>
            <div className="flex flex-wrap gap-2 mt-1">
               <span className="text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200">
                {course.fees || 'Fees N/A'}
               </span>
               {course.duration && <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded italic">{course.duration}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {hasSubCourses && !isOpen && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">{course.sub_courses.length} Subs</span>}
           <div className="text-gray-400">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 border-t border-gray-200 space-y-5 bg-white animate-in slide-in-from-top-2 duration-300">
          {!isSub && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Rating', val: course.rating, icon: '⭐' },
                { label: 'Reviews', val: course.reviews, icon: '📝' },
                { label: 'Mode', val: course.mode, icon: '🏫' },
                { label: 'Count', val: course.course_count, icon: '📚' }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                  <p className="text-[10px] uppercase text-gray-400 font-black mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800">{item.icon} {item.val || 'N/A'}</p>
                </div>
              ))}
            </div>
          )}

          {hasDetails && (
            <div className="border border-blue-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                className="w-full bg-blue-50/30 hover:bg-blue-50 px-4 py-2.5 text-[11px] font-black text-blue-700 flex justify-between items-center transition-colors"
              >
                <span className="tracking-widest flex items-center gap-2">
                  <TableIcon size={14} /> VIEW FULL DATA BREAKDOWN
                </span>
                {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </button>
              {showDetails && (
                <div className="p-4 space-y-1">
                   {Object.entries(course.details).map(([k, v]) => (
                     <CourseDetailRow key={k} label={k} value={v} />
                   ))}
                </div>
              )}
            </div>
          )}

          {hasSubCourses && (
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-[1px] flex-1 bg-blue-100"></div>
                <p className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">Specializations</p>
                <div className="h-[1px] flex-1 bg-blue-100"></div>
              </div>
              <div className="space-y-2">
                {course.sub_courses.map((sub: any, idx: number) => (
                  <CourseItem key={idx} course={sub} isSub={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ================== GENERIC SECTION ================== */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden mb-8">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-6 py-5 bg-gray-50 hover:bg-gray-100/80 transition-all border-b">
        <span className="flex items-center gap-3 font-extrabold text-gray-800 capitalize tracking-tight text-lg">
          <TableIcon size={20} className="text-blue-500" /> {title.replace(/_/g, " ")}
        </span>
        <div className="bg-white p-1 rounded-full border shadow-sm text-gray-400">
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
};

/* ================== SMART RENDERER ================== */
const ScrapedSmartRenderer = ({ value, onChange }: { value: any; onChange: (v: any) => void }) => {
  const isImage = typeof value === "string" && (value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || value.startsWith("http"));
  
  if (isImage) {
    return (
      <div className="space-y-3">
        <div className="relative group w-48 h-32 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
          <img src={value} alt="Preview" className="w-full h-full object-contain p-2" />
        </div>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[11px] font-mono bg-gray-50 text-gray-500" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  if (typeof value !== "object" || value === null) {
    return (
      <textarea 
        rows={1} 
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner bg-gray-50/30" 
        value={value ?? ""} 
        onChange={(e) => onChange(e.target.value)} 
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-4">
        {value.map((v, i) => (
          <div key={i} className="flex gap-3 items-start group">
            <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              <ScrapedSmartRenderer value={v} onChange={(nv) => { const copy = [...value]; copy[i] = nv; onChange(copy); }} />
            </div>
            <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="mt-3 p-2 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button onClick={() => onChange([...value, ""])} className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors uppercase tracking-tighter">
            <Plus size={16} /> Add Entry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Object.entries(value).filter(([k]) => !EXCLUDED_KEYS.includes(k)).map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1.5 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.1em]">{k.replace(/_/g, " ")}</label>
          <ScrapedSmartRenderer value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        </div>
      ))}
    </div>
  );
};

/* ================== MAIN DASHBOARD ================== */
const CollegeScraperDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any | null>(null);
  const [tempId, setTempId] = useState<string | null>(null);

  const startProcess = async () => {
    if (!url.trim()) return alert("Enter valid URL");
    setLoading(true);
    try {
      const res = await fetch("https://studycupsbackend-wb8p.onrender.com/api/scrape/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setTempId(data.tempId);
      const dbRes = await fetch(`https://studycupsbackend-wb8p.onrender.com/api/scrape/result/${data.tempId}`);
      const dbData = await dbRes.json();
      setScrapedData(dbData.data);
    } catch (err) { alert("Scraping failed!"); } finally { setLoading(false); }
  };

  const handleMigrate = async () => {
    if (!window.confirm("Ready to save this college to main database?")) return;
    try {
      await fetch(`https://studycupsbackend-wb8p.onrender.com/api/scrape/migrate/${tempId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scrapedData)
      });
      alert("✅ Success! College added to Database.");
    } catch (e) { alert("Migration failed"); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Globe className="text-white" size={28} />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">College<span className="text-blue-600">Sync</span></h1>
           </div>
           <p className="text-gray-500 font-medium ml-1">Automated Scraping & CMS Migration Tool</p>
        </div>
        {onBack && <button onClick={onBack} className="bg-white border px-5 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">← Back to Console</button>}
      </div>

      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-white p-3 rounded-[2rem] shadow-2xl shadow-blue-100/50 border border-blue-50 flex flex-col md:flex-row gap-3">
          <input 
            className="flex-1 px-8 py-5 rounded-3xl outline-none text-lg font-medium placeholder:text-gray-300 focus:bg-blue-50/30 transition-all" 
            placeholder="Paste College link..." 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
          />
          <button 
            onClick={startProcess} 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-3xl disabled:bg-gray-300 shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
            {loading ? "EXTRACTING..." : "SCRAPE NOW"}
          </button>
        </div>
      </div>

      {scrapedData && (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
          
          {scrapedData.courses && (
            <Section title="Academic Courses & Specializations">
              <div className="grid grid-cols-1 gap-1">
                {scrapedData.courses.map((c: any, idx: number) => (
                  <CourseItem key={idx} course={c} />
                ))}
              </div>
            </Section>
          )}

          <div className="space-y-8">
            {Object.entries(scrapedData)
              .filter(([k]) => !["courses", "info_course_fee", ...EXCLUDED_KEYS].includes(k))
              .map(([key, value]) => (
                <Section key={key} title={key}>
                  <ScrapedSmartRenderer value={value} onChange={(v) => setScrapedData((prev: any) => ({ ...prev, [key]: v }))} />
                </Section>
              ))}
          </div>

          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-8 z-50">
             <button onClick={handleMigrate} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[1.8rem] font-black flex items-center gap-3 transition-all shadow-lg">
                <Save size={20} /> MIGRATE TO PRODUCTION
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeScraperDashboard;