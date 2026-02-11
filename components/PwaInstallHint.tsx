import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export const PwaInstallHint: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const close = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setVisible(false);
      return;
    }
    close();
  };

  return (
    <div className="fixed left-4 right-4 bottom-[max(104px,env(safe-area-inset-bottom)+88px)] z-[70] rounded-2xl bg-[#1f2813]/95 text-white shadow-lg backdrop-blur px-4 py-3">
      <p className="text-sm font-semibold">安装到手机桌面，像原生 App 一样使用。</p>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={install} className="btn-primary rounded-lg px-3 py-1.5 text-xs">立即安装</button>
        <button onClick={close} className="btn-ghost rounded-lg border border-white/20 px-3 py-1.5 text-xs">稍后</button>
      </div>
    </div>
  );
};
