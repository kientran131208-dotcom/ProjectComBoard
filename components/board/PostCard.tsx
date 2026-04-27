"use client";

import React, { memo, useState } from "react";
import { 
  Megaphone, 
  Handshake, 
  MessageCircle, 
  Trash2, 
  Heart, 
  Calendar,
  X as CloseIcon,
  Link as LinkIcon,
  Zap,
  RefreshCcw,
  Check,
  Pin
} from "lucide-react";
import { votePoll } from "../../lib/actions/poll";
import { useLanguage } from "@/context/LanguageContext";

interface PostCardProps {
  post: any;
  index: number;
  currentUserId: string | null;
  isAdmin: boolean;
  viewportScale: number;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdateTransform: (id: string, transform: { x?: number, y?: number, rotation?: number, scale?: number }) => void;
  onUpdatePost: (id: string, data: { title?: string, content?: string, status?: "OPEN" | "IN_PROGRESS" | "DONE" }) => void;
  onVotePoll: (postId: string, option: string) => void;
}

const PostCard = memo(({ 
  post, 
  index, 
  currentUserId, 
  isAdmin, 
  viewportScale, 
  onDelete, 
  onSelect,
  onTogglePin,
  onUpdateTransform,
  onUpdatePost,
  onVotePoll 
}: PostCardProps) => {
  const { t } = useLanguage();
  const isAtOrigin = post.x === 0 && post.y === 0;
  const gridX = isAtOrigin ? (index % 3) * 350 + 100 : post.x;
  const gridY = isAtOrigin ? Math.floor(index / 3) * 300 + 100 : post.y;
  const isAuthor = String(post.authorId) === String(currentUserId);
  const canTransform = isAuthor || isAdmin;

  const getPostColor = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT": return "bg-[#FFD166]";
      case "BORROWING": return "bg-[#06D6A0]";
      case "QNA": return "bg-[#118AB2]";
      case "POLL": return "bg-[#7B61FF]"; 
      default: return "bg-white";
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    const targetElement = e.target as HTMLElement;
    // Don't start dragging if clicking interactive elements
    if (targetElement.closest('button') || targetElement.closest('a') || targetElement.closest('.poll-option')) {
      return;
    }

    const target = e.currentTarget as HTMLElement;
    const startX = parseFloat(target.style.left) || 0;
    const startY = parseFloat(target.style.top) || 0;
    const mouseStartX = e.clientX;
    const mouseStartY = e.clientY;
    
    target.setPointerCapture(e.pointerId);
    
    const onDragging = (ev: PointerEvent) => {
      const dx = (ev.clientX - mouseStartX) / viewportScale;
      const dy = (ev.clientY - mouseStartY) / viewportScale;
      
      target.style.transition = "none";
      target.style.left = `${startX + dx}px`;
      target.style.top = `${startY + dy}px`;
      target.style.zIndex = "1000";
      target.style.transform = `scale(${(post.scale || 1) * 1.02}) rotate(${post.isPinned ? 0 : (post.rotation || 0)}deg)`;
      target.style.boxShadow = "12px 12px 0px #1A1A2E";
    };
    
    const onDragEnd = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onDragging);
      window.removeEventListener('pointerup', onDragEnd);
      target.releasePointerCapture(e.pointerId);
      
      target.style.transition = ""; 
      target.style.zIndex = index.toString();
      target.style.transform = `scale(${post.scale || 1}) rotate(${post.isPinned ? 0 : (post.rotation || 0)}deg)`;
      target.style.boxShadow = "";

      const dx = (ev.clientX - mouseStartX) / viewportScale;
      const dy = (ev.clientY - mouseStartY) / viewportScale;
      
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        onSelect(post.id);
      } else if (canTransform && (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)) {
        onUpdateTransform(post.id, { x: startX + dx, y: startY + dy });
      }
    };
    
    window.addEventListener('pointerup', onDragEnd);
    if (canTransform) {
      window.addEventListener('pointermove', onDragging);
    }
  };

  const handleResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.currentTarget.closest('.post-card') as HTMLElement;
    const startScale = post.scale || 1;
    const mouseStartX = e.clientX;
    const mouseStartY = e.clientY;
    
    target.setPointerCapture(e.pointerId);
    
    const onResizing = (ev: PointerEvent) => {
      const dx = ev.clientX - mouseStartX;
      const dy = ev.clientY - mouseStartY;
      const move = Math.max(dx, dy);
      const newScale = Math.max(0.5, Math.min(3, startScale + move / 200));
      
      target.style.transition = "none";
      target.style.transform = `scale(${newScale}) rotate(${post.isPinned ? 0 : (post.rotation || 0)}deg)`;
    };
    
    const onResizeEnd = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onResizing);
      window.removeEventListener('pointerup', onResizeEnd);
      target.releasePointerCapture(e.pointerId);
      
      const dx = ev.clientX - mouseStartX;
      const dy = ev.clientY - mouseStartY;
      const move = Math.max(dx, dy);
      const newScale = Math.max(0.5, Math.min(3, startScale + move / 200));
      
      onUpdateTransform(post.id, { scale: newScale });
    };
    
    window.addEventListener('pointermove', onResizing);
    window.addEventListener('pointerup', onResizeEnd);
  };


  return (
    <div
      style={{
        position: 'absolute',
        left: `${gridX}px`,
        top: `${gridY}px`,
        '--rotation': `${post.isPinned ? 0 : (post.rotation || 0)}deg`,
        transform: `scale(${post.scale || 1}) rotate(var(--rotation))`,
        width: post.width ? `${post.width * (post.isPinned ? 1.25 : 1)}px` : (post.isPinned ? '500px' : '400px'),
        height: post.type === "POLL" ? 'auto' : (post.height ? `${post.height * (post.isPinned ? 1.25 : 1)}px` : 'auto'),
        zIndex: index,
        willChange: "transform, left, top"
      } as React.CSSProperties}
      className={`post-card ${post.isPinned ? getPostColor(post.type) : 'bg-white'} 
        ${post.status === "DONE" ? "opacity-30 grayscale-[0.6] hover:opacity-100 hover:grayscale-0" : "opacity-100"}
        neo-border neo-shadow flex flex-col h-auto transition-all duration-500 hover:rotate-0 ${canTransform ? 'cursor-pointer' : 'cursor-default'} group overflow-hidden`}
      onPointerDown={handlePointerDown}
    >


      {/* Main Content Area */}
      {post.image && (post.content === "Hình ảnh được chia sẻ" || post.content === "Image Shared") ? (
        <div className="flex-1 flex flex-col relative">
          <div className="w-full h-full min-h-0 bg-zinc-50 relative group/img overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-contain pointer-events-none" 
            />
            {/* Ultra Mini Author Overlay */}
            <div className="absolute top-1 left-1 z-40 bg-white/70 backdrop-blur-[2px] border border-black/5 p-0.5 px-1 flex items-center gap-1 shadow-sm pointer-events-none group-hover:opacity-100 opacity-40 transition-opacity">
              <img src={post.author.image || "/default-avatar.png"} className="w-2.5 h-2.5 rounded-full border border-black/5" />
              <span className="text-[6.5px] font-bold truncate max-w-[50px] leading-none tracking-tighter uppercase text-black/60">{post.author.name}</span>
              {post.isPinned && (
                <div className="ml-1 px-1 bg-[#F24236] text-white text-[5px] font-black uppercase rounded-[1px]">Hot</div>
              )}
            </div>

            {/* Floating Title Overlay for Images */}
            <div className="absolute bottom-2 left-2 right-2 z-40 group-hover:opacity-100 opacity-0 transition-opacity pointer-events-none">
                 <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-white/20 inline-block max-w-full">
                    <span className="text-white text-[8px] font-bold truncate block">{post.title}</span>
                 </div>
            </div>

            {/* Quick Actions for Images */}
            <div className="absolute top-1 right-1 z-40 flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
               {isAdmin && (
                 <button 
                   onPointerDown={(e) => e.stopPropagation()}
                   onClick={(e) => { e.stopPropagation(); onTogglePin(post.id); }}
                   className={`p-1 bg-white/90 neo-border shadow-[1px_1px_0_0_#000] hover:bg-[#F24236] hover:text-white transition-all ${post.isPinned ? 'text-[#F24236]' : 'text-slate-400'}`}
                 >
                   <Pin size={10} className={post.isPinned ? "fill-current" : ""} />
                 </button>
               )}
               {(isAuthor || isAdmin) && (
                 <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                    className="p-1 bg-white/90 neo-border shadow-[1px_1px_0_0_#000] text-red-500 hover:bg-black hover:text-white transition-all"
                 >
                   <Trash2 size={10} />
                 </button>
               )}
            </div>

            {/* Resize Handle for Image posts */}
            {canTransform && (
              <div 
                onPointerDown={handleResize}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center group-hover:opacity-100 opacity-0 bg-black/10 rounded-tl-full hover:bg-black/30 transition-all"
              >
                <div className="w-1.5 h-1.5 border-r border-b border-white rotate-45 mb-1 ml-1" />
              </div>
            )}
          </div>
          {post.link && (
            <div className="p-2 bg-white border-t-2 border-black">
               <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer"
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1 bg-[#118AB2] text-white py-1 border border-black shadow-[2px_2px_0_0_#000] font-bold text-[8px] uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                <LinkIcon size={10} />
                {t.board.access}
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-auto">
          {/* Header Colored Bar */}
          <div className={`h-4 border-b-4 border-black ${post.isPinned ? 'bg-black/5' : getPostColor(post.type)} pointer-events-none`}></div>
          
          <div className="p-8 flex flex-col w-full relative">
            {/* Poster Image Support for Announcements */}
            {post.image && ["ANNOUNCEMENT", "BORROWING", "QNA"].includes(post.type) && (
              <div className="mb-6 -mx-8 -mt-8 relative h-48 border-b-2 border-black overflow-hidden group/poster">
                <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity" />
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2 items-center overflow-hidden">
                {post.isPinned && (
                  <div className="bg-[#F24236] text-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_0_#000000] flex items-center gap-1 shrink-0">
                    <Pin size={10} className="fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{t.board.important}</span>
                  </div>
                )}
                    {post.status && (
                       <button
                         onPointerDown={(e) => e.stopPropagation()}
                         onClick={(e) => {
                           e.stopPropagation();
                           if (!canTransform) return;
                           const statuses = ["OPEN", "IN_PROGRESS", "DONE"];
                           const currentIndex = statuses.indexOf(post.status);
                           const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                           onUpdatePost(post.id, { status: nextStatus as any });
                         }}
                         className={`px-2 py-0.5 text-[9px] font-black border-2 flex items-center gap-1 uppercase tracking-tighter whitespace-nowrap transition-colors
                           ${post.status === "OPEN" ? "bg-white text-zinc-400 border-zinc-200" : 
                             post.status === "IN_PROGRESS" ? "bg-[#FFD166] text-black border-black shadow-[2px_2px_0_0_#000]" :
                             "bg-[#06D6A0] text-white border-black shadow-[2px_2px_0_0_#000]"}`}>
                         {post.status === "IN_PROGRESS" && <RefreshCcw size={10} className="animate-spin" />}
                         {post.status === "DONE" && <Check size={10} />}
                         {post.status === "OPEN" ? t.status.open : post.status === "IN_PROGRESS" ? t.status.inProgress : t.status.done}
                       </button>
                    )}
                    {post.type && (
                       <span className={`px-2 py-0.5 text-[9px] font-black border-2 flex items-center gap-1 uppercase tracking-tighter whitespace-nowrap
                         ${post.type === "ANNOUNCEMENT" ? "bg-[#FFF9E6] text-[#FFB627] border-black" : 
                           post.type === "BORROWING" ? "bg-[#E6FFF7] text-[#06D6A0] border-black" : 
                           post.type === "POLL" ? "bg-[#F3E8FF] text-[#7B61FF] border-black shadow-[2px_2px_0_0_#000]" :
                           "bg-[#E7F7FD] text-[#118AB2] border-black"}`}>
                        {post.type === "POLL" && <Zap size={10} className="fill-current" />}
                        {post.type === "ANNOUNCEMENT" ? t.types.announcement : post.type === "BORROWING" ? t.types.borrowing : post.type === "POLL" ? t.types.poll : t.types.qna}
                       </span>
                    )}
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                {isAdmin && (
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onTogglePin(post.id); }} 
                    className={`p-1.5 transition-all hover:scale-110 ${post.isPinned ? 'text-[#F24236]' : 'text-slate-400 hover:text-black'}`}
                    title={post.isPinned ? t.board.unpin : t.board.pinPost}
                  >
                    <Pin size={16} className={post.isPinned ? "fill-current" : ""} />
                  </button>
                )}
                {(isAuthor || isAdmin) && (
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} 
                    className="text-red-500 hover:text-red-700 transition-colors p-1.5"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <h3 className={`font-headline font-semibold mb-3 ${post.isPinned ? 'text-2xl leading-tight' : 'text-lg'}`}>
              {post.title}
            </h3>
                
                 {post.type === "POLL" ? (
                  <div className="space-y-3 my-4">
                    {post.pollOptions.slice(0, 2).map((option: string, idx: number) => {
                      const totalVotes = post.votes?.length || 0;
                      const optionVotes = post.votes?.filter((v: any) => v.option === option).length || 0;
                      const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                      const isSelected = post.votes?.some((v: any) => String(v.userId) === String(currentUserId) && v.option === option);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!currentUserId) {
                              alert(t.modals.needsLogin);
                              return;
                            }
                            onVotePoll(post.id, option);
                          }}
                          className="poll-option w-full relative cursor-pointer border-2 border-black h-12 overflow-hidden group/opt transition-transform active:scale-[0.98] outline-none"
                        >
                          {/* Progress Background */}
                          <div className="absolute inset-0 bg-[#F3E8FF]"></div>
                          <div 
                            className="absolute inset-x-0 inset-y-0 bg-[#7B61FF] border-r-2 border-black transition-all duration-700 ease-out" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                          
                          {/* Content */}
                          <div className="relative h-full flex items-center justify-between px-3 pointer-events-none">
                             <div className="flex items-center gap-2">
                               <div className={`w-5 h-5 border-2 border-black flex items-center justify-center ${isSelected ? 'bg-[#7B61FF]' : 'bg-white'}`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                               </div>
                               <span className={`text-[11px] font-black uppercase tracking-tight ${percentage > 50 ? 'text-white' : 'text-black'}`}>
                                 {option}
                               </span>
                             </div>
                             <span className={`text-[10px] font-black ${percentage > 90 ? 'text-white' : 'text-black'}`}>{percentage}%</span>
                          </div>
                        </button>
                      );
                    })}

                    {post.pollOptions.length > 2 && (
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onSelect(post.id); }}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-black bg-[#f2efff] text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest hover:bg-[#7B61FF] hover:text-white transition-all shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mb-2"
                      >
                        + {t.board.seeMore} {post.pollOptions.length - 2} {t.board.options}
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-4 mt-2">
                       <div className="text-[9px] font-black uppercase text-black/40 tracking-widest bg-black/5 px-2 py-1 border border-black/10">
                          {post.votes?.length || 0} {t.board.votes}
                       </div>
                    </div>
                  </div>
                ) : (
                  <p className={`font-body text-on-surface/70 mb-6 line-clamp-6 ${post.isPinned ? 'text-base' : 'text-xs'}`}>
                    {post.content}
                  </p>
                )}

            {post.link && (
              <div className="mt-2">
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 bg-[#118AB2] text-white px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000000] font-bold text-xs uppercase tracking-widest hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <LinkIcon size={14} />
                  {t.board.access}
                </a>
              </div>
            )}
            
            {/* Action Footer for Text Posts */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-black/10">
              <div className="flex items-center gap-2">
                <img src={post.author.image || "/default-avatar.png"} className="w-6 h-6 rounded-full border-2 border-black" />
                <span className="text-[10px] font-black uppercase tracking-tight">{post.author.name}</span>
              </div>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">
                {new Date(post.createdAt).toLocaleDateString(t.language === 'en' ? 'en-US' : 'vi-VN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PostCard.displayName = "PostCard";

export default PostCard;
