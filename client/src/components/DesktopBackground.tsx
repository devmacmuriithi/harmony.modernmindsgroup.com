interface DesktopBackgroundProps {
  children: React.ReactNode;
}

export default function DesktopBackground({ children }: DesktopBackgroundProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc4] dark:from-[#1a1410] dark:to-[#2d2419]">
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: 'radial-gradient(#d4c5a9 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div 
        className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-300" 
        style={{
          backgroundImage: 'radial-gradient(#3d3427 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {children}
    </div>
  );
}
