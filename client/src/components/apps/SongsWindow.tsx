import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Play, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Song {
  id: string;
  userId: string;
  title: string;
  artist: string;
  youtubeId: string;
  createdAt: string;
}

export default function SongsWindow() {
  const { toast } = useToast();

  const { data: songsData, isLoading } = useQuery<{ data: Song[] }>({
    queryKey: ['/api/songs']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/songs/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      toast({ title: 'Songs updated!', description: 'New worship songs recommended.' });
    }
  });

  const listenMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/songs/${id}/listen`);
      return res.json();
    }
  });

  const handlePlay = (song: Song) => {
    listenMutation.mutate(song.id);
    window.open(`https://www.youtube.com/watch?v=${song.youtubeId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const songs = songsData?.data || [];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Worship Songs</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-songs"
        >
          {generateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {songs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No songs yet</p>
            <Button onClick={() => generateMutation.mutate()} data-testid="button-get-songs">
              Get Worship Songs
            </Button>
          </div>
        ) : (
          songs.map(song => (
            <div
              key={song.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover-elevate"
              data-testid={`song-item-${song.id}`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{song.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              </div>
              <Button
                size="icon"
                onClick={() => handlePlay(song)}
                data-testid={`button-play-${song.id}`}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
