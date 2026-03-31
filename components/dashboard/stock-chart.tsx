"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/components/inventory-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function StockChart() {
  const { stockMovements, products } = useInventory();

  // Group stock movements by day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const chartData = last7Days.map((date) => {
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayMovements = stockMovements.filter((movement) => {
      const movementDate = new Date(movement.createdAt);
      return movementDate >= dayStart && movementDate < dayEnd;
    });

    const stockIn = dayMovements
      .filter((m) => m.type === "in")
      .reduce((sum, m) => sum + m.quantity, 0);
    const stockOut = dayMovements
      .filter((m) => m.type === "out")
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      stockIn,
      stockOut,
    };
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">Stock Movement</CardTitle>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0 0)",
                  border: "1px solid oklch(0.25 0 0)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
  );
}
