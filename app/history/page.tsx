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
import { useInventory } from "@/components/inventory-context";
import { formatCurrency } from "@/lib/store";
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

type TimeFilter = "3d" | "7d" | "1m" | "3m" | "6m" | "1y";

const timeFilters: { value: TimeFilter; label: string; days: number }[] = [
  { value: "3d", label: "3 Days", days: 3 },
  { value: "7d", label: "7 Days", days: 7 },
  { value: "1m", label: "1 Month", days: 30 },
  { value: "3m", label: "3 Months", days: 90 },
  { value: "6m", label: "6 Months", days: 180 },
  { value: "1y", label: "1 Year", days: 365 },
];

export default function HistoryPage() {
  const { sales, stockMovements, products } = useInventory();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedFilter = timeFilters.find((f) => f.value === timeFilter)!;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - selectedFilter.days);

  // Filter data by time
  const filteredSales = useMemo(
    () => sales.filter((sale) => new Date(sale.createdAt) >= startDate),
    [sales, startDate]
  );

  const filteredMovements = useMemo(
    () => stockMovements.filter((movement) => new Date(movement.createdAt) >= startDate),
    [stockMovements, startDate]
  );

  // Calculate summary stats
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const totalStockIn = filteredMovements
    .filter((m) => m.type === "in")
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalStockOut = filteredMovements
    .filter((m) => m.type === "out")
    .reduce((sum, m) => sum + m.quantity, 0);

  // Generate chart data based on time filter
  const chartData = useMemo(() => {
    const days = selectedFilter.days;
    const dataPoints = Math.min(days, 30); // Max 30 data points
    const interval = Math.max(1, Math.floor(days / dataPoints));

    return Array.from({ length: dataPoints }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (dataPoints - 1 - i) * interval);
      date.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + interval);

      const periodSales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= date && saleDate < endDate;
      });

      const periodMovements = stockMovements.filter((m) => {
        const movementDate = new Date(m.createdAt);
        return movementDate >= date && movementDate < endDate;
      });

      return {
        date:
          interval > 1
            ? `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: periodSales.reduce((sum, s) => sum + s.total, 0),
        transactions: periodSales.length,
        stockIn: periodMovements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0),
        stockOut: periodMovements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0),
      };
    });
  }, [selectedFilter, sales, stockMovements]);

  // Pagination for sales
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination for movements
  const movementPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const [movementPage, setMovementPage] = useState(1);
  const paginatedMovements = filteredMovements.slice(
    (movementPage - 1) * itemsPerPage,
    movementPage * itemsPerPage
  );

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
                {filteredSales.length} Sale{filteredSales.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSales.length === 0 ? (
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
                        const productNames = sale.products
                          .map((p) => {
                            const product = products.find((prod) => prod.id === p.productId);
                            return product?.name || "Unknown";
                          })
                          .join(", ");
                        const totalItems = sale.products.reduce((sum, p) => sum + p.quantity, 0);

                        return (
                          <TableRow key={sale.id}>
                            <TableCell>
                              {new Date(sale.createdAt).toLocaleDateString("en-US", {
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
                              {formatCurrency(sale.total)}
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
                {filteredMovements.length} Movement{filteredMovements.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMovements.length === 0 ? (
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
                      {paginatedMovements.map((movement) => {
                        const product = products.find((p) => p.id === movement.productId);

                        return (
                          <TableRow key={movement.id}>
                            <TableCell>
                              {new Date(movement.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{product?.name || "Unknown"}</TableCell>
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
                        );
                      })}
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
