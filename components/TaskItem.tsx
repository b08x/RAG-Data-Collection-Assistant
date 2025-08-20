import React from 'react';
import { Task, TaskStatus } from '../types';
import { CheckCircleIcon, ChevronDownIcon, ClockIcon, DotIcon, SparklesIcon } from './Icons';
import FileUpload from './FileUpload';
import FileListItem from './FileListItem';

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onGetAITip: (task: Task) => void;
  isLoading: boolean;
  onFilesAdd: (taskId: string, files: File[]) => void;
  onFileRemove: (taskId: string, fileId: string) => void;
  onAnnotationAdd: (taskId: string, fileId: string, text: string) => void;
  onAnnotationRemove: (taskId: string, fileId: string, annotationId: string) => void;
}

const statusConfig = {
  [TaskStatus.ToDo]: {
    icon: <DotIcon className="w-6 h-6 text-slate-400" />,
    bg: 'bg-slate-100 dark:bg-slate-700',
    text: 'text-slate-500 dark:text-slate-400',
    ring: 'ring-slate-300 dark:ring-slate-600',
  },
  [TaskStatus.InProgress]: {
    icon: <ClockIcon className="w-6 h-6 text-amber-500" />,
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-400 dark:ring-amber-600',
  },
  [TaskStatus.Done]: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-600 dark:text-green-500',
    ring: 'ring-green-400 dark:ring-green-600',
  },
};

const TaskItem: React.FC<TaskItemProps> = ({ 
    task, 
    onStatusChange, 
    onGetAITip, 
    isLoading, 
    onFilesAdd, 
    onFileRemove,
    onAnnotationAdd,
    onAnnotationRemove,
}) => {
  const config = statusConfig[task.status];
  const hasDetails = task.details.length > 0 || task.fileConfig;
  const fileCount = task.files.length;
  const maxFiles = task.fileConfig?.maxFiles || 0;

  return (
    <div className={`p-4 rounded-lg shadow-sm transition-all duration-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
        </div>
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className={`pl-3 pr-8 py-1.5 text-xs font-medium rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-blue-500 ${config.bg} ${config.text} border border-transparent`}
            aria-label={`Status: ${task.status}`}
          >
            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
           <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon className={`w-4 h-4 ${config.text}`} />
          </div>
        </div>
      </div>

      {hasDetails && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 space-y-4">
          {task.details.length > 0 && (
            <div>
                <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Details</h4>
                <ul className="space-y-1 list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                    {task.details.map((detail, index) => <li key={index}>{detail}</li>)}
                </ul>
            </div>
          )}
          {task.fileConfig && (
            <div>
                 <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Attached Files ({fileCount}/{maxFiles})
                </h4>
                <div className="space-y-2">
                    {task.files.map(file => (
                        <FileListItem 
                            key={file.id} 
                            uploadedFile={file} 
                            onRemove={() => onFileRemove(task.id, file.id)}
                            onAnnotationAdd={(text) => onAnnotationAdd(task.id, file.id, text)}
                            onAnnotationRemove={(annotationId) => onAnnotationRemove(task.id, file.id, annotationId)}
                        />
                    ))}
                </div>
                {fileCount < maxFiles && (
                    <FileUpload 
                        onFilesAdd={(files) => onFilesAdd(task.id, files)}
                        accept={task.fileConfig.accept}
                    />
                )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={() => onGetAITip(task)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 rounded-full hover:bg-blue-200 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4" />
              <span>AI Assistant</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};


export default TaskItem;