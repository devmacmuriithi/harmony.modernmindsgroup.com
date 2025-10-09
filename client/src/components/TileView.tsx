import { apps } from './DesktopDock';

interface TileViewProps {
  onAppClick: (appId: string) => void;
}

const tileLayouts = [
  { id: 'bible', size: 'tile-lg' },
  { id: 'devotional', size: 'tile-wide' },
  { id: 'prayer', size: 'tile-tall' },
  { id: 'mood', size: 'tile-small' },
  { id: 'guides', size: 'tile-wide' },
  { id: 'notes', size: 'tile-tall' },
  { id: 'prayer-chain', size: 'tile-wide' },
  { id: 'videos', size: 'tile-small' },
  { id: 'songs', size: 'tile-small' },
  { id: 'sermons', size: 'tile-wide' },
  { id: 'library', size: 'tile-tall' },
  { id: 'flourishing', size: 'tile-lg' },
  { id: 'calendar', size: 'tile-wide' },
  { id: 'settings', size: 'tile-small' },
];

export default function TileView({ onAppClick }: TileViewProps) {
  return (
    <div className="absolute top-14 bottom-24 left-0 right-0 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[150px]">
        {tileLayouts.map((layout) => {
          const app = apps.find(a => a.id === layout.id);
          if (!app) return null;

          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              data-testid={`tile-${app.id}`}
              className={`${layout.size} cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl rounded-xl p-4 flex flex-col justify-between min-h-[150px] bg-gradient-to-br ${app.color} text-white`}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 opacity-90">
                  {app.icon}
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg">{app.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
