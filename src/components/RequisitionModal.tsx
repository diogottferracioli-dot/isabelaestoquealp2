import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, Save, ClipboardList } from 'lucide-react';
import { Material, RequisitionPriority } from '../types';

interface RequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  responsibleUserName: string;
  onSave: (requisitionData: {
    requesterName: string;
    department: string;
    priority: RequisitionPriority;
    items: Array<{ materialId: string; requestedQuantity: number }>;
    notes?: string;
    responsibleUser: string;
  }) => Promise<void>;
}

interface DraftItem {
  materialId: string;
  requestedQuantity: number;
}

const DEPARTMENTS = [
  'Manutenção Predial & Facilities',
  'Engenharia de Produção',
  'Infraestrutura de TI & Redes',
  'Obras & Reformas',
  'Segurança do Trabalho & Meio Ambiente',
  'Operações Logísticas',
  'Administrativo / Diretoria',
];

export const RequisitionModal: React.FC<RequisitionModalProps> = ({
  isOpen,
  onClose,
  materials,
  responsibleUserName,
  onSave,
}) => {
  const [requesterName, setRequesterName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [priority, setPriority] = useState<RequisitionPriority>('NORMAL');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([
    { materialId: materials[0]?.id || '', requestedQuantity: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (materials.length === 0) return;
    setItems(prev => [...prev, { materialId: materials[0].id, requestedQuantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setError('A requisição deve conter ao menos 1 item solicitado.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleItemChange = (index: number, field: keyof DraftItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requesterName.trim()) {
      setError('O nome do solicitante é obrigatório.');
      return;
    }

    const finalDept = department === 'Outro' ? customDepartment.trim() : department;
    if (!finalDept) {
      setError('O setor/departamento solicitante é obrigatório.');
      return;
    }

    if (items.length === 0) {
      setError('Adicione ao menos um material à requisição.');
      return;
    }

    // Validate quantities
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.materialId) {
        setError(`Item #${i + 1}: Selecione um material válido.`);
        return;
      }
      if (item.requestedQuantity <= 0) {
        setError(`Item #${i + 1}: A quantidade solicitada deve ser maior que zero.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSave({
        requesterName: requesterName.trim(),
        department: finalDept,
        priority,
        items,
        notes: notes.trim(),
        responsibleUser: responsibleUserName,
      });
      // Reset form
      setRequesterName('');
      setNotes('');
      setItems([{ materialId: materials[0]?.id || '', requestedQuantity: 1 }]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar requisição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nova Requisição de Materiais</h3>
              <p className="text-xs text-slate-500">Solicitação formal para liberação pelo almoxarifado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Solicitante <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-req-requester"
                value={requesterName}
                onChange={e => setRequesterName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Setor / Centro de Custo <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-req-department"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="Outro">Outro (especificar)</option>
              </select>
            </div>
          </div>

          {department === 'Outro' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Especifique o Setor / Centro de Custo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customDepartment}
                onChange={e => setCustomDepartment(e.target.value)}
                placeholder="Ex: Laboratório de Pesquisa"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Grau de Prioridade</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('BAIXA')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  priority === 'BAIXA'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Baixa (Programada)
              </button>
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  priority === 'NORMAL'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Normal (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setPriority('URGENTE')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  priority === 'URGENTE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Urgente (Parada/Crítico)
              </button>
            </div>
          </div>

          {/* Items Table in Requisition */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Itens Solicitados ({items.length}) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                id="btn-req-add-item"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((it, idx) => {
                const selectedMat = materials.find(m => m.id === it.materialId);
                const currentStock = selectedMat?.quantity ?? 0;
                const unit = selectedMat?.unit ?? 'UN';

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex-1">
                      <select
                        value={it.materialId}
                        onChange={e => handleItemChange(idx, 'materialId', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        required
                      >
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>
                            [{m.code}] {m.name} — Disponível: {m.quantity} {m.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={it.requestedQuantity}
                          onChange={e => handleItemChange(idx, 'requestedQuantity', Number(e.target.value))}
                          placeholder="Qtd"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <span className="w-10 text-slate-500 font-mono text-[11px]">{unit}</span>

                      <span
                        className={`text-[11px] font-medium px-2 py-1 rounded whitespace-nowrap ${
                          currentStock >= it.requestedQuantity
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                        title="Saldo disponível em estoque"
                      >
                        {currentStock >= it.requestedQuantity ? 'Disponível' : 'Saldo Insuficiente'}
                      </span>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Remover linha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Finalidade / Justificativa da Solicitação
            </label>
            <textarea
              rows={2}
              id="textarea-req-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Manutenção corretiva na esteira 02, reforma elétrica da sala de reuniões..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Actions */}
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
              id="btn-save-requisition"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Gerando...' : 'Gerar Requisição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
