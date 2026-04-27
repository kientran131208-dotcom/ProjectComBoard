"use client";

import React, { memo, useState } from "react";
import { Trash2, GripHorizontal, Maximize2 } from "lucide-react";

interface ZoneCardProps {
  zone: any;
  isAdmin: boolean;
  viewportScale: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
}

const ZoneCard = memo(({ 
  zone, 
  isAdmin, 
  viewportScale, 
  onDelete, 
  onUpdate 
}: ZoneCardProps) => {
  const [isResizing, setIsResizing] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isAdmin) return;
    e.stopPropagation();
    if (e.button !== 0) return;
    
    const target = e.currentTarget as HTMLElement;
    const startX = zone.x;
    const startY = zone.y;
    const mouseStartX = e.clientX;
    const mouseStartY = e.clientY;
    
    const zoneCard = document.getElementById(`zone-${zone.id}`);
    if (!zoneCard) return;
    
    target.setPointerCapture(e.pointerId);
    
    const onDragging = (ev: PointerEvent) => {
      const dx = (ev.clientX - mouseStartX) / viewportScale;
      const dy = (ev.clientY - mouseStartY) / viewportScale;
      
      zoneCard.style.left = `${startX + dx}px`;
      zoneCard.style.top = `${startY + dy}px`;
    };
    
    const onDragEnd = (ev: PointerEvent) => {
      target.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onDragging);
      window.removeEventListener('pointerup', onDragEnd);

      const dx = (ev.clientX - mouseStartX) / viewportScale;
      const dy = (ev.clientY - mouseStartY) / viewportScale;
      
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        onUpdate(zone.id, { x: startX + dx, y: startY + dy });
      }
    };
    
    window.addEventListener('pointermove', onDragging);
    window.addEventListener('pointerup', onDragEnd);
  };

  const handleResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    setIsResizing(true);
    const startWidth = zone.width;
    const startHeight = zone.height;
    const mouseStartX = e.clientX;
    const mouseStartY = e.clientY;
    
    const onResizing = (ev: PointerEvent) => {
      const dx = (ev.clientX - mouseStartX) / viewportScale;
      const dy = (ev.clientY - mouseStartY) / viewportScale;
      
      const newWidth = Math.max(100, startWidth + dx);
      const newHeight = Math.max(100, startHeight + dy);
      
      const zoneEl = document.getElementById(`zone-${zone.id}`);
      if (zoneEl) {
        zoneEl.style.width = `${newWidth}px`;
        zoneEl.style.height = `${newHeight}px`;
      }
    };
    
    const onResizeEnd = (ev: PointerEvent) => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onResizing);
      window.removeEventListener('pointerup', onResizeEnd);

      const dx = (ev.clientX - mouseStartX) / viewportScale;
      const dy = (ev.clientY - mouseStartY) / viewportScale;
      
      onUpdate(zone.id, { 
        width: Math.max(100, startWidth + dx), 
        height: Math.max(100, startHeight + dy) 
      });
    };
    
    window.addEventListener('pointermove', onResizing);
    window.addEventListener('pointerup', onResizeEnd);
  };

  return (
    <div
      id={`zone-${zone.id}`}
      style={{
        position: 'absolute',
        left: `${zone.x}px`,
        top: `${zone.y}px`,
        width: `${zone.width}px`,
        height: `${zone.height}px`,
        zIndex: 1,
      }}
      className={`border-4 border-black ${zone.borderStyle === 'dashed' ? 'border-dashed' : 'border-solid'} 
        transition-[box-shadow,border-color] duration-300 relative group pointer-events-none`}
    >
      {/* Premium Header - Solid White, Upright, Centered */}
      <div 
        onPointerDown={handlePointerDown}
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border-4 border-black px-8 py-3 shadow-[6px_6px_0_0_#000000] select-none pointer-events-auto cursor-move group/name flex items-center justify-center min-w-[50%] whitespace-nowrap z-30"
      >
        <span className="font-headline font-black text-3xl md:text-4xl uppercase tracking-widest text-black transition-all group-hover/name:scale-105 active:scale-95 leading-none">
          {zone.name}
        </span>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <>
          <button 
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(zone.id);
            }}
            className="absolute -top-10 -right-2 bg-white border-2 border-black p-2 hover:bg-red-50 text-red-500 shadow-[2px_2px_0_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all pointer-events-auto z-[40]"
            title="Xóa Zone"
          >
            <Trash2 size={18} />
          </button>
          
          {/* Resize Handle - Back to original corner */}
          <div 
            onPointerDown={handleResizeDown}
            className="absolute -bottom-4 -right-4 w-9 h-9 bg-white border-4 border-black flex items-center justify-center cursor-nwse-resize shadow-[4px_4px_0_0_#000000] hover:scale-110 active:scale-95 transition-all z-20 pointer-events-auto rounded-full"
          >
            <Maximize2 size={20} />
          </div>
        </>
      )}
    </div>
  );
});

ZoneCard.displayName = "ZoneCard";

export default ZoneCard;
