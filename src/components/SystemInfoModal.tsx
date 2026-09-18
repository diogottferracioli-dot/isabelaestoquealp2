import React, { useState, useRef } from 'react';
import {
  X,
  Terminal,
  Cloud,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileCode,
} from 'lucide-react';

interface SystemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (data: any) => Promise<void>;
  onResetToDemo: () => Promise<void>;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({
  isOpen,
  onClose,
  onDownloadBackup,
  onRestoreBackup,
  onResetToDemo,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        setIsProcessing(true);
        const parsed = JSON.parse(event.target?.result as string);
        await onRestoreBackup(parsed);
        setStatusMessage({ type: 'success', text: 'Backup restaurado com sucesso!' });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Arquivo inválido ou corrompido: ' + err.message });
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (window.confirm('Deseja realmente restaurar os dados iniciais de demonstração? Quaisquer alterações locais não salvas em backup serão redefinidas.')) {
      try {
        setIsProcessing(true);
        await onResetToDemo();
        setStatusMessage({ type: 'success', text: 'Dados de demonstração restaurados com sucesso!' });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Falha ao restaurar: ' + err.message });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-slate-100 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instruções de Deploy, Execução & Persistência</h3>
              <p className="text-xs text-slate-400">Guia técnico e ferramentas de gerenciamento de dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Data persistence & Backup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">Persistência de Dados & Backup</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              O sistema utiliza persistência automática em arquivo JSON estruturado no backend (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">data/almoxarifado_db.json</code>) com espelhamento no <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">localStorage</code> do navegador. Os dados permanecem salvos entre sessões.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onDownloadBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Backup JSON
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Restaurar Backup JSON
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-200 rounded-lg font-semibold transition-colors cursor-pointer ml-auto"
                title="Voltar aos itens padrão de demonstração"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Redefinir Padrão Demo
              </button>
            </div>
          </div>

          {/* Section 2: Local Execution */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <h4 className="font-bold text-slate-900 text-sm">Como Executar Localmente</h4>
            </div>
            <p className="text-slate-600">
              Certifique-se de ter o <strong>Node.js 20+</strong> instalado. No terminal do projeto:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto">
              <div><span className="text-slate-500"># 1. Instalar dependências</span></div>
              <div className="text-emerald-400">npm install</div>
              <div className="pt-1"><span className="text-slate-500"># 2. Iniciar servidor de desenvolvimento (Porta 3000)</span></div>
              <div className="text-emerald-400">npm run dev</div>
              <div className="pt-1"><span className="text-slate-500"># 3. Compilação para produção</span></div>
              <div className="text-emerald-400">npm run build && npm start</div>
            </div>
          </div>

          {/* Section 3: Deploy to Production */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-slate-700" />
              <h4 className="font-bold text-slate-900 text-sm">Opções de Deploy em Produção</h4>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong className="text-slate-900 block mb-1">Opção 1: Google Cloud Run (Recomendado)</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  O projeto já está configurado com container Node.js e Express na porta 3000, pronto para deploy direto no Cloud Run via console do Google Cloud ou AI Studio.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong className="text-slate-900 block mb-1">Opção 2: Vercel / Vercel Blob</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Para deploy no Vercel com persistência distribuída na nuvem, basta configurar a variável de ambiente <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">BLOB_READ_WRITE_TOKEN</code> nas configurações do projeto Vercel Blob. O sistema detectará o token e manterá o snapshot sincronizado remotamente.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <strong className="text-slate-900 block mb-1">Opção 3: Docker Container</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Execute <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">docker build -t almoxarifado .</code> e mapeie o volume da pasta <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">/data</code> para manter a persistência de disco permanente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
