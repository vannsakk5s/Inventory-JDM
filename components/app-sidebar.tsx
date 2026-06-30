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
  PanelLeftClose,
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
import { CurrencySwitcher } from "@/components/currency-switcher";

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <aside className={cn(
      "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", isCollapsed ? "justify-center" : "justify-between px-6")}>
        {isCollapsed ? (
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="h-10 w-10 shrink-0">
            <img src="/icon_.png" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <img src="/icon_.png" alt="Logo" className="h-8 w-8 rounded-lg object-cover shrink-0" />
              <span className="text-lg font-semibold text-sidebar-foreground truncate">Inventory</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </>
        )}
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
                "flex items-center rounded-xl transition-colors",
                isCollapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              title={isCollapsed ? t(item.nameKey as any) : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium truncate">{t(item.nameKey as any)}</span>}
            </Link>
          );
        })}

        {/* Low Stock Alert Link */}
        <Link
          href="/low-stock"
          className={cn(
            "flex items-center rounded-xl transition-colors",
            isCollapsed ? "justify-center h-10 w-10 mx-auto mt-1 relative" : "gap-3 px-3 py-2.5 mt-1",
            pathname.startsWith("/low-stock")
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
          title={isCollapsed ? t("LowStock") : undefined}
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium truncate">{t("LowStock")}</span>}
          {lowStockCount > 0 && (
            isCollapsed ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {lowStockCount > 9 ? "9+" : lowStockCount}
              </span>
            ) : (
              <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                {lowStockCount}
              </span>
            )
          )}
        </Link>
      </nav>

      {/* Theme Switcher and Language */}
      <div className={cn("mt-auto border-t border-sidebar-border p-4 flex", isCollapsed ? "flex-col items-center gap-4" : "items-center gap-2")} suppressHydrationWarning>
        <div className={cn(isCollapsed ? "" : "flex-1")}>
          <LanguageSwitcher isCollapsed={isCollapsed} />
        </div>
        
        {mounted && (
          <>
            <CurrencySwitcher isCollapsed={isCollapsed} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 border-sidebar-border hover:bg-sidebar-accent">
                  {theme === "light" && <Sun className="h-4 w-4" />}
                  {theme === "dark" && <Moon className="h-4 w-4" />}
                  {theme === "system" && <Monitor className="h-4 w-4" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "top"} className="w-40">
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
          </>
        )}
        {!mounted && (
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-muted" />
        )}
      </div>
    </aside>
  );
}
