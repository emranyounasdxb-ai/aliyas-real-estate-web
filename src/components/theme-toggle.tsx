'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from '@/components/brand-icons';

const storageKey = 'aliyas-theme';
type Theme = 'light' | 'dark';
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#111512' : '#ffffff');
}
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    applyTheme(event.newValue === 'dark' ? 'dark' : 'light');
    callback();
  };
  window.addEventListener('aliyas-theme', callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('aliyas-theme', callback);
    window.removeEventListener('storage', onStorage);
  };
}
function snapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => 'light');
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      className="signature-icon-button theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => {
        const next = snapshot() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          /* Theme still works when browser storage is unavailable. */
        }
        window.dispatchEvent(new Event('aliyas-theme'));
      }}
    >
      {theme === 'dark' ? (
        <Sun size={21} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon size={21} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
