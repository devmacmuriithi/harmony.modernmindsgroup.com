import { useQuery } from '@tanstack/react-query';
import { Book, Heart, MessageSquare, FileText, Users, TrendingUp } from 'lucide-react';

interface TileViewProps {
  onAppClick: (appId: string) => void;
}

export default function TileView({ onAppClick }: TileViewProps) {
  // Fetch live data for previews
  const { data: flourishingData } = useQuery<{ data: any }>({ queryKey: ['/api/flourishing'] });
  const { data: bibleData } = useQuery<{ data: any[] }>({ queryKey: ['/api/bible-verses'] });
  const { data: prayersData } = useQuery<{ data: any[] }>({ queryKey: ['/api/prayers'] });
  const { data: devotionalsData } = useQuery<{ data: any[] }>({ queryKey: ['/api/devotionals'] });
  const { data: notesData } = useQuery<{ data: any[] }>({ queryKey: ['/api/notes'] });
  const { data: chainsData } = useQuery<{ data: any[] }>({ queryKey: ['/api/prayer-chains'] });
  const { data: guidesData } = useQuery<{ data: any[] }>({ queryKey: ['/api/guides'] });
  const { data: videosData } = useQuery<{ data: any[] }>({ queryKey: ['/api/videos'] });
  const { data: songsData } = useQuery<{ data: any[] }>({ queryKey: ['/api/songs'] });
  const { data: sermonsData } = useQuery<{ data: any[] }>({ queryKey: ['/api/sermons'] });
  const { data: resourcesData } = useQuery<{ data: any[] }>({ queryKey: ['/api/resources'] });
  const { data: moodsData } = useQuery<{ data: any[] }>({ queryKey: ['/api/moods'] });
  const { data: circlesData } = useQuery<{ data: any[] }>({ queryKey: ['/api/faith-circles'] });

  const flourishing = flourishingData?.data;
  const latestBible = bibleData?.data?.[0];
  const activePrayers = prayersData?.data?.filter(p => !p.isAnswered) || [];
  const latestDevotional = devotionalsData?.data?.[0];
  const latestNote = notesData?.data?.[0];
  const prayerChains = chainsData?.data || [];
  const guides = guidesData?.data || [];
  const videos = videosData?.data || [];
  const songs = songsData?.data || [];
  const latestSermon = sermonsData?.data?.[0];
  const latestResource = resourcesData?.data?.[0];
  const latestMood = moodsData?.data?.[0];

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
            <div className="text-6xl font-bold mb-1">
              {flourishing?.overallIndex || 0} <span className="text-3xl opacity-80">/100</span>
            </div>
            <div className="text-lg font-semibold mb-4">Flourishing Index (FI)</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">💖 Spiritual</span>
                <span className="font-semibold">{flourishing?.faithScore || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">🤝 Emotional</span>
                <span className="font-semibold">{flourishing?.happinessScore || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">👥 Relational</span>
                <span className="font-semibold">{flourishing?.relationshipsScore || 0}%</span>
              </div>
            </div>
            {flourishing?.aiInsight && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs font-semibold mb-1 opacity-90">💡 AI Insight</div>
                <div className="text-xs opacity-80 leading-relaxed">{flourishing.aiInsight}</div>
              </div>
            )}
            {!flourishing?.aiInsight && (
              <div className="mt-3 text-xs opacity-75 italic">Tap to see personalized AI analysis</div>
            )}
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
          {latestBible ? (
            <>
              <div className="text-xs opacity-90 mb-1">
                {latestBible.book} {latestBible.chapter}:{latestBible.verseStart}
                {latestBible.verseEnd && latestBible.verseEnd !== latestBible.verseStart ? `-${latestBible.verseEnd}` : ''}
              </div>
              <div className="text-sm font-serif italic line-clamp-2">
                {latestBible.content || latestBible.notes || 'Tap to read'}
              </div>
            </>
          ) : (
            <div className="text-xs opacity-90">Tap to get personalized verses</div>
          )}
        </button>

        {/* Daily Devotional */}
        <button
          onClick={() => onAppClick('devotional')}
          data-testid="tile-devotional"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Devotional</span>
          </div>
          {latestDevotional ? (
            <>
              <div className="text-xs opacity-90 mb-1">{latestDevotional.title}:</div>
              <div className="text-sm line-clamp-2">{latestDevotional.content.slice(0, 50)}...</div>
              <div className="text-xs opacity-75 mt-1">{latestDevotional.scriptureReference}</div>
            </>
          ) : (
            <div className="text-xs opacity-90">Tap to get devotional</div>
          )}
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
          <div className="text-4xl font-bold my-2">{activePrayers.length}</div>
          <div className="text-sm">Active Requests</div>
          {prayersData?.data?.some(p => p.isAnswered) && (
            <div className="text-xs opacity-90 mt-1">🙏 Answered prayers</div>
          )}
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
          {latestNote ? (
            <>
              <div className="text-sm">Last Note:</div>
              <div className="text-sm font-medium line-clamp-1">{latestNote.aiTags?.[0] || 'No tags'}</div>
            </>
          ) : (
            <div className="text-xs">Create your first note</div>
          )}
        </button>

        {/* Prayer Chain */}
        <button
          onClick={() => onAppClick('prayer-chain')}
          data-testid="tile-prayer-chain"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-purple-400 to-violet-500 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Prayer Chain</span>
          </div>
          <div className="text-4xl font-bold my-2">{prayerChains.length}</div>
          <div className="text-sm">Prayer Requests</div>
          <div className="text-xs opacity-90 mt-1">Community support</div>
        </button>

        {/* Mood Tracker */}
        <button
          onClick={() => onAppClick('mood')}
          data-testid="tile-mood"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-orange-400 to-amber-500 text-white"
        >
          <div className="text-2xl mb-2">
            {latestMood?.moodType === 'joyful' && '😊'}
            {latestMood?.moodType === 'peaceful' && '😌'}
            {latestMood?.moodType === 'grateful' && '🙏'}
            {latestMood?.moodType === 'anxious' && '😰'}
            {latestMood?.moodType === 'sad' && '😔'}
            {latestMood?.moodType === 'angry' && '😤'}
            {!latestMood && '😊'}
          </div>
          <div className="font-semibold mb-1">Mood Tracker</div>
          {latestMood ? (
            <>
              <div className="text-xs opacity-90 capitalize">{latestMood.moodType}</div>
              <div className="text-xs opacity-75 mt-1">{new Date(latestMood.createdAt).toLocaleDateString()}</div>
            </>
          ) : (
            <div className="text-xs opacity-90">Track your emotions</div>
          )}
        </button>

        {/* Spiritual Guides */}
        <button
          onClick={() => onAppClick('guides')}
          data-testid="tile-guides"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white"
        >
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold mb-1">Spiritual Guides</div>
          <div className="text-xs opacity-90">{guides.length} AI companions</div>
          <div className="text-xs opacity-75 mt-1">Ask about faith</div>
        </button>

        {/* Videos */}
        <button
          onClick={() => onAppClick('videos')}
          data-testid="tile-videos"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-rose-400 to-red-500 text-white"
        >
          <div className="text-2xl mb-2">📺</div>
          <div className="font-semibold mb-1">Videos</div>
          <div className="text-xs opacity-90">{videos.length} recommendations</div>
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
          {songs.length > 0 ? (
            <>
              <div className="text-xs opacity-90 line-clamp-1">{songs[0]?.title}</div>
              <div className="text-xs opacity-75 mt-1">{songs.length} songs</div>
            </>
          ) : (
            <div className="text-xs opacity-90">Get worship music</div>
          )}
        </button>

        {/* Sermons */}
        <button
          onClick={() => onAppClick('sermons')}
          data-testid="tile-sermons"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-cyan-400 to-teal-500 text-white"
        >
          <div className="text-2xl mb-2">🎤</div>
          <div className="font-semibold mb-1">Sermons</div>
          {latestSermon ? (
            <>
              <div className="text-xs opacity-90 line-clamp-1">{latestSermon.title}</div>
              <div className="text-xs opacity-75 mt-1">{latestSermon.preacher}</div>
            </>
          ) : (
            <div className="text-xs opacity-90">Get sermon recommendations</div>
          )}
        </button>

        {/* Library */}
        <button
          onClick={() => onAppClick('library')}
          data-testid="tile-library"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-violet-400 to-purple-500 text-white"
        >
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold mb-1">Library</div>
          {latestResource ? (
            <>
              <div className="text-xs opacity-90 line-clamp-1">{latestResource.title}</div>
              <div className="text-xs opacity-75 mt-1 capitalize">{latestResource.resourceType}</div>
            </>
          ) : (
            <div className="text-xs opacity-90">Get resources</div>
          )}
        </button>

        {/* Faith Circles */}
        <button
          onClick={() => onAppClick('faith-circles')}
          data-testid="tile-faith-circles"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-pink-400 to-rose-500 text-white"
        >
          <div className="text-2xl mb-2">⭕</div>
          <div className="font-semibold mb-1">Faith Circles</div>
          {circlesData?.data && circlesData.data.length > 0 ? (
            <>
              <div className="text-xs opacity-90">{circlesData.data.length} circles available</div>
              <div className="text-xs opacity-75 mt-1">{circlesData.data.filter((c: any) => c.isMember).length} joined</div>
            </>
          ) : (
            <div className="text-xs opacity-90">Join community circles</div>
          )}
        </button>

        {/* Calendar */}
        <button
          onClick={() => onAppClick('calendar')}
          data-testid="tile-calendar"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-sky-400 to-blue-500 text-white"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold mb-1">Calendar</div>
          <div className="text-xs opacity-90">Plan your schedule</div>
          <div className="text-xs opacity-75 mt-1">Track events</div>
        </button>

        {/* Settings */}
        <button
          onClick={() => onAppClick('settings')}
          data-testid="tile-settings"
          className="tile-small cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 bg-gradient-to-br from-slate-400 to-gray-500 text-white"
        >
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-semibold mb-1">Settings</div>
          <div className="text-xs opacity-90">Customize workspace</div>
          <div className="text-xs opacity-75 mt-1">Preferences & more</div>
        </button>

      </div>
    </div>
  );
}
