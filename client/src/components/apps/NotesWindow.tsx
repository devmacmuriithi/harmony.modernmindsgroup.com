import { Plus } from 'lucide-react';

export default function NotesWindow() {
  //todo: remove mock functionality
  const notes = [
    { id: 1, content: 'Sermon notes from Sunday - forgiveness theme', tags: ['sermon', 'forgiveness'] },
    { id: 2, content: 'Prayer requests from small group meeting', tags: ['prayer', 'community'] },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Sync Notes</h2>
        <button 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover-elevate active-elevate-2 text-sm"
          data-testid="button-add-note"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>
      <div className="space-y-3">
        {notes.map(note => (
          <div 
            key={note.id}
            className="p-4 rounded-lg border border-border bg-card hover-elevate"
            data-testid={`note-item-${note.id}`}
          >
            <p className="text-foreground mb-2">{note.content}</p>
            <div className="flex gap-2">
              {note.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
