
import React, { useState, useEffect } from 'react';
import { ImportItem } from '../types';

interface ImportFormProps {
  onAddItem: (item: ImportItem) => void;
  onUpdateItem: (item: ImportItem) => void;
  editingItem: ImportItem | null;
  onCancelEdit: () => void;
  prefillName?: string;
}

const ImportForm: React.FC<ImportFormProps> = ({ onAddItem, onUpdateItem, editingItem, onCancelEdit, prefillName }) => {
  const initialState: Omit<ImportItem, 'id'> = {
    name: '',
    brand: '',
    pieceType: '',
    audience: 'unissex',
    material: '',
    size: '',
    color: '',
    quantity: 1,
    unitWeight: 0.2,
    estimatedPrice: 10
  };

  const [formData, setFormData] = useState<Omit<ImportItem, 'id'>>(initialState);

  // Sync form with editingItem when it changes
  useEffect(() => {
    if (editingItem) {
      const { id, ...data } = editingItem;
      setFormData({
        ...initialState,
        ...data
      });
      // Scroll to form for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormData(initialState);
    }
  }, [editingItem]);

  // Handle prefillName
  useEffect(() => {
    if (prefillName && !editingItem) {
      setFormData(prev => ({ ...prev, name: prefillName }));
      // Scroll to form
      const formElement = document.getElementById('import-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [prefillName, editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pieceType) return;
    
    if (editingItem) {
      onUpdateItem({
        ...formData,
        id: editingItem.id
      });
    } else {
      onAddItem({
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      });
    }
    
    setFormData(initialState);
  };

  return (
    <form id="import-form" onSubmit={handleSubmit} className={`bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border transition-all duration-300 mb-8 ${editingItem ? 'border-indigo-400 ring-4 ring-indigo-500/10' : 'border-slate-200/80'}`}>
      <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">
          {editingItem ? 'Editar Item de Importação' : 'Adicionar Novo Item'}
        </h3>
        {editingItem && (
          <button 
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-750 font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Cancelar Edição
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Nome Comercial</label>
          <input 
            type="text" 
            placeholder="Ex: Camiseta Oversized" 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Marca (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ex: Nike" 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
            value={formData.brand}
            onChange={e => setFormData({ ...formData, brand: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Tipo de Peça</label>
          <input 
            type="text" 
            placeholder="Ex: Camiseta, Calça..." 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
            value={formData.pieceType}
            onChange={e => setFormData({ ...formData, pieceType: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Público</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 cursor-pointer"
            value={formData.audience}
            onChange={e => setFormData({ ...formData, audience: e.target.value as any })}
          >
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="unissex">Unissex</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Material Predominante</label>
          <input 
            type="text" 
            placeholder="Ex: 100% Algodão" 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
            value={formData.material}
            onChange={e => setFormData({ ...formData, material: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Cor</label>
          <input 
            type="text" 
            placeholder="Ex: Preto, Multicolor" 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
            value={formData.color}
            onChange={e => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Tamanho</label>
          <input 
            type="text" 
            placeholder="Ex: G, M, 42" 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
            value={formData.size}
            onChange={e => setFormData({ ...formData, size: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Quantidade</label>
          <input 
            type="number" 
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700"
            value={formData.quantity}
            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            min="1"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Peso Unit. (kg)</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700"
            value={formData.unitWeight}
            onChange={e => setFormData({ ...formData, unitWeight: parseFloat(e.target.value) || 0 })}
            min="0.01"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Preço Unit. (USD)</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700"
            value={formData.estimatedPrice}
            onChange={e => setFormData({ ...formData, estimatedPrice: parseFloat(e.target.value) || 0 })}
            min="0.01"
            required
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        {editingItem && (
          <button 
            type="button"
            onClick={onCancelEdit}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 text-sm"
          >
            Descartar
          </button>
        )}
        <button 
          type="submit" 
          className={`font-semibold py-2.5 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-[0.98] ${editingItem ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-950/10'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {editingItem 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            }
          </svg>
          {editingItem ? 'Salvar Alterações' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </form>
  );
};

export default ImportForm;
