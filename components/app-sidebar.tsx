"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
import { LanguageSwitcher } from "@/components/language-switcher";

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Navigation");

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const lowStockCount = data?.summary?.low_stock_count || 0;

  const navigation = [
    { nameKey: "Dashboard", href: "/", icon: LayoutDashboard },
    { nameKey: "Products", href: "/products", icon: Package },
    { nameKey: "Categories", href: "/categories", icon: Tags },
    { nameKey: "Stock", href: "/stock", icon: Boxes },
    { nameKey: "PointOfSale", href: "/pos", icon: ShoppingCart },
    { nameKey: "History", href: "/history", icon: History },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <img src="/icon_.png" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
        <span className="text-lg font-semibold text-sidebar-foreground">Inventory</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          // next-intl usePathname strips the locale prefix, so we can do exact matches safely
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.nameKey}
              href={item.href as any}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.nameKey as any)}
            </Link>
          );
        })}

        {/* Low Stock Alert Link */}
        <Link
          href="/low-stock"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/low-stock")
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <AlertTriangle className="h-5 w-5" />
          {t("LowStock")}
          {lowStockCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
              {lowStockCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Theme Switcher and Language */}
      <div className="mt-auto border-t border-sidebar-border p-4 flex items-center gap-2" suppressHydrationWarning>
        <div className="flex-1">
          <LanguageSwitcher />
        </div>
        
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 h-9 w-9">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Monitor className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
        )}
        {!mounted && (
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-muted" />
        )}
      </div>
    </aside>
  );
}
