"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gamepad2, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Library Compare", icon: Users },
  { href: "/playtime", label: "Playtime Tracker", icon: Clock },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-steam-border/60 bg-steam-darkest/80 backdrop-blur-md">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-steam-blue to-purple-500 shadow-lg shadow-steam-blue/20">
            <Gamepad2 size={18} className="text-steam-darkest" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Steam<span className="text-steam-blue">Tool</span>
          </span>
        </Link>

        <nav className="flex gap-1 rounded-full border border-steam-border/60 bg-steam-panel/60 p-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-steam-blue to-purple-500 text-steam-darkest shadow-md"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
