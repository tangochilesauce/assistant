'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { ActionLine } from '@/components/action-line'
import { useTodoStore } from '@/store/todo-store'
import { PROJECTS } from '@/data/projects'
import { fmt } from '@/data/finance'
import { useTransactionStore } from '@/store/transaction-store'

export default function TodayPage() {
  const { todos, fetchTodos, initialized } = useTodoStore()
  const { fetchTransactions, balance, getMonthlyTotals, initialized: txnInit } = useTransactionStore()

  useEffect(() => {
    fetchTodos()
    fetchTransactions()
  }, [fetchTodos, fetchTransactions])

  const { totalIn, net } = getMonthlyTotals()

  // Sort: incomplete first, then by project weight (descending)
  const weightMap = Object.fromEntries(PROJECTS.map(p => [p.slug, p.weight]))
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return (weightMap[b.projectSlug] ?? 0) - (weightMap[a.projectSlug] ?? 0)
  })

  const incomplete = sortedTodos.filter(t => !t.completed).length

  return (
    <>
      <PageHeader title="Today" count={incomplete} />
      <div className="flex-1 overflow-y-auto">
        {/* Cash snapshot */}
        <div className="grid grid-cols-3 gap-px bg-border/50 border-b border-border">
          <div className="bg-background px-4 py-3">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className={`text-lg font-semibold tabular-nums ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${fmt(balance)}
            </div>
          </div>
          <div className="bg-background px-4 py-3">
            <div className="text-xs text-muted-foreground">In /mo</div>
            <div className="text-lg font-semibold tabular-nums text-emerald-400">
              +${fmt(Math.round(totalIn))}
            </div>
          </div>
          <div className="bg-background px-4 py-3">
            <div className="text-xs text-muted-foreground">Net /mo</div>
            <div className={`text-lg font-semibold tabular-nums ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {net >= 0 ? '+' : '-'}${fmt(Math.abs(Math.round(net)))}
            </div>
          </div>
        </div>

        {/* Action list */}
        {!initialized ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : sortedTodos.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No actions yet.</div>
        ) : (
          <div>
            {sortedTodos.map(todo => (
              <ActionLine key={todo.id} todo={todo} showProject />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
