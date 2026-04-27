"use client";

import { useState } from "react";
import { X, Layout, Check } from "lucide-react";
import { createZone } from "@/lib/actions/zone";
import { useLanguage } from "@/context/LanguageContext";

export default function CreateZoneModal({ 
  isOpen, 
  onClose,
  boardId,
  initialX = 0,
  initialY = 0
}: { 
  isOpen: boolean; 
  onClose: (success?: boolean) => void; 
  boardId: string;
  initialX?: number;
  initialY?: number;
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [borderStyle, setBorderStyle] = useState<"solid" | "dashed">("dashed");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await createZone({
        boardId,
        name: name.trim(),
        borderStyle,
        x: initialX,
        y: initialY,
        width: 400,
        height: 400
      });
      onClose(true);
      setName("");
    } catch (error) {
      console.error(error);
      alert(t.modals.createZone.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0c0c1f]/60 backdrop-blur-sm" onClick={() => onClose()}></div>
      
      <div className="relative w-full max-w-[450px] bg-white border-4 border-black shadow-[12px_12px_0px_#000000] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b-4 border-black flex justify-between items-center bg-[#f9cc61]">
          <h2 className="font-headline font-black text-xl flex items-center gap-3 uppercase tracking-tight">
            <Layout size={24} />
            {t.modals.createZone.title}
          </h2>
          <button onClick={() => onClose()} className="p-1 hover:bg-black/10 rounded-full border-2 border-transparent hover:border-black transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 bg-white">
          <div>
            <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-3 tracking-widest">{t.modals.createZone.nameLabel}</label>
            <input 
              type="text" 
              placeholder={t.modals.createZone.namePlaceholder}
              className="w-full h-14 px-5 bg-[#f2efff] border-4 border-black focus:outline-none focus:shadow-[6px_6px_0_0_#000000] font-bold placeholder:text-zinc-400 text-lg transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-3 tracking-widest">{t.modals.createZone.borderLabel}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBorderStyle("solid")}
                className={`h-16 border-4 border-black font-bold uppercase flex items-center justify-center gap-3 transition-all ${
                  borderStyle === "solid" 
                    ? "bg-black text-white shadow-[4px_4px_0_0_#f9cc61]" 
                    : "bg-white text-black hover:bg-zinc-50"
                }`}
              >
                <div className="w-8 h-0 border-2 border-current"></div>
                {t.modals.createZone.solid}
              </button>
              <button
                onClick={() => setBorderStyle("dashed")}
                className={`h-16 border-4 border-black font-bold uppercase flex items-center justify-center gap-3 transition-all ${
                  borderStyle === "dashed" 
                    ? "bg-black text-white shadow-[4px_4px_0_0_#f9cc61]" 
                    : "bg-white text-black hover:bg-zinc-50"
                }`}
              >
                <div className="w-8 h-0 border-2 border-dashed border-current"></div>
                {t.modals.createZone.dashed}
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#e8e5ff] border-2 border-black border-dashed flex gap-3">
             <div className="text-2xl mt-0.5">💡</div>
             <p className="text-[11px] font-bold text-[#2d2d42] leading-tight">
               {t.modals.createZone.hint}
             </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-[#f2efff] flex justify-between items-center">
          <button 
            onClick={() => onClose()}
            className="text-xs font-black uppercase tracking-widest text-[#5a5971] hover:text-[#b71212] transition-colors"
          >
            {t.modals.cancel}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="bg-[#06D6A0] border-4 border-black px-10 py-4 text-black font-headline font-black text-sm shadow-[6px_6px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#05b88a] disabled:opacity-50 disabled:grayscale uppercase tracking-widest"
          >
            {loading ? t.modals.createBoard.creating : t.modals.createZone.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
