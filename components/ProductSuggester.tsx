
import React, { useState } from 'react';
import { getProductSuggestions } from '../services/geminiService';

interface ProductSuggesterProps {
  onSelectSuggestion: (suggestion: string) => void;
}

const ProductSuggester: React.FC<ProductSuggesterProps> = ({ onSelectSuggestion }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const results = await getProductSuggestions(query);
      setSuggestions(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.674a1 1 0 00.922-.617l2.108-4.742A1 1 0 0016.445 10H15V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5H5.555a1 1 0 00-.922.641l2.108 4.742a1 1 0 00.922.617z"></path></svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Assistente de Declaração Inteligente</h3>
          <p className="text-xs text-slate-500">Não sabe como declarar? Digite o produto e veja sugestões técnicas.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Celular, Tablet, Drone..."
          className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          )}
          SUGERIR
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Sugestões Técnicas Recomendadas:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => onSelectSuggestion(s)}
                className="bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-100 px-4 py-2 rounded-full text-sm text-slate-700 transition-all flex items-center gap-2 group"
              >
                <span>{s}</span>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSuggester;
