import DesktopDock from '../DesktopDock';

export default function DesktopDockExample() {
  return (
    <div className="h-32 flex items-end justify-center">
      <DesktopDock onAppClick={(id) => console.log('App clicked:', id)} />
    </div>
  );
}
