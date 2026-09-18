import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { MaterialsView } from './components/MaterialsView';
import { MovementsView } from './components/MovementsView';
import { RequisitionsView } from './components/RequisitionsView';
import { ReportsView } from './components/ReportsView';
import { IndicatorsView } from './components/IndicatorsView';
import { MaterialModal } from './components/MaterialModal';
import { MovementModal } from './components/MovementModal';
import { RequisitionModal } from './components/RequisitionModal';
import { RequisitionPrintModal } from './components/RequisitionPrintModal';
import { BestPracticesDrawer } from './components/BestPracticesDrawer';
import { AuthModal } from './components/AuthModal';
import { SystemInfoModal } from './components/SystemInfoModal';
import { api } from './services/api';
import { Material, Movement, Requisition, TechnicalManager, WarehouseKPIs, RequisitionStatus, MovementType } from './types';
import { initialManager } from './data/initialData';
import { Lightbulb, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('materiais');

  // Application Data
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [manager, setManager] = useState<TechnicalManager>(initialManager);
  const [kpis, setKpis] = useState<WarehouseKPIs>({
    totalItems: 0,
    totalQuantity: 0,
    totalValuation: 0,
    lowStockItemsCount: 0,
    outOfStockItemsCount: 0,
    rotatividade: 2.8,
    acuracia: 98.4,
    tempoMedioAtendimentoHoras: 3.2,
    taxaRuptura: 0,
    totalMovementsCount: 0,
    pendingRequisitionsCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementMaterial, setMovementMaterial] = useState<Material | null>(null);

  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSystemInfoOpen, setIsSystemInfoOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [showTopContextTip, setShowTopContextTip] = useState(true);

  // Notify helper
  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Load all initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [mats, movs, reqs, user, kpiData] = await Promise.all([
        api.getMaterials(),
        api.getMovements(),
        api.getRequisitions(),
        api.getUser(),
        api.getKPIs(),
      ]);

      setMaterials(mats);
      setMovements(movs);
      setRequisitions(reqs);
      setManager(user);
      setKpis(kpiData);
    } catch (err: any) {
      console.error('Falha ao carregar dados:', err);
      notify('error', 'Aviso: operando com base local sincronizada.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recalculate KPIs when items change
  const refreshKPIs = async () => {
    try {
      const updatedKPIs = await api.getKPIs();
      setKpis(updatedKPIs);
    } catch {
      // Ignored
    }
  };

  // -------------------------------------------------------------
  // Materials Actions
  // -------------------------------------------------------------
  const handleSaveMaterial = async (data: Omit<Material, 'id' | 'updatedAt'>) => {
    if (editingMaterial) {
      const updated = await api.updateMaterial(editingMaterial.id, data);
      setMaterials(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      notify('success', `Material "${updated.name}" atualizado com sucesso!`);
    } else {
      const created = await api.createMaterial(data);
      setMaterials(prev => [created, ...prev]);
      notify('success', `Material "${created.name}" cadastrado com sucesso!`);
    }
    refreshKPIs();
  };

  const handleDeleteMaterial = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o material "${name}"?`)) {
      try {
        await api.deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m.id !== id));
        notify('success', `Material "${name}" removido com sucesso.`);
        refreshKPIs();
      } catch (err: any) {
        notify('error', err.message || 'Falha ao excluir material');
      }
    }
  };

  // -------------------------------------------------------------
  // Movements Actions
  // -------------------------------------------------------------
  const handleSaveMovement = async (data: {
    materialId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    documentNumber?: string;
    responsibleUser: string;
    notes?: string;
  }) => {
    const result = await api.createMovement(data);
    setMovements(prev => [result.movement, ...prev]);

    // Update material locally
    if (result.updatedMaterial) {
      setMaterials(prev =>
        prev.map(m => (m.id === result.updatedMaterial!.id ? result.updatedMaterial! : m))
      );
    } else {
      // Refresh all materials
      const mats = await api.getMaterials();
      setMaterials(mats);
    }

    notify(
      'success',
      `Movimentação de ${data.type} (${data.quantity} un) registrada com sucesso!`
    );
    refreshKPIs();
  };

  const handleQuickMovement = (mat: Material) => {
    setMovementMaterial(mat);
    setIsMovementModalOpen(true);
  };

  // -------------------------------------------------------------
  // Requisitions Actions
  // -------------------------------------------------------------
  const handleSaveRequisition = async (data: {
    requesterName: string;
    department: string;
    priority: Requisition['priority'];
    items: Array<{ materialId: string; requestedQuantity: number }>;
    notes?: string;
    responsibleUser: string;
  }) => {
    const created = await api.createRequisition(data);
    setRequisitions(prev => [created, ...prev]);
    notify('success', `Requisição ${created.code} gerada com sucesso!`);
    refreshKPIs();
  };

  const handleFulfillRequisition = async (id: string) => {
    try {
      const fulfilled = await api.fulfillRequisition(id);
      setRequisitions(prev => prev.map(r => (r.id === id ? fulfilled : r)));
      if (selectedRequisition && selectedRequisition.id === id) {
        setSelectedRequisition(fulfilled);
      }

      // Reload materials and movements to reflect deductions
      const [mats, movs] = await Promise.all([api.getMaterials(), api.getMovements()]);
      setMaterials(mats);
      setMovements(movs);

      notify('success', `Requisição ${fulfilled.code} atendida! Baixas efetuadas no estoque.`);
      refreshKPIs();
    } catch (err: any) {
      notify('error', err.message || 'Falha ao atender requisição.');
    }
  };

  const handleUpdateRequisitionStatus = async (id: string, status: RequisitionStatus) => {
    try {
      const updated = await api.updateRequisitionStatus(id, status, manager.name);
      setRequisitions(prev => prev.map(r => (r.id === id ? updated : r)));
      notify('success', `Status da requisição ${updated.code} alterado para ${status}.`);
      refreshKPIs();
    } catch (err: any) {
      notify('error', err.message || 'Falha ao atualizar status.');
    }
  };

  const handleViewPrintRequisition = (req: Requisition) => {
    setSelectedRequisition(req);
    setIsPrintModalOpen(true);
  };

  // -------------------------------------------------------------
  // Technical Manager Actions
  // -------------------------------------------------------------
  const handleSaveManager = async (updatedManager: TechnicalManager) => {
    const saved = await api.updateUser(updatedManager);
    setManager(saved);
    notify('success', `Responsável Técnico alterado para: ${saved.name}`);
  };

  // -------------------------------------------------------------
  // Data Backup & Restore
  // -------------------------------------------------------------
  const handleDownloadBackup = () => {
    const backupSnapshot = {
      app: 'Controle de Estoque & Almoxarifado',
      exportedAt: new Date().toISOString(),
      manager,
      materials,
      movements,
      requisitions,
    };

    const blob = new Blob([JSON.stringify(backupSnapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_estoque_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('success', 'Backup JSON baixado com sucesso!');
  };

  const handleRestoreBackup = async (data: any) => {
    await api.restoreData(false, data);
    await loadData();
    notify('success', 'Backup restaurado e dados recarregados com sucesso!');
  };

  const handleResetToDemo = async () => {
    await api.restoreData(true);
    await loadData();
    notify('success', 'Dados de demonstração restaurados com sucesso!');
  };

  const pendingReqCount = requisitions.filter(r => r.status === 'PENDENTE' || r.status === 'APROVADA').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 no-print ${
            feedback.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-2 text-slate-300 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        manager={manager}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNewMaterial={() => {
          setEditingMaterial(null);
          setIsMaterialModalOpen(true);
        }}
        onOpenNewMovement={() => {
          setMovementMaterial(null);
          setIsMovementModalOpen(true);
        }}
        onOpenNewRequisition={() => setIsRequisitionModalOpen(true)}
        onToggleTips={() => setIsTipsOpen(!isTipsOpen)}
        onOpenSystemInfo={() => setIsSystemInfoOpen(true)}
        totalMaterialsCount={materials.length}
        pendingRequisitionsCount={pendingReqCount}
        tipsOpen={isTipsOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Contextual Smart Tip Banner */}
        {showTopContextTip && (
          <div className="mb-6 p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 shadow-2xs no-print">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <strong className="font-semibold">Boas Práticas de Almoxarifado:</strong>{' '}
                {activeTab === 'materiais' &&
                  'Padronize os nomes com a metodologia PDM (Nome básico + características + dimensões) para eliminar itens duplicados.'}
                {activeTab === 'movimentacoes' &&
                  'Adote o princípio PEPS (Primeiro que Entra, Primeiro que Sai) para expedição de materiais físicos.'}
                {activeTab === 'requisicoes' &&
                  'Nunca libere materiais sem requisição formal. A assinatura comprova a transferência de custódia do patrimônio.'}
                {activeTab === 'relatorios' &&
                  'Monitore os itens abaixo do ponto de reposição e antecipe pedidos de compra para prevenir rupturas operacionais.'}
                {activeTab === 'indicadores' &&
                  'Mantenha o IRA (Índice de Acurácia) acima de 98% por meio de inventários rotativos semanais nos itens Classe A.'}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={() => setIsTipsOpen(true)}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Ver Todas
              </button>
              <button
                onClick={() => setShowTopContextTip(false)}
                className="text-blue-400 hover:text-blue-600 p-1 rounded cursor-pointer"
                title="Dispensar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-2xs text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-700">Carregando dados do almoxarifado...</p>
            <p className="text-xs text-slate-400">Verificando estoque físico e movimentações registradas.</p>
          </div>
        ) : (
          <>
            {activeTab === 'materiais' && (
              <MaterialsView
                materials={materials}
                onOpenAddModal={() => {
                  setEditingMaterial(null);
                  setIsMaterialModalOpen(true);
                }}
                onEditMaterial={mat => {
                  setEditingMaterial(mat);
                  setIsMaterialModalOpen(true);
                }}
                onDeleteMaterial={handleDeleteMaterial}
                onQuickMovement={handleQuickMovement}
              />
            )}

            {activeTab === 'movimentacoes' && (
              <MovementsView
                movements={movements}
                onOpenNewMovement={() => {
                  setMovementMaterial(null);
                  setIsMovementModalOpen(true);
                }}
              />
            )}

            {activeTab === 'requisicoes' && (
              <RequisitionsView
                requisitions={requisitions}
                onOpenNewRequisition={() => setIsRequisitionModalOpen(true)}
                onViewPrintRequisition={handleViewPrintRequisition}
                onFulfillRequisition={handleFulfillRequisition}
                onUpdateStatus={handleUpdateRequisitionStatus}
              />
            )}

            {activeTab === 'relatorios' && (
              <ReportsView materials={materials} manager={manager} />
            )}

            {activeTab === 'indicadores' && (
              <IndicatorsView
                kpis={kpis}
                materials={materials}
                movements={movements}
                requisitions={requisitions}
              />
            )}
          </>
        )}
      </main>

      {/* Footer with Technical Manager credentials and persistence status */}
      <Footer
        manager={manager}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onDownloadBackup={handleDownloadBackup}
        onOpenSystemInfo={() => setIsSystemInfoOpen(true)}
      />

      {/* Modals & Drawers */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
        editingMaterial={editingMaterial}
      />

      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        materials={materials}
        selectedMaterial={movementMaterial}
        responsibleUserName={manager.name}
        onSave={handleSaveMovement}
      />

      <RequisitionModal
        isOpen={isRequisitionModalOpen}
        onClose={() => setIsRequisitionModalOpen(false)}
        materials={materials}
        responsibleUserName={manager.name}
        onSave={handleSaveRequisition}
      />

      <RequisitionPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        requisition={selectedRequisition}
        manager={manager}
        onFulfillRequisition={handleFulfillRequisition}
      />

      <BestPracticesDrawer
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
        activeTab={activeTab}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentManager={manager}
        onSaveManager={handleSaveManager}
      />

      <SystemInfoModal
        isOpen={isSystemInfoOpen}
        onClose={() => setIsSystemInfoOpen(false)}
        onDownloadBackup={handleDownloadBackup}
        onRestoreBackup={handleRestoreBackup}
        onResetToDemo={handleResetToDemo}
      />
    </div>
  );
}
