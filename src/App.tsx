import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { BookOpen, FileText, CheckCircle, StickyNote, Quote, Printer, Sparkles } from 'lucide-react';
import { initAuth, googleSignIn, getAccessToken } from './lib/auth';
import { createGoogleDocWithOutline } from './lib/docs';
import { saveUserDataToCloud, subscribeToUserData } from './lib/sync';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { Tabs } from './components/Tabs';
import { StepList } from './components/StepList';
import { NotesDrawer } from './components/NotesDrawer';
import { CitationDrawer } from './components/CitationDrawer';
import { FinalChecklist } from './components/FinalChecklist';
import { OriginalityDrawer } from './components/OriginalityDrawer';
import { 
  researchSteps, reviewSteps, caseStudySteps, opinionSteps,
  getResearchOutlineText, getReviewOutlineText, getCaseStudyOutlineText, getOpinionOutlineText, 
  ArticleType, FormatStyle 
} from './data/steps';
import { getThemeColor } from './lib/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<ArticleType>('research');
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('academic');
  const [needsAuth, setNeedsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [isOriginalityOpen, setIsOriginalityOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({
    research: [],
    review: [],
    case_study: [],
    opinion: []
  });
  const [completedChecklists, setCompletedChecklists] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState(() => localStorage.getItem('research_notes') || '');

  useEffect(() => {
    const saved = localStorage.getItem('completed_steps');
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch(e) {}
    }
    const savedChecklists = localStorage.getItem('completed_checklists');
    if (savedChecklists) {
      try {
        setCompletedChecklists(JSON.parse(savedChecklists));
      } catch(e) {}
    }
    const unsubscribe = initAuth(
      (user, _token) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserData(user.uid, (data) => {
        if (data.completedSteps && Object.keys(data.completedSteps).length > 0) {
          setCompletedSteps(data.completedSteps);
          localStorage.setItem('completed_steps', JSON.stringify(data.completedSteps));
        }
        if (data.completedChecklists && Object.keys(data.completedChecklists).length > 0) {
          setCompletedChecklists(data.completedChecklists);
          localStorage.setItem('completed_checklists', JSON.stringify(data.completedChecklists));
        }
        if (data.notes !== undefined) {
          setNotes(data.notes);
          localStorage.setItem('research_notes', data.notes);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleToggleStep = (stepId: number) => {
    setCompletedSteps(prev => {
      const tabSteps = prev[activeTab] || [];
      const isCompleted = tabSteps.includes(stepId);
      const newTabSteps = isCompleted ? tabSteps.filter(id => id !== stepId) : [...tabSteps, stepId];
      const newState = { ...prev, [activeTab]: newTabSteps };
      localStorage.setItem('completed_steps', JSON.stringify(newState));
      
      if (user) {
        saveUserDataToCloud(user.uid, { completedSteps: newState }).catch(console.error);
      }
      
      return newState;
    });
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setCompletedChecklists(prev => {
      const tabItems = prev[activeTab] || [];
      const isCompleted = tabItems.includes(itemId);
      const newTabItems = isCompleted ? tabItems.filter(id => id !== itemId) : [...tabItems, itemId];
      const newState = { ...prev, [activeTab]: newTabItems };
      localStorage.setItem('completed_checklists', JSON.stringify(newState));
      
      if (user) {
        saveUserDataToCloud(user.uid, { completedChecklists: newState }).catch(console.error);
      }
      
      return newState;
    });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    localStorage.setItem('research_notes', newNotes);
  };

  const handleNotesSave = () => {
    if (user) {
      saveUserDataToCloud(user.uid, { notes }).catch(console.error);
    }
  };

  const currentStepsList = activeTab === 'research' ? researchSteps : 
                           activeTab === 'review' ? reviewSteps : 
                           activeTab === 'case_study' ? caseStudySteps : 
                           opinionSteps;
                           
  const currentCompleted = completedSteps[activeTab] || [];
  const progressPercentage = currentStepsList.length > 0 
    ? Math.round((currentCompleted.length / currentStepsList.length) * 100) 
    : 0;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGenerateDoc = async () => {
    setError(null);
    setGeneratedDocId(null);
    setIsGenerating(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        throw new Error('Please sign in first');
      }

      let title = '';
      let text = '';
      if (activeTab === 'research') {
        title = 'هيكل المقالة البحثية';
        text = getResearchOutlineText(formatStyle);
      } else if (activeTab === 'review') {
        title = 'هيكل مقالة المراجعة';
        text = getReviewOutlineText(formatStyle);
      } else if (activeTab === 'case_study') {
        title = 'هيكل دراسة الحالة';
        text = getCaseStudyOutlineText(formatStyle);
      } else if (activeTab === 'opinion') {
        title = 'هيكل مقالة الرأي';
        text = getOpinionOutlineText(formatStyle);
      }
      
      const docId = await createGoogleDocWithOutline(token, title, text);
      setGeneratedDocId(docId);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError('حدث خطأ أثناء إنشاء المستند. تأكد من منح الصلاحيات اللازمة.');
    } finally {
      setIsGenerating(false);
    }
  };

  const theme = getThemeColor(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme.light}`}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">دليل الكتابة العلمية</h1>
              <p className="text-sm text-gray-500">خطوات ومسودات جاهزة لأبحاثك</p>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.displayName || user.email}</span>
                {user.photoURL && (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
                )}
              </div>
            ) : (
              <GoogleSignInButton onClick={handleLogin} isLoading={isLoggingIn} />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 print:hidden">
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {activeTab === 'research' ? 'خطوات كتابة مقالة بحثية' :
                   activeTab === 'review' ? 'خطوات كتابة مراجعة علمية' :
                   activeTab === 'case_study' ? 'خطوات كتابة دراسة حالة' :
                   'خطوات كتابة مقالة رأي'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'research' ? 'اتبع هذه الخطوات بالترتيب لضمان جودة بحثك العلمي.' :
                   activeTab === 'review' ? 'دليلك لعمل مراجعة منهجية شاملة للأدبيات السابقة.' :
                   activeTab === 'case_study' ? 'خطوات تحليل موقف أو مشكلة للوصول لاستنتاجات عملية.' :
                   'كيف تبني حجة قوية وتدافع عن وجهة نظرك باحترافية.'}
                </p>
              </div>
              <div className="flex-shrink-0 w-full lg:w-auto flex flex-col lg:flex-row gap-3 print:hidden items-stretch lg:items-center">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={formatStyle}
                    onChange={(e) => setFormatStyle(e.target.value as FormatStyle)}
                    className={`w-full sm:w-auto bg-white border border-gray-200 text-gray-700 text-sm rounded-lg ${theme.ring} focus:border-transparent block px-3 py-2.5 outline-none shadow-sm cursor-pointer`}
                  >
                    <option value="academic">أكاديمي (Academic)</option>
                    <option value="journalistic">صحفي (Journalistic)</option>
                    <option value="tech_blog">مدونة تقنية (Tech Blog)</option>
                  </select>
                  <button
                    onClick={() => window.print()}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm border ${theme.outline}`}
                  >
                    <Printer size={18} />
                    طباعة
                  </button>
                  <button
                    onClick={() => setIsCitationOpen(true)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm border ${theme.outline}`}
                  >
                    <Quote size={18} />
                    اقتباس
                  </button>
                  <button
                    onClick={() => setIsOriginalityOpen(true)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm border ${theme.outline}`}
                    title="فحص نسبة الاستلال والذكاء الاصطناعي"
                  >
                    <Sparkles size={18} />
                    فحص الأصالة
                  </button>
                  <button
                    onClick={() => setIsNotesOpen(true)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm border ${theme.outline}`}
                  >
                    <StickyNote size={18} />
                    الملاحظات
                  </button>
                </div>
                {!needsAuth ? (
                  <button
                    onClick={handleGenerateDoc}
                    disabled={isGenerating}
                    className={`w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-70 whitespace-nowrap ${theme.primary}`}
                  >
                    <FileText size={18} />
                    {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الهيكل'}
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-gray-500">سجل الدخول لإنشاء مستند</p>
                    <GoogleSignInButton onClick={handleLogin} isLoading={isLoggingIn} />
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">نسبة الإنجاز</span>
                <span className={`text-sm font-bold ${theme.text}`}>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`${theme.progressBar} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
              {error}
            </div>
          )}
          
          {generatedDocId && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <h3 className="font-medium text-green-800">تم إنشاء المستند بنجاح!</h3>
                  <p className="text-sm text-green-600 mt-0.5">يمكنك الآن البدء في الكتابة على الهيكل الجاهز.</p>
                </div>
              </div>
              <a
                href={`https://docs.google.com/document/d/${generatedDocId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-green-700 text-sm font-medium rounded border border-green-200 hover:bg-green-50 transition-colors"
              >
                فتح المستند
              </a>
            </div>
          )}

          <div className="p-6">
            <StepList 
              steps={currentStepsList} 
              completedStepIds={currentCompleted}
              onToggleStep={handleToggleStep}
              activeTab={activeTab}
            />
            <FinalChecklist
              completedItems={completedChecklists[activeTab] || []}
              onToggleItem={handleToggleChecklistItem}
              activeTab={activeTab}
            />
          </div>
        </div>
      </main>

      <NotesDrawer 
        isOpen={isNotesOpen} 
        onClose={() => setIsNotesOpen(false)} 
        notes={notes}
        onChange={handleNotesChange}
        onSave={handleNotesSave}
        isLoggedIn={!!user}
      />
      <CitationDrawer isOpen={isCitationOpen} onClose={() => setIsCitationOpen(false)} />
      <OriginalityDrawer 
        isOpen={isOriginalityOpen} 
        onClose={() => setIsOriginalityOpen(false)} 
        notes={notes}
      />
    </div>
  );
}
