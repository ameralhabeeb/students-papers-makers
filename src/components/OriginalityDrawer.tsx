import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, AlertTriangle, FileText } from 'lucide-react';

interface OriginalityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
}

export const OriginalityDrawer: React.FC<OriginalityDrawerProps> = ({ isOpen, onClose, notes }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(prev => prev ? prev + '\n\n' + content : content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadFromNotes = () => {
    setText(notes);
  };

  const analyzeOriginality = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const response = await fetch('/api/check-originality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[450px] md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col"
        dir="rtl"
      >
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              فحص الأصالة والذكاء الاصطناعي
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              تحليل نسبة الاستلال واستخدام الذكاء الاصطناعي مجاناً
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto bg-white flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={loadFromNotes}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              <FileText size={16} />
              استيراد من الملاحظات
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.md" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              رفع ملف (.txt)
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-[200px]">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-medium text-gray-700">النص المراد فحصه:</label>
              <span className="text-xs font-medium text-gray-500">
                عدد الكلمات: {wordCount}
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب النص هنا أو قم باستيراده من ملف أو الملاحظات لفحص نسبة الأصالة..."
              className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all outline-none bg-gray-50 focus:bg-white text-gray-700 leading-relaxed mb-4 min-h-[150px]"
            ></textarea>
          </div>
          
          <button
            onClick={analyzeOriginality}
            disabled={isAnalyzing || !text.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isAnalyzing ? 'جاري الفحص...' : 'بدء الفحص (مجانًا)'}
          </button>

          {analysisResult && (
            <div className="mt-6">
              <h3 className="text-base font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                نتيجة الفحص
              </h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {analysisResult}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs flex gap-2 items-start">
            <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              ملاحظة: هذه الأداة تستخدم الذكاء الاصطناعي لتقديم تحليل <strong>تقديري</strong> للاستلال والأصالة. النتائج ليست بديلاً عن أدوات كشف الانتحال الأكاديمية المتخصصة.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
