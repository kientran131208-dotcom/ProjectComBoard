"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  ThumbsUp, 
  Heart,
  MessageCircle, 
  Share2, 
  Send, 
  Megaphone,
  Calendar,
  Loader2,
  Trash2,
  Pin,
  Pencil,
  RefreshCcw,
  Check,
  Zap
} from "lucide-react";
import { toggleLike, addComment, toggleCommentLike, addCommentReply, deleteComment } from "@/lib/actions/post";
import { votePoll } from "@/lib/actions/poll";
import { useLanguage } from "@/context/LanguageContext";

type Comment = {
  id: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  authorId: string;
  parentId?: string | null;
  commentLikes?: { userId: string }[];
  _count?: {
    commentLikes: number;
  };
  content: string;
  createdAt: Date;
};

type Post = {
  id: string;
  title: string;
  content: string;
  type: string;
  authorId: string;
  createdAt: Date;
  image?: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  isPinned?: boolean;
  comments?: Comment[];
  likes?: { userId: string; user: { id: string; name: string; image?: string } }[];
  votes?: { userId: string; option: string }[];
  pollOptions?: string[];
  status?: "OPEN" | "IN_PROGRESS" | "DONE";
  _count?: {
    comments: number;
    likes: number;
    votes?: number;
  };
};

