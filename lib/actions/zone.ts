"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createZone(data: {
  boardId: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  borderStyle?: "solid" | "dashed";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const newZone = await prisma.zone.create({
    data: {
      boardId: data.boardId,
      name: data.name,
      x: data.x,
      y: data.y,
      width: data.width || 400,
      height: data.height || 400,
      color: data.color || "#1A1A2E",
      borderStyle: data.borderStyle || "dashed",
    },
  });

  revalidatePath(`/board/${data.boardId}`);
  return newZone;
}

export async function updateZone(zoneId: string, boardId: string, data: Partial<{
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderStyle: "solid" | "dashed";
}>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.zone.update({
    where: { id: zoneId },
    data
  });

  revalidatePath(`/board/${boardId}`);
}

export async function deleteZone(zoneId: string, boardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.zone.delete({
    where: { id: zoneId }
  });

  revalidatePath(`/board/${boardId}`);
}
