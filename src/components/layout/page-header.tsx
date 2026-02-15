import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface PageHeaderProps {
  title: string
  count?: number
  children?: React.ReactNode
}

export function PageHeader({ title, count, children }: PageHeaderProps) {
  return (
    <header className="flex items-center h-12 px-4 border-b border-border shrink-0">
      <SidebarTrigger className="-ml-1 mr-2" />
      <Separator orientation="vertical" className="h-4 mr-3" />
      <h1 className="text-sm font-semibold">{title}</h1>
      {count !== undefined && (
        <span className="ml-2 text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
      {children && (
        <div className="ml-auto flex items-center gap-2">
          {children}
        </div>
      )}
    </header>
  )
}
