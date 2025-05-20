import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  Legend,
} from "recharts";

interface DonationChartProps {
  period: "day" | "week" | "month" | "year";
}

const DonationChart = ({ period }: DonationChartProps) => {
  // Generate mock data based on the selected period
  const generateMockData = () => {
    const data = [];

    if (period === "day") {
      // Hourly data for a day
      for (let i = 0; i < 24; i++) {
        data.push({
          name: `${i}:00`,
          usdt: Math.floor(Math.random() * 50),
          usdc: Math.floor(Math.random() * 40),
          total: Math.floor(Math.random() * 70),
        });
      }
    } else if (period === "week") {
      // Daily data for a week
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      days.forEach((day) => {
        data.push({
          name: day,
          usdt: Math.floor(Math.random() * 200),
          usdc: Math.floor(Math.random() * 150),
          total: Math.floor(Math.random() * 300),
        });
      });
    } else if (period === "month") {
      // Weekly data for a month
      for (let i = 1; i <= 4; i++) {
        data.push({
          name: `Week ${i}`,
          usdt: Math.floor(Math.random() * 500),
          usdc: Math.floor(Math.random() * 400),
          total: Math.floor(Math.random() * 800),
        });
      }
    } else if (period === "year") {
      // Monthly data for a year
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      months.forEach((month) => {
        data.push({
          name: month,
          usdt: Math.floor(Math.random() * 2000),
          usdc: Math.floor(Math.random() * 1500),
          total: Math.floor(Math.random() * 3000),
        });
      });
    }

    return data;
  };

  const data = generateMockData();

  // Chart configuration
  const config = {
    usdt: {
      label: "USDT",
      color: "#2775CA",
    },
    usdc: {
      label: "USDC",
      color: "#26A17B",
    },
    total: {
      label: "Total",
      color: "#9b87f5",
    },
  };

  return (
    <ChartContainer config={config} className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value: any) => `$${value}`} width={65} />
          <Tooltip
            content={(props: any) => {
              if (props.active && props.payload && props.payload.length) {
                return (
                  <ChartTooltipContent
                    className="border shadow-lg"
                    payload={props.payload}
                    active={props.active}
                    label={props.label}
                  />
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="usdt" fill="#2775CA" name="USDT" />
          <Bar dataKey="usdc" fill="#26A17B" name="USDC" />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#9b87f5"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Total"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DonationChart;
