import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlourishingScore {
  id: string;
  userId: string;
  overallScore: number;
  healthScore: number;
  relationshipScore: number;
  financeScore: number;
  meaningScore: number;
  happinessScore: number;
  characterScore: number;
  faithScore: number;
  insights: string;
  createdAt: string;
}

const domainColors = [
  { domain: 'Health', key: 'healthScore', color: 'from-green-500 to-emerald-600' },
  { domain: 'Relationships', key: 'relationshipScore', color: 'from-blue-500 to-cyan-600' },
  { domain: 'Finances', key: 'financeScore', color: 'from-yellow-500 to-orange-600' },
  { domain: 'Meaning', key: 'meaningScore', color: 'from-purple-500 to-violet-600' },
  { domain: 'Happiness', key: 'happinessScore', color: 'from-pink-500 to-rose-600' },
  { domain: 'Character', key: 'characterScore', color: 'from-indigo-500 to-blue-600' },
  { domain: 'Faith', key: 'faithScore', color: 'from-amber-500 to-yellow-600' },
];

export default function FlourishingWindow() {
  const { toast } = useToast();

  const { data: scoreData, isLoading } = useQuery<{ data: FlourishingScore | null }>({
    queryKey: ['/api/flourishing']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/flourishing/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      toast({ title: 'Flourishing scores updated!', description: 'Your personalized insights are ready.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate scores. Please try again.', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const score = scoreData?.data;

  if (!score) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Flourishing Index</h2>
          <p className="text-sm text-muted-foreground mb-4">Discover your personalized wellbeing score</p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-flourishing"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Calculate Scores
            </>
          )}
        </Button>
      </div>
    );
  }

  const scores = domainColors.map(({ domain, key, color }) => ({
    domain,
    score: score[key as keyof FlourishingScore] as number,
    color
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-2">Flourishing Index</h2>
          <div className="text-5xl font-bold text-sidebar-primary mb-1" data-testid="text-overall-score">{score.overallScore}</div>
          <p className="text-sm text-muted-foreground">Overall Wellbeing Score</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-refresh-flourishing"
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {scores.map(scoreItem => (
          <div key={scoreItem.domain} data-testid={`flourishing-${scoreItem.domain.toLowerCase()}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">{scoreItem.domain}</span>
              <span className="text-sm text-muted-foreground">{scoreItem.score}/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${scoreItem.color}`}
                style={{ width: `${scoreItem.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {score.insights && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">AI Insights</h3>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-insights">{score.insights}</p>
        </div>
      )}
    </div>
  );
}
