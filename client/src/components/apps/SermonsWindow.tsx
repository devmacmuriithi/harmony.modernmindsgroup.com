import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Sermon {
  id: string;
  userId: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  churchName: string | null;
  duration: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export default function SermonsWindow() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sermonsData, isLoading, error } = useQuery<{ data: Sermon[] }>({
    queryKey: ['/api/sermons']
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-destructive mb-2">Failed to load sermons</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/sermons/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sermons'] });
      toast({ title: 'Sermons updated!', description: 'New personalized sermon recommendations.' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const sermons = sermonsData?.data || [];

  // Filter sermons by search query (title or church name)
  const filteredSermons = sermons.filter(sermon => 
    !searchQuery || 
    sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sermon.churchName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Sermons</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-sermons"
        >
          {generateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sermons or churches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-sermons"
        />
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {sermons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No sermons yet</p>
            <Button onClick={() => generateMutation.mutate()} data-testid="button-get-sermons">
              Get Sermon Recommendations
            </Button>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No sermons match your search</p>
          </div>
        ) : (
          filteredSermons.map(sermon => (
            <a
              key={sermon.id}
              href={sermon.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-border bg-card hover-elevate"
              data-testid={`sermon-item-${sermon.id}`}
            >
              <h3 className="font-semibold text-foreground mb-1">{sermon.title}</h3>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <span>{sermon.churchName || 'AI-Generated Recommendation'}</span>
                {sermon.duration && <span>⏱️ {sermon.duration}</span>}
              </div>
              <div className="text-xs text-muted-foreground">
                🎬 Click to watch on YouTube
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
