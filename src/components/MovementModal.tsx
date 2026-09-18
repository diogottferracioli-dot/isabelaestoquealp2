import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, AlertCircle, Save } from 'lucide-react';
import { Material, MovementReason, MovementType } from '../types';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  selectedMaterial?: Material | null;
  responsibleUserName: string;
  onSave: (movementData: {
    materialId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    documentNumber?: string;
    responsibleUser: string;
    notes?: string;
  }) => Promise<void>;
}

const REASONS_ENTRADA: MovementReason[] = [
  'Compra / Nota Fiscal',
  'Devolução de Material',
  'Ajuste de Inventário (Entrada)',
  'Transferência',
];

const REASONS_SAIDA: MovementReason[] = [
  'Atendimento de Requisição',
  'Consumo Operacional',
  'Ajuste de Inventário (Saída)',
  'Avaria / Descarte',
  'Transferência',
];

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  materials,
  selectedMaterial,
  responsibleUserName,
  onSave,
}) => {
  const [materialId, setMaterialId] = useState<string>('');
  const [type, setType] = useState<MovementType>('ENTRADA');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Compra / Nota Fiscal');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [responsibleUser, setResponsibleUser] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedMaterial) {
      setMaterialId(selectedMaterial.id);
    } else if (materials.length > 0 && !materialId) {
      setMaterialId(materials[0].id);
    }
    setResponsibleUser(responsibleUserName);
    setError(null);
  }, [selectedMaterial, materials, isOpen, responsibleUserName]);

  // When type changes, adjust default reason
  useEffect(() => {
    if (type === 'ENTRADA') {
      setReason(REASONS_ENTRADA[0]);
    } else {
      setReason(REASONS_SAIDA[0]);
    }
  }, [type]);

  if (!isOpen) return null;

  const currentMaterial = materials.find(m => m.id === materialId);
  const currentStock = currentMaterial?.quantity ?? 0;
  const unit = currentMaterial?.unit ?? 'UN';

  // Projected stock after operation
  const projectedStock = type === 'ENTRADA' ? currentStock + (Number(quantity) || 0) : currentStock - (Number(quantity) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!materialId) {
      setError('Por favor, selecione um material.');
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('A quantidade movimentada deve ser maior do que zero.');
      return;
    }

    if (type === 'SAIDA' && currentStock < qty) {
      setError(`Saldo insuficiente! Estoque disponível atual: ${currentStock} ${unit}, saída solicitada: ${qty} ${unit}.`);
      return;
    }

    if (!reason.trim()) {
      setError('O motivo da movimentação é obrigatório.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        materialId,
        type,
        quantity: qty,
        reason: reason.trim(),
        documentNumber: documentNumber.trim(),
        responsibleUser: responsibleUser.trim() || responsibleUserName,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {type === 'ENTRADA' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrar Movimentação de Estoque</h3>
              <p className="text-xs text-slate-500">Controle rigoroso de entradas e saídas físicas</p>
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

          {/* Type Toggle: Entrada vs Saída */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-mov-type-entrada"
                onClick={() => setType('ENTRADA')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'ENTRADA'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                ENTRADA (Recebimento)
              </button>
              <button
                type="button"
                id="btn-mov-type-saida"
                onClick={() => setType('SAIDA')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'SAIDA'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                SAÍDA (Baixa / Entrega)
              </button>
            </div>
          </div>

          {/* Material Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Material <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-mov-material"
              value={materialId}
              onChange={e => setMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              required
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.code}] {m.name} — Saldo: {m.quantity} {m.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Stock preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade Movimentada ({unit}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="input-mov-quantity"
                min="0.01"
                step="any"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Projected Stock Box */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-center text-xs">
              <span className="text-slate-500 font-medium">Previsão de Saldo:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-700">Atual: {currentStock} {unit}</span>
                <span className="text-slate-400">➔</span>
                <span
                  className={`font-bold ${
                    projectedStock < 0
                      ? 'text-rose-600'
                      : projectedStock <= (currentMaterial?.minQuantity || 0)
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  Novo: {projectedStock} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Reason & Document */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo da Operação <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-mov-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                required
              >
                {(type === 'ENTRADA' ? REASONS_ENTRADA : REASONS_SAIDA).map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nº Documento / NF / OS
              </label>
              <input
                type="text"
                id="input-mov-document"
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                placeholder="Ex: NF-e 89.410 ou OS-104"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Responsible User */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Usuário Responsável <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="input-mov-user"
              value={responsibleUser}
              onChange={e => setResponsibleUser(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Adicionais</label>
            <textarea
              id="textarea-mov-notes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Lote do fornecedor, conferência física realizada, entrega ao técnico solicitante."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Modal Actions */}
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
              id="btn-save-movement"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                type === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Registrando...' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
