import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/authActions";
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const success = resolvedParams.success === "true";

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row antialiased">
      {/* Left Panel: Brand & Visuals */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[#1A1A2E] bg-polka-white p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 h-16 w-16 rounded-full bg-[#FFD166] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E]"></div>
          <div className="absolute top-1/3 right-1/4 h-0 w-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-[#F24236] border-r-[30px] border-r-transparent rotate-12 drop-shadow-[4px_4px_0_#1A1A2E]"></div>
          <div className="absolute bottom-1/3 left-1/5 h-20 w-32 bg-[#06D6A0] border-2 border-[#1A1A2E] shadow-[4px_4px_0px_#1A1A2E] -rotate-6"></div>
        </div>
        
        <div className="z-10 mt-auto">
          <div className="relative inline-block">
            <h1 className="font-poppins text-5xl font-extrabold text-white">ComBoard</h1>
            <svg className="absolute -bottom-3 left-0 w-full text-[#F24236]" height="12" preserveAspectRatio="none" viewBox="0 0 100 12">
              <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
            </svg>
          </div>
          <p className="mt-6 font-inter text-base text-white/70">Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu</p>
        </div>
      </div>
      
      {/* Right Panel: Forgot Password Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#FFF8F6] bg-polka-dark px-6 py-12 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-poppins font-extrabold text-4xl text-[#1A1A2E] relative inline-block">
              ComBoard
              <svg className="absolute -bottom-2 left-0 w-full text-[#F24236]" height="8" preserveAspectRatio="none" viewBox="0 0 100 12">
                <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
              </svg>
            </h1>
          </div>

          <div className="mb-10 text-left">
            <h2 className="font-poppins text-3xl font-bold text-[#1A1A2E]">Quên mật khẩu? 🔑</h2>
            <p className="mt-2 font-inter text-sm text-[#5a5971]">Nhập email của bạn để bắt đầu quá trình khôi phục</p>
          </div>

          {success && (
            <div className="mb-8 p-4 bg-[#118AB2] border-2 border-black text-white font-bold text-xs shadow-[4px_4px_0_0_#000] animate-in fade-in slide-in-from-top-2">
               <p className="uppercase font-black mb-1">Kiểm tra hộp thư! 📧</p>
               <p>Nếu email tồn tại, chúng tôi đã gửi liên kết khôi phục mật khẩu cho bạn.</p>
            </div>
          )}
          
          {!success && (
            <form action={resetPasswordAction} className="space-y-6">
              <div>
                <label className="mb-2 block font-inter text-sm font-medium text-[#1A1A2E]" htmlFor="email">Email tài khoản</label>
                <input className="block w-full rounded bg-[#ffffff] border-2 border-[#1A1A2E] px-4 py-3 text-[#2d2d42] shadow-[4px_4px_0px_#1A1A2E] focus:border-[#b71212] focus:outline-none focus:ring-0 transition-colors" id="email" name="email" required type="email" placeholder="example@email.com" />
              </div>
              
              <button className="flex w-full items-center justify-center gap-2 bg-[#118AB2] border-2 border-[#1A1A2E] py-4 px-4 font-inter text-base font-bold text-white shadow-[5px_5px_0_#1A1A2E] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#1A1A2E]" type="submit">
                Gửi yêu cầu khôi phục
                <svg className="w-5 h-5 text-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="font-inter text-sm font-bold text-[#1A1A2E] hover:underline flex items-center justify-center gap-2">
               <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
               Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
