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
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border/50 bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
          <span className="text-[10px] font-bold text-background">PE</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Ops Dashboard
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/50 px-5 py-4">
        <p className="text-[11px] font-medium text-muted-foreground/60">
          PE Hackathon 2026
        </p>
      </div>
    </aside>
  );
}
