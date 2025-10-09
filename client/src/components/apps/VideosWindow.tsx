export default function VideosWindow() {
  //todo: remove mock functionality
  const videos = [
    { id: 1, title: 'The Power of Faith in Difficult Times', channel: 'Daily Devotions', thumbnail: 'https://picsum.photos/seed/video1/400/225' },
    { id: 2, title: 'Understanding Grace and Mercy', channel: 'Theology Explained', thumbnail: 'https://picsum.photos/seed/video2/400/225' },
    { id: 3, title: 'Building Strong Christian Relationships', channel: 'Life Together', thumbnail: 'https://picsum.photos/seed/video3/400/225' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Recommended Videos</h2>
      <div className="space-y-4">
        {videos.map(video => (
          <div 
            key={video.id}
            className="rounded-lg overflow-hidden border border-border bg-card hover-elevate cursor-pointer"
            data-testid={`video-${video.id}`}
          >
            <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover" />
            <div className="p-3">
              <h3 className="font-medium text-foreground text-sm mb-1">{video.title}</h3>
              <p className="text-xs text-muted-foreground">{video.channel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
