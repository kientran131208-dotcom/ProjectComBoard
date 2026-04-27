"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


/** Get all boards a user is a member of */
export async function getBoards() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const boards = await prisma.board.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          status: "APPROVED"
        },
      },
    },
    include: {
      members: {
        where: {
          userId: session.user.id,
        },
        select: {
          role: true,
        },
      },
      _count: {
        select: {
          posts: true,
          members: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return boards;
}

/** Get recent public boards */
export async function getPublicBoards() {
  const session = await auth();
  
  const boards = await prisma.board.findMany({
    where: {
      isPublic: true,
      ...(session?.user?.id ? {
        members: {
          none: {
            userId: session.user.id
          }
        }
      } : {})
    },
    include: {
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return boards;
}

/** Get boards managed by the user */
export async function getAdminBoards() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const boards = await prisma.board.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          role: "ADMIN"
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return boards;
}

/** Get boards where the user has a pending join request */
export async function getPendingBoards() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const boards = await prisma.board.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          status: "PENDING"
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return boards;
}


/** Create a new board and assign the user as ADMIN */
export async function createBoard(data: {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
  image?: string;
  tags?: string[];
  isPublic?: boolean;
  approvalRequired?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a board");
  }

  const newBoard = await prisma.board.create({
    data: {
      creatorId: session.user.id,
      name: data.name,
      description: data.description,
      color: data.color || "#FFD166",
      emoji: data.emoji || "🏘️",
      image: data.image,
      tags: data.tags || [],
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      approvalRequired: data.approvalRequired || false,
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/");
  redirect(`/board/${newBoard.id}`);
}

/** Update an existing board (Only for ADMINs) */
export async function updateBoard(boardId: string, data: {
  name?: string;
  description?: string;
  color?: string;
  emoji?: string;
  image?: string;
  tags?: string[];
  isPublic?: boolean;
  approvalRequired?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a board");
  }

  // Check if user is ADMIN of the board
  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });

  if (membership?.role !== "ADMIN") {
    throw new Error("Chỉ có quản trị viên mới có quyền cập nhật bảng");
  }

  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      emoji: data.emoji,
      image: data.image,
      tags: data.tags,
      isPublic: data.isPublic,
      approvalRequired: data.approvalRequired,
    },
  });

  revalidatePath(`/board/${boardId}`);
  revalidatePath("/");
  return updatedBoard;
}

/** Get full data for a board including posts and zones */
export async function getBoardData(boardId: string) {
  const session = await auth();
  
  // Check if user is a member
  if (session?.user?.id) {
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: session.user.id
        }
      }
    });

    if (membership && membership.status === "APPROVED") {
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          posts: {
            orderBy: { createdAt: "desc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              votes: true,
              likes: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true
                    }
                  }
                }
              },
              comments: {
                orderBy: { createdAt: "asc" },
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      image: true
                    }
                  },
                  commentLikes: {
                    select: { userId: true }
                  },
                  _count: {
                    select: { commentLikes: true }
                  }
                }
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                  votes: true
                }
              }
            }
          },
          zones: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          },
          _count: {
            select: {
              members: true,
              posts: true
            }
          }
        }
      });
      return board;
    }
  }

  // If not member, only allow if public preview
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      name: true,
      isPublic: true,
      description: true,
      color: true,
      emoji: true
    }
  });

  if (board?.isPublic) {
     return board;
  }

  throw new Error("Bạn không có quyền truy cập vào bảng này. Vui lòng tham gia hoặc chờ xét duyệt.");
}

/** Get public preview details of a board via its invite code */
export async function getBoardPreview(inviteCode: string) {
  const board = await prisma.board.findUnique({
    where: { inviteCode },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      emoji: true,
      isPublic: true,
      _count: {
        select: { members: true },
      },
    },
  });

  return board;
}

