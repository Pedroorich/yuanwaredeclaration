
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Auth from './components/Auth';
import { Session } from '@supabase/supabase-js';
import ImportForm from './components/ImportForm';
import ResultDisplay from './components/ResultDisplay';
import ProductSuggester from './components/ProductSuggester';
import CustomsNews from './components/CustomsNews';
import History from './components/History';
import { analyzeImportData } from './services/geminiService';
import { ImportItem, AnalysisResult, HistoryItem } from './types';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // App State
  const [items, setItems] = useState<ImportItem[]>([]);
  const [editingItem, setEditingItem] = useState<ImportItem | null>(null);
  const [prefillName, setPrefillName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        console.warn('Erro ao buscar perfil:', err.message);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  // App Logic
  const addItem = useCallback((item: ImportItem) => {
    setItems(prev => [...prev, item]);
    setResult(null); 
    setPrefillName('');
  }, []);

  const updateItem = useCallback((updatedItem: ImportItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
    setResult(null);
  }, []);

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (editingItem?.id === id) setEditingItem(null);
    setResult(null);
  };

  const startEditing = (item: ImportItem) => {
    setEditingItem(item);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setPrefillName(suggestion);
    setEditingItem(null);
  };

  const handleSelectHistory = (historyItem: HistoryItem) => {
    setItems(historyItem.items);
    setResult(historyItem.result);
    setEditingItem(null);
    setPrefillName('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProcess = async () => {
    if (items.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeImportData(items);
      setResult(analysis);

      // Save to Supabase history
      if (session) {
        const { error: saveError } = await supabase
          .from('declarations')
          .insert([
            {
              user_id: session.user.id,
              items: items,
              result: analysis
            }
          ]);
        
        if (saveError) {
          console.warn('Erro ao salvar no histórico:', saveError.message);
        } else {
          setRefreshHistory(prev => prev + 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na análise.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-600 mb-4">Configuração Necessária</h2>
          <p className="text-slate-600 mb-6">Por favor, configure as chaves do Supabase no arquivo <code>supabaseClient.ts</code>.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter italic">YUANWARE <span className="text-blue-500">DECLARATION</span></h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Classificação Inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-300">Olá, {profile?.full_name || 'Importador'}</span>
              <span className="text-[10px] text-slate-500">{session.user.email}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-slate-800 hover:bg-red-900 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all border border-slate-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              SAIR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          
          {/* Step -1: Customs News Radar */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CustomsNews />
            <History onSelectHistory={handleSelectHistory} refreshTrigger={refreshHistory} />
          </section>

          {/* Step 0: Product Suggester */}
          <section>
            <ProductSuggester onSelectSuggestion={handleSelectSuggestion} />
          </section>

          {/* Step 1: Add/Edit Items */}
          <section>
            <ImportForm 
              onAddItem={addItem} 
              onUpdateItem={updateItem}
              editingItem={editingItem}
              onCancelEdit={() => setEditingItem(null)}
              prefillName={prefillName}
            />
          </section>

          {/* Step 2: List Current Items */}
          {items.length > 0 && (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Itens no Lote ({items.length})</h3>
                <button 
                  onClick={() => { setItems([]); setEditingItem(null); setResult(null); }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold uppercase"
                >
                  Limpar Tudo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div key={item.id} className={`border p-4 rounded-lg relative group transition-all hover:border-blue-200 ${editingItem?.id === item.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button 
                        onClick={() => startEditing(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded shadow-sm opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors bg-white rounded shadow-sm opacity-0 group-hover:opacity-100"
                        title="Remover"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 mb-2">{item.brand ? `Marca: ${item.brand}` : 'Sem marca informada'}</div>
                    <div className="flex justify-between text-xs text-slate-600 border-t pt-2 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Quantidade</span>
                        <span className="font-medium">{item.quantity} un</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Peso</span>
                        <span className="font-medium">{item.unitWeight}kg</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Preço Unit</span>
                        <span className="font-bold text-blue-600">${item.estimatedPrice} USD</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={handleProcess}
                  disabled={isAnalyzing || items.length === 0}
                  className={`
                    px-12 py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center gap-3
                    ${isAnalyzing || items.length === 0
                      ? 'bg-slate-400 cursor-not-allowed text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'}
                  `}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      PROCESSANDO...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                      {result ? 'RECALCULAR DECLARAÇÃO' : 'GERAR DECLARAÇÃO OTIMIZADA'}
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Results section */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
          {result && <ResultDisplay result={result} />}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-12 border-t pt-8">
        <p className="text-center text-[10px] text-slate-400 uppercase font-medium">
          Yuanware declaration © 2024 - Tecnologia para Importação Consciente
        </p>
      </footer>
    </div>
  );
};

export default App;
