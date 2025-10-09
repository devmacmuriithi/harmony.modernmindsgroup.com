import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface BibleVerse {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  translation: string;
  notes: string | null;
  createdAt: string;
}

export default function BibleWindow() {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');

  const { data: versesData, isLoading } = useQuery<{ data: BibleVerse[] }>({
    queryKey: ['/api/bible-verses']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/bible-verses/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-verses'] });
      toast({ title: 'New verse generated!', description: 'Personalized for your spiritual journey.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate verse. Please try again.', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const latestVerse = versesData?.data?.[0];

  if (!latestVerse) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Daily Verse</h2>
          <p className="text-sm text-muted-foreground mb-4">Get a personalized Bible verse for today</p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-verse"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Get Today's Verse
            </>
          )}
        </Button>
      </div>
    );
  }

  const verseReference = `${latestVerse.book} ${latestVerse.chapter}:${latestVerse.verseStart}${
    latestVerse.verseEnd ? `-${latestVerse.verseEnd}` : ''
  }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-serif font-semibold text-foreground" data-testid="text-verse-reference">{verseReference}</h2>
          <span className="text-sm text-muted-foreground">{latestVerse.translation}</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-refresh-verse"
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-4" data-testid="text-verse-content">
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            ✨ AI-Personalized Verse Recommendation
          </p>
          <p className="text-lg font-serif font-semibold text-foreground">
            {verseReference}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This verse was personalized based on your spiritual journey, moods, and prayer patterns.
          </p>
        </div>
        {latestVerse.notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm"><strong>Previous reflection:</strong> {latestVerse.notes}</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <label className="text-sm font-medium text-foreground block mb-2">My Notes</label>
        <textarea 
          className="w-full h-24 p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
          placeholder="Add your reflection..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="textarea-bible-notes"
        />
      </div>
    </div>
  );
}
