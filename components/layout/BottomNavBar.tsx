"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const Icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
    </svg>
  ),
  explore: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z" fill="currentColor"/>
    </svg>
  ),
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
    </svg>
  ),
  person: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
    </svg>
  )
};

export default function BottomNavBar() {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white md:hidden border-t-2 border-black rounded-t-lg shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.05)]">
      <Link href="#" className="flex flex-col items-center justify-center text-zinc-900 px-4 py-1 hover:text-[#F24236] transition-all">
         {Icons.home}
         <span className="font-headline font-bold text-[10px] uppercase tracking-widest mt-1">{t.dashboard.home}</span>
      </Link>
      <Link href="#" className="flex flex-col items-center justify-center text-zinc-900 px-4 py-1 hover:text-[#F24236] transition-all">
         {Icons.explore}
         <span className="font-headline font-bold text-[10px] uppercase tracking-widest mt-1">{t.dashboard.discover}</span>
      </Link>
      <Link href="/" className="flex flex-col items-center justify-center bg-[#F24236] text-white rounded-md border-2 border-black px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform">
         {Icons.dashboard}
         <span className="font-headline font-bold text-[10px] uppercase tracking-widest mt-1">{t.dashboard.boards}</span>
      </Link>
      <Link href="#" className="flex flex-col items-center justify-center text-zinc-900 px-4 py-1 hover:text-[#F24236] transition-all">
         {Icons.person}
         <span className="font-headline font-bold text-[10px] uppercase tracking-widest mt-1">{t.dashboard.profile}</span>
      </Link>
    </nav>
  );
}
