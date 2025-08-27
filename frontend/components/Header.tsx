
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto py-4 px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          מחלץ נתונים מדוחות כספיים
        </h1>
        <p className="text-slate-400 mt-1">חילוץ טבלאות מבוסס בינה מלאכותית</p>
      </div>
    </header>
  );
};