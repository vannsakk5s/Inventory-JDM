"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventory } from "@/components/inventory-context";
import { Product } from "@/lib/store";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { categories, addProduct, updateProduct } = useInventory();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || "",
    categoryId: product?.categoryId || "",
    barcode: product?.barcode || "",
    madeIn: product?.madeIn || "",
    costPrice: product?.costPrice?.toString() || "",
    sellingPrice: product?.sellingPrice?.toString() || "",
    stockIn: product?.stockIn?.toString() || "0",
    stockOut: product?.stockOut?.toString() || "0",
    stockLimit: product?.stockLimit?.toString() || "10",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.barcode.trim()) newErrors.barcode = "Barcode is required";
    if (!formData.madeIn.trim()) newErrors.madeIn = "Country is required";
    if (!formData.costPrice || parseFloat(formData.costPrice) < 0)
      newErrors.costPrice = "Valid cost price is required";
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) < 0)
      newErrors.sellingPrice = "Valid selling price is required";
    if (!formData.stockLimit || parseInt(formData.stockLimit) < 0)
      newErrors.stockLimit = "Valid stock limit is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const productData = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      barcode: formData.barcode.trim(),
      madeIn: formData.madeIn.trim(),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      stockIn: parseInt(formData.stockIn) || 0,
      stockOut: parseInt(formData.stockOut) || 0,
      stockLimit: parseInt(formData.stockLimit) || 10,
    };

    if (isEditing) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-xl"
            placeholder="Enter product name"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger id="category" className="rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="rounded-xl"
            placeholder="Enter barcode"
          />
          {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="madeIn">Made In</Label>
          <Input
            id="madeIn"
            value={formData.madeIn}
            onChange={(e) => setFormData({ ...formData, madeIn: e.target.value })}
            className="rounded-xl"
            placeholder="Country of origin"
          />
          {errors.madeIn && <p className="text-xs text-destructive">{errors.madeIn}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price ($)</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            className="rounded-xl"
            placeholder="0.00"
          />
          {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price ($)</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            className="rounded-xl"
            placeholder="0.00"
          />
          {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice}</p>}
        </div>

        {!isEditing && (
          <>
            <div className="space-y-2">
              <Label htmlFor="stockIn">Initial Stock</Label>
              <Input
                id="stockIn"
                type="number"
                min="0"
                value={formData.stockIn}
                onChange={(e) => setFormData({ ...formData, stockIn: e.target.value })}
                className="rounded-xl"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockLimit">Stock Limit (Alert)</Label>
              <Input
                id="stockLimit"
                type="number"
                min="0"
                value={formData.stockLimit}
                onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value })}
                className="rounded-xl"
                placeholder="10"
              />
              {errors.stockLimit && <p className="text-xs text-destructive">{errors.stockLimit}</p>}
            </div>
          </>
        )}

        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="stockLimit">Stock Limit (Alert)</Label>
            <Input
              id="stockLimit"
              type="number"
              min="0"
              value={formData.stockLimit}
              onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value })}
              className="rounded-xl"
              placeholder="10"
            />
            {errors.stockLimit && <p className="text-xs text-destructive">{errors.stockLimit}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="rounded-xl">
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
