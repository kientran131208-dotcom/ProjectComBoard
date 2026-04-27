"use client";

import { useState } from "react";
import { Users, UserPlus, MessageSquare, HandHeart, UserCheck, UserX } from "lucide-react";
import DirectChatModal from "./DirectChatModal";
import { handleFriendRequest, sendFriendRequest } from "@/lib/actions/friendship";
import { markMessagesAsRead } from "@/lib/actions/chat";
import { searchUsers } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function FriendsSidebar({ 
  friends = [], 
  pendingRequests = [],
  unreadCounts = {},
  currentUserId
}: { 
  friends: any[], 
  pendingRequests: any[],
  unreadCounts: Record<string, number>,
  currentUserId: string
}) {
  const { t } = useLanguage();
  const [selectedChatFriend, setSelectedChatFriend] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const router = useRouter();

  const onHandleRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await handleFriendRequest(requestId, status);
      router.refresh();
    } catch (error: any) {
      alert(t.dashboard.sidebar.errorHandling + ": " + (error.message || "Error"));
    }
  };

  const handleOpenChat = async (friend: any) => {
    setSelectedChatFriend(friend);
    if (unreadCounts[friend.id]) {
      try {
        await markMessagesAsRead(friend.id);
        router.refresh();
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(val);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const onSendRequest = async (userId: string) => {
    setIsAdding(userId);
    try {
      await sendFriendRequest(userId);
      setSearchQuery("");
      setSearchResults([]);
      alert(t.dashboard.sidebar.requestSent);
      router.refresh();
    } catch (error: any) {
      alert(error.message || t.dashboard.sidebar.errorSending);
    } finally {
      setIsAdding(null);
    }
  };


  return (
    <>
      {/* Sidebar Container - FIXED LEFT */}
      <aside 
        className="fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r-4 border-black z-30 overflow-hidden shadow-[8px_0_30px_rgba(0,0,0,0.05)] flex flex-col w-80 hidden md:flex"
      >
        {/* Header */}
        <div className="p-4 bg-cb-navy/90 text-white border-b-2 border-black shrink-0">
           <div className="flex items-center gap-2">
              <div className="text-[#F24236]">
                 <Users size={20} />
              </div>
              <div>
                 <h2 className="font-headline font-black text-sm uppercase tracking-tighter italic">{t.dashboard.sidebar.title}</h2>
                 <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">{friends.length} {t.dashboard.sidebar.connectionCount}</p>
              </div>
           </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 bg-polka-light custom-scrollbar">
           
           {/* Global User Search */}
           <section className="space-y-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-cb-red transition-colors" size={16} />
                 <input 
                   type="text"
                   placeholder={t.dashboard.sidebar.searchPlaceholder}
                   value={searchQuery}
                   onChange={(e) => handleSearch(e.target.value)}
                   className="w-full h-11 pl-10 pr-4 bg-white border-2 border-black rounded-xl font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all text-xs"
                 />
                 {isSearching && (
                   <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" size={16} />
                 )}
              </div>

              {searchResults.length > 0 && (
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#06D6A0] rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                   <div className="p-2 border-b border-black/5 bg-[#fafffd]">
                      <span className="text-[8px] font-black uppercase text-[#06D6A0] tracking-widest px-2">{t.dashboard.sidebar.searchResults}</span>
                   </div>
                   <div className="max-h-[240px] overflow-y-auto divide-y divide-black/5">
                      {searchResults.map((user) => {
                        const isAlreadyFriend = friends.some(f => f.id === user.id);
                        return (
                          <div key={user.id} className="p-3 flex items-center justify-between gap-2 hover:bg-zinc-50">
                             <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full border border-black/10 overflow-hidden bg-slate-100 shrink-0">
                                   <img src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} alt="user" />
                                </div>
                                <div className="min-w-0">
                                   <p className="font-bold text-[11px] truncate leading-tight">{user.name}</p>
                                   <p className="text-[8px] text-zinc-400 truncate">{user.email}</p>
                                </div>
                             </div>
                             {!isAlreadyFriend ? (
                               <button 
                                 onClick={() => onSendRequest(user.id)}
                                 disabled={isAdding === user.id}
                                 className="h-7 px-3 bg-black text-white border border-black rounded-lg flex items-center justify-center font-black text-[9px] uppercase hover:bg-cb-red transition-all shrink-0"
                               >
                                 {isAdding === user.id ? "..." : t.dashboard.sidebar.addFriend}
                               </button>
                             ) : (
                               <span className="text-[8px] font-black text-[#06D6A0] uppercase px-2 shrink-0">{t.dashboard.sidebar.alreadyFriends}</span>
                             )}
                          </div>
                        );
                      })}
                   </div>
                   <button 
                     onClick={() => {setSearchQuery(""); setSearchResults([]);}}
                     className="w-full py-2 bg-zinc-50 border-t border-black text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-black"
                   >
                     {t.dashboard.sidebar.closeSearch}
                   </button>
                </div>
              )}
           </section>
           
           {/* Pending Requests Section */}
           {pendingRequests.length > 0 && (
             <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-cb-red tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-cb-red rounded-full animate-pulse"></div>
                   {t.dashboard.sidebar.newRequests} ({pendingRequests.length})
                </h3>
                <div className="space-y-2">
                   {pendingRequests.map((req: any) => (
                     <div key={req.id} className="bg-white border-2 border-black p-3 shadow-[3px_3px_0_0_#F24236] rounded-xl group transition-all hover:translate-x-1">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-zinc-100">
                              <img src={req.sender.image || `https://ui-avatars.com/api/?name=${req.sender.name}`} alt="sender" />
                           </div>
                           <span className="font-bold text-xs truncate flex-1">{req.sender.name}</span>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => onHandleRequest(req.id, 'REJECTED')}
                             className="flex-1 h-8 border-2 border-black rounded-lg flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors"
                           >
                             <UserX size={14} />
                           </button>
                           <button 
                             onClick={() => onHandleRequest(req.id, 'ACCEPTED')}
                             className="flex-[2] h-8 bg-[#06D6A0] border-2 border-black rounded-lg flex items-center justify-center text-white font-black text-[10px] uppercase shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                           >
                             {t.dashboard.sidebar.accept}
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
           )}

           {/* Friends List Section */}
           <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-[#2d2d42]/40 tracking-[0.2em]">{t.dashboard.sidebar.list} ({friends.length})</h3>
              
              {friends.length > 0 ? (
                <div className="space-y-3">
                   {friends.map((friend: any) => (
                     <div key={friend.id} className="bg-white border-2 border-black p-3 shadow-[3px_3px_0_0_#000] rounded-xl flex items-center justify-between group hover:-translate-y-0.5 transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                           <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-cb-yellow shrink-0">
                              <img src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}`} alt="avatar" />
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-bold text-xs truncate leading-tight">{friend.name}</h4>
                              <div className="text-[7px] font-black text-cb-red/30 uppercase tracking-tighter scale-95 origin-left">
                                 {t.dashboard.sidebar.friendLabel}
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleOpenChat(friend)}
                          className={`w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center text-cb-navy hover:bg-zinc-100 transition-all relative ${
                            unreadCounts[friend.id] ? 'bg-cb-yellow' : 'opacity-40 group-hover:opacity-100'
                          }`}
                        >
                          <MessageSquare size={16} />
                          {unreadCounts[friend.id] > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#F24236] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black animate-bounce shadow-[2px_2px_0_0_#000]">
                              +{unreadCounts[friend.id]}
                            </span>
                          )}
                        </button>

                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-30">
                   <UserPlus size={40} className="mx-auto mb-2" />
                   <p className="text-[9px] font-bold uppercase tracking-widest leading-loose">
                      {t.dashboard.sidebar.noFriends}
                   </p>
                </div>
              )}
           </section>
        </div>

        {/* Footer Area */}
        <div className="p-4 bg-zinc-50 border-t-4 border-black shrink-0 text-center">
           <p className="text-[9px] font-bold text-cb-navy/40 uppercase tracking-[0.1em]">ComBoard Social Network v1.0</p>
        </div>
      </aside>

      {selectedChatFriend && (
        <DirectChatModal 
          isOpen={!!selectedChatFriend}
          onClose={() => setSelectedChatFriend(null)}
          friend={selectedChatFriend}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
