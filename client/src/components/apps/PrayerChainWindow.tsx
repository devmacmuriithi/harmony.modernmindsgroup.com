import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PrayerChain {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: string;
  prayerChainId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default function PrayerChainWindow() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const { data: chainsData, isLoading, error } = useQuery<{ data: PrayerChain[] }>({
    queryKey: ['/api/prayer-chains']
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-destructive mb-2">Failed to load prayer chains</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

  const { data: commentsData } = useQuery<{ data: Comment[] }>({
    queryKey: selectedChainId ? [`/api/prayer-chains/${selectedChainId}/comments`] : ['disabled'],
    enabled: !!selectedChainId
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const res = await apiRequest('POST', '/api/prayer-chains', { title, content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayer-chains'] });
      setIsDialogOpen(false);
      setTitle('');
      setContent('');
      toast({ title: 'Prayer request shared!', description: 'Others can now pray for you.' });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ chainId, content }: { chainId: string; content: string }) => {
      const res = await apiRequest('POST', `/api/prayer-chains/${chainId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      if (selectedChainId) {
        queryClient.invalidateQueries({ queryKey: [`/api/prayer-chains/${selectedChainId}/comments`] });
      }
      setCommentText('');
    }
  });

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      createMutation.mutate({ title, content });
    }
  };

  const handleAddComment = (chainId: string) => {
    if (commentText.trim()) {
      commentMutation.mutate({ chainId, content: commentText });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const chains = chainsData?.data || [];
  const comments = commentsData?.data || [];

  if (selectedChainId) {
    const chain = chains.find(c => c.id === selectedChainId);
    if (!chain) return null;

    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedChainId(null)} data-testid="button-back">
            ← Back
          </Button>
          <h2 className="text-lg font-semibold text-foreground flex-1">{chain.title}</h2>
        </div>
        
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-foreground">{chain.content}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(chain.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex-1 overflow-auto space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Prayers & Support</h3>
          {comments.map(comment => (
            <div key={comment.id} className="p-3 rounded-lg bg-card border border-border" data-testid={`comment-${comment.id}`}>
              <p className="text-sm text-foreground">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your prayer or support..."
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground"
            data-testid="input-comment"
          />
          <Button
            onClick={() => handleAddComment(chain.id)}
            disabled={!commentText.trim() || commentMutation.isPending}
            data-testid="button-add-comment"
          >
            {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Prayer Chain</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-new-prayer-chain">
              <Plus className="mr-2 h-4 w-4" />
              Share Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Prayer Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for your request"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                  data-testid="input-chain-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Request</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what you'd like prayer for..."
                  className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-foreground resize-none"
                  data-testid="textarea-chain-content"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
                className="w-full"
                data-testid="button-create-chain"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  'Share Prayer Request'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {chains.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No prayer requests yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>Share a Prayer Request</Button>
          </div>
        ) : (
          chains.map(chain => (
            <div
              key={chain.id}
              onClick={() => setSelectedChainId(chain.id)}
              className="p-4 rounded-lg border border-border bg-card hover-elevate cursor-pointer"
              data-testid={`prayer-chain-${chain.id}`}
            >
              <h3 className="font-medium text-foreground mb-1">{chain.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{chain.content}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>View prayers</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
