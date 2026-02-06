import React, { useState, useEffect } from 'react';
import { Heart, Mail, Share, ArrowRight, AlertCircle, LogIn, User as UserIcon } from 'lucide-react';
import { useApp } from '../context';
import { useAuth } from '../authContext';
import { IMAGES } from '../constants';

interface ConnectionProps {
  onComplete: () => void;
  onLogin: () => void;
}

export const ConnectionPage: React.FC<ConnectionProps> = ({ onComplete, onLogin }) => {
  const { connect, inviteCode: appInviteCode } = useApp();
  const { currentUser, partner } = useAuth();

  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [error, setError] = useState('');

  // Use either auth user's invite code or local app state's
  const displayInviteCode = currentUser?.invitationCode || appInviteCode;

  const handleJoin = () => {
    setError('');
    const success = connect(inviteCodeInput);
    if (success) {
      onComplete();
    } else {
      setError('邀请码格式不正确，请输入至少6位字符');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="flex flex-col h-full w-full px-4 pt-safe-top animate-fade-in-up overflow-y-auto hide-scrollbar">
      <div className="pb-32 w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* My Avatar */}
            <div className="w-14 h-14 rounded-full border-2 border-white shadow-md bg-stone-200 overflow-hidden relative">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${currentUser?.avatar || IMAGES.COFFEE}')` }}></div>
            </div>

            <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-sage">
              <Heart className="w-4 h-4 fill-current" />
            </div>

            {/* Partner Avatar - Placeholder or Real */}
            <div className="w-14 h-14 rounded-full border-2 border-white shadow-md bg-stone-100 overflow-hidden relative flex items-center justify-center">
              {partner?.avatar ? (
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${partner.avatar}')` }}></div>
              ) : (
                <UserIcon className="w-6 h-6 text-gray-300" />
              )}
            </div>
          </div>

          <h1 className="text-text-main dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center font-display">
            {partner ? `与 ${partner.name || 'Ta'} 连接中` : '开启共同旅程'}
          </h1>

          <p className="text-sage text-sm font-medium mt-4">
            {partner ? '一起记录更美好的时光' : '连接彼此，记录每一个瞬间'}
          </p>
        </div>

        {/* Card 1: Invite */}
        <div className="w-full mb-5">
          <div className="flex flex-col items-stretch justify-start rounded-3xl shadow-soft bg-white dark:bg-[#253018] overflow-hidden border border-sage/10">
            {/* Graphic Area */}
            <div className="w-full h-32 bg-sage-light dark:bg-sage/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-8 w-24 h-24 rounded-full bg-primary/20 blur-xl"></div>
              <div className="absolute -left-4 -bottom-8 w-32 h-32 rounded-full bg-sage/20 blur-xl"></div>
              <div className="z-10 flex flex-col items-center gap-2">
                <Mail className="text-sage w-10 h-10" />
              </div>
            </div>

            <div className="flex flex-col p-5 gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-text-main dark:text-white text-xl font-bold leading-tight">创建新关系</p>
                  <p className="text-sage text-sm font-normal mt-1">生成邀请码邀请另一半加入</p>
                </div>
              </div>

              <div className="mt-2 bg-background-light dark:bg-black/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-dashed border-sage/30">
                <span className="text-xs uppercase tracking-wider text-sage font-medium">您的专属邀请码</span>
                <p className="text-text-main dark:text-white text-3xl font-mono font-bold tracking-widest">
                  {displayInviteCode || '生成中...'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (displayInviteCode) navigator.clipboard.writeText(displayInviteCode);
                  alert("复制成功");
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-4 bg-primary hover:bg-[#7a8a4b] text-white text-base font-bold transition-all mt-1 active:scale-[0.98]"
              >
                <Share className="w-5 h-5" />
                <span className="truncate">复制邀请码</span>
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-sage/20"></div>
          <span className="flex-shrink-0 mx-4 text-sage/60 text-xs font-medium uppercase tracking-widest">或者</span>
          <div className="flex-grow border-t border-sage/20"></div>
        </div>

        {/* Card 2: Join */}
        <div className="w-full mt-2 mb-6">
          <div className="flex flex-col items-stretch justify-start rounded-3xl shadow-soft bg-white dark:bg-[#253018] overflow-hidden border border-sage/10 transition-transform">
            <div className="flex w-full items-center p-5 gap-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 text-orange-600 dark:text-orange-400">
                <Heart className="w-7 h-7" />
              </div>
              <div className="flex flex-col flex-grow gap-1">
                <p className="text-text-main dark:text-white text-lg font-bold leading-tight">加入已有关系</p>
                <p className="text-sage text-sm font-normal leading-normal">输入对方分享的邀请码</p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-0">
              <div className="relative">
                <input
                  className={`w-full h-12 rounded-xl bg-background-light dark:bg-black/20 border-2 ${error ? 'border-red-500' : 'border-transparent'} focus:border-primary focus:bg-white dark:focus:bg-black/40 focus:ring-0 text-text-main dark:text-white text-center font-mono placeholder:font-sans transition-all placeholder:text-sage/40`}
                  placeholder="输入邀请码"
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => {
                    setInviteCodeInput(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleJoin}
                  className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg bg-white dark:bg-[#344026] text-sage hover:text-primary transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
                  disabled={!inviteCodeInput.trim()}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Restore Account Link */}
        <div className="w-full flex justify-center pb-8">
          <button
            onClick={onLogin}
            className="flex items-center gap-2 text-sage hover:text-primary transition-colors text-sm font-medium py-2 px-4 rounded-lg hover:bg-sage/10"
          >
            <LogIn className="w-4 h-4" />
            {currentUser ? '切换账号' : '已有账号？登录恢复数据'}
          </button>
        </div>
      </div>
    </div>
  );
};