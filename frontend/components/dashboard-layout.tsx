import { type ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Cpu, LayoutDashboard, BookOpen, Brain, Video, FileQuestion, User, Menu, X, LogOut, Calendar, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"

interface DashboardLayoutProps {
  children: ReactNode
  hideSidebar?: boolean
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#8B7CFF" },
  { href: "/learn", label: "Learn", icon: BookOpen, color: "#06B6D4" },
  { href: "/planner", label: "Planner", icon: Calendar, color: "#3B82F6" },
  { href: "/community", label: "Community", icon: Users, color: "#22C55E" },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top Header Navigation */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mr-8 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                COAverse
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`
                        relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                        ${isActive ? "" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                      `}
                      style={isActive ? {
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        boxShadow: `0 0 20px -5px ${item.color}30`,
                        border: `1px solid ${item.color}30`
                      } : undefined}
                    >
                      <Icon className="h-4 w-4" style={isActive ? { color: item.color } : undefined} />
                      {item.label}

                      {/* Active Indicator Line */}
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full mx-auto"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 0 10px 1px ${item.color}`
                          }}
                        />
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Right Side: Profile & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <ModeToggle />
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
                    <Avatar className="h-9 w-9 ring-2 ring-white/10 transition-transform hover:scale-105 shadow-lg shadow-primary/20">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-[#8B7CFF] to-[#F43F5E] text-white font-bold">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background px-4 py-2 space-y-1 animate-in slide-in-from-top-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      style={isActive ? {
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

