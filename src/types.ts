export type UnitOfMeasure = 'UN' | 'CX' | 'KG' | 'M' | 'PAR' | 'PCT' | 'L' | 'ROLO' | 'JOGO';

export type MaterialCategory =
  | 'Elétrica'
  | 'Hidráulica'
  | 'EPI & Segurança'
  | 'Ferramentas'
  | 'Civil & Pintura'
  | 'Mecânica & Fixação'
  | 'Escritório & TI'
  | 'Geral';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  minQuantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  location: string;
  description?: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA';

export type MovementReason =
  | 'Compra / Nota Fiscal'
  | 'Devolução de Material'
  | 'Ajuste de Inventário (Entrada)'
  | 'Atendimento de Requisição'
  | 'Consumo Operacional'
  | 'Ajuste de Inventário (Saída)'
  | 'Avaria / Descarte'
  | 'Transferência';

export interface Movement {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  type: MovementType;
  quantity: number;
  unit: UnitOfMeasure;
  date: string;
  reason: MovementReason | string;
  documentNumber?: string;
  responsibleUser: string;
  notes?: string;
}

export type RequisitionPriority = 'BAIXA' | 'NORMAL' | 'URGENTE';
export type RequisitionStatus = 'PENDENTE' | 'APROVADA' | 'ATENDIDA' | 'CANCELADA';

export interface RequisitionItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  requestedQuantity: number;
  deliveredQuantity: number;
  unit: UnitOfMeasure;
}

export interface Requisition {
  id: string;
  code: string;
  date: string;
  requesterName: string;
  department: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  items: RequisitionItem[];
  notes?: string;
  responsibleUser: string;
  approvedBy?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface TechnicalManager {
  id: string;
  name: string;
  role: string;
  registration: string; // Ex: CREA, CRA ou Matrícula
  department: string;
  email: string;
}

export interface WarehouseKPIs {
  totalItems: number;
  totalQuantity: number;
  totalValuation: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  rotatividade: number; // Giro de estoque anualizado
  acuracia: number; // % Acurácia de inventário
  tempoMedioAtendimentoHoras: number; // Horas médias para atender requisição
  taxaRuptura: number; // % Itens zerados sobre o catálogo
  totalMovementsCount: number;
  pendingRequisitionsCount: number;
}

export interface BestPracticeTip {
  id: string;
  category: string;
  title: string;
  context: 'materiais' | 'movimentacoes' | 'requisicoes' | 'relatorios' | 'indicadores' | 'geral';
  summary: string;
  recommendation: string;
  referenceNorm?: string;
}
