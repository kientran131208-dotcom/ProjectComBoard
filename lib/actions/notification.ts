"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** Get all notifications for the current user */
export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      board: {
        select: { name: true, emoji: true }
      }
    }
  });
}

/** Get count of unread notifications */
export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { 
      userId: session.user.id,
      isRead: false
    }
  });
}

/** Mark a specific notification as read */
export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.update({
    where: { 
      id: notificationId,
      userId: session.user.id
    },
    data: { isRead: true }
  });

  revalidatePath("/");
}

/** Mark all notifications as read for the current user */
export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true }
  });

  revalidatePath("/");
}
/** Get unread notification counts grouped by board */
export async function getUnreadCountsPerBoard() {
  const session = await auth();
  if (!session?.user?.id) return {};

  const counts = await prisma.notification.groupBy({
    by: ['boardId'],
    where: {
      userId: session.user.id,
      isRead: false,
      boardId: { not: null }
    },
    _count: {
      _all: true
    }
  });

  return counts.reduce((acc: any, curr: any) => {
    if (curr.boardId) {
      acc[curr.boardId] = curr._count._all;
    }
    return acc;
  }, {} as Record<string, number>);
}

/** Mark all notifications as read for a specific board and user */
export async function markBoardNotificationsAsRead(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { 
      userId: session.user.id, 
      boardId,
      isRead: false 
    },
    data: { isRead: true }
  });

  revalidatePath("/");
}
