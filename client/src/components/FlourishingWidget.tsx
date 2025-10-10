import { useQuery } from '@tanstack/react-query';
import { TrendingUp, GripVertical, Heart, Cross, Smile } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const score = scoreData?.data;

  if (!score) {
    return null;
  }

  const overallColor = getScoreColor(score.overallIndex || 0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking on the drag handle area (top section)
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]')) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  // Effect to handle global mouse events during dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position.x, position.y]);

  return (
    <div 
      ref={widgetRef}
      className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '200px',
        userSelect: isDragging ? 'none' : 'auto',
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onMouseDown={handleMouseDown}
      data-testid="draggable-widget"
    >
      {/* Drag Handle Header */}
      <div 
        className="flex items-center gap-2 px-3 py-2 border-b border-amber-200 dark:border-amber-800 cursor-grab active:cursor-grabbing"
        data-drag-handle="true"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
        <div className={`p-1.5 rounded-full bg-gradient-to-br ${overallColor.gradient} ring-2 ${overallColor.ring}`}>
          <TrendingUp className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${overallColor.text}`} data-testid="widget-overall-score">
              {score.overallIndex}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">FI</span>
          </div>
        </div>
      </div>

      {/* Compact Scores */}
      <div className="p-2 space-y-1.5">
        {[
          { key: 'healthScore', icon: Heart, color: 'text-red-500' },
          { key: 'faithScore', icon: Cross, color: 'text-amber-600' },
          { key: 'happinessScore', icon: Smile, color: 'text-yellow-500' },
        ].map(({ key, icon: Icon, color }) => {
          const scoreValue = score[key as keyof FlourishingScore] as number;
          const scoreColor = getScoreColor(scoreValue);
          return (
            <div key={key} className="flex items-center gap-2">
              <Icon className={`h-3 w-3 ${color}`} />
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${scoreColor.gradient}`}
                  style={{ width: `${scoreValue}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-foreground w-5 text-right">{scoreValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
