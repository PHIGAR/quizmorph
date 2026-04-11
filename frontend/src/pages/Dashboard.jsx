import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Settings, Share2, Trash2, Globe, FileEdit, BarChart } from 'lucide-react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import ShareModal from '../components/ShareModal';
import clsx from 'clsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'drafts'

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes/my');
      setQuizzes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
      try {
        await api.delete(`/quizzes/${id}`);
        setQuizzes(quizzes.filter(q => q._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const [shareConfig, setShareConfig] = useState(null);

  const handleShare = (quiz) => {
    const url = `${window.location.origin}/quiz/${quiz.slug}`;
    setShareConfig({
       isOpen: true,
       shareUrl: url,
       title: quiz.title,
       text: quiz.description || t('dashboard.sharePlaceholder', { defaultValue: "Take my interactive personality quiz on QuizMorph!" }),
       // We don't pass elementIdToDownload for the dashboard link since there's no visual result card active
       elementIdToDownload: null
    });
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuizzes = quizzes.filter(q => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'published' && q.isPublished) || 
                      (activeTab === 'drafts' && !q.isPublished);
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-50/50 py-12 px-6">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        
        {/* Dashboard Header / Creator Hub */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 md:p-14 overflow-hidden relative shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{t('dashboard.welcome')}, {user.username}!</h1>
              <p className="text-indigo-200 text-lg">{t('dashboard.hubDesc')}</p>
            </div>
            <Link to="/builder">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 border-0 shadow-xl shadow-black/20 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('dashboard.createNew')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row Mock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BarChart className="w-6 h-6"/></div>
             <div><p className="text-slate-500 text-sm font-medium">{t('dashboard.totalPlays')}</p><p className="text-2xl font-bold">1,248</p></div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Globe className="w-6 h-6"/></div>
             <div><p className="text-slate-500 text-sm font-medium">{t('dashboard.published')}</p><p className="text-2xl font-bold">{quizzes.filter(q=>q.isPublished).length}</p></div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><FileEdit className="w-6 h-6"/></div>
             <div><p className="text-slate-500 text-sm font-medium">{t('dashboard.drafts')}</p><p className="text-2xl font-bold">{quizzes.filter(q=>!q.isPublished).length}</p></div>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-6">
              <button onClick={() => setActiveTab('all')} className={clsx("font-bold text-sm tracking-wide uppercase transition-colors relative", activeTab === 'all' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600')}>
                {t('dashboard.allQuizzes')}
                {activeTab === 'all' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"/>}
              </button>
              <button onClick={() => setActiveTab('published')} className={clsx("font-bold text-sm tracking-wide uppercase transition-colors relative", activeTab === 'published' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600')}>
                {t('dashboard.published')}
                {activeTab === 'published' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"/>}
              </button>
              <button onClick={() => setActiveTab('drafts')} className={clsx("font-bold text-sm tracking-wide uppercase transition-colors relative", activeTab === 'drafts' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600')}>
                {t('dashboard.drafts')}
                {activeTab === 'drafts' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"/>}
              </button>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('dashboard.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full md:w-64 transition-all focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-12 animate-pulse">{t('common.loading')}</div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="bg-white p-4 rounded-full mb-4 shadow-sm border border-slate-100">
                <Plus className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboard.noContent')}</h3>
              <p className="text-slate-500 mb-6 max-w-sm">{t('dashboard.noContentDesc')}</p>
              <Link to="/builder">
                <Button>{t('dashboard.createNew')}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredQuizzes.map(quiz => (
                <div key={quiz._id} className="bg-slate-50 rounded-2xl hover:bg-slate-100/80 transition-colors border border-slate-200/60 p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center group">
                  <div className="w-20 h-20 rounded-xl bg-slate-200 shrink-0 overflow-hidden relative">
                    {quiz.coverImage ? (
                      <img src={quiz.coverImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className={`w-full h-full bg-${quiz.theme}-100 flex items-center justify-center`}>
                        <Globe className={`w-8 h-8 text-${quiz.theme}-300`} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{quiz.title}</h3>
                      {quiz.isPublished ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                          {t('dashboard.statusLive')}
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                          {t('dashboard.statusDraft')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm truncate mb-3">{quiz.description || t('dashboard.noDesc')}</p>
                    <div className="flex flex-wrap gap-2">
                       <Link to={`/builder/${quiz._id}`}>
                          <Button variant="secondary" size="sm" className="px-3 py-1.5 text-xs shadow-none">
                            <Settings className="w-3.5 h-3.5 mr-1.5" /> {t('dashboard.btnEdit')}
                          </Button>
                       </Link>
                       {quiz.isPublished && (
                         <Button variant="secondary" size="sm" onClick={() => handleShare(quiz)} className="px-3 py-1.5 text-xs shadow-none hover:text-emerald-600 border-slate-200">
                           <Share2 className="w-3.5 h-3.5 mr-1.5" /> {t('dashboard.btnShare')}
                         </Button>
                       )}
                       <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz._id)} className="px-3 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                         <Trash2 className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Share Modal */}
        {shareConfig && (
           <ShareModal 
              isOpen={shareConfig.isOpen}
              onClose={() => setShareConfig(null)}
              shareUrl={shareConfig.shareUrl}
              title={shareConfig.title}
              text={shareConfig.text}
              elementIdToDownload={null}
           />
        )}
      </div>
    </div>
  );
}
