"use client";

import type { PricePoint } from "@stocksage/contracts";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PriceChart({ prices }: { prices: PricePoint[] }) {
  return (
    <div className="mini-chart" aria-label="Ninety day closing price chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={prices} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(159, 176, 199, 0.12)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#9fb0c7", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: "#9fb0c7", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip
            contentStyle={{
              background: "#101b2c",
              border: "1px solid #26364f",
              borderRadius: 8,
              color: "#eef5ff"
            }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#31d0aa"
            fill="rgba(49, 208, 170, 0.18)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

