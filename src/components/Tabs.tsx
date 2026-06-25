import React from 'react';
import { ArticleType } from '../data/steps';
import { getThemeColor } from '../lib/theme';

interface TabsProps {
  activeTab: ArticleType;
  onChange: (tab: ArticleType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange }) => {
  const tabs: { id: ArticleType; label: string }[] = [
    { id: 'research', label: 'مقالة بحثية' },
    { id: 'review', label: 'مراجعة علمية' },
    { id: 'case_study', label: 'دراسة حالة' },
    { id: 'opinion', label: 'مقالة رأي' }
  ];

  return (
    <div className="flex space-x-1 space-x-reverse bg-gray-100 p-1 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-hide">
      {tabs.map(tab => {
        const theme = getThemeColor(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? theme.tabActive
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
