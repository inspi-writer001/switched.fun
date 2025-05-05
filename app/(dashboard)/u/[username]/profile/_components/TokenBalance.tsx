import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TokenBalance = () => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent py-2 px-4">
        <span className="text-white text-sm font-medium">
          My Wallet Balance
        </span>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">$2,530.00</p>
              <div className="text-xs text-muted-foreground">
                From 3 different tokens
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span>Withdraw</span>
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              USDT
            </span>
            <span className="font-medium">$1,500.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
              USDC
            </span>
            <span className="font-medium">$1,000.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-purple-500"></div>
              SOL
            </span>
            <span className="font-medium">$30.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;
