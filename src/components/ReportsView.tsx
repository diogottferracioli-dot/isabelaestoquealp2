import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { Material, MaterialCategory, TechnicalManager } from '../types';

interface ReportsViewProps {
  materials: Material[];
  manager: TechnicalManager;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ materials, manager }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'NORMAL' | 'BAIXO' | 'ZERADO'>('TODOS');
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'quantity' | 'valuation'>('code');

  const categories = useMemo(() => {
    const set = new Set<MaterialCategory>();
    materials.forEach(m => set.add(m.category));
    return Array.from(set).sort();
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m => {
        const matchesCategory = selectedCategory === 'TODAS' || m.category === selectedCategory;
        let matchesStatus = true;
        if (statusFilter === 'NORMAL') matchesStatus = m.quantity > m.minQuantity;
        if (statusFilter === 'BAIXO') matchesStatus = m.quantity > 0 && m.quantity <= m.minQuantity;
        if (statusFilter === 'ZERADO') matchesStatus = m.quantity <= 0;
        return matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'code') return a.code.localeCompare(b.code);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        if (sortBy === 'valuation') return b.quantity * b.unitCost - a.quantity * a.unitCost;
        return 0;
      });
  }, [materials, selectedCategory, statusFilter, sortBy]);

  // Aggregate totals
  const totalItemsCount = filteredMaterials.length;
  const totalPhysicalUnits = filteredMaterials.reduce((acc, m) => acc + m.quantity, 0);
  const totalInventoryValuation = filteredMaterials.reduce((acc, m) => acc + m.quantity * m.unitCost, 0);
  const criticalItemsCount = filteredMaterials.filter(m => m.quantity <= m.minQuantity).length;

  const now = new Date();
  const emissionDate = now.toLocaleDateString('pt-BR');
  const emissionTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* On-screen control bar (hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            Filtros do Relatório:
          </div>

          <select
            id="select-report-category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="TODAS">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            id="select-report-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="NORMAL">Apenas Saldo Normal</option>
            <option value="BAIXO">Apenas Estoque Baixo</option>
            <option value="ZERADO">Apenas Itens Zerados</option>
          </select>

          <select
            id="select-report-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="code">Ordenar por Código</option>
            <option value="name">Ordenar por Nome</option>
            <option value="quantity">Maior Quantidade</option>
            <option value="valuation">Maior Valor em Estoque</option>
          </select>
        </div>

        <button
          id="btn-print-report"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Imprimir Relatório Consolidado (A4)
        </button>
      </div>

      {/* Printable Sheet (Standard A4 / Clean Document Format) */}
      <div className="printable-area bg-white p-6 sm:p-10 rounded-xl border border-slate-200 shadow-2xs text-slate-900 font-sans">
        {/* Report Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                  Relatório Consolidado de Posição de Estoques
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Almoxarifado Central & Controle de Inventário Físico
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    <strong>Responsável Técnico:</strong> {manager.name} ({manager.registration}) • {manager.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 border border-slate-200 rounded p-2.5 bg-slate-50 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500">Emissão Oficial</div>
              <div className="font-mono font-bold text-slate-900 flex items-center gap-1 sm:justify-end">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {emissionDate} às {emissionTime}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Categoria: {selectedCategory} | Filtro: {statusFilter}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Itens Listados</span>
            <span className="text-xl font-bold text-slate-900 block mt-0.5">{totalItemsCount}</span>
            <span className="text-[10px] text-slate-400">Linhas ativas</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Unidades Físicas</span>
            <span className="text-xl font-bold text-slate-900 block mt-0.5">
              {totalPhysicalUnits.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-slate-400">Volume total estocado</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Valorização Total</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900 block mt-0.5">
              R$ {totalInventoryValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400">Custo de reposição</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Itens em Alerta</span>
            <span
              className={`text-xl font-bold block mt-0.5 ${
                criticalItemsCount > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {criticalItemsCount}
            </span>
            <span className="text-[10px] text-slate-400">Abaixo ou no limite mínimo</span>
          </div>
        </div>

        {/* Consolidated Inventory Table */}
        <div className="overflow-x-auto border border-slate-300 rounded mb-6">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-2 border-r border-slate-300 w-24">Código</th>
                <th className="p-2 border-r border-slate-300">Material / Especificação</th>
                <th className="p-2 border-r border-slate-300">Categoria</th>
                <th className="p-2 border-r border-slate-300">Endereço</th>
                <th className="p-2 border-r border-slate-300 text-right w-16">Mínimo</th>
                <th className="p-2 border-r border-slate-300 text-right w-20">Saldo Atual</th>
                <th className="p-2 border-r border-slate-300 text-center w-12">Unid.</th>
                <th className="p-2 border-r border-slate-300 text-right w-24">Custo Unit.</th>
                <th className="p-2 border-r border-slate-300 text-right w-28">Subtotal (R$)</th>
                <th className="p-2 text-center w-20">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMaterials.map(m => {
                const isZero = m.quantity <= 0;
                const isLow = m.quantity > 0 && m.quantity <= m.minQuantity;
                const subtotal = m.quantity * m.unitCost;

                return (
                  <tr
                    key={m.id}
                    className={`hover:bg-slate-50/80 ${isZero ? 'bg-rose-50/30' : isLow ? 'bg-amber-50/30' : ''}`}
                  >
                    <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-800">
                      {m.code}
                    </td>

                    <td className="p-2 border-r border-slate-300">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                    </td>

                    <td className="p-2 border-r border-slate-300 text-slate-600 whitespace-nowrap">
                      {m.category}
                    </td>

                    <td className="p-2 border-r border-slate-300 text-slate-600 whitespace-nowrap text-[10px]">
                      {m.location}
                    </td>

                    <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-500">
                      {m.minQuantity}
                    </td>

                    <td className="p-2 border-r border-slate-300 text-right font-mono font-bold">
                      <span className={isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}>
                        {m.quantity.toLocaleString('pt-BR')}
                      </span>
                    </td>

                    <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-600">
                      {m.unit}
                    </td>

                    <td className="p-2 border-r border-slate-300 text-right font-mono text-slate-700">
                      R$ {m.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                      R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="p-2 text-center whitespace-nowrap">
                      {isZero ? (
                        <span className="font-bold text-rose-700 uppercase text-[9px]">ZERADO</span>
                      ) : isLow ? (
                        <span className="font-bold text-amber-700 uppercase text-[9px]">BAIXO</span>
                      ) : (
                        <span className="font-medium text-emerald-700 uppercase text-[9px]">NORMAL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Totals Footer */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
              <tr>
                <td colSpan={5} className="p-2 border-r border-slate-300 text-right uppercase">
                  Totais Consolidados:
                </td>
                <td className="p-2 border-r border-slate-300 text-right font-mono">
                  {totalPhysicalUnits.toLocaleString('pt-BR')}
                </td>
                <td className="p-2 border-r border-slate-300 text-center text-slate-500 font-normal">
                  itens
                </td>
                <td className="p-2 border-r border-slate-300"></td>
                <td className="p-2 border-r border-slate-300 text-right font-mono">
                  R$ {totalInventoryValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-center text-[10px] text-slate-500">
                  {criticalItemsCount} em alerta
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Auditoria e Assinatura do Responsável Técnico */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 page-break-inside-avoid text-xs">
          <div>
            <span className="font-bold text-slate-800 uppercase block mb-1">Notas de Auditoria Física:</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Posição de estoque aferida eletronicamente no Sistema Integrado de Almoxarifado. As divergências físicas identificadas nos inventários cíclicos devem ser conciliadas através de Ordens de Ajuste devidamente autorizadas pela Coordenação de Suprimentos.
            </p>
          </div>

          <div className="text-center sm:text-right flex flex-col justify-end">
            <div className="inline-block border-t border-slate-800 pt-2 min-w-[240px] ml-auto">
              <strong className="block text-slate-900">{manager.name}</strong>
              <span className="text-[11px] text-slate-500 block">
                {manager.role} • {manager.registration}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Visto e Homologação Técnica do Almoxarifado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
