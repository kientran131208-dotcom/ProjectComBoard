import { getBoards, getPublicBoards, getPendingBoards } from "@/lib/actions/board";
import { auth } from "@/lib/auth";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { prisma } from "@/lib/prisma";


import { getUnreadCountsPerBoard } from "@/lib/actions/notification";

export default async function DashboardPage() {
  const session = await auth();
  const realBoards = await getBoards();
  const publicBoards = await getPublicBoards();
  const pendingBoards = await getPendingBoards();
  const unreadCounts = await getUnreadCountsPerBoard();

  const dbUser = session?.user?.id ? await prisma.user.findUnique({
    where: { id: session.user.id }
  }) : null;

  // Use session name if available, otherwise fallback to reference name
  const userName = dbUser?.name || session?.user?.name || "";

  return (
    <DashboardClient 
      userName={userName} 
      displayBoards={realBoards} 
      publicBoards={publicBoards}
      pendingBoards={pendingBoards}
      unreadCounts={unreadCounts}
    />
  );
}
