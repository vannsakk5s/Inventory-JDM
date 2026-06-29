"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface StockChartProps {
  stockData: { date: string; type: string; quantity: number }[];
}

export function StockChart({ stockData }: StockChartProps) {
  const t = useTranslations("Dashboard");

  // Initialize with the last 7 days chronologically
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  const chartData: { date: string; stockIn: number; stockOut: number }[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    chartData.push({ date: days[dayIndex], stockIn: 0, stockOut: 0 });
  }

  const chartDataMap = Object.fromEntries(chartData.map(item => [item.date, item]));

  stockData.forEach((item) => {
    const dateStr = new Date(item.date).toLocaleDateString("en-US", { weekday: "short" });
    if (chartDataMap[dateStr]) {
      if (item.type === "in") {
        chartDataMap[dateStr].stockIn += parseInt(item.quantity?.toString() || "0");
      } else {
        chartDataMap[dateStr].stockOut += parseInt(item.quantity?.toString() || "0");
      }
    }
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base font-medium">{t("stockMovement")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("last7Days")}</p>
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
              <Bar dataKey="stockIn" name={t("stockIn")} fill="oklch(0.65 0.18 145)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stockOut" name={t("stockOut")} fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
