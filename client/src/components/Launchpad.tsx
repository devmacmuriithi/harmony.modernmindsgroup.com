import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { apps } from './DesktopDock';

interface LaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
  onAppClick: (appId: string) => void;
}

export default function Launchpad({ isOpen, onClose, onAppClick }: LaunchpadProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (appId: string) => {
    onAppClick(appId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      data-testid="launchpad-overlay"
    >
      <div 
        className="w-full max-w-4xl mx-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-amber-900/20 dark:border-amber-200/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Available On Harmony</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            data-testid="button-close-launchpad"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600/60" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-slate-800/70 py-3 pl-12 pr-4 text-sm placeholder-amber-600/60 dark:placeholder-amber-400/60 transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            data-testid="input-search-apps"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-6">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all duration-200 hover:-translate-y-1"
              data-testid={`launchpad-app-${app.id}`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg`}>
                {app.icon}
              </div>
              <span className="text-xs font-medium text-foreground text-center line-clamp-2">
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No apps found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
