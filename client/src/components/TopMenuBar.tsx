import { Bell, Sun, Moon, RefreshCw, Search, BookOpen, MessageCircle, FileText, Lightbulb, Video, Music, Mic, Book, Users } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useEffect, useState, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  content: string | null;
}

interface TopMenuBarProps {
  viewMode: 'tiles' | 'icons';
  onViewModeToggle: () => void;
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case 'bible': return BookOpen;
    case 'prayer': return MessageCircle;
    case 'devotional': return Book;
    case 'note': return FileText;
    case 'guide': return Lightbulb;
    case 'video': return Video;
    case 'song': return Music;
    case 'sermon': return Mic;
    case 'resource': return Book;
    case 'circle': return Users;
    default: return Search;
  }
};

const getEntityLabel = (type: string) => {
  switch (type) {
    case 'bible': return 'Bible Verse';
    case 'prayer': return 'Prayer';
    case 'devotional': return 'Devotional';
    case 'note': return 'Note';
    case 'guide': return 'Spiritual Guide';
    case 'video': return 'Video';
    case 'song': return 'Song';
    case 'sermon': return 'Sermon';
    case 'resource': return 'Resource';
    case 'circle': return 'Faith Circle';
    default: return 'Result';
  }
};

export default function TopMenuBar({ viewMode, onViewModeToggle }: TopMenuBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Ensure theme is applied on mount
  }, [theme]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: searchResults } = useQuery<{ data: { results: SearchResult[], query: string } }>({
    queryKey: [`/api/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length >= 2
  });

  // Fetch recent activity for notifications
  const { data: devotionalsData } = useQuery<{ data: any[] }>({
    queryKey: ['/api/devotionals']
  });
  
  const { data: prayersData } = useQuery<{ data: any[] }>({
    queryKey: ['/api/prayers']
  });
  
  const { data: videosData } = useQuery<{ data: any[] }>({
    queryKey: ['/api/videos']
  });

  // Group results by entity type
  const groupedResults = searchResults?.data?.results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>) || {};

  // Create notifications from recent activity
  const notifications = [
    ...(devotionalsData?.data?.slice(0, 1).map(d => ({
      id: d.id,
      type: 'devotional',
      title: 'New Devotional Available',
      message: d.title,
      time: 'Just now',
      icon: '✨'
    })) || []),
    ...(prayersData?.data?.filter(p => p.isAnswered).slice(0, 2).map(p => ({
      id: p.id,
      type: 'prayer',
      title: 'Prayer Answered',
      message: p.content.substring(0, 50) + '...',
      time: 'Recently',
      icon: '🙏'
    })) || []),
    ...(videosData?.data?.slice(0, 2).map(v => ({
      id: v.id,
      type: 'video',
      title: 'New Video Recommendation',
      message: v.title,
      time: 'Today',
      icon: '📺'
    })) || [])
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Invalidate all queries to refresh all data
    await queryClient.invalidateQueries();
    
    // Keep spinning for at least 500ms for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

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
            <div ref={searchRef} className="relative w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600/60" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search scriptures, devotionals, prayers..." 
                data-testid="input-search"
                className="w-full rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-slate-800/70 py-2 pl-10 pr-4 text-sm placeholder-amber-600/60 dark:placeholder-amber-400/60 transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              
              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery.length >= 2 && searchResults?.data?.results && searchResults.data.results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {Object.entries(groupedResults).map(([type, results]) => {
                    const Icon = getEntityIcon(type);
                    return (
                      <div key={type} className="border-b border-amber-100 dark:border-amber-900 last:border-0">
                        <div className="sticky top-0 bg-amber-50/95 dark:bg-slate-800/95 backdrop-blur-sm px-4 py-2 border-b border-amber-200/50 dark:border-amber-800/50">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                              {getEntityLabel(type)} ({results.length})
                            </span>
                          </div>
                        </div>
                        {results.map((result) => (
                          <button
                            key={result.id}
                            data-testid={`search-result-${result.type}-${result.id}`}
                            className="w-full flex items-start gap-3 px-4 py-3 hover-elevate active-elevate-2 border-b border-amber-50 dark:border-amber-950 last:border-0 text-left transition-colors"
                            onClick={() => {
                              setSearchQuery('');
                              setIsSearchFocused(false);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              {result.subtitle && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {result.subtitle}
                                </p>
                              )}
                              {result.content && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {result.content}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* No Results */}
              {isSearchFocused && searchQuery.length >= 2 && searchResults?.data?.results && searchResults.data.results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg p-4 z-50">
                  <p className="text-sm text-muted-foreground text-center">No results found for "{searchQuery}"</p>
                </div>
              )}
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full text-amber-700 dark:text-amber-400 hover-elevate active-elevate-2 transition-colors disabled:opacity-50"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div ref={notificationsRef} className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full text-amber-700 dark:text-amber-400 hover-elevate active-elevate-2 transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  <div className="p-3 border-b border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                  </div>
                  
                  {notifications.length > 0 ? (
                    <div>
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          data-testid={`notification-${notification.type}-${notification.id}`}
                          className="w-full flex items-start gap-3 px-4 py-3 hover-elevate active-elevate-2 border-b border-amber-100 dark:border-amber-900 last:border-0 text-left transition-colors"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          <div className="text-2xl flex-shrink-0">{notification.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">No new notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
