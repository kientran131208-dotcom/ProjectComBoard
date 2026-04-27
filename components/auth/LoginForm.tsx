"use client";

import Link from "next/link";
import { loginWithCredentials, loginWithGoogle } from "@/lib/actions/authActions";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginForm({ message }: { message?: string }) {
  const { t } = useLanguage();

  return (
    <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#FFF8F6] bg-polka-dark px-6 py-12 sm:px-12 lg:px-24">
      <div className="mx-auto w-full max-w-[400px]">
        {/* Mobile Heading */}
        <div className="lg:hidden text-center mb-8">
          <h1 className="font-poppins font-extrabold text-4xl text-[#1A1A2E] relative inline-block">
            ComBoard
            <svg className="absolute -bottom-2 left-0 w-full text-[#F24236]" height="8" preserveAspectRatio="none" viewBox="0 0 100 12">
              <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
            </svg>
          </h1>
        </div>

        {/* Heading */}
        <div className="mb-10 text-left">
          <h2 className="font-poppins text-3xl font-bold text-[#1A1A2E]">{t.auth.welcomeBack}</h2>
          <p className="mt-2 font-inter text-sm text-[#5a5971]">{t.auth.loginSubtitle}</p>
        </div>

        {message === "RegisteredSuccess" && (
          <div className="mb-8 p-4 bg-[#06D6A0] border-2 border-black text-[#1A1A2E] font-bold text-xs shadow-[4px_4px_0_0_#000] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
             <span className="text-xl">🎉</span>
             <div>
                <p className="font-black underline uppercase tracking-tighter">{t.auth.registeredSuccess}</p>
                <p>{t.auth.registeredSubtitle}</p>
             </div>
          </div>
        )}

        {message === "PasswordResetSuccess" && (
          <div className="mb-8 p-4 bg-[#118AB2] border-2 border-black text-white font-bold text-xs shadow-[4px_4px_0_0_#000] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
             <span className="text-xl">✅</span>
             <div>
                <p className="font-black underline uppercase tracking-tighter">{t.auth.passwordResetSuccess}</p>
                <p>{t.auth.passwordResetSubtitle}</p>
             </div>
          </div>
        )}
        
        {/* Social Login */}
        <div className="space-y-4">
          <form action={loginWithGoogle}>
            <button type="submit" className="flex w-full items-center justify-center gap-3 bg-[#ffffff] border-2 border-[#1A1A2E] py-3 px-4 font-inter text-sm font-semibold text-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A2E]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Google" className="h-5 w-5" src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"/>
              {t.auth.loginWithGoogle}
            </button>
          </form>
        </div>
        
        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-[#acaac5]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FFF8F6] px-4 font-inter text-xs uppercase tracking-widest text-[#75748d]">{t.auth.or}</span>
          </div>
        </div>
        
        {/* Form */}
        <form action={loginWithCredentials} className="space-y-6">
          <div>
            <label className="mb-2 block font-inter text-sm font-medium text-[#1A1A2E]" htmlFor="email">{t.auth.email}</label>
            <input autoComplete="email" className="block w-full rounded bg-[#ffffff] border-2 border-[#1A1A2E] px-4 py-3 text-[#2d2d42] shadow-[4px_4px_0px_#1A1A2E] focus:border-[#b71212] focus:outline-none focus:ring-0 transition-colors" id="email" name="email" required type="email" placeholder="example@email.com" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block font-inter text-sm font-medium text-[#1A1A2E]" htmlFor="password">{t.auth.password}</label>
              <Link className="font-inter text-xs font-semibold text-[#b71212] hover:underline" href="/forgot-password">{t.auth.forgotPassword}</Link>
            </div>
            <input autoComplete="current-password" className="block w-full rounded bg-[#ffffff] border-2 border-[#1A1A2E] px-4 py-3 text-[#2d2d42] shadow-[4px_4px_0px_#1A1A2E] focus:border-[#b71212] focus:outline-none focus:ring-0 transition-colors" id="password" name="password" required type="password" placeholder="••••••••" />
          </div>
          <button className="flex w-full items-center justify-center gap-2 bg-[#F24236] border-2 border-[#1A1A2E] py-4 px-4 font-inter text-base font-bold text-white shadow-[5px_5px_0_#1A1A2E] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#1A1A2E]" type="submit">
            {t.auth.login}
            <svg className="w-5 h-5 text-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-10 text-center space-y-4">
          <p className="font-inter text-sm text-[#5a5971]">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-bold text-[#b71212] hover:underline">
              {t.auth.registerNow}
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1 font-inter text-[10px] text-[#75748d]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t.auth.secureHint}
          </p>
        </div>
      </div>
    </div>
  );
}
