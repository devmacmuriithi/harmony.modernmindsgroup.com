import { useState } from 'react';
import { ThemeProvider } from '../ThemeProvider';
import TopMenuBar from '../TopMenuBar';

export default function TopMenuBarExample() {
  const [viewMode, setViewMode] = useState<'tiles' | 'icons'>('tiles');

  return (
    <ThemeProvider>
      <TopMenuBar 
        viewMode={viewMode} 
        onViewModeToggle={() => setViewMode(prev => prev === 'tiles' ? 'icons' : 'tiles')} 
      />
    </ThemeProvider>
  );
}
