"use client";

import { useState, useMemo } from "react";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useSales, useStockMovements, formatCurrency } from "@/lib/api";
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

type TimeFilter = "3" | "7" | "30" | "90" | "180" | "365";

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "3", label: "3 Days" },
  { value: "7", label: "7 Days" },
  { value: "30", label: "1 Month" },
  { value: "90", label: "3 Months" },
  { value: "180", label: "6 Months" },
  { value: "365", label: "1 Year" },
];

export default function HistoryPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7");
  const [currentPage, setCurrentPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const itemsPerPage = 10;

  const days = parseInt(timeFilter);
  const { sales, isLoading: salesLoading } = useSales(days);
  const { movements, isLoading: movementsLoading } = useStockMovements(days);

  const isLoading = salesLoading || movementsLoading;

  // Calculate summary stats
  const totalRevenue = useMemo(() => 
    sales.reduce((sum, sale) => sum + parseFloat(sale.total?.toString() || "0"), 0),
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

  const selectedFilter = timeFilters.find((f) => f.value === timeFilter)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">History & Reports</h1>
          <p className="text-sm text-muted-foreground">View sales and stock movement history</p>
        </div>
        <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
          <SelectTrigger className="w-40 rounded-xl">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Last {selectedFilter.label.toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Sales completed</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock In</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStockIn}</div>
            <p className="text-xs text-muted-foreground">Units received</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStockOut}</div>
            <p className="text-xs text-muted-foreground">Units sold/moved</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0 0)",
                      border: "1px solid oklch(0.25 0 0)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.2 250)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">Stock Movement</CardTitle>
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
                  <Bar dataKey="stockIn" name="Stock In" fill="oklch(0.65 0.18 145)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stockOut" name="Stock Out" fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="sales" className="rounded-lg">Sales History</TabsTrigger>
          <TabsTrigger value="stock" className="rounded-lg">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {sales.length} Sale{sales.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No sales in this period</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSales.map((sale) => {
                        const productNames = sale.items?.map((p) => p.product_name).filter(Boolean).join(", ") || "Items";
                        const totalItems = sale.items?.reduce((sum, p) => sum + p.quantity, 0) || 0;

                        return (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {new Date(sale.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{productNames}</TableCell>
                            <TableCell className="text-center">{totalItems}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(parseFloat(sale.total?.toString() || "0"))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

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
        </TabsContent>

        <TabsContent value="stock">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {movements.length} Movement{movements.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No stock movements in this period</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{movement.product_name || "Unknown"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                movement.type === "in"
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {movement.type === "in" ? "Stock In" : "Stock Out"}
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
                        Page {movementPage} of {movementPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovementPage((p) => Math.max(1, p - 1))}
                          disabled={movementPage === 1}
                          className="rounded-lg"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMovementPage((p) => Math.min(movementPages, p + 1))}
                          disabled={movementPage === movementPages}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
