import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';

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

// Get color based on score range
const getScoreColor = (score: number): { gradient: string; text: string; label: string; ring: string } => {
  if (score >= 80) {
    return { 
      gradient: 'from-emerald-500 to-green-600', 
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-500/20',
      label: 'Thriving 🌟' 
    };
  } else if (score >= 60) {
    return { 
      gradient: 'from-blue-500 to-cyan-600', 
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500/20',
      label: 'Stable ✅' 
    };
  } else if (score >= 40) {
    return { 
      gradient: 'from-amber-500 to-orange-600', 
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-500/20',
      label: 'Struggling ⚠️' 
    };
  } else {
    return { 
      gradient: 'from-red-500 to-rose-600', 
      text: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500/20',
      label: 'Crisis 🆘' 
    };
  }
};

export default function FlourishingWidget() {
  const { data: scoreData } = useQuery<{ data: FlourishingScore | null }>({
    queryKey: ['/api/flourishing']
  });

  const score = scoreData?.data;

  if (!score) {
    return null;
  }

  const overallColor = getScoreColor(score.overallIndex || 0);

  const miniScores = [
    { key: 'healthScore', label: 'Health' },
    { key: 'faithScore', label: 'Faith' },
    { key: 'happinessScore', label: 'Happy' },
  ];

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full bg-gradient-to-br ${overallColor.gradient} ring-4 ${overallColor.ring}`}>
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-muted-foreground">Flourishing Index</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${overallColor.text}`} data-testid="widget-overall-score">
              {score.overallIndex}
            </span>
            <span className={`text-xs font-medium ${overallColor.text}`}>
              {overallColor.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {miniScores.map(({ key, label }) => {
          const scoreValue = score[key as keyof FlourishingScore] as number;
          const scoreColor = getScoreColor(scoreValue);
          return (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${scoreColor.gradient}`}
                    style={{ width: `${scoreValue}%` }}
                  />
                </div>
                <span className="text-foreground font-medium w-6 text-right">{scoreValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {score.aiInsight && (
        <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-muted-foreground line-clamp-2" data-testid="widget-ai-insight">
            💡 {score.aiInsight}
          </p>
        </div>
      )}
    </div>
  );
}
