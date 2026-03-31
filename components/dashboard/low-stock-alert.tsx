"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/components/inventory-context";
import { getCurrentStock, isLowStock } from "@/lib/store";

export function LowStockAlert() {
  const { products, categories } = useInventory();

  const lowStockProducts = products.filter(isLowStock).slice(0, 5);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium">Low Stock Alerts</CardTitle>
          <p className="text-sm text-muted-foreground">Products below stock limit</p>
        </div>
        {lowStockProducts.length > 0 && (
          <Link href="/low-stock">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-success/10 p-3">
                <AlertTriangle className="h-6 w-6 text-success" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">All stocked up!</p>
              <p className="text-xs text-muted-foreground">No products are below stock limit</p>
            </div>
          ) : (
            lowStockProducts.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId);
              const currentStock = getCurrentStock(product);

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{category?.name || "Uncategorized"}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-destructive">{currentStock} left</p>
                    <p className="text-xs text-muted-foreground">Limit: {product.stockLimit}</p>
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
