import React from 'react';
import {
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
  Lightbulb,
  UserCheck,
  Plus,
  Info,
} from 'lucide-react';
import { TechnicalManager } from '../types';

export type ActiveTab = 'materiais' | 'movimentacoes' | 'requisicoes' | 'relatorios' | 'indicadores';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  manager: TechnicalManager;
  onOpenAuthModal: () => void;
  onOpenNewMaterial: () => void;
  onOpenNewMovement: () => void;
  onOpenNewRequisition: () => void;
  onToggleTips: () => void;
  onOpenSystemInfo: () => void;
  totalMaterialsCount: number;
  pendingRequisitionsCount: number;
  tipsOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  manager,
  onOpenAuthModal,
  onOpenNewMovement,
  onOpenNewRequisition,
  onToggleTips,
  onOpenSystemInfo,
  totalMaterialsCount,
  pendingRequisitionsCount,
  tipsOpen,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Banner / Technical Manager Identity */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Almoxarifado Online
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <strong className="text-slate-100">Responsável Técnico:</strong> {manager.name}
              <span className="text-slate-400 font-mono hidden md:inline">({manager.registration})</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-switch-user"
              onClick={onOpenAuthModal}
              className="text-xs text-slate-300 hover:text-white underline hover:no-underline transition-colors cursor-pointer"
            >
              Alterar Responsável
            </button>
            <span className="text-slate-600">|</span>
            <button
              id="btn-system-info"
              onClick={onOpenSystemInfo}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Instruções de Deploy, Execução e Backup"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Ajuda & Deploy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg leading-tight tracking-tight flex items-center gap-2">
                Controle de Estoque
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Operacional
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Almoxarifado & Gestão de Materiais</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="nav-tab-materiais"
              onClick={() => setActiveTab('materiais')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'materiais'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Materiais
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                {totalMaterialsCount}
              </span>
            </button>

            <button
              id="nav-tab-movimentacoes"
              onClick={() => setActiveTab('movimentacoes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'movimentacoes'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Movimentações
            </button>

            <button
              id="nav-tab-requisicoes"
              onClick={() => setActiveTab('requisicoes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'requisicoes'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Requisições
              {pendingRequisitionsCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  {pendingRequisitionsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-relatorios"
              onClick={() => setActiveTab('relatorios')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'relatorios'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Relatório
            </button>

            <button
              id="nav-tab-indicadores"
              onClick={() => setActiveTab('indicadores')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'indicadores'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Indicadores
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-quick-mov"
              onClick={onOpenNewMovement}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors cursor-pointer"
              title="Lançar Entrada ou Saída no Estoque"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Movimentar</span>
            </button>

            <button
              id="btn-quick-req"
              onClick={onOpenNewRequisition}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors cursor-pointer"
              title="Criar nova requisição de material"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Requisição</span>
            </button>

            <button
              id="btn-toggle-tips"
              onClick={onToggleTips}
              className={`p-2 rounded-md border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                tipsOpen
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Boas Práticas de Gestão de Estoques"
            >
              <Lightbulb className={`w-4 h-4 ${tipsOpen ? 'text-amber-600 fill-amber-300' : 'text-slate-500'}`} />
              <span className="hidden md:inline">Boas Práticas</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Nav Tabs */}
        <div className="lg:hidden flex items-center justify-between border-t border-slate-200 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('materiais')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'materiais' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Materiais ({totalMaterialsCount})
          </button>
          <button
            onClick={() => setActiveTab('movimentacoes')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'movimentacoes' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Movimentações
          </button>
          <button
            onClick={() => setActiveTab('requisicoes')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'requisicoes' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Requisições {pendingRequisitionsCount > 0 ? `(${pendingRequisitionsCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'relatorios' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Relatório
          </button>
          <button
            onClick={() => setActiveTab('indicadores')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'indicadores' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Indicadores
          </button>
        </div>
      </div>
    </header>
  );
};
