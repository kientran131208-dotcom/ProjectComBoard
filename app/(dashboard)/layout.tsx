import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserMenu from "@/components/layout/UserMenu";
import FriendsSidebar from "@/components/dashboard/FriendsSidebar";
import DashboardHeaderTitle from "@/components/layout/DashboardHeaderTitle";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { getFriends, getPendingRequests } from "@/lib/actions/friendship";
import { getUnreadCounts } from "@/lib/actions/chat";
import { prisma } from "@/lib/prisma";





// Reliability: Using SVG icons directly to avoid Google Font loading issues that cause text "add", "notifications"
const Icons = {
  expandMore: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z" fill="currentColor" />
    </svg>
  ),
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor" />
    </svg>
  ),
  explore: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z" fill="currentColor" />
    </svg>
  ),
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor" />
    </svg>
  ),
  person: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
    </svg>
  )
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id as string }
  });

  const fallbackAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAhroIcGvuJUMSEpEbgv-Osv3eoKVIQavy2j59GUwsQ8LW6yD27WjliAYw4fmw-dywZ6Gc38LUxQjuW7KO-UdNTQKvKg2vpCOOyuMjLwPxpS5iphf56lIP5JaDed0F2-vuLu1wcn6_gozvXW27ygn8YikXAjdcEHmMH88dESC5K906ql_NemCw9zFeKaVx__FznIFKyKlw9H3CYqj9xjO4oWwfrvtLw1-B11eBd7cuMwk9PPl6oe4EyfR5xKI6DQ2kCqbnff4BZlgwj";
  const userAvatar = dbUser?.image || fallbackAvatar;

  const friends = await getFriends();
  const pendingRequests = await getPendingRequests();
  const unreadCounts = await getUnreadCounts();



  return (
    <div className="font-body text-[#2d2d42] antialiased min-h-screen relative pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-[#F24236] font-headline">
            ComBoard
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <DashboardHeaderTitle />
        </div>

        <div className="flex items-center gap-4">
          <UserMenu user={dbUser || session.user} />
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex">
        {/* Friends Sidebar (Desktop Persistent - Left) */}
        <div className="hidden md:block shrink-0">
          <FriendsSidebar
            friends={friends}
            pendingRequests={pendingRequests}
            unreadCounts={unreadCounts}
            currentUserId={session.user.id}
          />
        </div>


        {/* Page Content */}
        <main className="flex-1 pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-24 md:pb-12 md:ml-80">
          {children}
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}

      <BottomNavBar />
    </div>
  );
}
