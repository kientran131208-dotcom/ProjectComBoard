"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session as typeof session & { user: { id: string } };
}

export async function getMyBoards() {
  const session = await getSession();

  return prisma.board.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      _count: { select: { members: true, posts: true } },
      posts: {
        where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } },
        select: { id: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublicBoards() {
  const session = await getSession();

  return prisma.board.findMany({
    where: {
      isPublic: true,
      members: { none: { userId: session.user.id } },
    },
    include: { _count: { select: { members: true, posts: true } } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

export async function createBoard(data: {
  name: string;
  description?: string;
  emoji: string;
  color: string;
  isPublic: boolean;
}) {
  const session = await getSession();

  const board = await prisma.board.create({
    data: {
      ...data,
      inviteCode: nanoid(10),
      members: {
        create: { userId: session.user.id, role: "ADMIN" },
      },
    },
  });

  revalidatePath("/");
  return board;
}

export async function getBoardById(boardId: string) {
  const session = await getSession();

  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: session.user.id } },
  });
  if (!membership) throw new Error("Not a member");

  return prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { members: true, posts: true } },
    },
  });
}

export async function joinBoardByCode(code: string) {
  const session = await getSession();

  const board = await prisma.board.findUnique({
    where: { inviteCode: code },
    include: { _count: { select: { members: true } } },
  });

  if (!board) throw new Error("Link mời không hợp lệ");
  if (board.inviteExpiry && board.inviteExpiry < new Date()) {
    throw new Error("Link mời đã hết hạn");
  }

  const existing = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: board.id, userId: session.user.id } },
  });

  if (existing) return { board, alreadyMember: true };

  await prisma.boardMember.create({
    data: { boardId: board.id, userId: session.user.id, role: "MEMBER" },
  });

  revalidatePath("/");
  return { board, alreadyMember: false };
}

export async function getBoardPreview(code: string) {
  return prisma.board.findUnique({
    where: { inviteCode: code },
    include: { _count: { select: { members: true, posts: true } } },
  });
}

export async function generateInviteCode(boardId: string, expiresInDays?: number) {
  const session = await getSession();

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: session.user.id } },
  });
  if (member?.role !== "ADMIN") throw new Error("Chỉ Admin mới có thể tạo link mời");

  const expiry = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const board = await prisma.board.update({
    where: { id: boardId },
    data: { inviteCode: nanoid(10), inviteExpiry: expiry },
  });

  revalidatePath(`/board/${boardId}`);
  return board.inviteCode;
}
