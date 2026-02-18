'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Inbox,
  Kanban,
  DollarSign,
  Target,
  Calendar,
  ClipboardCheck,
  Brain,
  Package,
  Tv,
  type LucideIcon,
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

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  Tv,
}

const TOOL_COLOR = '#c2956a'  // muted warm — visually distinct from bright channel colors

const NAV_MAIN = [
  { href: '/today', label: 'Today', icon: Inbox },
]

const NAV_VIEWS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/board', label: 'Board', icon: Kanban },
  { href: '/cash', label: 'Financial', icon: DollarSign },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/log', label: 'Completed', icon: ClipboardCheck },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/brains', label: 'Brains', icon: Brain },
]

export function AppSidebar() {
  const pathname = usePathname()
  const balance = useTransactionStore(s => s.balance)
  const rootProjects = getRootProjects()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-4 py-3">
        <Link href="/today" className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide">PL8</span>
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
              const tools = project.tools || []
              const isParentActive = pathname === `/projects/${project.slug}`
              const hasChildren = subs.length > 0 || tools.length > 0

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

                  {/* Sub-projects + tools */}
                  {hasChildren && (
                    <SidebarMenuSub>
                      {/* Channel sub-projects (bright color, no icon) */}
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

                      {/* Project tools (muted warm color, with icon) */}
                      {tools.map(tool => {
                        const Icon = ICON_MAP[tool.icon]
                        return (
                          <SidebarMenuSubItem key={tool.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === tool.href}
                            >
                              <Link href={tool.href}>
                                {Icon && (
                                  <Icon
                                    className="size-3 mr-0.5"
                                    style={{ color: tool.color || TOOL_COLOR }}
                                  />
                                )}
                                <span
                                  className="text-xs"
                                  style={{ color: tool.color || TOOL_COLOR }}
                                >
                                  {tool.label}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
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
