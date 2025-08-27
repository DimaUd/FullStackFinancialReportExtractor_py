import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ProcessingViewProps {
  message: string;
  progress?: number;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
      <SpinnerIcon className="h-12 w-12 text-sky-400" />
      <p className="text-lg font-medium text-slate-300">{message}</p>
      {progress !== undefined && (
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-sky-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
