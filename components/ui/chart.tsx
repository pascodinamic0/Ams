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
  /** Single bar/line key (legacy) */
  yKey?: string;
  /** Multiple bar/line keys for grouped charts */
  yKeys?: string[];
  dataKey?: string;
  nameKey?: string;
  title?: string;
  height?: number;
}

export function Chart({
  data,
  type,
  xKey = "name",
  yKey = "value",
  yKeys,
  dataKey = "value",
  nameKey = "name",
  title,
  height = 300,
}: ChartProps) {
  const barKeys = yKeys ?? [yKey];

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      {type === "bar" && (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {barKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      )}
      {type === "line" && (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {barKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
          ))}
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
