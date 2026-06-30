"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCurrency } from "./currency-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function CurrencySwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
  const t = useTranslations("Navigation");
  const { currency, exchangeRate, setCurrency, setExchangeRate } = useCurrency();
  const [rateInput, setRateInput] = useState(exchangeRate.toString());
  const [isEditingRate, setIsEditingRate] = useState(false);

  const handleSaveRate = () => {
    const newRate = parseFloat(rateInput);
    if (!isNaN(newRate) && newRate > 0) {
      setExchangeRate(newRate);
    } else {
      setRateInput(exchangeRate.toString()); // Reset to valid
    }
    setIsEditingRate(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("shrink-0 border-sidebar-border hover:bg-sidebar-accent", isCollapsed ? "h-10 w-10" : "h-9 w-9")}>
          <Banknote className="h-4 w-4" />
          <span className="sr-only">Toggle Currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "top"} className="w-56 p-2">
        <DropdownMenuItem onClick={() => setCurrency("USD")} className="flex justify-between cursor-pointer">
          <span>USD ($)</span>
          {currency === "USD" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("KHR")} className="flex justify-between cursor-pointer">
          <span>KHR (៛)</span>
          {currency === "KHR" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2 space-y-2">
          <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("exchangeRate")}</Label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className="h-8 text-sm"
              onFocus={() => setIsEditingRate(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRate();
              }}
            />
            {isEditingRate && (
              <Button size="icon" variant="default" className="h-8 w-8" onClick={handleSaveRate}>
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
