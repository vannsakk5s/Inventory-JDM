"use client";

import * as React from "react";
import {
  Category,
  Product,
  Sale,
  StockMovement,
  initialCategories,
  initialProducts,
  initialSales,
  initialStockMovements,
  generateId,
} from "@/lib/store";

interface CartItem {
  product: Product;
  quantity: number;
}

interface InventoryContextType {
  categories: Category[];
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  cart: CartItem[];
  // Category actions
  addCategory: (category: Omit<Category, "id" | "createdAt">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Product actions
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Cart actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => void;
  // Stock actions
  addStockMovement: (movement: Omit<StockMovement, "id" | "createdAt">) => void;
}

const InventoryContext = React.createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [sales, setSales] = React.useState<Sale[]>(initialSales);
  const [stockMovements, setStockMovements] = React.useState<StockMovement[]>(initialStockMovements);
  const [cart, setCart] = React.useState<CartItem[]>([]);

  // Category actions
  const addCategory = (category: Omit<Category, "id" | "createdAt">) => {
    setCategories((prev) => [...prev, { ...category, id: `cat-${generateId()}`, createdAt: new Date() }]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...category } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Product actions
  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    setProducts((prev) => [...prev, { ...product, id: `prod-${generateId()}`, createdAt: new Date() }]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Cart actions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const checkout = () => {
    if (cart.length === 0) return;

    const saleProducts = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.sellingPrice,
    }));

    const total = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

    const newSale: Sale = {
      id: `sale-${generateId()}`,
      products: saleProducts,
      total,
      createdAt: new Date(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Update stock
    cart.forEach((item) => {
      updateProduct(item.product.id, { stockOut: item.product.stockOut + item.quantity });
      setStockMovements((prev) => [
        {
          id: `mov-${generateId()}`,
          productId: item.product.id,
          type: "out",
          quantity: item.quantity,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    });

    clearCart();
  };

  // Stock actions
  const addStockMovement = (movement: Omit<StockMovement, "id" | "createdAt">) => {
    const newMovement: StockMovement = {
      ...movement,
      id: `mov-${generateId()}`,
      createdAt: new Date(),
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    // Update product stock
    const product = products.find((p) => p.id === movement.productId);
    if (product) {
      if (movement.type === "in") {
        updateProduct(movement.productId, { stockIn: product.stockIn + movement.quantity });
      } else {
        updateProduct(movement.productId, { stockOut: product.stockOut + movement.quantity });
      }
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        categories,
        products,
        sales,
        stockMovements,
        cart,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
        addStockMovement,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = React.useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
