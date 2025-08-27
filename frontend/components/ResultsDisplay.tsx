import React, { useState } from 'react';
import type { ExtractionResult } from '../types';
import { ExportControls } from './ExportControls';

interface ResultsDisplayProps {
  results: ExtractionResult[];
}

type Tab = 'html' | 'raw' | 'json';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 ${
        active
          ? 'bg-sky-600 text-white'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
};

const HtmlTableDisplay: React.FC<{ htmlContent: string }> = ({ htmlContent }) => (
    <div className="prose prose-invert max-w-none prose-table:w-full prose-table:border prose-table:border-slate-600 prose-thead:bg-slate-700 prose-th:p-2 prose-th:border prose-th:border-slate-600 prose-td:p-2 prose-td:border prose-td:border-slate-600">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
);

const RawGridDisplay: React.FC<{ rawData: string[][], columns: string[] }> = ({ rawData, columns }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-300 border-collapse">
            <thead className="text-xs text-slate-200 uppercase bg-slate-700">
                <tr>
                    {columns.map((col, index) => (
                        <th key={index} scope="col" className="px-4 py-3 border border-slate-600">{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rawData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 border border-slate-600">{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const JsonDisplay: React.FC<{ data: object }> = ({ data }) => (
    <pre className="bg-slate-900/50 p-4 rounded-md text-sm overflow-x-auto border border-slate-700 text-left" dir="ltr">
        <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [activeTab, setActiveTab] = useState<Tab>('html');
  // Since we process one document at a time now, we always take the first result.
  const [selectedDocumentIndex] = useState(0);
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);

  const currentResult = results[selectedDocumentIndex];
  if (!currentResult) {
      return <p className="text-center text-red-400">לא נמצאו תוצאות להצגה.</p>;
  }

  const currentTable = currentResult.tables[selectedTableIndex];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        <h2 className="text-xl font-bold text-sky-400 mb-2">סיכום נתונים</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong className="text-slate-400 block">מסמך:</strong> {currentResult.documentName}</div>
            <div><strong className="text-slate-400 block">סה"כ עמודים:</strong> {currentResult.totalPages}</div>
            <div><strong className="text-slate-400 block">מטבע:</strong> {currentResult.metadata.currency}</div>
            <div><strong className="text-slate-400 block">תקופה:</strong> {currentResult.metadata.reportingPeriod}</div>
        </div>
      </div>

      <ExportControls result={currentResult} />

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        {currentResult.tables.length === 0 ? (
            <p className="text-center text-slate-400 py-8">לא חולצו טבלאות ממסמך זה.</p>
        ) : (
            <>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <label htmlFor="table-select" className="font-semibold text-lg">טבלה מוצגת:</label>
                        <select 
                            id="table-select"
                            value={selectedTableIndex}
                            onChange={(e) => setSelectedTableIndex(parseInt(e.target.value, 10))}
                            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5"
                        >
                            {currentResult.tables.map((t, index) => (
                                <option key={index} value={index}>{`עמוד ${t.pageNumber}: ${t.title || `טבלה ${index + 1}`}`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <TabButton active={activeTab === 'html'} onClick={() => setActiveTab('html')}>תצוגת טבלה</TabButton>
                        <TabButton active={activeTab === 'raw'} onClick={() => setActiveTab('raw')}>נתונים גולמיים</TabButton>
                        <TabButton active={activeTab === 'json'} onClick={() => setActiveTab('json')}>JSON מלא</TabButton>
                    </div>
                </div>
                
                <div className="mt-4 min-h-[200px]">
                    {currentTable && activeTab === 'html' && <HtmlTableDisplay htmlContent={currentTable.html} />}
                    {currentTable && activeTab === 'raw' && <RawGridDisplay rawData={currentTable.rawData} columns={currentTable.columns} />}
                    {activeTab === 'json' && <JsonDisplay data={currentResult} />}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
