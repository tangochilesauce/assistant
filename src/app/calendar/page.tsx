import { prisma } from "@/lib/db";
import { CalendarClient } from "@/components/CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  // Get two weeks of todos
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoWeeksOut = new Date(today);
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

  const todos = await prisma.todoItem.findMany({
    where: {
      date: { gte: today, lt: twoWeeksOut },
    },
    include: { project: true },
    orderBy: [{ date: "asc" }, { isLocked: "desc" }, { timeSlot: "asc" }],
  });

  const projects = await prisma.project.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <CalendarClient
      todos={JSON.parse(JSON.stringify(todos))}
      projects={JSON.parse(JSON.stringify(projects))}
      startDate={today.toISOString()}
    />
  );
}
