import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const RecentTips = () => {
  // Mock data for recent tips
  const recentTips = [
    {
      id: 1,
      amount: 50.0,
      currency: "USDT",
      sender: "User345",
      time: "5 minutes ago",
      message: "Great content!",
    },
    {
      id: 2,
      amount: 25.0,
      currency: "USDC",
      sender: "User678",
      time: "1 hour ago",
      message: "Keep up the good work!",
    },
    {
      id: 3,
      amount: 10.0,
      currency: "USDT",
      sender: "User912",
      time: "3 hours ago",
      message: null,
    },
    {
      id: 4,
      amount: 15.0,
      currency: "USDC",
      sender: "User543",
      time: "5 hours ago",
      message: "You're my favorite streamer!",
    },
    {
      id: 5,
      amount: 5.0,
      currency: "USDT",
      sender: "User789",
      time: "1 day ago",
      message: "Thanks for the tips!",
    },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
      <div className="space-y-4">
        {recentTips.map((tip) => (
          <div
            key={tip.id}
            className="flex items-start gap-3 border-b pb-4 last:border-0"
          >
            <div
              className={`h-10 w-10 rounded-full ${
                tip.currency === "USDT" ? "bg-blue-500" : "bg-green-500"
              } flex items-center justify-center text-white`}
            >
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">{tip.sender}</p>
                <p className="text-sm text-muted-foreground">{tip.time}</p>
              </div>
              {tip.message && <p className="text-sm mt-1">{tip.message}</p>}
            </div>
            <div className="text-right">
              <p className="font-medium">${tip.amount.toFixed(2)}</p>
              <p className="text-xs">{tip.currency}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentTips;
