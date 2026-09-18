import React from 'react';
import { X, Lightbulb, CheckCircle, BookOpen, ShieldCheck } from 'lucide-react';
import { BestPracticeTip } from '../types';
import { bestPracticeTips } from '../data/initialData';
import { ActiveTab } from './Header';

interface BestPracticesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
}

export const BestPracticesDrawer: React.FC<BestPracticesDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  if (!isOpen) return null;

  // Filter contextual tips for the active view first, followed by general tips
  const contextualTips = bestPracticeTips.filter(
    tip => tip.context === activeTab || tip.context === 'geral'
  );
  const otherTips = bestPracticeTips.filter(
    tip => tip.context !== activeTab && tip.context !== 'geral'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end no-print">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 bg-slate-900 text-slate-100 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Lightbulb className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Manual de Boas Práticas</h3>
              <p className="text-xs text-slate-400">Gestão Profissional de Almoxarifado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Context Indicator */}
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs">
          <span className="text-blue-800 font-medium">
            Exibindo dicas contextualizadas para:
          </span>
          <span className="font-bold text-blue-900 uppercase font-mono px-2 py-0.5 bg-blue-100 rounded">
            {activeTab}
          </span>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2.5">
              Recomendações Prioritárias para esta tela
            </span>
            <div className="space-y-3">
              {contextualTips.map(tip => (
                <div
                  key={tip.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {tip.category}
                    </span>
                    {tip.referenceNorm && (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                        {tip.referenceNorm}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs">{tip.title}</h4>

                  <p className="text-slate-600 leading-relaxed font-medium">{tip.summary}</p>

                  <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                    <strong className="text-blue-700 block mb-0.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Aplicação Prática:
                    </strong>
                    {tip.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {otherTips.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block mb-2.5">
                Outras Boas Práticas Operacionais
              </span>
              <div className="space-y-3">
                {otherTips.map(tip => (
                  <div
                    key={tip.id}
                    className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-500 uppercase">
                        {tip.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{tip.context}</span>
                    </div>
                    <h5 className="font-bold text-slate-800">{tip.title}</h5>
                    <p className="text-slate-600 text-[11px]">{tip.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido, Continuar Navegando
          </button>
        </div>
      </div>
    </div>
  );
};
