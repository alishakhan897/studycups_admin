
import React, { useState, useEffect, useCallback } from 'react';
import type { ApiService, DataItem, Column, FormField } from '../types';
import { Modal } from './Modal';
import { BulkUploadModal } from './BulkUploadModal';
import { ImportFromUrlModal } from './ImportFromUrlModal';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, Download, UploadCloud, Link as LinkIcon } from 'lucide-react';

interface DataManagementProps<T extends DataItem> {
  title: string;
  api: ApiService<T>;
  columns: Column<T>[];
  formFields: FormField[];
  onEditCollege?: (id: number) => void;
  onEditExam?: (id: number) => void;   // ✅ ADD THIS
}


function DataManagementImpl<T extends DataItem>({ title, api, columns, formFields , onEditCollege ,   onEditExam  }: DataManagementProps<T>): React.ReactElement {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isImportUrlModalOpen, setIsImportUrlModalOpen] = useState(false);
  
  const [currentItem, setCurrentItem] = useState<Partial<T> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // FIX: Reset pagination and search term when the component's data type changes.
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
  }, [title]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Custom logic for Courses extraction 
       if (title === "Colleges") {
      const res = await fetch("https://studycupsbackend-wb8p.onrender.com/api/colleges/list");
      const json = await res.json();
      setData(json.data);
      return;
    }
if (title === "Courses") {
  const res = await fetch("http://localhost:5000/api/courses/all");
  const json = await res.json();

  setData(json.data || []);
  return;
}



// DEFAULT BEHAVIOR for all other pages
const result = await api.getAll();

