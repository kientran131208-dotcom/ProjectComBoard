import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import RegisterVisuals from "@/components/auth/RegisterVisuals";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth();
  if (session) redirect("/");

  const resolvedParams = await searchParams;
  const error = resolvedParams.error as string | undefined;

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row antialiased">
      <RegisterVisuals />
      <RegisterForm error={error} />
    </div>
  );
}
