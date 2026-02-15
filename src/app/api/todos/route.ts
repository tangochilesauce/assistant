import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }
  if (projectId) where.projectId = projectId;

  const todos = await prisma.todoItem.findMany({
    where,
    include: { project: true, goal: true },
    orderBy: [
      { isCompleted: "asc" },
      { isLocked: "desc" },
      { timeSlot: "asc" },
    ],
  });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const todo = await prisma.todoItem.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      timeSlot: body.timeSlot || "all",
      isLocked: body.isLocked || false,
      projectId: body.projectId || null,
      goalId: body.goalId || null,
      impact: body.impact || 5,
      ease: body.ease || 5,
      control: body.control || 10,
      urgency: body.urgency || 1,
    },
    include: { project: true },
  });
  return NextResponse.json(todo);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (data.isCompleted === true) {
    data.completedAt = new Date();
  }
  const todo = await prisma.todoItem.update({
    where: { id },
    data,
    include: { project: true },
  });
  return NextResponse.json(todo);
}
