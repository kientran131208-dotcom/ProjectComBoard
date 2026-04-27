"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe, Save, Shield, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { deleteUserAccount } from "@/lib/actions/user";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      // Server action will redirect, but just in case:
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert(t.modals.error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="font-poppins font-black text-3xl text-cb-navy mb-8 uppercase tracking-tight">
        {t.settings.title}
      </h1>

      <div className="space-y-8">
        {/* Language Section */}
        <div className="bg-white border-4 border-black p-6 shadow-hard rounded-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#FFD166] border-2 border-black flex items-center justify-center rounded shadow-hard-sm">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-xl">{t.settings.language}</h2>
              <p className="text-sm text-cb-navy/60 font-medium">{t.settings.languageDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage("vi")}
              className={`flex items-center justify-between p-4 border-2 border-black rounded shadow-hard-sm transition-all ${
                language === "vi" 
                  ? "bg-cb-navy text-white -translate-x-1 -translate-y-1 shadow-hard" 
                  : "bg-white text-cb-navy hover:bg-zinc-100"
              }`}
            >
              <span className="font-bold">Tiếng Việt</span>
              {language === "vi" && <span className="text-xs font-black uppercase">{t.settings.active}</span>}
            </button>

            <button
              onClick={() => setLanguage("en")}
              className={`flex items-center justify-between p-4 border-2 border-black rounded shadow-hard-sm transition-all ${
                language === "en" 
                  ? "bg-cb-navy text-white -translate-x-1 -translate-y-1 shadow-hard" 
                  : "bg-white text-cb-navy hover:bg-zinc-100"
              }`}
            >
              <span className="font-bold">English</span>
              {language === "en" && <span className="text-xs font-black uppercase">{t.settings.active}</span>}
            </button>
          </div>
        </div>

        {/* Security & Privacy Section */}
        <div className="bg-white border-4 border-black p-6 shadow-hard rounded-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-cb-mint border-2 border-black flex items-center justify-center rounded shadow-hard-sm">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-xl">{t.settings.security}</h2>
              <p className="text-sm text-cb-navy/60 font-medium">{t.settings.securityDesc}</p>
            </div>
          </div>

          <div className="p-4 border-2 border-cb-red/20 bg-cb-red/5 rounded-lg border-dashed">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 shrink-0 bg-cb-red text-white border-2 border-black flex items-center justify-center rounded shadow-[2px_2px_0_0_#000]">
                  <Trash2 size={20} />
               </div>
               <div className="flex-1">
                  <h4 className="font-bold text-cb-navy mb-1">{t.settings.deleteAccount}</h4>
                  <p className="text-xs text-cb-navy/60 mb-4 leading-relaxed">{t.settings.deleteAccountDesc}</p>
                  
                  {!showConfirm ? (
                    <button 
                      onClick={() => setShowConfirm(true)}
                      className="px-4 py-2 bg-white border-2 border-cb-red text-cb-red font-black uppercase text-[10px] tracking-widest rounded hover:bg-cb-red hover:text-white transition-all"
                    >
                      {t.settings.deleteAccount}
                    </button>
                  ) : (
                    <div className="bg-white border-2 border-black p-4 rounded shadow-hard-sm animate-in fade-in slide-in-from-top-2">
                       <div className="flex items-center gap-2 mb-3 text-cb-red">
                          <AlertTriangle size={16} />
                          <span className="font-black text-xs uppercase">{t.settings.deleteConfirmTitle}</span>
                       </div>
                       <p className="text-[11px] font-bold text-cb-navy mb-4">{t.settings.deleteConfirmDesc}</p>
                       <div className="flex gap-2">
                          <button 
                            disabled={isDeleting}
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-cb-red text-white border-2 border-black font-black uppercase text-[10px] tracking-widest rounded shadow-[2px_2px_0_0_#000] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
                          >
                            {isDeleting ? "..." : t.settings.deleteButton}
                          </button>
                          <button 
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 bg-white text-cb-navy border-2 border-black font-black uppercase text-[10px] tracking-widest rounded transition-all hover:bg-zinc-50"
                          >
                            {t.modals.cancel}
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-6 shadow-hard rounded-xl opacity-50 cursor-not-allowed">
          <h3 className="font-bold mb-2">{t.settings.comingSoon}</h3>
          <div className="h-4 w-1/2 bg-zinc-200 rounded" />
        </div>
      </div>
      
      <div className="mt-10 flex justify-end">
         <button className="flex items-center gap-2 px-8 py-3 bg-[#06D6A0] border-2 border-black rounded font-black uppercase text-sm shadow-hard hover:shadow-hard-lg hover:-translate-x-1 hover:-translate-y-1 transition-all">
            <Save size={18} />
            {t.settings.save}
         </button>
      </div>
    </div>
  );
}
