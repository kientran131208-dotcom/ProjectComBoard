"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function BoardError({ isKicked }: { isKicked: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8f5ff] flex flex-col items-center justify-center p-8 text-center bg-polka-dark">
      <div className="bg-white border-4 border-black p-12 max-w-lg w-full shadow-[12px_12px_0_0_#F24236] animate-in zoom-in-95 duration-300">
        <div className="text-8xl mb-8 transform -rotate-12 inline-block">
          {isKicked ? "🚪" : "🏚️"}
        </div>
        <h1 className="font-headline font-black text-4xl uppercase tracking-tighter mb-4 text-[#2d2d42]">
          {isKicked ? t.board.accessDenied : t.board.boardNotFound}
        </h1>
        <p className="font-body text-lg text-[#5a5971] mb-8 leading-relaxed">
          {isKicked ? t.board.kickedMessage : t.board.notFoundMessage}
        </p>
        
        <Link 
          href="/" 
          className="inline-block bg-[#F24236] text-white font-headline font-bold text-lg px-10 py-4 border-4 border-black shadow-[6px_6px_0_0_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-widest"
        >
          {t.board.backToHome}
        </Link>
      </div>
      
      <div className="mt-12 text-zinc-400 font-bold text-xs uppercase tracking-[0.2em]">
        ComBoard Community Engine
      </div>
    </div>
  );
}
