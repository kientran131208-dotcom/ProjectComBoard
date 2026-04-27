"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Grid,
  Megaphone,
  Handshake,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Calendar,
  Heart,
  Check,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Loader2,
  UserPlus,
  UserMinus,
  Share2,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Image as ImageIcon,
  Users,
  Zap,
  MessageSquare,
  Settings
} from "lucide-react";
import SearchPosts from "./SearchPosts";
import CreatePostModal from "./CreatePostModal";
import CreateZoneModal from "./CreateZoneModal";
import PostDetailModal from "./PostDetailModal";
import EditBoardModal from "../dashboard/EditBoardModal";
import { deletePost, updatePostTransform, togglePin, updatePost } from "@/lib/actions/post";
import { votePoll } from "@/lib/actions/poll";
import { createZone, updateZone, deleteZone } from "@/lib/actions/zone";
import { approveMember, rejectMember, updateMemberRole, kickMember } from "@/lib/actions/board";
import ZoneCard from "./ZoneCard";
import Minimap from "./Minimap";
import BoardChat from "./BoardChat";

import DirectChatModal from "../dashboard/DirectChatModal";
import { sendFriendRequest } from "@/lib/actions/friendship";
import { markMessagesAsRead } from "@/lib/actions/chat";
import { useLanguage } from "@/context/LanguageContext";




type Viewport = {
  x: number;
  y: number;
  scale: number;
};

import PostCard from "./PostCard";
import { markBoardNotificationsAsRead } from "@/lib/actions/notification";

