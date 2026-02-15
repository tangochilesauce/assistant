"use client";

import { useState } from "react";
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

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
}

interface Props {
  todos: Todo[];
  projects: Project[];
  balance: number;
  nextIncome: Transaction | null;
  dateLabel: string;
}

const slotLabels: Record<string, string> = {
  am: "Morning",
  pm: "Afternoon",
  eve: "Evening",
  all: "",
};

export function TodayClient({ todos, projects, balance, nextIncome, dateLabel }: Props) {
  const router = useRouter();
  const [optimisticTodos, setOptimisticTodos] = useState(todos);

  async function toggleTodo(id: string, isCompleted: boolean) {
    // Optimistic update
    setOptimisticTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !isCompleted } : t))
    );

    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCompleted: !isCompleted }),
    });

    router.refresh();
  }

  const completed = optimisticTodos.filter((t) => t.isCompleted).length;
  const total = optimisticTodos.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by time slot
  const slots = ["am", "pm", "eve", "all"];
  const grouped = slots
    .map((slot) => ({
      slot,
      label: slotLabels[slot],
      items: optimisticTodos.filter((t) => t.timeSlot === slot),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          <span className="mr-2">🍑</span>
          {dateLabel}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm text-neutral-400">
            {completed}/{total}
          </span>
        </div>
      </div>

      {/* Cash snapshot */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">Balance</div>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${balance.toLocaleString()}
            </div>
          </div>
          {nextIncome && (
            <div className="text-right">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Next In</div>
              <div className="text-sm text-emerald-400">
                +${nextIncome.amount.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500">
                {nextIncome.title} &middot;{" "}
                {new Date(nextIncome.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Todo groups */}
      {grouped.map((group) => (
        <div key={group.slot} className="mb-5">
          {group.label && (
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              {group.label}
            </h2>
          )}
          <div className="space-y-1">
            {group.items.map((todo) => (
              <button
                key={todo.id}
                onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#141414] border border-[#262626] hover:bg-[#1a1a1a] active:bg-[#222] transition-colors text-left"
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    todo.isCompleted
                      ? "bg-amber-400 border-amber-400"
                      : "border-neutral-600"
                  }`}
                >
                  {todo.isCompleted && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm truncate ${
                      todo.isCompleted
                        ? "line-through text-neutral-600"
                        : todo.isLocked
                        ? "font-bold"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </div>
                </div>

                {/* Project pill */}
                {todo.project && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
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
        </div>
      ))}

      {total === 0 && (
        <div className="text-center py-16 text-neutral-500">
          <div className="text-4xl mb-2">🍑</div>
          <div>Nothing scheduled today</div>
        </div>
      )}
    </div>
  );
}
