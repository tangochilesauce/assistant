"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Today", icon: "🍑" },
  { href: "/cash", label: "Cash", icon: "💰" },
  { href: "/calendar", label: "Cal", icon: "📅" },
  { href: "/projects", label: "Projects", icon: "📊" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-[#262626] z-50">
        <div className="flex justify-around py-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                  active ? "text-amber-400" : "text-neutral-500"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: left sidebar */}
      <nav className="hidden sm:flex fixed left-0 top-0 bottom-0 w-16 bg-[#141414] border-r border-[#262626] flex-col items-center py-4 gap-4 z-50">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs transition-colors ${
                active
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-[10px]">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
