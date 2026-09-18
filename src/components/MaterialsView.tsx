import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Tag,
  Boxes,
} from 'lucide-react';
import { Material, MaterialCategory } from '../types';

interface MaterialsViewProps {
  materials: Material[];
  onOpenAddModal: () => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string, name: string) => void;
  onQuickMovement: (material: Material) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  onOpenAddModal,
  onEditMaterial,
  onDeleteMaterial,
  onQuickMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'NORMAL' | 'BAIXO' | 'ZERADO'>('TODOS');

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'TODAS' || m.category === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === 'NORMAL') {
        matchesStatus = m.quantity > m.minQuantity;
      } else if (statusFilter === 'BAIXO') {
        matchesStatus = m.quantity > 0 && m.quantity <= m.minQuantity;
      } else if (statusFilter === 'ZERADO') {
        matchesStatus = m.quantity <= 0;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchTerm, selectedCategory, statusFilter]);

  // Summary counts
  const totalCount = materials.length;
  const normalCount = materials.filter(m => m.quantity > m.minQuantity).length;
  const lowCount = materials.filter(m => m.quantity > 0 && m.quantity <= m.minQuantity).length;
  const zeroCount = materials.filter(m => m.quantity <= 0).length;
  const totalValuation = materials.reduce((acc, m) => acc + m.quantity * m.unitCost, 0);

  const categories = useMemo(() => {
    const set = new Set<MaterialCategory>();
    materials.forEach(m => set.add(m.category));
    return Array.from(set).sort();
  }, [materials]);

  return (
    <div className="space-y-6">
      {/* Top summary stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total de Itens</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
            <Boxes className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Catálogo cadastrado</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Estoque Regular</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600">{normalCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Acima do ponto pedido</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Estoque Baixo</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600">{lowCount}</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Atingiu estoque mínimo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Itens Zerados (Ruptura)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-600">{zeroCount}</span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">Necessita compra urgente</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-xs font-medium text-slate-500 block">Valorização Estimada</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-slate-900">
              R$ {totalValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Custo total em estoque</span>
        </div>
      </div>

      {/* Control bar: search, category, status tabs, and add button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-materials"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nome, prateleira..."
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

          {/* Category filter */}
          <div className="sm:w-48">
            <select
              id="select-filter-category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TODAS">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter pills & Add button */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('TODOS')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'TODOS' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('NORMAL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'NORMAL' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setStatusFilter('BAIXO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'BAIXO' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Baixo ({lowCount})
            </button>
            <button
              onClick={() => setStatusFilter('ZERADO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'ZERADO' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Zerado ({zeroCount})
            </button>
          </div>

          <button
            id="btn-add-material"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Material
          </button>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nome & Especificação</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3 text-right">Saldo Atual</th>
                <th className="px-4 py-3 text-right">Estoque Mínimo</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm text-slate-700">Nenhum material encontrado</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente ajustar os termos de busca ou filtros selecionados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(m => {
                  const isZero = m.quantity <= 0;
                  const isLow = m.quantity > 0 && m.quantity <= m.minQuantity;

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isZero ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {m.code}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                        {m.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs sm:max-w-md">
                            {m.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {m.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {m.location}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`text-sm font-bold ${
                            isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {m.quantity.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono ml-1">{m.unit}</span>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap text-slate-500 font-mono">
                        {m.minQuantity} {m.unit}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Zerado
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onQuickMovement(m)}
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Lançar Entrada/Saída rápida para este item"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditMaterial(m)}
                            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar especificações do material"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMaterial(m.id, m.name)}
                            className="p-1.5 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir cadastro do material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Exibindo <strong>{filteredMaterials.length}</strong> de <strong>{materials.length}</strong> materiais cadastrados
          </span>
          <span className="text-[11px] text-slate-400">
            Dica: Clique no ícone de setas para lançar movimentação direta de um item.
          </span>
        </div>
      </div>
    </div>
  );
};
