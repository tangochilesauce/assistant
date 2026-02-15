import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.settings.findFirst();
  const transactions = await prisma.transaction.findMany({
    include: { project: true },
    orderBy: { date: "asc" },
  });

  // Calculate running balance
  let balance = settings?.startingBalance || 0;
  const withBalance = transactions.map((t) => {
    balance += t.amount;
    return { ...t, runningBalance: Math.round(balance) };
  });

  return NextResponse.json({
    startingBalance: settings?.startingBalance || 0,
    transactions: withBalance,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const transaction = await prisma.transaction.create({
    data: {
      title: body.title,
      amount: body.amount,
      date: new Date(body.date),
      isConfirmed: body.isConfirmed || false,
      isRecurring: body.isRecurring || false,
      recurrenceRule: body.recurrenceRule || null,
      recurrenceDay: body.recurrenceDay || null,
      category: body.category || "income",
      notes: body.notes || "",
      projectId: body.projectId || null,
    },
    include: { project: true },
  });
  return NextResponse.json(transaction);
}
