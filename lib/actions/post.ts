"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPost(data: {
  boardId: string;
  title: string;
  content: string;
  type: "ANNOUNCEMENT" | "BORROWING" | "QNA" | "POLL";
  image?: string;
  link?: string;
  pollOptions?: string[];
  status?: "OPEN" | "IN_PROGRESS" | "DONE";
  x?: number;
  y?: number;
}) {
  console.log("Creating post with data:", data);
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a post");
  }

  const newPost = await prisma.post.create({
    data: {
      boardId: data.boardId,
      authorId: session.user.id,
      title: data.title,
      content: data.content,
      type: data.type,
      image: data.image,
      link: data.link,
      pollOptions: data.pollOptions,
      status: data.status || "OPEN",
      x: data.x || 0,
      y: data.y || 0,
      rotation: Math.random() * 6 - 3,
      width: data.image ? 300 : 400,
      height: data.image ? 400 : 280,
    },
  });

  revalidatePath(`/board/${data.boardId}`);

  // Notify other members of the board
  try {
    // 1. Get all approved members of this board except the author
    const members = await prisma.boardMember.findMany({
      where: {
        boardId: data.boardId,
        status: "APPROVED",
        userId: { not: session.user.id }
      },
      select: { userId: true }
    });

    if (members.length > 0) {
      // 2. Determine notification type and message based on the post
      let message = "";
      let notifType: "NEW_POST" | "NEW_POLL" = "NEW_POST";

      if (data.type === "POLL") {
        message = `đã tạo một cuộc thăm ý kiến mới: "${data.title}"`;
        notifType = "NEW_POLL";
      } else if (data.link) {
        message = `đã chia sẻ một liên kết mới: "${data.title}"`;
      } else {
        message = `đã đăng một thông báo mới: "${data.title}"`;
      }

      const senderName = session.user.name || "Ai đó";
      const fullContent = `${senderName} ${message}`;

      // 3. Create notifications in bulk (Prisma 5.x+)
      await prisma.notification.createMany({
          data: members.map((m: any) => ({
            userId: m.userId,
            boardId: data.boardId,
            postId: newPost.id,
            type: notifType,
            content: fullContent,
          }))
      });
    }
  } catch (err) {
    console.error("Failed to create notifications:", err);
    // We don't throw here to not break post creation if notification fails
  }

  return newPost;
}

export async function deletePost(postId: string, boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a post");
  }

  try {
    // 1. Fetch the post to check authorship and existence
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) throw new Error("Bài viết không tồn tại");

    // 2. Check if user is the author
    const isAuthor = post.authorId === session.user.id;

    // 3. Check if user is a board admin
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: session.user.id,
        },
      },
    });
    const isAdmin = membership?.role === "ADMIN";

    // Permission check: Author OR Admin
    if (!isAuthor && !isAdmin) {
      throw new Error("Bạn không có quyền xóa bài viết này");
    }

    console.log(`DELETION: User ${session.user.id} (${isAdmin ? 'Admin' : 'Author'}) is deleting post ${postId}`);
    
    // Cleanup and delete
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.like.deleteMany({ where: { postId } });
    
    await prisma.post.delete({
      where: { id: postId }
    });
    
    revalidatePath(`/board/${boardId}`);
    return { success: true };
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    throw new Error(error.message || "Không thể xóa bài viết");
  }
}

export async function updatePostTransform(postId: string, boardId: string, transform: { x?: number, y?: number, rotation?: number, scale?: number }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) throw new Error("Post not found");

  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id
      }
    }
  });
  const isAdmin = membership?.role === "ADMIN";

  if (post.authorId !== session.user.id && !isAdmin) {
    throw new Error("Chỉ tác giả hoặc Quản trị viên mới có quyền di chuyển hoặc thay đổi kích thước bài viết này");
  }

  await prisma.post.update({
    where: { id: postId },
    data: transform
  });

  revalidatePath(`/board/${boardId}`);
}

