import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, RefreshCw, Share2, Award, Home, Compass, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Button from '../components/ui/Button';
import ShareModal from '../components/ShareModal';

export default function Player() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // state: 'start' | 'questions' | 'result'
  const [gameState, setGameState] = useState('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Format: { questionId: selectedOptionId }
  const [answers, setAnswers] = useState({});
  const [finalResult, setFinalResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/slug/${slug}`).then(res => {
      setQuiz(res.data);
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.message || 'Quiz not found or not published.');
      setLoading(false);
    });
  }, [slug]);

  const handleStart = () => {
     if (!quiz.questions || quiz.questions.length === 0) {
        alert("This quiz has no mapped questions yet. The creator needs to finish building it!");
        return;
     }
     if (!quiz.results || quiz.results.length === 0) {
        alert("This quiz has no mapped outcomes. The creator needs to finish building it!");
        return;
     }
     setGameState('questions');
  };

  const handleSelectOption = (questionId, optionId) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);
    
    // Auto-advance safely
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 350);
    } else {
      // Calculate explicitly with the new array representation so we don't hit React closure bugs
      setTimeout(() => calculateAndSubmitResult(newAnswers), 350);
    }
  };

  const calculateAndSubmitResult = async (finalAnswersMap) => {
    setGameState('result');
    setSubmitting(true);
    
    try {
      // Defensive checks
      if (!quiz.results || quiz.results.length === 0) throw new Error("Missing outcome vectors");

      // 1. Calculate Scores explicitly
      const scores = {};
      quiz.results.forEach(r => {
         if (r.key) scores[r.key] = 0;
      });

      const matchSelectedOptionsData = [];

      // If older quizzes don't have questions mapped perfectly, fail soft.
      if (quiz.questions) {
        quiz.questions.forEach(q => {
           const selectedOptId = finalAnswersMap[q._id];
           if (selectedOptId) {
              matchSelectedOptionsData.push({ questionId: q._id, optionId: selectedOptId });
              const opt = q.options.find(o => o._id === selectedOptId);
              if (opt && opt.scoreMap) {
                 Object.keys(opt.scoreMap).forEach(key => {
                    const addAmount = Number(opt.scoreMap[key]);
                    if (!isNaN(addAmount) && scores[key] !== undefined) {
                       scores[key] += addAmount;
                    }
                 });
              }
           }
        });
      }

      // 2. Deterministic highest score logic mapping
      let highestKey = null;
      let highestScore = -Infinity;
      
      const keys = Object.keys(scores).sort(); // Sort keys alphabetically for deterministic ties
      keys.forEach(key => {
         if (scores[key] > highestScore) {
            highestScore = scores[key];
            highestKey = key;
         }
      });

      // Default to the first known result if mathematics completely failed or tied cleanly on zero
      if (!highestKey && quiz.results?.length > 0) {
         highestKey = quiz.results[0].key;
      }

      const resultData = quiz.results?.find(r => r.key === highestKey) || (quiz.results?.length > 0 ? quiz.results[0] : null);
      
      if (!resultData) {
         throw new Error("Outcome failure. No result data resolved.");
      }

      setFinalResult(resultData);

      // 3. Submit Attempt asynchronously mapping directly to the Mongo pipeline
      await api.post(`/attempts/${quiz._id}`, {
         resultKey: highestKey,
         selectedOptions: matchSelectedOptionsData
      });

    } catch(e) {
      console.error('Failed calculation:', e);
      // Let it crash softly to fallback UI
      setFinalResult(null); 
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold tracking-wide">Loading interactive experience...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
         <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-md w-full border border-slate-100">
            <Compass className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Quiz Unreachable</h2>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">{error || 'This interactive instance could not be dynamically resolved. It may have been deleted or turned into a draft.'}</p>
            <div className="flex gap-3 w-full">
               <Link to="/" className="flex-1"><Button variant="secondary" className="w-full shadow-none"><Home className="w-4 h-4 mr-2"/> Home</Button></Link>
               <Link to="/explore" className="flex-1"><Button className="w-full"><Compass className="w-4 h-4 mr-2"/> Explore</Button></Link>
            </div>
         </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const progressPercent = quiz.questions.length > 0 ? ((currentQuestionIndex) / quiz.questions.length) * 100 : 0;

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 bg-${quiz.theme && quiz.theme !== 'default' ? quiz.theme : 'indigo'}-50/30`}>
      <div className="w-full max-w-3xl relative">
        
        {gameState === 'start' && (
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100/50 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
             {quiz.coverImage ? (
                <div className="w-full md:w-1/2 h-64 md:h-auto shrink-0 relative bg-slate-200">
                   <img src={quiz.coverImage} className="w-full h-full object-cover absolute inset-0" alt="Cover" />
                </div>
             ) : (
                <div className={`w-full md:w-1/2 h-64 md:h-auto shrink-0 relative flex items-center justify-center bg-gradient-to-br from-${quiz.theme || 'indigo'}-100 to-${quiz.theme || 'indigo'}-50`}>
                   <Compass className={`w-24 h-24 text-${quiz.theme || 'indigo'}-300 opacity-50`} />
                </div>
             )}
             <div className="p-10 md:p-14 flex flex-col justify-center items-center text-center w-full">
                <span className={`text-${quiz.theme || 'indigo'}-600 font-bold tracking-wider text-xs mb-4 uppercase inline-flex items-center gap-1.5 bg-${quiz.theme || 'indigo'}-50 px-3 py-1 rounded-full shadow-sm`}>
                   <Award className="w-3.5 h-3.5"/> Personality Quiz
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 drop-shadow-sm leading-tight">{quiz.title}</h1>
                <p className="text-slate-500 text-base md:text-lg mb-10 leading-relaxed font-medium">{quiz.description}</p>
                
                <Button size="lg" onClick={handleStart} className="w-full px-10 shadow-xl shadow-indigo-100 uppercase tracking-widest text-sm font-bold">
                  Start the Experience
                </Button>
             </div>
          </div>
        )}

        {gameState === 'questions' && currentQ && (
          <div className="w-full animate-in fade-in slide-in-from-right-8 duration-300">
             <div className="mb-8 relative max-w-xl mx-auto">
               <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-sm border border-slate-100 p-0.5">
                 <div className={`h-full bg-gradient-to-r from-${quiz.theme || 'indigo'}-400 to-${quiz.theme || 'indigo'}-500 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
               </div>
               <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mt-4">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
             </div>

             <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl border border-slate-100/50 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                  <Compass className="w-64 h-64 text-slate-900" />
                </div>
                
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-10 leading-snug relative z-10">{currentQ.questionText}</h2>
                {currentQ.image && (
                   <div className="w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-10 shadow-lg border border-slate-100 bg-slate-200 transition-transform relative z-10">
                      <img src={currentQ.image} className="w-full h-full object-cover shadow-inner" alt="Question" />
                   </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                   {currentQ.options.map(opt => {
                      const isSelected = answers[currentQ._id] === opt._id;
                      return (
                         <button 
                            key={opt._id}
                            onClick={() => handleSelectOption(currentQ._id, opt._id)}
                            className={clsx(
                               "p-6 rounded-2xl text-lg font-bold border-2 transition-all duration-200 text-left w-full",
                               isSelected 
                                 ? `border-${quiz.theme || 'indigo'}-600 bg-${quiz.theme || 'indigo'}-50 text-${quiz.theme || 'indigo'}-900 -translate-y-1 shadow-lg` 
                                 : "border-slate-100 bg-white hover:border-indigo-200 text-slate-600 hover:text-slate-800 hover:shadow-md hover:-translate-y-0.5"
                            )}>
                            <div className="flex items-center gap-3">
                               <div className={clsx("w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? `border-${quiz.theme || 'indigo'}-600` : "border-slate-300")}>
                                 {isSelected && <div className={`w-2.5 h-2.5 rounded-full bg-${quiz.theme || 'indigo'}-600`} />}
                               </div>
                               <span>{opt.text}</span>
                            </div>
                         </button>
                      )
                   })}
                </div>
             </div>

             <div className="flex justify-between items-center mt-8">
                <Button 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  variant="ghost"
                  className={clsx("px-6 rounded-full font-bold", currentQuestionIndex === 0 ? "opacity-0 pointer-events-none" : "")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
             </div>
          </div>
        )}

        {gameState === 'result' && (
           <div className="w-full flex-col flex items-center animate-in zoom-in-95 duration-700 pb-20">
              {submitting ? (
                 <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse" />
                      <RefreshCw className={`w-14 h-14 text-${quiz.theme || 'indigo'}-500 animate-spin relative z-10`} />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Calculating Personality Matrix...</p>
                 </div>
              ) : finalResult ? (
                 <div className="max-w-2xl w-full">
                    <div className="text-center mb-6">
                       <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-slate-300">Your Official Result</span>
                    </div>
                    
                    {/* Shareable Card Node */}
                    <div id="result-share-node" className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100/50 relative group flex flex-col">
                       {finalResult.image ? (
                          <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
                            <img src={finalResult.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={finalResult.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-8 right-8 z-20 text-white">
                               <h2 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-xl leading-tight">{finalResult.title}</h2>
                               <p className="text-white/80 font-bold text-sm tracking-wide shadow-sm">I got ${finalResult.title} on QuizMorph ⚡</p>
                            </div>
                          </div>
                       ) : (
                          <div className={`w-full bg-gradient-to-br from-${quiz.theme || 'indigo'}-500 to-${quiz.theme || 'indigo'}-900 flex flex-col justify-end p-10 pt-20 relative shrink-0 overflow-hidden text-white`}>
                              <div className="absolute top-0 right-0 p-8 opacity-10">
                                 <Award className="w-64 h-64" />
                              </div>
                              <h2 className="text-4xl md:text-5xl font-black mb-1 drop-shadow-xl leading-tight relative z-10">{finalResult.title}</h2>
                              <p className="text-white/60 font-bold text-xs uppercase tracking-widest relative z-10 shadow-sm mt-2">QuizMorph Official Result</p>
                          </div>
                       )}

                       <div className="p-8 md:p-12 z-20 bg-white">
                          <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">{finalResult.description}</p>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 w-full max-w-md mx-auto">
                       <Button onClick={() => { setAnswers({}); setGameState('start'); setCurrentQuestionIndex(0); }} variant="secondary" className="flex-1 shadow-sm h-14 font-bold text-base bg-white">
                          <RefreshCw className="w-5 h-5 mr-3" /> Retake Quiz
                       </Button>
                       <Button onClick={() => setIsShareModalOpen(true)} className={`flex-1 shadow-xl shadow-${quiz.theme || 'indigo'}-200 h-14 font-bold text-base bg-${quiz.theme || 'indigo'}-600`}>
                          <Share2 className="w-5 h-5 mr-3" /> Share Result
                       </Button>
                    </div>
                    
                    {/* Result Share Modal Injection */}
                    <ShareModal 
                      isOpen={isShareModalOpen} 
                      onClose={() => setIsShareModalOpen(false)} 
                      shareUrl={window.location.href} 
                      title={`I got ${finalResult.title} on ${quiz.title}!`}
                      text={`Take this quiz on QuizMorph to find out yours.`}
                      elementIdToDownload="result-share-node"
                    />

                 </div>
              ) : (
                 <div className="bg-red-50 rounded-[2rem] border border-red-100 p-12 flex flex-col items-center text-center max-w-lg shadow-lg">
                    <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
                    <h2 className="text-2xl font-black text-red-900 mb-4">Calculation Failed</h2>
                    <p className="text-red-700/80 mb-8 font-medium">The mathematics behind this quiz are broken (missing outcomes or score bindings). Please try another interactive quiz.</p>
                    <Link to="/explore"><Button variant="secondary" className="shadow-none">Explore Other Quizzes</Button></Link>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
}
