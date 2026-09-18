import React, { useState, useEffect } from 'react';
import { X, UserCheck, Shield, Save, Check } from 'lucide-react';
import { TechnicalManager } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentManager: TechnicalManager;
  onSaveManager: (manager: TechnicalManager) => Promise<void>;
}

const PRESET_USERS: TechnicalManager[] = [
  {
    id: 'usr-001',
    name: 'Eng. Diogo T. Ferracioli',
    role: 'Responsável Técnico / Almoxarife Geral',
    registration: 'CREA-SP 249.182/D',
    department: 'Coordenação de Suprimentos & Almoxarifado',
    email: 'diogottferracioli@gmail.com',
  },
  {
    id: 'usr-002',
    name: 'Mariana S. Rocha',
    role: 'Supervisora de Logística & Inventário',
    registration: 'CRA-SP 89.201',
    department: 'Gestão de Materiais & Almoxarifado',
    email: 'mariana.rocha@almoxarifado.com.br',
  },
  {
    id: 'usr-003',
    name: 'Carlos Alberto Mendonça',
    role: 'Técnico em Logística / Almoxarife Líder',
    registration: 'Matrícula 04.912-SP',
    department: 'Operações de Armazenagem',
    email: 'carlos.mendonca@almoxarifado.com.br',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentManager,
  onSaveManager,
}) => {
  const [name, setName] = useState(currentManager.name);
  const [registration, setRegistration] = useState(currentManager.registration);
  const [role, setRole] = useState(currentManager.role);
  const [department, setDepartment] = useState(currentManager.department);
  const [email, setEmail] = useState(currentManager.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentManager.name);
    setRegistration(currentManager.registration);
    setRole(currentManager.role);
    setDepartment(currentManager.department);
    setEmail(currentManager.email);
    setError(null);
  }, [currentManager, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: TechnicalManager) => {
    setName(preset.name);
    setRegistration(preset.registration);
    setRole(preset.role);
    setDepartment(preset.department);
    setEmail(preset.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !registration.trim()) {
      setError('Nome e registro profissional são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveManager({
        id: currentManager.id,
        name: name.trim(),
        registration: registration.trim(),
        role: role.trim() || 'Responsável Técnico',
        department: department.trim() || 'Almoxarifado',
        email: email.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar identificação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Identificação do Responsável Técnico</h3>
              <p className="text-xs text-slate-500">Credenciamento operacional para relatórios e requisições</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Troca Rápida de Perfil / Operador
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_USERS.map(p => {
                const isSelected = p.name === name;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.role} • {p.registration}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Dados do Usuário Ativo
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo do Responsável Técnico <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registro Profissional (CREA/CRA/Matrícula) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={registration}
                onChange={e => setRegistration(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Função
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento / Almoxarifado
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Responsável'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
