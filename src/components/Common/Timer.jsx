import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { differenceInSeconds, parseISO } from 'date-fns';

const Timer = ({ startsAt, durationMinutes, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!startsAt || !durationMinutes) return;

        const interval = setInterval(() => {
            const startTime = typeof startsAt === 'string' ? parseISO(startsAt) : startsAt;
            const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
            const now = new Date();

            const secondsRemaining = differenceInSeconds(endTime, now);

            if (secondsRemaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                if (onExpire) onExpire();
            } else {
                setTimeLeft(secondsRemaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startsAt, durationMinutes, onExpire]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const percentage = Math.max(0, (timeLeft / (durationMinutes * 60)) * 100);

    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={552}
                        strokeDashoffset={552 - (552 * percentage) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="text-primary-500 transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    />
                </svg>

                {/* Time Text */}
                <div className="absolute flex flex-col items-center">
                    <Clock size={24} className="text-slate-500 mb-1" />
                    <span className="text-4xl font-bold font-mono text-white tracking-tighter">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">
                        Remaining
                    </span>
                </div>
            </div>

            {timeLeft < 30 && timeLeft > 0 && (
                <p className="text-red-400 font-bold animate-pulse text-sm">
                    Ending soon!
                </p>
            )}
        </div>
    );
};

export default Timer;
