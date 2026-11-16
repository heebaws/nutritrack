import { useState, useEffect, useCallback } from 'react';
import { isInstalledPWA } from '../utils/notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isInstalledPWA());

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onDisplayChange = () => setIsInstalled(isInstalledPWA());

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    mq?.addEventListener?.('change', onDisplayChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      mq?.removeEventListener?.('change', onDisplayChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  return {
    canInstall: Boolean(installPrompt) && !isInstalled,
    isInstalled,
    promptInstall,
  };
}
