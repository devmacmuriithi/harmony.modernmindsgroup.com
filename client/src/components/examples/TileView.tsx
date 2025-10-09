import TileView from '../TileView';

export default function TileViewExample() {
  return (
    <div className="h-screen relative">
      <TileView onAppClick={(id) => console.log('Tile clicked:', id)} />
    </div>
  );
}
