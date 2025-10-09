export default function SermonsWindow() {
  //todo: remove mock functionality
  const sermons = [
    { id: 1, title: 'Walking in Faith', pastor: 'Rev. James Miller', duration: '35 min', thumbnail: 'https://picsum.photos/seed/sermon1/400/225' },
    { id: 2, title: 'The Heart of Worship', pastor: 'Pastor Sarah Chen', duration: '42 min', thumbnail: 'https://picsum.photos/seed/sermon2/400/225' },
    { id: 3, title: 'Finding Hope in Trials', pastor: 'Dr. Michael Roberts', duration: '38 min', thumbnail: 'https://picsum.photos/seed/sermon3/400/225' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Recent Sermons</h2>
      <div className="space-y-3">
        {sermons.map(sermon => (
          <div 
            key={sermon.id}
            className="rounded-lg overflow-hidden border border-border bg-card hover-elevate cursor-pointer"
            data-testid={`sermon-${sermon.id}`}
          >
            <img src={sermon.thumbnail} alt={sermon.title} className="w-full h-32 object-cover" />
            <div className="p-3">
              <h3 className="font-medium text-foreground mb-1">{sermon.title}</h3>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{sermon.pastor}</span>
                <span>{sermon.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
