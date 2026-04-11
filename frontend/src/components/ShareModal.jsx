import React, { useState } from 'react';
import { X, Copy, Download, Share, CheckCircle2, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import { toPng } from 'html-to-image';

export default function ShareModal({ 
  isOpen, 
  onClose, 
  shareUrl, 
  title = "Check this out!", 
  text = "I just took this interactive personality quiz.",
  elementIdToDownload = null 
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareOS = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadImage = async () => {
    if (!elementIdToDownload) return;
    const node = document.getElementById(elementIdToDownload);
    if (!node) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(node, { 
        quality: 1,
        pixelRatio: 2, // High resolution output
        cacheBust: true
      });
      
      const link = document.createElement('a');
      link.download = `quizmorph-share-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Unable to generate image right now.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Share with friends</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          
          <button onClick={handleShareOS} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-all group">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-600">
                  <Share className="w-5 h-5" />
               </div>
               <span className="font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">Share to Apps...</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
          </button>

          <button onClick={handleCopyLink} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-all group relative">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                  {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
               </div>
               <span className="font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">
                 {copied ? <span className="text-emerald-600">Link Copied!</span> : 'Copy Link'}
               </span>
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-400">URL</span>
          </button>

          {elementIdToDownload && (
            <button disabled={downloading} onClick={handleDownloadImage} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-all group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-pink-600">
                    <Download className="w-5 h-5" />
                 </div>
                 <span className="font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">
                   {downloading ? 'Generating Image...' : 'Save as Image'}
                 </span>
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-400">PNG</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
