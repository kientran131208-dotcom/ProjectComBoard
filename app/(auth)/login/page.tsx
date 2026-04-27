import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import LoginVisuals from "@/components/auth/LoginVisuals";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth();
  if (session) redirect("/");

  const resolvedParams = await searchParams;
  const message = resolvedParams.message as string | undefined;

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row antialiased">
      <LoginVisuals />
      <LoginForm message={message} />
    </div>
  );
}
