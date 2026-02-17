'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Inbox,
  ListChecks,
  Kanban,
  DollarSign,
  Target,
  Calendar,
  Tv,
  Flame,
  ClipboardCheck,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { getRootProjects, getSubProjects } from '@/data/projects'
import { fmt } from '@/data/finance'
import { useTransactionStore } from '@/store/transaction-store'

const NAV_MAIN = [
  { href: '/today', label: 'Today', icon: Inbox },
]

const NAV_VIEWS: { href: string; label: string; icon: typeof Inbox; external?: boolean }[] = [
  { href: '/board', label: 'Board', icon: Kanban },
  { href: '/cash', label: 'Cash Flow', icon: DollarSign },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/log', label: 'Completed', icon: ClipboardCheck },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dreamwatch', label: 'Dreamwatch', icon: Tv },
  { href: 'https://github.com/tangochilesauce/tango-dashboard', label: 'Tango Dashboard', icon: Flame, external: true },
]

export function AppSidebar() {
  const pathname = usePathname()
  const balance = useTransactionStore(s => s.balance)
  const rootProjects = getRootProjects()

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
            {rootProjects.map(project => {
              const subs = getSubProjects(project.slug)
              const isParentActive = pathname === `/projects/${project.slug}`
              const hasActiveSub = subs.some(s => pathname === `/projects/${s.slug}`)

              return (
                <SidebarMenuItem key={project.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={isParentActive}
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

                  {/* Sub-projects */}
                  {subs.length > 0 && (
                    <SidebarMenuSub>
                      {subs.map(sub => (
                        <SidebarMenuSubItem key={sub.slug}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === `/projects/${sub.slug}`}
                          >
                            <Link href={`/projects/${sub.slug}`}>
                              <span
                                className="text-xs"
                                style={{ color: sub.color }}
                              >
                                {sub.name}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Views */}
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_VIEWS.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={!item.external && pathname === item.href}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  )}
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
