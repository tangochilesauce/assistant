'use client'

import { useTransactionStore } from '@/store/transaction-store'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'

const chartConfig: ChartConfig = {
  balance: {
    label: 'Balance',
    color: '#34d399', // emerald-400
  },
}

export function ForecastChart() {
  const { getForecast } = useTransactionStore()
  const { daily, summary } = getForecast(90)

  if (daily.length === 0) {
    return (
      <div className="text-sm text-muted-foreground/60 text-center py-8">
        No recurring items to forecast. Add income and expenses to see projections.
      </div>
    )
  }

  // Prepare chart data — sample every 1 day for 90 day chart
  const data = daily.map(d => ({
    date: d.date,
    balance: Math.round(d.balance),
    label: formatShortDate(d.date),
  }))

  const minBalance = Math.min(...data.map(d => d.balance))
  const maxBalance = Math.max(...data.map(d => d.balance))
  const yMin = Math.min(0, minBalance - 500)
  const yMax = maxBalance + 500

  return (
    <div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#737373' }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#737373' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            domain={[yMin, yMax]}
            width={45}
          />

          {/* Zero line */}
          <ReferenceLine y={0} stroke="#525252" strokeDasharray="3 3" />

          {/* Danger zones */}
          {summary.dangerZones.map((zone, i) => (
            <ReferenceArea
              key={i}
              x1={formatShortDate(zone.start)}
              x2={formatShortDate(zone.end)}
              y1={yMin}
              y2={0}
              fill="#f87171"
              fillOpacity={0.08}
            />
          ))}

          {/* 30/60 day markers */}
          {data.length > 30 && (
            <ReferenceLine
              x={data[30]?.label}
              stroke="#525252"
              strokeDasharray="2 4"
              label={{ value: '30d', position: 'top', fontSize: 10, fill: '#737373' }}
            />
          )}
          {data.length > 60 && (
            <ReferenceLine
              x={data[60]?.label}
              stroke="#525252"
              strokeDasharray="2 4"
              label={{ value: '60d', position: 'top', fontSize: 10, fill: '#737373' }}
            />
          )}

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                labelFormatter={(label) => label}
              />
            }
          />

          <Area
            type="monotone"
            dataKey="balance"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#34d399' }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

function formatShortDate(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}
