import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/dashboard/ProfileClient";
import { getBoards } from "@/lib/actions/board";
import { getFriends, getPendingRequests } from "@/lib/actions/friendship";
import { prisma } from "@/lib/prisma";



export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const myBoards = await getBoards();
  const friends = await getFriends();
  const pendingRequests = await getPendingRequests();



  return (
    <ProfileClient 
      user={dbUser} 
      myBoards={myBoards}
      friendsList={friends}
      pendingRequests={pendingRequests}
    />
  );
}
