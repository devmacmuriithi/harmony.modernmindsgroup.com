import DesktopIcon from '../DesktopIcon';

export default function DesktopIconExample() {
  return (
    <div className="flex gap-4 p-8">
      <DesktopIcon icon="📖" label="Bible" onClick={() => console.log('Bible clicked')} />
      <DesktopIcon icon="🙏" label="Prayer" onClick={() => console.log('Prayer clicked')} />
      <DesktopIcon icon="💫" label="Devotional" onClick={() => console.log('Devotional clicked')} />
    </div>
  );
}
