import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, ExternalLink, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Video {
  id: string;
  userId: string;
  title: string;
  youtubeId: string;
  description: string | null;
  createdAt: string;
}

export default function VideosWindow() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: videosData, isLoading, error } = useQuery<{ data: Video[] }>({
    queryKey: ['/api/videos']
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-destructive mb-2">Failed to load videos</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/videos/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({ title: 'Videos updated!', description: 'New personalized videos recommended.' });
    }
  });

  const watchMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/videos/${id}/watch`);
      return res.json();
    }
  });

  const handleWatch = (video: Video) => {
    watchMutation.mutate(video.id);
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const videos = videosData?.data || [];

  // Filter videos by search query (title or description)
  const filteredVideos = videos.filter(video => 
    !searchQuery || 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Faith Videos</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-videos"
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
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-videos"
        />
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No videos yet</p>
            <Button onClick={() => generateMutation.mutate()} data-testid="button-get-videos">
              Get Personalized Videos
            </Button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No videos match your search</p>
          </div>
        ) : (
          filteredVideos.map(video => (
            <div
              key={video.id}
              className="p-4 rounded-lg border border-border bg-card hover-elevate"
              data-testid={`video-item-${video.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleWatch(video)}
                  data-testid={`button-watch-${video.id}`}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Watch
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
