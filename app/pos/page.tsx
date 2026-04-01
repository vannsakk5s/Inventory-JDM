"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useProducts, useCategories, createSale, formatCurrency, getCurrentStock, Product } from "@/lib/api";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.barcode && product.barcode.includes(search));
      const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
      const hasStock = getCurrentStock(product) > 0;
      return matchesSearch && matchesCategory && hasStock;
    });
  }, [products, search, categoryFilter]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.product.selling_price?.toString() || "0") * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: parseFloat(item.product.selling_price?.toString() || "0"),
      }));
      
      await createSale(items, total);
      setCart([]);
      setShowCheckoutDialog(false);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getMaxQuantity = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;
    return getCurrentStock(product);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-6">
      {/* Products Section */}
      <div className="flex flex-1 flex-col space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Point of Sale</h1>
          <p className="text-sm text-muted-foreground">Select products to add to cart</p>
        </div>

        {/* Search & Filter */}
        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products or scan barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          {filteredProducts.length === 0 ? (
            <Card className="rounded-2xl h-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="rounded-full bg-muted p-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">No products available</p>
                <p className="text-xs text-muted-foreground">
                  {search || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "All products are out of stock"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const currentStock = getCurrentStock(product);
                const inCart = cart.find((item) => item.product.id === product.id);

                return (
                  <Card
                    key={product.id}
                    className={`cursor-pointer rounded-2xl transition-all hover:shadow-md ${
                      inCart ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      if (currentStock > (inCart?.quantity || 0)) {
                        addToCart(product);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{product.category_name}</p>
                        </div>
                        {inCart && (
                          <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                            {inCart.quantity}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(parseFloat(product.selling_price?.toString() || "0"))}
                        </p>
                        <p className="text-xs text-muted-foreground">{currentStock} in stock</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-80 flex-shrink-0 rounded-2xl flex flex-col">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </CardTitle>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-4">
          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">Cart is empty</p>
              <p className="text-xs text-muted-foreground">Click on products to add them</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 space-y-3 overflow-auto">
                {cart.map((item) => {
                  const maxQty = getMaxQuantity(item.product.id);
                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(parseFloat(item.product.selling_price?.toString() || "0"))} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.product.id, item.quantity - 1);
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.quantity < maxQty) {
                              updateCartQuantity(item.product.id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= maxQty}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.product.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="text-foreground">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="mt-4 w-full gap-2 rounded-xl"
                size="lg"
                onClick={() => setShowCheckoutDialog(true)}
              >
                <CreditCard className="h-4 w-4" />
                Checkout
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Checkout Confirmation */}
      <AlertDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Checkout</AlertDialogTitle>
            <AlertDialogDescription>
              Complete this sale for {formatCurrency(total)}?
              <span className="mt-2 block text-foreground">
                {cart.length} item{cart.length > 1 ? "s" : ""} in cart
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckout} className="rounded-lg" disabled={isProcessing}>
              {isProcessing && <Spinner className="mr-2 h-4 w-4" />}
              Complete Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-success">Sale Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              The transaction has been recorded successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)} className="rounded-lg">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
