import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ClientApp } from './components/client/ClientApp';
import { TeamPortal } from './components/team/TeamPortal';
import { AIChatBot } from './components/common/AIChatBot';

const MainContent: React.FC = () => {
  const { viewMode } = useApp();

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-100/70 pb-12">
      {viewMode === 'client' ? <ClientApp /> : <TeamPortal />}
      <AIChatBot />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <MainContent />
      </div>
    </AppProvider>
  );
}
