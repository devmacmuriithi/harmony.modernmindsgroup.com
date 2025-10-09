import { Play } from 'lucide-react';

export default function SongsWindow() {
  //todo: remove mock functionality
  const songs = [
    { id: 1, title: 'Great Are You Lord', artist: 'All Sons & Daughters', thumbnail: 'https://picsum.photos/seed/song1/100/100' },
    { id: 2, title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong United', thumbnail: 'https://picsum.photos/seed/song2/100/100' },
    { id: 3, title: 'Good Good Father', artist: 'Chris Tomlin', thumbnail: 'https://picsum.photos/seed/song3/100/100' },
    { id: 4, title: 'How Great Is Our God', artist: 'Chris Tomlin', thumbnail: 'https://picsum.photos/seed/song4/100/100' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Worship Songs</h2>
      <div className="space-y-2">
        {songs.map(song => (
          <div 
            key={song.id}
            className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card hover-elevate"
            data-testid={`song-${song.id}`}
          >
            <img src={song.thumbnail} alt={song.title} className="w-12 h-12 rounded-md" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm truncate">{song.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
            </div>
            <button 
              className="p-2 rounded-full bg-sidebar-primary text-sidebar-primary-foreground hover-elevate active-elevate-2"
              data-testid={`button-play-${song.id}`}
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
