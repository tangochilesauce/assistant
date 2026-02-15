import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      goals: { orderBy: { timeframe: "asc" } },
      _count: {
        select: {
          todoItems: { where: { isCompleted: false } },
          transactions: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(projects);
}
