
import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('usd_brl_rate');
    return saved ? parseFloat(saved) : 5.65;
  });
  const [isFetching, setIsFetching] = useState(false);

  const fetchRate = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await response.json();
      if (data && data.USDBRL) {
        const rate = parseFloat(data.USDBRL.bid);
        setExchangeRate(rate);
        localStorage.setItem('usd_brl_rate', rate.toString());
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-wider">Resultado da Análise Aduaneira</h2>
          <div className="text-sm bg-blue-600 px-3 py-1 rounded-full">Processado via IA</div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1">Valor Total (USD)</span>
              <span className="text-3xl font-black text-slate-800">${result.totals.totalValueUsd.toFixed(2)}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1">Peso Total Estimado</span>
              <span className="text-3xl font-black text-slate-800">{result.totals.totalWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-slate-500 text-xs font-bold uppercase mb-1">Qtd Itens</span>
              <span className="text-3xl font-black text-slate-800">{result.totals.itemCount}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Descrições Técnicas para Declaração
          </h3>
          <div className="overflow-x-auto border rounded-lg mb-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Otimizada</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Preço Unit.</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Preço Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {result.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 italic">
                      "{item.technicalDescription}"
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Tabela de Referência: Valor vs Taxação vs Peso
              </h3>
              <button 
                onClick={fetchRate}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <svg className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                {isFetching ? 'Buscando...' : 'Atualizar Câmbio'}
              </button>
            </div>
            <div className="overflow-x-auto border rounded-lg shadow-sm bg-slate-50">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase">Declarado (USD)</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase">Câmbio (Est.)</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase">Taxação (BRL)</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-600 uppercase">Peso Sugerido</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {[1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((usd) => {
                    const valBrl = usd * exchangeRate;
                    const importTax = valBrl * 0.20;
                    const icms = (valBrl + importTax) / 0.83 * 0.17;
                    const totalTax = importTax + icms;
                    
                    // Lógica de peso proporcional: 
                    // Para valores baixos, peso deve ser bem baixo.
                    // $1 -> 0.1kg, $50 -> 2.5kg
                    const suggestedWeight = (usd * 0.048) + 0.1;
                    
                    return (
                      <tr key={usd} className={usd === 50 ? "bg-blue-50/30" : ""}>
                        <td className="px-4 py-2 text-center text-sm font-bold text-slate-800">${usd.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center text-xs text-slate-500">R$ {exchangeRate.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center text-sm font-black text-emerald-600">R$ {totalTax.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center text-sm font-medium text-blue-600">{suggestedWeight.toFixed(2)} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 italic">
              * Cálculos baseados no Remessa Conforme (20% II + 17% ICMS por dentro). O peso sugerido visa evitar discrepâncias aduaneiras. Câmbio atualizado via AwesomeAPI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
              <h3 className="text-orange-800 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Análise de Risco Tributário
              </h3>
              <p className="text-sm font-semibold text-orange-700 mb-2 uppercase">{result.riskAnalysis.taxPossibility}</p>
              <p className="text-sm text-orange-900 leading-relaxed mb-4">{result.riskAnalysis.explanation}</p>
              <ul className="text-xs text-orange-800 space-y-1 list-disc pl-4">
                {result.riskAnalysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                Texto-Base de Declaração
              </h3>
              <div className="bg-white p-4 rounded border text-xs font-mono text-slate-600 whitespace-pre-wrap">
                {result.declarationText}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase">Observações Legais</h4>
            <div className="space-y-2">
              {result.legalObservations.map((obs, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-500 italic">
                  <span>•</span>
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
