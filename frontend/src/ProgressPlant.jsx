import React from 'react';

// Simple SVG representations for different stages
const Seed = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="text-amber-700 fill-current">
        <circle cx="50" cy="80" r="10" />
    </svg>
);

const Sprout = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="text-green-500 fill-current">
        <path d="M50 80 Q50 50 20 40 M50 80 Q50 50 80 40" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="50" cy="80" r="5" className="fill-amber-700 stroke-none" />
        <path d="M20 40 Q10 30 20 20 Q30 30 20 40" />
        <path d="M80 40 Q90 30 80 20 Q70 30 80 40" />
    </svg>
);

const Plant = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="text-green-600 fill-current">
        <path d="M50 80 L50 30" stroke="currentColor" strokeWidth="6" />
        <path d="M50 60 Q20 50 10 30 Q40 40 50 60" />
        <path d="M50 50 Q80 40 90 20 Q60 30 50 50" />
        <circle cx="50" cy="80" r="5" className="fill-amber-700 stroke-none" />
    </svg>
);

const Flower = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="text-pink-500 fill-current">
        <path d="M50 80 L50 30" stroke="green" strokeWidth="6" />
        <path d="M50 60 Q20 50 10 30 Q40 40 50 60" fill="green" />
        <path d="M50 50 Q80 40 90 20 Q60 30 50 50" fill="green" />
        <circle cx="50" cy="30" r="15" className="fill-yellow-400" />
        <circle cx="35" cy="30" r="10" />
        <circle cx="65" cy="30" r="10" />
        <circle cx="50" cy="15" r="10" />
        <circle cx="50" cy="45" r="10" />
    </svg>
);

const Tree = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="text-green-800 fill-current">
        <rect x="45" y="60" width="10" height="40" className="fill-amber-800" />
        <circle cx="50" cy="40" r="30" />
        <circle cx="30" cy="50" r="20" />
        <circle cx="70" cy="50" r="20" />
        <circle cx="50" cy="20" r="20" />
    </svg>
);

const ProgressPlant = ({ count }) => {
    let StageComponent = Seed;
    let label = "Plant a seed (0 tasks)";

    if (count > 0 && count < 3) {
        StageComponent = Sprout;
        label = "Sprouting! (1-2 tasks)";
    } else if (count >= 3 && count < 5) {
        StageComponent = Plant;
        label = "Growing strong (3-4 tasks)";
    } else if (count >= 5 && count < 8) {
        StageComponent = Flower;
        label = "Blooming! (5-7 tasks)";
    } else if (count >= 8) {
        StageComponent = Tree;
        label = "Mighty Tree! (8+ tasks)";
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full w-40 h-40 shadow-lg border border-white/60 dark:border-gray-600/50 transition-all transform hover:scale-105">
            <StageComponent />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2 text-center">{label}</p>
        </div>
    );
};

export default ProgressPlant;
