import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      goals: {
        orderBy: { timeframe: "asc" },
      },
      _count: {
        select: {
          todoItems: { where: { isCompleted: false } },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Get completed count per project this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedByProject = await prisma.todoItem.groupBy({
    by: ["projectId"],
    where: {
      isCompleted: true,
      completedAt: { gte: monthStart },
    },
    _count: true,
  });
  const completedMap = new Map(
    completedByProject.map((c) => [c.projectId, c._count])
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">
        <span className="mr-2">📊</span>Projects
      </h1>

      <div className="space-y-4">
        {projects.map((project) => {
          const yearlyGoals = project.goals.filter((g) => g.timeframe === "yearly");
          const monthlyGoals = project.goals.filter((g) => g.timeframe === "monthly");
          const pending = project._count.todoItems;
          const done = completedMap.get(project.id) || 0;

          return (
            <div
              key={project.id}
              className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden"
            >
              {/* Header with color bar */}
              <div
                className="h-1"
                style={{ backgroundColor: project.colorHex }}
              />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{project.emoji}</span>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg">{project.name}</h2>
                    <div className="text-xs text-neutral-500">
                      {(project.weight * 100).toFixed(0)}% weight &middot;{" "}
                      {pending} pending &middot; {done} done this month
                    </div>
                  </div>
                </div>

                {/* Goals */}
                {yearlyGoals.map((g) => (
                  <div key={g.id} className="mb-2">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                      12-Month Goal
                    </div>
                    <div className="text-sm text-neutral-300">{g.title}</div>
                  </div>
                ))}
                {monthlyGoals.map((g) => (
                  <div key={g.id} className="mb-2">
                    <div className="text-[10px] text-amber-400/70 uppercase tracking-wide">
                      This Month
                    </div>
                    <div className="text-sm">{g.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
