import React, { useState, useRef } from 'react';
import { X, Save, Cloud, Download, Upload, Sparkles } from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onChange: (notes: string) => void;
  onSave: () => void;
  isLoggedIn: boolean;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({ isOpen, onClose, notes, onChange, onSave, isLoggedIn }) => {
  const [saved, setSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(notes ? notes + '\n\n' + content : content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!notes.trim()) return;
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notes.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const analyzeNotes = async () => {
    if (!notes.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await fetch('/api/analyze-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await response.json();
      if (data.result) {
        setAnalysisResult(data.result);
      } else {
        setAnalysisResult("عذراً، حدث خطأ أثناء التحليل.");
      }
    } catch (error) {
      console.error(error);
      setAnalysisResult("عذراً، فشل الاتصال بخدمة التحليل.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-25 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-80 sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-r border-gray-100 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">الملاحظات والأفكار</h2>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              {isLoggedIn ? (
                <><Cloud size={12} className="text-indigo-500" /> يتم المزامنة مع السحابة</>
              ) : (
                'يتم الحفظ محلياً (سجل الدخول للمزامنة)'
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-5 flex flex-col bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">
              عدد الكلمات: {wordCount}
            </span>
            <button
              onClick={analyzeNotes}
              disabled={isAnalyzing || !notes.trim()}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors bg-indigo-50 px-2 py-1.5 rounded-md"
              title="تحليل الجودة باستخدام الذكاء الاصطناعي"
            >
              <Sparkles size={14} />
              {isAnalyzing ? 'جاري التحليل...' : 'تحليل الجودة'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => onChange(e.target.value)}
            placeholder="اكتب أفكارك، مصادرك، أو أي ملاحظات سريعة هنا..."
            className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all outline-none bg-gray-50 focus:bg-white text-gray-700 leading-relaxed"
          ></textarea>
          
          {analysisResult && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative">
              <button 
                onClick={() => setAnalysisResult(null)}
                className="absolute top-2 left-2 text-indigo-400 hover:text-indigo-600"
              >
                <X size={16} />
              </button>
              <h3 className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-1">
                <Sparkles size={16} /> اقتراحات التحسين:
              </h3>
              <div className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {analysisResult}
              </div>
            </div>
          )}
          
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">
              {saved ? 'تم الحفظ بنجاح!' : ''}
            </span>
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.md" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="استيراد من ملف (.txt, .md)"
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={handleDownloadMarkdown}
                disabled={!notes.trim()}
                title="تصدير كملف Markdown"
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
              >
                <Download size={18} />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
              >
                <Save size={18} />
                {isLoggedIn ? 'حفظ ومزامنة' : 'حفظ الملاحظات'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
