import React, { useState } from 'react';
import { Modal } from './Modal';
import { Link as LinkIcon, Loader2, AlertTriangle } from 'lucide-react';

interface ImportFromUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
}

const loadingMessages = [
    "Scraping initiated...",
    "Analyzing page structure...",
    "Extracting relevant data...",
    "Parsing data into records...",
    "Finalizing import...",
    "Almost there..."
];

export const ImportFromUrlModal: React.FC<ImportFromUrlModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  // Fix: The previous implementation used an incorrect type `NodeJS.Timeout` for a browser environment
  // and had a potential runtime error where an uninitialized variable could be used.
  // This has been refactored to use the idiomatic and safe pattern for intervals in useEffect.
  React.useEffect(() => {
    if (isImporting) {
      const intervalId = setInterval(() => {
        setLoadingMessage(prev => {
            const currentIndex = loadingMessages.indexOf(prev);
            const nextIndex = (currentIndex + 1) % loadingMessages.length;
            return loadingMessages[nextIndex];
        });
      }, 1500);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isImporting]);

  const handleSubmit = async () => {
    if (!url || !url.startsWith('http')) {
      setError('Please enter a valid URL (e.g., https://...).');
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      await onSubmit(url);
      // Success is handled by parent (modal closes)
    } catch (err) {
      setError('An error occurred during import. The URL may be unsupported or the site may be blocking requests.');
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    setIsImporting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import College from URL">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            Enter the URL of a college page (e.g., from Shiksha.com). The system will attempt to automatically scrape and import the data.
            <br />
            <span className="font-semibold">Note:</span> This is a backend-intensive process and may take a moment.
          </p>
        </div>

        <div>
          <label htmlFor="import-url" className="block text-sm font-medium text-gray-700">College Page URL</label>
          <div className="mt-1 relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-400" />
             </div>
             <input
                type="url"
                id="import-url"
                name="import-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isImporting}
                placeholder="https://www.shiksha.com/college/..."
                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
             />
          </div>
        </div>
        
        {isImporting && (
            <div className="text-center p-4 bg-blue-50 rounded-md">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="mt-2 text-sm font-medium text-primary">{loadingMessage}</p>
            </div>
        )}

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
            disabled={isImporting || !url}
            className="flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
