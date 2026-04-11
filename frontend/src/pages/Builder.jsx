import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Settings, List, Award, Save, Globe, Lock, Plus, Trash2, AlertCircle, Sparkles, RefreshCcw, Smile, Heart, Zap, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { generateQuizWithAI } from '../lib/mockAI';

const emptyResult = { key: '', title: '', description: '', image: '' };
const emptyOption = { text: '', image: '', scoreMap: {} };
const emptyQuestion = { questionText: '', image: '', options: [{ ...emptyOption }] };

const baseInputStyles = "w-full rounded-xl px-4 py-2.5 outline-none transition-all";
const cardClasses = "bg-white rounded-2xl shadow-sm border border-slate-100 p-6";

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai_wizard');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // AI Wizard State
  const [aiParams, setAiParams] = useState({ prompt: '', tone: 'Playful', questionCount: 5, resultCount: 4, language: 'English' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [aiError, setAiError] = useState('');

  const [quiz, setQuiz] = useState({
    title: '', slug: '', description: '', coverImage: '', theme: 'indigo', category: 'Personality',
    isPublished: false,
    results: [{ ...emptyResult }],
    questions: [{ ...emptyQuestion }]
  });

  const themes = ['indigo', 'rose', 'emerald', 'violet', 'blue'];
  const categories = ['Personality', 'Animals', 'Career', 'Gaming', 'Love', 'Fun'];
  const tones = ['Playful', 'Serious', 'Mysterious', 'Academic', 'Unhinged', 'Gen-Z'];

  useEffect(() => {
    if (id) {
      api.get(`/quizzes/${id}`).then(res => {
        setQuiz(res.data);
        setActiveTab('general'); // default to general if editing
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setError('Failed to load quiz');
        setLoading(false);
      });
    }
  }, [id]);

  const handleChange = (field, value) => {
    setQuiz(prev => ({ ...prev, [field]: value }));
    if(fieldErrors[field]) setFieldErrors(prev => ({...prev, [field]: null}));
  };

  const handleAiAction = async (modifier = null) => {
    setIsGenerating(true);
    setAiError('');
    try {
      const generated = await generateQuizWithAI({ ...aiParams, modifier });
      setQuiz(prev => ({ ...prev, ...generated }));
      setHasGenerated(true);
      setFieldErrors({}); // Clear validation errors safely
    } catch (err) {
      setAiError(err.message || 'AI Generation Failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const validateQuiz = () => {
    let newErrors = {};
    let firstErrorTab = null;

    if (!quiz.title?.trim()) { newErrors.title = 'Please enter a quiz title'; firstErrorTab = firstErrorTab || 'general'; }
    if (!quiz.slug?.trim()) { newErrors.slug = 'Please enter a URL slug'; firstErrorTab = firstErrorTab || 'general'; }

    quiz.results.forEach((r, i) => {
       if (!r.key?.trim()) { newErrors[`result_${i}_key`] = 'Map key is required'; firstErrorTab = firstErrorTab || 'results'; }
       if (!r.title?.trim()) { newErrors[`result_${i}_title`] = 'Outcome title is required'; firstErrorTab = firstErrorTab || 'results'; }
       if (!r.description?.trim()) { newErrors[`result_${i}_desc`] = 'Result description is required'; firstErrorTab = firstErrorTab || 'results'; }
    });

    quiz.questions.forEach((q, qi) => {
       if (!q.questionText?.trim()) { newErrors[`q_${qi}_text`] = 'Question text is required'; firstErrorTab = firstErrorTab || 'questions'; }
       q.options.forEach((opt, oi) => {
          if (!opt.text?.trim()) { newErrors[`q_${qi}_opt_${oi}_text`] = 'Option text is required'; firstErrorTab = firstErrorTab || 'questions'; }
       });
    });

    return { isValid: Object.keys(newErrors).length === 0, newErrors, firstErrorTab };
  };

  const processErrorBlock = (err) => {
    const msg = err.response?.data?.message || 'Something went wrong while saving.';
    setError(msg);
    
    // Auto-scroll to top error area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    
    const { isValid, newErrors, firstErrorTab } = validateQuiz();
    if (!isValid) {
      setFieldErrors(newErrors);
      setActiveTab(firstErrorTab);
      setError('Please complete required fields before saving.');
      setSaving(false);
      return;
    }

    try {
      if (id) {
        const res = await api.put(`/quizzes/${id}`, quiz);
        setQuiz(res.data);
        alert('Changes saved securely!');
      } else {
        const res = await api.post('/quizzes', quiz);
        navigate(`/builder/${res.data._id}`, { replace: true });
        alert('Quiz created successfully!');
      }
    } catch (err) {
      processErrorBlock(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!id) return setError('Save the draft first before publishing!');
    setError('');

    if (!quiz.isPublished) {
       const { isValid, newErrors, firstErrorTab } = validateQuiz();
       if (!isValid) {
         setFieldErrors(newErrors);
         setActiveTab(firstErrorTab);
         setError('Cannot publish. Please complete required fields.');
         return;
       }
    }

    try {
      const res = await api.put(`/quizzes/${id}/publish`);
      setQuiz(res.data);
      if (res.data.isPublished) {
         alert('Your quiz is now LIVE! 🎉');
      } else {
         alert('Returned to draft mode.');
      }
    } catch (err) {
      processErrorBlock(err);
    }
  };

  const getInputClasses = (fieldKey) => {
    return `${baseInputStyles} ${fieldErrors[fieldKey] ? 'bg-amber-50 border-amber-300 focus:ring-amber-400 border-2' : 'bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500'}`;
  };

  const ErrorMessage = ({ fieldKey }) => {
    if (!fieldErrors[fieldKey]) return null;
    return (
      <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mt-1.5">
        <AlertCircle className="w-3.5 h-3.5"/> {fieldErrors[fieldKey]}
      </span>
    );
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Booting up creator tools...</div>;

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-50 h-[calc(100vh-5rem)] overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-sm z-10 overflow-y-auto">
        <div>
           <div className="mb-8 p-4 bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl shadow-xl shadow-indigo-200 relative overflow-hidden">
              <Sparkles className="absolute -top-2 -right-2 w-16 h-16 text-white/10" />
              <h2 className="text-xl font-black text-white relative z-10 leading-tight">Creator Space</h2>
              <p className="text-xs text-indigo-200 mt-1 relative z-10 font-medium">Build your viral quiz natively.</p>
           </div>
           
           <div className="space-y-2">
             <button onClick={() => setActiveTab('ai_wizard')} className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl font-bold transition-colors ${activeTab === 'ai_wizard' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
               <span className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-indigo-500" /> AI Generator</span>
               <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 flex items-center rounded-full uppercase tracking-widest h-5">Beta</span>
             </button>
             <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
               <Settings className="w-5 h-5" /> Base Info
             </button>
             <button onClick={() => setActiveTab('results')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-colors ${activeTab === 'results' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
               <Award className="w-5 h-5" /> Results Setup
             </button>
             <button onClick={() => setActiveTab('questions')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-colors ${activeTab === 'questions' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
               <List className="w-5 h-5" /> Interaction Flow
             </button>
           </div>
        </div>

        <div className="pt-6 border-t border-slate-100 mt-8 space-y-4">
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-amber-800 text-sm font-semibold leading-snug">{error}</span>
            </div>
          )}
          <Button onClick={handleSaveDraft} disabled={saving || isGenerating} variant="secondary" className="w-full shadow-sm">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={handleTogglePublish} disabled={!id || isGenerating} 
            className={`w-full ${quiz.isPublished ? '!bg-emerald-500 !shadow-emerald-200 hover:!bg-emerald-600 border-0' : 'bg-slate-800 hover:bg-slate-700 border-0'} text-white border-0`}
          >
            {quiz.isPublished ? <><Lock className="w-4 h-4 mr-2" /> Revert to Draft</> : <><Globe className="w-4 h-4 mr-2" /> Publish Live</>}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-slate-50/50 block shadow-inner">
        <div className="max-w-3xl mx-auto pb-32 pt-4">

          {activeTab === 'ai_wizard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center max-w-xl mx-auto mb-10">
                 <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-200/50">
                    <Sparkles className="w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">AI Quiz Architect</h2>
                 <p className="text-slate-500 text-lg">Generate a fully mapped, complex personality quiz instantly. Just tell the AI what you want.</p>
              </div>

              {aiError && (
                 <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <p className="font-semibold text-sm">{aiError}</p>
                 </div>
              )}

              <div className={cardClasses + " space-y-6 relative overflow-hidden"}>
                {isGenerating && (
                   <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Sparkles className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                      <p className="text-slate-800 font-bold text-lg">Crafting personality traits...</p>
                      <p className="text-slate-500 text-sm mt-1">This might take a few seconds.</p>
                   </div>
                )}

                <div className="w-full">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Topic or Prompt <span className="text-indigo-500">*</span></label>
                  <textarea 
                    className={baseInputStyles + " bg-slate-50 border border-slate-200 h-28 py-3 text-lg font-medium leading-relaxed placeholder:text-slate-300 resize-none"} 
                    placeholder="e.g. Which type of chaotic programming language are you?" 
                    value={aiParams.prompt} 
                    onChange={e => setAiParams({...aiParams, prompt: e.target.value})} 
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Tone</label>
                     <select className={baseInputStyles + " bg-slate-50 border border-slate-200"} value={aiParams.tone} onChange={e => setAiParams({...aiParams, tone: e.target.value})}>
                       {tones.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                   <div className="w-full sm:w-32">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Questions</label>
                     <input type="number" min="1" max="20" className={baseInputStyles + " bg-slate-50 border border-slate-200"} value={aiParams.questionCount} onChange={e => setAiParams({...aiParams, questionCount: Number(e.target.value)})} />
                   </div>
                   <div className="w-full sm:w-32">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Results</label>
                     <input type="number" min="2" max="10" className={baseInputStyles + " bg-slate-50 border border-slate-200"} value={aiParams.resultCount} onChange={e => setAiParams({...aiParams, resultCount: Number(e.target.value)})} />
                   </div>
                   <div className="w-full sm:w-32">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                     <select className={baseInputStyles + " bg-slate-50 border border-slate-200"} value={aiParams.language} onChange={e => setAiParams({...aiParams, language: e.target.value})}>
                       {['English', 'Spanish', 'French', 'German'].map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                   <Button onClick={() => handleAiAction()} disabled={!aiParams.prompt || isGenerating} size="lg" className="w-full sm:w-auto px-8 py-3.5 shadow-indigo-200">
                     <Sparkles className="w-5 h-5 mr-2" /> Generate Quiz Now
                   </Button>
                </div>
              </div>

              {hasGenerated && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center text-center">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 mb-3 shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <h3 className="font-bold text-indigo-900 text-lg mb-1">Success! Quiz Generated.</h3>
                   <p className="text-indigo-600 text-sm mb-6 max-w-sm">The metadata, score maps, and options have been injected safely into the builder.</p>
                   
                   <p className="text-xs uppercase font-bold text-indigo-400 tracking-widest mb-3">Refine active generation</p>
                   <div className="flex flex-wrap items-center justify-center gap-3">
                     <Button onClick={() => handleAiAction('improve')} variant="secondary" size="sm" className="bg-white px-4">
                        <Zap className="w-4 h-4 mr-2" /> Improve Quality
                     </Button>
                     <Button onClick={() => handleAiAction('funnier')} variant="secondary" size="sm" className="bg-white px-4">
                        <Smile className="w-4 h-4 mr-2" /> Make Funnier
                     </Button>
                     <Button onClick={() => handleAiAction('softer')} variant="secondary" size="sm" className="bg-white px-4">
                        <Heart className="w-4 h-4 mr-2" /> Make Softer
                     </Button>
                     <Button onClick={() => handleAiAction()} variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-100 px-4">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                     </Button>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">Base Info</h2>
                 <p className="text-slate-500 mt-2">Set up the metadata and graphical covers your players will see first.</p>
              </div>
              <div className={cardClasses + " space-y-6"}>
                <div className="w-full">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Title</label>
                  <input type="text" className={getInputClasses('title')} placeholder="E.g. What kind of cat are you?" value={quiz.title} onChange={e => handleChange('title', e.target.value)} />
                  <ErrorMessage fieldKey="title" />
                </div>
                
                <div className="flex gap-4 flex-col sm:flex-row">
                   <div className="flex-1">
                     <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
                     <input type="text" className={getInputClasses('slug') + " font-mono text-sm"} placeholder="what-cat-are-you" value={quiz.slug} onChange={e => handleChange('slug', e.target.value)} />
                     <ErrorMessage fieldKey="slug" />
                   </div>
                   <div className="w-48">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Primary Theme</label>
                     <select className={baseInputStyles + " bg-slate-50 border border-slate-200"} value={quiz.theme} onChange={e => handleChange('theme', e.target.value)}>
                       {themes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                     </select>
                   </div>
                   <div className="w-48">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                     <select className={baseInputStyles + " bg-slate-50 border border-slate-200"} value={quiz.category} onChange={e => handleChange('category', e.target.value)}>
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Fun Description</label>
                  <textarea className={baseInputStyles + " bg-slate-50 border border-slate-200 h-32 py-3"} placeholder="Explain why taking this quiz will change their life..." value={quiz.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image URL</label>
                  <input type="text" className={baseInputStyles + " bg-slate-50 border border-slate-200"} placeholder="https://..." value={quiz.coverImage} onChange={e => handleChange('coverImage', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Results Setup</h2>
                  <p className="text-slate-500 mt-2">Define your final outcomes. Later, you'll map answers to these keys.</p>
                </div>
                <Button onClick={() => handleChange('results', [...quiz.results, { ...emptyResult, key: `res_${Date.now()}` }])} variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-1"/> Add Outcome
                </Button>
              </div>

              <div className="space-y-6">
                {quiz.results.map((r, i) => (
                  <div key={i} className={cardClasses + " flex flex-col md:flex-row gap-8 relative group border-t-4 border-t-indigo-400"}>
                    <button onClick={() => handleChange('results', quiz.results.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hidden group-hover:block transition-colors">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                    <div className="flex-1 space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Map Key (Identifier)</label>
                        <input type="text" className={getInputClasses(`result_${i}_key`) + " font-mono text-xs py-2"} placeholder="e.g. orange_cat" value={r.key} onChange={e => { const nm = [...quiz.results]; nm[i].key = e.target.value; handleChange('results', nm); if(fieldErrors[`result_${i}_key`]) setFieldErrors(p => ({...p, [`result_${i}_key`]: null})) }} />
                        <ErrorMessage fieldKey={`result_${i}_key`} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Outcome Title</label>
                        <input type="text" className={getInputClasses(`result_${i}_title`) + " font-bold text-lg text-indigo-900"} placeholder="Orange Cat Energy" value={r.title} onChange={e => { const nm = [...quiz.results]; nm[i].title = e.target.value; handleChange('results', nm); if(fieldErrors[`result_${i}_title`]) setFieldErrors(p => ({...p, [`result_${i}_title`]: null})) }} />
                        <ErrorMessage fieldKey={`result_${i}_title`} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Result Description</label>
                        <textarea className={getInputClasses(`result_${i}_desc`) + " h-24 text-sm"} placeholder="You are chaotic but lovable. People enjoy your energy." value={r.description} onChange={e => { const nm = [...quiz.results]; nm[i].description = e.target.value; handleChange('results', nm); if(fieldErrors[`result_${i}_desc`]) setFieldErrors(p => ({...p, [`result_${i}_desc`]: null})) }} />
                        <ErrorMessage fieldKey={`result_${i}_desc`} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Visual Card Image URL</label>
                        <input type="text" className={baseInputStyles + " bg-slate-50 border border-slate-200 text-sm font-mono"} placeholder="https://..." value={r.image} onChange={e => { const nm = [...quiz.results]; nm[i].image = e.target.value; handleChange('results', nm); }} />
                      </div>
                    </div>
                    {r.image && (
                      <div className="w-full md:w-48 h-48 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src={r.image} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Interaction Flow</h2>
                  <p className="text-slate-500 mt-2">Add questions and choose how replies influence final outcomes.</p>
                </div>
                <Button onClick={() => handleChange('questions', [...quiz.questions, { ...emptyQuestion, options: [{ ...emptyOption }] }])} variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-1"/> Add Question
                </Button>
              </div>

              <div className="space-y-8">
                {quiz.questions.map((q, qi) => (
                  <div key={qi} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 w-full">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Question {qi + 1}</label>
                         <input type="text" className={`w-full bg-transparent text-xl font-black ${fieldErrors[`q_${qi}_text`] ? 'text-amber-600 border-b-2 border-amber-300' : 'text-slate-800'} outline-none placeholder-slate-300`} placeholder="e.g. How do you spend your weekends?" value={q.questionText} onChange={e => { const nq = [...quiz.questions]; nq[qi].questionText = e.target.value; handleChange('questions', nq); if(fieldErrors[`q_${qi}_text`]) setFieldErrors(p => ({...p, [`q_${qi}_text`]: null})) }} />
                         <ErrorMessage fieldKey={`q_${qi}_text`} />
                      </div>
                      <button onClick={() => handleChange('questions', quiz.questions.filter((_, idx) => idx !== qi))} className="w-10 h-10 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-all hover:scale-105 active:scale-95">
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </div>
                    
                    <div className="p-6">
                       <label className="block text-sm font-bold text-slate-700 mb-1.5">Header Image URL (Optional)</label>
                       <input type="text" className={baseInputStyles + " bg-slate-50 border border-slate-200 text-sm mb-6"} placeholder="https://..." value={q.image} onChange={e => { const nq = [...quiz.questions]; nq[qi].image = e.target.value; handleChange('questions', nq); }} />

                       <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg text-slate-800">Dynamic Options</h4>
                          <Button onClick={() => { const nq = [...quiz.questions]; nq[qi].options.push({ ...emptyOption }); handleChange('questions', nq); }} variant="ghost" size="sm" className="text-indigo-600">
                             <Plus className="w-4 h-4 mr-1"/> Add Option
                          </Button>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                         {q.options.map((opt, oi) => (
                           <div key={oi} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
                             <button onClick={() => { const nq = [...quiz.questions]; nq[qi].options = nq[qi].options.filter((_, idx) => idx !== oi); handleChange('questions', nq); }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                               <Trash2 className="w-5 h-5"/>
                             </button>
                             
                             <div className="pr-10 mb-4">
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Option Text</label>
                               <input type="text" className={getInputClasses(`q_${qi}_opt_${oi}_text`)} placeholder="I sleep all day" value={opt.text} onChange={e => { const nq = [...quiz.questions]; nq[qi].options[oi].text = e.target.value; handleChange('questions', nq); if(fieldErrors[`q_${qi}_opt_${oi}_text`]) setFieldErrors(p => ({...p, [`q_${qi}_opt_${oi}_text`]: null})) }} />
                               <ErrorMessage fieldKey={`q_${qi}_opt_${oi}_text`} />
                             </div>
                             
                             {/* Score Mapping Box */}
                             <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Map to Outcomes (Score Vector)</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {quiz.results.map((r, ri) => (
                                     r.key && (
                                        <div key={ri} className="flex flex-col gap-1 relative group">
                                           <span className="text-[10px] font-bold text-slate-400 truncate w-full block text-center uppercase tracking-wider">{r.key}</span>
                                           <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-indigo-700 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors group-hover:border-indigo-200" placeholder="0" 
                                             value={opt.scoreMap?.[r.key] || ''} 
                                             onChange={e => {
                                               const val = e.target.value;
                                               const nq = [...quiz.questions];
                                               if (!nq[qi].options[oi].scoreMap) nq[qi].options[oi].scoreMap = {};
                                               nq[qi].options[oi].scoreMap[r.key] = val === '' ? 0 : Number(val);
                                               handleChange('questions', nq);
                                             }} 
                                           />
                                        </div>
                                     )
                                  ))}
                                </div>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
