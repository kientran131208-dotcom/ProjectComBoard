"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { User, Mail, Shield, Calendar, ArrowLeft, ExternalLink, Settings, Camera, Save, X, UserCheck, UserX, MessageSquare, HandHeart, Users } from "lucide-react";
import { updateProfile } from "@/lib/actions/user";
import { handleFriendRequest } from "@/lib/actions/friendship";
import { useRouter } from "next/navigation";
import DirectChatModal from "./DirectChatModal";
import { useLanguage } from "@/context/LanguageContext";


export default function ProfileClient({ 
  user, 
  myBoards, 
  friendsList = [], 
  pendingRequests = [] 
}: { 
  user: any, 
  myBoards: any[],
  friendsList: any[],
  pendingRequests: any[]
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"boards" | "friends">("boards");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChatFriend, setSelectedChatFriend] = useState<any | null>(null);
  const [formData, setFormData] = useState({

    name: user.name || "",
    image: user.image || "",
    bio: user.bio || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const adminBoards = myBoards.filter((b: any) => b.members?.[0]?.role === \"ADMIN\");
  const memberBoards = myBoards.filter((b: any) => b.members?.[0]?.role === \"MEMBER\");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert(t.profile.errorTooLarge);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || t.profile.errorUpdating);
    } finally {
      setIsSaving(false);
    }
  };

  const onHandleRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await handleFriendRequest(requestId, status);
      router.refresh();
    } catch (error: any) {
      alert(error.message || t.dashboard.sidebar.errorHandling);
    }
  };

  return (
    <main className="font-body max-w-4xl mx-auto py-12 px-4">
      {/* Back Link */}
      <Link href="/" className="inline-flex items-center gap-2 font-black uppercase text-xs mb-8 hover:text-cb-red transition-colors group">
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {t.profile.backToDashboard}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000000] rounded-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#F24236]"></div>
            
            <div className="w-32 h-32 border-4 border-black rounded-full overflow-hidden shadow-[4px_4px_0_0_#F24236] mb-6 bg-cb-yellow flex items-center justify-center font-headline font-black text-4xl mt-4">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                (user.name?.[0] ?? "?")
              )}
            </div>
            
            <h2 className="font-headline font-black text-2xl mb-1">{user.name}</h2>
            <div className="flex items-center gap-1.5 text-cb-navy/50 font-bold text-xs uppercase tracking-widest mb-4">
              <Mail size={12} />
              {user.email}
            </div>

            {user.bio ? (
              <p className="text-xs font-medium text-zinc-500 mb-6 italic line-clamp-3">"{user.bio}"</p>
            ) : (
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter mb-6">{t.profile.noBio}</p>
            )}

            <div className="w-full pt-6 border-t-2 border-black/5 flex flex-col gap-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full h-12 bg-black border-2 border-black rounded-md text-white font-bold text-sm shadow-[4px_4px_0_0_#F24236] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#1A1A2E]"
              >
                <Settings size={16} /> {t.profile.editProfile}
              </button>
            </div>
          </div>

          <div className="mt-8 bg-[#f2efff] border-4 border-black p-6 shadow-[8px_8px_0_0_#7B61FF] rounded-xl text-cb-navy">
             <h3 className="font-headline font-black text-sm uppercase mb-4 flex items-center gap-2">
               <Calendar size={16} /> {t.profile.stats}
             </h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-xs font-bold opacity-70">{t.profile.adminBoards}</span>
                  <span className="font-black text-lg">{adminBoards.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-xs font-bold opacity-70">{t.profile.memberBoardsCount}</span>
                  <span className="font-black text-lg">{memberBoards.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-xs font-bold opacity-70">{t.profile.friendsCount}</span>
                  <span className="font-black text-lg">{friendsList.length}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex gap-4 border-b-4 border-black pb-1">
             <button 
               onClick={() => setActiveTab("boards")}
               className={`pb-3 px-4 font-headline font-black text-sm uppercase tracking-widest transition-all relative ${
                 activeTab === "boards" ? "text-cb-red translate-y-[-2px]" : "text-zinc-400 hover:text-black"
               }`}
             >
               {t.profile.boardsTab}
               {activeTab === "boards" && <div className="absolute bottom-[-4px] left-0 w-full h-1 bg-[#F24236]"></div>}
             </button>
             <button 
               onClick={() => setActiveTab("friends")}
               className={`pb-3 px-4 font-headline font-black text-sm uppercase tracking-widest transition-all relative ${
                 activeTab === "friends" ? "text-cb-red translate-y-[-2px]" : "text-zinc-400 hover:text-black"
               }`}
             >
               {t.profile.friendsTab}
               {pendingRequests.length > 0 && (
                 <span className="ml-2 bg-[#F24236] text-white text-[10px] px-1.5 py-0.5 rounded-full border border-black animate-pulse">
                   {pendingRequests.length}
                 </span>
               )}
               {activeTab === "friends" && <div className="absolute bottom-[-4px] left-0 w-full h-1 bg-[#F24236]"></div>}
             </button>
          </div>

          {activeTab === "boards" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Admin Boards */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="font-headline font-black text-xl uppercase tracking-tight relative inline-block">
                    {t.profile.managedTitle}
                    <div className="absolute bottom-1 left-0 w-full h-2 bg-[#FFD166] -z-10 transform -skew-x-12"></div>
                  </h3>
                  <span className="bg-black text-white px-2 py-0.5 text-xs font-bold rounded">{adminBoards.length}</span>
                </div>

                <div className="space-y-4">
                  {adminBoards.length > 0 ? adminBoards.map((board: any) => (
                    <Link key={board.id} href={`/board/${board.id}`}>
                      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all flex items-center justify-between group mb-3">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl w-10 h-10 bg-zinc-100 border-2 border-black rounded flex items-center justify-center">
                            {board.emoji}
                          </div>
                          <div>
                            <h4 className="font-bold text-cb-navy group-hover:text-cb-red transition-colors">{board.name}</h4>
                            <p className="text-[10px] font-bold text-cb-navy/40 uppercase tracking-widest">Administrator</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-cb-navy/20 group-hover:text-cb-navy" />
                      </div>
                    </Link>
                  )) : (
                    <div className="p-8 border-2 border-dashed border-black/20 rounded-xl text-center text-zinc-400 font-bold text-sm italic">
                      {t.profile.noManaged}
                    </div>
                  )}
                </div>
              </section>

              {/* Member Boards */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="font-headline font-black text-xl uppercase tracking-tight relative inline-block">
                    {t.profile.memberTitle}
                    <div className="absolute bottom-1 left-0 w-full h-2 bg-[#06D6A0] -z-10 transform -skew-x-12"></div>
                  </h3>
                  <span className="bg-black text-white px-2 py-0.5 text-xs font-bold rounded">{memberBoards.length}</span>
                </div>

                <div className="space-y-4">
                  {memberBoards.length > 0 ? memberBoards.map((board: any) => (
                    <Link key={board.id} href={`/board/${board.id}`}>
                      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all flex items-center justify-between group mb-3">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl w-10 h-10 bg-zinc-100 border-2 border-black rounded flex items-center justify-center">
                            {board.emoji}
                          </div>
                          <div>
                            <h4 className="font-bold text-cb-navy group-hover:text-cb-red transition-colors">{board.name}</h4>
                            <p className="text-[10px] font-bold text-cb-navy/40 uppercase tracking-widest">{t.dashboard.page.citizens}</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-cb-navy/20 group-hover:text-cb-navy" />
                      </div>
                    </Link>
                  )) : (
                    <div className="p-8 border-2 border-dashed border-black/20 rounded-xl text-center text-zinc-400 font-bold text-sm italic">
                      {t.profile.noMember}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "friends" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-headline font-black text-xl uppercase tracking-tight relative inline-block text-[#F24236]">
                      {t.profile.newRequests}
                      <div className="absolute bottom-1 left-0 w-full h-2 bg-[#fbd2ce] -z-10 transform -skew-x-12"></div>
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {pendingRequests.map((req: any) => (
                      <div key={req.id} className="bg-white border-4 border-[#F24236] p-4 shadow-[6px_6px_0_0_#F24236] flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-zinc-100 shadow-[2px_2px_0_0_#000]">
                            <img src={req.sender.image || `https://ui-avatars.com/api/?name=${req.sender.name}`} alt="sender" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-headline font-black text-lg">{req.sender.name}</h4>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.profile.wantsToBeFriend}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onHandleRequest(req.id, 'REJECTED')}
                            className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <UserX size={18} />
                          </button>
                          <button 
                            onClick={() => onHandleRequest(req.id, 'ACCEPTED')}
                            className="px-4 h-10 bg-[#06D6A0] border-2 border-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all gap-2"
                          >
                            <UserCheck size={18} /> {t.profile.accept}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Friends List */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="font-headline font-black text-xl uppercase tracking-tight relative inline-block">
                    {t.profile.friendsList}
                    <div className="absolute bottom-1 left-0 w-full h-2 bg-cb-yellow -z-10 transform -skew-x-12"></div>
                  </h3>
                  <span className="bg-black text-white px-2 py-0.5 text-xs font-bold rounded">{friendsList.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {friendsList.length > 0 ? friendsList.map((friend: any) => (
                    <div key={friend.id} className="bg-white border-2 border-black p-5 shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] transition-all">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden bg-cb-yellow shadow-[2px_2px_0_0_#000] shrink-0">
                             <img src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-headline font-black text-lg truncate leading-tight">{friend.name}</h4>
                             <div className="flex items-center gap-1 text-[10px] font-bold text-cb-navy/40 uppercase tracking-widest">
                                <HandHeart size={10} className="text-[#F24236]" /> {t.profile.closeFriends}
                             </div>
                          </div>
                       </div>
                       
                       {friend.bio && (
                         <p className="text-xs font-medium text-zinc-500 line-clamp-2 italic mb-4">"{friend.bio}"</p>
                       )}

                       <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-black/5">
                          <button className="h-10 border-2 border-black rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors text-xs font-bold shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                             <User size={14} /> {t.profile.viewProfile}
                          </button>
                          <button 
                             onClick={() => setSelectedChatFriend(friend)}
                             className="h-10 bg-black text-white border-2 border-black rounded-lg flex items-center justify-center gap-2 hover:bg-[#1A1A2E] transition-colors text-xs font-bold shadow-[2px_2px_0_0_#7B61FF] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                             <MessageSquare size={14} /> {t.profile.message}
                          </button>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-full p-12 border-4 border-dashed border-black/20 rounded-2xl text-center space-y-4 bg-zinc-50/50">
                       <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0_0_#000]">
                          <Users size={32} className="text-zinc-200" />
                       </div>
                       <p className="font-body text-zinc-400 font-bold uppercase tracking-widest text-xs">{t.profile.noFriendsHint}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border-4 border-black w-full max-w-lg shadow-[12px_12px_0_0_#000] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#F24236] p-6 border-b-4 border-black flex justify-between items-center">
              <h3 className="font-headline font-black text-2xl text-white uppercase tracking-tighter flex items-center gap-3">
                <Settings className="w-8 h-8" />
                {t.profile.editTitle}
              </h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 border-4 border-black rounded-full overflow-hidden shadow-[4px_4px_0_0_#000] bg-zinc-100 flex items-center justify-center">
                    {formData.image ? (
                      <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-zinc-300" />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_#000] hover:bg-[#F24236] hover:text-white transition-all transform group-hover:scale-110"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">{t.profile.changeAvatar}</p>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#2d2d42] mb-2 px-1">{t.profile.displayName}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-12 px-4 bg-zinc-50 border-2 border-black rounded-lg font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#F24236] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#2d2d42] mb-2 px-1">{t.profile.bio}</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t.profile.bioPlaceholder}
                    className="w-full h-32 p-4 bg-zinc-50 border-2 border-black rounded-lg font-medium text-sm focus:outline-none focus:shadow-[4px_4px_0_0_#F24236] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-14 border-2 border-black rounded-xl font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                >
                  {t.modals.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-14 bg-[#06D6A0] text-white border-2 border-black rounded-xl font-black uppercase tracking-wider shadow-[4px_4px_0_0_#000] hover:bg-[#05b889] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={20} /> {t.settings.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedChatFriend && (
        <DirectChatModal 
          isOpen={!!selectedChatFriend}
          onClose={() => setSelectedChatFriend(null)}
          friend={selectedChatFriend}
          currentUserId={user.id}
        />
      )}
    </main>
  );
}
