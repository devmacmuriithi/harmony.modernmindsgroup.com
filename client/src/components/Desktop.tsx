import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DesktopBackground from './DesktopBackground';
import TopMenuBar from './TopMenuBar';
import DesktopDock, { apps } from './DesktopDock';
import DesktopIcon from './DesktopIcon';
import TileView from './TileView';
import Window from './Window';
import Launchpad from './Launchpad';
import RightSidebar from './RightSidebar';
import FlourishingWidget from './FlourishingWidget';

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
  calendar: { component: <CalendarWindow />, title: 'Calendar', icon: '📅' },
  settings: { component: <SettingsWindow />, title: 'Settings', icon: '⚙️' },
};

export default function Desktop() {
  const [viewMode, setViewMode] = useState<'tiles' | 'icons'>('tiles');
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [launchedApps, setLaunchedApps] = useState<string[]>([]);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);

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
          <div className="flex h-full gap-4">
            {/* Left side: Desktop Icons */}
            <div className="flex-1 p-4 grid grid-flow-col auto-cols-max gap-x-4 gap-y-1 grid-rows-5">
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
              <div className="flex items-center justify-center px-4" data-testid="flourishing-widget-container">
                <div className="w-64">
                  <FlourishingWidget />
                </div>
              </div>
            )}
            
            {/* Right side: Sidebar Widgets */}
            <div className="border-l border-amber-200/30 dark:border-amber-800/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
              <RightSidebar />
            </div>
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
