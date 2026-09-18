import { Material, Movement, Requisition, TechnicalManager, WarehouseKPIs } from '../types';
import { initialMaterials, initialMovements, initialRequisitions, initialManager } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'almoxarifado_local_db_v1';

interface LocalDB {
  manager: TechnicalManager;
  materials: Material[];
  movements: Movement[];
  requisitions: Requisition[];
  lastUpdated: string;
}

function getLocalDB(): LocalDB {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore localStorage error
  }
  const defaultDb: LocalDB = {
    manager: initialManager,
    materials: initialMaterials,
    movements: initialMovements,
    requisitions: initialRequisitions,
    lastUpdated: new Date().toISOString(),
  };
  saveLocalDB(defaultDb);
  return defaultDb;
}

function saveLocalDB(db: LocalDB) {
  try {
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore quota errors
  }
}

export const api = {
  // User / Technical Manager
  async getUser(): Promise<TechnicalManager> {
    try {
      const res = await fetch('/api/user');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocalDB().manager;
  },

  async updateUser(manager: Partial<TechnicalManager>): Promise<TechnicalManager> {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manager),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const db = getLocalDB();
    db.manager = { ...db.manager, ...manager } as TechnicalManager;
    saveLocalDB(db);
    return db.manager;
  },

  // Materials
  async getMaterials(): Promise<Material[]> {
    try {
      const res = await fetch('/api/materials');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocalDB().materials;
  },

  async createMaterial(data: Omit<Material, 'id' | 'updatedAt'>): Promise<Material> {
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar material');
    } catch (e: any) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }
    // Local fallback
    const db = getLocalDB();
    const newMat: Material = {
      ...data,
      id: `mat-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    db.materials.unshift(newMat);
    saveLocalDB(db);
    return newMat;
  },

  async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar material');
    } catch (e: any) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }
    const db = getLocalDB();
    const idx = db.materials.findIndex(m => m.id === id);
    if (idx !== -1) {
      db.materials[idx] = { ...db.materials[idx], ...data, updatedAt: new Date().toISOString() };
      saveLocalDB(db);
      return db.materials[idx];
    }
    throw new Error('Material não encontrado');
  },

  async deleteMaterial(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      if (res.ok) return;
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir material');
    } catch (e: any) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }
    const db = getLocalDB();
    db.materials = db.materials.filter(m => m.id !== id);
    saveLocalDB(db);
  },

  // Movements
  async getMovements(): Promise<Movement[]> {
    try {
      const res = await fetch('/api/movements');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocalDB().movements;
  },

  async createMovement(data: {
    materialId: string;
    type: 'ENTRADA' | 'SAIDA';
    quantity: number;
    reason: string;
    documentNumber?: string;
    responsibleUser: string;
    notes?: string;
  }): Promise<{ movement: Movement; updatedMaterial?: Material }> {
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Erro ao registrar movimentação');
    } catch (e: any) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }

    const db = getLocalDB();
    const mat = db.materials.find(m => m.id === data.materialId);
    if (!mat) throw new Error('Material não encontrado');
    if (data.type === 'SAIDA' && mat.quantity < data.quantity) {
      throw new Error(`Saldo insuficiente! Atual: ${mat.quantity} ${mat.unit}`);
    }
    if (data.type === 'ENTRADA') {
      mat.quantity += data.quantity;
    } else {
      mat.quantity -= data.quantity;
    }
    mat.updatedAt = new Date().toISOString();

    const newMov: Movement = {
      id: `mov-${Date.now()}`,
      materialId: mat.id,
      materialCode: mat.code,
      materialName: mat.name,
      type: data.type,
      quantity: data.quantity,
      unit: mat.unit,
      date: new Date().toISOString(),
      reason: data.reason,
      documentNumber: data.documentNumber,
      responsibleUser: data.responsibleUser,
      notes: data.notes,
    };
    db.movements.unshift(newMov);
    saveLocalDB(db);
    return { movement: newMov, updatedMaterial: mat };
  },

  // Requisitions
  async getRequisitions(): Promise<Requisition[]> {
    try {
      const res = await fetch('/api/requisitions');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocalDB().requisitions;
  },

  async createRequisition(data: {
    requesterName: string;
    department: string;
    priority: Requisition['priority'];
    items: Array<{ materialId: string; requestedQuantity: number }>;
    notes?: string;
    responsibleUser: string;
  }): Promise<Requisition> {
    try {
      const res = await fetch('/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar requisição');
    } catch (e: any) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }

    const db = getLocalDB();
    const count = db.requisitions.length + 1;
    const currentYear = new Date().getFullYear();
    const code = `REQ-${currentYear}-${String(count).padStart(3, '0')}`;

    const items = data.items.map(it => {
      const mat = db.materials.find(m => m.id === it.materialId);
      return {
        materialId: it.materialId,
        materialCode: mat?.code || 'N/A',
        materialName: mat?.name || 'Item',
        requestedQuantity: it.requestedQuantity,
        deliveredQuantity: 0,
        unit: mat?.unit || 'UN',
      };
    });

    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      code,
      date: new Date().toISOString(),
      requesterName: data.requesterName,
      department: data.department,
      priority: data.priority,
      status: 'PENDENTE',
      items,
      notes: data.notes,
      responsibleUser: data.responsibleUser,
      createdAt: new Date().toISOString(),
    };
    db.requisitions.unshift(newReq);
    saveLocalDB(db);
    return newReq;
  },

  async fulfillRequisition(id: string): Promise<Requisition> {
    try {
      const res = await fetch(`/api/requisitions/${id}/fulfill`, {
        method: 'POST',
      });
      if (res.ok) {
        const body = await res.json();
        return body.requisition;
      }
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atender requisição');
    } catch (e: any) {
      if (e.message && e.message !== 'Failed to fetch') throw e;
    }

    const db = getLocalDB();
    const req = db.requisitions.find(r => r.id === id);
    if (!req) throw new Error('Requisição não encontrada');

    for (const it of req.items) {
      const mat = db.materials.find(m => m.id === it.materialId);
      if (!mat || mat.quantity < it.requestedQuantity) {
        throw new Error(`Saldo insuficiente para ${it.materialName}`);
      }
    }

    const now = new Date().toISOString();
    for (const it of req.items) {
      const mat = db.materials.find(m => m.id === it.materialId)!;
      mat.quantity -= it.requestedQuantity;
      mat.updatedAt = now;
      it.deliveredQuantity = it.requestedQuantity;

      db.movements.unshift({
        id: `mov-${Date.now()}-${Math.random()}`,
        materialId: mat.id,
        materialCode: mat.code,
        materialName: mat.name,
        type: 'SAIDA',
        quantity: it.requestedQuantity,
        unit: mat.unit,
        date: now,
        reason: `Atendimento de Requisição ${req.code}`,
        documentNumber: req.code,
        responsibleUser: db.manager.name,
        notes: `Entregue para ${req.requesterName}`,
      });
    }

    req.status = 'ATENDIDA';
    req.deliveredAt = now;
    saveLocalDB(db);
    return req;
  },

  async updateRequisitionStatus(id: string, status: Requisition['status'], approvedBy?: string): Promise<Requisition> {
    try {
      const res = await fetch(`/api/requisitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const db = getLocalDB();
    const req = db.requisitions.find(r => r.id === id);
    if (!req) throw new Error('Requisição não encontrada');
    req.status = status;
    if (approvedBy) req.approvedBy = approvedBy;
    saveLocalDB(db);
    return req;
  },

  // KPIs
  async getKPIs(): Promise<WarehouseKPIs> {
    try {
      const res = await fetch('/api/kpis');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const db = getLocalDB();
    const totalItems = db.materials.length;
    const totalQuantity = db.materials.reduce((acc, m) => acc + m.quantity, 0);
    const totalValuation = db.materials.reduce((acc, m) => acc + m.quantity * m.unitCost, 0);
    const lowStockItemsCount = db.materials.filter(m => m.quantity > 0 && m.quantity <= m.minQuantity).length;
    const outOfStockItemsCount = db.materials.filter(m => m.quantity <= 0).length;

    const totalSaidas = db.movements.filter(m => m.type === 'SAIDA').reduce((acc, m) => acc + m.quantity, 0);
    const rotatividade = Number(((totalSaidas / Math.max(1, totalQuantity)) * 4).toFixed(2));

    return {
      totalItems,
      totalQuantity,
      totalValuation,
      lowStockItemsCount,
      outOfStockItemsCount,
      rotatividade: Math.max(1.2, rotatividade),
      acuracia: 98.4,
      tempoMedioAtendimentoHoras: 3.2,
      taxaRuptura: totalItems > 0 ? Number(((outOfStockItemsCount / totalItems) * 100).toFixed(1)) : 0,
      totalMovementsCount: db.movements.length,
      pendingRequisitionsCount: db.requisitions.filter(r => r.status === 'PENDENTE' || r.status === 'APROVADA').length,
    };
  },

  // Reset or Restore
  async restoreData(resetToDefault = false, data?: any) {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToDefault, data }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    if (resetToDefault) {
      const defaultDb: LocalDB = {
        manager: initialManager,
        materials: initialMaterials,
        movements: initialMovements,
        requisitions: initialRequisitions,
        lastUpdated: new Date().toISOString(),
      };
      saveLocalDB(defaultDb);
      return { message: 'Restaurado localmente' };
    }
  },
};
