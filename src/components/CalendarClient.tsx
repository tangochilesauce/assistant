"use client";

import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  emoji: string;
  colorHex: string;
}

interface Todo {
  id: string;
  title: string;
  date: string;
  timeSlot: string;
  isLocked: boolean;
  isCompleted: boolean;
  project: Project | null;
}

interface Props {
  todos: Todo[];
  projects: Project[];
  startDate: string;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CalendarClient({ todos, startDate }: Props) {
  const router = useRouter();
  const start = new Date(startDate);

  // Build 14 days
  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  // Group todos by date
  const byDate = new Map<string, Todo[]>();
  for (const todo of todos) {
    const key = todo.date.split("T")[0];
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(todo);
  }

  const todayKey = new Date().toISOString().split("T")[0];

  async function toggleTodo(id: string, isCompleted: boolean) {
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCompleted: !isCompleted }),
    });
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">
        <span className="mr-2">📅</span>Next 2 Weeks
      </h1>

      <div className="space-y-3">
        {days.map((day) => {
          const key = day.toISOString().split("T")[0];
          const isToday = key === todayKey;
          const dayTodos = byDate.get(key) || [];
          const completed = dayTodos.filter((t) => t.isCompleted).length;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={key}
              className={`rounded-xl border transition-colors ${
                isToday
                  ? "bg-amber-400/5 border-amber-400/30"
                  : "bg-[#141414] border-[#262626]"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#262626]/50">
                <span
                  className={`text-xs font-bold ${
                    isToday
                      ? "text-amber-400"
                      : isWeekend
                      ? "text-neutral-500"
                      : "text-neutral-300"
                  }`}
                >
                  {dayNames[day.getDay()]}
                </span>
                <span className={`text-sm ${isToday ? "text-amber-400 font-bold" : "text-neutral-400"}`}>
                  {monthNames[day.getMonth()]} {day.getDate()}
                </span>
                {isToday && (
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded-full font-bold ml-1">
                    TODAY
                  </span>
                )}
                <div className="flex-1" />
                {dayTodos.length > 0 && (
                  <span className="text-[10px] text-neutral-500">
                    {completed}/{dayTodos.length}
                  </span>
                )}
              </div>

              {/* Tasks */}
              {dayTodos.length > 0 ? (
                <div className="px-2 py-1">
                  {dayTodos.map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                          todo.isCompleted
                            ? "bg-amber-400 border-amber-400"
                            : "border-neutral-600"
                        }`}
                      >
                        {todo.isCompleted && (
                          <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-xs flex-1 truncate ${
                          todo.isCompleted
                            ? "line-through text-neutral-600"
                            : todo.isLocked
                            ? "font-bold"
                            : "text-neutral-300"
                        }`}
                      >
                        {todo.title}
                      </span>
                      {todo.project && (
                        <span
                          className="text-[9px] px-1 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: todo.project.colorHex + "20",
                            color: todo.project.colorHex,
                          }}
                        >
                          {todo.project.emoji}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-neutral-600 italic">
                  Nothing scheduled
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
