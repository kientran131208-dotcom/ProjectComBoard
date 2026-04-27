"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check } from "lucide-react";
import { getNotifications, getUnreadNotificationCount, markAsRead, markAllAsRead } from "@/lib/actions/notification";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function NotificationBell({ initialCount = 0 }: { initialCount: number }) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateLocale = language === 'vi' ? vi : enUS;

  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map((n: any) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className={`relative w-9 h-9 flex items-center justify-center border-2 border-cb-navy rounded shadow-hard-sm hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${isOpen ? 'bg-cb-yellow' : 'bg-white'}`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-cb-red text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-[1px_1px_0_0_#000]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border-2 border-cb-navy rounded shadow-hard z-[100] max-h-[400px] flex flex-col">
          <div className="p-3 border-b-2 border-cb-navy bg-cb-yellow flex items-center justify-between">
            <span className="font-bold text-sm tracking-tight">{t.header.notifications || "Thông báo"}</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-black uppercase hover:underline"
              >
                {t.header.markAllRead || "Đọc tất cả"}
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-xs font-bold text-cb-navy/40">
                {t.modals.loading || "Đang tải..."}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-cb-navy/40">
                {t.header.noNotifications || "Không có thông báo nào"}
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div 
                  key={notif.id}
                  className={`p-3 border-b border-cb-navy/10 flex gap-3 hover:bg-slate-50 transition-colors relative group ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex-1">
                    <p className={`text-xs ${!notif.isRead ? 'font-bold' : 'text-cb-navy/70'}`}>
                      {notif.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {notif.board && (
                        <span className="text-[10px] font-black text-cb-red uppercase tracking-tight">
                          {notif.board.emoji} {notif.board.name}
                        </span>
                      )}
                      <span className="text-[10px] text-cb-navy/40">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: dateLocale })}
                      </span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-cb-yellow rounded border border-cb-navy transition-all"
                      title={t.header.markRead || "Đánh dấu đã đọc"}
                    >
                      <Check size={10} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
