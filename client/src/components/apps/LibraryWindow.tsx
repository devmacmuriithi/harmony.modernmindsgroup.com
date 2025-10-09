import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { BookOpen, Headphones, FileText, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  url: string | null;
  resourceType: string;
  createdAt: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'book': return BookOpen;
    case 'podcast': return Headphones;
    case 'article': return FileText;
    default: return FileText;
  }
};

export default function LibraryWindow() {
  const { toast } = useToast();

  const { data: resourcesData, isLoading } = useQuery<{ data: Resource[] }>({
    queryKey: ['/api/resources']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/resources/generate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resources'] });
      toast({ title: 'Library updated!', description: 'New personalized resources added.' });
    }
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/resources/${id}/read`);
      return res.json();
    }
  });

  const handleOpen = (resource: Resource) => {
    readMutation.mutate(resource.id);
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const resources = resourcesData?.data || [];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Library</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-resources"
        >
          {generateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No resources yet</p>
            <Button onClick={() => generateMutation.mutate()} data-testid="button-get-resources">
              Get Personalized Resources
            </Button>
          </div>
        ) : (
          resources.map(resource => {
            const Icon = getIcon(resource.resourceType);
            return (
              <div
                key={resource.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover-elevate"
                data-testid={`resource-item-${resource.id}`}
              >
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm">{resource.title}</h3>
                  {resource.description && (
                    <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                  )}
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground capitalize">
                    {resource.resourceType}
                  </span>
                </div>
                {resource.url && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpen(resource)}
                    data-testid={`button-open-${resource.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