export default function BoardClient({ board, currentUserId, friendIds = [] }: { board: any; currentUserId: string | null; friendIds?: string[] }) {
  const { t } = useLanguage();
  
  useEffect(() => {
    if (board.id) {
      markBoardNotificationsAsRead(board.id).catch(console.error);
    }
  }, [board.id]);

  const [activeTab, setActiveTab] = useState<"all" | "ANNOUNCEMENT" | "BORROWING" | "QNA">("all");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, canvasX: number, canvasY: number } | null>(null);
  const [postModalMode, setPostModalMode] = useState<"ANNOUNCEMENT" | "IMAGE" | "LINK" | "POLL">("ANNOUNCEMENT");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [selectedChatFriend, setSelectedChatFriend] = useState<any | null>(null);
  const [memberToKick, setMemberToKick] = useState<any | null>(null);
  
  
  // Optimistic State

  const [localPosts, setLocalPosts] = useState<any[]>(board.posts || []);
  const [localZones, setLocalZones] = useState<any[]>(board.zones || []);

  useEffect(() => {
    setLocalPosts(board.posts || []);
  }, [board.posts]);

  useEffect(() => {
    setLocalZones(board.zones || []);
  }, [board.zones]);
  
  // Icons & Assets
  const currentUser = board.members.find((m: any) => String(m.userId) === String(currentUserId))?.user;

  // Canvas State
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggingPostId, setDraggingPostId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const startMousePos = useRef({ x: 0, y: 0 });
  const isAdmin = board.members.some((m: any) => String(m.userId) === String(currentUserId) && m.role === "ADMIN");

  // Handle Pan
  const handleMouseDown = (e: React.PointerEvent) => {
    if (contextMenu) setContextMenu(null);
    if (e.button === 0) { // Left click
      const target = e.target as HTMLElement;
      // DO NOT PAN IF CLICKING A BUTTON OR AN INTERACTIVE ELEMENT
      if (target.closest('button')) return;
      
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      startMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const canvasX = (mouseX - viewport.x) / viewport.scale;
      const canvasY = (mouseY - viewport.y) / viewport.scale;

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        canvasX: canvasX - 150,
        canvasY: canvasY - 100
      });
    }
  };

  // Handle Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, viewport.scale * zoomFactor));

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dx = (mouseX - viewport.x) * (1 - zoomFactor);
      const dy = (mouseY - viewport.y) * (1 - zoomFactor);

      setViewport(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
        scale: newScale
      }));
    } else {
      setViewport(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };
  
  const handleNavigate = (worldX: number, worldY: number) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    setViewport(prev => ({
      ...prev,
      x: -worldX * prev.scale + screenW / 2,
      y: -worldY * prev.scale + screenH / 2,
    }));
  };

  const router = useRouter();

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleDelete = useCallback(async (postId: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deletePost(postId, board.id);
      setPostToDelete(null);
      router.refresh();
    } catch (error: any) {
      console.error("CLIENT: Delete error:", error);
      alert("Lỗi khi xóa bài viết: " + (error.message || ""));
    } finally {
      setIsDeleting(false);
    }
  }, [board.id, isDeleting, router]);

  const handleUpdateRole = async (targetUserId: string, newRole: "ADMIN" | "MEMBER") => {
    try {
      await updateMemberRole(board.id, targetUserId, newRole);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Lỗi khi cập nhật quyền.");
    }
  };

  const handleApprove = async (targetUserId: string) => {
    try {
      await approveMember(board.id, targetUserId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Lỗi khi phê duyệt.");
    }
  };

  const handleReject = async (targetUserId: string) => {
    if (!confirm("Từ chối yêu cầu tham gia của người này?")) return;
    try {
      const result: any = await rejectMember(board.id, targetUserId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Lỗi từ hệ thống: " + (result.error || "Không xác định"));
      }
    } catch (error: any) {
      alert(error.message || "Lỗi khi từ chối.");
    }
  };

  const handleKick = async (targetUserId: string, targetUserName: string) => {
    console.log("handleKick called for:", targetUserId, targetUserName);
    const confirmed = window.confirm(`Bạn có chắc chắn muốn kick "${targetUserName}" ra khỏi bảng này không?`);
    if (!confirmed) {
      console.log("Kick cancelled by user");
      return;
    }
    
    try {
      console.log("Attempting to kick via server action...");
      const result: any = await kickMember(board.id, targetUserId);
      console.log("Server response:", result);
      if (result.success) {
        router.refresh();
      } else {
        alert("Lỗi từ hệ thống: " + (result.error || "Không xác định"));
      }
    } catch (error: any) {
      console.error("Kick execution error:", error);
      alert("Lỗi thực thi: " + (error.message || "Lỗi không xác định"));
    }
  };

  const handleAddFriend = async (targetUserId: string) => {
    try {
      await sendFriendRequest(targetUserId);
      alert("Đã gửi lời mời kết bạn!");
    } catch (error: any) {
      alert(error.message || "Lỗi khi gửi lời mời kết bạn.");
    }
  };

  const handleOpenDirectChat = async (user: any) => {
    setSelectedChatFriend(user);
    try {
      await markMessagesAsRead(user.id);
      router.refresh();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };



  const handleDeleteBoard = async () => {
    if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ bảng này không? Hành động này không thể hoàn tác.")) return;
    try {
      const { deleteBoard } = await import("@/lib/actions/board");
      await deleteBoard(board.id);
    } catch (error: any) {
      alert("Lỗi khi xóa bảng: " + (error.message || ""));
    }
  };

  const handleUpdatePostTransform = useCallback(async (postId: string, transform: { x?: number, y?: number, rotation?: number, scale?: number }) => {
    // Optimistic Update
    setLocalPosts(prev => prev.map((p: any) => 
      p.id === postId ? { ...p, ...transform } : p
    ));

    try {
      await updatePostTransform(postId, board.id, transform);
    } catch (error) {
      console.error(error);
    }
  }, [board.id]);

  const handleTogglePin = useCallback(async (postId: string) => {
    // Optimistic Update
    setLocalPosts(prev => prev.map((p: any) => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));

    try {
      await togglePin(postId, board.id);
    } catch (error: any) {
      console.error(error);
    }
  }, [board.id]);

  const handleUpdatePost = useCallback(async (postId: string, data: { title?: string, content?: string, pollOptions?: string[], status?: "OPEN" | "IN_PROGRESS" | "DONE" }) => {
    // Optimistic Update
    setLocalPosts(prev => prev.map((p: any) => 
      p.id === postId ? { ...p, ...data } : p
    ));

    try {
      await updatePost(postId, board.id, data);
    } catch (error) {
      console.error(error);
    }
  }, [board.id]);

  const handleVotePoll = useCallback(async (postId: string, option: string) => {
    if (!currentUserId) return;

    // Optimistic Update
    setLocalPosts(prev => prev.map((p: any) => {
      if (p.id !== postId) return p;
      
      const newVotes = [...(p.votes || [])];
      const existingVoteIndex = newVotes.findIndex((v: any) => v.userId === currentUserId);
      
      if (existingVoteIndex !== -1) {
        if (newVotes[existingVoteIndex].option === option) {
          // Remove vote if clicking same option
          newVotes.splice(existingVoteIndex, 1);
        } else {
          // Change vote
          newVotes[existingVoteIndex] = { ...newVotes[existingVoteIndex], option };
        }
      } else {
        // Add new vote
        newVotes.push({ userId: currentUserId, option });
      }

      return { ...p, votes: newVotes };
    }));

    try {
      await votePoll(postId, board.id, option);
    } catch (error: any) {
      console.error(error);
      // Fallback
      toast.error(error.message || "Lỗi khi bình chọn");
      // Actually the useEffect will eventually sync it back from server
    }
  }, [board.id, currentUserId]);

  const handleCreateZone = () => {
    setClickPosition({
      x: (-viewport.x + window.innerWidth / 2) / viewport.scale - 200,
      y: (-viewport.y + window.innerHeight / 2) / viewport.scale - 200
    });
    setIsZoneModalOpen(true);
  };

  const handleUpdateZone = async (zoneId: string, data: any) => {
    // Optimistic Update
    setLocalZones(prev => prev.map((z: any) => 
      z.id === zoneId ? { ...z, ...data } : z
    ));
    
    try {
      await updateZone(zoneId, board.id, data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteZone = useCallback(async (zoneId: string) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    console.log("CLIENT: Actually deleting zone:", zoneId);
    try {
      await deleteZone(zoneId, board.id);
      setZoneToDelete(null);
      router.refresh();
    } catch (error: any) {
      console.error("CLIENT: Zone delete error:", error);
      alert(t.modals.error + ": " + (error.message || error));
    } finally {
      setIsDeleting(false);
    }
  }, [board.id, isDeleting, router]);

  const { approvedMembers, pendingRequests } = useMemo(() => {
    const approved = board.members.filter((m: any) => m.status === "APPROVED");
    const pending = board.members.filter((m: any) => m.status === "PENDING");
    return { approvedMembers: approved, pendingRequests: pending };
  }, [board.members]);

  const filteredPosts = useMemo(() => activeTab === "all"
    ? localPosts
    : localPosts.filter((p: any) => p.type === activeTab),
    [localPosts, activeTab]);

  const finalPosts = useMemo(() => {
    return [...filteredPosts].sort((a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return 1;
      if (!a.isPinned && b.isPinned) return -1;
      return 0;
    });
  }, [filteredPosts]);

  return (
    <div className="bg-[#FFF8F6] text-on-surface font-body h-screen w-screen overflow-hidden relative">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none z-0"></div>

      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 w-full absolute top-0 left-0 z-50 bg-white/80 backdrop-blur-md h-[64px] border-b-2 border-black">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-black text-[#F24236] italic tracking-tighter relative">
            ComBoard
            <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#F24236]" preserveAspectRatio="none" viewBox="0 0 100 10">
              <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </Link>
        </div>
        <div className="hidden md:block">
          <h1 className="font-headline font-semibold text-lg">{board.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-[#F24236] text-white font-headline font-bold text-sm px-4 py-2 neo-border neo-shadow-button hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1A1A2E] transition-all flex items-center gap-2" onClick={() => {
            setClickPosition({
              x: (-viewport.x + window.innerWidth / 2) / viewport.scale - 150,
              y: (-viewport.y + window.innerHeight / 2) / viewport.scale - 100
            });
            setIsPostModalOpen(true);
          }}>
            + {t.board.postAnnouncement}
          </button>

          {isAdmin && pendingRequests.length > 0 && (
            <button
              onClick={() => setIsRequestsModalOpen(true)}
              className="bg-[#FFE4E1] text-[#F24236] font-headline font-bold text-sm px-4 py-2 border-2 border-[#F24236] shadow-[4px_4px_0_0_#F24236] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all flex items-center gap-2 relative group"
            >
              <UserCog size={18} />
              {t.board.reviewRequests}
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#F24236] text-white text-[10px] rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                {pendingRequests.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="p-2 border-2 border-black hover:bg-zinc-50 transition-colors shadow-[2px_2px_0_0_#000000]"
            title={t.board.invite}
          >
            <UserPlus size={20} />
          </button>

          {isAdmin && (
            <button
              onClick={handleCreateZone}
              className="bg-white text-black font-headline font-bold text-sm px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all flex items-center gap-2"
            >
              + {t.board.createZone}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsEditBoardOpen(true)}
              className="p-2 border-2 border-black hover:bg-zinc-50 transition-colors shadow-[2px_2px_0_0_#000000]"
              title={t.board.edit}
            >
              <Settings size={20} />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleDeleteBoard}
              className="p-2 border-2 border-black hover:bg-red-50 text-[#b71212] transition-colors shadow-[2px_2px_0_0_#000000]"
              title={t.board.deleteBoard}
            >
              <Trash2 size={20} />
            </button>
          )}
          
          <div className="flex items-center -space-x-2 mr-2">
            {board.members.slice(0, 3).map((member: any) => (
              <div 
                key={member.id} 
                className="w-8 h-8 rounded-full border-2 border-black bg-white overflow-hidden"
              >
                {member.user.image ? (
                  <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase">
                    {member.user.name?.charAt(0)}
                  </div>
                )}
              </div>
            ))}
            {board.members.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-black bg-[#FFD166] flex items-center justify-center text-[10px] font-bold">
                +{board.members.length - 3}
              </div>
            )}
          <div className="flex items-center gap-2 border-l-2 border-black ml-2 pl-4">
            <SearchPosts 
              posts={localPosts}
              onNavigate={handleNavigate}
              onSelectPost={setSelectedPostId}
            />
            
            <button 
              onClick={() => setIsMembersModalOpen(true)}
              className="w-9 h-9 bg-white border-2 border-black flex items-center justify-center hover:bg-slate-50 transition-colors shadow-[2px_2px_0_0_#000000] relative group"
              title={t.board.memberList}
            >
              <Users size={18} />
              {isAdmin && pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F24236] rounded-full border border-white"></span>
              )}
            </button>
          </div>
          </div>

          <div className="w-10 h-10 rounded-full neo-border overflow-hidden bg-white">
            {currentUser?.image ? (
              <img alt="User" className="w-full h-full object-cover" src={currentUser.image} />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold bg-[#06D6A0] text-white">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <nav className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40 bg-white w-20 border-2 border-black py-8 shadow-[4px_4px_0px_#1A1A2E]">
        <button onClick={() => setActiveTab("all")} className={`border-2 border-black p-3 group relative ${activeTab === 'all' ? 'bg-[#F24236] text-white' : 'text-black'}`}>
          <Grid size={24} />
        </button>
        <button onClick={() => setActiveTab("ANNOUNCEMENT")} className={`p-3 border-none group relative ${activeTab === 'ANNOUNCEMENT' ? 'text-[#FFB627]' : 'text-black opacity-30 hover:opacity-100'}`}>
          <Megaphone size={24} />
        </button>
        <button onClick={() => setActiveTab("BORROWING")} className={`p-3 border-none group relative ${activeTab === 'BORROWING' ? 'text-[#06D6A0]' : 'text-black opacity-30 hover:opacity-100'}`}>
          <Handshake size={24} />
        </button>
        <button onClick={() => setActiveTab("QNA")} className={`p-3 border-none group relative ${activeTab === 'QNA' ? 'text-[#118AB2]' : 'text-black opacity-30 hover:opacity-100'}`}>
          <MessageCircle size={24} />
        </button>
      </nav>

      {/* Canvas Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white neo-border px-6 py-3 shadow-[4px_4px_0_0_#000000]">
        <button onClick={() => setViewport(v => ({ ...v, scale: Math.max(0.1, v.scale - 0.1) }))} className="p-2 hover:bg-slate-100"><ZoomOut size={20} /></button>
        <div className="font-bold text-sm w-16 text-center">{Math.round(viewport.scale * 100)}%</div>
        <button onClick={() => setViewport(v => ({ ...v, scale: Math.min(5, v.scale + 0.1) }))} className="p-2 hover:bg-slate-100"><ZoomIn size={20} /></button>
        <div className="w-[1px] h-6 bg-black/10 mx-2"></div>
        <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} className="p-2 hover:bg-slate-100" title="Reset View"><Maximize size={20} /></button>
        <div className="text-[10px] font-bold text-black/40 ml-4 uppercase tracking-widest hidden md:block">{t.board.panningHint}</div>
      </div>

      {/* Interactive Canvas */}
      <div 
        ref={containerRef}
        className={`w-full h-full outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handleMouseDown}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        tabIndex={0}
      >
        <div
          ref={canvasRef}
          style={{
            transformOrigin: '0 0',
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            willChange: 'transform'
          }}
          className="relative"
        >
          {/* Render Zones first so they are behind posts */}
          {localZones?.map((zone: any) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              isAdmin={isAdmin}
              viewportScale={viewport.scale}
              onDelete={() => setZoneToDelete(zone.id)}
              onUpdate={handleUpdateZone}
            />
          ))}

          {finalPosts.map((post: any, index: number) => (
            <PostCard
              key={post.id}
              post={post}
              index={index}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              viewportScale={viewport.scale}
              onDelete={setPostToDelete}
              onSelect={setSelectedPostId}
              onTogglePin={handleTogglePin}
              onUpdateTransform={handleUpdatePostTransform}
              onUpdatePost={handleUpdatePost}
              onVotePoll={handleVotePoll}
            />
          ))}
        </div>
      </div>

      {/* Minimap Component */}
      <Minimap 
        posts={localPosts}
        zones={localZones}
        viewport={viewport}
        onNavigate={handleNavigate}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={(success) => {
          setIsPostModalOpen(false);
          if (success === true) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }
        }}
        boardId={board.id}
        initialX={clickPosition.x}
        initialY={clickPosition.y}
        mode={postModalMode}
      />

      <CreateZoneModal
        isOpen={isZoneModalOpen}
        onClose={(success) => {
          setIsZoneModalOpen(false);
          if (success === true) {
            router.refresh();
          }
        }}
        boardId={board.id}
        initialX={clickPosition.x}
        initialY={clickPosition.y}
      />

      {/* Custom Zone Delete Confirmation Modal */}
      {zoneToDelete && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0_0_#000000] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-6 font-headline font-bold text-2xl uppercase">
              <Trash2 size={32} />
              <span>{t.modals.confirmDelete} Zone</span>
            </div>
            
            <p className="font-body text-lg mb-8 text-on-surface">
              {t.modals.deleteWarning}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setZoneToDelete(null)}
                disabled={isDeleting}
                className="py-3 px-6 border-2 border-black font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {t.modals.cancel}
              </button>
              <button
                onClick={() => handleDeleteZone(zoneToDelete)}
                disabled={isDeleting}
                className="py-3 px-6 bg-red-500 text-white border-2 border-black font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000000] hover:bg-red-600 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  t.modals.deleteZone
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-sm w-full shadow-[8px_8px_0_0_#000000] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">{t.modals.inviteTitle}</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm font-medium text-[#5a5971] mb-6">
              {t.modals.inviteDesc} <strong>{board.name}</strong>.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 mb-1 block">{t.modals.inviteCode}</label>
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-100 border-2 border-black px-4 py-2 font-mono font-bold text-lg flex-1">
                    {board.inviteCode}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/invite/${board.inviteCode}`;
                  navigator.clipboard.writeText(url);
                  alert(t.modals.copied);
                }}
                className="w-full bg-[#f9cc61] border-2 border-black py-3 font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                {t.modals.copyLink}
              </button>
            </div>
          </div>
        </div>
      )}

      <PostDetailModal 
        isOpen={!!selectedPostId}
        post={localPosts.find((p: any) => p.id === selectedPostId)}
        boardId={board.id}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onDelete={setPostToDelete}
        onTogglePin={handleTogglePin}
        onUpdatePost={handleUpdatePost}
        onClose={() => setSelectedPostId(null)}
      />

      {/* Custom Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0_0_#000000] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-red-600 mb-6 font-headline font-bold text-2xl uppercase">
              <Trash2 size={32} />
              <span>{t.modals.confirmDelete}</span>
            </div>
            
            <p className="font-body text-lg mb-8 text-on-surface">
              {t.modals.deleteWarning}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="py-3 px-6 border-2 border-black font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {t.modals.cancel}
              </button>
              <button
                onClick={() => handleDelete(postToDelete)}
                disabled={isDeleting}
                className="py-3 px-6 bg-red-500 text-white border-2 border-black font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000000] hover:bg-red-600 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  t.modals.deletePost
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Kick Confirmation Modal */}
      {memberToKick && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0_0_#F24236] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-[#F24236] mb-6 font-headline font-bold text-2xl uppercase tracking-tighter">
              <UserMinus size={32} />
              <span>{t.board.actions.kickTitle}</span>
            </div>
            
            <p className="font-body text-lg mb-8 text-on-surface">
              {t.board.actions.kickConfirm.replace('{name}', memberToKick.user.name)}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMemberToKick(null)}
                disabled={isDeleting}
                className="py-3 px-6 border-2 border-black font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {t.modals.cancel}
              </button>
              <button
                onClick={async () => {
                   setIsDeleting(true);
                   try {
                     const result: any = await kickMember(board.id, memberToKick.userId);
                     if (result.success) {
                       setMemberToKick(null);
                       router.refresh();
                     } else {
                       alert("Lỗi: " + (result.error || "Không xác định"));
                     }
                   } catch (error: any) {
                     alert("Lỗi kết nối: " + error.message);
                   } finally {
                     setIsDeleting(false);
                   }
                }}
                disabled={isDeleting}
                className="py-3 px-6 bg-[#F24236] text-white border-2 border-black font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000000] hover:bg-[#d0352b] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  t.board.actions.kickButton
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Sidebar (Right Drawer) */}
      <div className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${isMembersModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMembersModalOpen(false)} />
        <div className={`absolute top-0 right-0 h-screen w-full max-w-[420px] bg-white border-l-4 border-black shadow-[-8px_0_0_0_#000000] transition-transform duration-300 ease-in-out transform ${isMembersModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-black/10">
              <div className="flex items-center gap-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">{t.board.memberSidebar.title} ({approvedMembers.length})</h2>
                {isAdmin && pendingRequests.length > 0 && (
                   <span className="bg-cb-red text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-black animate-pulse">
                      {pendingRequests.length} {t.board.memberSidebar.requests}
                   </span>
                )}
              </div>
              <button 
                onClick={() => setIsMembersModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full border-2 border-transparent hover:border-black transition-all"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {/* Requests Section (Admin ONLY) */}
              {isAdmin && pendingRequests.length > 0 && (
                <div className="mb-10 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-cb-red tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-2 bg-cb-red rounded-full animate-pulse"></div>
                    {t.board.memberSidebar.pendingTitle} ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((req: any) => (
                      <div key={req.id} className="bg-cb-yellow/10 border-2 border-dashed border-cb-yellow p-4 rounded-xl flex items-center justify-between group">
                         <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shrink-0">
                               <img src={req.user.image || `https://ui-avatars.com/api/?name=${req.user.name}`} alt="avatar" />
                            </div>
                            <div className="min-w-0">
                               <h4 className="font-bold text-xs truncate leading-tight">{req.user.name}</h4>
                               <p className="text-[8px] font-medium text-cb-navy/50 truncate">{req.user.email}</p>
                            </div>
                         </div>
                         <div className="flex gap-1 shrink-0">
                            <button 
                              onClick={() => handleReject(req.userId)}
                              className="w-8 h-8 border-2 border-black rounded-lg flex items-center justify-center hover:bg-red-50 text-cb-red transition-all"
                              title="Từ chối"
                            >
                              <X size={14} />
                            </button>
                            <button 
                              onClick={() => handleApprove(req.userId)}
                              className="h-8 bg-[#06D6A0] px-3 border-2 border-black rounded-lg flex items-center justify-center text-white font-black text-[9px] uppercase shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                            >
                              Chấp nhận
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-b-2 border-black/5 pt-2"></div>
                </div>
              )}

              {/* Members Section */}

              {approvedMembers.map((member: any) => {
                const isMemberMe = String(member.userId) === String(currentUserId);
                return (
                  <div 
                    key={member.id} 
                    className={`flex items-center gap-3 p-3 border-2 border-black transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#000000] ${isMemberMe ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                      {member.user.image ? (
                        <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xl font-bold ${isMemberMe ? 'bg-[#06D6A0] text-white' : 'bg-slate-100'}`}>
                          {member.user.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-headline font-bold text-sm flex items-center flex-wrap gap-1.5">
                        <span className="truncate max-w-[100px]">{member.user.name}</span>
                        {isMemberMe && <span className="shrink-0 bg-black text-white text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{t.board.roles.me}</span>}
                        {friendIds.includes(member.userId) && <span className="shrink-0 text-[#06D6A0]/40 text-[6px] font-black uppercase tracking-tighter">{t.board.roles.friend}</span>}
                        <div className={`shrink-0 text-[7px] font-black uppercase tracking-tight
                          ${member.userId === board.creatorId ? 'bg-[#F24236] text-white border border-black px-1.5 py-0.5' : member.role === 'ADMIN' ? 'bg-[#FFD166] text-black border border-black px-1.5 py-0.5' : 'bg-transparent text-zinc-400 scale-95'}`}>
                          {member.userId === board.creatorId ? t.board.roles.owner : member.role === 'ADMIN' ? t.board.roles.admin : t.board.roles.resident}
                        </div>
                      </div>
                      <p className="text-[10px] text-on-surface/50 font-body truncate">{member.user.email}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 ml-auto">
                      {/* Friend Action */}
                      {!isMemberMe && !friendIds.includes(member.userId) && (
                        <button 
                          onClick={() => handleAddFriend(member.userId)}
                          className="p-1.5 border-2 border-transparent hover:border-black hover:bg-[#06D6A0] text-zinc-400 hover:text-white transition-all group/friend"
                          title={t.board.actions.addFriend}
                        >
                          <UserPlus className="group-hover/friend:scale-110 transition-transform" size={16} />
                        </button>
                      )}

                      {!isMemberMe && (
                        <button 
                          onClick={() => handleOpenDirectChat(member.user)}
                          className="p-1.5 border-2 border-transparent hover:border-black hover:bg-cb-navy text-zinc-400 hover:text-white transition-all group/chat"
                          title={t.board.actions.message}
                        >
                          <MessageSquare className="group-hover/chat:scale-110 transition-transform" size={16} />
                        </button>
                      )}

                      {/* Role Management & Kick Actions (Admin Only) */}
                      {isAdmin && !isMemberMe && (
                        <>
                          {/* Protect the creator from being kicked/demoted by other admins */}
                          {member.userId !== board.creatorId && (
                            <>
                              {member.role === 'MEMBER' ? (
                                <button 
                                  onClick={() => handleUpdateRole(member.userId, 'ADMIN')}
                                  className="p-1.5 border-2 border-transparent hover:border-black hover:bg-[#FFD166] text-zinc-400 hover:text-black transition-all group/role"
                                  title={t.board.actions.promoteAdmin}
                                >
                                  <Shield className="group-hover/role:scale-110 transition-transform" size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateRole(member.userId, 'MEMBER')}
                                  className="p-1.5 border-2 border-transparent hover:border-black hover:bg-red-50 text-[#FFD166] hover:text-red-500 transition-all group/role"
                                  title={t.board.actions.demoteAdmin}
                                >
                                  <ShieldAlert className="group-hover/role:scale-110 transition-transform" size={16} />
                                </button>
                              )}
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMemberToKick(member);
                                }}
                                className="p-1.5 border-2 border-transparent hover:border-black hover:bg-[#F24236] text-zinc-400 hover:text-white transition-all group/kick"
                                title={t.board.actions.kick}
                              >
                                <UserMinus className="group-hover/kick:scale-110 transition-transform" size={16} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-black/10">
              <div className="p-4 bg-[#FFD166]/10 border-2 border-black border-dashed">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface mb-2 uppercase">
                  <Megaphone size={14} />
                  {t.board.memberSidebar.adminNotice}
                </div>
                <p className="text-[10px] text-on-surface/70 leading-relaxed font-body">
                  {t.board.memberSidebar.adminNoticeDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-[#00D094] border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#000000] flex items-center gap-2 animate-bounce">
          <Check size={20} className="text-white" />
          <span className="font-bold text-white text-sm">{t.board.actions.postSuccess}</span>
        </div>
      )}

      {/* Requests Modal (Separate Section) */}
      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-lg w-full shadow-[12px_12px_0_0_#F24236] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F24236] text-white flex items-center justify-center border-2 border-black rotate-3">
                  <UserCog size={24} />
                </div>
                <h2 className="font-headline font-black text-2xl uppercase tracking-tighter">{t.board.memberSidebar.pendingTitle}</h2>
              </div>
              <button onClick={() => setIsRequestsModalOpen(false)} className="border-2 border-black p-1 hover:bg-zinc-50">
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-5xl mb-4 opacity-30">✨</div>
                  <p className="font-bold text-[#5a5971]">{t.board.memberSidebar.noRequests}</p>
                </div>
              ) : (
                pendingRequests.map((request: any) => (
                  <div 
                    key={request.id} 
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-black bg-[#FFFCE4] shadow-[4px_4px_0_0_#000000]"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-black bg-white overflow-hidden shrink-0">
                      {request.user.image ? (
                        <img src={request.user.image} alt={request.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-slate-100">
                          {request.user.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="font-headline font-bold text-lg truncate">{request.user.name}</div>
                      <p className="text-xs text-zinc-500 truncate mb-2">{request.user.email}</p>
                      <div className="text-[10px] font-black uppercase text-[#F24236] bg-[#F24236]/5 inline-block px-2 py-0.5 border border-[#F24236]/20">
                        Chờ duyệt • {new Date(request.joinedAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleApprove(request.userId)}
                        className="flex-1 sm:flex-none bg-[#06D6A0] text-white border-2 border-black px-4 py-2 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                      >
                        {t.board.actions.approve}
                      </button>
                      <button 
                        onClick={() => handleReject(request.userId)}
                        className="flex-1 sm:flex-none bg-white text-black border-2 border-black px-4 py-2 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                      >
                        {t.board.actions.reject}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-dashed border-black/10 text-center">
              <button 
                onClick={() => setIsRequestsModalOpen(false)}
                className="w-full py-3 bg-black text-white font-black uppercase tracking-widest text-sm hover:bg-[#2d2d42] transition-colors"
              >
                  {t.modals.close}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[1000] bg-white border-2 border-black shadow-[4px_4px_0_0_#000000] p-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="border-b-2 border-black pb-2 mb-1 px-4 py-2 bg-[#f2efff]">
             <span className="text-[10px] font-black uppercase tracking-widest text-[#5a5971]">{t.board.contextMenu.title}</span>
          </div>
          <button 
            onClick={() => {
              setClickPosition({ x: contextMenu.canvasX, y: contextMenu.canvasY });
              setPostModalMode("ANNOUNCEMENT");
              setIsPostModalOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[#F24236] hover:text-white transition-colors text-left"
          >
            <Megaphone size={16} />
            {t.board.contextMenu.postAnnouncement}
          </button>
          <button 
            onClick={() => {
              setClickPosition({ x: contextMenu.canvasX, y: contextMenu.canvasY });
              setPostModalMode("IMAGE");
              setIsPostModalOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[#06D6A0] hover:text-white transition-colors text-left"
          >
            <ImageIcon size={16} />
            {t.board.contextMenu.postImage}
          </button>
          <button 
            onClick={() => {
              setClickPosition({ x: contextMenu.canvasX, y: contextMenu.canvasY });
              setPostModalMode("LINK");
              setIsPostModalOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[#118AB2] hover:text-white transition-colors text-left"
          >
            <Share2 size={16} />
            {t.board.contextMenu.postLink}
          </button>
          <button 
            onClick={() => {
              setClickPosition({ x: contextMenu.canvasX, y: contextMenu.canvasY });
              setPostModalMode("POLL");
              setIsPostModalOpen(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[#FFD166] hover:text-black transition-colors text-left"
          >
            <Zap size={16} />
            {t.board.contextMenu.createPoll}
          </button>
          {isAdmin && (
            <>
              <div className="h-[2px] bg-black/10 my-1"></div>
              <button 
                onClick={() => {
                  setClickPosition({ x: contextMenu.canvasX, y: contextMenu.canvasY });
                  setIsZoneModalOpen(true);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-[#FFD166] hover:text-white transition-colors text-left"
              >
                <Maximize size={16} />
                {t.board.contextMenu.createZone}
              </button>
            </>
          )}
        </div>
      )}

      <BoardChat 
        boardId={board.id} 
        boardName={board.name} 
        members={board.members}
        currentUserId={currentUserId}
      />

      {selectedChatFriend && (
        <DirectChatModal 
          isOpen={!!selectedChatFriend}
          onClose={() => setSelectedChatFriend(null)}
          friend={selectedChatFriend}
          currentUserId={currentUserId || ""}
        />
      )}
      {/* Edit Board Modal */}
      <EditBoardModal 
        isOpen={isEditBoardOpen}
        onClose={() => setIsEditBoardOpen(false)}
        board={board}
      />
    </div>
  );
}
