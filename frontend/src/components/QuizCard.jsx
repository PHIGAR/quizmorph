import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';

export default function QuizCard({ quiz }) {
  const themeColors = {
    indigo: 'from-indigo-100 to-indigo-50 text-indigo-600 border-indigo-100 bg-indigo-50',
    rose: 'from-rose-100 to-rose-50 text-rose-600 border-rose-100 bg-rose-50',
    emerald: 'from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-100 bg-emerald-50',
    violet: 'from-violet-100 to-violet-50 text-violet-600 border-violet-100 bg-violet-50',
    blue: 'from-blue-100 to-blue-50 text-blue-600 border-blue-100 bg-blue-50',
  };

  const activeThemeColor = themeColors[quiz.theme] || themeColors.indigo;
  const themeClasses = activeThemeColor.split(' ');
  const gradientClass = themeClasses[0] + ' ' + themeClasses[1];
  const textClass = themeClasses[2];
  const bgBadgeClass = themeClasses[4];

  return (
    <Link to={`/quiz/${quiz.slug}`} className="group block bg-white rounded-[2rem] border border-slate-100/80 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      
      {/* Image Thumbnail Area */}
      <div className={`relative h-48 w-full overflow-hidden bg-gradient-to-br ${gradientClass}`}>
        {quiz.coverImage ? (
          <img src={quiz.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={quiz.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <ImageIcon className={`w-16 h-16 ${textClass} opacity-30`} />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
           <button className="bg-white/90 text-indigo-600 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all backdrop-blur-md">
             <PlayCircle className="w-8 h-8 fill-indigo-600 text-white" />
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${bgBadgeClass} ${textClass}`}>
            {quiz.category || 'Personality'}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {quiz.title}
        </h3>
        
        <p className="text-slate-500 text-sm flex-1 line-clamp-2 leading-relaxed">
          {quiz.description || "Take this quiz to find out more!"}
        </p>
        
        <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                {quiz.author?.username?.charAt(0).toUpperCase() || 'U'}
             </div>
             <span className="text-xs font-semibold text-slate-500">
               {quiz.author?.username || 'Creator'}
             </span>
          </div>
          <span className="text-xs font-bold text-slate-400">Play Now →</span>
        </div>
      </div>
    </Link>
  );
}
