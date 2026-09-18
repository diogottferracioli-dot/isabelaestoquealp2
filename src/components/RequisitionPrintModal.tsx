import React from 'react';
import { X, Printer, CheckCircle, Clock, AlertCircle, Building2 } from 'lucide-react';
import { Requisition, TechnicalManager } from '../types';

interface RequisitionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition | null;
  manager: TechnicalManager;
  onFulfillRequisition?: (id: string) => Promise<void>;
}

export const RequisitionPrintModal: React.FC<RequisitionPrintModalProps> = ({
  isOpen,
  onClose,
  requisition,
  manager,
  onFulfillRequisition,
}) => {
  if (!isOpen || !requisition) return null;

  const handlePrint = () => {
    window.print();
  };

  const reqDate = new Date(requisition.date);
  const formattedDate = reqDate.toLocaleDateString('pt-BR');
  const formattedTime = reqDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-800 text-slate-100 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Visualização de Impressão</span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-blue-400 font-bold">{requisition.code}</span>
          </div>

          <div className="flex items-center gap-2">
            {requisition.status !== 'ATENDIDA' && onFulfillRequisition && (
              <button
                type="button"
                onClick={async () => {
                  await onFulfillRequisition(requisition.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Dar baixa nos materiais no estoque agora"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Atender Requisição
              </button>
            )}

            <button
              type="button"
              id="btn-trigger-print-req"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Requisição (A4)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Sheet (A4 layout styling) */}
        <div className="printable-area p-6 sm:p-10 bg-white text-slate-900 text-xs font-sans">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                    Almoxarifado Central & Gestão de Materiais
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Departamento de Suprimentos, Logística & Infraestrutura Operacional
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Responsável Técnico: {manager.name} • {manager.registration}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 border border-slate-300 rounded p-2 bg-slate-50">
                <div className="text-[10px] uppercase font-bold text-slate-500">Documento Oficial</div>
                <div className="text-sm sm:text-base font-black font-mono text-slate-900">{requisition.code}</div>
                <div className="text-[10px] text-slate-500 font-medium">{formattedDate} às {formattedTime}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                REQUISIÇÃO INTERNA DE MATERIAIS (RIM)
              </span>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-600">
                  Prioridade: <strong className="text-slate-900 uppercase">{requisition.priority}</strong>
                </span>
                <span className="font-semibold text-slate-600">
                  Situação:{' '}
                  <span
                    className={`uppercase font-bold px-2 py-0.5 rounded text-[10px] ${
                      requisition.status === 'ATENDIDA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : requisition.status === 'APROVADA'
                        ? 'bg-blue-100 text-blue-800'
                        : requisition.status === 'CANCELADA'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {requisition.status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Requester & Sector Details */}
          <div className="bg-slate-50/80 border border-slate-200 rounded p-3 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Solicitante:</span>
              <strong className="text-slate-900 text-sm">{requisition.requesterName}</strong>
            </div>

            <div>
              <span className="text-slate-500 font-medium block text-[11px]">Setor / Centro de Custo:</span>
              <strong className="text-slate-900 text-sm">{requisition.department}</strong>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 font-medium block text-[11px]">Finalidade / Justificativa da Demanda:</span>
              <span className="text-slate-800">
                {requisition.notes || 'Utilização operacional padrão no departamento solicitante.'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Itens Solicitados & Baixa Física
            </h2>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border-r border-slate-300 text-center w-8">#</th>
                  <th className="p-2 border-r border-slate-300 w-24">Código</th>
                  <th className="p-2 border-r border-slate-300">Descrição Completa do Material</th>
                  <th className="p-2 border-r border-slate-300 text-center w-16">Unid.</th>
                  <th className="p-2 border-r border-slate-300 text-right w-20">Qtd. Solicitada</th>
                  <th className="p-2 border-r border-slate-300 text-right w-20">Qtd. Entregue</th>
                  <th className="p-2 text-center w-20">Visto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requisition.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-800">
                      {item.materialCode}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-medium text-slate-900">
                      {item.materialName}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-600">
                      {item.unit}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right font-bold text-slate-900 font-mono">
                      {item.requestedQuantity}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-800">
                      {item.deliveredQuantity || (requisition.status === 'ATENDIDA' ? item.requestedQuantity : '___')}
                    </td>
                    <td className="p-2 text-center text-slate-400 font-mono">
                      [ &nbsp; ]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal Responsibility Term */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 mb-8 leading-relaxed">
            <strong>Termo de Responsabilidade e Guarda:</strong> Declaro ter conferido e recebido os materiais discriminados nesta requisição em perfeitas condições de integridade, embalagem e funcionamento, assumindo a responsabilidade por sua correta guarda, zelo e aplicação estritamente vinculada às atividades operacionais da instituição.
          </div>

          {/* Signatures Area (3 blocks) */}
          <div className="grid grid-cols-3 gap-6 pt-4 page-break-inside-avoid">
            {/* 1. Solicitante */}
            <div className="text-center">
              <div className="border-t border-slate-800 pt-1.5">
                <div className="font-bold text-slate-900 text-xs">{requisition.requesterName}</div>
                <div className="text-[10px] text-slate-500">Solicitante / Recebedor</div>
                <div className="text-[9px] text-slate-400 mt-1">Data: ____/____/2026</div>
              </div>
            </div>

            {/* 2. Almoxarife / Responsável Técnico */}
            <div className="text-center">
              <div className="border-t border-slate-800 pt-1.5">
                <div className="font-bold text-slate-900 text-xs">{manager.name}</div>
                <div className="text-[10px] text-slate-500">Responsável Técnico ({manager.registration})</div>
                <div className="text-[9px] text-slate-400 mt-1">
                  {requisition.deliveredAt
                    ? `Atendido em ${new Date(requisition.deliveredAt).toLocaleDateString('pt-BR')}`
                    : 'Conferência do Almoxarifado'}
                </div>
              </div>
            </div>

            {/* 3. Chefia / Autorização */}
            <div className="text-center">
              <div className="border-t border-slate-800 pt-1.5">
                <div className="font-bold text-slate-900 text-xs">
                  {requisition.approvedBy || 'Chefia Imediata / Gerência'}
                </div>
                <div className="text-[10px] text-slate-500">Aprovação de Centro de Custo</div>
                <div className="text-[9px] text-slate-400 mt-1">Assinatura & Carimbo</div>
              </div>
            </div>
          </div>

          {/* System Footer Note */}
          <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
            Documento emitido eletronicamente via Sistema de Controle de Estoque • Almoxarifado Central • {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};
