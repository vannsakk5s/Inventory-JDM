"use client";

import { Package, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/components/inventory-context";
import { formatCurrency, getCurrentStock, isLowStock } from "@/lib/store";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StockChart } from "@/components/dashboard/stock-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";

export default function DashboardPage() {
  const { products, sales, stockMovements } = useInventory();

  // Calculate summary stats
  const totalProducts = products.length;
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalStockIn = stockMovements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0);
  const totalStockOut = stockMovements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0);
  const lowStockProducts = products.filter(isLowStock);
  const totalInventoryValue = products.reduce((sum, p) => sum + getCurrentStock(p) * p.costPrice, 0);

  const summaryCards = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      description: `${lowStockProducts.length} low stock`,
      icon: Package,
      trend: null,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: `From ${totalSales} sales`,
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "Stock In",
      value: totalStockIn.toString(),
      description: "Units received",
      icon: TrendingUp,
      trend: "up" as const,
    },
    {
      title: "Stock Out",
      value: totalStockOut.toString(),
      description: "Units sold/moved",
      icon: TrendingDown,
      trend: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your inventory and sales</p>
        </div>
        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} low on stock
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Value Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(totalInventoryValue)}</div>
          <p className="text-sm text-muted-foreground">Based on cost price of current stock</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <StockChart />
      </div>

      {/* Recent Sales & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSales />
        <LowStockAlert />
      </div>
    </div>
  );
}
