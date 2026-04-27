import { getBoardData } from "@/lib/actions/board";
import { getFriends } from "@/lib/actions/friendship";
import { notFound } from "next/navigation";
import BoardClient from "@/components/board/BoardClient";
import BoardError from "@/components/board/BoardError";
import { auth } from "@/lib/auth";
import { markBoardNotificationsAsRead } from "@/lib/actions/notification";

export default async function BoardPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const session = await auth();

  let board;
  let errorMsg = null;

  try {
    board = await getBoardData(id);
  } catch (error: any) {
    errorMsg = error.message;
  }

  if (!board) {
    const isKicked = errorMsg?.includes("quyền truy cập") || errorMsg?.includes("xét duyệt");
    return <BoardError isKicked={isKicked} />;
  }

  const friends = await getFriends();
  const friendIds = friends.map(f => f.id);

  return <BoardClient board={board} currentUserId={session?.user?.id || null} friendIds={friendIds} />;
}
