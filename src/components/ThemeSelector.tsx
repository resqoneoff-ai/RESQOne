import React from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Moon, Sun, Laptop } from 'lucide-react';

interface ThemeSelectorProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'segmented',
  className = ''
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={`p-2 rounded-xl border transition-all text-xs flex items-center justify-center ${
          resolvedTheme === 'dark'
            ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-300'
            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
        } ${className}`}
        title={`Current theme: ${theme} (Click to toggle)`}
        aria-label="Toggle light and dark mode"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        )}
      </button>
    );
  }

  const options: Array<{ mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }> = [
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'system', label: 'System', icon: Laptop }
  ];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border transition-colors ${
        resolvedTheme === 'dark'
          ? 'bg-[#0E131F] border-slate-800 text-slate-300'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      } ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setTheme(opt.mode)}
            type="button"
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isActive
                ? resolvedTheme === 'dark'
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                  : 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                : 'hover:text-slate-900 dark:hover:text-white opacity-75 hover:opacity-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
