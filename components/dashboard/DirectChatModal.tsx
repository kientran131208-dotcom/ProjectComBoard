"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, RefreshCw, User } from "lucide-react";
import { sendMessage, getDirectMessages } from "@/lib/actions/chat";

export default function DirectChatModal({ 
  isOpen, 
  onClose, 
  friend, 
  currentUserId 
}: { 
  isOpen: boolean;
  onClose: () => void;
  friend: any;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    if (!friend?.id) return;
    setIsLoading(true);
    try {
      const data = await getDirectMessages(friend.id);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && friend) {
      loadMessages();
    }
  }, [isOpen, friend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !currentUserId || !friend?.id) return;

    setIsSending(true);
    try {
      const msg = await sendMessage({
        content: newMessage.trim(),
        receiverId: friend.id
      });
      setMessages([...messages, msg]);
      setNewMessage("");
    } catch (error) {
      alert("Lỗi khi gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !friend) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black w-full max-w-md shadow-[12px_12px_0_0_#000] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 bg-cb-navy text-white border-b-4 border-black flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 border-2 border-white rounded-full overflow-hidden bg-cb-yellow">
                <img src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}`} alt="avatar" />
             </div>
             <div>
                <h3 className="font-headline font-black text-lg leading-tight truncate w-40">{friend.name}</h3>
                <div className="flex items-center gap-1 opacity-60">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                   <span className="text-[9px] font-bold uppercase tracking-widest">Đang hoạt động</span>
                </div>
             </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={loadMessages}
              disabled={isLoading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-polka-light">
          {messages.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-zinc-50 border-2 border-black rounded-full flex items-center justify-center transform rotate-12">
                 <User className="text-zinc-200" size={32} />
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider leading-relaxed">
                Đây là khởi đầu của cuộc trò chuyện <br/> riêng tư với <strong>{friend.name}</strong>.
              </p>
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

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div className={`p-3 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-xl text-sm font-medium ${
                      isMe 
                        ? 'bg-cb-yellow' 
                        : 'bg-white'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-zinc-300 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t-4 border-black shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn riêng..."
              disabled={isSending}
              className="flex-1 h-12 bg-zinc-50 border-2 border-black rounded-xl px-4 text-sm font-bold focus:outline-none focus:shadow-[3px_3px_0_0_#F24236] transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="w-12 h-12 bg-[#F24236] border-2 border-black rounded-xl flex items-center justify-center text-white shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px]"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
