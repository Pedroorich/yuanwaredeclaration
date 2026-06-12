
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
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'pt' | 'en' | 'zh'>('pt');

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

  const getActiveText = () => {
    let rawText = '';
    if (activeLang === 'en') rawText = result.declarationTextEn || '';
    else if (activeLang === 'zh') rawText = result.declarationTextZh || '';
    else rawText = result.declarationText || '';

    // Guarantee no plus symbols or parentheses are displayed or copied
    return rawText
      .replace(/\+/g, ' ')       // replace '+' with space
      .replace(/\(\s*/g, '')     // remove open parenthesis
      .replace(/\s*\)/g, '')     // remove close parenthesis
      .replace(/  +/g, ' ')      // collapse multiple spaces
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    let csvContent = "\ufeff"; // BOM for UTF-8 compatibility in Excel
    csvContent += "Categoria,Descricao Tecnica,Quantidade,Preco Unitario (USD),Preco Total (USD)\n";
    
    result.items.forEach(item => {
      const quantity = Math.round(item.totalPrice / item.unitPrice) || 1;
      const category = `"${item.standardCategory.replace(/"/g, '""')}"`;
      const desc = `"${item.technicalDescription.replace(/\+/g, ' ').replace(/\(\s*/g, '').replace(/\s*\)/g, '').replace(/"/g, '""')}"`;
      csvContent += `${category},${desc},${quantity},${item.unitPrice.toFixed(2)},${item.totalPrice.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "declaracao_otimizada.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-6 py-5 text-white flex justify-between items-center border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold tracking-tight">Resultado da Análise Aduaneira</h2>
            <p className="text-xs text-slate-400 mt-0.5">Valores aduaneiros propostos e descrições otimizadas</p>
          </div>
          <span className="text-[10px] font-bold bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Inteligência Artificial
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Valor Total Declarado</span>
              <span className="text-2xl font-bold text-slate-800 mt-1">${result.totals.totalValueUsd.toFixed(2)} USD</span>
            </div>
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Peso Total Estimado</span>
              <span className="text-2xl font-bold text-slate-800 mt-1">{result.totals.totalWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Quantidade de Itens</span>
              <span className="text-2xl font-bold text-slate-800 mt-1">{result.totals.itemCount} un</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Tabela de Declarações Otimizadas
          </h3>
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição Otimizada</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preço Unit.</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preço Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {result.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 italic">
                      "{item.technicalDescription.replace(/\+/g, ' ').replace(/\(\s*/g, '').replace(/\s*\)/g, '')}"
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-indigo-600">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Tabela de Referência Rápida: Valores de Remessa Conforme
              </h3>
              <button 
                onClick={fetchRate}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                {isFetching ? 'Atualizando...' : 'Atualizar Câmbio'}
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200/60 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-slate-50/50">
              <table className="min-w-full divide-y divide-slate-150">
                <thead className="bg-slate-100/80">
                  <tr>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Declarado (USD)</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Câmbio (Est.)</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Taxação Total (BRL)</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peso de Segurança Sugerido</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-center">
                  {[1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((usd) => {
                    const valBrl = usd * exchangeRate;
                    const importTax = valBrl * 0.20;
                    const icms = (valBrl + importTax) / 0.83 * 0.17;
                    const totalTax = importTax + icms;
                    const suggestedWeight = (usd * 0.048) + 0.1;
                    
                    return (
                      <tr key={usd} className={usd === 50 ? "bg-amber-50/20" : "hover:bg-slate-50/30 transition-colors"}>
                        <td className="px-4 py-3 text-sm font-bold text-slate-800">${usd.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">R$ {exchangeRate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-black text-emerald-600">R$ {totalTax.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-indigo-600">{suggestedWeight.toFixed(2)} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 italic">
              * Cálculos considerando 20% de Imposto de Importação + 17% de ICMS por dentro (Remessa Conforme). Câmbio obtido da AwesomeAPI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Customs Risk Radar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <h3 className="text-slate-800 font-bold mb-4">
                  Radar de Fiscalização Aduaneira
                </h3>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 mb-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-2">
                    <span className="uppercase tracking-wider">ALERTA DE RISCO ADUANEIRO</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold text-white ${
                      result.customsAlertLevel === 'alto' ? 'bg-red-500 shadow-sm' :
                      result.customsAlertLevel === 'medio' ? 'bg-amber-500 shadow-sm animate-pulse' : 'bg-emerald-500 shadow-sm'
                    }`}>{result.customsAlertLevel || 'baixo'}</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-500 ${
                      result.customsAlertLevel === 'alto' ? 'w-full bg-red-500' :
                      result.customsAlertLevel === 'medio' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-emerald-500'
                    }`} />
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50/60 p-3 rounded-lg border border-slate-100 mb-4 italic">
                  "{result.customsAlertExplanation || 'Fiscalização normal para remessas individuais.'}"
                </p>
              </div>

              <div className="mt-2 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Probabilidade de Taxação:</h4>
                <p className="text-xs font-bold text-indigo-600 mb-2 uppercase">{result.riskAnalysis.taxPossibility}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{result.riskAnalysis.explanation}</p>
                
                {result.riskAnalysis.recommendations?.length > 0 && (
                  <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 mt-2">
                    {result.riskAnalysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column: Multilingual Declaration Output */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-slate-800 font-bold">
                    Texto de Declaração CSSBUY
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5"
                      title="Exportar no formato ideal para planilhas"
                    >
                      CSV
                    </button>
                    <button 
                      onClick={handleCopy}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
                        copied 
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                      }`}
                    >
                      {copied ? 'Copiado!' : 'Copiar Texto'}
                    </button>
                  </div>
                </div>

                {/* Multilingual Translation Tabs */}
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-3 text-xs w-fit">
                  <button 
                    onClick={() => setActiveLang('pt')}
                    className={`px-3 py-1.5 font-semibold transition-all rounded-lg ${
                      activeLang === 'pt' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Português (PT-BR)
                  </button>
                  <button 
                    onClick={() => setActiveLang('en')}
                    className={`px-3 py-1.5 font-semibold transition-all rounded-lg ${
                      activeLang === 'en' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button 
                    onClick={() => setActiveLang('zh')}
                    className={`px-3 py-1.5 font-semibold transition-all rounded-lg ${
                      activeLang === 'zh' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    中文 (CHINÊS)
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 whitespace-pre-wrap min-h-[140px] max-h-[220px] overflow-y-auto shadow-inner leading-relaxed">
                  {getActiveText()}
                </div>
              </div>

              <div className="mt-4 text-[10px] text-slate-400 leading-relaxed">
                * Selecione a aba e copie. A versão em inglês é o padrão internacional. A versão em chinês é ideal para suporte de agentes locais da redirecionadora.
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Observações Aduaneiras Legais</h4>
            <div className="space-y-2">
              {result.legalObservations.map((obs, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-500 italic">
                  <span className="text-slate-400 font-bold">•</span>
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
