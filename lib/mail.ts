import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "ComBoard <onboarding@resend.dev>",
    to: email,
    subject: "Mã xác nhận đặt lại mật khẩu ComBoard 🔑",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 4px solid black; background: #FFF8F6;">
        <h1 style="font-size: 24px; font-weight: 900; color: #1A1A2E; margin-bottom: 20px;">ComBoard</h1>
        <p style="font-size: 16px; color: #5a5971; margin-bottom: 24px;">Sử dụng mã dưới đây để tiếp tục quá trình đặt lại mật khẩu. Mã này sẽ hết hạn sau 1 giờ:</p>
        <div style="display: inline-block; padding: 16px 32px; background: #FFD166; color: black; font-size: 32px; font-weight: 900; letter-spacing: 10px; border: 3px solid black; box-shadow: 6px 6px 0px black;">
          ${token}
        </div>
        <p style="margin-top: 32px; font-size: 12px; color: #75748d;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
      </div>
    `
  });
};
export const sendVerificationEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "ComBoard <onboarding@resend.dev>",
    to: email,
    subject: "Mã xác nhận tài khoản ComBoard 🚀",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 4px solid black; background: #F8F5FF;">
        <h1 style="font-size: 24px; font-weight: 900; color: #1A1A2E; margin-bottom: 20px;">ComBoard</h1>
        <p style="font-size: 16px; color: #5a5971; margin-bottom: 24px;">Chào mừng bạn đến với ComBoard! Hãy sử dụng mã xác nhận dưới đây để hoàn tất đăng ký:</p>
        <div style="display: inline-block; padding: 16px 32px; background: #06D6A0; color: black; font-size: 32px; font-weight: 900; letter-spacing: 10px; border: 3px solid black; box-shadow: 6px 6px 0px black;">
          ${token}
        </div>
        <p style="margin-top: 32px; font-size: 12px; color: #75748d;">Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.</p>
      </div>
    `
  });
};
