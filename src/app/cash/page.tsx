import { prisma } from "@/lib/db";
import { CashClient } from "@/components/CashClient";

export const dynamic = "force-dynamic";

export default async function CashPage() {
  const settings = await prisma.settings.findFirst();
  const transactions = await prisma.transaction.findMany({
    include: { project: true },
    orderBy: { date: "asc" },
  });

  let balance = settings?.startingBalance || 0;
  const withBalance = transactions.map((t) => {
    balance += t.amount;
    return {
      ...t,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      runningBalance: Math.round(balance),
      project: t.project
        ? {
            ...t.project,
            createdAt: t.project.createdAt.toISOString(),
            updatedAt: t.project.updatedAt.toISOString(),
          }
        : null,
    };
  });

  return (
    <CashClient
      transactions={withBalance}
      startingBalance={settings?.startingBalance || 0}
    />
  );
}
