import Link from "next/link";
import { auth } from "@/lib/auth";
import { Search } from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import HeaderActions from "@/components/layout/HeaderActions";

export async function Header({ boardName }: { boardName?: string }) {
  const session = await auth();

  return (
    <header className="h-16 bg-white border-b-2 border-cb-navy flex items-center px-6 gap-4 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <span className="font-poppins font-extrabold text-xl text-cb-navy">
          Com<span className="text-cb-red">Board</span>
        </span>
      </Link>

      {/* Board name (optional) */}
      {boardName && (
        <>
          <span className="text-cb-navy/30 font-bold">/</span>
          <span className="font-poppins font-semibold text-sm text-cb-navy truncate max-w-xs">
            {boardName}
          </span>
        </>
      )}

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="w-9 h-9 flex items-center justify-center border-2 border-cb-navy rounded shadow-hard-sm hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all bg-white">
          <Search size={16} />
        </button>

        {/* CTA */}
        <HeaderActions boardName={boardName} />

        {/* Avatar */}
        <UserMenu user={session?.user} />

      </div>
    </header>
  );
}
