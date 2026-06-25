import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { Step, ArticleType } from '../data/steps';
import { getThemeColor } from '../lib/theme';

interface StepListProps {
  steps: Step[];
  completedStepIds: number[];
  onToggleStep: (stepId: number) => void;
  activeTab: ArticleType;
}

export const StepList: React.FC<StepListProps> = ({ steps, completedStepIds, onToggleStep, activeTab }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const theme = getThemeColor(activeTab);

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const isCompleted = completedStepIds.includes(step.id);
        
        return (
          <div 
            key={step.id} 
            className={`bg-white p-4 rounded-lg shadow-sm border flex gap-4 relative transition-colors ${
              isCompleted ? theme.stepCompleted : `border-gray-100 hover:${theme.border}`
            }`}
            onMouseEnter={() => setActiveTooltip(step.id)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button 
              onClick={() => onToggleStep(step.id)}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isCompleted 
                  ? theme.primary 
                  : `${theme.iconBg} ${theme.icon} hover:bg-opacity-80`
              } font-bold cursor-pointer shadow-sm`}
              title={isCompleted ? 'تحديد كغير مكتمل' : 'تحديد كمكتمل'}
            >
              {isCompleted ? <Check size={18} strokeWidth={3} /> : step.id}
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {step.title}
                </h3>
                {step.tip && (
                  <div className="relative flex items-center print:hidden">
                    <Info size={18} className={`${isCompleted ? 'text-gray-400' : theme.icon} hover:opacity-80 cursor-help`} />
                    {/* Tooltip visible on hover */}
                    <div 
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 transition-all duration-200 pointer-events-none ${
                        activeTooltip === step.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                      }`}
                    >
                      {step.tip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
