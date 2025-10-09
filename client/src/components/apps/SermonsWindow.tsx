import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Sermon {
  id: string;
  userId: string;
  title: string;
  preacher: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

export default function SermonsWindow() {
  const { toast } = useToast();

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

      <div className="flex-1 overflow-auto space-y-3">
        {sermons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No sermons yet</p>
            <Button onClick={() => generateMutation.mutate()} data-testid="button-get-sermons">
              Get Sermon Recommendations
            </Button>
          </div>
        ) : (
          sermons.map(sermon => (
            <div
              key={sermon.id}
              className="p-4 rounded-lg border border-border bg-card hover-elevate"
              data-testid={`sermon-item-${sermon.id}`}
            >
              <h3 className="font-semibold text-foreground mb-1">{sermon.title}</h3>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <span>{sermon.preacher}</span>
                <span>{new Date(sermon.date).toLocaleDateString()}</span>
              </div>
              {sermon.notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">"{sermon.notes}"</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
