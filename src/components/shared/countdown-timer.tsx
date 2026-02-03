"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    deadline: Date;
    onExpire?: () => void;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
}

export function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
        calculateTimeRemaining(deadline)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining(deadline);
            setTimeRemaining(remaining);

            if (remaining.isExpired && onExpire) {
                onExpire();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [deadline, onExpire]);

    if (timeRemaining.isExpired) {
        return null; // Hide when expired
    }

    const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 24;
    const isVeryUrgent = timeRemaining.days === 0 && timeRemaining.hours < 6;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
        inline-flex items-center gap-3 px-6 py-3 rounded-lg border backdrop-blur-sm
        ${isVeryUrgent
                    ? "bg-red-500/20 border-red-400/40"
                    : isUrgent
                        ? "bg-orange-500/20 border-orange-400/40"
                        : "bg-gold/10 border-gold/30"
                }
      `}
        >
            <Clock
                size={20}
                className={`
          ${isVeryUrgent ? "text-red-400" : isUrgent ? "text-orange-400" : "text-gold"}
        `}
            />
            <div className="flex items-baseline gap-2">
                <span
                    className={`
            text-sm font-light
            ${isVeryUrgent ? "text-red-100" : isUrgent ? "text-orange-100" : "text-gray-200"}
          `}
                >
                    報名截止倒數：
                </span>
                <div className="flex items-center gap-2">
                    {timeRemaining.days > 0 && (
                        <TimeUnit
                            value={timeRemaining.days}
                            unit="天"
                            isUrgent={isVeryUrgent}
                        />
                    )}
                    <TimeUnit
                        value={timeRemaining.hours}
                        unit="時"
                        isUrgent={isVeryUrgent}
                    />
                    <TimeUnit
                        value={timeRemaining.minutes}
                        unit="分"
                        isUrgent={isVeryUrgent}
                    />
                    <TimeUnit
                        value={timeRemaining.seconds}
                        unit="秒"
                        isUrgent={isVeryUrgent}
                    />
                </div>
            </div>
        </motion.div>
    );
}

interface TimeUnitProps {
    value: number;
    unit: string;
    isUrgent: boolean;
}

function TimeUnit({ value, unit, isUrgent }: TimeUnitProps) {
    return (
        <div className="flex items-baseline gap-0.5">
            <motion.span
                key={value} // Re-animate on value change
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`
          text-lg font-light tabular-nums
          ${isUrgent ? "text-red-300" : "text-gold"}
        `}
            >
                {String(value).padStart(2, "0")}
            </motion.span>
            <span
                className={`
          text-xs
          ${isUrgent ? "text-red-400/70" : "text-gray-400"}
        `}
            >
                {unit}
            </span>
        </div>
    );
}

function calculateTimeRemaining(deadline: Date): TimeRemaining {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
        };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
    };
}
