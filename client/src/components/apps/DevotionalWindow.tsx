import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Devotional {
  id: string;
  title: string;
  content: string;
  scriptureReference: string | null;
  createdAt: string;
}

export default function DevotionalWindow() {
  const { toast } = useToast();

  const { data: devotionalsData, isLoading } = useQuery<{ data: Devotional[] }>({
    queryKey: ['/api/devotionals']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/devotionals/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devotionals'] });
      toast({ title: 'New devotional!', description: 'Personalized for your spiritual journey.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate devotional.', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const latest = devotionalsData?.data?.[0];

  if (!latest) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Daily Devotional</h2>
          <p className="text-sm text-muted-foreground mb-4">Get your personalized devotional</p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-devotional"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Devotional
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2" data-testid="text-devotional-title">{latest.title}</h2>
          <p className="text-sm text-muted-foreground">Daily Devotional</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-refresh-devotional"
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-4 font-serif text-foreground leading-relaxed" data-testid="text-devotional-content">
        {latest.content.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {latest.scriptureReference && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Scripture Reference</p>
          <p className="text-sm text-amber-800 dark:text-amber-200 font-serif" data-testid="text-scripture-reference">{latest.scriptureReference}</p>
        </div>
      )}
    </div>
  );
}
