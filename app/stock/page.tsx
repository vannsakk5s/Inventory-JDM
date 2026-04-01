"use client";

import { useState } from "react";
import { Search, Package, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useProducts, useCategories, restockProduct, adjustStock, getCurrentStock, isLowStock, Product } from "@/lib/api";

export default function StockManagementPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out">("in");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { products, isLoading } = useProducts();
  const { categories } = useCategories();

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.barcode && product.barcode.includes(search));
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalStock = products.reduce((sum, p) => sum + getCurrentStock(p), 0);
  const lowStockCount = products.filter(isLowStock).length;
  const totalValue = products.reduce(
    (sum, p) => sum + getCurrentStock(p) * parseFloat(p.cost_price?.toString() || "0"),
    0
  );

  const handleAdjustment = async () => {
    if (adjustingProduct && adjustmentQuantity) {
      const quantity = parseInt(adjustmentQuantity);
      if (quantity > 0) {
        setIsSubmitting(true);
        try {
          if (adjustmentType === "in") {
            await restockProduct(adjustingProduct.id, quantity, adjustmentReason);
          } else {
            await adjustStock(adjustingProduct.id, quantity, adjustmentReason);
          }
          setAdjustingProduct(null);
          setAdjustmentQuantity("");
          setAdjustmentReason("");
        } catch (error) {
          console.error("Failed to adjust stock:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

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
        <h1 className="text-2xl font-semibold text-foreground">Stock Management</h1>
        <p className="text-sm text-muted-foreground">Track and manage your inventory levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Units in inventory</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">At cost price</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or barcode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">No products found</p>
              <p className="text-xs text-muted-foreground">
                {search || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add products to manage their stock"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock In</TableHead>
                    <TableHead className="text-right">Stock Out</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Limit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => {
                    const currentStock = getCurrentStock(product);
                    const lowStock = isLowStock(product);

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.category_name || "-"}
                        </TableCell>
                        <TableCell className="text-right text-success">{product.stock_in}</TableCell>
                        <TableCell className="text-right text-warning">{product.stock_out}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              lowStock
                                ? "bg-destructive/10 text-destructive"
                                : "bg-success/10 text-success"
                            }`}
                          >
                            {currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.stock_limit}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 rounded-lg"
                              onClick={() => {
                                setAdjustingProduct(product);
                                setAdjustmentType("in");
                              }}
                            >
                              <Plus className="h-3 w-3" />
                              In
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 rounded-lg"
                              onClick={() => {
                                setAdjustingProduct(product);
                                setAdjustmentType("out");
                              }}
                              disabled={currentStock === 0}
                            >
                              <Minus className="h-3 w-3" />
                              Out
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={!!adjustingProduct} onOpenChange={(open) => !open && setAdjustingProduct(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {adjustmentType === "in" ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-warning" />
              )}
              {adjustmentType === "in" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
          </DialogHeader>
          {adjustingProduct && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted p-4">
                <p className="font-medium text-foreground">{adjustingProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current stock: {getCurrentStock(adjustingProduct)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={adjustmentType === "out" ? getCurrentStock(adjustingProduct) : undefined}
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  className="rounded-xl"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="rounded-xl"
                  placeholder="e.g., New shipment, Damage, Adjustment"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAdjustingProduct(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdjustment}
                  disabled={!adjustmentQuantity || parseInt(adjustmentQuantity) <= 0 || isSubmitting}
                  className={`gap-2 rounded-xl ${
                    adjustmentType === "in" ? "" : "bg-warning text-warning-foreground hover:bg-warning/90"
                  }`}
                >
                  {isSubmitting && <Spinner className="h-4 w-4" />}
                  {adjustmentType === "in" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  {adjustmentType === "in" ? "Add Stock" : "Remove Stock"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
