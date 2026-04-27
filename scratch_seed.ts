import { prisma } from "./lib/prisma";
import { PostType, PostStatus } from "@prisma/client";

async function main() {
  const boards = await prisma.board.findMany({ take: 5 });
  const users = await prisma.user.findMany({ take: 5 });
  
  if (boards.length === 0 || users.length === 0) {
    console.log("No boards or users found.");
    return;
  }

  const boardId = boards[0].id;
  const authorId = users[0].id;

  const count = 1000;
  console.log(`Seeding ${count} posts for board ${boardId} and user ${authorId}`);

  const postTitles = [
    "Thông báo họp cư dân", "Tìm mèo lạc", "Cảnh báo an ninh", "Thanh lý đồ", 
    "Cần mượn đồ", "Hỏi đáp phí bảo trì", "Sửa chữa kỹ thuật", "Khai trương", 
    "Mất đồ", "Tặng đồ cũ", "Nhắc nhở vệ sinh", "Yêu cầu sửa chữa", 
    "Tìm việc/Tuyển dụng", "Bán hàng nông sản", "Câu lạc bộ cư dân", "Cảnh báo lừa đảo"
  ];

  const postsData: any[] = [];

  for (let i = 0; i < count; i++) {
    postsData.push({
      boardId: boardId,
      authorId: authorId,
      title: `${postTitles[i % postTitles.length]} #${i + 1}`,
      content: `Nội dung chi tiết cho bài đăng số ${i + 1}. Đây là dữ liệu giả lập để kiểm tra hiệu năng hệ thống ComBoard với số lượng lớn dữ liệu.`,
      type: (i % 3 === 0 ? "ANNOUNCEMENT" : (i % 3 === 1 ? "BORROWING" : "QNA")) as PostType,
      x: Math.random() * 10000 - 5000,
      y: Math.random() * 10000 - 5000,
      rotation: Math.random() * 30 - 15,
      status: "OPEN" as PostStatus,
    });
  }

  // Use createMany for performance
  await prisma.post.createMany({
    data: postsData
  });

  console.log(`Successfully created ${count} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
