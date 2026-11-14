import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ClientApp } from './components/client/ClientApp';
import { TeamPortal } from './components/team/TeamPortal';
import { LoginPortal } from './components/common/LoginPortal';
import { AIChatBot } from './components/common/AIChatBot';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContent: React.FC = () => {
  const { viewMode } = useApp();

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-100/70 dark:bg-slate-950 pb-12 transition-colors">
      <ErrorBoundary fallbackTitle={
        viewMode === 'login'
          ? 'Login Portal Encountered an Issue'
          : viewMode === 'client'
          ? 'Client Portal Encountered an Issue'
          : 'Coach & Admin Portal Encountered an Issue'
      }>
        {viewMode === 'login' ? (
          <LoginPortal />
        ) : viewMode === 'client' ? (
          <ClientApp />
        ) : (
          <TeamPortal />
        )}
      </ErrorBoundary>
      <AIChatBot />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-900 dark:selection:text-emerald-100 transition-colors">
        <ErrorBoundary fallbackTitle="Header Navigation Error">
          <Header />
        </ErrorBoundary>
        <MainContent />
      </div>
    </AppProvider>
  );
}
