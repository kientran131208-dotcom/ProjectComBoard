"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendFriendRequest(receiverId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.id === receiverId) throw new Error("Cannot add yourself");

  // Check if they are already friends
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, friendId: receiverId },
        { userId: receiverId, friendId: session.user.id }
      ]
    }
  });
  if (existingFriendship) throw new Error("Already friends");

  // Check for existing request
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: receiverId },
        { senderId: receiverId, receiverId: session.user.id }
      ]
    }
  });
  if (existingRequest) throw new Error("Request already sent or pending");

  return await prisma.friendRequest.create({
    data: {
      senderId: session.user.id,
      receiverId,
    }
  });
}

export async function handleFriendRequest(requestId: string, status: 'ACCEPTED' | 'REJECTED') {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.receiverId !== session.user.id) {
    throw new Error("Invalid request");
  }

  if (status === 'ACCEPTED') {
    // Create bidirectional friendship entries
    await prisma.$transaction([
      prisma.friendship.create({
        data: { userId: request.senderId, friendId: request.receiverId }
      }),
      prisma.friendship.create({
        data: { userId: request.receiverId, friendId: request.senderId }
      }),
      prisma.friendRequest.delete({
        where: { id: requestId }
      })
    ]);
  } else {
    await prisma.friendRequest.delete({
      where: { id: requestId }
    });
  }

  revalidatePath("/profile");
}

export async function getFriends() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const friendships = await prisma.friendship.findMany({
    where: { userId: session.user.id },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        }
      }
    }
  });

  return friendships.map((f: any) => f.friend);
}

export async function getPendingRequests() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.friendRequest.findMany({
    where: { receiverId: session.user.id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  });
}
