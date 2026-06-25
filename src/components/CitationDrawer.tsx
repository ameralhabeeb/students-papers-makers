import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Save, List, Plus } from 'lucide-react';

interface CitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [format, setFormat] = useState<'APA' | 'MLA'>('APA');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState<number | boolean>(false);
  const [savedCitations, setSavedCitations] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('saved_citations');
    if (saved) {
      try {
        setSavedCitations(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCitations = (newCitations: string[]) => {
    setSavedCitations(newCitations);
    localStorage.setItem('saved_citations', JSON.stringify(newCitations));
  };

  const generateCitationText = () => {
    if (!author && !year && !title && !source && !url) return '';
    
    if (format === 'APA') {
      const authorText = author ? `${author}. ` : '';
      const yearText = year ? `(${year}). ` : '';
      const titleText = title ? `${title}. ` : '';
      const sourceText = source ? `${source}. ` : '';
      const urlText = url ? url : '';
      return `${authorText}${yearText}${titleText}${sourceText}${urlText}`.trim();
    } else {
      const authorText = author ? `${author}. ` : '';
      const titleText = title ? `"${title}." ` : '';
      const sourceText = source ? `${source}, ` : '';
      const yearText = year ? `${year}, ` : '';
      const urlText = url ? url : '';
      const result = `${authorText}${titleText}${sourceText}${yearText}${urlText}`.replace(/, $/, '.').trim();
      return result.endsWith('.') || !result ? result : result + '.';
    }
  };

  const generated = generateCitationText();

  const handleCopy = (text: string, index: number | boolean = true) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCitation = () => {
    if (!generated) return;
    saveCitations([...savedCitations, generated]);
    // clear form
    setAuthor('');
    setYear('');
    setTitle('');
    setSource('');
    setUrl('');
    setActiveTab('saved');
  };

  const handleRemoveCitation = (index: number) => {
    const newCitations = savedCitations.filter((_, i) => i !== index);
    saveCitations(newCitations);
  };

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
            <h2 className="text-lg font-bold text-gray-800">توليد الاقتباسات</h2>
            <p className="text-xs text-gray-500 mt-1">إدارة وتنسيق المصادر</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 bg-white">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'create' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus size={16} />
            إضافة مصدر
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'saved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={16} />
            المصادر المحفوظة ({savedCitations.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {activeTab === 'create' ? (
            <div className="p-5 space-y-5">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setFormat('APA')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
                    format === 'APA' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  APA
                </button>
                <button
                  onClick={() => setFormat('MLA')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
                    format === 'MLA' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  MLA
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المؤلف (الاسم الأخير، الأول)</label>
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="مثال: Smith, J." className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سنة النشر</label>
                  <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="مثال: 2023" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان العمل</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: تأثير الذكاء الاصطناعي" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المصدر (المجلة، الناشر)</label>
                  <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="مثال: مجلة التكنولوجيا الحديثة" className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرابط (URL / DOI)</label>
                  <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="مثال: https://..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white text-left" dir="ltr" />
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">الاقتباس المولد:</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 break-words leading-relaxed text-left" dir="ltr">
                  {generated ? (
                    <span>
                      {author && `${author}. `}
                      {format === 'APA' && year && `(${year}). `}
                      {title && (format === 'APA' ? `${title}. ` : `"${title}." `)}
                      {source && <i className="mr-1">{source}{format === 'APA' ? '.' : ','}</i>}
                      {format === 'MLA' && year && ` ${year},`}
                      {url && ` ${url}`}
                      {(format === 'MLA' && !url) && '.'}
                    </span>
                  ) : (
                    <span className="text-gray-400">ابدأ بإدخال البيانات أعلاه...</span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleCopy(generated, true)}
                    disabled={!generated}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {copied === true ? <Check size={18} /> : <Copy size={18} />}
                    {copied === true ? 'تم النسخ!' : 'نسخ'}
                  </button>
                  <button
                    onClick={handleSaveCitation}
                    disabled={!generated}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
                  >
                    <Save size={18} />
                    حفظ المصدر
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5">
              {savedCitations.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-gray-50 text-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <List size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">لم تقم بحفظ أي مصادر بعد.</p>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="text-indigo-600 text-sm font-medium mt-2 hover:underline"
                  >
                    أضف مصدرك الأول
                  </button>
                </div>
              ) : (
                <ol className="space-y-4 list-decimal list-inside text-gray-800 text-sm" dir="ltr">
                  {savedCitations.map((citation, index) => (
                    <li key={index} className="p-4 bg-gray-50 border border-gray-100 rounded-lg group relative break-words leading-relaxed marker:text-indigo-600 marker:font-bold">
                      <span className="inline-block ml-2">{citation}</span>
                      <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button
                          onClick={() => handleCopy(citation, index)}
                          className="p-1.5 bg-white text-gray-500 hover:text-indigo-600 rounded border border-gray-200 shadow-sm"
                          title="نسخ"
                        >
                          {copied === index ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => handleRemoveCitation(index)}
                          className="p-1.5 bg-white text-gray-500 hover:text-red-600 rounded border border-gray-200 shadow-sm"
                          title="حذف"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
