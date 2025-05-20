import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";

const TipStats = () => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent py-2 px-4">
        <span className="text-white text-sm font-medium">
          Total Tips Received
        </span>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">$1,245.32</p>
              <div className="flex items-center text-xs text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12% from last month</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-right text-xs text-muted-foreground">
              <div>
                USDT:{" "}
                <span className="text-foreground font-medium">$850.25</span>
              </div>
              <div>
                USDC:{" "}
                <span className="text-foreground font-medium">$395.07</span>
              </div>
              <div>
                Others:{" "}
                <span className="text-foreground font-medium">$0.00</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TipStats;
