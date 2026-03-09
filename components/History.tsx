
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { HistoryItem } from '../types';

interface HistoryProps {
  onSelectHistory: (item: HistoryItem) => void;
  refreshTrigger: number;
}

const History: React.FC<HistoryProps> = ({ onSelectHistory, refreshTrigger }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('declarations')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Erro ao buscar histórico:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 rounded w-full"></div>
          <div className="h-10 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Últimas Declarações
      </h3>
      <div className="space-y-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectHistory(item)}
            className="w-full text-left p-4 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all flex justify-between items-center group"
          >
            <div>
              <div className="font-bold text-slate-800 text-sm">
                {item.items.length} {item.items.length === 1 ? 'item' : 'itens'} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.result.totals.totalValueUsd)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                {new Date(item.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default History;
