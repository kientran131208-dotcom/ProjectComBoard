"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function InviteClient({ 
  board, 
  code, 
  handleJoin, 
  isApproved, 
  isPending, 
  showSuccess 
}: { 
  board: any, 
  code: string, 
  handleJoin: () => void,
  isApproved: boolean,
  isPending: boolean,
  showSuccess: boolean
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-[#f8f5ff] text-[#2d2d42] font-inter min-h-screen bg-polka-dark p-8 flex flex-col md:flex-row gap-12 justify-center items-center overflow-auto">
      {/* LEFT SECTION: INVITE PREVIEW */}
      <div className={`w-full max-w-[520px] bg-white border-2 border-[#2d2d42] shadow-[8px_8px_0px_0px_#2d2d42] rounded-xl relative overflow-hidden flex flex-col transition-all duration-500 ${showSuccess ? 'opacity-50 blur-[2px] pointer-events-none scale-95' : 'opacity-100'}`}>
        {/* Decorative Triangle */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#f9cc61] transform rotate-45 z-10 border-2 border-[#2d2d42]"></div>
        
        {/* Header Strip */}
        <div 
          className="h-[140px] border-b-2 border-[#2d2d42] relative flex items-center justify-center memphis-pattern-zigzag"
          style={{ backgroundColor: board.color }}
        >
          <div className="absolute top-4 left-4 bg-white border-2 border-[#2d2d42] px-3 py-1 rounded-full shadow-[4px_4px_0px_0px_#2d2d42] flex items-center gap-2">
            <span className="text-xs font-semibold font-inter">{t.invite.title}</span>
          </div>
          <div className="text-6xl bg-white rounded-full p-2 border-2 border-[#2d2d42] shadow-[4px_4px_0px_0px_#2d2d42] relative z-10">
            {board.emoji}
          </div>
          <div className="absolute bottom-[-16px] right-6 bg-white border-2 border-[#2d2d42] px-4 py-1.5 rounded-full shadow-[4px_4px_0px_0px_#2d2d42] z-20">
            <span className="text-sm font-bold font-inter">{board._count.members} {t.invite.members}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[#5a5971] text-sm font-medium">{t.invite.invitedTo}</span>
            <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-3xl leading-tight">{board.name}</h1>
            <p className="text-[#5a5971] text-sm leading-relaxed mt-2">{board.description || t.invite.defaultDesc}</p>
          </div>

          <div className="w-full border-t-2 border-dashed border-[#acaac5] my-2"></div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center bg-white border-2 border-[#2d2d42] rounded-lg p-2 shadow-[2px_2px_0px_0px_#2d2d42]">
              <input 
                className="bg-transparent border-none outline-none flex-grow text-sm font-mono text-[#5a5971] p-2 w-full focus:ring-0" 
                readOnly 
                type="text" 
                value={`comboard.app/invite/${code}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <form action={handleJoin}>
              <button 
                type="submit" 
                className="w-full bg-[#F24236] text-white font-['Plus_Jakarta_Sans'] font-bold text-lg h-14 rounded-lg border-2 border-[#2d2d42] shadow-[6px_6px_0px_0px_#2d2d42] hover:bg-[#b71212] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none flex items-center justify-center gap-2"
              >
                <span>🎉</span> {t.invite.joinNow}
              </button>
            </form>
            
            <Link href="/" className="w-full">
              <button 
                type="button"
                className="w-full bg-white text-[#2d2d42] font-['Plus_Jakarta_Sans'] font-bold h-12 rounded-lg border-2 border-[#2d2d42] shadow-[3px_3px_0px_0px_#2d2d42] hover:bg-[#f2efff] transition-all active:translate-y-[1px] active:translate-x-[1px] active:shadow-none"
              >
                 {t.invite.backToHome}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: SUCCESS / PENDING STATE */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-[480px] bg-white border-4 border-[#2d2d42] shadow-[12px_12px_0px_0px_#2d2d42] rounded-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Success Header Box */}
            <div 
              className={`h-[160px] border-b-4 border-[#2d2d42] relative flex items-center justify-center ${isPending ? 'bg-[#FFD166]' : 'bg-[#06D6A0]'} memphis-pattern-zigzag`}
            >
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-4 h-4 bg-white border-2 border-black rounded-full"></div>
              <div className="absolute top-2 right-12 w-0 h-0 border-l-[10px] border-l-transparent border-b-[20px] border-b-white border-r-[10px] border-r-transparent transform rotate-12"></div>
              <div className="absolute bottom-6 left-12 w-6 h-6 bg-[#F24236] border-2 border-black rotate-45"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-white border-2 border-black"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="text-6xl animate-bounce">
                  {isPending ? "⏳" : "🎊"}
                </div>
              </div>
            </div>

            {/* Success Content */}
            <div className="p-8 flex flex-col items-center text-center gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-['Plus_Jakarta_Sans'] font-black text-3xl uppercase tracking-tighter">
                  {isPending ? t.invite.requestSent : t.invite.joinSuccess}
                </h2>
                <p className="text-[#5a5971] text-sm font-medium px-4">
                  {isPending 
                    ? t.invite.pendingDesc.replace("{name}", board.name)
                    : t.invite.successDesc.replace("{name}", board.name)}
                </p>
              </div>

              {/* Stats Box */}
              {!isPending && (
                <div className="bg-[#f9cc61]/10 border-2 border-dashed border-[#f9cc61] rounded-lg px-6 py-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2d2d42]">{t.invite.memberCount.replace("{count}", (board._count.members + 1).toString())}</span>
                </div>
              )}

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button className="bg-[#f9cc61] border-2 border-[#2d2d42] rounded-lg py-3 px-4 font-bold text-xs uppercase flex flex-col items-center gap-1 shadow-[4px_4px_0px_0px_#2d2d42] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                  <span className="text-xl">👁️</span>
                  {t.invite.viewBoard}
                </button>
                <button className="bg-[#06D6A0] border-2 border-[#2d2d42] rounded-lg py-3 px-4 font-bold text-xs uppercase flex flex-col items-center gap-1 shadow-[4px_4px_0px_0px_#2d2d42] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                  <span className="text-xl">🔗</span>
                  {t.invite.referFriend}
                </button>
              </div>

              {/* Divider */}
              <div className="w-full border-t-2 border-dashed border-[#acaac5] mt-2"></div>
              
              <div className="w-full">
                <p className="text-[10px] font-black uppercase text-[#5a5971] mb-2 text-left">{t.invite.shareHint}</p>
                <div className="flex items-center bg-[#f2efff] border-2 border-[#2d2d42] rounded-lg p-2 overflow-hidden">
                  <span className="text-xs font-mono text-zinc-500 truncate flex-1">{`comboard.app/invite/${code}`}</span>
                  <button className="p-1 text-[#F24236]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main CTA */}
              <Link href={isPending ? "/" : `/board/${board.id}`} className="w-full">
                <button className="w-full bg-[#b71212] text-white font-black py-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-[#d0352c] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase flex items-center justify-center gap-2">
                  {isPending ? t.invite.backToHome : t.invite.enterBoard}
                  <span>➡️</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
