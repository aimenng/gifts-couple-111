import React from 'react';
import { Home, Calendar, User, Timer } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none w-full">
      {/* Blur Backdrop */}
      <div className="absolute inset-0 bg-surface/90 dark:bg-[#1a1c16]/90 backdrop-blur-xl border-t border-primary/20 pointer-events-auto h-full pb-safe-bottom"></div>

      {/* Nav Items */}
      <nav className="relative pointer-events-auto grid grid-cols-4 items-end px-2 pt-3 pb-safe-bottom w-full" aria-label="主导航">

        <button
          onClick={() => onChangeView(View.TIMELINE)}
          className={`flex flex-col items-center gap-1 group w-full pb-3 ${currentView === View.TIMELINE ? 'text-primary' : 'text-gray-400'}`}
          aria-label="首页"
          aria-current={currentView === View.TIMELINE ? 'page' : undefined}
        >
          <Home className={`w-6 h-6 transition-all duration-300 ${currentView === View.TIMELINE ? 'fill-current scale-110' : ''}`} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">首页</span>
        </button>

        <button
          onClick={() => onChangeView(View.ANNIVERSARY)}
          className={`flex flex-col items-center gap-1 group w-full pb-3 ${currentView === View.ANNIVERSARY ? 'text-primary' : 'text-gray-400'}`}
          aria-label="纪念日"
          aria-current={currentView === View.ANNIVERSARY ? 'page' : undefined}
        >
          <Calendar className={`w-6 h-6 transition-all duration-300 ${currentView === View.ANNIVERSARY ? 'fill-current scale-110' : ''}`} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">纪念日</span>
        </button>

        <button
          onClick={() => onChangeView(View.FOCUS)}
          className="flex flex-col items-center gap-1 group w-full pb-3 relative -top-3"
          aria-label="专注计时器"
          aria-current={currentView === View.FOCUS ? 'page' : undefined}
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg shadow-primary/30 transition-transform duration-200 group-active:scale-95 ${currentView === View.FOCUS ? 'bg-primary text-white' : 'bg-primary text-white'}`}>
            <Timer className="w-6 h-6 fill-current" strokeWidth={1.5} />
          </div>
          <span className={`text-[10px] font-medium ${currentView === View.FOCUS ? 'text-primary' : 'text-primary'}`}>专注</span>
        </button>

        <button
          onClick={() => onChangeView(View.PROFILE)}
          className={`flex flex-col items-center gap-1 group w-full pb-3 ${currentView === View.PROFILE ? 'text-primary' : 'text-gray-400'}`}
          aria-label="个人中心"
          aria-current={currentView === View.PROFILE ? 'page' : undefined}
        >
          <User className={`w-6 h-6 transition-all duration-300 ${currentView === View.PROFILE ? 'fill-current scale-110' : ''}`} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">我的</span>
        </button>

      </nav>
    </div>
  );
};