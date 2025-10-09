import { Send } from 'lucide-react';

export default function GuidesWindow() {
  //todo: remove mock functionality
  const guides = [
    { id: 1, name: 'Biblical Scholar', emoji: '📖', description: 'Deep theological knowledge' },
    { id: 2, name: 'Relationship Guide', emoji: '💑', description: 'Wisdom for relationships' },
    { id: 3, name: 'Prayer Counselor', emoji: '🙏', description: 'Guidance on prayer life' },
    { id: 4, name: 'Career & Purpose Coach', emoji: '💼', description: 'Finding God\'s calling' },
    { id: 5, name: 'Mental Wellness Guide', emoji: '🧠', description: 'Faith-based support' },
    { id: 6, name: 'Worship & Creativity', emoji: '🎨', description: 'Creative expression' },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-foreground">Spiritual Guides</h2>
      <div className="grid grid-cols-2 gap-3">
        {guides.map(guide => (
          <button
            key={guide.id}
            data-testid={`button-guide-${guide.id}`}
            className="p-3 rounded-lg border border-border bg-card hover-elevate active-elevate-2 text-left"
          >
            <div className="text-2xl mb-1">{guide.emoji}</div>
            <div className="text-sm font-medium text-foreground">{guide.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{guide.description}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto space-y-2 mb-3">
          <div className="p-3 rounded-lg bg-card border border-border max-w-[80%]">
            <p className="text-sm text-foreground">How can I deepen my prayer life?</p>
          </div>
          <div className="p-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground max-w-[80%] ml-auto">
            <p className="text-sm">Prayer is a conversation with God. Start by setting aside dedicated time each day...</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask your spiritual guide..."
            data-testid="input-guide-message"
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
          />
          <button 
            className="p-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover-elevate active-elevate-2"
            data-testid="button-send-message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
