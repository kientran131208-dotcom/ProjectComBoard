"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function votePoll(postId: string, boardId: string, option: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Bạn cần đăng nhập để bình chọn");
  }

  // Check if already voted
  const existingVote = await prisma.pollVote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id
      }
    }
  });

  if (existingVote) {
    if (existingVote.option === option) {
      // Unvote if same option
      await prisma.pollVote.delete({
        where: { id: existingVote.id }
      });
    } else {
      // Change vote
      await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: { option }
      });
    }
  } else {
    // New vote
    await prisma.pollVote.create({
      data: {
        postId,
        userId: session.user.id,
        option
      }
    });
  }

  revalidatePath(`/board/${boardId}`);
  return { success: true };
}
