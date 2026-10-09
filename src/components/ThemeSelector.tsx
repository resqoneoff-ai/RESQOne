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
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop }
  ];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border transition-colors ${
        resolvedTheme === 'dark'
          ? 'bg-[#0E131F] border-slate-800 text-slate-300'
          : 'bg-[#FAFBFC] border-[#DCE3EC] text-[#596579]'
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
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? resolvedTheme === 'dark'
                  ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                  : 'bg-white text-[#082B5C] shadow-xs ring-1 ring-[#DCE3EC]'
                : 'hover:text-[#082B5C] dark:hover:text-white opacity-75 hover:opacity-100'
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
