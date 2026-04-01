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
import { Spinner } from "@/components/ui/spinner";
import { useCategories, createProduct, updateProduct, Product } from "@/lib/api";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { categories } = useCategories();
  const isEditing = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category_id: product?.category_id || "",
    barcode: product?.barcode || "",
    made_in: product?.made_in || "",
    cost_price: product?.cost_price?.toString() || "",
    selling_price: product?.selling_price?.toString() || "",
    stock_in: product?.stock_in?.toString() || "0",
    stock_limit: product?.stock_limit?.toString() || "10",
    image_url: product?.image_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.barcode.trim()) newErrors.barcode = "Barcode is required";
    if (!formData.made_in.trim()) newErrors.made_in = "Country is required";
    if (!formData.cost_price || parseFloat(formData.cost_price) < 0)
      newErrors.cost_price = "Valid cost price is required";
    if (!formData.selling_price || parseFloat(formData.selling_price) < 0)
      newErrors.selling_price = "Valid selling price is required";
    if (!formData.stock_limit || parseInt(formData.stock_limit) < 0)
      newErrors.stock_limit = "Valid stock limit is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        barcode: formData.barcode.trim(),
        made_in: formData.made_in.trim(),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        stock_in: parseInt(formData.stock_in) || 0,
        stock_limit: parseInt(formData.stock_limit) || 10,
        image_url: formData.image_url.trim() || null,
      };

      if (isEditing) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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
          {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
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
          <Label htmlFor="made_in">Made In</Label>
          <Input
            id="made_in"
            value={formData.made_in}
            onChange={(e) => setFormData({ ...formData, made_in: e.target.value })}
            className="rounded-xl"
            placeholder="Country of origin"
          />
          {errors.made_in && <p className="text-xs text-destructive">{errors.made_in}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">Cost Price ($)</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            className="rounded-xl"
            placeholder="0.00"
          />
          {errors.cost_price && <p className="text-xs text-destructive">{errors.cost_price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="selling_price">Selling Price ($)</Label>
          <Input
            id="selling_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
            className="rounded-xl"
            placeholder="0.00"
          />
          {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price}</p>}
        </div>

        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="stock_in">Initial Stock</Label>
            <Input
              id="stock_in"
              type="number"
              min="0"
              value={formData.stock_in}
              onChange={(e) => setFormData({ ...formData, stock_in: e.target.value })}
              className="rounded-xl"
              placeholder="0"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="stock_limit">Stock Limit (Alert)</Label>
          <Input
            id="stock_limit"
            type="number"
            min="0"
            value={formData.stock_limit}
            onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
            className="rounded-xl"
            placeholder="10"
          />
          {errors.stock_limit && <p className="text-xs text-destructive">{errors.stock_limit}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Product Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="rounded-xl"
          placeholder="https://example.com/image.jpg"
        />
        {formData.image_url && (
          <div className="mt-2">
            <img
              src={formData.image_url}
              alt="Product preview"
              className="h-20 w-20 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="rounded-xl" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
