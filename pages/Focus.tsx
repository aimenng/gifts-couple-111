import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Play, Pause, RotateCcw, Timer, Clock, Zap, Target, Flame, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { COLOR_THEMES, TIMER_SOUND } from '../components/focus/constants';
import { TimerDisplay } from '../components/focus/TimerDisplay';
import { SettingsPanel } from '../components/focus/SettingsPanel';

// Timer modes
type TimerMode = 'countdown' | 'countup' | 'pomodoro';

interface TimerStats {
  todayFocusTime: number; // in minutes
  todaySessions: number;
  streak: number;
  totalSessions: number;
}

const loadStats = (): TimerStats => {
  try {
    const saved = localStorage.getItem('pomodoro_stats');
    if (saved) {
      const stats = JSON.parse(saved);
      // Reset daily stats if it's a new day
      const lastDate = localStorage.getItem('pomodoro_last_date');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        localStorage.setItem('pomodoro_last_date', today);
        return { ...stats, todayFocusTime: 0, todaySessions: 0 };
      }
      return stats;
    }
  } catch (e) { }
  return { todayFocusTime: 0, todaySessions: 0, streak: 0, totalSessions: 0 };
};

const saveStats = (stats: TimerStats) => {
  try {
    localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
    localStorage.setItem('pomodoro_last_date', new Date().toDateString());
  } catch (e) { }
};

