import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
       if (selectedFile.type === 'application/pdf') {
        setError(null);
        setFile(selectedFile);
        onFileSelect(selectedFile);
      } else {
        setFile(null);
        setError("יש להעלות קובץ PDF בלבד.");
      }
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
          setIsDragging(true);
      } else if (e.type === 'dragleave') {
          setIsDragging(false);
      }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile.type === 'application/pdf') {
            setError(null);
            setFile(droppedFile);
            onFileSelect(droppedFile);
          } else {
            setFile(null);
            setError("יש להעלות קובץ PDF בלבד.");
          }
      }
  }, [onFileSelect]);
  
  const acceptedFileTypes = '.pdf';

  return (
    <div className="flex flex-col items-center space-y-6">
        <h2 className="text-xl font-semibold text-center text-slate-300">התחל על ידי העלאת דוח כספי</h2>
        <p className="text-slate-400 text-center max-w-md">העלה קובץ PDF והמערכת תסרוק אותו, תחלץ את הטבלאות ותמיר אותן לנתונים מובנים שניתן לייצא.</p>
      <label
        htmlFor="file-upload"
        className={`w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 
            ${isDragging ? 'border-sky-400 bg-slate-700/50' : 'border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-700/50'}`}
        onDragEnter={handleDragEvents}
        onDragOver={handleDragEvents}
        onDragLeave={handleDragEvents}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center text-center text-slate-300">
            <FileIcon className="w-10 h-10 mb-2" />
            <p className="font-semibold">{file.name}</p>
            <p className="text-sm text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
              <UploadIcon className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-lg font-semibold text-slate-300">גרור קובץ PDF לכאן</p>
              <p className="text-sm text-slate-400">או לחץ לבחירה</p>
          </div>
        )}
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={acceptedFileTypes}/>
      </label>
      {error && (
        <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
      )}
    </div>
  );
};
