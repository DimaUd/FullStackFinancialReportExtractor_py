import React, { useState } from 'react';
import type { ExtractionResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ExportControlsProps {
  result: ExtractionResult | null;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ result }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<string | null>(null);

    if (!result) return null;

    const downloadFile = (content: string, fileName: string, mimeType: string) => {
        // Add BOM for Excel compatibility with UTF-8, especially for CSV
        const BOM = mimeType.includes('csv') ? '\uFEFF' : '';
        const blob = new Blob([BOM + content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadJson = () => {
        const jsonContent = JSON.stringify(result, null, 2);
        downloadFile(jsonContent, `${result.documentName}.json`, 'application/json;charset=utf-8;');
    };
    
    const handleDownloadCsv = () => {
        const allCsvContent = result.tables.map(table => {
            const tableHeader = `"${table.title}" (Page ${table.pageNumber})`;
            return `${tableHeader}\n${table.csv}`;
        }).join('\n\n');
        downloadFile(allCsvContent, `${result.documentName}.csv`, 'text/csv;charset=utf-8;');
    };

    const handleExportToDb = async () => {
        setIsExporting(true);
        setExportMessage(null);
        try {
            // This remains a mock as there's no real backend
            await new Promise(resolve => setTimeout(resolve, 1500));
            setExportMessage(`הנתונים מהמסמך ${result.documentName} יוצאו בהצלחה למסד הנתונים.`);
        } catch (error) {
            setExportMessage('הייצוא נכשל. אנא נסה שוב.');
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportMessage(null), 5000);
        }
    };

    return (
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">אפשרויות ייצוא</h3>
                <div className="flex items-center gap-3">
                    <button onClick={handleDownloadJson} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                        הורד JSON
                    </button>
                    <button onClick={handleDownloadCsv} disabled={result.tables.length === 0} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed">
                        הורד CSV
                    </button>
                    <button onClick={handleExportToDb} disabled={isExporting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center disabled:bg-indigo-800 disabled:cursor-wait">
                        {isExporting && <SpinnerIcon className="h-4 w-4 ml-2" />}
                        ייצא למסד נתונים
                    </button>
                </div>
            </div>
             {exportMessage && (
                <p className={`mt-3 text-sm font-medium ${exportMessage.includes('נכשל') ? 'text-red-400' : 'text-green-400'}`}>
                    {exportMessage}
                </p>
            )}
        </div>
    );
};
