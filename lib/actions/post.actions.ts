"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type PostType = "ANNOUNCEMENT" | "BORROWING" | "QNA";
type PostStatus = "OPEN" | "IN_PROGRESS" | "DONE";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session as typeof session & { user: { id: string } };
}

async function assertMembership(boardId: string, userId: string) {
  const m = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  if (!m) throw new Error("Not a member of this board");
  return m;
}

export async function getPosts(boardId: string, type?: PostType) {
  const session = await getSession();
  await assertMembership(boardId, session.user.id);

  return prisma.post.findMany({
    where: { boardId, ...(type ? { type } : {}) },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function createPost(data: {
  boardId: string;
  type: PostType;
  title: string;
  content: string;
  status: PostStatus;
}) {
  const session = await getSession();
  await assertMembership(data.boardId, session.user.id);

  const rotation = Math.random() * 4 - 2;

  const post = await prisma.post.create({
    data: {
      ...data,
      authorId: session.user.id,
      rotation,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { select: { id: true } },
    },
  });

  revalidatePath(`/board/${data.boardId}`);
  return post;
}

export async function updatePostStatus(postId: string, status: PostStatus) {
  const session = await getSession();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: post.boardId, userId: session.user.id } },
  });
  if (!member) throw new Error("Not a member");
  if (post.authorId !== session.user.id && member.role !== "ADMIN") throw new Error("No permission");

  await prisma.post.update({ where: { id: postId }, data: { status } });
  revalidatePath(`/board/${post.boardId}`);
}

export async function updatePostPosition(postId: string, posX: number, posY: number) {
  await getSession();
  await prisma.post.update({ where: { id: postId }, data: { posX, posY } });
}

export async function togglePin(postId: string) {
  const session = await getSession();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: post.boardId, userId: session.user.id } },
  });
  if (member?.role !== "ADMIN") throw new Error("Only admin can pin posts");

  await prisma.post.update({ where: { id: postId }, data: { isPinned: !post.isPinned } });
  revalidatePath(`/board/${post.boardId}`);
}

export async function toggleLike(postId: string) {
  const session = await getSession();

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  } else {
    await prisma.like.create({ data: { postId, userId: session.user.id } });
    return { liked: true };
  }
}

export async function addComment(postId: string, content: string) {
  const session = await getSession();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  await assertMembership(post.boardId, session.user.id);

  const comment = await prisma.comment.create({
    data: { postId, authorId: session.user.id, content },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  revalidatePath(`/board/${post.boardId}`);
  return comment;
}

export async function getPostDetail(postId: string) {
  const session = await getSession();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!post) throw new Error("Post not found");
  return post;
}

export async function deletePost(postId: string) {
  const session = await getSession();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: post.boardId, userId: session.user.id } },
  });
  if (post.authorId !== session.user.id && member?.role !== "ADMIN") {
    throw new Error("No permission to delete");
  }

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath(`/board/${post.boardId}`);
}
