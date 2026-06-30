"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Package, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useProducts, restockProduct, getCurrentStock, Product } from "@/lib/api";
import { useCurrency } from "@/components/currency-context";

export default function LowStockPage() {
  const t = useTranslations("LowStock");
  const { products, isLoading } = useProducts({ lowStock: true });
  const { formatPrice } = useCurrency();
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRestock = async () => {
    if (restockingProduct && restockQuantity) {
      const quantity = parseInt(restockQuantity);
      if (quantity > 0) {
        setIsSubmitting(true);
        try {
          await restockProduct(restockingProduct.id, quantity);
          setRestockingProduct(null);
          setRestockQuantity("");
        } catch (error) {
          console.error("Failed to restock:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const getCriticalLevel = (product: Product) => {
    const currentStock = getCurrentStock(product);
    const percentage = (currentStock / product.stock_limit) * 100;
    if (currentStock === 0) return "out";
    if (percentage <= 50) return "critical";
    return "low";
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const outOfStock = products.filter((p) => getCriticalLevel(p) === "out").length;
  const critical = products.filter((p) => getCriticalLevel(p) === "critical").length;
  const low = products.filter((p) => getCriticalLevel(p) === "low").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {products.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {products.length} {products.length > 1 ? t("productsCount") : t("productCount")} {t("needAttention")}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("outOfStock")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{outOfStock}</div>
            <p className="text-xs text-muted-foreground">{t("zeroStockDesc")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-warning/20 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("critical")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{critical}</div>
            <p className="text-xs text-muted-foreground">{t("criticalDesc")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("lowStock")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{low}</div>
            <p className="text-xs text-muted-foreground">{t("lowStockDesc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-medium">{t("tableTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-success/10 p-4">
                <Package className="h-8 w-8 text-success" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">{t("allWellStocked")}</p>
              <p className="text-xs text-muted-foreground">
                {t("noBelowLimit")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("product")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead className="text-right">{t("currentStock")}</TableHead>
                  <TableHead className="text-right">{t("stockLimit")}</TableHead>
                  <TableHead className="text-right">{t("costToRestock")}</TableHead>
                  <TableHead className="text-right">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .sort((a, b) => {
                    const levelOrder = { out: 0, critical: 1, low: 2 };
                    return levelOrder[getCriticalLevel(a)] - levelOrder[getCriticalLevel(b)];
                  })
                  .map((product) => {
                    const currentStock = getCurrentStock(product);
                    const level = getCriticalLevel(product);
                    const unitsNeeded = product.stock_limit - currentStock + 10;
                    const restockCost = unitsNeeded * parseFloat(product.cost_price?.toString() || "0");

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                              level === "out"
                                ? "bg-destructive/10 text-destructive"
                                : level === "critical"
                                ? "bg-warning/10 text-warning"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                level === "out"
                                  ? "bg-destructive"
                                  : level === "critical"
                                  ? "bg-warning"
                                  : "bg-primary"
                              }`}
                            />
                            {level === "out" ? t("outOfStock") : level === "critical" ? t("critical") : t("low")}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.category_name || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              level === "out"
                                ? "text-destructive"
                                : level === "critical"
                                ? "text-warning"
                                : "text-foreground"
                            }`}
                          >
                            {currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.stock_limit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatPrice(restockCost)}
                          <span className="ml-1 text-xs">({unitsNeeded} {t("units")})</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-lg"
                            onClick={() => {
                              setRestockingProduct(product);
                              setRestockQuantity(unitsNeeded.toString());
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            {t("restock")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={!!restockingProduct} onOpenChange={(open) => !open && setRestockingProduct(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              {t("restockProduct")}
            </DialogTitle>
          </DialogHeader>
          {restockingProduct && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted p-4">
                <p className="font-medium text-foreground">{restockingProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t("currentStockLabel")} {getCurrentStock(restockingProduct)} | {t("limitLabel")} {restockingProduct.stock_limit}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">{t("quantityToAdd")}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="rounded-xl"
                  placeholder={t("enterQuantity")}
                />
                {restockQuantity && parseInt(restockQuantity) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("costLabel")} {formatPrice(parseInt(restockQuantity) * parseFloat(restockingProduct.cost_price?.toString() || "0"))}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRestockingProduct(null)}
                  className="rounded-xl"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleRestock}
                  disabled={!restockQuantity || parseInt(restockQuantity) <= 0 || isSubmitting}
                  className="gap-2 rounded-xl"
                >
                  {isSubmitting && <Spinner className="h-4 w-4" />}
                  <Plus className="h-4 w-4" />
                  {t("addStock")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
