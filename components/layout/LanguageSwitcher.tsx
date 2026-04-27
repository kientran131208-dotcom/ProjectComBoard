"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white border-2 border-black rounded p-0.5 shadow-hard-sm">
      <button
        onClick={() => setLanguage("vi")}
        className={`px-2 py-1 text-[10px] font-black uppercase tracking-tighter rounded-sm transition-all ${
          language === "vi" 
            ? "bg-cb-navy text-white" 
            : "text-cb-navy hover:bg-zinc-100"
        }`}
      >
        VN
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 text-[10px] font-black uppercase tracking-tighter rounded-sm transition-all ${
          language === "en" 
            ? "bg-cb-navy text-white" 
            : "text-cb-navy hover:bg-zinc-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}
