"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  History,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard, isLowStock } from "@/lib/api";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Stock", href: "/stock", icon: Boxes },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
  { name: "History", href: "/history", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data } = useDashboard();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const lowStockCount = data?.summary?.low_stock_count || 0;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Package className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">Inventory</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Low Stock Alert Link */}
        <Link
          href="/low-stock"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/low-stock"
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <AlertTriangle className="h-5 w-5" />
          Low Stock
          {lowStockCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
              {lowStockCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Theme Switcher */}
      <div className="border-t border-sidebar-border p-4">
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Monitor className="h-4 w-4" />}
                <span className="capitalize">{theme} Mode</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" disabled>
            <Sun className="h-4 w-4" />
            <span>Theme</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