export const FocusPage: React.FC = () => {
  // Timer state
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Settings state
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);
  const [clockStyle, setClockStyle] = useState<'ring' | 'digital' | 'minimal'>('ring');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Stats
  const [stats, setStats] = useState<TimerStats>(loadStats);

  // Check if using a dark/sci-fi theme (indexes 5-11 are sci-fi themes)
  const isSciTheme = ['neon_cyan', 'electric', 'plasma', 'matrix', 'aurora', 'fire', 'galaxy'].includes(colorTheme.id);
  const isDark = document.documentElement.classList.contains('dark');
  const currentBg = isSciTheme ? colorTheme.pageBg : (isDark ? colorTheme.pageBgDark : colorTheme.pageBg);
  const textColor = isSciTheme ? '#ffffff' : 'var(--eye-text-primary)';
  const textSecondary = isSciTheme ? 'rgba(255,255,255,0.7)' : 'var(--eye-text-secondary)';
  const cardBg = isSciTheme ? 'rgba(255,255,255,0.1)' : 'var(--eye-bg-secondary)';
  const borderColor = isSciTheme ? 'rgba(255,255,255,0.2)' : 'var(--eye-border)';

  // Computed values
  const currentTime = mode === 'countup' ? elapsed : timeLeft;
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress calculation
  const progress = mode === 'countup'
    ? Math.min((elapsed / (initialTime || 1)) * 283, 283)
    : initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 283 : 0;

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isActive) {
      interval = window.setInterval(() => {
        if (mode === 'countup') {
          setElapsed(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setIsActive(false);
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, mode]);

  const handleTimerComplete = useCallback(() => {
    // Update stats
    const newStats = {
      ...stats,
      todayFocusTime: stats.todayFocusTime + Math.round(initialTime / 60),
      todaySessions: stats.todaySessions + 1,
      totalSessions: stats.totalSessions + 1,
      streak: stats.streak + 1,
    };
    setStats(newStats);
    saveStats(newStats);

    // Sound notification
    if (soundEnabled) {
      try {
        const audio = new Audio(TIMER_SOUND);
        audio.play();
      } catch (e) { }
    }

    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 专注完成！', {
        body: `太棒了！完成了 ${Math.round(initialTime / 60)} 分钟专注`,
      });
    }
  }, [initialTime, soundEnabled, stats]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleTimeChange = (mins: number) => {
    const secs = mins * 60;
    setInitialTime(secs);
    setTimeLeft(secs);
    setElapsed(0);
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
    setElapsed(0);
  };

  const adjustTime = (delta: number) => {
    const newMins = Math.max(1, Math.min(120, Math.round(initialTime / 60) + delta));
    handleTimeChange(newMins);
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full transition-colors duration-500"
      style={{ backgroundColor: currentBg }}
    >
      {/* Header */}
      <header className="flex items-center p-4 pb-2 pt-safe-top justify-between z-10 shrink-0">
        <div className="size-12"></div>
        <h2
          className="text-lg font-bold leading-tight flex-1 text-center transition-colors"
          style={{ color: textColor }}
        >
          专注时钟
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          style={{ color: textColor }}
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center w-full px-4 pt-2 overflow-y-auto hide-scrollbar">
        <div className="pb-32 w-full flex flex-col items-center max-w-md mx-auto">

          {/* Mode Tabs */}
          <div
            className="flex items-center gap-2 p-1 rounded-2xl mb-6 border transition-colors"
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
          >
            {[
              { id: 'countdown', label: '倒计时', icon: Timer },
              { id: 'countup', label: '正计时', icon: Clock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id as TimerMode); resetTimer(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === id
                  ? `${colorTheme.bg} text-white shadow-md`
                  : ''
                  }`}
                style={mode !== id ? { color: textSecondary } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <TimerDisplay
            clockStyle={clockStyle}
            mode={mode}
            formattedTime={formattedTime}
            progress={progress}
            initialTime={initialTime}
            isSciTheme={isSciTheme}
            colorTheme={colorTheme}
            cardBg={cardBg}
            borderColor={borderColor}
            textColor={textColor}
            textSecondary={textSecondary}
            adjustTime={adjustTime}
          />

          {/* Quick Presets + Custom Time - Only show for countdown mode */}
          {mode === 'countdown' && (
            <div className="flex flex-col items-center gap-4 mb-6">
              {/* Preset buttons */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[15, 25, 45, 60, 90].map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeChange(time)}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${Math.ceil(initialTime / 60) === time && !showTimePicker
                      ? `${colorTheme.bg} text-white shadow-lg scale-105`
                      : 'hover:scale-105'
                      } disabled:opacity-50`}
                    style={Math.ceil(initialTime / 60) !== time || showTimePicker ? { backgroundColor: cardBg, color: textSecondary } : {}}
                  >
                    {time}分
                  </button>
                ))}
                <button
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${showTimePicker
                    ? `${colorTheme.bg} text-white shadow-lg scale-105`
                    : 'hover:scale-105'
                    } disabled:opacity-50`}
                  style={!showTimePicker ? { backgroundColor: cardBg, color: textSecondary } : {}}
                >
                  自定义
                </button>
              </div>

              {/* Custom Time Picker */}
              {showTimePicker && !isActive && (
                <div
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-colors"
                  style={{ backgroundColor: cardBg, borderColor: borderColor }}
                >
                  <button
                    onClick={() => adjustTime(-5)}
                    className={`w-10 h-10 rounded-xl ${colorTheme.bg} text-white font-bold text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all`}
                  >
                    -5
                  </button>
                  <button
                    onClick={() => adjustTime(-1)}
                    className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    style={{ backgroundColor: borderColor, color: textColor }}
                  >
                    -1
                  </button>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-3xl font-bold tabular-nums" style={{ color: textColor }}>{Math.round(initialTime / 60)}</span>
                    <span className="text-xs" style={{ color: textSecondary }}>分钟</span>
                  </div>
                  <button
                    onClick={() => adjustTime(1)}
                    className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    style={{ backgroundColor: borderColor, color: textColor }}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => adjustTime(5)}
                    className={`w-10 h-10 rounded-xl ${colorTheme.bg} text-white font-bold text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all`}
                  >
                    +5
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-4 mb-6">
            {(isActive || elapsed > 0 || timeLeft < initialTime) && (
              <button
                onClick={resetTimer}
                className="flex items-center justify-center w-14 h-14 rounded-full hover:scale-105 transition-all border"
                style={{ backgroundColor: cardBg, color: textSecondary, borderColor: borderColor }}
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center gap-2 px-8 h-14 rounded-full ${colorTheme.bg} text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all ${isSciTheme ? colorTheme.glow : ''}`}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              <span>{isActive ? '暂停' : '开始'}</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center justify-center w-14 h-14 rounded-full transition-all border"
              style={{ backgroundColor: cardBg, color: soundEnabled ? textColor : textSecondary, borderColor: borderColor }}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            <div
              className="flex flex-col items-center p-3 rounded-2xl border transition-colors"
              style={{ backgroundColor: cardBg, borderColor: borderColor }}
            >
              <Zap className={`w-5 h-5 mb-1 ${colorTheme.ring}`} />
              <span className="text-xl font-bold" style={{ color: textColor }}>{stats.todaySessions}</span>
              <span className="text-[10px]" style={{ color: textSecondary }}>今日专注</span>
            </div>
            <div
              className="flex flex-col items-center p-3 rounded-2xl border transition-colors"
              style={{ backgroundColor: cardBg, borderColor: borderColor }}
            >
              <Timer className={`w-5 h-5 mb-1 ${colorTheme.ring}`} />
              <span className="text-xl font-bold" style={{ color: textColor }}>{stats.todayFocusTime}</span>
              <span className="text-[10px]" style={{ color: textSecondary }}>分钟</span>
            </div>
            <div
              className="flex flex-col items-center p-3 rounded-2xl border transition-colors"
              style={{ backgroundColor: cardBg, borderColor: borderColor }}
            >
              <Flame className={`w-5 h-5 mb-1 ${colorTheme.ring}`} />
              <span className="text-xl font-bold" style={{ color: textColor }}>{stats.streak}</span>
              <span className="text-[10px]" style={{ color: textSecondary }}>连续完成</span>
            </div>
          </div>

          {/* Motivation */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border w-full" style={{ borderColor: colorTheme.primary, backgroundColor: `${colorTheme.primary}25` }}>
            <Target className="w-5 h-5" style={{ color: colorTheme.primary }} />
            <p className="text-sm" style={{ color: textColor }}>
              {isActive ? '保持专注，你做得很好！💪' : '点击开始，专注当下 🎯'}
            </p>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isSciTheme={isSciTheme}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        clockStyle={clockStyle}
        setClockStyle={setClockStyle}
      />
    </div>
  );
};