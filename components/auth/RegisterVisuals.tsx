"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function RegisterVisuals() {
  const { t } = useLanguage();

  return (
    <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[#1A1A2E] bg-polka-white p-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 h-16 w-16 rounded-full bg-[#FFD166] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"></div>
        <div className="absolute top-1/3 right-1/4 h-0 w-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-[#F24236] border-r-[30px] border-r-transparent rotate-12 drop-shadow-[4px_4px_0_#1A1A2E]"></div>
        <div className="absolute bottom-1/3 left-1/5 h-20 w-32 bg-[#06D6A0] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] -rotate-6"></div>
        <div className="absolute top-1/2 right-1/3 h-12 w-12 bg-[#118AB2] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] rotate-45"></div>
      </div>
      
      <div className="z-10 mt-auto">
        <div className="relative inline-block">
          <h1 className="font-poppins text-5xl font-extrabold text-white">ComBoard</h1>
          <svg className="absolute -bottom-3 left-0 w-full text-[#F24236]" height="12" preserveAspectRatio="none" viewBox="0 0 100 12">
            <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
          </svg>
        </div>
        <p className="mt-6 font-inter text-base text-white/70">{t.auth.brandRegisterSubtitle}</p>
      </div>
    </div>
  );
}
