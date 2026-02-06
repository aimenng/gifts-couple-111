import React, { useState } from 'react';
import { Settings, Heart, Calendar, Sliders, Bell, HelpCircle, ChevronRight, Copy, Share2, Shield, Palette, Pencil, Grid, X, Trash2, Link, Edit2 } from 'lucide-react';
import { IMAGES } from '../constants';
import { Modal } from '../components/Modal';
import { ThemeToggle } from '../components/ThemeToggle';
import { calculateDaysTogether, useApp } from '../context';
import { useAuth } from '../authContext';
import { LoveTimer } from '../components/LoveTimer';
import { PeriodTracker } from '../components/PeriodTracker';

interface ProfilePageProps {
  onNavigateToAuth: () => void;
  onEditProfile: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateToAuth, onEditProfile }) => {
  const { inviteCode, togetherDate, updateTogetherDate } = useApp();
  const { currentUser, unreadCount, notifications, markAsRead, clearNotifications } = useAuth();

  const [showMore, setShowMore] = useState(false);
  const [showPeriodTracker, setShowPeriodTracker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Date Editing State
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState(togetherDate);

  const onEditDate = () => {
    setTempDate(togetherDate);
    setIsDateModalOpen(true);
  };

  const saveDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempDate) {
      updateTogetherDate(tempDate);
      setIsDateModalOpen(false);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('邀请码已复制！');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--eye-bg-primary)]">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 pt-safe-top justify-between sticky top-0 z-50 bg-[var(--eye-bg-primary)]/95 backdrop-blur-sm">
        <div className="w-12"></div>
        <h2 className="text-[var(--eye-text-primary)] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">我的</h2>
        <button
          onClick={onNavigateToAuth}
          className="flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[var(--eye-text-primary)] relative"
        >
          <Settings className="w-5 h-5" />
          {!currentUser && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-[var(--eye-bg-primary)]"></span>}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center pt-2 w-full px-4 overflow-y-auto hide-scrollbar">
        <div className="pb-32 w-full flex flex-col items-center max-w-md mx-auto">

          {/* Avatar Group - Editable */}
          <div className="flex flex-col items-center justify-center pt-4 pb-0 relative group">
            <button
              onClick={currentUser ? onEditProfile : onNavigateToAuth}
              className="absolute top-4 right-0 p-2 bg-primary/10 text-primary rounded-full md:hover:bg-primary md:hover:text-white transition-all active:scale-95 z-40"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <div className="relative flex items-center justify-center h-20 w-full mb-3">
              <div className="absolute left-1/2 -translate-x-[calc(50%+20px)] z-10 transition-transform">
                <div
                  className="w-16 h-16 rounded-full border-3 border-[var(--eye-bg-primary)] shadow-lg bg-gray-200 bg-cover bg-center ring-2 ring-primary/20"
                  style={{ backgroundImage: `url('${currentUser?.gender === 'female' ? (currentUser.avatar || IMAGES.AVATAR_FEMALE) : IMAGES.AVATAR_FEMALE}')` }}
                ></div>
              </div>
              <div className="z-30 flex items-center justify-center size-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="absolute left-1/2 -translate-x-[calc(50%-20px)] z-20 transition-transform">
                <div
                  className="w-16 h-16 rounded-full border-3 border-[var(--eye-bg-primary)] shadow-lg bg-gray-200 bg-cover bg-center ring-2 ring-primary/20"
                  style={{ backgroundImage: `url('${currentUser?.gender === 'male' || !currentUser ? (currentUser?.avatar || IMAGES.AVATAR_MALE) : IMAGES.AVATAR_MALE}')` }}
                ></div>
              </div>
            </div>

            <h3 className="text-[var(--eye-text-primary)] tracking-tight text-xl font-bold leading-tight text-center flex items-center gap-2 mb-3">
              {currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '小张 & 小王')}
            </h3>

            <div className="w-full px-8">
              <LoveTimer startDate={togetherDate} size="small" />
            </div>
          </div>

          {/* Theme Toggle Section - Featured prominently */}
          <div className="w-full mb-4 mt-6">
            <div className="flex items-center justify-between rounded-2xl bg-[var(--eye-bg-secondary)] p-4 shadow-sm border border-[var(--eye-border)]">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[var(--eye-text-primary)] text-base font-bold">主题切换</p>
                  <p className="text-[var(--eye-text-secondary)] text-xs">护眼模式已启用</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Together Date Settings */}
          <div className="w-full mb-4">
            <div className="rounded-2xl bg-[var(--eye-bg-secondary)] p-4 shadow-sm border border-[var(--eye-border)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-[var(--eye-text-primary)] text-base font-bold">在一起的时间</p>
                    <p className="text-[var(--eye-text-secondary)] text-xs">记录我们的开始</p>
                  </div>
                </div>
                <button
                  onClick={() => onEditDate()}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-[var(--eye-bg-primary)]/50 rounded-xl p-3 border border-[var(--eye-border)]">
                <span className="text-[var(--eye-text-secondary)] text-sm">开始日期</span>
                <span className="text-[var(--eye-text-primary)] font-mono font-bold">{togetherDate}</span>
              </div>
            </div>
          </div>

          {/* Invite Card */}
          <div className="w-full mb-4">
            <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-primary/10 to-sage/5 p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <p className="text-[var(--eye-text-primary)] text-base font-bold">关系绑定</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {inviteCode ? '已连接' : '未连接'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-xl p-3">
                <div>
                  <p className="text-[var(--eye-text-secondary)] text-xs mb-0.5">邀请码</p>
                  <p className="text-[var(--eye-text-primary)] font-mono font-bold tracking-widest text-lg">
                    {inviteCode || '请登录'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            <SettingsCard
              icon={<Bell className="w-5 h-5" />}
              gradient="from-orange-400 to-orange-500"
              title="通知提醒"
              subtitle={unreadCount > 0 ? `${unreadCount} 条未读消息` : "暂无新消息"}
              dot={unreadCount > 0}
              onClick={handleNotificationClick}
            />

            {/* More Features Button / Grid */}
            <div className={`relative transition-all duration-500 ease-in-out ${showMore ? 'col-span-2 row-span-2 h-auto' : 'h-28'}`}>
              {!showMore ? (
                <div
                  onClick={() => setShowMore(true)}
                  className="flex flex-col justify-between h-full rounded-2xl bg-[var(--eye-bg-secondary)] p-4 shadow-sm border border-[var(--eye-border)] hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start">
                    <div className={`size-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}>
                      <Grid className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--eye-text-secondary)] opacity-0 group-hover:opacity-100 -rotate-45 transition-all" />
                  </div>
                  <div>
                    <p className="text-[var(--eye-text-primary)] text-sm font-bold">更多功能</p>
                    <p className="text-[var(--eye-text-secondary)] text-xs">探索无限可能</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                  <div className="col-span-2 flex items-center justify-between mb-1 px-1">
                    <span className="text-sm font-bold text-[var(--eye-text-primary)]">更多功能</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMore(false); }}
                      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <X className="w-4 h-4 text-[var(--eye-text-secondary)]" />
                    </button>
                  </div>

                  {/* Period Tracker Card */}
                  <div
                    onClick={() => setShowPeriodTracker(true)}
                    className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30 cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className="size-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md mb-3">
                      <Heart className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">经期 & 情绪</p>
                    <p className="text-xs text-pink-500 dark:text-pink-400">同步身体状态</p>
                  </div>

                  {/* Placeholder 1 */}
                  <div className="bg-[var(--eye-bg-secondary)] p-4 rounded-2xl border border-[var(--eye-border)] opacity-60">
                    <div className="size-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-3">
                      <Grid className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-[var(--eye-text-primary)]">即将推出</p>
                    <p className="text-xs text-[var(--eye-text-secondary)]">敬请期待</p>
                  </div>
                </div>
              )}
            </div>

            <SettingsCard
              icon={<HelpCircle className="w-5 h-5" />}
              gradient="from-violet-400 to-purple-500"
              title="帮助反馈"
              subtitle="联系我们"
            />
          </div>

          {/* App Info Footer */}
          <div className="flex flex-col items-center justify-center py-6 opacity-50">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-sage" />
              <span className="text-xs font-medium text-sage tracking-wider uppercase">GIFTS App</span>
            </div>
            <p className="text-[10px] text-[var(--eye-text-secondary)]">Version 1.0.4 · 护眼模式</p>
            <p className="text-[10px] text-[var(--eye-text-secondary)] mt-1">Made with ❤️ for You</p>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PeriodTracker isOpen={showPeriodTracker} onClose={() => setShowPeriodTracker(false)} />

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm h-[80vh] sm:h-auto sm:max-h-[600px] bg-[var(--eye-bg-primary)] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-slide-up flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-[var(--eye-text-primary)]">消息中心</h3>
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={clearNotifications} className="text-xs text-[var(--eye-text-secondary)] hover:text-red-500 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  清空
                </button>
                <button onClick={() => setShowNotifications(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-[var(--eye-text-secondary)]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200 hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--eye-text-secondary)] opacity-60">
                  <Bell className="w-12 h-12 mb-3 stroke-1" />
                  <p className="text-sm">暂无新消息</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99]
                                ${notification.read
                        ? 'bg-[var(--eye-bg-secondary)] border-transparent opacity-70'
                        : 'bg-white dark:bg-white/5 border-primary/20 shadow-sm'}
                            `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${notification.type === 'system' ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                          {notification.type === 'system' ? <Shield className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-bold text-[var(--eye-text-primary)]">{notification.title}</span>
                      </div>
                      <span className="text-[10px] text-[var(--eye-text-secondary)] whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--eye-text-secondary)] leading-relaxed line-clamp-3">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <div className="mt-2 flex justify-end">
                        <span className="text-[10px] text-primary font-medium">点击已读</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Date Edit Modal */}
      <Modal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} title="设置开始日期">
        <form onSubmit={saveDate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-sage mb-2">选择你们在一起的那一天</label>
            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              required
              className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <p className="text-xs text-sage dark:text-gray-400">
            我们会从这一天开始计算你们相爱的时光。
          </p>
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
          >
            保存设置
          </button>
        </form>
      </Modal>
    </div>
  );
};

interface SettingsCardProps {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  subtitle: string;
  dot?: boolean;
  onClick?: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, gradient, title, subtitle, dot = false, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col justify-between h-28 rounded-2xl bg-[var(--eye-bg-secondary)] p-4 shadow-sm border border-[var(--eye-border)] hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98]"
  >
    <div className="flex justify-between items-start">
      <div className={`size-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}>
        {icon}
      </div>
      {dot ? (
        <div className="size-2 rounded-full bg-red-500 animate-pulse">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
        </div>
      ) : (
        <ChevronRight className="w-4 h-4 text-[var(--eye-text-secondary)] opacity-0 group-hover:opacity-100 -rotate-45 transition-all" />
      )}
    </div>
    <div>
      <p className="text-[var(--eye-text-primary)] text-sm font-bold">{title}</p>
      <p className="text-[var(--eye-text-secondary)] text-xs truncate max-w-[120px]">{subtitle}</p>
    </div>
  </div>
);

const Leaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="24" height="24">
    <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,8,17,8,17,8Z" />
  </svg>
);