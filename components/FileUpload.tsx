import React, { useState, useCallback, useRef } from 'react';
import { UploadCloudIcon } from './Icons';

interface FileUploadProps {
  onFilesAdd: (files: File[]) => void;
  accept: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdd, accept }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      onFilesAdd(files);
    }
  }, [onFilesAdd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files && files.length > 0) {
      onFilesAdd(files);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`mt-2 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`
      }
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label="File uploader"
      />
      <div className="flex flex-col items-center justify-center">
        <UploadCloudIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          Accepted: {accept.split(',').join(', ')}
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
