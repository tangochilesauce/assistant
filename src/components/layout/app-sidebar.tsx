'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Inbox,
  ListChecks,
  Kanban,
  DollarSign,
  Calendar,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { PROJECTS } from '@/data/projects'
import { fmt } from '@/data/finance'
import { useTransactionStore } from '@/store/transaction-store'

const NAV_MAIN = [
  { href: '/today', label: 'Today', icon: Inbox },
  { href: '/projects', label: 'All Projects', icon: ListChecks },
]

const NAV_VIEWS = [
  { href: '/board', label: 'Board', icon: Kanban },
  { href: '/cash', label: 'Cash Flow', icon: DollarSign },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname()
  const balance = useTransactionStore(s => s.balance)

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-4 py-3">
        <Link href="/today" className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide">JEFF</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarMenu>
            {NAV_MAIN.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            {PROJECTS.map(project => (
              <SidebarMenuItem key={project.slug}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/projects/${project.slug}`}
                >
                  <Link href={`/projects/${project.slug}`}>
                    <span>{project.emoji}</span>
                    <span style={{ color: project.color }}>{project.name}</span>
                    {project.weight > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {project.weight}%
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Views */}
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_VIEWS.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Balance</span>
          <span className={`font-semibold tabular-nums ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${fmt(balance)}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
