import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Palette, Share2, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import QuizCard from '../components/QuizCard';
import api from '../lib/api';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch some highlights for the home page
    api.get('/quizzes/explore').then(res => setTrending(res.data.slice(0, 3))).catch(console.error);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center bg-white">
      
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden px-6 py-24 md:py-32 flex flex-col items-center text-center">
        {/* Soft background blobs */}
        <div className="absolute top-0 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-4xl relative z-10 space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm mb-4 tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4"/> The Interactive Quiz Portal
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            {t('home.heroTitle')}
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">
            {t('home.heroDesc')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/explore">
              <Button size="lg" className="w-full sm:w-auto px-10">{t('home.ctaPlay')}</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10">{t('home.ctaCreate')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-100/50">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{t('home.trending')}</h2>
            <p className="text-slate-500">Play the community's favorite personality quizzes.</p>
          </div>
          <Link to="/explore">
            <Button variant="ghost">View all quizzes →</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {trending.length > 0 ? trending.map(quiz => (
             <QuizCard key={quiz._id} quiz={quiz} />
           )) : (
             <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               No quizzes yet. Be the first to build something amazing!
             </div>
           )}
        </div>
      </section>

      {/* Why QuizMorph Section */}
      <section className="w-full bg-slate-50/50 py-24 border-y border-slate-100/80">
        <div className="max-w-6xl mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-16">
             <h2 className="text-3xl font-black text-slate-900 mb-4">Why QuizMorph?</h2>
             <p className="text-slate-500 text-lg">We designed this platform so creating feels just as playful as taking the quiz.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
               <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                 <Wand2 className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold mb-3 text-slate-800">Effortless Creation</h3>
               <p className="text-slate-500 leading-relaxed">Our builder requires zero code. Easily map score vectors to vibrant graphical outcomes.</p>
             </div>
             
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                 <Palette className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold mb-3 text-slate-800">Visual First</h3>
               <p className="text-slate-500 leading-relaxed">Gradients, massive cards, and beautiful typography. Your content will look like a premium app.</p>
             </div>
             
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
               <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                 <Share2 className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-bold mb-3 text-slate-800">Highly Shareable</h3>
               <p className="text-slate-500 leading-relaxed">At the end of every quiz, players get a gorgeous result card they'll want to post everywhere.</p>
             </div>
           </div>
        </div>
      </section>

      {/* Creator CTA Section */}
      <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center">
         <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-[3rem] p-12 md:p-20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Sparkles className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Can you think of a fun <span className="text-pink-400">interactive idea?</span></h2>
              <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                 "What kind of potato are you?", "The ultimate 90s aesthetic test"—anything you can imagine, you can publish on QuizMorph today. For free.
              </p>
              <Link to="/register">
                 <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-50 border-0 shadow-lg shadow-black/20">Try It Free Now</Button>
              </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
