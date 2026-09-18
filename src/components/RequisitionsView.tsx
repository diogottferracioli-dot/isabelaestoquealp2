import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Building,
  Calendar,
} from 'lucide-react';
import { Requisition, RequisitionStatus } from '../types';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  onOpenNewRequisition: () => void;
  onViewPrintRequisition: (req: Requisition) => void;
  onFulfillRequisition: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: RequisitionStatus) => Promise<void>;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requisitions,
  onOpenNewRequisition,
  onViewPrintRequisition,
  onFulfillRequisition,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      const matchesSearch =
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.items.some(it => it.materialName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'TODAS' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requisitions, searchTerm, statusFilter]);

  const pendingCount = requisitions.filter(r => r.status === 'PENDENTE').length;
  const approvedCount = requisitions.filter(r => r.status === 'APROVADA').length;
  const attendedCount = requisitions.filter(r => r.status === 'ATENDIDA').length;

  const handleFulfill = async (id: string) => {
    try {
      setFulfillingId(id);
      await onFulfillRequisition(id);
    } finally {
      setFulfillingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total de Requisições</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{requisitions.length}</span>
            <ClipboardList className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Registradas no período</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Aguardando Separação</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Pendentes de atendimento</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Aprovadas p/ Retirada</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-blue-600">{approvedCount}</span>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">Prontas para expedição</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Atendidas & Baixadas</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">{attendedCount}</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Entregues com sucesso</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-requisitions"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, solicitante, setor ou item..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('TODAS')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'TODAS' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({requisitions.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDENTE')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'PENDENTE' ? 'bg-white text-amber-800 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('ATENDIDA')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'ATENDIDA' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Atendidas
            </button>
          </div>
        </div>

        <button
          id="btn-new-requisition-page"
          onClick={onOpenNewRequisition}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Requisição
        </button>
      </div>

      {/* Requisitions List */}
      <div className="space-y-3">
        {filteredRequisitions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm text-slate-700">Nenhuma requisição encontrada</p>
            <p className="text-xs text-slate-400 mt-1">Crie uma nova solicitação para começar o atendimento.</p>
          </div>
        ) : (
          filteredRequisitions.map(req => {
            const reqDate = new Date(req.date);
            const formattedDate = reqDate.toLocaleDateString('pt-BR');
            const totalRequestedUnits = req.items.reduce((acc, it) => acc + it.requestedQuantity, 0);

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Code, details, items */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{req.code}</span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.status === 'ATENDIDA'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : req.status === 'APROVADA'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : req.status === 'CANCELADA'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {req.status === 'ATENDIDA' && <CheckCircle className="w-3.5 h-3.5" />}
                      {req.status === 'PENDENTE' && <Clock className="w-3.5 h-3.5" />}
                      {req.status}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        req.priority === 'URGENTE'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : req.priority === 'BAIXA'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Prioridade {req.priority}
                    </span>

                    <span className="text-slate-400 text-xs hidden sm:inline">•</span>

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Requester and Department */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Solicitante: <strong className="text-slate-900">{req.requesterName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Setor: <strong className="text-slate-900">{req.department}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Itens Solicitados ({req.items.length} itens / {totalRequestedUnits} unid.)</span>
                      {req.notes && <span className="text-[11px] text-slate-500 italic truncate max-w-xs sm:max-w-md">Obs: {req.notes}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.items.map((it, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700"
                        >
                          <strong className="font-mono text-slate-900">{it.requestedQuantity}x</strong>
                          <span>{it.materialName}</span>
                          <span className="text-slate-400 font-mono">({it.unit})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {req.status !== 'ATENDIDA' && (
                    <button
                      onClick={() => handleFulfill(req.id)}
                      disabled={fulfillingId === req.id}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Efetuar baixa dos materiais e marcar como atendida"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {fulfillingId === req.id ? 'Baixando...' : 'Atender / Entregar'}
                    </button>
                  )}

                  <button
                    onClick={() => onViewPrintRequisition(req)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    Visualizar & Imprimir
                  </button>

                  {req.status === 'PENDENTE' && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => onUpdateStatus(req.id, 'APROVADA')}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Aprovar
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => onUpdateStatus(req.id, 'CANCELADA')}
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
