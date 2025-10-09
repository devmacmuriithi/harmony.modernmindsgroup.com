import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Trash2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Note {
  id: string;
  userId: string;
  content: string;
  aiTags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NotesWindow() {
  const { toast } = useToast();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: notesData, isLoading, error } = useQuery<{ data: Note[] }>({
    queryKey: ['/api/notes']
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-destructive mb-2">Failed to load notes</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', '/api/notes', { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setNewNoteContent('');
      toast({ title: 'Note created!', description: 'AI tags have been generated for your note.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create note.', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await apiRequest('PATCH', `/api/notes/${id}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setEditingNoteId(null);
      setEditContent('');
      toast({ title: 'Note updated!', description: 'Your changes have been saved.' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/notes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({ title: 'Note deleted!', description: 'The note has been removed.' });
    }
  });

  const handleCreateNote = () => {
    if (newNoteContent.trim()) {
      createMutation.mutate(newNoteContent);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (id: string) => {
    if (editContent.trim()) {
      updateMutation.mutate({ id, content: editContent });
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const notes = notesData?.data || [];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Sync Notes</h2>
      </div>

      <div className="space-y-2">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write a new note... (AI will auto-generate tags)"
          className="w-full h-20 p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
          data-testid="textarea-new-note"
        />
        <Button
          onClick={handleCreateNote}
          disabled={!newNoteContent.trim() || createMutation.isPending}
          className="w-full"
          data-testid="button-create-note"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating & Tagging...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {notes.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No notes yet. Create your first note above!
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="p-4 rounded-lg border border-border bg-card"
              data-testid={`note-item-${note.id}`}
            >
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-24 p-2 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
                    data-testid={`textarea-edit-note-${note.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={updateMutation.isPending}
                      data-testid={`button-save-note-${note.id}`}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid={`button-cancel-edit-${note.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-foreground flex-1 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(note)}
                        data-testid={`button-edit-note-${note.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(note.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {note.aiTags && note.aiTags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {note.aiTags.map((tag, i) => (
                        <Badge key={i} variant="secondary" data-testid={`tag-${tag}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
