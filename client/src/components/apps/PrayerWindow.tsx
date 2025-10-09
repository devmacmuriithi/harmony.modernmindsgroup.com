import { Plus } from 'lucide-react';

export default function PrayerWindow() {
  //todo: remove mock functionality
  const prayers = [
    { id: 1, content: 'Guide me in my career decisions', answered: false },
    { id: 2, content: 'Healing for my grandmother', answered: false },
    { id: 3, content: 'Strength during difficult times', answered: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Prayer Journal</h2>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover-elevate active-elevate-2 text-sm"
          data-testid="button-add-prayer"
        >
          <Plus className="w-4 h-4" />
          New Prayer
        </button>
      </div>
      <div className="space-y-3">
        {prayers.map(prayer => (
          <div 
            key={prayer.id} 
            className="p-3 rounded-lg border border-border bg-card hover-elevate"
            data-testid={`prayer-item-${prayer.id}`}
          >
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                checked={prayer.answered} 
                onChange={() => {}}
                className="mt-1"
                data-testid={`checkbox-prayer-${prayer.id}`}
              />
              <div className="flex-1">
                <p className={`text-foreground ${prayer.answered ? 'line-through opacity-60' : ''}`}>
                  {prayer.content}
                </p>
                {prayer.answered && (
                  <span className="text-xs text-green-600 dark:text-green-400 mt-1 block">✓ Answered</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
