import React, { useState, useMemo } from 'react';
import { Settings, Plus, Calendar, Edit2, Trash2, AlertCircle, Leaf } from 'lucide-react';
import { useApp, calculateRelativeDays } from '../context';
import { Modal } from '../components/Modal';
import { EventType, DEFAULT_EVENT_TYPES, AnniversaryEvent } from '../types';
import { getDateValidationError, getMinDate, getMaxDate } from '../utils/dateValidation';
import { EVENT_TYPE_Config, DEFAULT_CONFIG } from '../components/anniversary/constants';

// Use a consistent name for the config
const EVENT_TYPE_CONFIG = EVENT_TYPE_Config;

// Get config for event type
const getEventConfig = (type: string) => {
  return EVENT_TYPE_CONFIG[type] || DEFAULT_CONFIG;
};

export const AnniversaryPage: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<EventType>('纪念日');
  const [dateError, setDateError] = useState<string | null>(null);

  // Get unique custom types from existing events
  const customTypes = useMemo(() => {
    const allTypes = events.map(e => e.type);
    const uniqueTypes = Array.from(new Set(allTypes));
    return uniqueTypes.filter((t): t is string =>
      typeof t === 'string' && !DEFAULT_EVENT_TYPES.includes(t as any) && !EVENT_TYPE_CONFIG[t]
    );
  }, [events]);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setDate('');
    setType('纪念日');
    setEditingEvent(null);
    setDateError(null);
  };

  // Validate date on change
  const handleDateChange = (value: string) => {
    setDate(value);
    const error = getDateValidationError(value);
    setDateError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date before submit
    const dateValidationError = getDateValidationError(date);
    if (dateValidationError) {
      setDateError(dateValidationError);
      return;
    }

    if (title && date && type.trim()) {
      const eventConfig = getEventConfig(type.trim());
      const eventData = {
        title,
        subtitle,
        date,
        type: type.trim(),
        image: eventConfig.defaultImage
      };

      if (editingEvent) {
        updateEvent(editingEvent, eventData);
      } else {
        addEvent(eventData);
      }
      setIsModalOpen(false);
      resetForm();
    }
  };

  const startEdit = (event: AnniversaryEvent) => {
    setTitle(event.title);
    setSubtitle(event.subtitle || '');
    setDate(event.date);
    setType(event.type);
    setEditingEvent(event.id);
    setIsModalOpen(true);
  };

  const handleDelete = (eventId: string) => {
    if (confirm('确定要删除这个纪念日吗？')) {
      deleteEvent(eventId);
    }
  };

  // Memoize sorted events to avoid re-sorting on every render
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const diffA = calculateRelativeDays(a.date);
      const diffB = calculateRelativeDays(b.date);
      // We want positive (future) first, then negative (past)
      // Or specific user preference? Let's sort by absolute closeness, but future prioritized?
      // Actually, simple ascending works if we view it as a timeline line: -5 (5 days ago) ... 0 (today) ... 5 (in 5 days)
      // But usually "upcoming" is top. So let's modify:
      // Filter into two groups? Or just sort by "time until next" which is standard logic.
      // Let's stick to standard "next event first", pushing "ago" events to bottom or treating them as "just passed"

      // Let's use absolute diff for visual "closeness" but maybe split section?
      // For now, simple sort:
      // Use the relative days directly. 
      // If we want "In 2 days" before "In 5 days", that's ascending.
      // "3 days ago" (-3) vs "In 2 days" (2).
      return diffA - diffB;
    });
  }, [events]);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center justify-between p-4 pb-2 pt-safe-top sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm shrink-0">
        <div className="size-10"></div>
        <h2 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-text-main dark:text-white">纪念时刻</h2>
        <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-white">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-2 overflow-y-auto hide-scrollbar w-full">
        <div className="py-1">
          <p className="text-sage dark:text-gray-400 text-sm font-medium">即将到来的日子</p>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-sage/40" />
            </div>
            <h3 className="text-text-main dark:text-white text-lg font-bold mb-2">还没有纪念日</h3>
            <p className="text-sage text-sm text-center mb-6">
              点击下方按钮<br />添加你们的重要日子
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-32">
            {sortedEvents.map((event) => {
              const diffDays = calculateRelativeDays(event.date);
              const isPast = diffDays < 0;
              const daysLeft = Math.abs(diffDays);

              const progress = Math.min(100, Math.max(0, 100 - (daysLeft * 2)));
              const config = getEventConfig(event.type);
              const IconComponent = config.icon;
              const displayImage = event.image || config.defaultImage;

              return (
                <div key={event.id} className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#2a3020] p-5 shadow-card group transition-all duration-300 hover:shadow-soft shrink-0">
                  {/* Edit/Delete buttons */}
                  <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(event);
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-stretch justify-between gap-4">
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center justify-center ${config.bgColor} ${config.iconColor} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                            {config.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight text-text-main dark:text-white">{event.title}</h3>
                        {event.subtitle && (
                          <p className="text-sage dark:text-gray-400 text-xs">{event.subtitle}</p>
                        )}
                      </div>
                      <div className="mt-4 flex items-baseline gap-1">
                        {isPast ? (
                          <>
                            <span className="text-3xl font-bold text-gray-400 dark:text-gray-500">{daysLeft}</span>
                            <span className="text-sm font-medium text-sage dark:text-gray-400">天前</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-sage dark:text-gray-400">还有</span>
                            <span className="text-3xl font-bold text-primary dark:text-primary">{daysLeft}</span>
                            <span className="text-sm font-medium text-sage dark:text-gray-400">天</span>
                          </>
                        )}

                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 flex flex-col gap-1">
                        <div className="flex justify-between items-end text-xs text-sage dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5 text-primary" />
                            <span>{isPast ? '已过去' : '倒计时'}</span>
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-sage-light/50 dark:bg-white/10 p-0.5 shadow-inner">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image/Icon area */}
                    <div className={`w-20 h-20 rounded-xl ${config.bgColor} flex items-center justify-center ${config.iconColor} overflow-hidden relative shrink-0 self-center`}>
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={event.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <IconComponent className="w-8 h-8" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="absolute bottom-24 right-4 z-20">
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-sage text-white shadow-[0_8px_30px_rgb(127,137,97,0.4)] px-5 h-14 transition-transform active:scale-95 hover:bg-[#4a5236]"
        >
          <Plus className="w-6 h-6" />
          <span className="text-base font-bold tracking-wide">添加纪念日</span>
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={editingEvent ? "编辑纪念日" : "添加新纪念日"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Event Type Selector with Icons */}
          <div>
            <label className="block text-sm font-medium text-sage mb-2">选择类型</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(EVENT_TYPE_CONFIG).filter(([key]) => !['anniversary', 'birthday', 'trip'].includes(key)).slice(0, 8).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key as EventType)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${type === key
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center ${config.iconColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-text-main dark:text-white font-medium">{key}</span>
                  </button>
                );
              })}
            </div>
            {/* Custom type input */}
            <div className="mt-2">
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="或输入自定义类型"
                className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1">事件名称</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：结婚纪念日"
              className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage mb-1">副标题 (可选)</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="例如：最重要的一天"
              className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sage mb-1">日期</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className={`w-full rounded-xl bg-gray-50 dark:bg-white/5 border-none p-3 text-text-main dark:text-white focus:ring-2 ${dateError ? 'focus:ring-red-500/50 ring-2 ring-red-500/50' : 'focus:ring-primary/50'}`}
            />
            {dateError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {dateError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
          >
            {editingEvent ? '保存修改' : '保存纪念日'}
          </button>
        </form>
      </Modal>
    </div>
  );
};