/** Join a board using an invite code */
export async function joinBoard(inviteCode: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to join a board");
  }

  const board = await prisma.board.findUnique({
    where: { inviteCode },
  });

  if (!board) {
    throw new Error("Bảng không tồn tại hoặc link mời đã bị xóa");
  }

  // Check if they are already a member so we don't crash on unique constraint
  const existingMembership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: board.id,
        userId: session.user.id,
      },
    },
  });

  if (!existingMembership) {
    const status = board.approvalRequired ? "PENDING" : "APPROVED";
    
    const membership = await prisma.boardMember.create({
      data: {
        boardId: board.id,
        userId: session.user.id,
        role: "MEMBER",
        status: status
      },
    });

    revalidatePath("/");
    revalidatePath(`/board/${board.id}`);
    
    return { ...board, members: [membership], currentUserId: session.user.id };
  }

  return { ...board, members: [existingMembership], currentUserId: session.user.id };
}

/** Leave a board */
export async function leaveBoard(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to leave a board");
  }

  // Check if they are the owner (creator) - they can't leave their own board this way
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { creatorId: true }
  });

  if (board?.creatorId === session.user.id) {
    throw new Error("Bạn không thể rời khỏi bảng do mình tạo ra. Hãy xóa bảng nếu muốn.");
  }

  await prisma.boardMember.delete({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });

  revalidatePath("/");
  return { success: true };
}

/** Delete a board (Creator only) */
export async function deleteBoard(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a board");
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { creatorId: true }
  });

  if (board?.creatorId !== session.user.id) {
    throw new Error("Chỉ chủ phòng mới có quyền xóa bảng này");
  }

  await prisma.board.delete({
    where: { id: boardId },
  });

  revalidatePath("/");
  return { success: true };
}

/** Approve a join request */
export async function approveMember(boardId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const adminCheck = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: session.user.id } }
  });

  if (adminCheck?.role !== "ADMIN") throw new Error("Chỉ quản trị viên mới có thực hiện");

  await prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId } },
    data: { status: "APPROVED" }
  });

  revalidatePath(`/board/${boardId}`);
  return { success: true };
}

/** Reject/Kick a member */
export async function rejectMember(boardId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const adminCheck = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: session.user.id } }
  });

  if (adminCheck?.role !== "ADMIN") throw new Error("Chỉ quản trị viên mới có thực hiện");

  await prisma.boardMember.delete({
    where: { boardId_userId: { boardId, userId } }
  });

  revalidatePath(`/board/${boardId}`);
  return { success: true };
}

/** Update member role */
export async function updateMemberRole(boardId: string, userId: string, role: "ADMIN" | "MEMBER") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { creatorId: true }
  });

  if (board?.creatorId !== session.user.id) throw new Error("Chỉ chủ phòng mới có thể thay đổi vai trò");

  await prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId } },
    data: { role }
  });

  revalidatePath(`/board/${boardId}`);
  return { success: true };
}

/** Kick member (by ID) */
export async function kickMember(boardId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check if current user is ADMIN of this board
  const currentUserMembership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });

  if (currentUserMembership?.role !== "ADMIN") {
    throw new Error("Chỉ quản trị viên mới có quyền kick thành viên");
  }

  // Check if the user being kicked is the creator
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { creatorId: true }
  });

  if (board?.creatorId === userId) {
    throw new Error("Không thể kick chủ phòng");
  }

  // Check if requester has authority over the person being kicked
  // (Creator can kick anyone, Admins can't kick other Admins unless they are the creator)
  const targetMember = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } }
  });

  if (targetMember?.role === "ADMIN" && board?.creatorId !== session.user.id) {
    throw new Error("Chỉ chủ phòng mới có thể kick một Quản trị viên khác");
  }

  await prisma.boardMember.delete({
    where: {
      boardId_userId: {
        boardId,
        userId: userId,
      },
    },
  });

  revalidatePath(`/board/${boardId}`);
  return { success: true };
}
