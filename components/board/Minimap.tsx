"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2, Map as MapIcon, Crosshair } from "lucide-react";

interface MinimapProps {
  posts: any[];
  zones: any[];
  viewport: { x: number; y: number; scale: number };
  onNavigate: (x: number, y: number) => void;
}

const Minimap = ({ posts, zones, viewport, onNavigate }: MinimapProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [screenSize, setScreenSize] = useState({ w: 1920, h: 1080 });
  const [isPanningMap, setIsPanningMap] = useState(false);
  const [scoutCenter, setScoutCenter] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ w: window.innerWidth, h: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update scout center (for expanded mode) to follow view initially
  useEffect(() => {
    if (!isExpanded && !isPanningMap) {
      const viewX = -viewport.x / viewport.scale + (screenSize.w / 2) / viewport.scale;
      const viewY = -viewport.y / viewport.scale + (screenSize.h / 2) / viewport.scale;
      setScoutCenter({ x: viewX, y: viewY });
    }
  }, [viewport.x, viewport.y, viewport.scale, isExpanded, isPanningMap, screenSize]);

  const MINI_SIZE = 180;
  const EXPANDED_SIZE = Math.min(screenSize.w * 0.8, screenSize.h * 0.8);
  const MAP_SIZE = isExpanded ? EXPANDED_SIZE : MINI_SIZE;

  // 1. Calculate world boundaries
  const worldBounds = useMemo(() => {
    if (posts.length === 0 && zones.length === 0) {
      return { minX: -4000, maxX: 4000, minY: -4000, maxY: 4000 };
    }
    let minX = Infinity; let maxX = -Infinity;
    let minY = Infinity; let maxY = -Infinity;

    [...posts, ...zones].forEach((item, index) => {
      const isAtOrigin = item.x === 0 && item.y === 0;
      const x = isAtOrigin ? (index % 3) * 350 + 200 : item.x;
      const y = isAtOrigin ? Math.floor(index / 3) * 300 + 200 : item.y;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x + (item.width || 300));
      minY = Math.min(minY, y); maxY = Math.max(maxY, y + (item.height || 400));
    });

    const padding = 2000;
    return { minX: minX - padding, maxX: maxX + padding, minY: minY - padding, maxY: maxY + padding };
  }, [posts, zones]);

  const worldCenter = {
    x: (worldBounds.minX + worldBounds.maxX) / 2,
    y: (worldBounds.minY + worldBounds.maxY) / 2
  };

  // 2. Dual Scale & Center Logic
  // Small Map: Global Overview (Zoom to Fit)
  const globalScale = MINI_SIZE / Math.max(worldBounds.maxX - worldBounds.minX, worldBounds.maxY - worldBounds.minY);
  // Expanded Map: Local Scouting (Fixed Detail)
  const scoutScale = 0.05;

  const currentScale = isExpanded ? scoutScale : globalScale;
  const currentCenter = isExpanded ? scoutCenter : worldCenter;

  const toMapX = (worldX: number) => (worldX - currentCenter.x) * currentScale + MAP_SIZE / 2;
  const toMapY = (worldY: number) => (worldY - currentCenter.y) * currentScale + MAP_SIZE / 2;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsPanningMap(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (!isExpanded) {
      const rect = e.currentTarget.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - MINI_SIZE / 2) / globalScale + worldCenter.x;
      const worldY = (e.clientY - rect.top - MINI_SIZE / 2) / globalScale + worldCenter.y;
      onNavigate(worldX, worldY);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanningMap) return;
    if (isExpanded) {
      const dx = (e.clientX - lastMousePos.current.x) / scoutScale;
      const dy = (e.clientY - lastMousePos.current.y) / scoutScale;
      setScoutCenter(prev => ({ x: prev.x - dx, y: prev.y - dy }));
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - MINI_SIZE / 2) / globalScale + worldCenter.x;
      const worldY = (e.clientY - rect.top - MINI_SIZE / 2) / globalScale + worldCenter.y;
      onNavigate(worldX, worldY);
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => setIsPanningMap(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExpanded) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const worldX = (clickX - EXPANDED_SIZE / 2) / scoutScale + scoutCenter.x;
      const worldY = (clickY - EXPANDED_SIZE / 2) / scoutScale + scoutCenter.y;
      
      onNavigate(worldX, worldY);
      setIsExpanded(false);
    }
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const viewX = -viewport.x / viewport.scale + (screenSize.w / 2) / viewport.scale;
    const viewY = -viewport.y / viewport.scale + (screenSize.h / 2) / viewport.scale;
    setScoutCenter({ x: viewX, y: viewY });
  };

  // Viewport indicators
  const currentViewWorldX = -viewport.x / viewport.scale + (screenSize.w / 2) / viewport.scale;
  const currentViewWorldY = -viewport.y / viewport.scale + (screenSize.h / 2) / viewport.scale;

  return (
    <>
      {isExpanded && <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsExpanded(false)} />}
      <div 
        className={`fixed z-[101] transition-all bg-white border-4 border-black shadow-[8px_8px_0_0_#000000] p-2 select-none overflow-hidden ${isExpanded ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'bottom-32 right-6 hover:scale-105'}`}
        style={{ width: MAP_SIZE + 16, height: MAP_SIZE + 16 }}
      >
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          {isExpanded && <button onClick={handleRecenter} className="p-1 bg-white border-2 border-black hover:bg-zinc-100 shadow-[2px_2px_0_0_#000] active:shadow-none translate-y-0 active:translate-y-[2px]"><Crosshair size={14} /></button>}
          <button onClick={(e) => {e.stopPropagation(); setIsExpanded(!isExpanded);}} className="p-1 bg-white border-2 border-black hover:bg-zinc-100 shadow-[2px_2px_0_0_#000] active:shadow-none translate-y-0 active:translate-y-[2px]">
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
        <div 
          className={`relative bg-[#FFF8F6] dot-pattern overflow-hidden border-2 border-black/10 h-full ${isExpanded ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove} 
          onPointerUp={handlePointerUp} 
          onPointerLeave={handlePointerUp}
          onContextMenu={handleContextMenu}
        >
          {zones.map((zone) => {
            const squareSize = isExpanded ? 60 : 24;
            return (
              <div key={zone.id} className="absolute flex flex-col items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0_0_#000000] overflow-hidden pointer-events-none"
                style={{ left: toMapX(zone.x + zone.width/2) - squareSize/2, top: toMapY(zone.y + zone.height/2) - squareSize/2, width: squareSize, height: squareSize, backgroundColor: zone.color }}>
                <span className={`font-black uppercase text-black bg-white/80 px-1 leading-none truncate max-w-full ${isExpanded ? 'text-[10px]' : 'text-[6px]'}`}>
                  {isExpanded ? zone.name : zone.name.substring(0, 2)}
                </span>
              </div>
            );
          })}
          {posts.map((post, index) => {
            const isAtOrigin = post.x === 0 && post.y === 0;
            const x = isAtOrigin ? (index % 3) * 350 + 200 : post.x;
            const y = isAtOrigin ? Math.floor(index / 3) * 300 + 200 : post.y;
            return <div key={post.id} className="absolute bg-black/10 rounded-full pointer-events-none"
                style={{ left: toMapX(x), top: toMapY(y), width: isExpanded ? 4 : 2, height: isExpanded ? 4 : 2 }} />;
          })}
          <div className="absolute bg-[#F24236] border-2 border-white rounded-full shadow-[0_0_15px_#F24236] pointer-events-none z-10"
            style={{ left: toMapX(currentViewWorldX) - (isExpanded ? 10 : 5), top: toMapY(currentViewWorldY) - (isExpanded ? 10 : 5), width: isExpanded ? 20 : 10, height: isExpanded ? 20 : 10 }}
          >
            <div className={`absolute left-1/2 -translate-x-1/2 bg-[#F24236] text-white font-black px-1 uppercase whitespace-nowrap rounded-sm shadow-[2px_2px_0_0_#000] ${isExpanded ? '-top-6 text-[10px]' : '-top-4 text-[6px]'}`}>
              {isPanningMap ? (isExpanded ? 'Dò đường...' : 'Nhảy...') : (isExpanded ? 'Bạn' : '')}
            </div>
          </div>
        </div>
        {!isExpanded && <div className="absolute -top-6 right-0 bg-black text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">Bản đồ tổng thể</div>}
      </div>
    </>
  );
};

export default Minimap;
