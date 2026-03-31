"use client";

import { useState } from "react";
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
import { useInventory } from "@/components/inventory-context";
import { formatCurrency, getCurrentStock, isLowStock, Product } from "@/lib/store";

export default function LowStockPage() {
  const { products, categories, addStockMovement } = useInventory();
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("");

  const lowStockProducts = products.filter(isLowStock);

  const handleRestock = () => {
    if (restockingProduct && restockQuantity) {
      const quantity = parseInt(restockQuantity);
      if (quantity > 0) {
        addStockMovement({
          productId: restockingProduct.id,
          type: "in",
          quantity,
        });
        setRestockingProduct(null);
        setRestockQuantity("");
      }
    }
  };

  const getCriticalLevel = (product: Product) => {
    const currentStock = getCurrentStock(product);
    const percentage = (currentStock / product.stockLimit) * 100;
    if (currentStock === 0) return "out";
    if (percentage <= 50) return "critical";
    return "low";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Low Stock Alerts</h1>
          <p className="text-sm text-muted-foreground">Products that need restocking</p>
        </div>
        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} need attention
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {lowStockProducts.filter((p) => getCriticalLevel(p) === "out").length}
            </div>
            <p className="text-xs text-muted-foreground">Products with zero stock</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-warning/20 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {lowStockProducts.filter((p) => getCriticalLevel(p) === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Below 50% of limit</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {lowStockProducts.filter((p) => getCriticalLevel(p) === "low").length}
            </div>
            <p className="text-xs text-muted-foreground">At or below limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-medium">Products Below Stock Limit</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-success/10 p-4">
                <Package className="h-8 w-8 text-success" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">All products are well stocked!</p>
              <p className="text-xs text-muted-foreground">
                No products are currently below their stock limit
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Stock Limit</TableHead>
                  <TableHead className="text-right">Cost to Restock</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts
                  .sort((a, b) => {
                    const levelOrder = { out: 0, critical: 1, low: 2 };
                    return levelOrder[getCriticalLevel(a)] - levelOrder[getCriticalLevel(b)];
                  })
                  .map((product) => {
                    const category = categories.find((c) => c.id === product.categoryId);
                    const currentStock = getCurrentStock(product);
                    const level = getCriticalLevel(product);
                    const unitsNeeded = product.stockLimit - currentStock + 10; // Restock to limit + buffer
                    const restockCost = unitsNeeded * product.costPrice;

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
                            {level === "out" ? "Out of Stock" : level === "critical" ? "Critical" : "Low"}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {category?.name || "-"}
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
                          {product.stockLimit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(restockCost)}
                          <span className="ml-1 text-xs">({unitsNeeded} units)</span>
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
                            Restock
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
              Restock Product
            </DialogTitle>
          </DialogHeader>
          {restockingProduct && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted p-4">
                <p className="font-medium text-foreground">{restockingProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current stock: {getCurrentStock(restockingProduct)} | Limit: {restockingProduct.stockLimit}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Add</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="rounded-xl"
                  placeholder="Enter quantity"
                />
                {restockQuantity && parseInt(restockQuantity) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Cost: {formatCurrency(parseInt(restockQuantity) * restockingProduct.costPrice)}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRestockingProduct(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestock}
                  disabled={!restockQuantity || parseInt(restockQuantity) <= 0}
                  className="gap-2 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  Add Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
