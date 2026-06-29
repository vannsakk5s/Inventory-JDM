"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Products");
  const { categories } = useCategories();
  const isEditing = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name_en: product?.name_en || product?.name || "",
    name_kh: product?.name_kh || "",
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
    if (!formData.name_en.trim() && !formData.name_kh.trim()) newErrors.name_en = "At least one name is required";
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
        name_en: formData.name_en.trim(),
        name_kh: formData.name_kh.trim(),
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (error) {
      console.error("Failed to upload image:", error);
      // You could set an error state here if desired
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name_en">{t("nameEnglish")}</Label>
          <Input
            id="name_en"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            className="rounded-xl"
            placeholder={t("enterEnglishName")}
          />
          {errors.name_en && <p className="text-xs text-destructive">{errors.name_en}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_kh">{t("nameKhmer")}</Label>
          <Input
            id="name_kh"
            value={formData.name_kh}
            onChange={(e) => setFormData({ ...formData, name_kh: e.target.value })}
            className="rounded-xl"
            placeholder={t("enterKhmerName")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t("category")}</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger id="category" className="rounded-xl">
              <SelectValue placeholder={t("selectCategory")} />
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
          <Label htmlFor="barcode">{t("barcode")}</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="rounded-xl"
            placeholder={t("enterBarcode")}
          />
          {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="made_in">{t("madeIn")}</Label>
          <Input
            id="made_in"
            value={formData.made_in}
            onChange={(e) => setFormData({ ...formData, made_in: e.target.value })}
            className="rounded-xl"
            placeholder={t("countryOfOrigin")}
          />
          {errors.made_in && <p className="text-xs text-destructive">{errors.made_in}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">{t("costPrice")}</Label>
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
          <Label htmlFor="selling_price">{t("sellingPrice")}</Label>
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
            <Label htmlFor="stock_in">{t("initialStock")}</Label>
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
          <Label htmlFor="stock_limit">{t("stockLimit")}</Label>
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
        <Label htmlFor="image_url">{t("productImage")}</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image_url"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="rounded-xl flex-1 cursor-pointer"
            disabled={isUploadingImage}
          />
          {isUploadingImage && <Spinner className="h-5 w-5" />}
        </div>
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
          {isEditing ? t("saveChanges") : t("addProduct")}
        </Button>
      </div>
    </form>
  );
}
