"use client";

import { useState, useRef } from "react";
import { X, Megaphone, RefreshCcw, HelpCircle, Upload, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { createPost } from "@/lib/actions/post";
import { useLanguage } from "@/context/LanguageContext";

export default function CreatePostModal({ 
  isOpen, 
  onClose,
  boardId,
  initialX = 0,
  initialY = 0,
  mode = "ANNOUNCEMENT"
}: { 
  isOpen: boolean; 
  onClose: (success?: boolean) => void; 
  boardId: string;
  initialX?: number;
  initialY?: number;
  mode?: "ANNOUNCEMENT" | "IMAGE" | "LINK" | "POLL";
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [formData, setFormData] = useState({
    type: "ANNOUNCEMENT" as "ANNOUNCEMENT" | "BORROWING" | "QNA" | "POLL",
    title: "",
    content: "",
    image: "",
    link: "",
    status: "OPEN" as "OPEN" | "IN_PROGRESS" | "DONE"
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t.modals.createPost.imageLarge);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const finalTitle = formData.title || (mode === "IMAGE" ? `🖼️ ${t.modals.createPost.image}` : mode === "LINK" ? `🔗 ${t.modals.createPost.linkTitle}` : mode === "POLL" ? `📊 ${t.modals.createPost.pollTitle}` : "");
    const finalContent = formData.content || (mode === "IMAGE" ? "Image Shared" : mode === "LINK" ? "Link Shared" : mode === "POLL" ? "Please vote below" : "");

    if (!finalTitle || (mode !== "IMAGE" && mode !== "LINK" && mode !== "POLL" && !finalContent)) return;
    
    setLoading(true);
    try {
      await createPost({
        boardId,
        title: finalTitle,
        content: finalContent,
        image: formData.image || undefined,
        link: formData.link || undefined,
        pollOptions: mode === "POLL" ? pollOptions.filter((o: any) => o.trim() !== "") : undefined,
        type: mode === "POLL" ? "POLL" : formData.type,
        status: formData.status,
        x: initialX,
        y: initialY
      });
      onClose(true);
      setFormData({ type: "ANNOUNCEMENT", title: "", content: "", image: "", link: "", status: "OPEN" });
      setPollOptions(["", ""]);
    } catch (error) {
      console.error(error);
      alert(t.modals.createPost.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0c0c1f]/60 backdrop-blur-sm" onClick={() => onClose()}></div>
      
      <div className="relative w-full max-w-[500px] bg-white border-2 border-black shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-white">
          <h2 className="font-headline font-bold text-xl flex items-center gap-2">
            {mode === "IMAGE" ? t.modals.createPost.image : mode === "LINK" ? t.modals.createPost.link : mode === "POLL" ? t.modals.createPost.poll : t.modals.createPost.announcement}
          </h2>
          <button onClick={() => onClose()} className="p-1 hover:bg-zinc-100 rounded">
            <X size={24} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6 bg-white">
          {/* Type Selector */}
          {mode === "ANNOUNCEMENT" && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'ANNOUNCEMENT', icon: Megaphone, label: t.types.announcement, color: 'bg-[#F9D478]' },
                { type: 'BORROWING', icon: RefreshCcw, label: t.types.borrowing, color: 'bg-[#7BEEB3]' },
                { type: 'QNA', icon: HelpCircle, label: t.types.qna, color: 'bg-[#D9D7FF]' },
              ].map((item: any) => (
                <button 
                  key={item.type}
                  onClick={() => setFormData({ ...formData, type: item.type as any })}
                  className={`relative h-20 border-2 border-black flex flex-col items-center justify-center gap-1 transition-all ${formData.type === item.type ? `${item.color} shadow-[4px_4px_0_0_#000000]` : `${item.color}/30 opacity-60`}`}
                >
                  <item.icon size={18} />
                  <span className="text-[9px] font-bold uppercase">{item.label}</span>
                  {formData.type === item.type && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#b71212] border-2 border-black rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

            {/* POLL MODE */}
            {mode === "POLL" && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-2 tracking-widest">{t.modals.createPost.pollTitle}</label>
                  <input 
                    type="text" 
                    placeholder={t.modals.createPost.pollPlaceholder}
                    className="w-full h-12 px-4 bg-[#fff8f6] border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_0_#000000] font-bold placeholder:text-zinc-400"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-2 tracking-widest text-[#F24236]">{t.modals.createPost.options}</label>
                  {pollOptions.map((option: any, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`${t.modals.createPost.optionPlaceholder} ${idx + 1}`}
                        className="flex-1 h-10 px-4 bg-[#f2efff] border-2 border-black focus:outline-none font-bold"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[idx] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                      />
                      {pollOptions.length > 2 && (
                        <button 
                          onClick={() => setPollOptions(pollOptions.filter((_: any, i: number) => i !== idx))}
                          className="bg-white border-2 border-black p-2 hover:bg-red-50 text-red-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 5 && (
                    <button 
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      className="w-full py-2 border-2 border-dashed border-black text-[10px] font-black uppercase hover:bg-zinc-50"
                    >
                      {t.modals.createPost.addOption}
                    </button>
                  )}
                </div>
              </>
            )}
          <div className="space-y-4">
            {/* ANNOUNCEMENT MODE */}
            {mode === "ANNOUNCEMENT" && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-2 tracking-widest">{t.modals.createPost.title}</label>
                  <input 
                    type="text" 
                    placeholder="..." 
                    className="w-full h-12 px-4 bg-[#f2efff] border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_0_#000000] font-bold placeholder:text-zinc-400"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2 relative">
                   <label className="block text-xs font-black uppercase text-[#1A1A2E] tracking-widest">{t.modals.createPost.upload}</label>
                   <div className="relative group">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-12 border-2 border-dashed border-black flex items-center justify-center gap-2 hover:bg-[#FFF8F6] transition-all relative overflow-hidden ${formData.image ? 'border-solid bg-[#06D6A0]/10' : ''}`}
                      >
                        {formData.image ? (
                            <>
                              <ImageIcon size={16} className="text-[#06D6A0]" />
                              <span className="text-[10px] font-bold text-[#06D6A0]">{t.modals.createPost.selected}</span>
                              <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
                            </>
                        ) : (
                            <>
                              <Upload size={16} />
                              <span className="text-[10px] font-bold">{t.modals.createPost.chooseFile}</span>
                            </>
                        )}
                      </button>
                      
                      {formData.image && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, image: "" });
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-[#b71212] text-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_#000000] hover:translate-y-[-1px] transition-transform z-10"
                        >
                          <X size={14} />
                        </button>
                      )}
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-2 tracking-widest">{t.modals.createPost.content}</label>
                  <textarea 
                    placeholder="..." 
                    className="w-full h-24 p-4 bg-[#f2efff] border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_0_#000000] font-medium resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* IMAGE MODE */}
            {mode === "IMAGE" && (
              <div className="flex flex-col gap-6 relative py-4">
                 <div>
                    <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-2 tracking-widest">{t.modals.createPost.imageTitle}</label>
                    <input 
                      type="text" 
                      placeholder={t.modals.createPost.imagePlaceholder}
                      className="w-full h-12 px-4 bg-[#f2efff] border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_0_#000000] font-bold placeholder:text-zinc-400"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                 </div>

                 <div className="flex flex-col gap-4 relative">
                    <label className="block text-xs font-black uppercase text-[#1A1A2E] tracking-widest text-center mb-2">{t.modals.createPost.imageDesc}</label>
                    <div className="relative group max-w-[300px] mx-auto w-full">
                       <button 
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full h-40 border-4 border-dashed border-black flex flex-col items-center justify-center gap-4 hover:bg-[#FFF8F6] transition-all relative overflow-hidden ${formData.image ? 'border-solid bg-[#06D6A0]/10' : ''}`}
                       >
                         {formData.image ? (
                             <>
                               <ImageIcon size={32} className="text-[#06D6A0]" />
                               <span className="text-xs font-bold text-[#06D6A0]">{t.modals.createPost.ready}</span>
                               <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
                             </>
                         ) : (
                             <>
                               <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000000]">
                                 <Upload size={24} />
                               </div>
                               <span className="text-xs font-black uppercase">{t.modals.createPost.chooseFile}</span>
                             </>
                         )}
                       </button>
                       
                       {formData.image && (
                         <button 
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             setFormData({ ...formData, image: "" });
                             if (fileInputRef.current) fileInputRef.current.value = "";
                           }}
                           className="absolute -top-3 -right-3 w-8 h-8 bg-[#b71212] text-white border-2 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_#000000] hover:translate-y-[-1px] transition-transform z-10"
                         >
                           <X size={18} />
                         </button>
                       )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <p className="text-[10px] text-center text-zinc-400 font-medium italic">{t.modals.createPost.imageHint}</p>
                 </div>
              </div>
            )}

            {/* LINK MODE */}
            {mode === "LINK" && (
              <div className="flex flex-col gap-6 relative py-4">
                 <div>
                    <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-2 tracking-widest">{t.modals.createPost.linkTitle}</label>
                    <input 
                      type="text" 
                      placeholder={t.modals.createPost.linkPlaceholder}
                      className="w-full h-12 px-4 bg-[#f2efff] border-2 border-black focus:outline-none focus:shadow-[4px_4px_0_0_#000000] font-bold placeholder:text-zinc-400"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="block text-xs font-black uppercase text-[#1A1A2E] tracking-widest text-center mb-2">{t.modals.createPost.urlTitle}</label>
                    <div className="relative max-w-[400px] mx-auto w-full">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#118AB2]">
                         <LinkIcon size={20} />
                       </div>
                       <input 
                         type="url" 
                         placeholder="https://example.com"
                         className="w-full h-16 pl-12 pr-4 bg-[#f2efff] border-4 border-black focus:outline-none focus:shadow-[8px_8px_0_0_#118AB2] font-bold text-lg placeholder:text-zinc-300 transition-all"
                         value={formData.link}
                         onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                       />
                    </div>
                    <p className="text-[10px] text-center text-zinc-400 font-medium italic">{t.modals.createPost.linkHint}</p>
                 </div>
              </div>
            )}
          </div>

          {/* Status Selector */}
          <div className="pt-6 border-t border-dashed border-black/10 mt-6">
            <label className="block text-xs font-black uppercase text-[#1A1A2E] mb-3 tracking-widest italic leading-none">{t.status.statusLabel}</label>
            <div className="flex gap-2">
              {[
                { value: "OPEN", label: t.status.waiting },
                { value: "IN_PROGRESS", label: t.status.inProgress },
                { value: "DONE", label: t.status.completed }
              ].map((s: any) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s.value as any })}
                  className={`flex-1 py-3 border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                    formData.status === s.value 
                      ? "bg-[#1A1A2E] text-white shadow-[4px_4px_0_0_#F24236] -translate-y-[2px]" 
                      : "bg-white text-black hover:bg-zinc-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-black bg-[#f2efff] flex justify-between items-center group">
          <button 
            onClick={() => onClose()}
            className="text-xs font-black uppercase tracking-widest text-[#5a5971] hover:text-[#b71212] transition-colors"
          >
            {t.modals.cancel}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || 
              (mode === "ANNOUNCEMENT" && (!formData.title || !formData.content)) || 
              (mode === "IMAGE" && !formData.image) || 
              (mode === "LINK" && !formData.link) || 
              (mode === "POLL" && (!formData.title || pollOptions.filter((o: any) => o.trim() !== "").length < 2))}
            className="bg-[#b71212] border-2 border-black px-8 py-3 text-white font-headline font-bold text-sm shadow-[4px_4px_0_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-[#a00f0f] disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <RefreshCcw className="animate-spin" size={18} /> : 
              (mode === "IMAGE" ? t.modals.createPost.submitImage : 
               mode === "LINK" ? t.modals.createPost.submitLink : 
               mode === "POLL" ? t.modals.createPost.submitPoll : 
               t.modals.createPost.submitPost)}
          </button>
        </div>
      </div>
    </div>
  );
}
