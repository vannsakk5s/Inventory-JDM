"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StockChart } from "@/components/dashboard/stock-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { useProducts, useSales, useStockMovements, getCurrentStock, isLowStock } from "@/lib/api";
import { useCurrency } from "@/components/currency-context";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { formatPrice } = useCurrency();
  const { products, isLoading: productsLoading } = useProducts();
  const { sales, isLoading: salesLoading } = useSales(7);
  const { movements, isLoading: movementsLoading } = useStockMovements(7);

  const isLoading = productsLoading || salesLoading || movementsLoading;

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(isLowStock);
    const totalStock = products.reduce((sum, p) => sum + getCurrentStock(p), 0);
    const todayRevenue = sales
      .filter((s) => {
        const saleDate = new Date(s.created_at);
        const today = new Date();
        return saleDate.toDateString() === today.toDateString();
      })
      .reduce((sum, s) => sum + parseFloat(s.total?.toString() || "0"), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total?.toString() || "0"), 0);

    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalStock,
      todayRevenue,
      totalRevenue,
    };
  }, [products, sales]);

  // Generate chart data for sales
  const salesChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map((date) => {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= dayStart && saleDate < dayEnd;
      });

      const revenue = daySales.reduce((sum, sale) => sum + parseFloat(sale.total?.toString() || "0"), 0);

      return {
        date: date.toISOString(),
        revenue,
      };
    });
  }, [sales]);

  // Generate chart data for stock movements
  const stockChartData = useMemo(() => {
    return movements.map((m) => ({
      date: m.created_at,
      type: m.type,
      quantity: m.quantity,
    }));
  }, [movements]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalProducts")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{metrics.totalStock} {t("unitsInStock")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("lowStock")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.lowStockCount > 0 ? "text-destructive" : "text-foreground"}`}>
              {metrics.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">{t("needRestocking")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("todaysRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatPrice(metrics.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">{t("fromSalesToday")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("weeklyRevenue")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatPrice(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{t("last7Days")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart salesData={salesChartData} />
        <StockChart stockData={stockChartData} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSales sales={sales} />
        <LowStockAlert products={metrics.lowStockProducts} />
      </div>
    </div>
  );
}
