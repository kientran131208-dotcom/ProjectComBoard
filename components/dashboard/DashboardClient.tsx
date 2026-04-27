"use client";


import { useState } from "react";
import Link from "next/link";
import CreateBoardModal from "./CreateBoardModal";
import EditBoardModal from "./EditBoardModal";
import { deleteBoard, joinBoard, leaveBoard } from "@/lib/actions/board";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Icons = {
  add: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
    </svg>
  ),
  arrowForward: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
    </svg>
  ),
  leave: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3H7C5.89 3 5 3.89 5 5V9H7V5H13V19H7V15H5V19C5 20.11 5.89 21 7 21H13C14.11 21 15 20.11 15 19V5C15 3.89 14.11 3 13 3Z" fill="currentColor"/>
      <path d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59Z" fill="currentColor"/>
    </svg>
  ),
  x: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
    </svg>
  ),
  group: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
    </svg>
  )
};

export default function DashboardClient({ 
  userName, 
  displayBoards, 
  publicBoards,
  pendingBoards = [],
  unreadCounts = {}
}: { 
  userName: string; 
  displayBoards: any[]; 
  publicBoards: any[];
  pendingBoards?: any[];
  unreadCounts?: Record<string, number>;
}) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{id: string, name: string} | null>(null);
  const [boardToLeave, setBoardToLeave] = useState<{id: string, name: string} | null>(null);
  const [isLeaving, setIsLeaving] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [boardToEdit, setBoardToEdit] = useState<any | null>(null);
  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const router = useRouter();

  const filteredPublicBoards = publicBoards.filter((board: any) => 
    board.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) ||
    board.description?.toLowerCase().includes(publicSearchQuery.toLowerCase())
  );

  const adminBoards = displayBoards.filter((board: any) => board.members?.[0]?.role === "ADMIN");


  const handleJoinBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    try {
      const board = await joinBoard(inviteCode.trim());
      // Check if user is actually approved (needed if board.approvalRequired is true)
      const membership = board.members?.find((m: any) => m.userId === board.currentUserId); 
      // Wait, joinBoard returns the board but doesn't necessarily include the new membership in the return object in a way we can trust without re-querying or checking the action's logic.
      // Actually, joinBoard in board.ts returns the board. 
      // I'll update joinBoard to return { board, membership } or just use router.refresh() and let the dashboard handle it.
      
      router.refresh();
      setInviteCode("");
      alert(t.dashboard.page.joinHint);
    } catch (error: any) {
      alert(error.message || t.dashboard.page.enterCode);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinPublic = async (inviteCode: string) => {
    setIsJoining(true);
    try {
      const board = await joinBoard(inviteCode);
      router.refresh();
      alert(t.dashboard.page.joinHint);
    } catch (error: any) {
      alert(error.message || t.modals.error);
    } finally {
      setIsJoining(false);
    }
  };


  const confirmDelete = async () => {
    if (!boardToDelete) return;

    setIsDeleting(boardToDelete.id);
    try {
      await deleteBoard(boardToDelete.id);
      setBoardToDelete(null);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || t.modals.error);
    } finally {
      setIsDeleting(null);
    }
  };

  const confirmLeave = async () => {
    if (!boardToLeave) return;

    setIsLeaving(boardToLeave.id);
    try {
      await leaveBoard(boardToLeave.id);
      setBoardToLeave(null);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      setErrorToast(error.message || t.modals.error);
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsLeaving(null);
    }
  };

  return (
    <main className="font-body">
      {/* Hero Banner */}
      <section className="bg-[#1A1A2E] rounded-xl border-2 border-black p-8 relative overflow-hidden mb-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center min-h-[160px]">
        {/* Decorative Memphis Shapes */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#f9cc61] rounded-full border-2 border-black opacity-80 mix-blend-screen"></div>
        <div className="absolute right-32 top-8 w-0 h-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-[#F24236] border-r-[30px] border-r-transparent transform rotate-12 opacity-90"></div>
        <div className="absolute left-1/2 top-0 w-32 h-full memphis-pattern-dots opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl text-left">
          <h2 className="font-headline font-bold text-3xl md:text-4xl text-white mb-2">{t.dashboard.page.greeting}, {userName || t.auth.defaultUser}! 👋</h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-body text-[15px] text-white/70">
              {t.dashboard.page.inCommunity} {displayBoards.length} {t.dashboard.page.citizens}.
            </p>
            <Link href="/profile" className="text-[10px] font-black uppercase tracking-widest bg-[#F24236] text-white px-2 py-1 border border-white/20 rounded hover:bg-white hover:text-black transition-all shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]">
              {t.dashboard.page.viewProfileShort}
            </Link>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 md:mt-0 self-end md:self-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F24236] border-2 border-white rounded-lg w-12 h-12 flex items-center justify-center text-white transition-all active:translate-x-[2px] active:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none hover:bg-[#d0352c]"
          >
            {Icons.add}
          </button>
        </div>
      </section>

      {/* Join & Create Actions Hub */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join Section */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#f9cc61] rounded-xl">
          <h3 className="font-headline font-black text-lg uppercase mb-4 flex items-center gap-2">
            <span className="text-2xl">🎟️</span> {t.dashboard.page.joinWithCode}
          </h3>
          <form onSubmit={handleJoinBoard} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder={t.dashboard.page.enterCode}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 h-12 px-4 bg-[#f2efff] border-2 border-black rounded-md font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#000000] transition-all"
            />
            <button 
              type="submit"
              disabled={isJoining || !inviteCode}
              className="px-8 h-12 bg-[#F24236] border-2 border-black rounded-md text-white font-bold shadow-[4px_4px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center disabled:opacity-50 whitespace-nowrap min-w-[120px]"
            >
              {isJoining ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : t.dashboard.page.join}
            </button>
          </form>
          <p className="text-[10px] font-bold text-zinc-400 mt-3 px-1 uppercase tracking-wider">
            {t.dashboard.page.joinHint}
          </p>
        </div>

        {/* Create Section Preview */}
        <div className="bg-[#b71212] border-4 border-black p-6 shadow-[8px_8px_0_0_#000000] rounded-xl flex items-center justify-between group cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <div>
            <h3 className="font-headline font-black text-lg uppercase mb-1 text-white">{t.dashboard.page.createCommunity}</h3>
            <p className="text-white/70 text-xs font-medium">{t.dashboard.page.createHint}</p>
          </div>
          <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-[4px_4px_0_0_#2d2d42]">
            {Icons.add}
          </div>
        </div>
      </section>

      {/* Admin Boards Section */}
      {adminBoards.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#FFD166] border-2 border-black flex items-center justify-center text-xl shadow-[4px_4px_0_0_#000000] rotate-3">👑</div>
            <h3 className="font-headline font-black text-2xl uppercase tracking-tight relative inline-block">
              {t.dashboard.page.managedCommunities}
              <div className="absolute bottom-1 left-0 w-full h-3 bg-[#FFD166] -z-10 transform -skew-x-12"></div>
            </h3>
            <span className="bg-black text-white px-2 py-0.5 text-xs font-bold rounded">{adminBoards.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminBoards.map((board) => (
              <article key={board.id} className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#FFD166] flex flex-col group relative transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#FFD166]">
                {/* Notification Badge */}
                {unreadCounts[board.id] > 0 && (
                  <div className="absolute -top-3 -left-3 z-50 min-w-[28px] h-[28px] bg-[#F24236] text-white text-[14px] font-black rounded-full flex items-center justify-center px-1 border-2 border-black shadow-[3px_3px_0_0_#000] animate-bounce-subtle">
                    {unreadCounts[board.id]}
                  </div>
                )}
                <div 
                  className="absolute top-0 right-0 w-10 h-10 border-l-2 border-b-2 border-black rounded-bl-lg z-10 flex items-center justify-center bg-white shadow-[-2px_2px_0_0_#000]"
                  title="Quyền Quản trị viên"
                >
                  <span className="text-lg">👑</span>
                </div>
                
                <div 
                  className={`h-24 border-b-2 border-black ${board.pattern || 'memphis-pattern-zigzag'} flex items-center justify-center text-5xl rounded-t-[10px] overflow-hidden`}
                  style={{ backgroundColor: board.color ? board.color + '22' : '#FFD16622' }}
                >
                  {board.image ? (
                    <img src={board.image} alt={board.name} className="w-full h-full object-cover" />
                  ) : (
                    board.emoji || "🏢"
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-headline font-bold text-xl text-[#2d2d42] leading-tight group-hover:text-[#F24236] transition-colors line-clamp-1 truncate">{board.name}</h4>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setBoardToLeave({ id: board.id, name: board.name });
                        }}
                        disabled={isLeaving === board.id}
                        className="p-2 text-[#5a5971] hover:text-orange-600 hover:bg-orange-50 border-2 border-transparent hover:border-black transition-all disabled:opacity-50"
                        title="Rời khỏi bảng"
                      >
                        {isLeaving === board.id ? (
                           <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : Icons.leave}
                      </button>

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setBoardToEdit(board);
                        }}
                        className="p-2 text-[#5a5971] hover:text-[#2d2d42] hover:bg-slate-50 border-2 border-transparent hover:border-black transition-all"
                        title={t.board.edit}
                      >
                        {Icons.settings}
                      </button>

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setBoardToDelete({ id: board.id, name: board.name });
                        }}
                        disabled={isDeleting === board.id}
                        className="p-2 text-[#5a5971] hover:text-[#b71212] hover:bg-red-50 border-2 border-transparent hover:border-black transition-all disabled:opacity-50"
                        title="Xóa bảng (Admin)"
                      >
                        {isDeleting === board.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : Icons.trash}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase border-2 border-black bg-black text-white shadow-[2px_2px_0_0_#FFD166]">
                      {t.dashboard.page.admin}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase border-2 border-black ${board.statusColor || 'bg-[#45f2b9] text-[#00563e]'}`}>
                      {board.status || t.dashboard.page.active}
                    </span>
                  </div>

                  <p className="font-body text-sm text-[#5a5971] mb-6 line-clamp-2 flex-grow h-[40px] font-medium leading-relaxed">
                    {board.description || t.dashboard.page.createHint}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-[#2d2d42] mb-6 mt-auto">
                    <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded border border-black/10">
                      <span className="opacity-50">👥</span> {board._count.members} {t.dashboard.page.citizens}
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded border border-black/10">
                      <span className="opacity-50">📝</span> {board._count.posts || 0} {t.dashboard.page.postsShort}
                    </div>
                  </div>
                  
                  <Link href={`/board/${board.id}`} className="w-full bg-[#1A1A2E] border-2 border-black rounded-lg py-3 px-4 text-white font-headline font-bold text-sm shadow-[4px_4px_0px_#000000] transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#2d2d42]">
                    {t.dashboard.page.manageBoard}
                    <span>{Icons.arrowForward}</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Boards Section */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <h3 className="font-headline font-black text-2xl uppercase tracking-tight relative inline-block">
            {t.dashboard.page.myCommunities}
            <div className="absolute bottom-1 left-0 w-full h-3 bg-[#f9cc61] -z-10 transform -skew-x-12"></div>
          </h3>
          <span className="bg-black text-white px-2 py-0.5 text-xs font-bold rounded">{displayBoards.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBoards.length === 0 ? (
             <div className="col-span-full py-20 bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000000] flex flex-col items-center justify-center text-center px-6 transition-all hover:shadow-[12px_12px_0px_#000000]">
                <div className="w-20 h-20 bg-[#f9cc61] border-2 border-black rounded-full flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000000] mb-6 transform -rotate-6">🏙️</div>
                <h4 className="font-headline font-bold text-2xl mb-2 text-[#2d2d42]">{t.dashboard.page.noBoardsTitle}</h4>
                <p className="text-[#5a5971] mb-8 font-medium max-w-sm">{t.dashboard.page.noBoardsDesc}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-8">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="h-14 bg-[#b71212] border-2 border-black rounded-md text-white font-bold shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 px-8 whitespace-nowrap"
                  >
                    <span>{Icons.add}</span> {t.header.createBoard}
                  </button>
                  
                  <form onSubmit={handleJoinBoard} className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      placeholder={t.dashboard.page.enterCode}
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="flex-1 h-14 px-4 bg-[#f2efff] border-2 border-black rounded-md font-bold focus:outline-none focus:shadow-[4px_4px_0px_#000000] transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={isJoining || !inviteCode}
                      className="px-8 h-14 bg-[#f9cc61] border-2 border-black rounded-md text-[#2d2d42] font-bold shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center disabled:opacity-50 whitespace-nowrap min-w-fit"
                    >
                      {isJoining ? "..." : t.dashboard.page.enter}
                    </button>
                  </form>
                </div>

                <div className="p-4 bg-[#e8e5ff] border-2 border-black border-dashed rounded-lg max-w-sm">
                  <p className="text-[10px] font-bold text-[#2d2d42] leading-tight flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    {t.dashboard.page.tip}
                  </p>
                </div>
             </div>
          ) : (
            displayBoards.map((board) => (
              <article key={board.id} className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#1A1A2E] flex flex-col group relative transition-all hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#1A1A2E]">
                {/* Notification Badge */}
                {unreadCounts[board.id] > 0 && (
                  <div className="absolute -top-3 -left-3 z-50 min-w-[28px] h-[28px] bg-[#F24236] text-white text-[14px] font-black rounded-full flex items-center justify-center px-1 border-2 border-black shadow-[3px_3px_0_0_#000] animate-bounce-subtle">
                    {unreadCounts[board.id]}
                  </div>
                )}
                <div 
                  className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-black rounded-bl-lg z-10 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: board.id.startsWith('dummy') ? (board.id === 'dummy-1' ? '#00694c' : (board.id === 'dummy-2' ? '#f9cc61' : '#b71212')) : (board.color || '#F24236') }}
                >
                  {board.members?.[0]?.role === "ADMIN" && <span className="text-xs" title="Quản trị viên">👑</span>}
                </div>
                
                <div 
                  className={`h-20 border-b-2 border-black ${board.pattern || 'memphis-pattern-zigzag'} flex items-center justify-center text-4xl rounded-t-[10px] overflow-hidden`}
                  style={{ backgroundColor: board.id.startsWith('dummy') ? (board.id === 'dummy-1' ? '#f9cc61' : (board.id === 'dummy-2' ? '#45f2b9' : '#118AB2')) : (board.color + '44') }}
                >
                  {board.image ? (
                    <img src={board.image} alt={board.name} className="w-full h-full object-cover" />
                  ) : (
                    board.emoji
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-headline font-bold text-lg text-[#2d2d42] leading-tight group-hover:text-[#F24236] transition-colors line-clamp-1 truncate">{board.name}</h4>
                    
                    {/* Admin/Member Actions */}
                    {!board.id.startsWith('dummy') && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setBoardToLeave({ id: board.id, name: board.name });
                          }}
                          disabled={isLeaving === board.id}
                          className="p-1.5 text-[#5a5971] hover:text-orange-600 hover:bg-orange-50 border-2 border-transparent hover:border-black transition-all disabled:opacity-50"
                          title="Rời khỏi bảng"
                        >
                          {isLeaving === board.id ? (
                             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : Icons.leave}
                        </button>

                        {board.members?.[0]?.role === "ADMIN" && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setBoardToDelete({ id: board.id, name: board.name });
                            }}
                            disabled={isDeleting === board.id}
                            className="p-1.5 text-[#5a5971] hover:text-[#b71212] hover:bg-red-50 border-2 border-transparent hover:border-black transition-all disabled:opacity-50"
                            title="Xóa bảng (Admin)"
                          >
                            {isDeleting === board.id ? (
                               <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : Icons.trash}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {board.members?.[0]?.role === "ADMIN" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-black bg-[#FFD166] text-black">
                        Admin
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-2 border-black ${board.statusColor || 'bg-[#45f2b9] text-[#00563e]'}`}>
                      {board.status || t.dashboard.page.active}
                    </span>
                  </div>

                  {board.tags && board.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {board.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold text-[#b71212] bg-[#b71212]/5 px-1.5 py-0.5 border border-black/20 rounded">
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="font-body text-sm text-[#5a5971] mb-6 line-clamp-2 flex-grow h-[40px] font-medium leading-relaxed">
                    {board.description || "Bảng tin chính thực cho cư dân. Cập nhật thông báo ban quản lý và giao lưu cộng đồng."}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-medium text-[#75748d] mb-4">
                    <span className="text-zinc-600">{Icons.group}</span>
                    {board._count.members} {t.dashboard.page.citizens}
                    <span className="px-1">•</span>
                    {board._count.posts || 0} {t.dashboard.page.postsShort}
                  </div>
                  
                  <Link href={board.id.startsWith('dummy') ? '#' : `/board/${board.id}`} className="w-full bg-[#b71212] border-2 border-black rounded-lg py-2.5 px-4 text-[#ffefed] font-headline font-bold text-sm shadow-[4px_4px_0px_#000000] transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    {t.board.access}
                    <span>{Icons.arrowForward}</span>
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Pending Requests Section */}
      {pendingBoards.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#f9cc61] border-2 border-black flex items-center justify-center text-xl shadow-[4px_4px_0_0_#000000] rotate-3 text-white">⏳</div>
            <h3 className="font-headline font-black text-2xl uppercase tracking-tight relative inline-block">
              {t.dashboard.page.pendingApproval}
              <div className="absolute bottom-1 left-0 w-full h-3 bg-[#f9cc61] -z-10 transform -skew-x-12 opacity-30"></div>
            </h3>
            <span className="bg-[#f9cc61] text-white px-2 py-0.5 text-xs font-bold rounded border border-black shadow-[2px_2px_0_0_#000000]">
              {pendingBoards.length} {t.dashboard.page.pendingRequests}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pendingBoards.map((board) => (
              <article 
                key={board.id} 
                className="bg-white border-2 border-[#f9cc61] rounded-xl overflow-hidden shadow-[8px_8px_0px_#f9cc61] flex flex-col relative group"
              >
                <div className="h-40 relative border-b-2 border-[#f9cc61] overflow-hidden">
                  {board.image ? (
                    <img src={board.image} alt={board.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#f2efff] text-7xl select-none">
                      {board.emoji || "🏢"}
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white border-2 border-black px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0_0_#000000]">
                    <span className="w-2 h-2 bg-[#f9cc61] rounded-full animate-pulse"></span>
                    {t.dashboard.page.waitingResponse}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h4 className="font-headline font-bold text-xl mb-2 text-[#2d2d42]">{board.name}</h4>
                  <p className="font-body text-sm text-[#5a5971] mb-6 line-clamp-2 italic opacity-60">
                    {t.dashboard.page.pendingWelcomeDesc}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-dashed border-[#f9cc61]/30 flex justify-between items-center text-[10px] font-bold text-[#75748d]">
                    <div className="flex items-center gap-1">
                      <span>{Icons.group}</span>
                      {board._count.members} {t.dashboard.page.membersCountSuffix}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Creation Modal */}
      <CreateBoardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h3 className="font-headline font-black text-2xl uppercase tracking-tight relative inline-block">
              {t.dashboard.page.internationalServer}
              <div className="absolute bottom-1 left-0 w-full h-3 bg-[#06D6A0] -z-10 transform -skew-x-12"></div>
            </h3>
            <span className="bg-black text-white px-2 py-0.5 text-xs font-bold rounded">Discovery</span>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.5L20.5 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder={t.dashboard.page.searchPublicPlaceholder}
              value={publicSearchQuery}
              onChange={(e) => setPublicSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black rounded-lg font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#06D6A0] transition-all"
            />
          </div>
        </div>

        {filteredPublicBoards && filteredPublicBoards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPublicBoards.map((board) => (
              <div 
                key={board.id} 
                className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_#000000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000000] transition-all flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="text-3xl">{board.emoji}</div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-black uppercase text-[#06D6A0] bg-[#06D6A0]/10 px-2 py-1 border border-[#06D6A0]">Public</div>
                    {board.approvalRequired && (
                      <div className="text-[8px] font-black uppercase text-cb-red bg-cb-red/5 px-2 py-0.5 border border-cb-red flex items-center gap-1">
                        <Lock size={8} /> {t.dashboard.page.approvalNeeded}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-base truncate">{board.name}</h4>
                  <p className="text-xs text-[#5a5971] line-clamp-2 mt-1 min-h-[32px]">{board.description || "Một cộng đồng công khai mới trên ComBoard."}</p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-dashed border-black/10">
                  <span className="text-[10px] font-bold text-[#5a5971]">{board._count.members} {t.dashboard.page.citizens}</span>
                  <button 
                    onClick={() => handleJoinPublic(board.inviteCode)}
                    disabled={isJoining}
                    className={`text-[10px] font-black uppercase px-4 py-2 transition-colors ${board.approvalRequired ? 'bg-cb-navy text-white hover:bg-cb-red' : 'bg-black text-white hover:bg-[#F24236]'}`}
                  >
                    {isJoining ? "..." : board.approvalRequired ? t.dashboard.sidebar.accept : t.dashboard.page.join}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-black/20 p-12 text-center rounded-xl bg-zinc-50/50">
            <div className="text-4xl mb-4 opacity-50">🔭</div>
            <h4 className="font-headline font-bold text-lg text-zinc-400">
              {publicSearchQuery ? t.dashboard.page.noPublicResults.replace("{query}", publicSearchQuery) : t.dashboard.page.noPublicCommunities}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 uppercase font-black tracking-widest">
              {publicSearchQuery ? t.dashboard.page.tryAnotherKeyword : t.dashboard.page.createFirstPublic}
            </p>
          </div>
        )}
      </section>
      {/* Delete Confirmation Modal */}
      {boardToDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0_0_#000000] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-[#F24236] mb-6 font-headline font-bold text-2xl uppercase">
              <div className="w-12 h-12 bg-[#F24236]/10 flex items-center justify-center border-2 border-[#F24236]">
                {Icons.trash}
              </div>
              <span>{t.modals.confirmDelete}</span>
            </div>
            
            <p className="font-body text-lg mb-8 text-[#2d2d42]">
              {t.modals.confirmDeleteBoard.replace("{name}", boardToDelete.name)} 
              <br/>
              <span className="text-sm text-zinc-500 mt-2 block">{t.modals.deleteBoardWarning}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBoardToDelete(null)}
                disabled={isDeleting !== null}
                className="py-3 px-6 border-2 border-black font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                {t.modals.cancel}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting !== null}
                className="py-3 px-6 bg-[#F24236] text-white border-2 border-black font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000000] hover:bg-[#d0352c] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t.modals.confirmDeleteAction
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {boardToLeave && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[8px_8px_0_0_#000000] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-orange-600 mb-6 font-headline font-bold text-2xl uppercase">
              <div className="w-12 h-12 bg-orange-50 flex items-center justify-center border-2 border-orange-600">
                {Icons.leave}
              </div>
              <span>{t.modals.leaveBoard}</span>
            </div>
            
            <p className="font-body text-lg mb-8 text-[#2d2d42]">
              {t.modals.confirmLeaveBoard.replace("{name}", boardToLeave.name)}
              <br/>
              <span className="text-sm text-zinc-500 mt-2 block">{t.modals.leaveBoardWarning}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBoardToLeave(null)}
                disabled={isLeaving !== null}
                className="py-3 px-6 border-2 border-black font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                {t.modals.cancel}
              </button>
              <button
                onClick={confirmLeave}
                disabled={isLeaving !== null}
                className="py-3 px-6 bg-orange-500 text-white border-2 border-black font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000000] hover:bg-orange-600 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLeaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t.modals.confirmLeaveAction
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0_0_#F24236] flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="w-10 h-10 bg-[#F24236] text-white flex items-center justify-center border-2 border-black rotate-12 shrink-0">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
          </div>
          <div>
            <p className="font-headline font-black text-xs uppercase tracking-widest text-[#F24236]">{t.dashboard.page.systemAlert}</p>
            <p className="font-bold text-[#2d2d42]">{errorToast}</p>
          </div>
          <button onClick={() => setErrorToast(null)} className="ml-4 hover:scale-110 transition-transform">
             {Icons.x}
          </button>
        </div>
      )}
      {/* Edit Board Modal */}
      {boardToEdit && (
        <EditBoardModal 
          isOpen={!!boardToEdit}
          onClose={() => setBoardToEdit(null)}
          board={boardToEdit}
        />
      )}
    </main>
  );
}
