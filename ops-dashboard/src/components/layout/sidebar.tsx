"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Server,
  BarChart3,
  FileText,
  Flame,
  Zap,
  Bell,
  GitBranch,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/instances", label: "Instances", icon: Server },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/chaos", label: "Chaos", icon: Flame },
  { href: "/loadtest", label: "Load Test", icon: Zap },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/deployments", label: "Deploys", icon: GitBranch },
  { href: "/scripts", label: "Scripts", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-semibold tracking-tight">
          Ops Dashboard
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">PE Hackathon 2026</p>
      </div>
    </aside>
  );
}
