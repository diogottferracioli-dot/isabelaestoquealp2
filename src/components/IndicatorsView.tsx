import React, { useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Clock,
  AlertOctagon,
  Boxes,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Material, Movement, Requisition, WarehouseKPIs } from '../types';

interface IndicatorsViewProps {
  kpis: WarehouseKPIs;
  materials: Material[];
  movements: Movement[];
  requisitions: Requisition[];
}

export const IndicatorsView: React.FC<IndicatorsViewProps> = ({
  kpis,
  materials,
  movements,
  requisitions,
}) => {
  // Category breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    materials.forEach(m => {
      const cur = map.get(m.category) || { count: 0, value: 0 };
      cur.count += 1;
      cur.value += m.quantity * m.unitCost;
      map.set(m.category, cur);
    });

    const totalVal = Array.from(map.values()).reduce((acc, v) => acc + v.value, 0) || 1;
    return Array.from(map.entries())
      .map(([cat, stats]) => ({
        category: cat,
        count: stats.count,
        value: stats.value,
        percentage: Number(((stats.value / totalVal) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [materials]);

  // ABC Analysis
  const abcAnalysis = useMemo(() => {
    const sorted = [...materials]
      .map(m => ({ ...m, totalValue: m.quantity * m.unitCost }))
      .sort((a, b) => b.totalValue - a.totalValue);

    const totalVal = sorted.reduce((acc, m) => acc + m.totalValue, 0) || 1;
    let accumulated = 0;

    return sorted.map(m => {
      accumulated += m.totalValue;
      const share = (accumulated / totalVal) * 100;
      let classification = 'C';
      if (share <= 70) classification = 'A';
      else if (share <= 90) classification = 'B';
      return {
        ...m,
        class: classification,
        percentOfTotal: Number(((m.totalValue / totalVal) * 100).toFixed(1)),
      };
    });
  }, [materials]);

  const classACount = abcAnalysis.filter(m => m.class === 'A').length;
  const classBCount = abcAnalysis.filter(m => m.class === 'B').length;
  const classCCount = abcAnalysis.filter(m => m.class === 'C').length;

  return (
    <div className="space-y-6">
      {/* Top Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Rotatividade (Giro de Estoque) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rotatividade (Giro)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{kpis.rotatividade}x</span>
            <span className="text-xs font-medium text-emerald-600">/ ano</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Giro de reposição. Meta recomendada: de <strong>3,0x a 6,0x</strong> para materiais de manutenção.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Fórmula: Saídas anuais ÷ Estoque médio</span>
            <span className="text-emerald-600 font-semibold">Saudável</span>
          </div>
        </div>

        {/* 2. Acurácia de Inventário (IRA) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Acurácia de Estoque
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{kpis.acuracia}%</span>
            <span className="text-xs font-medium text-slate-400">IRA</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Concordância física x sistema. Meta padrão mundial: <strong>≥ 98,0%</strong> em auditorias.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Contagens Cíclicas: Semanais</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Conforme
            </span>
          </div>
        </div>

        {/* 3. Tempo Médio de Atendimento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tempo Médio Atendimento
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{kpis.tempoMedioAtendimentoHoras}h</span>
            <span className="text-xs font-medium text-slate-400">lead time</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tempo médio desde a abertura da requisição até a baixa/entrega física dos materiais.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Meta: &lt; 4h (Padrão) / &lt; 1h (Urgente)</span>
            <span className="text-blue-600 font-semibold">Dentro do SLA</span>
          </div>
        </div>

        {/* 4. Taxa de Ruptura (Stockout Rate) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa de Ruptura
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                kpis.taxaRuptura > 5 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {kpis.taxaRuptura}%
            </span>
            <span className="text-xs font-medium text-slate-400">
              ({kpis.outOfStockItemsCount} itens zerados)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Percentual do catálogo com saldo zero. Meta: <strong>&lt; 2,0%</strong> para evitar paralisações.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Estoque mínimo atingido: {kpis.lowStockItemsCount} itens</span>
            <span className={kpis.taxaRuptura <= 5 ? 'text-amber-600 font-semibold' : 'text-rose-600 font-bold'}>
              Atenção Compras
            </span>
          </div>
        </div>
      </div>

      {/* Analytical Section: Category Distribution & ABC Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                Composição do Estoque por Categoria
              </h3>
              <p className="text-xs text-slate-500">Distribuição do valor financeiro estocado</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              Total: R$ {kpis.totalValuation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map(stat => (
              <div key={stat.category} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{stat.category}</span>
                    <span className="text-slate-400 text-[11px]">({stat.count} itens)</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-900">
                      R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="w-12 text-right font-mono font-bold text-slate-600">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curva ABC de Gestão de Materiais */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  Classificação Curva ABC
                </h3>
                <p className="text-xs text-slate-500">Priorização estratégica baseada no Princípio de Pareto</p>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
                Norma Logística
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Classe A</span>
                <span className="text-xl font-bold text-emerald-900">{classACount} itens</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">~70% do capital (Alta Atenção)</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-800 uppercase block">Classe B</span>
                <span className="text-xl font-bold text-blue-900">{classBCount} itens</span>
                <span className="text-[10px] text-blue-700 block mt-0.5">~20% do capital (Médio Impacto)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-800 uppercase block">Classe C</span>
                <span className="text-xl font-bold text-slate-900">{classCCount} itens</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">~10% do capital (Itens Menores)</span>
              </div>
            </div>

            {/* Top Value Materials List */}
            <div className="text-xs">
              <span className="font-semibold text-slate-700 block mb-2">
                Top Itens de Maior Valor em Estoque (Classe A):
              </span>
              <div className="space-y-1.5">
                {abcAnalysis.slice(0, 4).map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                        {m.class}
                      </span>
                      <span className="font-mono text-slate-800 text-[11px]">{m.code}</span>
                      <span className="font-medium text-slate-900 truncate max-w-xs">{m.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 whitespace-nowrap">
                      R$ {m.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Boas Práticas:</strong> Realize inventário rotativo diário nos itens Classe A para garantir acurácia absoluta e evitar desvios no ativo imobilizado.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
