import { X, Minus, Maximize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface WindowProps {
  appId: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export default function Window({ 
  appId, 
  title, 
  children, 
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 500, height: 550 }
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      } else if (isResizing) {
        setSize({
          width: Math.max(320, e.clientX - position.x),
          height: Math.max(200, e.clientY - position.y)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, position]);

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  return (
    <div
      ref={windowRef}
      data-testid={`window-${appId}`}
      className="absolute flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[rgba(245,241,232,0.7)] dark:bg-[rgba(26,20,16,0.7)] backdrop-blur-2xl border border-amber-500/25 dark:border-amber-500/20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: '320px',
        minHeight: '200px',
        zIndex: 1000
      }}
    >
      <div 
        className="flex items-center justify-between h-11 bg-amber-100/80 dark:bg-amber-900/80 border-b border-amber-900/20 dark:border-amber-200/20 px-4 cursor-move"
        onMouseDown={handleDragStart}
        data-testid={`window-header-${appId}`}
      >
        <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">{title}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            data-testid={`button-minimize-${appId}`}
            className="w-3 h-3 rounded-full bg-[#c9a961] hover:opacity-80 transition-opacity"
          />
          <button 
            onClick={onClose}
            data-testid={`button-maximize-${appId}`}
            className="w-3 h-3 rounded-full bg-[#87ceeb] hover:opacity-80 transition-opacity flex items-center justify-center"
          >
            <Maximize2 className="w-2 h-2 text-white opacity-0 hover:opacity-100" />
          </button>
          <button 
            onClick={onClose}
            data-testid={`button-close-${appId}`}
            className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80 transition-opacity flex items-center justify-center"
          >
            <X className="w-2 h-2 text-white opacity-0 hover:opacity-100" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4" data-testid={`window-content-${appId}`}>
        {children}
      </div>
      <div 
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
        onMouseDown={handleResizeStart}
        data-testid={`resize-handle-${appId}`}
      />
    </div>
  );
}
