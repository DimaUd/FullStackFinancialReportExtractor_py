import React, { useState } from 'react';
import type { HtmlResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface HtmlPreviewProps {
  htmlResults: HtmlResult[];
  onConfirm: () => void;
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ htmlResults, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmClick = () => {
    setIsConfirming(true);
    onConfirm();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-sky-400">שלב 1: אימות טבלאות שחולצו</h2>
        <p className="text-slate-400 mt-1">אלו הטבלאות שזיהינו במסמך. בדוק את התוצאות ולחץ על הכפתור כדי להמיר אותן לנתונים מובנים.</p>
      </div>

      <div className="space-y-8 max-h-[60vh] overflow-y-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        {htmlResults.map((result, index) => (
          <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-600">
            <h3 className="font-semibold text-lg text-slate-300 mb-2 border-b border-slate-600 pb-2">
              טבלה <span className="font-mono bg-slate-700 px-2 py-1 rounded">{index + 1}</span> (מעמוד <span className="font-mono bg-slate-700 px-2 py-1 rounded">{result.pageNumber}</span>)
            </h3>
            <div
              className="prose prose-invert max-w-none prose-table:w-full prose-table:border prose-table:border-slate-600 prose-thead:bg-slate-700 prose-th:p-2 prose-th:border prose-th:border-slate-600 prose-td:p-2 prose-td:border prose-td:border-slate-600"
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={handleConfirmClick}
          disabled={isConfirming}
          className="w-full md:w-auto flex justify-center items-center bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 shadow-lg"
        >
          {isConfirming ? (
            <>
              <SpinnerIcon className="h-5 w-5 ml-2" />
              מעבד...
            </>
          ) : "המר לנתונים מובנים"}
        </button>
      </div>
    </div>
  );
};
