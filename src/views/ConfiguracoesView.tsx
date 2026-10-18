import React, { useState } from 'react';
import { Clock, FileCheck2, Image, RotateCcw, Save, Settings, Shield, Sparkles, User, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { repository, restoreOfficialBackup } from '../services/storage';
import { Configuracao, Usuario } from '../types';

export const ConfiguracoesView: React.FC = () => {
  const { db, currentUser, setCurrentUser, showToast, setActiveTab, loadEmbeddedOfficial, isLoadingEmbedded } = useApp();

  const [config, setConfig] = useState<Configuracao>({ ...db.configuracao });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    repository.saveConfiguracao(config, currentUser.nome);
    showToast('Configurações salvas e aplicadas em todo o sistema!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Configurações do Sistema &amp; Parâmetros Operacionais</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajuste as faixas de alerta de vencimento, data de referência para auditoria e dados institucionais.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Faixas de Alerta */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>1. Faixas de Alerta de Vencimento (Dias)</span>
          </div>

          <p className="text-xs text-slate-500">
            A alteração dos valores numéricos atualiza imediatamente os rótulos (ex.: &quot;≤30d&quot;), cores e contagens de todos os relatórios e do Dashboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                1ª Faixa (Laranja / Alerta Imediato):
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={config.faixa_1}
                onChange={(e) => setConfig({ ...config, faixa_1: parseInt(e.target.value) || 30 })}
                className="w-full text-xs p-2 bg-orange-50/50 border border-orange-300 rounded font-mono font-bold text-orange-950"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Padrão: 30 dias</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                2ª Faixa (Amarelo / Alerta Médio):
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={config.faixa_2}
                onChange={(e) => setConfig({ ...config, faixa_2: parseInt(e.target.value) || 60 })}
                className="w-full text-xs p-2 bg-yellow-50/50 border border-yellow-300 rounded font-mono font-bold text-yellow-950"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Padrão: 60 dias</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                3ª Faixa (Amarelo Claro / Planejamento):
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={config.faixa_3}
                onChange={(e) => setConfig({ ...config, faixa_3: parseInt(e.target.value) || 90 })}
                className="w-full text-xs p-2 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-amber-950"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Padrão: 90 dias</span>
            </div>
          </div>
        </div>

        {/* Card 2: Data de Referência e Responsável Técnico */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <FileCheck2 className="w-4 h-4 text-sky-700" />
            <span>2. Dados Institucionais &amp; Parâmetros de Impressão</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Data de Referência (Simulações e Auditoria):
              </label>
              <input
                type="date"
                required
                value={config.data_referencia}
                onChange={(e) => setConfig({ ...config, data_referencia: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Padrão da auditoria: 15/10/2026
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Responsável Técnico Oficial:
              </label>
              <input
                type="text"
                required
                value={config.responsavel_tecnico}
                onChange={(e) => setConfig({ ...config, responsavel_tecnico: e.target.value })}
                placeholder="Ex.: Alysson Rabelo - Technical Responsible"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Impresso no rodapé da Lista de Designação
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Limite de Linhas por Página A4 (Alerta):
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={config.limite_linhas_pagina}
                onChange={(e) =>
                  setConfig({ ...config, limite_linhas_pagina: parseInt(e.target.value) || 40 })
                }
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Recomendado para caber em 1 página: 40 linhas
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destacar Vencimentos na Lista de Designação:
              </label>
              <select
                value={config.destacar_vencimentos_padrao ? 'SIM' : 'NAO'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    destacar_vencimentos_padrao: e.target.value === 'SIM',
                  })
                }
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded font-semibold"
              >
                <option value="SIM">SIM (Cores de alerta ativadas por padrão)</option>
                <option value="NAO">NÃO (Impressão monocromática formal)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Perfis de Usuário */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-sky-700" />
            <span>3. Controle de Perfis e Permissões (RBAC)</span>
          </div>

          <p className="text-xs text-slate-500">
            Alterne o usuário ativo no canto superior direito para testar os perfis de acesso:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {db.usuarios.map((u) => {
              const isSelected = currentUser.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-50 border-sky-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{u.nome}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        u.perfil === 'Admin'
                          ? 'bg-purple-100 text-purple-900'
                          : u.perfil === 'Editor'
                          ? 'bg-sky-100 text-sky-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.perfil}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">{u.email}</div>
                  <div className="text-[10px] text-slate-400 mt-2">
                    {u.perfil === 'Admin' && 'Permissão total (cadastro, faixas, auditoria)'}
                    {u.perfil === 'Editor' && 'CRUD de licenças, treinamentos e pessoas'}
                    {u.perfil === 'Leitor' && 'Somente consulta e impressão de relatórios'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Base Oficial de Referência */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-sky-700" />
            <span>4. Base Oficial de Referência &amp; Cópia Salva</span>
          </div>

          <p className="text-xs text-sky-800 leading-relaxed">
            Restaure a cópia oficial auditada ou recarregue os dados originais a qualquer momento sem perder o histórico de auditoria. Nunca gera dados fictícios.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={async () => {
                if (confirm('Deseja restaurar a última base oficial salva?')) {
                  const ok = await restoreOfficialBackup(currentUser.nome);
                  if (ok) showToast('Base oficial restaurada com sucesso!');
                  else alert('Falha ao restaurar base oficial.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-900 text-white rounded-md text-xs font-semibold hover:bg-sky-800 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Base Oficial de Referência</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('importar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-300 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Gerenciar Importação &amp; Exportação (.json / .xlsx)</span>
            </button>
          </div>
        </div>

        {currentUser.perfil !== 'Leitor' && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-900 text-white rounded-lg text-xs font-semibold hover:bg-sky-800 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações Globais</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
