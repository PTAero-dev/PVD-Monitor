import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('pvd_theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    });

    useEffect(() => {
        localStorage.setItem('pvd_theme', theme);
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--color-bg', '#0b1120');
            root.style.setProperty('--color-bg-elevated', '#0f172a');
            root.style.setProperty('--color-surface', '#151f32');
            root.style.setProperty('--color-surface-hover', '#1e293b');
            root.style.setProperty('--color-text-main', '#f8fafc');
            root.style.setProperty('--color-text-secondary', '#cbd5e1');
            root.style.setProperty('--color-text-muted', '#64748b');
            root.style.setProperty('--color-border', '#26354d');
            root.style.setProperty('--color-header-bg', 'rgba(15, 23, 42, 0.85)');
            root.style.setProperty('--color-primary', '#6366f1');
            root.style.setProperty('--color-primary-light', '#818cf8');
        } else {
            root.style.removeProperty('--color-bg');
            root.style.removeProperty('--color-bg-elevated');
            root.style.removeProperty('--color-surface');
            root.style.removeProperty('--color-surface-hover');
            root.style.removeProperty('--color-text-main');
            root.style.removeProperty('--color-text-secondary');
            root.style.removeProperty('--color-text-muted');
            root.style.removeProperty('--color-border');
            root.style.removeProperty('--color-header-bg');
            root.style.removeProperty('--color-primary');
            root.style.removeProperty('--color-primary-light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
