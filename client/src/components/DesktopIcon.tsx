interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export default function DesktopIcon({ icon, label, onClick }: DesktopIconProps) {
  return (
    <button
      onClick={onClick}
      data-testid={`desktop-icon-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex flex-col items-center w-24 p-2 rounded-lg transition-all duration-200 hover:bg-amber-500/15 hover:-translate-y-0.5 active-elevate-2"
    >
      <div className="text-5xl mb-2">{icon}</div>
      <span className="text-sm text-[#3d2817] dark:text-[#f5f1e8] font-medium text-center text-shadow-sm">
        {label}
      </span>
    </button>
  );
}
