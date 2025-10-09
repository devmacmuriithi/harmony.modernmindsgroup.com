import { BookOpen, Headphones, FileText } from 'lucide-react';

export default function LibraryWindow() {
  //todo: remove mock functionality
  const resources = [
    { id: 1, title: 'Mere Christianity', author: 'C.S. Lewis', type: 'book', icon: BookOpen },
    { id: 2, title: 'The Bible Project Podcast', author: 'Tim Mackie', type: 'podcast', icon: Headphones },
    { id: 3, title: 'Understanding the Gospels', author: 'Various Authors', type: 'article', icon: FileText },
    { id: 4, title: 'The Case for Christ', author: 'Lee Strobel', type: 'book', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Library</h2>
      <div className="space-y-2">
        {resources.map(resource => {
          const Icon = resource.icon;
          return (
            <div 
              key={resource.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover-elevate"
              data-testid={`resource-${resource.id}`}
            >
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground text-sm">{resource.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{resource.author}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground">
                  {resource.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
