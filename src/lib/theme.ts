export const getThemeColor = (tab: string) => {
  switch (tab) {
    case 'research':
      return {
        light: 'bg-indigo-100 text-indigo-600',
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-100',
        outline: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 focus:ring-indigo-50',
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        ring: 'focus:ring-indigo-500',
        tabActive: 'bg-white text-indigo-700 shadow border-b-2 border-indigo-600',
        stepCompleted: 'bg-indigo-50 border-indigo-200',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        progressBar: 'bg-indigo-600',
      };
    case 'review':
      return {
        light: 'bg-emerald-100 text-emerald-600',
        primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-100',
        outline: 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 focus:ring-emerald-50',
        text: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        ring: 'focus:ring-emerald-500',
        tabActive: 'bg-white text-emerald-700 shadow border-b-2 border-emerald-600',
        stepCompleted: 'bg-emerald-50 border-emerald-200',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        progressBar: 'bg-emerald-600',
      };
    case 'case_study':
      return {
        light: 'bg-amber-100 text-amber-600',
        primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-100',
        outline: 'text-amber-600 border-amber-200 hover:bg-amber-50 focus:ring-amber-50',
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'focus:ring-amber-500',
        tabActive: 'bg-white text-amber-700 shadow border-b-2 border-amber-600',
        stepCompleted: 'bg-amber-50 border-amber-200',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-100',
        progressBar: 'bg-amber-600',
      };
    case 'opinion':
      return {
        light: 'bg-rose-100 text-rose-600',
        primary: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-100',
        outline: 'text-rose-600 border-rose-200 hover:bg-rose-50 focus:ring-rose-50',
        text: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        ring: 'focus:ring-rose-500',
        tabActive: 'bg-white text-rose-700 shadow border-b-2 border-rose-600',
        stepCompleted: 'bg-rose-50 border-rose-200',
        icon: 'text-rose-600',
        iconBg: 'bg-rose-100',
        progressBar: 'bg-rose-600',
      };
    default:
      return {
        light: 'bg-indigo-100 text-indigo-600',
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-100',
        outline: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 focus:ring-indigo-50',
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        ring: 'focus:ring-indigo-500',
        tabActive: 'bg-white text-indigo-700 shadow border-b-2 border-indigo-600',
        stepCompleted: 'bg-indigo-50 border-indigo-200',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        progressBar: 'bg-indigo-600',
      };
  }
};
