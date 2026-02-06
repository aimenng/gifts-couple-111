import React, { useState, useEffect } from 'react';

interface LoveTimerProps {
    startDate: string;
    size?: 'normal' | 'small';
}

interface TimeLeft {
    years: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const LoveTimer: React.FC<LoveTimerProps> = ({ startDate, size = 'normal' }) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const start = new Date(startDate).getTime();
            const now = new Date().getTime();
            const difference = now - start;

            if (difference > 0) {
                const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
                const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ years, days, hours, minutes, seconds });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [startDate]);

    const isSmall = size === 'small';

    return (
        <div className="w-full">
            <div className={`grid ${isSmall ? 'grid-cols-5 gap-1 p-2' : 'grid-cols-3 gap-2 sm:gap-4 p-4'} rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 shadow-xl transition-all`}>
                <TimeUnit value={timeLeft.years} label="年" isSmall={isSmall} />
                <TimeUnit value={timeLeft.days} label="天" isSmall={isSmall} />
                <TimeUnit value={timeLeft.hours} label="时" isSmall={isSmall} />
                <TimeUnit value={timeLeft.minutes} label="分" isSmall={isSmall} />
                <TimeUnit value={timeLeft.seconds} label="秒" isSmall={isSmall} isLast={!isSmall} />
            </div>
        </div>
    );
};

const TimeUnit: React.FC<{ value: number; label: string; isLast?: boolean; isSmall?: boolean }> = ({ value, label, isLast, isSmall }) => {
    // Key trick to trigger CSS animation on change
    return (
        <div className={`flex flex-col items-center justify-center ${isLast ? 'col-span-3 mt-2' : ''}`}>
            <div className={`relative ${isSmall ? 'h-8' : 'h-12'} w-full flex items-center justify-center overflow-hidden`}>
                <span
                    key={value}
                    className={`${isSmall ? 'text-lg' : 'text-3xl'} font-bold font-display text-primary drop-shadow-sm animate-slide-up`}
                >
                    {value}
                </span>
            </div>
            <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} font-medium text-sage dark:text-sage/80 uppercase tracking-widest`}>{label}</span>
        </div>
    );
};
