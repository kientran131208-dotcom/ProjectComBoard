import { getBoardPreview, joinBoard } from "@/lib/actions/board";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InviteClient from "@/components/board/InviteClient";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { code } = await params;
  const { status } = await searchParams;
  
  const session = await auth();
  const board = await getBoardPreview(code);

  if (!board) {
    notFound();
  }

  // Check if user is already a member
  let membership = null;
  if (session?.user?.id) {
    membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: board.id,
          userId: session.user.id,
        }
      }
    });
  }

  // Server action handler for the join form
  const handleJoin = async () => {
    "use server";
    
    if (!session?.user) {
      redirect(`/login?callbackUrl=/invite/${code}`);
    }

    const joinedBoard = await joinBoard(code);
    
    // Fetch membership status after joining
    const m = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: joinedBoard.id,
          userId: session.user.id,
        }
      }
    });

    if (m?.status === "APPROVED") {
      redirect(`/invite/${code}?status=approved`);
    } else {
      redirect(`/invite/${code}?status=pending`);
    }
  };

  const isApproved = membership?.status === "APPROVED" || status === "approved";
  const isPending = membership?.status === "PENDING" || status === "pending";
  const showSuccess = isApproved || isPending;

  return (
    <InviteClient 
      board={board} 
      code={code} 
      handleJoin={handleJoin} 
      isApproved={isApproved} 
      isPending={isPending} 
      showSuccess={showSuccess} 
    />
  );
}
