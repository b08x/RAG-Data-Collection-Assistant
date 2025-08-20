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
      className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 bg-slate-100 dark:bg-slate-800/50
        ${isDragging 
          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50' 
          : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'}`
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
        <UploadCloudIcon className="w-12 h-12 text-slate-500 dark:text-slate-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
          Accepted: {accept.split(',').join(', ')}
        </p>
      </div>
    </div>
  );
};

export default FileUpload;