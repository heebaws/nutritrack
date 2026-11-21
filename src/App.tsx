import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ClientApp } from './components/client/ClientApp';
import { TeamPortal } from './components/team/TeamPortal';
import { LoginPortal } from './components/common/LoginPortal';
import { AIChatBot } from './components/common/AIChatBot';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { WellnessBackdrop } from './components/common/WellnessBackdrop';

const MainContent: React.FC = () => {
  const { viewMode } = useApp();

  return (
    <main className="relative min-h-[calc(100vh-65px)] pb-12 transition-colors">
      <ErrorBoundary
        fallbackTitle={
          viewMode === 'login'
            ? 'Login Portal Encountered an Issue'
            : viewMode === 'client'
            ? 'Client Portal Encountered an Issue'
            : 'Coach & Admin Portal Encountered an Issue'
        }
      >
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
      <div className="relative isolate min-h-screen nt-wellness-canvas flex flex-col font-sans text-[#122119] dark:text-[#F2F7F3] antialiased selection:bg-emerald-100 selection:text-emerald-950 dark:selection:bg-emerald-900 dark:selection:text-emerald-100 transition-colors">
        <WellnessBackdrop />
        <ErrorBoundary fallbackTitle="Header Navigation Error">
          <Header />
        </ErrorBoundary>
        <MainContent />
      </div>
    </AppProvider>
  );
}
