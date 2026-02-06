import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullScreen?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '', fullScreen = false }) => {
  return (
    // Use h-[100dvh] for mobile browser compatibility
    <div className={`bg-background-light dark:bg-background-dark h-[100dvh] w-full flex flex-col items-center relative overflow-hidden text-text-main dark:text-white transition-colors duration-300 font-sans ${fullScreen ? '' : ''}`}>
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0 paper-texture"></div>
      
      {/* Content */}
      <main className={`relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col h-full overflow-hidden ${className}`}>
        {children}
      </main>
    </div>
  );
};