"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, DoorClosed, CreditCard, Banknote, BarChart2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { DataSourceBanner } from "@/components/data-source-banner";
import { AuthActions } from "@/components/auth-actions";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/rooms", label: "Rooms", icon: DoorClosed },
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/payments", label: "Payment History", icon: Banknote },
    { href: "/reports", label: "Reports", icon: BarChart2 },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full bg-muted/30">
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="px-4 py-6 flex flex-col items-center gap-3 border-b border-border/50 text-center">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold shadow-sm shrink-0">
            D
          </div>
          <span className="max-w-[12rem] font-semibold text-base leading-snug tracking-tight text-foreground">
            Dormitory Management System
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} data-testid={`nav-${item.label.toLowerCase()}`}>
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-card shrink-0 flex items-center justify-between gap-3 px-4 py-3 md:justify-end md:px-6">
          <div className="flex md:hidden items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-base font-bold shadow-sm shrink-0">
              D
            </div>
            <span className="font-semibold text-sm leading-snug text-foreground truncate">
              Dormitory Management System
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AuthActions />
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <DataSourceBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
