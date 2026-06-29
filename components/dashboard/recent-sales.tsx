"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, Sale } from "@/lib/api";

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  const t = useTranslations("Dashboard");

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">{t("recentSales")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("latestTransactions")}</p>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="gap-1">
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{t("noRecentSales")}</p>
            <p className="text-xs text-muted-foreground">{t("salesWillAppear")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => {
              const itemCount = sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
              const productNames = sale.items?.map((item) => {
                const en = item.product_name || "";
                const kh = item.product_name_kh || "";
                const nameStr = [en, kh].filter(Boolean).join(" - ");
                return `${nameStr} (x${item.quantity})`;
              }).join(", ") || "Items";

              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{productNames}</p>
                    <p className="text-xs text-muted-foreground">
                      {itemCount} item{itemCount > 1 ? "s" : ""} •{" "}
                      {new Date(sale.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(parseFloat(sale.total?.toString() || "0"))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
