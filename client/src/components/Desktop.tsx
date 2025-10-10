import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ChevronLeft } from 'lucide-react';
import DesktopBackground from './DesktopBackground';
import TopMenuBar from './TopMenuBar';
import DesktopDock, { apps } from './DesktopDock';
import DesktopIcon from './DesktopIcon';
import TileView from './TileView';
import Window from './Window';
import Launchpad from './Launchpad';
import RightSidebar from './RightSidebar';
import FlourishingWidget from './FlourishingWidget';
import { Button } from '@/components/ui/button';

import BibleWindow from './apps/BibleWindow';
import DevotionalWindow from './apps/DevotionalWindow';
import PrayerWindow from './apps/PrayerWindow';
import MoodWindow from './apps/MoodWindow';
import GuidesWindow from './apps/GuidesWindow';
import NotesWindow from './apps/NotesWindow';
import PrayerChainWindow from './apps/PrayerChainWindow';
import VideosWindow from './apps/VideosWindow';
import SongsWindow from './apps/SongsWindow';
import SermonsWindow from './apps/SermonsWindow';
import LibraryWindow from './apps/LibraryWindow';
import FlourishingWindow from './apps/FlourishingWindow';
import CalendarWindow from './apps/CalendarWindow';
import SettingsWindow from './apps/SettingsWindow';
import FaithCirclesWindow from './apps/FaithCirclesWindow';
import FinancialStewardshipWindow from './apps/FinancialStewardshipWindow';

const appComponents: Record<string, { component: React.ReactNode; title: string; icon: string }> = {
  bible: { component: <BibleWindow />, title: 'Bible', icon: '📖' },
  devotional: { component: <DevotionalWindow />, title: 'Devotional', icon: '💫' },
  prayer: { component: <PrayerWindow />, title: 'Prayer Journal', icon: '🙏' },
  mood: { component: <MoodWindow />, title: 'Mood Tracker', icon: '😊' },
  guides: { component: <GuidesWindow />, title: 'Spiritual Guides', icon: '👥' },
  notes: { component: <NotesWindow />, title: 'Sync Notes', icon: '📝' },
  'prayer-chain': { component: <PrayerChainWindow />, title: 'Prayer Chain', icon: '🔗' },
  'faith-circles': { component: <FaithCirclesWindow />, title: 'Faith Circles', icon: '⭕' },
  videos: { component: <VideosWindow />, title: 'Videos', icon: '📺' },
  songs: { component: <SongsWindow />, title: 'Songs', icon: '🎵' },
  sermons: { component: <SermonsWindow />, title: 'Sermons', icon: '🎤' },
  library: { component: <LibraryWindow />, title: 'Library', icon: '📚' },
  flourishing: { component: <FlourishingWindow />, title: 'Flourishing Index', icon: '📊' },
  'financial-stewardship': { component: <FinancialStewardshipWindow />, title: 'Financial Stewardship', icon: '💰' },
  calendar: { component: <CalendarWindow />, title: 'Calendar', icon: '📅' },
  settings: { component: <SettingsWindow />, title: 'Settings', icon: '⚙️' },
};

export default function Desktop() {
  const [viewMode, setViewMode] = useState<'tiles' | 'icons'>('tiles');
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [launchedApps, setLaunchedApps] = useState<string[]>([]);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isWidgetVisible, setIsWidgetVisible] = useState(true);

  // Check if flourishing data exists for widget
  const { data: flourishingData } = useQuery<{ data: any | null }>({
    queryKey: ['/api/flourishing']
  });

  const handleAppClick = (appId: string) => {
    // Track launched apps
    if (!launchedApps.includes(appId)) {
      setLaunchedApps([...launchedApps, appId]);
    }
    
    // Open window if not already open
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId]);
    }
  };

  const handleCloseWindow = (appId: string) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
    
    // Remove non-default apps from dock when closed
    const defaultDockApps = ['bible', 'prayer', 'notes', 'calendar'];
    if (!defaultDockApps.includes(appId)) {
      setLaunchedApps(launchedApps.filter(id => id !== appId));
    }
  };

  return (
    <DesktopBackground>
      <TopMenuBar 
        viewMode={viewMode} 
        onViewModeToggle={() => setViewMode(prev => prev === 'tiles' ? 'icons' : 'tiles')} 
      />

      <main className="relative h-screen w-screen pt-14 pb-24 overflow-hidden">
        {viewMode === 'icons' ? (
          <div className="flex h-full relative">
            {/* Left side: Desktop Icons */}
            <div className={`flex-1 p-4 grid grid-flow-col auto-cols-max gap-x-4 gap-y-1 grid-rows-5 transition-all duration-300 ${
              isSidebarOpen ? 'mr-80' : 'mr-0'
            }`}>
              {apps.map(app => (
                <DesktopIcon
                  key={app.id}
                  icon={appComponents[app.id]?.icon || '📄'}
                  label={app.name}
                  onClick={() => handleAppClick(app.id)}
                />
              ))}
            </div>
            
            {/* Middle: Flourishing Widget (only if data exists) */}
            {flourishingData?.data && (
              <>
                {isWidgetVisible ? (
                  <div className="absolute left-8 top-8 z-10" data-testid="flourishing-widget-container">
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 z-10"
                        onClick={() => setIsWidgetVisible(false)}
                        data-testid="button-close-widget"
                        aria-label="Close flourishing widget"
                        title="Close flourishing widget"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <FlourishingWidget />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsWidgetVisible(true)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all z-10 text-sm font-medium"
                    data-testid="button-show-widget"
                    aria-label="Show flourishing widget"
                    title="Show flourishing widget"
                  >
                    Show Flourishing Widget
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <TileView onAppClick={handleAppClick} />
        )}

        {openWindows.map((appId, index) => {
          const appConfig = appComponents[appId];
          if (!appConfig) return null;

          return (
            <Window
              key={appId}
              appId={appId}
              title={appConfig.title}
              onClose={() => handleCloseWindow(appId)}
              initialPosition={{ 
                x: 100 + (index * 40), 
                y: 100 + (index * 40) 
              }}
            >
              {appConfig.component}
            </Window>
          );
        })}
      </main>

      {/* Right Sidebar - Outside main to avoid bottom padding */}
      {viewMode === 'icons' && (
        <div 
          className={`fixed top-14 right-0 bottom-0 w-80 border-l border-amber-200/30 dark:border-amber-800/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm transition-transform duration-300 ease-in-out z-20 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="relative h-full">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 left-2 h-6 w-6 z-10"
              onClick={() => setIsSidebarOpen(false)}
              data-testid="button-close-sidebar"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <X className="h-3 w-3" />
            </Button>
            <RightSidebar />
          </div>
        </div>
      )}

      {/* Floating Reopen Button - Outside main */}
      {viewMode === 'icons' && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-l-lg shadow-lg transition-all z-30"
          data-testid="button-open-sidebar"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <DesktopDock 
        onAppClick={handleAppClick}
        onLaunchpadClick={() => setIsLaunchpadOpen(true)}
        activeApps={openWindows}
        launchedApps={launchedApps}
      />

      <Launchpad
        isOpen={isLaunchpadOpen}
        onClose={() => setIsLaunchpadOpen(false)}
        onAppClick={handleAppClick}
      />
    </DesktopBackground>
  );
}
