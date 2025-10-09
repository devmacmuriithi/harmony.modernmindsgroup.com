export default function FlourishingWindow() {
  //todo: remove mock functionality
  const scores = [
    { domain: 'Health', score: 72, color: 'from-green-500 to-emerald-600' },
    { domain: 'Relationships', score: 85, color: 'from-blue-500 to-cyan-600' },
    { domain: 'Finances', score: 65, color: 'from-yellow-500 to-orange-600' },
    { domain: 'Meaning', score: 78, color: 'from-purple-500 to-violet-600' },
    { domain: 'Happiness', score: 80, color: 'from-pink-500 to-rose-600' },
    { domain: 'Character', score: 75, color: 'from-indigo-500 to-blue-600' },
    { domain: 'Faith', score: 88, color: 'from-amber-500 to-yellow-600' },
  ];

  const overallIndex = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Flourishing Index</h2>
        <div className="text-5xl font-bold text-sidebar-primary mb-1">{overallIndex}</div>
        <p className="text-sm text-muted-foreground">Overall Wellbeing Score</p>
      </div>
      <div className="space-y-3">
        {scores.map(score => (
          <div key={score.domain} data-testid={`flourishing-${score.domain.toLowerCase()}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-foreground">{score.domain}</span>
              <span className="text-sm text-muted-foreground">{score.score}/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${score.color}`}
                style={{ width: `${score.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