export async function toggleLike(postId: string, boardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id
      }
    }
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id }
    });
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId: session.user.id
      }
    });
  }

  revalidatePath(`/board/${boardId}`);
}

export async function addComment(postId: string, boardId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const newComment = await prisma.comment.create({
    data: {
      postId,
      authorId: session.user.id,
      content
    }
  });

  revalidatePath(`/board/${boardId}`);
  return newComment;
}

export async function togglePin(postId: string, boardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await prisma.boardMember.findUnique({
    where: { 
      boardId_userId: { 
        boardId, 
        userId: session.user.id 
      } 
    }
  });

  if (member?.role !== "ADMIN") {
    throw new Error("Only admins can pin posts");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { isPinned: true }
  });

  if (!post) throw new Error("Post not found");

  await prisma.post.update({
    where: { id: postId },
    data: { isPinned: !post.isPinned }
  });

  revalidatePath(`/board/${boardId}`);
}

export async function toggleCommentLike(commentId: string, boardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId: session.user.id
      }
    }
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { id: existingLike.id }
    });
  } else {
    await prisma.commentLike.create({
      data: {
        commentId,
        userId: session.user.id
      }
    });
  }

  revalidatePath(`/board/${boardId}`);
}

export async function addCommentReply(postId: string, boardId: string, parentId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const newComment = await prisma.comment.create({
    data: {
      postId,
      authorId: session.user.id,
      parentId,
      content
    }
  });

  revalidatePath(`/board/${boardId}`);
  return newComment;
}

export async function deleteComment(commentId: string, boardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true }
  });

  if (!comment) throw new Error("Comment not found");

  // Check if admin
  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id,
      },
    },
  });
  const isAdmin = membership?.role === "ADMIN";
  const isAuthor = comment.authorId === session.user.id;

  console.log(`DELETE COMMENT ATTEMPT: User ${session.user.id}, Comment ${commentId}, isAdmin: ${isAdmin}, isAuthor: ${isAuthor}`);

  if (!isAdmin && !isAuthor) {
    console.error(`PERMISSION DENIED: User ${session.user.id} tried to delete comment ${commentId}`);
    throw new Error(`Bạn không có quyền xóa bình luận này. (User ID: ${session.user.id}, Author ID: ${comment.authorId})`);
  }

  try {
    // 1. Manually delete children to be absolutely safe (some DBs don't respect Cascade on self-relations)
    await prisma.comment.deleteMany({
      where: { parentId: commentId }
    });
    
    // 2. Delete likes
    await prisma.commentLike.deleteMany({
      where: { commentId }
    });

    // 3. Delete the comment itself
    await prisma.comment.delete({
      where: { id: commentId }
    });
    
    console.log(`DELETE COMMENT SUCCESS: Comment ${commentId} deleted`);
  } catch (err: any) {
    console.error(`DELETE COMMENT ERROR:`, err);
    throw new Error(`Lỗi hệ thống khi xóa: ${err.message || "Không thể xóa"}`);
  }

  revalidatePath(`/board/${boardId}`);
  return { success: true };
}

export async function updatePost(postId: string, boardId: string, data: { title?: string, content?: string, pollOptions?: string[], status?: "OPEN" | "IN_PROGRESS" | "DONE" }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) throw new Error("Post not found");
  
  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: session.user.id
      }
    }
  });
  const isAdmin = membership?.role === "ADMIN";
  const isAuthor = post.authorId === session.user.id;

  // If only status is being updated, allow Admin or Author
  const isOnlyStatus = Object.keys(data).length === 1 && 'status' in data;

  if (isOnlyStatus) {
    if (!isAuthor && !isAdmin) {
      throw new Error("Bạn không có quyền cập nhật trạng thái bài viết này.");
    }
  } else {
    // CONTENT updates (title, content, etc) still restricted to Author
    if (!isAuthor) {
      throw new Error("Chỉ tác giả mới có quyền chỉnh sửa nội dung bài viết này.");
    }
  }

  await prisma.post.update({
    where: { id: postId },
    data
  });

  revalidatePath(`/board/${boardId}`);
}
