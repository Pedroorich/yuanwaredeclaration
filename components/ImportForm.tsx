
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
    quantity: 1,
    unitWeight: 0.2,
    estimatedPrice: 10
  };

  const [formData, setFormData] = useState<Omit<ImportItem, 'id'>>(initialState);

  // Sync form with editingItem when it changes
  useEffect(() => {
    if (editingItem) {
      const { id, ...data } = editingItem;
      setFormData(data);
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
    <form id="import-form" onSubmit={handleSubmit} className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-300 mb-8 ${editingItem ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-lg font-semibold text-slate-800">
          {editingItem ? 'Editar Item de Importação' : 'Adicionar Novo Item'}
        </h3>
        {editingItem && (
          <button 
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-700 font-bold uppercase flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Cancelar Edição
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Nome Comercial</label>
          <input 
            type="text" 
            placeholder="Ex: Camiseta Oversized" 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Marca (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ex: Nike" 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.brand}
            onChange={e => setFormData({ ...formData, brand: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Categoria / Tipo</label>
          <input 
            type="text" 
            placeholder="Ex: Camiseta, Fone de Ouvido..." 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.pieceType}
            onChange={e => setFormData({ ...formData, pieceType: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Público Alvo</label>
          <select 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.audience}
            onChange={e => setFormData({ ...formData, audience: e.target.value as any })}
          >
            <option value="unissex">Geral / Unissex</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Material / Composição</label>
          <input 
            type="text" 
            placeholder="Ex: 100% Algodão, Plástico ABS..." 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.material}
            onChange={e => setFormData({ ...formData, material: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Quantidade</label>
          <input 
            type="number" 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.quantity}
            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            min="1"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Peso Unit. (kg)</label>
          <input 
            type="number" 
            step="0.01"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.unitWeight}
            onChange={e => setFormData({ ...formData, unitWeight: parseFloat(e.target.value) || 0 })}
            min="0.01"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Preço Unit. (USD)</label>
          <input 
            type="number" 
            step="0.01"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Descartar
          </button>
        )}
        <button 
          type="submit" 
          className={`${editingItem ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-2 px-6 rounded-lg shadow transition-all flex items-center gap-2`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {editingItem 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            }
          </svg>
          {editingItem ? 'Salvar Alterações' : 'Adicionar ao Carrinho de Importação'}
        </button>
      </div>
    </form>
  );
};

export default ImportForm;
