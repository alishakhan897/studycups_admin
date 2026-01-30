import React, { useState } from 'react';
import { Modal } from './Modal';
import { FormField } from '../types';
import { UploadCloud, Loader2, FileCheck, AlertTriangle } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  formFields: FormField[];
  title: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSubmit, formFields, title }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const generateSampleCsv = () => {
    const headers = formFields
        .filter(field => !['richtext', 'image', 'checkbox'].includes(field.type))
        .map(field => field.name)
        .join(',');

    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sample_${title.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (file.type !== 'text/csv') {
      setError('Invalid file type. Please upload a .csv file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await onSubmit(file);
      // Success is handled by parent (modal closes)
    } catch (err) {
      setError('An error occurred during upload. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClose = () => {
      setFile(null);
      setError(null);
      setIsUploading(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Bulk Upload ${title}`}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700">Instructions:</h4>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 mt-2">
            <li>Download the sample CSV file to see the required format and columns.</li>
            <li>Fill the sheet with your data. Do not change the column headers.</li>
            <li>Save the file in CSV format.</li>
            <li>Upload the file below.</li>
          </ol>
        </div>

        <button 
          onClick={generateSampleCsv}
          className="text-sm text-primary hover:underline"
        >
          Download Sample CSV
        </button>

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {file ? (
                <FileCheck className="mx-auto h-12 w-12 text-green-500" />
              ) : (
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                  <span>{file ? file.name : 'Select a file'}</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
                </label>
                {!file && <p className="pl-1">or drag and drop</p>}
              </div>
              <p className="text-xs text-gray-500">CSV up to 10MB</p>
            </div>
          </div>
        </div>

        {error && (
            <div className="flex items-center p-3 bg-red-50 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isUploading || !file}
            className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary disabled:bg-gray-400"
          >
            {isUploading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
