"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string; image?: string; bio?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your profile");
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      image: data.image,
      bio: data.bio,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  
  return updatedUser;
}
export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (!query.trim()) return [];

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        { id: { not: session.user.id } }, // Exclude self
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
    take: 10,
  });

  return users;
}

/** Delete the current user's account and all associated data */
export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  try {
    // Perform cleanup in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete notifications
      await tx.notification.deleteMany({ where: { userId } });

      // 2. Delete social interactions
      await tx.like.deleteMany({ where: { userId } });
      await tx.commentLike.deleteMany({ where: { userId } });
      await tx.pollVote.deleteMany({ where: { userId } });
      await tx.comment.deleteMany({ where: { authorId: userId } });
      await tx.message.deleteMany({ where: { senderId: userId } });
      await tx.message.deleteMany({ where: { receiverId: userId } });

      // 3. Delete friendships
      await tx.friendRequest.deleteMany({ 
        where: { OR: [{ senderId: userId }, { receiverId: userId }] } 
      });
      await tx.friendship.deleteMany({ 
        where: { OR: [{ userId: userId }, { friendId: userId }] } 
      });

      // 4. Delete posts (author)
      await tx.post.deleteMany({ where: { authorId: userId } });

      // 5. Delete memberships
      await tx.boardMember.deleteMany({ where: { userId } });

      // 4. Handle boards created by user
      const createdBoards = await tx.board.findMany({
          where: { creatorId: userId }
      });

      for (const board of createdBoards) {
          const otherAdmin = await tx.boardMember.findFirst({
              where: { boardId: board.id, role: "ADMIN", NOT: { userId } }
          });

          if (!otherAdmin) {
              await tx.board.delete({ where: { id: board.id } });
          } else {
              await tx.board.update({
                  where: { id: board.id },
                  data: { creatorId: otherAdmin.userId }
              });
          }
      }

      // 5. Delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

  } catch (error) {
    console.error("Failed to delete account:", error);
    throw new Error("Failed to delete account. Please try again.");
  }
}
