
import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const displayProgress = Math.round(progress);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{displayProgress}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
