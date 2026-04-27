"use client";

import { useState, useRef, useEffect } from "react";
import { updateBoard } from "@/lib/actions/board";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Icons = {
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
    </svg>
  ),
  camera: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="currentColor"/>
      <path d="M18 11.09V6.25C18 5.01 16.99 4 15.75 4H8.25C7.01 4 6 5.01 6 6.25V17.75C6 18.99 7.01 20 8.25 20H15.75C16.99 20 18 18.99 18 17.75V12.91L21 15V9L18 11.09ZM16 11.22L19 9.38V14.62L16 12.78V17.75C16 17.89 15.89 18 15.75 18H8.25C8.11 18 8 17.89 8 17.75V6.25C8 6.11 8.11 6 8.25 6H15.75C15.89 6 16 6.11 16 6.25V11.22Z" fill="currentColor"/>
    </svg>
  ),
  arrowForward: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
    </svg>
  )
};

export default function EditBoardModal({ 
  isOpen, 
  onClose,
  board
}: { 
  isOpen: boolean; 
  onClose: () => void;
  board: any;
}) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: board.name || "",
    description: board.description || "",
    emoji: board.emoji || "🏘️",
    color: board.color || "#f9cc61",
    image: board.image || null as string | null,
    privacy: board.isPublic ? "public" : "private",
    approvalRequired: board.approvalRequired || false,
    tags: (board.tags || []) as string[]
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: board.name || "",
        description: board.description || "",
        emoji: board.emoji || "🏘️",
        color: board.color || "#f9cc61",
        image: board.image || null,
        privacy: board.isPublic ? "public" : "private",
        approvalRequired: board.approvalRequired || false,
        tags: (board.tags || []) as string[]
      });
      setStep(1);
    }
  }, [isOpen, board]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      await updateBoard(board.id, {
        name: formData.name,
        description: formData.description,
        emoji: formData.emoji,
        color: formData.color,
        image: formData.image || undefined,
        tags: formData.tags,
        isPublic: formData.privacy === "public",
        approvalRequired: formData.approvalRequired
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert(t.modals.editBoard.error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  const emojis = ["🏘️", "🏢", "🏫", "🌆", "👨‍👩‍👧", "🎯"];
  const colors = [
    { value: "#f9cc61", label: "Vàng" },
    { value: "#06D6A0", label: "Xanh lá" },
    { value: "#F24236", label: "Đỏ" },
    { value: "#118AB2", label: "Xanh biển" },
    { value: "#1A1A2E", label: "Than" }
  ];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#0c0c1f] opacity-80"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-[580px] bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh] z-[110] overflow-hidden">
        
        <div 
          className="absolute -top-3 -right-3 w-10 h-10 bg-[#f9cc61] border-2 border-black transform rotate-12 z-30 flex items-center justify-center shadow-[4px_4px_0px_#000000]" 
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        ></div>

        <div className="p-6 border-b-2 border-black bg-[#f2efff] rounded-t-xl relative">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-headline font-bold text-2xl text-[#2d2d42] flex items-center gap-2">
                <span className="text-3xl">⚙️</span> {t.modals.editBoard.title}
              </h2>
              <p className="text-sm text-[#5a5971] mt-1 font-medium">{t.modals.editBoard.subtitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_#000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              {Icons.close}
            </button>
          </div>
        </div>

        <div className="px-8 py-5 border-b-2 border-[#e8e5ff] bg-white">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 border-t-2 border-dashed border-[#acaac5] z-0"></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_#000000] ${step === s ? "bg-[#b71212] text-white" : "bg-[#f2efff] text-[#5a5971]"}`}>
                  {s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s ? "text-[#b71212]" : "text-[#5a5971]"}`}>
                  {s === 1 ? t.modals.createBoard.step1 : s === 2 ? t.modals.createBoard.step2 : t.modals.createBoard.step3}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-[#f8f5ff] bg-polka-dots">
          
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold text-[#2d2d42] mb-3">{t.modals.createBoard.avatar}</label>
                <div className="flex gap-6 items-start">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-32 h-32 border-2 border-dashed border-black bg-[#f2efff] flex flex-col items-center justify-center cursor-pointer hover:bg-[#e2dfff] transition-colors rounded-lg overflow-hidden"
                  >
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="text-[#5a5971] mb-2">{Icons.camera}</span>
                        <span className="text-[10px] font-bold text-[#5a5971]">{t.modals.createBoard.upload}</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#5a5971] mb-3 font-bold">{t.modals.createBoard.chooseEmoji}:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {emojis.map((e) => (
                        <button 
                          key={e}
                          type="button"
                          onClick={() => setFormData({ ...formData, emoji: e })}
                          className={`h-12 border-2 border-black flex items-center justify-center text-xl transition-all ${formData.emoji === e ? "bg-[#f9cc61] shadow-[4px_4px_0px_#000000]" : "bg-white hover:bg-zinc-50"}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-[#2d2d42]">{t.modals.createBoard.name} *</label>
                  <span className="text-[10px] font-bold text-[#5a5971]">{formData.name.length}/60</span>
                </div>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 60) })}
                  className="w-full h-12 px-4 bg-white border-2 border-black text-[#2d2d42] font-bold focus:outline-none shadow-[4px_4px_0px_#b71212]" 
                  placeholder={t.modals.createBoard.namePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2d2d42] mb-2">{t.modals.createBoard.desc}</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 p-4 bg-white border-2 border-black text-[#2d2d42] font-medium focus:outline-none focus:shadow-[4px_4px_0px_#000000] transition-all resize-none" 
                  placeholder={t.modals.createBoard.descPlaceholder}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2d2d42] mb-3">{t.modals.createBoard.theme}</label>
                <div className="flex gap-4">
                  {colors.map((c) => (
                    <button 
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-10 h-10 rounded-full border-2 border-black transition-transform relative overflow-hidden ${formData.color === c.value ? "scale-125 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" : "hover:scale-110"}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 bg-[#f9cc61] border-2 border-black rounded-full flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000000] mb-4 transform -rotate-12">🏷️</div>
                <h3 className="font-headline font-bold text-xl mb-1">{t.modals.createBoard.tags}</h3>
                <p className="text-xs text-[#5a5971]">{t.modals.createBoard.tagsSubtitle}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2d2d42] mb-2">{t.modals.createBoard.tagInputLabel}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#b71212]">#</span>
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full h-12 pl-8 pr-4 bg-white border-2 border-black text-[#2d2d42] font-bold focus:outline-none shadow-[4px_4px_0px_#000000] placeholder:font-medium" 
                      placeholder={t.modals.createBoard.tagInputPlaceholder}
                    />
                  </div>
                </div>

                <div className="min-h-[120px] p-4 bg-white border-2 border-black rounded-md flex flex-wrap gap-2 items-start content-start">
                  {formData.tags.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center py-6 opacity-30">
                      <p className="text-xs font-bold text-[#5a5971]">{t.modals.createBoard.noTags}</p>
                    </div>
                  ) : (
                    formData.tags.map((tag) => (
                      <div 
                        key={tag} 
                        className="group px-3 py-1.5 bg-[#f2efff] border-2 border-black text-xs font-bold shadow-[2px_2px_0px_#000000] flex items-center gap-2 hover:bg-[#b71212] hover:text-white transition-colors cursor-default"
                      >
                        <span>#{tag}</span>
                        <button onClick={() => removeTag(tag)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/20">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#2d2d42] mb-3">{t.modals.createBoard.privacy}</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: 'public' })}
                    className={`h-14 border-2 border-black flex items-center justify-center gap-2 font-bold transition-all ${formData.privacy === 'public' ? "bg-[#f9cc61] shadow-[4px_4px_0px_#000000]" : "bg-white text-[#5a5971]"}`}
                  >
                    <span>🌐</span> {t.modals.createBoard.public}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: 'private' })}
                    className={`h-14 border-2 border-black flex items-center justify-center gap-2 font-bold transition-all ${formData.privacy === 'private' ? "bg-[#f9cc61] shadow-[4px_4px_0px_#000000]" : "bg-white text-[#5a5971]"}`}
                  >
                    <span>🔒</span> {t.modals.createBoard.private}
                  </button>
                </div>
              </div>

              <div 
                className={`p-4 border-2 border-black rounded-lg cursor-pointer transition-all flex items-center justify-between ${formData.approvalRequired ? 'bg-[#06D6A0]/10 border-cb-green' : 'bg-white'}`}
                onClick={() => setFormData({ ...formData, approvalRequired: !formData.approvalRequired })}
              >
                <div className="flex items-center gap-3">
                   <div className={`w-6 h-6 border-2 border-black rounded flex items-center justify-center transition-colors ${formData.approvalRequired ? 'bg-[#06D6A0]' : 'bg-white'}`}>
                      {formData.approvalRequired && <Check size={14} className="text-white" />}
                   </div>
                   <div>
                      <h4 className="text-sm font-black uppercase">{t.modals.createBoard.approval}</h4>
                      <p className="text-[10px] text-[#5a5971] font-bold">{t.modals.createBoard.approvalDesc}</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 border-black bg-[#f2efff] shrink-0 flex justify-between items-center rounded-b-xl">
          <button 
            type="button"
            onClick={handleBack}
            className="px-6 py-3 border-2 border-black bg-white text-[#2d2d42] font-bold rounded-sm shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            {step === 1 ? t.modals.createBoard.cancel : t.modals.createBoard.back}
          </button>
          <button 
            disabled={loading || (step === 1 && !formData.name)}
            onClick={handleSubmit}
            className="px-8 py-3 border-2 border-black bg-[#b71212] text-white font-bold rounded-sm shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? t.modals.editBoard.updating : step === 3 ? t.settings.save : t.modals.createBoard.next}
            {!loading && <span className="font-bold">{Icons.arrowForward}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
