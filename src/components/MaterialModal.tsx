import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, PackagePlus, Edit } from 'lucide-react';
import { Material, MaterialCategory, UnitOfMeasure } from '../types';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (materialData: Omit<Material, 'id' | 'updatedAt'>) => Promise<void>;
  editingMaterial?: Material | null;
}

const CATEGORIES: MaterialCategory[] = [
  'Elétrica',
  'Hidráulica',
  'EPI & Segurança',
  'Ferramentas',
  'Civil & Pintura',
  'Mecânica & Fixação',
  'Escritório & TI',
  'Geral',
];

const UNITS: UnitOfMeasure[] = ['UN', 'CX', 'KG', 'M', 'PAR', 'PCT', 'L', 'ROLO', 'JOGO'];

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMaterial,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('Elétrica');
  const [quantity, setQuantity] = useState<number>(0);
  const [minQuantity, setMinQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<UnitOfMeasure>('UN');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMaterial) {
      setCode(editingMaterial.code);
      setName(editingMaterial.name);
      setCategory(editingMaterial.category);
      setQuantity(editingMaterial.quantity);
      setMinQuantity(editingMaterial.minQuantity);
      setUnit(editingMaterial.unit);
      setUnitCost(editingMaterial.unitCost);
      setLocation(editingMaterial.location);
      setDescription(editingMaterial.description || '');
    } else {
      setCode('');
      setName('');
      setCategory('Elétrica');
      setQuantity(0);
      setMinQuantity(10);
      setUnit('UN');
      setUnitCost(0);
      setLocation('');
      setDescription('');
    }
    setError(null);
  }, [editingMaterial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('O código do material é obrigatório (ex: MAT-EL-01).');
      return;
    }
    if (!name.trim()) {
      setError('O nome do material é obrigatório.');
      return;
    }
    if (quantity < 0) {
      setError('A quantidade não pode ser negativa.');
      return;
    }
    if (minQuantity < 0) {
      setError('O estoque mínimo não pode ser negativo.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity),
        unit,
        unitCost: Number(unitCost) || 0,
        location: location.trim() || 'Almoxarifado Central',
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar material');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
              {editingMaterial ? <Edit className="w-4 h-4" /> : <PackagePlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingMaterial ? 'Editar Material Cadastrado' : 'Novo Cadastro de Material'}
              </h3>
              <p className="text-xs text-slate-500">
                Preencha os campos com especificações padronizadas para o almoxarifado.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-material-code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: MAT-EL-01"
                className="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Material <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-material-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Cabo Flexível 2,5mm² 750V Azul"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-material-category"
                value={category}
                onChange={e => setCategory(e.target.value as MaterialCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-material-unit"
                value={unit}
                onChange={e => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>
                    {u} ({u === 'UN' ? 'Unidade' : u === 'CX' ? 'Caixa' : u === 'M' ? 'Metro' : u === 'PAR' ? 'Par' : u === 'PCT' ? 'Pacote' : u === 'L' ? 'Litro' : u})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade Atual <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="input-material-quantity"
                min="0"
                step="any"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Mínimo (Ponto Pedido) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="input-material-min"
                min="0"
                step="any"
                value={minQuantity}
                onChange={e => setMinQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custo Unitário Estimado (R$)
              </label>
              <input
                type="number"
                id="input-material-cost"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={e => setUnitCost(Number(e.target.value))}
                placeholder="0,00"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Localização Física no Almoxarifado
            </label>
            <input
              type="text"
              id="input-material-location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Rua A / Prateleira 02 / Nível B"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Especificação Técnica / Observações
            </label>
            <textarea
              id="textarea-material-desc"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Fabricante de referência, norma ABNT, número de Certificado de Aprovação (CA) ou aplicação recomendada."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-material"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : editingMaterial ? 'Salvar Alterações' : 'Cadastrar Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
