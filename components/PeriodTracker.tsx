import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Heart, Frown, Smile, Meh, Zap, Droplet, Lock } from 'lucide-react';

interface PeriodTrackerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PeriodData {
    [dateStr: string]: {
        isPeriod: boolean;
        mood: string | null;
        flow?: 'light' | 'medium' | 'heavy' | null;
    };
}

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MOODS = [
    { icon: Smile, label: '开心', color: 'text-yellow-500 bg-yellow-50', activeColor: 'bg-yellow-100 ring-2 ring-yellow-400', dotColor: 'bg-yellow-400' },
    { icon: Heart, label: '幸福', color: 'text-pink-500 bg-pink-50', activeColor: 'bg-pink-100 ring-2 ring-pink-400', dotColor: 'bg-pink-500' },
    { icon: Meh, label: '平静', color: 'text-blue-400 bg-blue-50', activeColor: 'bg-blue-100 ring-2 ring-blue-400', dotColor: 'bg-blue-400' },
    { icon: Frown, label: '难过', color: 'text-gray-500 bg-gray-100', activeColor: 'bg-gray-200 ring-2 ring-gray-400', dotColor: 'bg-gray-500' },
    { icon: Zap, label: '焦虑', color: 'text-purple-500 bg-purple-50', activeColor: 'bg-purple-100 ring-2 ring-purple-400', dotColor: 'bg-purple-500' },
];

export const PeriodTracker: React.FC<PeriodTrackerProps> = ({ isOpen, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [periodData, setPeriodData] = useState<PeriodData>({});

    // Load data from localStorage on mount and cleanup future dates
    useEffect(() => {
        const savedData = localStorage.getItem('period_tracker_data');
        if (savedData) {
            try {
                const parsedData: PeriodData = JSON.parse(savedData);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let hasFutureData = false;
                const cleanedData = { ...parsedData };

                Object.keys(cleanedData).forEach(key => {
                    const date = new Date(key);
                    // Reset time for comparison consistency
                    date.setHours(0, 0, 0, 0);
                    // Fix timezone offset issue for accurate string parsing often being UTC
                    // Actually, dateStr 'YYYY-MM-DD' parses to UTC midnight. 
                    // To be safe, we reconstruct local date from parts
                    const [y, m, d] = key.split('-').map(Number);
                    const localDate = new Date(y, m - 1, d); // Month is 0-indexed

                    if (localDate > today) {
                        delete cleanedData[key];
                        hasFutureData = true;
                    }
                });

                if (hasFutureData) {
                    console.log('Cleaned up future period data');
                    setPeriodData(cleanedData);
                    localStorage.setItem('period_tracker_data', JSON.stringify(cleanedData));
                } else {
                    setPeriodData(parsedData);
                }

            } catch (e) {
                console.error("Failed to parse period data", e);
            }
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (Object.keys(periodData).length > 0) {
            localStorage.setItem('period_tracker_data', JSON.stringify(periodData));
        }
    }, [periodData]);

    if (!isOpen) return null;

    const formatDateKey = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };

    const isFutureDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate > today;
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (delta: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
    };

    const togglePeriod = (date: Date) => {
        if (isFutureDate(date)) return;
        const key = formatDateKey(date);
        setPeriodData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                isPeriod: !prev[key]?.isPeriod
            }
        }));
    };

    const setMood = (date: Date, moodLabel: string) => {
        if (isFutureDate(date)) return;
        const key = formatDateKey(date);
        const currentMood = periodData[key]?.mood;
        setPeriodData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                mood: currentMood === moodLabel ? null : moodLabel
            }
        }));
    };

    const selectedDateKey = formatDateKey(selectedDate);
    const selectedDayData = periodData[selectedDateKey] || { isPeriod: false, mood: null };
    const isFutureSelection = isFutureDate(selectedDate);

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const cells = [];

        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateKey = formatDateKey(date);
            const dayData = periodData[dateKey];

            const isToday = formatDateKey(new Date()) === dateKey;
            const isSelected = selectedDateKey === dateKey;
            const isPeriod = dayData?.isPeriod;

            // Find mood color dot
            const moodDotColor = dayData?.mood ? MOODS.find(m => m.label === dayData.mood)?.dotColor : null;

            cells.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className="h-10 w-10 flex flex-col items-center justify-center cursor-pointer relative group"
                >
                    <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all relative
                        ${isSelected ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}
                        ${isToday && !isSelected ? 'bg-black/5 text-black font-bold' : ''}
                        ${isPeriod ? 'bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}
                        ${isSelected && isPeriod ? 'bg-rose-200 ring-rose-400' : ''}
                    `}>
                        {day}
                        {/* Status Dots Container - Absolute Bottom Right of the circle */}
                        <div className="absolute bottom-1 right-1 flex gap-0.5">
                            {moodDotColor && (
                                <div className={`w-1.5 h-1.5 rounded-full ${moodDotColor} ring-1 ring-white dark:ring-[#1C1C1E]`}></div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="w-[90%] max-w-sm bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-2xl transform transition-all animate-scale-up border border-gray-100 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">身体与情绪</h3>
                        <p className="text-xs text-gray-500">
                            {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} · 记录状态
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-2 px-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                        {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6 text-center">
                    {DAYS.map(day => (
                        <div key={day} className="text-xs font-medium text-gray-400 mb-2">{day}</div>
                    ))}
                    {renderCalendar()}
                </div>

                {/* Date Specific Controls */}
                <div className="space-y-4">
                    {/* Future Date Lock Warning */}
                    {isFutureSelection ? (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <Lock className="w-6 h-6 mb-2 opacity-50" />
                            <p className="text-xs font-medium">未来时间不可标记</p>
                        </div>
                    ) : (
                        <>
                            {/* Period Toggle */}
                            <div
                                onClick={() => togglePeriod(selectedDate)}
                                className={`
                                    flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border
                                    ${selectedDayData.isPeriod
                                        ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
                                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${selectedDayData.isPeriod ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <Droplet className="w-4 h-4 fill-current" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${selectedDayData.isPeriod ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {selectedDayData.isPeriod ? '经期中' : '未记录经期'}
                                        </p>
                                        <p className="text-xs text-sage">点击切换状态</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDayData.isPeriod ? 'border-rose-500' : 'border-gray-300'}`}>
                                    {selectedDayData.isPeriod && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                                </div>
                            </div>

                            {/* Mood Tracker */}
                            <div className="pt-2">
                                <p className="text-xs font-medium text-gray-500 mb-3 px-1">今日心情</p>
                                <div className="flex justify-between items-center px-1">
                                    {MOODS.map((mood) => (
                                        <button
                                            key={mood.label}
                                            onClick={() => setMood(selectedDate, mood.label)}
                                            className={`flex flex-col items-center gap-1 transition-all
                                                ${selectedDayData.mood === mood.label ? 'scale-110' : 'scale-100 opacity-70 hover:opacity-100'}
                                            `}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-black/5 transition-all
                                                ${selectedDayData.mood === mood.label ? mood.activeColor : mood.color}
                                            `}>
                                                <mood.icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-[10px] ${selectedDayData.mood === mood.label ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                                {mood.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
