import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useEffect } from 'react';

interface TopMenuBarProps {
  viewMode: 'tiles' | 'icons';
  onViewModeToggle: () => void;
}

export default function TopMenuBar({ viewMode, onViewModeToggle }: TopMenuBarProps) {
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    // Ensure theme is applied on mount
  }, [theme]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 border-b border-amber-900/20 dark:border-amber-200/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="h-full w-full px-6">
        <div className="grid grid-cols-3 items-center h-full gap-4">
          <div className="flex items-center space-x-3 justify-start">
            <svg className="h-8 w-8 text-amber-700 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.94-7-5.14-7-9V8.3l7-3.11 7 3.11V11c0 3.86-3.14 8.06-7 9zm-2-8h4v2h-4v-2zm0-4h4v2h-4V8z"/>
            </svg>
            <span className="font-bold text-lg text-amber-800 dark:text-amber-300 hidden sm:inline">Harmony</span>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search scriptures, devotionals, prayers..." 
                data-testid="input-search"
                className="w-full rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-slate-800/70 py-2 pl-10 pr-4 text-sm placeholder-amber-600/60 dark:placeholder-amber-400/60 transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-end">
            <label className="relative inline-block w-[50px] h-7">
              <input 
                type="checkbox" 
                checked={viewMode === 'tiles'} 
                onChange={onViewModeToggle}
                data-testid="toggle-view-mode"
                className="opacity-0 w-0 h-0 peer"
              />
              <span className="absolute cursor-pointer inset-0 bg-gray-300 transition-all duration-400 rounded-full before:absolute before:content-[''] before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-400 before:rounded-full peer-checked:bg-[#c9a961] peer-checked:before:translate-x-[22px]" />
            </label>

            <button 
              className="relative p-2 rounded-full text-amber-700 dark:text-amber-400 hover-elevate active-elevate-2 transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-amber-700 dark:text-amber-400 hover-elevate active-elevate-2 transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>
            
            <img 
              src="https://i.pravatar.cc/150?u=user" 
              alt="Profile" 
              className="h-9 w-9 rounded-full ring-2 ring-amber-400 cursor-pointer"
              data-testid="img-profile"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
