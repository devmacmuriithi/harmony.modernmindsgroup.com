import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Mood {
  id: string;
  moodType: string;
  notes: string | null;
  createdAt: string;
}

const moodOptions = [
  { emoji: '😊', label: 'Joyful', color: 'from-yellow-400 to-orange-400', type: 'joyful' },
  { emoji: '😌', label: 'Peaceful', color: 'from-blue-400 to-cyan-400', type: 'peaceful' },
  { emoji: '🙏', label: 'Grateful', color: 'from-green-400 to-emerald-400', type: 'grateful' },
  { emoji: '😢', label: 'Sad', color: 'from-gray-400 to-slate-400', type: 'sad' },
  { emoji: '😰', label: 'Anxious', color: 'from-purple-400 to-violet-400', type: 'anxious' },
  { emoji: '😤', label: 'Angry', color: 'from-red-400 to-pink-400', type: 'angry' },
];

export default function MoodWindow() {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');

  const { data: moodsData, isLoading } = useQuery<{ data: Mood[] }>({
    queryKey: ['/api/moods']
  });

  const moodMutation = useMutation({
    mutationFn: async ({ moodType, notes }: { moodType: string; notes: string }) => {
      const res = await apiRequest('POST', '/api/moods', { moodType, notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moods'] });
      setNotes('');
      toast({ title: 'Mood tracked!', description: 'Your mood has been saved.' });
    }
  });

  const handleMoodClick = (type: string) => {
    moodMutation.mutate({ moodType: type, notes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const recentMoods = moodsData?.data?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">How are you feeling today?</h2>
      <div className="grid grid-cols-3 gap-3">
        {moodOptions.map(mood => (
          <button
            key={mood.label}
            onClick={() => handleMoodClick(mood.type)}
            disabled={moodMutation.isPending}
            data-testid={`button-mood-${mood.label.toLowerCase()}`}
            className={`p-4 rounded-xl bg-gradient-to-br ${mood.color} text-white hover:-translate-y-1 transition-all duration-200 active-elevate-2 disabled:opacity-50`}
          >
            {moodMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : (
              <>
                <div className="text-3xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-medium">{mood.label}</div>
              </>
            )}
          </button>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Notes about your mood</label>
        <textarea 
          className="w-full h-20 p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
          placeholder="What's on your heart today..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="textarea-mood-notes"
        />
      </div>

      {recentMoods.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">Recent Moods</h3>
          <div className="space-y-2">
            {recentMoods.map(mood => (
              <div key={mood.id} className="text-sm">
                <span className="font-medium capitalize">{mood.moodType}</span>
                {' • '}
                <span className="text-muted-foreground">
                  {new Date(mood.createdAt).toLocaleDateString()}
                </span>
                {mood.notes && <p className="text-muted-foreground text-xs mt-1">{mood.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
