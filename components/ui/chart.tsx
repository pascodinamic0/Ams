"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ChartProps {
  data: Record<string, unknown>[];
  type: "bar" | "line" | "pie";
  xKey?: string;
  yKey?: string;
  dataKey?: string;
  nameKey?: string;
  title?: string;
}

export function Chart({
  data,
  type,
  xKey = "name",
  yKey = "value",
  dataKey = "value",
  nameKey = "name",
  title,
}: ChartProps) {
  const chart = (
    <ResponsiveContainer width="100%" height={300}>
      {type === "bar" && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill={COLORS[0]} />
        </BarChart>
      )}
      {type === "line" && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} />
        </LineChart>
      )}
      {type === "pie" && (
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      {title && (
        <h3 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      )}
      {chart}
    </div>
  );
}
