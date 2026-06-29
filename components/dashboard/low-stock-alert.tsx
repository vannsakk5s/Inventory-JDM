"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, getCurrentStock } from "@/lib/api";

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const t = useTranslations("Dashboard");

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">{t("lowStockAlerts")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("productsBelowLimit")}</p>
        </div>
        {products.length > 0 && (
          <Link href="/low-stock">
            <Button variant="ghost" size="sm" className="gap-1">
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-success/10 p-3">
                <Package className="h-6 w-6 text-success" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{t("allStockedUp")}</p>
              <p className="text-xs text-muted-foreground">{t("noProductsBelowLimit")}</p>
            </div>
          ) : (
            products.slice(0, 5).map((product) => {
              const currentStock = getCurrentStock(product);

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{product.name_en || product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category_name || t("uncategorized")}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-destructive">{currentStock} {t("left")}</p>
                    <p className="text-xs text-muted-foreground">{t("limit")}: {product.stock_limit}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
