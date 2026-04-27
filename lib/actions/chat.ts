"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBoardMessages(boardId: string) {
  return await prisma.message.findMany({
    where: { boardId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDirectMessages(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: friendId },
        { senderId: friendId, receiverId: session.user.id }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function markMessagesAsRead(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.message.updateMany({
    where: {
      senderId: friendId,
      receiverId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/");
}

export async function getUnreadCounts() {
  const session = await auth();
  if (!session?.user?.id) return {};

  const unreadMessages = await prisma.message.groupBy({
    by: ["senderId"],
    where: {
      receiverId: session.user.id,
      isRead: false,
    },
    _count: true,
  });

  const counts: Record<string, number> = {};
  unreadMessages.forEach((item) => {
    counts[item.senderId] = item._count;
  });

  return counts;
}

export async function sendMessage(data: { content: string; boardId?: string; receiverId?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const message = await prisma.message.create({
    data: {
      content: data.content,
      senderId: session.user.id,
      boardId: data.boardId,
      receiverId: data.receiverId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (data.boardId) {
    revalidatePath(`/board/${data.boardId}`);
  }
  
  return message;
}
