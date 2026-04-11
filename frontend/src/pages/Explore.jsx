import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import QuizCard from '../components/QuizCard';
import { Compass, Flame, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Explore() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  const categories = ['All', 'Personality', 'Animals', 'Career', 'Gaming', 'Love', 'Fun'];

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/quizzes/explore', {
           params: { 
              category: category === 'All' ? undefined : category,
              sort: sort
           }
        });
        setQuizzes(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [category, sort]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50">
      
      {/* Explore Header */}
      <div className="bg-white border-b border-slate-100 py-16">
         <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-2">
               <Compass className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Discover Quizzes</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Play hundreds of visual personality quizzes created by the community. Find out who you really are today.</p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-12">
        
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
           {/* Categories */}
           <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map(c => (
                 <button 
                  key={c}
                  onClick={() => setCategory(c)}
                  className={clsx(
                     "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border",
                     category === c 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer'
                  )}
                 >
                    {c}
                 </button>
              ))}
           </div>
           
           {/* Sorting */}
           <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm shrink-0">
             <button onClick={() => setSort('newest')} className={clsx("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", sort === 'newest' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700')}>
                <Clock className="w-4 h-4"/> Newest
             </button>
             <button onClick={() => setSort('popular')} className={clsx("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", sort === 'popular' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700')}>
                <Flame className="w-4 h-4"/> Popular
             </button>
           </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center text-slate-500 py-24 animate-pulse font-medium">Loading amazing quizzes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No quizzes found</h3>
                <p className="text-slate-500">There are no quizzes in this category yet. Be the first!</p>
              </div>
            )}
            {quizzes.map(quiz => (
               <QuizCard key={quiz._id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
