"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, Shield, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";

export default function UserMenu({ user }: { user: any }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fallbackAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAhroIcGvuJUMSEpEbgv-Osv3eoKVIQavy2j59GUwsQ8LW6yD27WjliAYw4fmw-dywZ6Gc38LUxQjuW7KO-UdNTQKvKg2vpCOOyuMjLwPxpS5iphf56lIP5JaDed0F2-vuLu1wcn6_gozvXW27ygn8YikXAjdcEHmMH88dESC5K906ql_NemCw9zFeKaVx__FznIFKyKlw9H3CYqj9xjO4oWwfrvtLw1-B11eBd7cuMwk9PPl6oe4EyfR5xKI6DQ2kCqbnff4BZlgwj";
  
  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/login",
      redirect: true 
    });
  };

  if (!user) {
    return (
      <Link 
        href="/login"
        className="px-6 py-2 bg-[#F24236] border-2 border-black rounded text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:bg-[#d0352c]"
      >
        {t.auth.login}
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-full border-2 border-transparent hover:bg-zinc-100 transition-colors focus:outline-none"
      >
        <img 
          alt="User avatar" 
          className="w-8 h-8 rounded-full border-2 border-black object-cover" 
          src={user?.image || fallbackAvatar} 
        />
        <span className={`text-[#2d2d42] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white border-4 border-black shadow-[8px_8px_0_0_#000] rounded-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* User Header */}
          <div className="p-4 bg-[#f2efff] border-b-2 border-black">
            <div className="flex items-center gap-3 mb-3">
              <img 
                alt="User avatar" 
                className="w-12 h-12 rounded-full border-2 border-black object-cover shadow-[2px_2px_0_0_#000]" 
                src={user?.image || fallbackAvatar} 
              />
              <div className="overflow-hidden">
                <p className="font-headline font-black text-sm truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-cb-navy/50 truncate tracking-tight">{user?.email}</p>
              </div>
            </div>
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-1.5 bg-white border-2 border-black rounded text-[10px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              {t.userMenu.viewProfile}
            </Link>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs font-bold hover:bg-zinc-100 rounded transition-colors group"
            >
              <User size={16} className="text-zinc-400 group-hover:text-black" />
              {t.userMenu.editProfile}
            </Link>
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold hover:bg-zinc-100 rounded transition-colors group text-left"
            >
              <Settings size={16} className="text-zinc-400 group-hover:text-black" />
              {t.userMenu.settings}
            </Link>
          </div>

          {/* Footer */}
          <div className="p-2 border-t-2 border-black bg-zinc-50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-black text-[#F24236] hover:bg-red-50 rounded transition-colors group text-left uppercase tracking-widest"
            >
              <LogOut size={16} />
              {t.userMenu.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