export default function PostDetailModal({ 
  post, 
  isOpen, 
  boardId,
  currentUserId,
  isAdmin,
  onClose,
  onDelete,
  onTogglePin,
  onUpdatePost
}: { 
  post: Post | null; 
  isOpen: boolean; 
  boardId: string;
  currentUserId: string | null;
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdatePost?: (id: string, data: { title?: string, content?: string, pollOptions?: string[], status?: "OPEN" | "IN_PROGRESS" | "DONE" }) => void;
}) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post?.title || "");
  const [editContent, setEditContent] = useState(post?.content || "");
  const [editPollOptions, setEditPollOptions] = useState<string[]>(post?.pollOptions || []);
  const [editStatus, setEditStatus] = useState<"OPEN" | "IN_PROGRESS" | "DONE">(post?.status || "OPEN");

  // Optimistic UI state for polls
  const [optimisticVotes, setOptimisticVotes] = useState(post?.votes || []);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    setOptimisticVotes(post?.votes || []);
    setEditTitle(post?.title || "");
    setEditContent(post?.content || "");
    setEditPollOptions(post?.pollOptions || []);
    setEditStatus(post?.status || "OPEN");
    setIsEditing(false);
  }, [post]);

  if (!isOpen || !post) return null;

  const isAuthor = post.authorId === currentUserId;
  const canModify = isAuthor || isAdmin;

  const isLiked = post.likes?.some((like: any) => like.userId === currentUserId);

  // Group comments: top-level and replies (filtering out optimistically deleted ones)
  const topLevelComments = post.comments?.filter((c: any) => !c.parentId && !deletedIds.includes(c.id)) || [];
  const getReplies = (parentId: string) => post.comments?.filter((c: any) => c.parentId === parentId && !deletedIds.includes(c.id)) || [];

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    setIsLiking(true);
    try {
      await toggleLike(post.id, boardId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentUserId) return;
    try {
      await toggleCommentLike(commentId, boardId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletedIds(prev => [...prev, commentId]);
    setCommentToDelete(null);
    
    try {
      const result = await deleteComment(commentId, boardId);
      if (result && result.success) {
        router.refresh();
      } else {
        throw new Error("Server error");
      }
    } catch (error: any) {
      setDeletedIds(prev => prev.filter(id => id !== commentId));
      alert(`${t.modals.error}: ${error.message || t.modals.unknownError}`);
    }
  };

  const handleEditSubmit = () => {
    const hasChanges = editTitle !== post.title || 
                       editContent !== post.content || 
                       editStatus !== post.status ||
                       JSON.stringify(editPollOptions) !== JSON.stringify(post.pollOptions);
    if (hasChanges && onUpdatePost) {
      onUpdatePost(post.id, { 
        title: editTitle.trim() || post.title, 
        content: editContent.trim() || post.content,
        status: editStatus,
        ...(post.type === \"POLL\" ? { pollOptions: editPollOptions.filter((o: any) => o.trim() !== '') } : {})
      });
    }
    setIsEditing(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(post.id, boardId, commentText);
      setCommentText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(true);
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUserId || !replyTo || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addCommentReply(post.id, boardId, replyTo, replyText);
      setReplyText("");
      setReplyTo(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0c0c1f]/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[760px] h-[85vh] bg-white border-2 border-black shadow-[16px_16px_0px_#1A1A2E] flex flex-col z-[310] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b-2 border-black">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3">
              {post.status && (
                <button
                  onClick={() => {
                    if (!canModify || !onUpdatePost) return;
                    const statuses = ["OPEN", "IN_PROGRESS", "DONE"];
                    const currentIndex = statuses.indexOf(post.status!);
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                    onUpdatePost(post.id, { status: nextStatus as any });
                  }}
                  className={`border-2 border-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all
                    ${!canModify ? 'cursor-default' : 'hover:translate-y-[-1px] active:translate-y-0'}
                    ${post.status === "OPEN" ? "bg-white text-zinc-400 border-zinc-200" : 
                      post.status === "IN_PROGRESS" ? "bg-[#FFD166] text-black shadow-[3px_3px_0_0_#000]" :
                      "bg-[#06D6A0] text-white shadow-[3px_3px_0_0_#000]"}`}>
                   {post.status === "IN_PROGRESS" && <RefreshCcw size={14} className="animate-spin" />}
                   {post.status === "DONE" && <Check size={14} />}
                   {post.status === "OPEN" ? t.status.open : post.status === "IN_PROGRESS" ? t.status.inProgress : t.status.done}
                </button>
              )}
              <span className={`border-2 border-black px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 uppercase tracking-wider
                ${post.type === "ANNOUNCEMENT" ? "bg-[#FFD166]" : post.type === "BORROWING" ? "bg-[#06D6A0]" : post.type === "POLL" ? "bg-[#7B61FF] text-white" : "bg-[#118AB2] text-white"}`}>
                {post.type === "ANNOUNCEMENT" && <Megaphone size={14} />}
                {post.type === "BORROWING" && <Calendar size={14} />}
                {post.type === "QNA" && <MessageCircle size={14} />}
                {post.type === "POLL" && <Zap size={14} className="fill-current" />}
                {post.type === "ANNOUNCEMENT" ? t.types.announcement : post.type === "BORROWING" ? t.types.borrowing : post.type === "POLL" ? t.types.poll : t.types.qna}
              </span>
              {post.isPinned && (
                <span className="bg-[#EF4444] text-white border-2 border-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t.board.important}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {isAuthor && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-full transition-colors border-2 hover:border-black ${isEditing ? 'bg-[#FFD166] border-black text-black' : 'border-transparent text-slate-400 hover:text-black'}`}
                  title={isEditing ? t.modals.postDetail.cancelEdit : t.modals.postDetail.editPost}
                >
                  <Pencil size={20} />
                </button>
              )}
              {isAdmin && (
                <button 
                  onClick={() => onTogglePin(post.id)}
                  className={`p-2 transition-colors ${post.isPinned ? 'text-[#F24236]' : 'text-slate-400 hover:text-black'}`}
                  title={post.isPinned ? t.board.unpin : t.board.pinPost}
                >
                  <Pin size={22} className={post.isPinned ? "fill-current" : ""} />
                </button>
              )}
              {canModify && (
                <button 
                  onClick={() => onDelete(post.id)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  title={t.board.delete}
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
                title={t.modals.close}
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <input 
              autoFocus
              className="w-full bg-white border-4 border-[#FFD166] focus:border-[#7B61FF] p-3 font-headline font-bold text-3xl md:text-4xl leading-tight mb-6 text-black outline-none transition-colors"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
          ) : (
            <h2 className="font-headline font-bold text-3xl md:text-4xl leading-tight mb-6 text-on-surface">
              {post.title}
            </h2>
          )}
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-zinc-100 flex items-center justify-center font-bold text-lg">
              {post.author.image ? (
                <img src={post.author.image} alt="" className="w-full h-full object-cover" />
              ) : (
                post.author.name.charAt(0)
              )}
            </div>
            <div>
              <p className="font-bold text-base text-on-surface">{post.author.name}</p>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-grow bg-[#FFF8F6]">
          {post.image && (
            <div className="w-full border-b-2 border-black">
              <img src={post.image} alt="" className="w-full h-auto block" />
            </div>
          )}
          <div className="p-6 md:p-10 space-y-8">
            {post.isPinned && (
              <div className="inline-flex items-center gap-2 bg-[#F24236] text-white text-[10px] font-bold px-3 py-1 border-2 border-black uppercase tracking-widest">
                <Pin size={12} className="fill-current" />
                {t.board.important} / {t.board.priority}
              </div>
            )}
            {isEditing ? (
              <div className="space-y-4">
                <textarea 
                  className="w-full bg-white border-4 border-[#FFD166] focus:border-[#7B61FF] p-4 font-headline font-semibold text-xl md:text-2xl leading-relaxed text-black outline-none min-h-[150px] resize-y transition-colors"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder={t.modals.postDetail.contentPlaceholder}
                />
                <div className="space-y-3 pt-4 border-t border-dashed border-black/10">
                  <label className="block text-[10px] font-black uppercase text-[#1A1A2E] tracking-widest italic leading-none">{t.status.statusLabel}</label>
                  <div className="flex gap-2">
                    {[
                      { value: "OPEN", label: t.status.waiting },
                      { value: "IN_PROGRESS", label: t.status.inProgress },
                      { value: "DONE", label: t.status.completed }
                    ].map((s: any) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setEditStatus(s.value as any)}
                        className={`flex-1 py-3 border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                          editStatus === s.value 
                            ? "bg-[#1A1A2E] text-white shadow-[4px_4px_0_0_#F24236] -translate-y-1" 
                            : "bg-white text-black hover:bg-zinc-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleEditSubmit}
                    className="flex-1 bg-[#06D6A0] text-black border-4 border-black font-black uppercase tracking-wider py-3 shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={20} /> {t.modals.saveChanges}
                  </button>
                  <button 
                    onClick={() => {
                      setEditTitle(post.title);
                      setEditContent(post.content);
                      setIsEditing(false);
                    }}
                    className="px-8 bg-white text-black border-4 border-black font-black uppercase tracking-wider py-3 shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t.modals.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-headline font-semibold text-on-surface whitespace-pre-wrap break-words leading-relaxed text-xl md:text-2xl">
                {post.content}
              </div>
            )}
            
            {/* Poll Section */}
            {post.type === "POLL" && post.pollOptions && (
              <div className="space-y-4 my-8 max-w-xl">
                {isEditing ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-black/40 tracking-widest leading-none">{t.board.votes}</label>
                    {editPollOptions.map((option, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          className="flex-1 bg-white border-2 border-black p-3 font-bold text-sm outline-none shadow-[2px_2px_0_0_#000] focus:border-[#7B61FF]"
                          value={option}
                          placeholder={`${t.modals.createPost.optionPlaceholder} ${idx + 1}`}
                          onChange={(e) => {
                            const newOpts = [...editPollOptions];
                            newOpts[idx] = e.target.value;
                            setEditPollOptions(newOpts);
                          }}
                        />
                        <button 
                          onClick={() => {
                            const newOpts = editPollOptions.filter((_, i) => i !== idx);
                            setEditPollOptions(newOpts);
                          }}
                          className="p-3 bg-[#EF4444] text-white border-2 border-black hover:bg-black transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditPollOptions([...editPollOptions, ""])}
                      className="w-full mt-2 py-3 border-2 border-dashed border-zinc-400 text-zinc-500 font-bold uppercase tracking-wider text-sm hover:border-black hover:text-black hover:bg-zinc-100 transition-colors"
                    >
                      {t.board.seeMore} {t.board.options}
                    </button>
                  </div>
                ) : (
                  <>
                    {post.pollOptions.map((option: string, idx: number) => {
                      const totalVotes = optimisticVotes.length || 0;
                      const optionVotes = optimisticVotes.filter((v: any) => v.option === option).length || 0;
                      const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                      const isSelected = optimisticVotes.some((v: any) => String(v.userId) === String(currentUserId) && v.option === option);
                      const votersForOption = optimisticVotes.filter((v: any) => v.option === option);
                      
                      return (
                        <div key={idx} className="flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={isVoting}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!currentUserId) {
                              alert(t.modals.needsLogin);
                              return;
                            }
                            if (isVoting) return;

                            const newVotes = [...optimisticVotes];
                            const existingVoteIndex = newVotes.findIndex((v: any) => String(v.userId) === String(currentUserId));
                            
                            if (existingVoteIndex !== -1) {
                              if (newVotes[existingVoteIndex].option === option) {
                                newVotes.splice(existingVoteIndex, 1);
                              } else {
                                newVotes[existingVoteIndex] = { ...newVotes[existingVoteIndex], option };
                              }
                            } else {
                              newVotes.push({ userId: currentUserId, option });
                            }

                            setOptimisticVotes(newVotes);
                            setIsVoting(true);

                            try {
                              await votePoll(post.id, boardId, option);
                              router.refresh();
                            } catch (err: any) {
                              setOptimisticVotes(post.votes || []);
                              alert(err.message);
                            } finally {
                              setIsVoting(false);
                            }
                          }}
                          className={`w-full relative cursor-pointer border-2 border-black h-14 overflow-hidden group/opt transition-all active:scale-[0.98] shadow-[4px_4px_0_0_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_#000000] ${isVoting ? 'opacity-75 grayscale-[0.2]' : ''}`}
                        >
                          <div className="absolute inset-0 bg-[#F3E8FF]"></div>
                          <div 
                            className="absolute inset-x-0 inset-y-0 bg-[#7B61FF] border-r-2 border-black transition-all duration-700 ease-out" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                          
                          <div className="relative h-full flex items-center justify-between px-6">
                             <div className="flex items-center gap-4">
                               <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${isSelected ? 'bg-[#FFD166]' : 'bg-white'}`}>
                                  {isSelected && <Check size={16} className="text-black" />}
                               </div>
                               <span className={`text-sm md:text-base font-black uppercase tracking-tight ${percentage > 50 ? 'text-white' : 'text-black'}`}>
                                 {option}
                               </span>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold ${percentage > 90 ? 'text-white' : 'text-black/40'}`}>{optionVotes} {t.board.voters}</span>
                                <span className={`text-base font-black ${percentage > 90 ? 'text-white' : 'text-black'}`}>{percentage}%</span>
                             </div>
                          </div>
                        </button>
                        {votersForOption.length > 0 && (
                          <div className="flex flex-wrap gap-1 px-1">
                            {votersForOption.slice(0, 15).map((voter: any) => {
                               const voterName = voter.user?.name || (voter.userId === currentUserId ? "You" : "User");
                               const voterImage = voter.user?.image;
                               return (
                                 <div key={voter.userId} className="w-6 h-6 border-2 border-black relative group/voter bg-[#1A1A2E] z-10 hover:z-50 -mr-1" title={voterName}>
                                   {voterImage ? (
                                      <img src={voterImage} alt={voterName} className="w-full h-full object-cover" />
                                   ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white uppercase overflow-hidden">
                                         {voterName.slice(0, 2)}
                                      </div>
                                   )}
                                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-black text-white text-[10px] whitespace-nowrap opacity-0 group-hover/voter:opacity-100 pointer-events-none z-[100] transition-opacity">
                                     {voterName}
                                   </div>
                                 </div>
                               );
                            })}
                            {votersForOption.length > 15 && (
                               <div className="w-6 h-6 border-2 border-black bg-white flex items-center justify-center text-[9px] font-bold z-10">
                                 +{votersForOption.length - 15}
                               </div>
                            )}
                          </div>
                        )}
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-4 mt-6">
                       <div className="text-[10px] font-black uppercase text-black/40 tracking-widest bg-black/5 px-3 py-1.5 border-2 border-black/10">
                          {t.board.totalVotes}: {optimisticVotes.length || 0} {t.board.votes}
                       </div>
                    </div>
                  </>
                )}
              </div>
            )}


            {/* Action Bar */}
            <div className="bg-[#F2EFFF] border-2 border-black p-5 flex gap-4 shadow-[6px_6px_0_0_#000000]">
              <button 
                onClick={handleLike}
                disabled={isLiking || !currentUserId}
                className={`border-2 border-black px-6 py-3 flex items-center gap-3 font-bold text-sm hover:translate-y-[-2px] transition-all active:translate-y-0
                  ${isLiked ? 'bg-[#FF7767] text-white shadow-[3px_3px_0_0_#000000]' : 'bg-[#06D6A0] text-black shadow-[3px_3px_0_0_#000000]'}`}
              >
                {isLiking ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={isLiked ? "currentColor" : "none"} />} 
                {isLiked ? t.board.liked : t.board.like} ({post._count?.likes || 0})
              </button>
              <div className="bg-white border-2 border-black px-6 py-3 flex items-center gap-3 font-bold text-sm shadow-[3px_3px_0_0_rgba(0,0,0,0.1)]">
                <MessageCircle size={18} /> {t.board.comments} ({post._count?.comments || 0})
              </div>
              

              <button className="bg-white border-2 border-black px-6 py-3 flex items-center gap-3 font-bold text-sm ml-auto hover:translate-y-[-2px] transition-all active:translate-y-0 shadow-[4px_4px_0_0_#000000]">
                <Share2 size={18} /> {t.board.shareAction}
              </button>
              {canModify && post.status !== "DONE" && (
                <button 
                  onClick={() => onUpdatePost?.(post.id, { status: "DONE" })}
                  className="bg-[#06D6A0] text-white border-2 border-black px-6 py-3 flex items-center gap-3 font-black text-sm hover:translate-y-[-2px] transition-all active:translate-y-0 shadow-[4px_4px_0_0_#F24236]"
                >
                  <Check size={20} /> {t.status.completed}
                </button>
              )}
            </div>
            
            {/* Liked By List */}
            {post.likes && post.likes.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className=\"flex -space-x-3 overflow-hidden p-1\">
                    {post.likes.slice(0, 5).map((like: any, i: number) => (
                      <div 
                        key={like.userId} 
                        className="inline-block h-8 w-8 rounded-full border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0_0_#1A1A2E]"
                        style={{ zIndex: 5 - i }}
                      >
                        {like.user.image ? (
                          <img src={like.user.image} alt={like.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#FFD166] text-[10px] font-black">{like.user.name.charAt(0)}</div>
                        )}
                      </div>
                    ))}
                    {post.likes.length > 5 && (
                      <div className="inline-block h-8 w-8 rounded-full border-2 border-black bg-black text-white flex items-center justify-center text-[10px] font-black z-0 shadow-[2px_2px_0_0_#1A1A2E]">
                        +{post.likes.length - 5}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-on-surface/60">
                    {post.likes.length > 0 && (
                      <>
                        <span className="text-[#F24236]">{post.likes[0].user.name}</span>
                        {post.likes.length > 1 && ` ${t.board.others} ${t.board.liked}`}
                        {post.likes.length === 1 && ` ${t.board.likedThis}`}
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6 pt-6 border-t-2 border-black/5">
              <h4 className="font-bold text-base text-on-surface uppercase tracking-widest mb-6 flex items-center gap-3">
                {t.modals.postDetail.residentComments}
                <div className="flex-grow h-[2px] bg-black/5"></div>
              </h4>

              {topLevelComments.length > 0 ? (
                topLevelComments.map((comment: any) => {
                  const replies = getReplies(comment.id);
                  const isCommentLiked = comment.commentLikes?.some((l: any) => l.userId === currentUserId);
                  const canDeleteComment = (comment.authorId && String(comment.authorId) === String(currentUserId)) || isAdmin;
                  
                  return (
                    <div key={comment.id} className="space-y-4">
                      {/* Main Comment */}
                      <div className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm flex-shrink-0 bg-[#FFD166] shadow-[2px_2px_0_0_#000000]">
                          {comment.author.name.charAt(0)}
                        </div>
                        <div className="flex-grow">
                          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] group-hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all relative">
                            <div className="flex justify-between items-start mb-2">
                               <p className="font-bold text-sm text-on-surface">{comment.author.name}</p>
                               {currentUserId && (
                                 <button 
                                   onClick={() => setCommentToDelete(comment.id)}
                                   className={`${canDeleteComment ? 'text-zinc-400 hover:text-red-600' : 'text-zinc-200 hover:text-red-400'} transition-all p-1.5 hover:bg-red-50 rounded-md`}
                                   title={t.modals.postDetail.deleteComment}
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               )}
                            </div>
                            <p className="text-base text-on-surface/80 leading-relaxed">{comment.content}</p>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs font-bold text-zinc-400">
                            <button 
                              onClick={() => handleCommentLike(comment.id)}
                              className={`flex items-center gap-1 transition-colors ${isCommentLiked ? 'text-red-500' : 'hover:text-black'}`}
                            >
                              <Heart size={14} fill={isCommentLiked ? "currentColor" : "none"} />
                              {t.board.like} {(comment._count?.commentLikes ?? 0) > 0 && `(${comment._count?.commentLikes})`}
                            </button>
                            <button 
                              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                              className="hover:text-black transition-colors"
                            >
                              {t.board.reply}
                            </button>
                            <span>•</span>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                          
                          {/* Reply Input Area */}
                          {replyTo === comment.id && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                              <form onSubmit={handleReply} className="flex gap-3">
                                <input 
                                  autoFocus
                                  type="text"
                                  placeholder={`${t.modals.postDetail.replyTo} ${comment.author.name}...`}
                                  className="flex-grow h-10 px-4 border-2 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#000000] transition-all"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button 
                                  type="submit"
                                  disabled={!replyText.trim() || isSubmitting}
                                  className="px-4 bg-black text-white text-xs font-black uppercase hover:bg-[#F24236] transition-colors disabled:opacity-50"
                                >
                                  {t.board.send}
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Replies List */}
                      {replies.length > 0 && (
                        <div className="ml-14 space-y-4 border-l-2 border-dashed border-black/10 pl-6">
                          {replies.map((reply: any) => {
                            const isReplyLiked = reply.commentLikes?.some((l: any) => l.userId === currentUserId);
                            const canDeleteReply = (reply.authorId && String(reply.authorId) === String(currentUserId)) || isAdmin;
                            
                            return (
                              <div key={reply.id} className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs flex-shrink-0 bg-[#06D6A0] shadow-[2px_2px_0_0_#000000]">
                                  {reply.author.name.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                  <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_0_rgba(0,0,0,0.05)] group-hover:shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all relative">
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="font-bold text-xs text-on-surface">{reply.author.name}</p>
                                          {currentUserId && (
                                            <button 
                                              onClick={() => setCommentToDelete(reply.id)}
                                              className={`${canDeleteReply ? 'text-zinc-400 hover:text-red-600' : 'text-zinc-200 hover:text-red-400'} transition-all p-1.5 hover:bg-red-50 rounded-md`}
                                              title={t.modals.postDetail.deleteReply}
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          )}
                                        </div>
                                    <p className="text-sm text-on-surface/80 leading-relaxed">{reply.content}</p>
                                  </div>
                                  <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                                    <button 
                                      onClick={() => handleCommentLike(reply.id)}
                                      className={`flex items-center gap-1 transition-colors ${isReplyLiked ? 'text-red-500' : 'hover:text-black'}`}
                                    >
                                      <Heart size={12} fill={isReplyLiked ? "currentColor" : "none"} />
                                      {(reply._count?.commentLikes ?? 0) > 0 && reply._count?.commentLikes}
                                    </button>
                                    <span>{formatDate(reply.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-300 gap-4 border-2 border-dashed border-black/10">
                  <MessageCircle size={48} />
                  <p className="text-sm font-bold uppercase tracking-widest">{t.board.noComments}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-8 border-t-2 border-black bg-white z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleComment} className="flex gap-4">
             <div className="w-12 h-12 rounded-full border-2 border-black bg-[#D9D7FF] flex items-center justify-center text-sm font-bold shrink-0 shadow-[3px_3px_0_0_#000000]">
                {currentUserId ? "U" : "?"}
             </div>
             <div className="relative flex-grow">
               <input 
                 type="text"
                 disabled={!currentUserId || isSubmitting}
                 placeholder={currentUserId ? t.board.commentHint : t.board.loginToComment}
                 className="w-full h-12 pl-5 pr-16 border-2 border-black bg-white focus:outline-none focus:shadow-[6px_6px_0_0_#000000] font-bold text-base transition-all disabled:bg-zinc-100 placeholder:text-zinc-300"
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
               />
               <button 
                 type="submit"
                 disabled={!commentText.trim() || isSubmitting || !currentUserId}
                 className="absolute right-1.5 top-1.5 w-9 h-9 bg-[#b71212] border-2 border-black flex items-center justify-center text-white hover:bg-red-700 transition-all hover:scale-110 disabled:grayscale disabled:scale-100 shadow-[2px_2px_0_0_#000000]"
               >
                 {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
               </button>
             </div>
          </form>
        </div>
      </div>

      {/* Custom Comment Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c0c1f]/40 backdrop-blur-[2px]" onClick={() => setCommentToDelete(null)}></div>
          <div className="relative bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#1A1A2E] max-w-sm w-full">
            <h3 className="font-headline font-bold text-xl mb-4">{t.modals.confirmDelete}</h3>
            <p className="text-zinc-600 mb-8 font-bold">{t.modals.deleteWarning}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="flex-1 py-3 border-2 border-black font-black uppercase tracking-wider hover:bg-zinc-50 transition-colors"
              >
                {t.modals.cancel}
              </button>
              <button 
                onClick={() => handleDeleteComment(commentToDelete)}
                className="flex-1 py-3 bg-[#EF4444] text-white border-2 border-black font-black uppercase tracking-wider hover:bg-red-700 transition-colors shadow-[4px_4px_0_0_#000]"
              >
                {t.modals.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
