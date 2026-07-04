"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Package, Printer } from "lucide-react";
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
import { useProducts, useCategories, createSale, getCurrentStock, Product } from "@/lib/api";
import { useCurrency } from "@/components/currency-context";

interface CartItem {
  product: Product;
  quantity: number | "";
}

export default function POSPage() {
  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem("pos_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("pos_cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    date: Date;
  } | null>(null);
  const t = useTranslations("POS");
  const locale = useLocale();
  const { formatPrice } = useCurrency();

  const getProductName = (p: Product) => p.name_kh ? `${p.name_en || p.name} - ${p.name_kh}` : (p.name_en || p.name);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        getProductName(product).toLowerCase().includes(search.toLowerCase()) ||
        (product.barcode && product.barcode.includes(search));
      const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
      const hasStock = getCurrentStock(product) > 0;
      return matchesSearch && matchesCategory && hasStock;
    });
  }, [products, search, categoryFilter, locale]);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.product.selling_price?.toString() || "0") * (typeof item.quantity === "number" ? item.quantity : 0), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: (typeof item.quantity === "number" ? item.quantity : 0) + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number | "") => {
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
      const items = cart
        .filter((item) => typeof item.quantity === "number" && item.quantity > 0)
        .map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity as number,
          price: parseFloat(item.product.selling_price?.toString() || "0"),
        }));
      
      await createSale(items, total);
      
      setLastOrder({
        items: [...cart],
        subtotal,
        tax,
        total,
        date: new Date()
      });
      
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

  const handlePrintReceipt = () => {
    if (!lastOrder) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; color: black; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .date { font-size: 12px; color: #666; margin-top: 4px; }
            .items { border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .item-name { font-weight: 500; margin-bottom: 2px; }
            .item-details { color: #666; font-size: 12px; }
            .totals { font-size: 14px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .grand-total { font-size: 18px; font-weight: bold; margin-top: 8px; border-top: 1px dashed #ccc; padding-top: 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Inventory JDM</div>
            <div class="date">${lastOrder.date.toLocaleString()}</div>
          </div>
          <div class="items">
            ${lastOrder.items.map(item => `
              <div class="item">
                <div>
                  <div class="item-name">${getProductName(item.product)}</div>
                  <div class="item-details">${item.quantity} x ${formatPrice(parseFloat(item.product.selling_price?.toString() || "0"))}</div>
                </div>
                <div>${formatPrice(parseFloat(item.product.selling_price?.toString() || "0") * (typeof item.quantity === 'number' ? item.quantity : 0))}</div>
              </div>
            `).join('')}
          </div>
          <div class="totals">
            <div class="total-row">
              <span>${t("subtotal")}</span>
              <span>${formatPrice(lastOrder.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>${t("tax")}</span>
              <span>${formatPrice(lastOrder.tax)}</span>
            </div>
            <div class="total-row grand-total">
              <span>${t("total")}</span>
              <span>${formatPrice(lastOrder.total)}</span>
            </div>
          </div>
          <div class="footer">
            ${t("saleComplete")}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
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
    <div className="flex h-[calc(100vh-3rem)] gap-6">
      {/* Products Section */}
      <div className="flex flex-1 flex-col space-y-4 min-h-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Search & Filter */}
        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl">
                  <SelectValue placeholder={t("allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
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
        <div className="flex-1 p-2 overflow-auto">
          {filteredProducts.length === 0 ? (
            <Card className="rounded-2xl h-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="rounded-full bg-muted p-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">{t("noProducts")}</p>
                <p className="text-xs text-muted-foreground">
                  {search || categoryFilter !== "all"
                    ? t("tryAdjusting")
                    : t("outOfStockMsg")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const currentStock = getCurrentStock(product);
                const inCart = cart.find((item) => item.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    className={`cursor-pointer overflow-hidden rounded-2xl transition-all hover:shadow-md hover:-translate-y-1 ${
                      inCart ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      if (currentStock > (inCart?.quantity || 0)) {
                        addToCart(product);
                      }
                    }}
                  >
                    <CardContent className="p-0 flex flex-col h-full bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={getProductName(product)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {inCart && (
                          <div className="absolute right-3 top-3">
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-sm font-bold text-primary-foreground shadow-lg">
                              {inCart.quantity}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-1 flex-col p-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {getProductName(product)}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            {[product.barcode, product.made_in].filter(Boolean).join(" • ") || product.category_name}
                          </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-end justify-between">
                          <p className="text-xl font-bold text-foreground">
                            {formatPrice(parseFloat(product.selling_price?.toString() || "0"))}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            {t("inStock", { count: currentStock })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-90 flex-shrink-0 rounded-2xl flex flex-col min-h-0 gap-0">
        <div className="border-b px-4 border-border pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <ShoppingCart className="h-5 w-5" />
              {t("cart", { count: cart.length })}
            </CardTitle>
            {cart.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-transparent"
                onClick={clearCart}
              >
                {t("clear")}
              </Button>
            )}
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col p-4 min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-3">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{t("cartEmpty")}</p>
              <p className="text-xs text-muted-foreground">{t("clickToAdd")}</p>
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
                          {getProductName(item.product)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("each", { price: formatPrice(parseFloat(item.product.selling_price?.toString() || "0")) })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentQty = typeof item.quantity === "number" ? item.quantity : 1;
                            if (currentQty <= 1) {
                              removeFromCart(item.product.id);
                            } else {
                              updateCartQuantity(item.product.id, currentQty - 1);
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="h-8 w-8 text-center px-1 text-sm"
                          value={item.quantity}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            if (val === "") {
                              updateCartQuantity(item.product.id, "");
                            } else {
                              const num = parseInt(val);
                              if (!isNaN(num)) {
                                updateCartQuantity(item.product.id, Math.min(num, maxQty));
                              }
                            }
                          }}
                          onBlur={() => {
                            const currentQty = typeof item.quantity === "number" ? item.quantity : 0;
                            if (currentQty <= 0) {
                              updateCartQuantity(item.product.id, 1);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentQty = typeof item.quantity === "number" ? item.quantity : 0;
                            if (currentQty < maxQty) {
                              updateCartQuantity(item.product.id, currentQty + 1);
                            }
                          }}
                          disabled={(typeof item.quantity === "number" ? item.quantity : 0) >= maxQty}
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
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("tax")}</span>
                  <span className="text-foreground">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">{t("total")}</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="mt-4 w-full gap-2 rounded-xl"
                size="lg"
                onClick={() => setShowCheckoutDialog(true)}
              >
                <CreditCard className="h-4 w-4" />
                {t("checkout")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Checkout Confirmation */}
      <AlertDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmCheckout")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("completeSaleFor", { amount: formatPrice(total) })}
              <span className="mt-2 block text-foreground">
                {t("itemsInCart", { count: cart.length })}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={isProcessing}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckout} className="rounded-lg" disabled={isProcessing}>
              {isProcessing && <Spinner className="mr-2 h-4 w-4" />}
              {t("completeSale")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-success">{t("saleComplete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("transactionRecorded")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handlePrintReceipt} className="rounded-lg">
              <Printer className="mr-2 h-4 w-4" />
              {t("printReceipt")}
            </Button>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)} className="rounded-lg">
              {t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
