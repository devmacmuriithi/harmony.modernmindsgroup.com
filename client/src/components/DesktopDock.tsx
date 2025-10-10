import { Book, Heart, MessageSquare, Smile, Users, FileText, Radio, Music, Video, BookOpen, BarChart3, Calendar, Settings, Grid3x3, DollarSign } from 'lucide-react';

export interface AppConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export const apps: AppConfig[] = [
  { id: 'bible', name: 'Bible', icon: <Book className="w-8 h-8" />, color: 'from-purple-500 to-indigo-600' },
  { id: 'devotional', name: 'Devotional', icon: <Heart className="w-8 h-8" />, color: 'from-green-500 to-emerald-600' },
  { id: 'prayer', name: 'Prayer', icon: <MessageSquare className="w-8 h-8" />, color: 'from-blue-500 to-cyan-600' },
  { id: 'mood', name: 'Mood', icon: <Smile className="w-8 h-8" />, color: 'from-yellow-500 to-orange-600' },
  { id: 'guides', name: 'Guides', icon: <Users className="w-8 h-8" />, color: 'from-amber-500 to-yellow-600' },
  { id: 'notes', name: 'Notes', icon: <FileText className="w-8 h-8" />, color: 'from-gray-500 to-slate-600' },
  { id: 'prayer-chain', name: 'Prayer Chain', icon: <Radio className="w-8 h-8" />, color: 'from-pink-500 to-rose-600' },
  { id: 'videos', name: 'Videos', icon: <Video className="w-8 h-8" />, color: 'from-red-500 to-pink-600' },
  { id: 'songs', name: 'Songs', icon: <Music className="w-8 h-8" />, color: 'from-indigo-500 to-purple-600' },
  { id: 'sermons', name: 'Sermons', icon: <BookOpen className="w-8 h-8" />, color: 'from-teal-500 to-cyan-600' },
  { id: 'library', name: 'Library', icon: <BookOpen className="w-8 h-8" />, color: 'from-violet-500 to-purple-600' },
  { id: 'flourishing', name: 'Flourishing', icon: <BarChart3 className="w-8 h-8" />, color: 'from-emerald-500 to-green-600' },
  { id: 'financial-stewardship', name: 'Financial Stewardship', icon: <DollarSign className="w-8 h-8" />, color: 'from-green-600 to-emerald-700' },
  { id: 'calendar', name: 'Calendar', icon: <Calendar className="w-8 h-8" />, color: 'from-sky-500 to-blue-600' },
  { id: 'settings', name: 'Settings', icon: <Settings className="w-8 h-8" />, color: 'from-stone-500 to-gray-600' },
];

// Default apps to show in dock (first 4 apps)
const defaultDockApps = ['bible', 'prayer', 'notes', 'calendar'];

interface DesktopDockProps {
  onAppClick: (appId: string) => void;
  onLaunchpadClick: () => void;
  activeApps: string[];
  launchedApps: string[];
}

export default function DesktopDock({ onAppClick, onLaunchpadClick, activeApps = [], launchedApps = [] }: DesktopDockProps) {
  // Combine default apps with launched apps (avoiding duplicates)
  const dockApps = [...defaultDockApps];
  
  launchedApps.forEach(appId => {
    if (!dockApps.includes(appId)) {
      dockApps.push(appId);
    }
  });

  const dockAppConfigs = dockApps
    .map(appId => apps.find(app => app.id === appId))
    .filter(Boolean) as AppConfig[];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-900/20 dark:border-amber-200/20 shadow-2xl">
      <div className="flex items-center gap-2">
        {/* Launchpad Icon - Always First */}
        <button
          onClick={onLaunchpadClick}
          data-testid="dock-icon-launchpad"
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white transition-all duration-200 hover:-translate-y-2 hover:scale-110 active-elevate-2"
        >
          <Grid3x3 className="w-8 h-8" />
        </button>

        {/* Separator */}
        <div className="w-px h-10 bg-amber-900/20 dark:bg-amber-200/20 mx-1" />

        {/* App Icons */}
        {dockAppConfigs.map((app) => {
          const isActive = activeApps.includes(app.id);
          
          return (
            <div key={app.id} className="flex flex-col items-center gap-1">
              <button
                onClick={() => onAppClick(app.id)}
                data-testid={`dock-icon-${app.id}`}
                className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br text-white transition-all duration-200 hover:-translate-y-2 hover:scale-110 active-elevate-2"
                style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
              >
                <div className={`bg-gradient-to-br ${app.color} w-full h-full rounded-xl flex items-center justify-center`}>
                  {app.icon}
                </div>
              </button>
              {/* Active Indicator Dot */}
              {isActive && (
                <div 
                  className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
                  data-testid={`dock-indicator-${app.id}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
