import Link from "next/link";
import { newPasswordAction } from "@/lib/actions/authActions";

export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const email = resolvedParams.email as string;
  const token = resolvedParams.token as string;
  const error = resolvedParams.error as string;

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row antialiased">
      {/* Left Panel */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[#1A1A2E] bg-polka-white p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 h-16 w-16 rounded-full bg-[#FFD166] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"></div>
          <div className="absolute top-1/2 right-1/4 h-12 w-12 bg-[#118AB2] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] rotate-45"></div>
        </div>
        
        <div className="z-10 mt-auto">
          <div className="relative inline-block">
            <h1 className="font-poppins text-5xl font-extrabold text-white">ComBoard</h1>
            <svg className="absolute -bottom-3 left-0 w-full text-[#F24236]" height="12" preserveAspectRatio="none" viewBox="0 0 100 12">
              <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
            </svg>
          </div>
          <p className="mt-6 font-inter text-base text-white/70">Bước cuối cùng để lấy lại tài khoản của bạn</p>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#FFF8F6] bg-polka-dark px-6 py-12 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 text-left">
            <h2 className="font-poppins text-3xl font-bold text-[#1A1A2E]">Đặt mật khẩu mới 🔒</h2>
            <p className="mt-2 font-inter text-sm text-[#5a5971]">Vui lòng nhập mật khẩu mới cực kỳ bảo mật của bạn nhé</p>
          </div>

          {error === "PasswordMismatch" && (
            <div className="mb-6 p-4 bg-[#F24236] border-2 border-black text-white font-bold text-xs shadow-[4px_4px_0_0_#000]">
               ⚠️ Mật khẩu xác nhận không khớp. Thử lại nhé!
            </div>
          )}
          
          <form action={newPasswordAction} className="space-y-6">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="token" value={token} />
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#1A1A2E]" htmlFor="password">Mật khẩu mới</label>
                <input 
                  className="block w-full rounded bg-[#ffffff] border-2 border-[#1A1A2E] px-4 py-3 text-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] focus:border-[#F24236] focus:outline-none focus:ring-0 transition-colors" 
                  id="password" 
                  name="password" 
                  required 
                  type="password" 
                  placeholder="Tối thiểu 8 ký tự"
                  minLength={8}
                />
              </div>
              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#1A1A2E]" htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input 
                  className="block w-full rounded bg-[#ffffff] border-2 border-[#1A1A2E] px-4 py-3 text-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] focus:border-[#F24236] focus:outline-none focus:ring-0 transition-colors" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required 
                  type="password" 
                  placeholder="Nhập lại mật khẩu mới"
                  minLength={8}
                />
              </div>
            </div>
            
            <button className="flex w-full items-center justify-center gap-2 bg-[#06D6A0] border-2 border-[#1A1A2E] py-4 px-4 font-inter text-base font-bold text-black shadow-[5px_5px_0_#1A1A2E] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#1A1A2E]" type="submit">
              Đổi mật khẩu
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
