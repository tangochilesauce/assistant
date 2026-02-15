"use client";

interface Project {
  id: string;
  name: string;
  emoji: string;
  colorHex: string;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  isConfirmed: boolean;
  category: string;
  notes: string;
  runningBalance: number;
  project: Project | null;
}

interface Props {
  transactions: Transaction[];
  startingBalance: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function CashClient({ transactions, startingBalance }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group by date
  const grouped = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.date.split("T")[0];
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }

  // Find the final balance for each date
  const dateBalances = new Map<string, number>();
  for (const [key, txns] of grouped) {
    dateBalances.set(key, txns[txns.length - 1].runningBalance);
  }

  // Current balance = last transaction before or on today
  const pastTxns = transactions.filter((t) => new Date(t.date) <= today);
  const currentBalance = pastTxns.length > 0 ? pastTxns[pastTxns.length - 1].runningBalance : startingBalance;

  // Find lowest upcoming balance
  const lowestUpcoming = transactions.reduce(
    (min, t) => (t.runningBalance < min ? t.runningBalance : min),
    Infinity
  );
  const lowestDate = transactions.find((t) => t.runningBalance === lowestUpcoming);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">
        <span className="mr-2">💰</span>Cash Flow
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">Now</div>
          <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            ${currentBalance.toLocaleString()}
          </div>
        </div>
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
          <div className="text-xs text-neutral-500 uppercase tracking-wide">Lowest Point</div>
          <div className={`text-2xl font-bold ${lowestUpcoming >= 0 ? "text-amber-400" : "text-red-400"}`}>
            ${lowestUpcoming === Infinity ? "—" : lowestUpcoming.toLocaleString()}
          </div>
          {lowestDate && (
            <div className="text-xs text-neutral-500 mt-1">{formatDate(lowestDate.date)}</div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {/* Starting balance */}
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
          <div className="w-16 text-neutral-500 text-xs">Start</div>
          <div className="flex-1 text-neutral-400">Opening Balance</div>
          <div className="text-neutral-400 font-mono text-xs">
            ${startingBalance.toLocaleString()}
          </div>
        </div>

        {Array.from(grouped.entries()).map(([dateKey, txns]) => {
          const isPast = new Date(dateKey) < today;
          const isToday = dateKey === today.toISOString().split("T")[0];

          return (
            <div key={dateKey}>
              {/* Date header */}
              <div className={`flex items-center gap-3 px-3 py-1.5 mt-2 ${isToday ? "bg-amber-400/10 rounded-lg" : ""}`}>
                <div className={`text-xs font-semibold ${isToday ? "text-amber-400" : isPast ? "text-neutral-600" : "text-neutral-400"}`}>
                  {formatDate(dateKey)}
                  {isToday && " (today)"}
                </div>
                <div className="flex-1 h-px bg-[#262626]" />
                <div
                  className={`text-xs font-mono font-bold ${
                    dateBalances.get(dateKey)! >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  ${dateBalances.get(dateKey)!.toLocaleString()}
                </div>
              </div>

              {/* Transactions for this date */}
              {txns.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    isPast ? "opacity-60" : ""
                  }`}
                >
                  <div className="w-16" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!t.isConfirmed ? "italic text-neutral-400" : ""}`}>
                        {t.title}
                      </span>
                      {t.project && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: t.project.colorHex + "20",
                            color: t.project.colorHex,
                          }}
                        >
                          {t.project.emoji}
                        </span>
                      )}
                    </div>
                    {t.notes && (
                      <div className="text-[10px] text-neutral-600 truncate">{t.notes}</div>
                    )}
                  </div>
                  <div
                    className={`text-sm font-mono ${
                      t.amount > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
