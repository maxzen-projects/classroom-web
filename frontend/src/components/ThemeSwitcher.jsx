import React, { useMemo, useState } from 'react';
import { FaCheck, FaPalette } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = ({ compact = false }) => {
  const { theme, themes, setTheme, isThemeActive } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = useMemo(
    () => themes.find((item) => item.id === theme) || themes[0],
    [theme, themes]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`theme-transition flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-text shadow-card hover:border-primary hover:bg-primary-soft ${
          compact ? 'w-full justify-center' : ''
        }`}
      >
        <FaPalette className="h-4 w-4 text-primary" />
        <span>{compact ? 'Theme' : activeTheme.label}</span>
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-card-hover ${compact ? 'left-0' : 'right-0'}`}>
          <div className="mb-2 px-2 pt-1">
            <p className="text-sm font-semibold text-text">Choose theme</p>
            <p className="text-xs text-text-muted">Changes apply instantly and stay saved on this device.</p>
          </div>

          <div className="space-y-1">
            {themes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTheme(item.id);
                  setIsOpen(false);
                }}
                className={`theme-transition flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-card-alt ${
                  isThemeActive(item.id) ? 'bg-primary-soft' : ''
                }`}
              >
                <span data-theme={item.id} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-card">
                  <span className="h-5 w-5 rounded-full bg-primary" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-text">{item.label}</span>
                  <span className="block text-xs text-text-muted">{item.description}</span>
                </span>
                {isThemeActive(item.id) && <FaCheck className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
