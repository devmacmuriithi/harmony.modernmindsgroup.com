import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlourishingScore {
  id: string;
  userId: string;
  overallIndex: number;
  healthScore: number;
  relationshipsScore: number;
  financesScore: number;
  meaningScore: number;
  happinessScore: number;
  characterScore: number;
  faithScore: number;
  aiInsight: string;
  createdAt: string;
}

const domainColors = [
  { domain: 'Health', key: 'healthScore' },
  { domain: 'Relationships', key: 'relationshipsScore' },
  { domain: 'Finances', key: 'financesScore' },
  { domain: 'Meaning', key: 'meaningScore' },
  { domain: 'Happiness', key: 'happinessScore' },
  { domain: 'Character', key: 'characterScore' },
  { domain: 'Faith', key: 'faithScore' },
];

// Get color based on score range
const getScoreColor = (score: number): { gradient: string; text: string; label: string } => {
  if (score >= 80) {
    return { 
      gradient: 'from-emerald-500 to-green-600', 
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'Thriving 🌟' 
    };
  } else if (score >= 60) {
    return { 
      gradient: 'from-blue-500 to-cyan-600', 
      text: 'text-blue-600 dark:text-blue-400',
      label: 'Stable ✅' 
    };
  } else if (score >= 40) {
    return { 
      gradient: 'from-amber-500 to-orange-600', 
      text: 'text-amber-600 dark:text-amber-400',
      label: 'Struggling ⚠️' 
    };
  } else {
    return { 
      gradient: 'from-red-500 to-rose-600', 
      text: 'text-red-600 dark:text-red-400',
      label: 'Crisis 🆘' 
    };
  }
};

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

  const overallColor = getScoreColor(score.overallIndex || 0);
  
  const scores = domainColors.map(({ domain, key }) => {
    const scoreValue = score[key as keyof FlourishingScore] as number;
    return {
      domain,
      score: scoreValue,
      ...getScoreColor(scoreValue)
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-2">Flourishing Index</h2>
          <div className={`text-5xl font-bold ${overallColor.text} mb-1`} data-testid="text-overall-score">{score.overallIndex}</div>
          <p className={`text-sm font-medium ${overallColor.text}`}>{overallColor.label}</p>
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
                className={`h-full bg-gradient-to-r ${scoreItem.gradient}`}
                style={{ width: `${scoreItem.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {score.aiInsight && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">💡 AI Insight</h3>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-ai-insight">{score.aiInsight}</p>
        </div>
      )}
    </div>
  );
}
