import React from 'react';
import { Phase, Task, TaskStatus } from '../types';
import TaskItem from './TaskItem';

interface PhaseCardProps {
  phase: Phase;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onGetAITip: (task: Task) => void;
  isLoadingAI: string | null;
  onFilesAdd: (taskId: string, files: File[]) => void;
  onFileRemove: (taskId: string, fileId: string) => void;
  onAnnotationAdd: (taskId: string, fileId: string, text: string) => void;
  onAnnotationRemove: (taskId: string, fileId: string, annotationId: string) => void;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ 
    phase, 
    onStatusChange, 
    onGetAITip, 
    isLoadingAI, 
    onFilesAdd, 
    onFileRemove,
    onAnnotationAdd,
    onAnnotationRemove,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        {phase.title && <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{phase.title}</h2>}
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{phase.subtitle}</p>
      </div>
      <div className="p-3 sm:p-4 space-y-3 flex-grow bg-slate-50/50 dark:bg-slate-800/20">
        {phase.tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onGetAITip={onGetAITip}
            isLoading={isLoadingAI === task.id}
            onFilesAdd={onFilesAdd}
            onFileRemove={onFileRemove}
            onAnnotationAdd={onAnnotationAdd}
            onAnnotationRemove={onAnnotationRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default PhaseCard;