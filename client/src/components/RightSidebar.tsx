import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { BookOpen, Heart, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  translation: string;
  content: string;
}

interface Devotional {
  id: string;
  title: string;
  content: string;
  scriptureReference: string | null;
}

interface FlourishingScore {
  overallIndex: number;
  spiritualScore: number;
  emotionalScore: number;
  relationalScore: number;
}

interface PrayerJournal {
  id: string;
  content: string;
  isAnswered: boolean;
}

export default function RightSidebar() {
  const { data: versesData } = useQuery<{ data: BibleVerse[] }>({
    queryKey: ['/api/bible-verses']
  });

  const { data: devotionalsData } = useQuery<{ data: Devotional[] }>({
    queryKey: ['/api/devotionals']
  });

  const { data: flourishingData } = useQuery<{ data: FlourishingScore }>({
    queryKey: ['/api/flourishing']
  });

  const { data: prayersData } = useQuery<{ data: PrayerJournal[] }>({
    queryKey: ['/api/prayers']
  });

  const latestVerse = versesData?.data?.[0];
  const latestDevotional = devotionalsData?.data?.[0];
  const flourishing = flourishingData?.data;
  const activePrayers = prayersData?.data?.filter(p => !p.isAnswered).length || 0;

  return (
    <div className="h-full w-80 p-4 space-y-4 overflow-y-auto">
      {/* Daily Verse Widget */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-100">Verse of the Day</h3>
        </div>
        {latestVerse ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              {latestVerse.book} {latestVerse.chapter}:{latestVerse.verseStart}
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-200 font-serif leading-relaxed line-clamp-4">
              "{latestVerse.content}"
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 italic">
              — {latestVerse.translation}
            </p>
          </div>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">No verse saved yet</p>
        )}
      </Card>

      {/* Quick Stats Widget */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Your Journey</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-sm text-muted-foreground">Flourishing Index</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {flourishing?.overallIndex || 0}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pink-500"></div>
              <span className="text-sm text-muted-foreground">Active Prayers</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{activePrayers}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Saved Verses</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {versesData?.data?.length || 0}
            </span>
          </div>
        </div>
      </Card>

      {/* Today's Devotional Preview */}
      {latestDevotional && (
        <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-sm text-violet-900 dark:text-violet-100">Today's Devotional</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-200 line-clamp-2">
              {latestDevotional.title}
            </p>
            <p className="text-xs text-violet-700 dark:text-violet-300 line-clamp-3">
              {latestDevotional.content}
            </p>
            {latestDevotional.scriptureReference && (
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400 italic">
                📖 {latestDevotional.scriptureReference}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Calendar Widget */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-sm">Today</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <p className="text-xs text-muted-foreground">
            No events scheduled
          </p>
        </div>
      </Card>

      {/* Spiritual Growth Tip */}
      <Card className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-sm text-teal-900 dark:text-teal-100">Daily Reminder</h3>
        </div>
        <p className="text-sm text-teal-700 dark:text-teal-300 italic">
          "Set aside 10 minutes today for quiet reflection and prayer."
        </p>
      </Card>
    </div>
  );
}
