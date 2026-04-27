"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LoginVisuals() {
  const { t } = useLanguage();

  return (
    <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[#1A1A2E] bg-polka-white p-12">
      {/* Floating Elements Canvas */}
      <div className="absolute inset-0 z-0">
        {/* Decorative Shapes */}
        <div className="absolute top-20 left-1/4 h-16 w-16 rounded-full bg-[#FFD166] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"></div>
        <div className="absolute top-1/3 right-1/4 h-0 w-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-[#F24236] border-r-[30px] border-r-transparent rotate-12 drop-shadow-[4px_4px_0_#1A1A2E]"></div>
        <div className="absolute bottom-1/3 left-1/5 h-20 w-32 bg-[#06D6A0] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] -rotate-6"></div>
        <div className="absolute top-1/2 right-1/3 h-12 w-12 bg-[#118AB2] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] rotate-45"></div>
        
        {/* Zigzag lines */}
        <svg className="absolute top-1/2 left-0 w-full text-[#FFD166] opacity-80" height="20" preserveAspectRatio="none" viewBox="0 0 100 20">
          <polyline fill="none" points="0,10 10,0 20,20 30,0 40,20 50,0 60,20 70,0 80,20 90,0 100,10" stroke="currentColor" strokeLinejoin="miter" strokeWidth="4"></polyline>
        </svg>
        
        {/* Floating Mini Cards */}
        <div className="absolute top-32 right-12 z-10 w-48 -rotate-6 transform bg-[#ffffff] border-2 border-[#1A1A2E] p-4 shadow-[3px_3px_0px_#FFFFFF]">
          <p className="font-poppins text-sm font-bold text-[#2d2d42]">{t.auth.samplePost1}</p>
          <div className="mt-2 h-2 w-2/3 bg-[#d3d1f8]"></div>
        </div>
        <div className="absolute bottom-48 left-12 z-10 w-48 rotate-3 transform bg-[#ffffff] border-2 border-[#1A1A2E] p-4 shadow-[3px_3px_0px_#FFFFFF]">
          <p className="font-poppins text-sm font-bold text-[#2d2d42]">{t.auth.samplePost2}</p>
          <div className="mt-2 h-2 w-3/4 bg-[#d3d1f8]"></div>
        </div>
        <div className="absolute top-2/3 right-24 z-10 w-40 rotate-12 transform bg-[#ffffff] border-2 border-[#1A1A2E] p-4 shadow-[3px_3px_0px_#FFFFFF]">
          <p className="font-poppins text-sm font-bold text-[#2d2d42]">{t.auth.samplePost3}</p>
          <div className="mt-2 h-2 w-1/2 bg-[#d3d1f8]"></div>
        </div>
      </div>
      
      <div className="z-10 mt-auto">
        <div className="relative inline-block">
          <h1 className="font-poppins text-5xl font-extrabold text-white">ComBoard</h1>
          <svg className="absolute -bottom-3 left-0 w-full text-[#F24236]" height="12" preserveAspectRatio="none" viewBox="0 0 100 12">
            <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
          </svg>
        </div>
        <p className="mt-6 font-inter text-base text-white/70">{t.auth.brandSubtitle}</p>
      </div>
    </div>
  );
}
