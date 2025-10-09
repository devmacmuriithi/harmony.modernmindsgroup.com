import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Prayer {
  id: string;
  userId: string;
  content: string;
  isAnswered: boolean;
  answeredAt: string | null;
  createdAt: string;
}

export default function PrayerWindow() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPrayerContent, setNewPrayerContent] = useState('');

  const { data: prayersData, isLoading } = useQuery<{ data: Prayer[] }>({
    queryKey: ['/api/prayers']
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', '/api/prayers', { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayers'] });
      setNewPrayerContent('');
      setIsDialogOpen(false);
      toast({ title: 'Prayer added!', description: 'Your prayer has been saved.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add prayer.', variant: 'destructive' });
    }
  });

  const answerMutation = useMutation({
    mutationFn: async ({ id, isAnswered }: { id: string; isAnswered: boolean }) => {
      const res = await apiRequest('PATCH', `/api/prayers/${id}/answer`, { isAnswered });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayers'] });
      toast({ title: 'Updated!', description: 'Prayer status updated.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update prayer.', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/prayers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prayers'] });
      toast({ title: 'Deleted!', description: 'Prayer has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete prayer.', variant: 'destructive' });
    }
  });

  const handleAddPrayer = () => {
    if (newPrayerContent.trim()) {
      createMutation.mutate(newPrayerContent);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const prayers = prayersData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Prayer Journal</h2>
        <Button
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          data-testid="button-add-prayer"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Prayer
        </Button>
      </div>

      {prayers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No prayers yet. Add your first prayer!</p>
        </div>
      ) : (
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
                  checked={prayer.isAnswered} 
                  onChange={() => answerMutation.mutate({ id: prayer.id, isAnswered: !prayer.isAnswered })}
                  className="mt-1"
                  data-testid={`checkbox-prayer-${prayer.id}`}
                />
                <div className="flex-1">
                  <p className={`text-foreground ${prayer.isAnswered ? 'line-through opacity-60' : ''}`}>
                    {prayer.content}
                  </p>
                  {prayer.isAnswered && prayer.answeredAt && (
                    <span className="text-xs text-green-600 dark:text-green-400 mt-1 block">
                      ✓ Answered {new Date(prayer.answeredAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(prayer.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-prayer-${prayer.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-add-prayer">
          <DialogHeader>
            <DialogTitle>Add Prayer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your prayer here..."
              value={newPrayerContent}
              onChange={(e) => setNewPrayerContent(e.target.value)}
              className="min-h-[120px]"
              data-testid="textarea-new-prayer"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleAddPrayer} 
                disabled={!newPrayerContent.trim() || createMutation.isPending}
                data-testid="button-submit-prayer"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Prayer'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
