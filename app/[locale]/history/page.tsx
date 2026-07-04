"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useSales, useStockMovements, Sale } from "@/lib/api";
import { useCurrency } from "@/components/currency-context";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";



export default function HistoryPage() {
  const t = useTranslations("History");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const { formatPrice } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const itemsPerPage = 10;

  const fromStr = date?.from ? date.from.toISOString() : undefined;
  const toStr = date?.to ? date.to.toISOString() : undefined;
  
  const daysDiff = date?.from && date?.to 
    ? Math.max(1, Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24)))
    : 7;

  const { sales, isLoading: salesLoading } = useSales(daysDiff, fromStr, toStr);
  const { movements, isLoading: movementsLoading } = useStockMovements(daysDiff, undefined, fromStr, toStr);
  
  const days = daysDiff;

  const isLoading = salesLoading || movementsLoading;

  // Calculate summary stats
  const totalRevenue = useMemo(() => 
    sales.reduce((sum, sale) => sum + parseFloat(sale.total?.toString() || "0"), 0),
    [sales]
  );
  const totalItemsPurchased = useMemo(() =>
    sales.reduce((sum, sale) => sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0),
    [sales]
  );
  const totalTransactions = sales.length;
  const totalStockIn = useMemo(() =>
    movements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0),
    [movements]
  );
  const totalStockOut = useMemo(() =>
    movements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0),
    [movements]
  );

  // Generate chart data
  const chartData = useMemo(() => {
    const dataPoints = Math.min(days, 30);
    const interval = Math.max(1, Math.floor(days / dataPoints));

    return Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - 1 - i) * interval);
      date.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + interval);

      const periodSales = sales.filter((sale) => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= date && saleDate < endDate;
      });

      const periodMovements = movements.filter((m) => {
        const movementDate = new Date(m.created_at);
        return movementDate >= date && movementDate < endDate;
      });

      return {
        date:
          interval > 1
            ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: periodSales.reduce((sum, s) => sum + parseFloat(s.total?.toString() || "0"), 0),
        transactions: periodSales.length,
        stockIn: periodMovements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0),
        stockOut: periodMovements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0),
      };
    });
  }, [days, sales, movements]);

  // Pagination for sales
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination for movements
  const movementPages = Math.ceil(movements.length / itemsPerPage);
  const paginatedMovements = movements.slice(
    (movementPage - 1) * itemsPerPage,
    movementPage * itemsPerPage
  );

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {date?.from ? date.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
              {date?.to ? " - " + date.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("transactions")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">{t("salesCompleted")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stockIn")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStockIn}</div>
            <p className="text-xs text-muted-foreground">{t("unitsReceived")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stockOut")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStockOut}</div>
            <p className="text-xs text-muted-foreground">{t("unitsSold")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">{t("revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => formatPrice(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0 0)",
                      border: "1px solid oklch(0.25 0 0)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                    formatter={(value: number) => [formatPrice(value), t("revenue")]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.2 250)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">{t("stockMovement")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0 0)",
                      border: "1px solid oklch(0.25 0 0)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                  <Legend />
                  <Bar dataKey="stockIn" name={t("stockIn")} fill="oklch(0.65 0.18 145)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stockOut" name={t("stockOut")} fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="sales" className="rounded-lg">{t("salesHistory")}</TabsTrigger>
          <TabsTrigger value="stock" className="rounded-lg">{t("stockMovements")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {sales.length} {sales.length !== 1 ? t("salesCount") : t("saleCount")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">{t("noSales")}</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("date")}</TableHead>
                        <TableHead>{t("products")}</TableHead>
                        <TableHead className="text-center">{t("items")}</TableHead>
                        <TableHead className="text-right">{t("total")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSales.map((sale) => {
                        const productNames = sale.items?.map((p) => {
                          const en = p.product_name || "";
                          const kh = p.product_name_kh || "";
                          const nameStr = [en, kh].filter(Boolean).join(" - ");
                          return `${nameStr} (x${p.quantity})`;
                        }) || [];

                        const displayedProducts = productNames.slice(0, 2).join(", ");
                        const remainingCount = productNames.length - 2;
                        const productDisplayStr = remainingCount > 0
                          ? `${displayedProducts}, +${remainingCount} ${t("more")}`
                          : displayedProducts || "Items";
                        
                        const totalItems = sale.items?.reduce((sum, p) => sum + p.quantity, 0) || 0;

                        return (
                          <TableRow 
                            key={sale.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedSale(sale)}
                          >
                            <TableCell>
                              {new Date(sale.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{productDisplayStr}</TableCell>
                            <TableCell className="text-center">{totalItems}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(parseFloat(sale.total?.toString() || "0"))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("page")} {currentPage} {t("of")} {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="rounded-lg"
                        >
                          {t("previous")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-lg"
                        >
                          {t("next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {movements.length} {movements.length !== 1 ? t("movementsCount") : t("movementCount")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">{t("noMovements")}</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("date")}</TableHead>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead>{t("type")}</TableHead>
                        <TableHead className="text-right">{t("quantity")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{movement.product_name || t("unknown")}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                movement.type === "in"
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {movement.type === "in" ? t("stockIn") : t("stockOut")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {movement.type === "in" ? "+" : "-"}
                            {movement.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {movementPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("page")} {movementPage} {t("of")} {movementPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                          disabled={movementPage === 1}
                          className="rounded-lg"
                        >
                          {t("previous")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovementPage((p) => Math.min(movementPages, p + 1))}
                          disabled={movementPage === movementPages}
                          className="rounded-lg"
                        >
                          {t("next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sale Details Modal */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{t("saleDetails")}</DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground border-b pb-4">
                <p>{new Date(selectedSale.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
                <p className="text-xs mt-1 opacity-70">ID: {selectedSale.id}</p>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-auto pr-2">
                {selectedSale.items?.map((item, index) => {
                  const en = item.product_name || "";
                  const kh = item.product_name_kh || "";
                  const nameStr = [en, kh].filter(Boolean).join(" - ");
                  const itemTotal = item.quantity * item.price;
                  
                  return (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="pr-4">
                        <p className="font-medium text-foreground leading-tight">{index + 1}. {nameStr}</p>
                        <p className="text-muted-foreground mt-0.5">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="font-medium text-foreground whitespace-nowrap">
                        {formatPrice(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t("total")}</span>
                  <span>{formatPrice(parseFloat(selectedSale.total?.toString() || "0"))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
