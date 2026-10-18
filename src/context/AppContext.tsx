import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  activeAdapter,
  DatabaseState,
  generateConferenceData,
  loadDatabase,
  loadEmbeddedOfficialData,
  PostImportConferenceData,
  repository,
  subscribeToDatabase,
} from '../services/storage';
import { CategoriaPessoa, SituacaoPessoa, Usuario } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'designacao'
  | 'roster'
  | 'conferencia'
  | 'pessoas'
  | 'ficha'
  | 'licencas'
  | 'treinamentos'
  | 'motores'
  | 'matrizes'
  | 'vencimentos'
  | 'catalogo'
  | 'designacoes_crud'
  | 'importar'
  | 'configuracoes'
  | 'auditoria'
  | 'manual';

interface AppContextType {
  db: DatabaseState;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // Global Filters
  filtroBase: string; // 'TOTAL' or specific base like 'REC'
  setFiltroBase: (base: string) => void;
  filtroCategoria: 'Mecânico' | 'Administrativo' | 'Todos';
  setFiltroCategoria: (cat: 'Mecânico' | 'Administrativo' | 'Todos') => void;
  filtroSituacao: 'Ativo' | 'Inativo' | 'Todos';
  setFiltroSituacao: (sit: 'Ativo' | 'Inativo' | 'Todos') => void;
  buscaGlobal: string;
  setBuscaGlobal: (q: string) => void;
  dataReferencia: string;
  setDataReferencia: (date: string) => void;
  faixas: { faixa_1: number; faixa_2: number; faixa_3: number };
  setFaixas: (faixas: { faixa_1: number; faixa_2: number; faixa_3: number }) => void;
  // Selected person for Ficha do Mecânico
  selectedPessoaId: string | null;
  setSelectedPessoaId: (id: string | null) => void;
  navigateToFicha: (pessoaId: string) => void;
  // User profile
  currentUser: Usuario;
  setCurrentUser: (user: Usuario) => void;
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Print trigger
  triggerPrint: () => void;
  // Post-import conference
  lastConferenceData: PostImportConferenceData | null;
  setLastConferenceData: (data: PostImportConferenceData | null) => void;
  loadEmbeddedOfficial: () => Promise<void>;
  isLoadingEmbedded: boolean;
  // Cloud & Connection status
  isCloud: boolean;
  isOffline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseState>(loadDatabase());
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [filtroBase, setFiltroBase] = useState<string>('TOTAL');
  const [filtroCategoria, setFiltroCategoria] = useState<'Mecânico' | 'Administrativo' | 'Todos'>('Mecânico');
  const [filtroSituacao, setFiltroSituacao] = useState<'Ativo' | 'Inativo' | 'Todos'>('Ativo');
  const [buscaGlobal, setBuscaGlobal] = useState<string>('');
  const [selectedPessoaId, setSelectedPessoaId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastConferenceData, setLastConferenceData] = useState<PostImportConferenceData | null>(null);
  const [isLoadingEmbedded, setIsLoadingEmbedded] = useState<boolean>(false);

  const [dataReferencia, setDataReferenciaState] = useState<string>(
    db.configuracao?.data_referencia || '2026-10-15'
  );
  const [faixas, setFaixasState] = useState<{ faixa_1: number; faixa_2: number; faixa_3: number }>({
    faixa_1: db.configuracao?.faixa_1 || 30,
    faixa_2: db.configuracao?.faixa_2 || 60,
    faixa_3: db.configuracao?.faixa_3 || 90,
  });

  const [currentUser, setCurrentUser] = useState<Usuario>(
    db.usuarios?.[0] || {
      id: 'USR-01',
      nome: 'Alysson Rabelo',
      email: 'alysson.rabelo@impactoaviation.com',
      perfil: 'Admin',
    }
  );

  // Set initial selected person once persons exist
  useEffect(() => {
    if (!selectedPessoaId && db.pessoas.length > 0) {
      setSelectedPessoaId(db.pessoas[0].id);
    }
  }, [db.pessoas, selectedPessoaId]);

  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      const updated = loadDatabase();
      setDb({ ...updated });
      if (updated.configuracao) {
        setDataReferenciaState(updated.configuracao.data_referencia);
        setFaixasState({
          faixa_1: updated.configuracao.faixa_1,
          faixa_2: updated.configuracao.faixa_2,
          faixa_3: updated.configuracao.faixa_3,
        });
      }
    });
    return unsubscribe;
  }, []);

  const setDataReferencia = (d: string) => {
    setDataReferenciaState(d);
    repository.saveConfiguracao({ ...db.configuracao, data_referencia: d }, currentUser.nome);
  };

  const setFaixas = (newFaixas: { faixa_1: number; faixa_2: number; faixa_3: number }) => {
    setFaixasState(newFaixas);
    repository.saveConfiguracao({ ...db.configuracao, ...newFaixas }, currentUser.nome);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const navigateToFicha = (pessoaId: string) => {
    setSelectedPessoaId(pessoaId);
    setActiveTab('ficha');
  };

  const triggerPrint = () => {
    window.print();
  };

  const loadEmbeddedOfficial = async () => {
    setIsLoadingEmbedded(true);
    try {
      const confData = await loadEmbeddedOfficialData(currentUser.nome);
      setLastConferenceData(confData);
      showToast('Dados oficiais embutidos carregados com sucesso!');
      setActiveTab('importar');
    } catch (err: any) {
      alert(`Erro ao carregar dados oficiais embutidos: ${err?.message || err}`);
    } finally {
      setIsLoadingEmbedded(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        db,
        activeTab,
        setActiveTab,
        filtroBase,
        setFiltroBase,
        filtroCategoria,
        setFiltroCategoria,
        filtroSituacao,
        setFiltroSituacao,
        buscaGlobal,
        setBuscaGlobal,
        dataReferencia,
        setDataReferencia,
        faixas,
        setFaixas,
        selectedPessoaId,
        setSelectedPessoaId,
        navigateToFicha,
        currentUser,
        setCurrentUser,
        toastMessage,
        showToast,
        triggerPrint,
        lastConferenceData,
        setLastConferenceData,
        loadEmbeddedOfficial,
        isLoadingEmbedded,
        isCloud: activeAdapter.isCloud,
        isOffline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
