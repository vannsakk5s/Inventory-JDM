"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/components/inventory-context";
import { formatCurrency } from "@/lib/store";

export function RecentSales() {
  const { sales, products } = useInventory();

  // Get last 5 sales
  const recentSales = sales.slice(0, 5);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Sales</CardTitle>
        <p className="text-sm text-muted-foreground">Latest transactions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No sales yet</p>
          ) : (
            recentSales.map((sale) => {
              const productNames = sale.products
                .map((p) => {
                  const product = products.find((prod) => prod.id === p.productId);
                  return product?.name || "Unknown";
                })
                .join(", ");

              const totalItems = sale.products.reduce((sum, p) => sum + p.quantity, 0);

              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{productNames}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalItems} item{totalItems > 1 ? "s" : ""} •{" "}
                      {new Date(sale.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(sale.total)}</p>
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