// Inject localStorage status ONLY for Enquiries
if (title === "Enquiries") {
  const statusStore = JSON.parse(localStorage.getItem("enquiryStatus") || "{}");

  const enriched = result.map((item: any) => ({
    ...item,
    status: statusStore[item.id] || "Not Resolved"
  }));

  setData(enriched);
} else {
  setData(result);
}


    } catch (err) {
      setError(`Failed to fetch ${title.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  }, [api, title]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenFormModal = (item: Partial<T> | null = null) => {
    setCurrentItem(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentItem(null);
  };

 const handleFormSubmit = async (formData: Partial<T>) => {
  const processedData: any = { ...formData };

  formFields.forEach(field => {
    const value = processedData[field.name];

    if (field.isArray) {
      if (typeof value === "string") {
        processedData[field.name] = value
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      } else if (value === undefined || value === null) {
        processedData[field.name] = [];
      }
    }

    if (value === "true") processedData[field.name] = true;
    if (value === "false") processedData[field.name] = false;
  });

  const hasFile = Object.values(processedData).some(
    v =>
      v instanceof File ||
      (Array.isArray(v) && v.length && v[0] instanceof File)
  );

  try {
    if (hasFile) {
      const fd = new FormData();

      Object.entries(processedData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value) && value[0] instanceof File) {
          value.forEach(file => fd.append(key, file));
          return;
        }

        if (value instanceof File) {
          fd.append(key, value);
          return;
        }

        if (Array.isArray(value) || typeof value === "object") {
          fd.append(key, JSON.stringify(value));
          return;
        }

        fd.append(key, String(value));
      });

      if (currentItem && "id" in currentItem) {
        await api.updateFormData(currentItem.id as string, fd);
      } else {
        await api.addFormData(fd);
      }
    } else {
      if (currentItem && "id" in currentItem) {
        await api.update(currentItem.id as string, processedData);
      } else {
        await api.add(processedData as Omit<T, "id">);
      }
    }

    fetchData();
    handleCloseFormModal();
  } catch (err) {
    console.error("Failed to save item", err);
  }
};


  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete item", err);
      }
    }
  }; 

  
const toggleResolved = (item: any) => {
  if (title !== "Enquiries") return;

  const key = "enquiryStatus";
  const saved = JSON.parse(localStorage.getItem(key) || "{}");

  saved[item.id] =
    saved[item.id] === "Resolved" ? "Not Resolved" : "Resolved";

  localStorage.setItem(key, JSON.stringify(saved));

  fetchData();
};




  

  const handleBulkUpload = async (file: File) => {
    if (!api.bulkUpload) return;
    try {
      await api.bulkUpload(file);
      // In a real app, you might get back the new items or just refetch
      fetchData();
      setIsBulkUploadModalOpen(false);
    } catch (err) {
      console.error("Bulk upload failed", err);
    }
  };
  
  const handleImportFromUrl = async (url: string) => {
      if (!api.importFromUrl) return;
      try {
          await api.importFromUrl(url);
          fetchData();
          setIsImportUrlModalOpen(false);
      } catch (err) {
          console.error("Import from URL failed", err);
          // Optionally, set an error state to show in the modal
      }
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = columns.map(col => col.header).join(',');
    const rows = filteredData.map(item => {
      return columns.map(col => {
        let value;
        if (typeof col.accessor === 'function') value = col.accessor(item as T);
        else value = (item as any)[col.accessor as string] ?? '';
        
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    }).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(' ', '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = data.filter(item => {
    const searchable = (item as any).name || (item as any).title || '';
    return searchable.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 p-4 rounded-lg">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="mt-4 text-lg font-semibold text-red-700">{error}</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="relative">
          <input
            type="text" placeholder={`Search ${title}...`} value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            {title === 'Enquiries' && (
                <button onClick={handleExport} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <Download size={18} className="mr-2" /> Export CSV
                </button>
            )}
            {api.importFromUrl && title === 'Colleges' && (
                <button onClick={() => setIsImportUrlModalOpen(true)} className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <LinkIcon size={18} className="mr-2" /> Import from URL
                </button>
            )}
             {api.bulkUpload && (
                <button onClick={() => setIsBulkUploadModalOpen(true)} className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                    <UploadCloud size={18} className="mr-2" /> Bulk Upload
                </button>
            )}
        
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
        <thead>
  <tr>
    {columns.map(col => (
      <th key={col.header} className="px-6 py-3">{col.header}</th>
    ))}

    {/* Show Actions except on Courses */}
    {title !== "Courses" && (
      <th className="px-6 py-3 text-right">Actions</th>
    )}
  </tr>
</thead>

          <tbody>
            {paginatedData.map(item => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.header} className={`px-6 py-4 ${col.className || ''}`}>
                  {typeof col.accessor === 'function'
  ? col.accessor({ ...item, toggleResolved })
  : String((item as any)[col.accessor as string] ?? '')}

                  </td>
                ))}
               <td className="px-6 py-4 text-right flex justify-end items-center space-x-4">

  {title !== "Courses" && formFields.length > 0 && (
   <button
  onClick={() => {
    if (title === "Colleges" && onEditCollege) {
      onEditCollege(item.id);

    }  else if (title === "Exams" && onEditExam) {
      onEditExam(item.id);
    }
    
    
    else {
      handleOpenFormModal(item);
    }
  }}
>
  <Edit size={18} />
</button>

  )}

  {title !== "Courses" && (
    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
      <Trash2 size={18} />
    </button>
  )}

</td>

              </tr>
            ))}
          </tbody>
        </table>
        {paginatedData.length === 0 && <div className="text-center py-8 text-gray-500">No data found.</div>}
      </div>
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
        </span>
        <div className="flex items-center space-x-1">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"><ChevronLeft size={20} /></button>
            <span className="font-medium px-2">{currentPage} / {totalPages > 0 ? totalPages : 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"><ChevronRight size={20} /></button>
        </div>
      </div>
      {isFormModalOpen && (
        <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={currentItem && 'id' in currentItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}>
          <Form initialData={currentItem} fields={formFields} onSubmit={handleFormSubmit} onCancel={handleCloseFormModal} />
        </Modal>
      )}
      {isBulkUploadModalOpen && (
        <BulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onSubmit={handleBulkUpload}
          formFields={formFields}
          title={title}
        />
      )}
      {isImportUrlModalOpen && (
        <ImportFromUrlModal
          isOpen={isImportUrlModalOpen}
          onClose={() => setIsImportUrlModalOpen(false)}
          onSubmit={handleImportFromUrl}
        />
      )}
    </div>
  );
};
export const DataManagement = React.memo(
  DataManagementImpl
) as <T extends DataItem>(
  props: DataManagementProps<T>
) => React.ReactElement;


interface FormProps<T> {
    initialData: Partial<T> | null;
    fields: FormField[];
    onSubmit: (data: Partial<T>) => void;
    onCancel: () => void;
}

function Form<T>({ initialData, fields, onSubmit, onCancel }: FormProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});

  const getNestedValue = (obj: any, path: string) =>
    path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;

    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    current[lastKey] = value;
    return { ...obj };
  };

  const handleChange = (path: string, value: any) => {
    setFormData(prev => setNestedValue(prev, path, value));
  };

  const addArrayItem = (path: string, template: FormField[]) => {
    const arr = getNestedValue(formData, path) || [];
    const emptyItem: any = {};
    template.forEach(f => {
      emptyItem[f.name] = f.isArray ? [] : "";
    });
    handleChange(path, [...arr, emptyItem]);
  };

  const removeArrayItem = (path: string, index: number) => {
    const arr = getNestedValue(formData, path) || [];
    arr.splice(index, 1);
    handleChange(path, [...arr]);
  };

  // RENDER FIELD
  const renderField = (field: FormField, basePath = '') => {
    const path = basePath ? `${basePath}.${field.name}` : field.name;
    const value = getNestedValue(formData, path);
    
  if (field.type === "file") {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
      </label>

      <input
        type="file"
        multiple={field.multiple}
        className="w-full border p-2 rounded"
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          handleChange(
            path,
            field.multiple ? Array.from(files) : files[0]
          );
        }}
      />
    </div>
  );
}


    // nestedObject
    if (field.type === 'nestedObject') {
      return (
        <div className="p-3 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">{field.label}</h3>
          {field.fields?.map(sub => (
            <div key={sub.name} className="mb-3">
              {renderField(sub, path)}
            </div>
          ))}
        </div>
      );
    }

    // nestedArray
    if (field.type === 'nestedArray') {
      const arr = value || [];

      return (
        <div className="p-3 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{field.label}</h3>
            <button
              type="button"
              onClick={() => addArrayItem(path, field.fields || [])}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              + Add
            </button>
          </div>

          {arr.map((item: any, idx: number) => (
            <div key={idx} className="p-3 mb-3 border rounded bg-white">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeArrayItem(path, idx)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>

              {field.fields?.map(sub => (
                <div key={sub.name} className="mb-3">
                  {renderField(sub, `${path}.${idx}`)}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // normal fields
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>

        {field.type === 'select' ? (
          <select
            value={value || ""}
            onChange={e => handleChange(path, e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select</option>
            {field.options?.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            className="w-full border p-2 rounded"
            value={value || ""}
            onChange={e => handleChange(path, e.target.value)}
          />
        ) : (
          <input
            type={field.type}
            className="w-full border p-2 rounded"
            value={value || ""}
            onChange={e => handleChange(path, e.target.value)}
          />
        )}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-2">
      {fields.map(field => (
        <div key={field.name}>{renderField(field)}</div>
      ))} 
      

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
}
