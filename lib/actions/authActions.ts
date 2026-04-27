"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "yopmail.com", "guerrillamail.com", "10minutemail.com", 
  "temp-mail.org", "sharklasers.com", "getnada.com", "dispostable.com"
];

function isDisposableEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

export async function loginWithCredentials(formData: FormData) {
  const email = formData.get("email") as string;
  try {
    await signIn("credentials", Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      const errorType = error.type;
      if (errorType === "CredentialsSignin") {
        // Check if it's the custom error thrown in authorize
        if (error.cause?.err?.message === "EmailNotVerified") {
           redirect(`/verify-account?email=${encodeURIComponent(email)}`);
        }
        redirect("/login?error=CredentialsSignin");
      }
      redirect("/login?error=CredentialsSignin");
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn("google");
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
     redirect("/register?error=MissingFields");
  }

  if (password !== confirmPassword) {
    redirect("/register?error=PasswordMismatch");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    redirect("/register?error=UserExists");
  }

  // Block disposable emails
  if (isDisposableEmail(email)) {
    redirect("/register?error=InvalidEmail");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Note: user.emailVerified will be null by default
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  });

  // Generate and send verification token
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

  redirect(`/verify-account?email=${encodeURIComponent(email)}`);
}

export async function verifyRegistrationAction(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  if (!email || !token) {
    redirect(`/verify-account?email=${encodeURIComponent(email)}&error=MissingFields`);
  }

  const existingToken = await prisma.verificationToken.findFirst({
    where: { 
        identifier: email,
        token: token
    }
  });

  if (!existingToken) {
    redirect(`/verify-account?email=${encodeURIComponent(email)}&error=InvalidCode`);
  }

  if (new Date() > existingToken.expires) {
    redirect(`/verify-account?email=${encodeURIComponent(email)}&error=ExpiredCode`);
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });

  // Delete token
  await prisma.verificationToken.delete({
    where: {
        identifier_token: {
            identifier: email,
            token: token
        }
    }
  });

  redirect("/login?message=RegisteredSuccess");
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    redirect("/forgot-password?error=MissingEmail");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    // Luôn redirect thành công để tránh lộ thông tin account
    redirect("/forgot-password?success=true");
  }

  const { generatePasswordResetToken } = await import("@/lib/tokens");
  const { sendPasswordResetEmail } = await import("@/lib/mail");

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

  redirect(`/verify-code?email=${encodeURIComponent(email)}`);
}

export async function verifyCodeAction(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  if (!email || !token) {
    redirect(`/verify-code?email=${encodeURIComponent(email)}&error=MissingFields`);
  }

  const existingToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  });

  if (!existingToken || existingToken.email !== email) {
    redirect(`/verify-code?email=${encodeURIComponent(email)}&error=InvalidCode`);
  }

  if (new Date() > existingToken.expires) {
    redirect(`/verify-code?email=${encodeURIComponent(email)}&error=ExpiredCode`);
  }

  // Token hợp lệ, chuyển sang đổi mật khẩu
  // Truyền token qua query để verify lại ở bước cuối
  redirect(`/new-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
}

export async function newPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword || !token || !email) {
    redirect(`/new-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&error=MissingFields`);
  }

  if (password !== confirmPassword) {
    redirect(`/new-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&error=PasswordMismatch`);
  }

  const existingToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  });

  if (!existingToken || existingToken.email !== email || new Date() > existingToken.expires) {
    redirect("/forgot-password?error=InvalidSession");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  // Xóa token sau khi dùng xong
  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id }
  });

  redirect("/login?message=PasswordResetSuccess");
}
