"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Settings, Trophy, User, BookText, FileText } from "lucide-react"
import { NotificationDropdown } from "./notification-dropdown"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
          <BookOpen className="h-6 w-6" />
          <span>Cognitia</span>
        </Link>
        <div className="ml-auto">
          <nav className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/dashboard") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </Link>

            <Link
              href="/profile"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/profile") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Link>
            <Link
              href="/study-plan"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/study-plan") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Study Plan</span>
            </Link>
            <Link
              href="/notes"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/notes") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <BookText className="h-5 w-5" />
              <span className="text-xs">Notes</span>
            </Link>
            <Link
              href="/contests"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/contests") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <Trophy className="h-5 w-5" />
              <span className="text-xs">Contest</span>
            </Link>
            <Link
              href="/model-test"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/model-test") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Model Test</span>
            </Link>
            <Link
              href="/settings/account"
              className={cn(
                "flex flex-col items-center hover:text-emerald-600",
                isActive("/settings") ? "text-emerald-600" : "text-slate-600",
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Link>
            <NotificationDropdown />
          </nav>
        </div>
      </div>
    </div>
  )
}
