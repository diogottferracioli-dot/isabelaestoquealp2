import React from 'react';
import { UserCheck, ShieldCheck, Database, Download } from 'lucide-react';
import { TechnicalManager } from '../types';

interface FooterProps {
  manager: TechnicalManager;
  onOpenAuthModal: () => void;
  onDownloadBackup: () => void;
  onOpenSystemInfo: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  manager,
  onOpenAuthModal,
  onDownloadBackup,
  onOpenSystemInfo,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Manager Identification Card in Footer */}
          <div className="flex items-center gap-3 bg-slate-800/60 px-4 py-2.5 rounded-lg border border-slate-700/60 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-100 font-semibold">{manager.name}</span>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/50">
                  {manager.registration}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{manager.role} • {manager.department}</p>
            </div>
            <button
              onClick={onOpenAuthModal}
              className="ml-auto md:ml-4 text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Editar
            </button>
          </div>

          {/* Database Persistence Status & Backup */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Persistência Ativa (JSON + API Server)</span>
            </div>
            <button
              id="btn-footer-backup"
              onClick={onDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Baixar backup dos dados em formato JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Backup JSON
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Sistema Operacional de Controle de Estoques & Almoxarifado • Conformidade com Normas NBR</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSystemInfo}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Instruções de Deploy & Arquitetura
            </button>
            <span>•</span>
            <span>Versão 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
