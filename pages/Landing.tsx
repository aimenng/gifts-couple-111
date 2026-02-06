import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { IMAGES } from '../constants';
import { LoveTimer } from '../components/LoveTimer';
import { useApp } from '../context';
import { useAuth } from '../authContext';

interface LandingProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onEnter }) => {
  const { togetherDate } = useApp();
  const { currentUser, partner } = useAuth();

  // Determine avatars to show
  // Used IMAGES.COFFEE as a nice default placeholder instead of blank gray
  const avatar1 = currentUser?.avatar || IMAGES.COFFEE;
  const avatar2 = partner?.avatar;

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-6 pt-20 pb-safe-bottom h-full">
      <div className="w-full flex flex-col items-center gap-12 mt-10 animate-fade-in">
        <h1 className="text-6xl font-bold tracking-widest text-text-main/90 uppercase font-display" style={{ fontWeight: 800, letterSpacing: '0.15em' }}>
          GIFTS
        </h1>

        <div className="relative flex items-center justify-center py-8">
          {/* Avatar 1 (Current User or Default) */}
          <div className="w-28 h-28 rounded-full border-[4px] border-[#FFFDD0] shadow-md z-10 overflow-hidden bg-stone-200 -mr-6 relative">
            <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url('${avatar1}')` }}></div>
          </div>

          {/* Avatar 2 (Partner or Placeholder) */}
          <div className="w-28 h-28 rounded-full border-[4px] border-[#FFFDD0] shadow-md z-0 overflow-hidden bg-[#E8E6D9] -ml-6 flex items-center justify-center relative">
            {avatar2 ? (
              <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url('${avatar2}')` }}></div>
            ) : (
              <UserIconPlaceholder />
            )}
          </div>

          {/* Heart Connector */}
          <div className="absolute z-20 bg-white rounded-full p-2 shadow-sm flex items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
            <Heart className="w-5 h-5 text-red-400 fill-current" />
          </div>
        </div>

        {/* Timer on Landing */}
        <div className="w-full max-w-xs scale-90">
          <LoveTimer startDate={togetherDate} size="small" />
        </div>

        {currentUser && partner ? (
          <div className="flex items-center gap-2 mt-[-20px] text-sage font-medium animate-fade-in">
            <span>{currentUser.name || '我'}</span>
            <span className="text-xs">&</span>
            <span>{partner.name || 'Ta'}</span>
          </div>
        ) : (
          <div className="h-6"></div> // Spacer
        )}
      </div>

      <div className="w-full space-y-6 mb-8 flex flex-col items-center">
        <button
          onClick={onEnter}
          className="w-full max-w-[280px] bg-primary text-white h-[56px] rounded-full text-[17px] font-medium tracking-wide shadow-soft hover:shadow-lg hover:bg-[#7a8a4b] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
        >
          {currentUser ? '进入我们的世界' : '开始记录'}
        </button>
      </div>
    </div>
  );
};

const UserIconPlaceholder = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-stone-400/50">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);