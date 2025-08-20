import React, { useState, useRef, useEffect } from 'react';
import { UploadedFile, FileStatus } from '../types';
import { FileIcon, FileTextIcon, ImageIcon, FileAudioIcon, FileVideoIcon, Trash2Icon, SparklesIcon, XCircleIcon, CornerDownRightIcon, XIcon, MessageSquarePlusIcon } from './Icons';

interface FileListItemProps {
  uploadedFile: UploadedFile;
  onRemove: () => void;
  onAnnotationAdd: (text: string) => void;
  onAnnotationRemove: (annotationId: string) => void;
}

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-slate-500" />;
    if (mimeType.startsWith('video/')) return <FileVideoIcon className="w-5 h-5 text-slate-500" />;
    if (mimeType.startsWith('audio/')) return <FileAudioIcon className="w-5 h-5 text-slate-500" />;
    if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return <FileTextIcon className="w-5 h-5 text-slate-500" />;
    return <FileIcon className="w-5 h-5 text-slate-500" />;
};

const FileListItem: React.FC<FileListItemProps> = ({ uploadedFile, onRemove, onAnnotationAdd, onAnnotationRemove }) => {
  const { name, type, summary, status, annotations } = uploadedFile;
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAnnotating) {
        textareaRef.current?.focus();
    }
  }, [isAnnotating]);

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (annotationText.trim()) {
        onAnnotationAdd(annotationText.trim());
        setAnnotationText('');
        setIsAnnotating(false);
    }
  };

  const handleCancelAnnotation = () => {
    setAnnotationText('');
    setIsAnnotating(false);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
                {getFileIcon(type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={name}>
                {name}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                {status === FileStatus.Summarizing && (
                    <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing with AI...</span>
                    </>
                )}
                {status === FileStatus.Complete && (
                    <>
                        <SparklesIcon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <p className="italic">{summary}</p>
                    </>
                )}
                {status === FileStatus.Error && (
                    <>
                        <XCircleIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <p className="text-red-500">{summary}</p>
                    </>
                )}
                </div>
            </div>
            <div className="flex items-center">
                <button 
                    onClick={onRemove}
                    className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"
                    aria-label={`Remove ${name}`}
                >
                    <Trash2Icon className="w-4 h-4" />
                </button>
            </div>
        </div>

        {(status === FileStatus.Complete || annotations.length > 0) && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600/50">
                 {annotations.length > 0 && (
                     <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Notes</h4>
                        <ul className="space-y-2">
                            {annotations.map(ann => (
                                <li key={ann.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <CornerDownRightIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400"/>
                                    <p className="flex-grow">{ann.text}</p>
                                    <button onClick={() => onAnnotationRemove(ann.id)} className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-600 flex-shrink-0">
                                        <XIcon className="w-3.5 h-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {status === FileStatus.Complete && (
                    <div className={annotations.length > 0 ? 'mt-4' : 'mt-1'}>
                        {!isAnnotating ? (
                            <button
                                onClick={() => setIsAnnotating(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 rounded-full hover:bg-blue-200 dark:hover:bg-blue-500/20"
                            >
                                <MessageSquarePlusIcon className="w-4 h-4" />
                                Add Note
                            </button>
                        ) : (
                            <form onSubmit={handleAddAnnotation} className="space-y-2">
                                <textarea
                                    ref={textareaRef}
                                    value={annotationText}
                                    onChange={(e) => setAnnotationText(e.target.value)}
                                    onBlur={() => !annotationText.trim() && setIsAnnotating(false)}
                                    placeholder="Add a note or observation..."
                                    rows={3}
                                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                                <div className="flex justify-end gap-2">
                                    <button 
                                        type="button" 
                                        onClick={handleCancelAnnotation}
                                        className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 disabled:opacity-60" 
                                        disabled={!annotationText.trim()}
                                    >
                                        Add Note
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default FileListItem;