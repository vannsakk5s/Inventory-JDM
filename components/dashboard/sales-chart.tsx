"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  salesData: { date: string; revenue: number }[];
}

export function SalesChart({ salesData }: SalesChartProps) {
  // Transform data for chart
  const chartData = salesData.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    revenue: parseFloat(item.revenue?.toString() || "0"),
  }));

  // If no data, show placeholder for last 7 days
  if (chartData.length === 0) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      chartData.push({ date: days[dayIndex], revenue: 0 });
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">Sales Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.2 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0 0)",
                  border: "1px solid oklch(0.25 0 0)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "oklch(0.95 0 0)" }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.65 0.2 250)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
