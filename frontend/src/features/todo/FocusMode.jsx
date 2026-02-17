import React, { useState, useEffect } from 'react';

const FocusMode = ({ task, onExit, onComplete }) => {
    const [totalTime, setTotalTime] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play sound or notification
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(totalTime);
    };

    const adjustTime = (amount) => {
        if (isActive) return;
        const newTime = Math.max(60, totalTime + amount);
        setTotalTime(newTime);
        setTimeLeft(newTime);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500 animate-fade-in">
            <div className="relative w-full max-w-2xl p-8 mx-4 text-center">
                <button
                    onClick={onExit}
                    className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="mb-12 space-y-4">
                    <h2 className="text-xl text-purple-300 font-medium tracking-wider uppercase">Focusing on</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{task.title}</h1>
                    {task.category && (
                        <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white/80 text-sm font-medium backdrop-blur-sm border border-white/10">
                            {task.category}
                        </span>
                    )}
                </div>

                {/* Timer Display */}
                <div className="relative w-72 h-72 mx-auto mb-12 flex items-center justify-center">
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>

                    {/* SVG Progress Circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="144"
                            cy="144"
                            r="140"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-purple-500 transition-all duration-1000 ease-linear"
                            strokeDasharray={2 * Math.PI * 140}
                            strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="flex flex-col items-center z-10">
                        {/* Time Adjustments (Only visible when not active) */}
                        {!isActive && timeLeft === totalTime && (
                            <div className="flex gap-4 mb-2 animate-fade-in">
                                <button
                                    onClick={() => adjustTime(-300)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/5 shadow-lg"
                                    title="-5 minutes"
                                >
                                    -5
                                </button>
                                <button
                                    onClick={() => adjustTime(300)}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/5 shadow-lg"
                                    title="+5 minutes"
                                >
                                    +5
                                </button>
                            </div>
                        )}

                        <div className="text-7xl font-mono font-bold text-white tracking-widest">
                            {formatTime(timeLeft)}
                        </div>

                        {!isActive && timeLeft === totalTime && (
                            <div className="text-sm text-white/40 mt-2 uppercase tracking-tight">Adjust duration</div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={toggleTimer}
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${isActive ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/50'}`}
                    >
                        {isActive ? 'Pause' : 'Start Focus'}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="px-6 py-3 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Reset
                    </button>

                    <button
                        onClick={() => onComplete(task.id)}
                        className="px-8 py-3 rounded-xl font-bold text-lg bg-green-600/80 text-white hover:bg-green-500 hover:scale-105 transition-all shadow-lg shadow-green-900/50 ml-8"
                    >
                        Complete Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FocusMode;
