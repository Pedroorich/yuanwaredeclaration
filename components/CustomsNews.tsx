
import React, { useState, useEffect } from 'react';
import { getCustomsNews } from '../services/geminiService';
import { NewsItem } from '../types';

const CustomsNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getCustomsNews();
        setNews(data);
      } catch (error) {
        console.error("Error loading news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          Radar de Atualizações: Receita Federal
        </h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">Tempo Real</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((item, idx) => (
          <a 
            key={idx} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block p-4 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{item.date}</span>
              <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </div>
            <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 italic">
              "{item.summary}"
            </p>
          </a>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
        <p className="text-[9px] text-slate-400 italic">
          * Notícias filtradas por IA com base em relevância para importação.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-[9px] font-bold text-blue-600 hover:underline uppercase"
        >
          Atualizar Feed
        </button>
      </div>
    </div>
  );
};

export default CustomsNews;
