import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Loader2, Search, ArrowLeft, Send, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface FaithCircle {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  memberCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
  isMember: boolean;
}

interface CirclePost {
  id: string;
  circleId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName: string | null;
  userEmail: string;
}

const categories = [
  { value: 'all', label: 'All Circles' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'youth', label: 'Youth' },
  { value: 'marriage', label: 'Marriage' },
  { value: 'general', label: 'General' },
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    bible_study: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    prayer: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    fellowship: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    youth: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    marriage: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400',
  };
  return colors[category] || colors.general;
};

export default function FaithCirclesWindow() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<FaithCircle | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCircleTitle, setNewCircleTitle] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState('general');

  const { data: circlesData, isLoading } = useQuery<{ data: FaithCircle[] }>({
    queryKey: ['/api/faith-circles', { category: selectedCategory, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      const url = `/api/faith-circles${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      return res.json();
    }
  });

  const { data: postsData, isLoading: postsLoading } = useQuery<{ data: CirclePost[] }>({
    queryKey: selectedCircle ? [`/api/faith-circles/${selectedCircle.id}/posts`] : ['disabled'],
    enabled: !!selectedCircle
  });

  const createCircleMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; category: string }) => {
      const res = await apiRequest('POST', '/api/faith-circles', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faith-circles'] });
      setShowCreateForm(false);
      setNewCircleTitle('');
      setNewCircleDescription('');
      setNewCircleCategory('general');
      toast({ title: 'Circle created!', description: 'Your new Faith Circle is ready.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create circle.', variant: 'destructive' });
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (circleId: string) => {
      const res = await apiRequest('POST', `/api/faith-circles/${circleId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faith-circles'] });
      toast({ title: 'Joined!', description: 'You are now a member of this circle.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to join circle.', variant: 'destructive' });
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async (circleId: string) => {
      const res = await apiRequest('POST', `/api/faith-circles/${circleId}/leave`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faith-circles'] });
      if (selectedCircle) {
        setSelectedCircle({ ...selectedCircle, isMember: false });
      }
      toast({ title: 'Left circle', description: 'You are no longer a member.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to leave circle.', variant: 'destructive' });
    }
  });

  const postMutation = useMutation({
    mutationFn: async ({ circleId, content }: { circleId: string; content: string }) => {
      const res = await apiRequest('POST', `/api/faith-circles/${circleId}/posts`, { content });
      return res.json();
    },
    onSuccess: () => {
      if (selectedCircle) {
        queryClient.invalidateQueries({ queryKey: [`/api/faith-circles/${selectedCircle.id}/posts`] });
      }
      setNewPostContent('');
      toast({ title: 'Posted!', description: 'Your message has been shared.' });
    },
    onError: (error: any) => {
      const message = error?.message?.includes('NOT_MEMBER') 
        ? 'You must be a member to post.' 
        : 'Failed to post message.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Create Circle Form
  if (showCreateForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(false)}
            data-testid="button-back-to-circles"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Create New Circle</h2>
        </div>

        <Input
          placeholder="Circle Title"
          value={newCircleTitle}
          onChange={(e) => setNewCircleTitle(e.target.value)}
          data-testid="input-circle-title"
        />

        <Textarea
          placeholder="Circle Description"
          value={newCircleDescription}
          onChange={(e) => setNewCircleDescription(e.target.value)}
          rows={4}
          data-testid="input-circle-description"
        />

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((cat) => (
              <Button
                key={cat.value}
                variant={newCircleCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewCircleCategory(cat.value)}
                data-testid={`button-category-${cat.value}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => createCircleMutation.mutate({
            title: newCircleTitle,
            description: newCircleDescription,
            category: newCircleCategory
          })}
          disabled={!newCircleTitle.trim() || !newCircleDescription.trim() || createCircleMutation.isPending}
          data-testid="button-create-circle"
        >
          {createCircleMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Circle
            </>
          )}
        </Button>
      </div>
    );
  }

  // Circle Detail View
  if (selectedCircle) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCircle(null)}
            data-testid="button-back-to-list"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-1" data-testid="text-circle-title">{selectedCircle.title}</h2>
              <p className="text-sm text-muted-foreground mb-3" data-testid="text-circle-description">{selectedCircle.description}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedCircle.category)}`}>
                  {categories.find(c => c.value === selectedCircle.category)?.label}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedCircle.memberCount} members
                </span>
              </div>
            </div>
            {selectedCircle.isMember ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => leaveMutation.mutate(selectedCircle.id)}
                disabled={leaveMutation.isPending}
                data-testid="button-leave-circle"
              >
                {leaveMutation.isPending ? 'Leaving...' : 'Leave Circle'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => joinMutation.mutate(selectedCircle.id)}
                disabled={joinMutation.isPending}
                data-testid="button-join-circle"
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Circle'}
              </Button>
            )}
          </div>
        </div>

        {selectedCircle.isMember && (
          <div className="p-4 bg-card border border-border rounded-lg">
            <Textarea
              placeholder="Share your thoughts with the circle..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              data-testid="input-new-post"
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={() => postMutation.mutate({ circleId: selectedCircle.id, content: newPostContent })}
                disabled={!newPostContent.trim() || postMutation.isPending}
                size="sm"
                data-testid="button-post-message"
              >
                {postMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Discussion</h3>
          {postsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : postsData?.data && postsData.data.length > 0 ? (
            <div className="space-y-3">
              {postsData.data.map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-card border border-border rounded-lg"
                  data-testid={`post-${post.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {(post.userName || post.userEmail)?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground" data-testid={`text-post-author-${post.id}`}>
                          {post.userName || post.userEmail.split('@')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground" data-testid={`text-post-time-${post.id}`}>
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words" data-testid={`text-post-content-${post.id}`}>
                        {post.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No posts yet. {selectedCircle.isMember ? 'Be the first to share!' : 'Join to participate.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Main Grid View
  const circles = circlesData?.data || [];
  const filteredCircles = circles;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search circles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-circles"
          />
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          size="sm"
          data-testid="button-create-new-circle"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            data-testid={`button-filter-${cat.value}`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCircles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No circles found</p>
          </div>
        ) : (
          filteredCircles.map((circle) => (
            <div
              key={circle.id}
              className="p-3 bg-card border border-border rounded-lg hover-elevate cursor-pointer"
              onClick={() => setSelectedCircle(circle)}
              data-testid={`circle-card-${circle.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1" data-testid={`text-circle-title-${circle.id}`}>
                    {circle.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2" data-testid={`text-circle-desc-${circle.id}`}>
                    {circle.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(circle.category)}`}>
                      {categories.find(c => c.value === circle.category)?.label}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {circle.memberCount}
                    </span>
                  </div>
                </div>
                {circle.isMember && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-xs rounded-full flex-shrink-0">
                    Joined
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
