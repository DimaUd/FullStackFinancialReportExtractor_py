import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { HtmlPreview } from './components/HtmlPreview';
import { ResultsDisplay } from './components/ResultsDisplay';
import { extractHtmlFromPdf, structureDataFromHtml } from './services/api';
import type { ExtractionResult, HtmlResult } from './types';
import { XCircleIcon } from './components/icons/XCircleIcon';

type AppState = 'upload' | 'processing_html' | 'preview_html' | 'structuring_data' | 'results' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [htmlResults, setHtmlResults] = useState<HtmlResult[] | null>(null);
  const [structuredResult, setStructuredResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ message: '', value: 0 });
  const [fileName, setFileName] = useState('');

  const resetState = useCallback(() => {
    setAppState('upload');
    setHtmlResults(null);
    setStructuredResult(null);
    setError(null);
    setProgress({ message: '', value: 0 });
    setFileName('');
  }, []);

  const handleFileSelect = async (file: File) => {
    resetState();
    setFileName(file.name);
    setAppState('processing_html');
    try {
      const results = await extractHtmlFromPdf(file, (p) => {
        setProgress({ message: `מעבד עמוד ${p.current} מתוך ${p.total}...`, value: (p.current / p.total) * 100 });
      });
      if (results.length === 0) {
        setError("לא נמצאו טבלאות במסמך.");
        setAppState('error');
      } else {
        setHtmlResults(results);
        setAppState('preview_html');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'אירעה שגיאה בחילוץ HTML';
      setError(errorMessage);
      setAppState('error');
    }
  };

  const handleStructureRequest = async () => {
    if (!htmlResults || !fileName) return;
    setAppState('structuring_data');
    setProgress({ message: 'ממיר HTML לנתונים מובנים...', value: 50 });
    try {
      const result = await structureDataFromHtml(htmlResults, fileName);
      setStructuredResult(result);
      setAppState('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'אירעה שגיאה בהמרת הנתונים';
      setError(errorMessage);
      setAppState('error');
    }
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'upload':
        return <FileUpload onFileSelect={handleFileSelect} />;
      case 'processing_html':
        return <ProcessingView message={progress.message} progress={progress.value} />;
      case 'preview_html':
        return htmlResults && <HtmlPreview htmlResults={htmlResults} onConfirm={handleStructureRequest} />;
      case 'structuring_data':
        return <ProcessingView message={progress.message} />;
      case 'results':
        return structuredResult && (
          <>
            <ResultsDisplay results={[structuredResult]} />
             <div className="mt-8 text-center">
                <button
                    onClick={resetState}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                >
                    חילוץ מסמך נוסף
                </button>
            </div>
          </>
        );
      case 'error':
        return (
          <div className="text-center">
            <div className="mt-6 flex items-center justify-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                <XCircleIcon className="h-6 w-6 ml-3" />
                <span className="font-semibold text-center">{error}</span>
            </div>
             <div className="mt-8 text-center">
                <button
                    onClick={resetState}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md"
                >
                    נסה שוב
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-slate-800/50 rounded-lg shadow-2xl p-6 border border-slate-700">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;