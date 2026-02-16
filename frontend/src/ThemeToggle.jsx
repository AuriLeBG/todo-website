import React from 'react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full transition-all duration-300 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 group"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
            {theme === 'light' ? (
                <span className="text-xl group-hover:scale-110 block transition-transform">🌙</span>
            ) : (
                <span className="text-xl group-hover:scale-110 block transition-transform">☀️</span>
            )}
        </button>
    );
}
