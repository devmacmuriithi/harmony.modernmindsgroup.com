import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Headphones, FileText, Loader2, RefreshCw, ExternalLink, Search, Globe, FileDown, GraduationCap, Newspaper, Rss } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  url: string | null;
  resourceType: string;
  author?: string | null;
  createdAt: string;
}

const resourceTypes = [
  { value: 'all', label: 'All Resources', icon: FileText },
  { value: 'article', label: 'Articles', icon: Newspaper },
  { value: 'blog', label: 'Blogs', icon: Rss },
  { value: 'website', label: 'Websites', icon: Globe },
  { value: 'pdf', label: 'PDFs', icon: FileDown },
  { value: 'book', label: 'Books', icon: BookOpen },
  { value: 'podcast', label: 'Podcasts', icon: Headphones },
  { value: 'study', label: 'Studies', icon: GraduationCap },
];

const getIcon = (type: string) => {
  const resourceType = resourceTypes.find(rt => rt.value === type);
  return resourceType?.icon || FileText;
};

export default function LibraryWindow() {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: resourcesData, isLoading, error } = useQuery<{ data: Resource[] }>({
    queryKey: ['/api/resources']
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-destructive mb-2">Failed to load resources</p>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      </div>
    );
  }

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

  // Filter and search logic
  const filteredResources = resources.filter(resource => {
    // Filter by type
    const matchesFilter = selectedFilter === 'all' || resource.resourceType === selectedFilter;
    
    // Filter by search query (title, description, author)
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.author ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search title, description, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-resources"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {resourceTypes.map(type => {
          const Icon = type.icon;
          const isActive = selectedFilter === type.value;
          return (
            <Button
              key={type.value}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => setSelectedFilter(type.value)}
              data-testid={`filter-${type.value}`}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {type.label}
            </Button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No resources yet</p>
            <Button onClick={() => generateMutation.mutate()} data-testid="button-get-resources">
              Get Personalized Resources
            </Button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No resources match your filters</p>
          </div>
        ) : (
          filteredResources.map(resource => {
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
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground capitalize">
                      {resource.resourceType}
                    </span>
                    {resource.author && (
                      <span className="text-xs text-muted-foreground">by {resource.author}</span>
                    )}
                  </div>
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
