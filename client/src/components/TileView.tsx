import { Book, Heart, MessageSquare, FileText, Users, TrendingUp } from 'lucide-react';

interface TileViewProps {
  onAppClick: (appId: string) => void;
}

export default function TileView({ onAppClick }: TileViewProps) {
  //todo: remove mock functionality
  return (
    <div className="absolute top-14 bottom-24 left-0 right-0 overflow-y-auto p-8">
      <h2 className="text-2xl font-semibold text-foreground mb-6 max-w-7xl mx-auto">Your Faith Workspace</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[150px]">
        
        {/* Flourishing Index - Always First, Large */}
        <button
          onClick={() => onAppClick('flourishing')}
          data-testid="tile-flourishing"
          className="tile-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white relative overflow-hidden"
        >
          <div className="absolute top-3 left-3 text-xs font-medium opacity-80">PRIMARY METRIC: HUMAN FLOURISHING</div>
          <div className="flex flex-col h-full justify-center">
            <div className="text-6xl font-bold mb-1">84 <span className="text-3xl opacity-80">/100</span></div>
            <div className="text-lg font-semibold mb-4">Flourishing Index (FI)</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">💖 Intimacy (Personal)</span>
                <span className="font-semibold">88%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">🤝 Intentionality (Action)</span>
                <span className="font-semibold">79%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">👥 Belonging (Community)</span>
                <span className="font-semibold">85%</span>
              </div>
            </div>
            <div className="mt-3 text-xs opacity-75 italic">Tap to see a personalized AI analysis of your growth.</div>
          </div>
        </button>

        {/* Holy Bible */}
        <button
          onClick={() => onAppClick('bible')}
          data-testid="tile-bible"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-cyan-400 to-blue-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Book className="w-5 h-5" />
            <span className="font-semibold">Holy Bible</span>
          </div>
          <div className="text-xs opacity-90 mb-1">Your latest Scripture:</div>
          <div className="text-sm font-serif italic line-clamp-2">"For God so loved the world..."</div>
          <div className="text-xs opacity-75 mt-1">John 3:16 (NIV)</div>
        </button>

        {/* Daily Devotional */}
        <button
          onClick={() => onAppClick('devotional')}
          data-testid="tile-devotional"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Daily Devotional</span>
          </div>
          <div className="text-xs opacity-90 mb-1">Today's Reflection:</div>
          <div className="text-sm line-clamp-2">Faith is the assurance of things hoped for...</div>
          <div className="text-xs opacity-75 mt-1">Day 12: Hope</div>
        </button>

        {/* Prayer Journal */}
        <button
          onClick={() => onAppClick('prayer')}
          data-testid="tile-prayer"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-red-400 to-pink-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Prayer Journal</span>
          </div>
          <div className="text-4xl font-bold my-2">7</div>
          <div className="text-sm">Active Requests</div>
          <div className="text-xs opacity-90 mt-1">🙏 1 New Answered Prayer</div>
        </button>

        {/* SyncNote */}
        <button
          onClick={() => onAppClick('notes')}
          data-testid="tile-notes"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">SyncNote</span>
          </div>
          <div className="text-xs opacity-90 mb-2">AI-Tags your thoughts</div>
          <div className="text-sm">Last Note:</div>
          <div className="text-sm font-medium">Forgiveness (AI-Tagged)</div>
        </button>

        {/* Faith Circles */}
        <button
          onClick={() => onAppClick('prayer-chain')}
          data-testid="tile-prayer-chain"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-purple-400 to-violet-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Faith Circles</span>
          </div>
          <div className="text-4xl font-bold my-2">2</div>
          <div className="text-sm">New Messages</div>
          <div className="text-xs opacity-90 mt-1">Leader Report shared</div>
        </button>

        {/* Progress Trackers */}
        <button
          onClick={() => onAppClick('flourishing')}
          data-testid="tile-progress"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-teal-400 to-cyan-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Progress Trackers</span>
          </div>
          <div className="text-xs opacity-90 mb-1">Goal Status:</div>
          <div className="text-sm font-medium mb-2">Psalm 23 Memo</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '80%' }} />
            </div>
            <span className="text-sm font-bold">80%</span>
          </div>
        </button>

        {/* Spiritual Guides */}
        <button
          onClick={() => onAppClick('guides')}
          data-testid="tile-guides"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white"
        >
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold mb-1">Spiritual Guides</div>
          <div className="text-xs opacity-90">6 AI companions ready</div>
          <div className="text-xs opacity-75 mt-1">Ask anything about faith</div>
        </button>

        {/* Videos */}
        <button
          onClick={() => onAppClick('videos')}
          data-testid="tile-videos"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-rose-400 to-red-500 text-white"
        >
          <div className="text-2xl mb-2">📺</div>
          <div className="font-semibold mb-1">Videos</div>
          <div className="text-xs opacity-90">3 New Recommendations</div>
          <div className="text-xs opacity-75 mt-1">Personalized for you</div>
        </button>

        {/* Songs */}
        <button
          onClick={() => onAppClick('songs')}
          data-testid="tile-songs"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-indigo-400 to-purple-500 text-white"
        >
          <div className="text-2xl mb-2">🎵</div>
          <div className="font-semibold mb-1">Worship Songs</div>
          <div className="text-xs opacity-90">Playlist: Morning Praise</div>
          <div className="text-xs opacity-75 mt-1">12 songs</div>
        </button>

        {/* Sermons */}
        <button
          onClick={() => onAppClick('sermons')}
          data-testid="tile-sermons"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-cyan-400 to-teal-500 text-white"
        >
          <div className="text-2xl mb-2">🎤</div>
          <div className="font-semibold mb-1">Sermons</div>
          <div className="text-xs opacity-90">Latest: Walking in Faith</div>
          <div className="text-xs opacity-75 mt-1">Rev. James Miller</div>
        </button>

        {/* Library */}
        <button
          onClick={() => onAppClick('library')}
          data-testid="tile-library"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-violet-400 to-purple-500 text-white"
        >
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold mb-1">Library</div>
          <div className="text-xs opacity-90">Reading: Mere Christianity</div>
          <div className="text-xs opacity-75 mt-1">C.S. Lewis</div>
        </button>

        {/* Mood Tracker */}
        <button
          onClick={() => onAppClick('mood')}
          data-testid="tile-mood"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-orange-400 to-amber-500 text-white"
        >
          <div className="text-2xl mb-2">😊</div>
          <div className="font-semibold mb-1">Mood Tracker</div>
          <div className="text-xs opacity-90">How are you feeling?</div>
          <div className="text-xs opacity-75 mt-1">Track your emotions</div>
        </button>

        {/* Calendar */}
        <button
          onClick={() => onAppClick('calendar')}
          data-testid="tile-calendar"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-sky-400 to-blue-500 text-white"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold mb-1">Calendar</div>
          <div className="text-xs opacity-90">3 events today</div>
          <div className="text-xs opacity-75 mt-1">Next: Bible Study 12PM</div>
        </button>

        {/* Settings */}
        <button
          onClick={() => onAppClick('settings')}
          data-testid="tile-settings"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-slate-400 to-gray-500 text-white"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-semibold mb-1">Settings</div>
          <div className="text-xs opacity-90">Customize your workspace</div>
          <div className="text-xs opacity-75 mt-1">Preferences & more</div>
        </button>

      </div>
    </div>
  );
}
