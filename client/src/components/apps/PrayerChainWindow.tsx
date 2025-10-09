import { Heart, MessageCircle } from 'lucide-react';

export default function PrayerChainWindow() {
  //todo: remove mock functionality
  const prayerChains = [
    { id: 1, title: 'Healing for Sarah', author: 'John D.', followers: 24, comments: 12, answered: false },
    { id: 2, title: 'Job Interview Tomorrow', author: 'Mary K.', followers: 18, comments: 8, answered: false },
    { id: 3, title: 'Family Reconciliation', author: 'Peter M.', followers: 45, comments: 23, answered: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Prayer Chain</h2>
        <button 
          className="px-3 py-1.5 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover-elevate active-elevate-2 text-sm"
          data-testid="button-new-prayer-chain"
        >
          Share Request
        </button>
      </div>
      <div className="space-y-3">
        {prayerChains.map(chain => (
          <div 
            key={chain.id}
            className="p-4 rounded-lg border border-border bg-card hover-elevate"
            data-testid={`prayer-chain-${chain.id}`}
          >
            <h3 className="font-medium text-foreground mb-1">{chain.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">by {chain.author}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{chain.followers} praying</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{chain.comments} comments</span>
              </div>
              {chain.answered && (
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Answered</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
