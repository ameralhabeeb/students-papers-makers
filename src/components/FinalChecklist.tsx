import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { ArticleType } from '../data/steps';
import { getThemeColor } from '../lib/theme';

interface FinalChecklistProps {
  completedItems: string[];
  onToggleItem: (item: string) => void;
  activeTab: ArticleType;
}

export const FinalChecklist: React.FC<FinalChecklistProps> = ({ completedItems, onToggleItem, activeTab }) => {
  const checklist = [
    { id: 'formatting', label: 'التنسيق (Formatting)', description: 'التأكد من التنسيق العام والهوامش ونوع الخط.' },
    { id: 'proofreading', label: 'التدقيق اللغوي (Proofreading)', description: 'مراجعة الأخطاء الإملائية والنحوية وعلامات الترقيم.' },
    { id: 'plagiarism', label: 'فحص الانتحال (Plagiarism Check)', description: 'التأكد من أصالة المحتوى وخلوه من الانتحال.' },
    { id: 'word_count', label: 'الالتزام بعدد الكلمات', description: 'التأكد من أن النص ضمن الحد المطلوب للكلمات.' },
    { id: 'citations', label: 'مراجعة الاقتباسات', description: 'التأكد من توثيق جميع المصادر بشكل صحيح.' }
  ];

  const theme = getThemeColor(activeTab);

  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">قائمة المراجعة النهائية (قبل التسليم)</h3>
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {checklist.map((item, index) => {
          const isCompleted = completedItems.includes(item.id);
          return (
            <div 
              key={item.id}
              className={`p-4 flex items-start gap-4 transition-colors cursor-pointer ${
                index !== checklist.length - 1 ? 'border-b border-gray-100' : ''
              } ${isCompleted ? theme.bg : 'hover:bg-white'}`}
              onClick={() => onToggleItem(item.id)}
            >
              <button 
                className={`mt-0.5 flex-shrink-0 transition-colors ${
                  isCompleted ? theme.text : 'text-gray-400'
                } hover:opacity-80`}
              >
                {isCompleted ? <CheckCircle size={22} className={theme.text} /> : <Circle size={22} />}
              </button>
              <div>
                <h4 className={`text-base font-semibold ${isCompleted ? `${theme.text} line-through opacity-70` : 'text-gray-800'}`}>
                  {item.label}
                </h4>
                <p className={`text-sm mt-1 ${isCompleted ? `${theme.text} opacity-70` : 'text-gray-500'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
