import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Plus,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { Movement } from '../types';

interface MovementsViewProps {
  movements: Movement[];
  onOpenNewMovement: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  onOpenNewMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODAS' | 'ENTRADA' | 'SAIDA'>('TODAS');

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch =
        m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.responsibleUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.documentNumber && m.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'TODAS' || m.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, searchTerm, typeFilter]);

  // Statistics
  const totalEntriesQty = movements
    .filter(m => m.type === 'ENTRADA')
    .reduce((acc, m) => acc + m.quantity, 0);

  const totalExitsQty = movements
    .filter(m => m.type === 'SAIDA')
    .reduce((acc, m) => acc + m.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total de Operações</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{movements.length}</span>
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lançamentos registrados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Volume Total Recebido (Entradas)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">
              +{totalEntriesQty.toLocaleString('pt-BR')}
            </span>
            <ArrowDownRight className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Compras e devoluções</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Volume Total Expedido (Saídas)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-blue-600">
              -{totalExitsQty.toLocaleString('pt-BR')}
            </span>
            <ArrowUpRight className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">Consumo e requisições atendidas</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-movements"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por material, NF, motivo, responsável..."
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

          {/* Type Filter Buttons */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTypeFilter('TODAS')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                typeFilter === 'TODAS' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({movements.length})
            </button>
            <button
              onClick={() => setTypeFilter('ENTRADA')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                typeFilter === 'ENTRADA' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Entradas
            </button>
            <button
              onClick={() => setTypeFilter('SAIDA')}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                typeFilter === 'SAIDA' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Saídas
            </button>
          </div>
        </div>

        <button
          id="btn-new-movement-page"
          onClick={onOpenNewMovement}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Movimentação
        </button>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Data / Hora</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Código & Material</th>
                <th className="px-4 py-3 text-right">Quantidade</th>
                <th className="px-4 py-3">Motivo da Operação</th>
                <th className="px-4 py-3">Nº Documento</th>
                <th className="px-4 py-3">Responsável Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <ArrowLeftRight className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm text-slate-700">Nenhuma movimentação localizada</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Lance uma nova entrada ou saída para iniciar o histórico operacional.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map(m => {
                  const isEntrada = m.type === 'ENTRADA';
                  const dateObj = new Date(m.date);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR');
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </div>
                        <div className="text-[11px] text-slate-400 pl-5">{formattedTime}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {isEntrada ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            ENTRADA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            SAÍDA
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-800 text-xs mr-2">
                          {m.materialCode}
                        </span>
                        <span className="font-medium text-slate-900 text-xs">
                          {m.materialName}
                        </span>
                        {m.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 italic">
                            Nota: {m.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap font-mono">
                        <span
                          className={`text-sm font-bold ${
                            isEntrada ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          {isEntrada ? '+' : '-'}
                          {m.quantity.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">{m.unit}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-800 whitespace-nowrap">
                        <span className="font-medium">{m.reason}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {m.documentNumber ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {m.documentNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sem documento</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{m.responsibleUser}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Total de <strong>{filteredMovements.length}</strong> movimentações listadas
          </span>
          <span className="text-[11px] text-slate-400">
            Rastreabilidade completa de almoxarifado
          </span>
        </div>
      </div>
    </div>
  );
};
