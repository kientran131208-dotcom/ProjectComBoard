"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Users, RefreshCw } from "lucide-react";
import { sendMessage, getBoardMessages } from "@/lib/actions/chat";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function BoardChat({ boardId, boardName, members, currentUserId }: { 
  boardId: string, 
  boardName: string, 
  members: any[],
  currentUserId: string | null 
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const data = await getBoardMessages(boardId);
      
      // Calculate unread count if sidebar is closed
      if (!isOpen && !isInitial) {
        const newMessages = data.filter((m: any) => new Date(m.createdAt).getTime() > lastSeenTimestamp);
        if (newMessages.length > 0) {
          setUnreadCount(prev => prev + newMessages.length);
          // Update last seen to the latest message so we don't double count
          setLastSeenTimestamp(Math.max(...data.map((m: any) => new Date(m.createdAt).getTime())));
        }
      }

      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadMessages(true);
  }, []);

  // Polling for "real-time" feel
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, lastSeenTimestamp]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setLastSeenTimestamp(Date.now());
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !currentUserId) return;

    setIsSending(true);
    try {
      const msg = await sendMessage({
        content: newMessage.trim(),
        boardId
      });
      setMessages([...messages, msg]);
      setNewMessage("");
      setLastSeenTimestamp(Date.now());
    } catch (error) {
      alert(t.chat.errorSending);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-cb-yellow border-4 border-black rounded-full flex items-center justify-center shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] active:translate-y-0 active:shadow-none transition-all z-[1000]"
      >
        <MessageCircle size={32} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-7 h-7 bg-[#F24236] border-2 border-black rounded-full flex items-center justify-center text-white text-[10px] font-black animate-bounce shadow-[2px_2px_0_0_#000]">
            +{unreadCount}
          </span>
        )}
      </button>

      {/* Chat Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white border-l-4 border-black z-[2000] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 bg-cb-navy text-white border-b-4 border-black flex justify-between items-center">
            <div>
              <h3 className="font-headline font-black text-xl uppercase tracking-tighter italic">{t.chat.title}</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{boardName}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => loadMessages(true)}
                disabled={isLoading}
                className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Members List (Compact Header) */}
          <div className="px-4 py-2 bg-zinc-100 border-b-2 border-black flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
             <div className="flex -space-x-2">
               {members.slice(0, 5).map((m: any, i: number) => (
                 <div key={m.userId} className="w-6 h-6 border-2 border-black rounded-full overflow-hidden bg-white shadow-sm" title={m.user.name}>
                   <img src={m.user.image || `https://ui-avatars.com/api/?name=${m.user.name}`} alt="avatar" />
                 </div>
               ))}
               {members.length > 5 && (
                 <div className="w-6 h-6 border-2 border-black rounded-full bg-black text-white text-[8px] flex items-center justify-center font-bold">
                   +{members.length - 5}
                 </div>
               )}
             </div>
             <span className="text-[9px] font-bold uppercase tracking-widest text-cb-navy/50">
               {members.length} {t.chat.membersJoined}
             </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-polka-light">
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-zinc-100 border-2 border-black rounded-xl flex items-center justify-center transform rotate-12">
                   <Users className="text-zinc-300" size={32} />
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.chat.noMessages}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-white shadow-sm shrink-0 mb-1">
                         <img src={msg.sender.image || `https://ui-avatars.com/api/?name=${msg.sender.name}`} alt="avatar" />
                      </div>
                    )}
                    
                    {/* Bubble Content */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {!isMe && (
                          <span className="text-[9px] font-black uppercase text-cb-navy/60">{msg.sender.name}</span>
                        )}
                        <span className="text-[8px] font-bold text-zinc-300">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-xl text-sm font-medium ${
                        isMe 
                          ? 'bg-cb-yellow' 
                          : 'bg-white'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t-4 border-black">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t.chat.placeholder}
                disabled={!currentUserId || isSending}
                className="flex-1 h-12 bg-zinc-100 border-2 border-black rounded-lg px-4 text-sm font-bold focus:outline-none focus:shadow-[3px_3px_0_0_#F24236] transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSending || !currentUserId}
                className="w-12 h-12 bg-cb-red border-2 border-black rounded-lg flex items-center justify-center text-white shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px]"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
            {!currentUserId && (
              <p className="text-[10px] text-zinc-400 mt-2 text-center font-bold italic">{t.chat.loginToChat}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
