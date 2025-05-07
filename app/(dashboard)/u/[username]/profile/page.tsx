"use client";

import React, { useState } from "react";
import TipStats from "@/app/(dashboard)/u/[username]/profile/_components/TipStats";
import DonationChart from "@/app/(dashboard)/u/[username]/profile/_components/DonationChart";
import StreamStats from "@/app/(dashboard)/u/[username]/profile/_components/StreamStats";
import RecentTips from "@/app/(dashboard)/u/[username]/profile/_components/RecentTips";
import TokenBalance from "@/app/(dashboard)/u/[username]/profile/_components/TokenBalance";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie, Users, DollarSign, Wallet, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display gradient-text mb-8">
          Streaming Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Token Balance Card */}
          <TokenBalance />

          {/* Total Tips Card */}
          <TipStats />

          {/* Stream Stats Card */}
          <StreamStats />
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="donations" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="donations" className="flex items-center">
              <ChartPie className="w-4 h-4 mr-2" />
              <span>Donation Stats</span>
            </TabsTrigger>
            <TabsTrigger value="streams" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Stream Performance</span>
            </TabsTrigger>
            <TabsTrigger value="viewers" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>Viewer Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Donation Analytics</h2>
              <div className="flex justify-end mb-4">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  {["day", "week", "month", "year"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period as any)}
                      className={`px-4 py-2 text-sm font-medium ${
                        selectedPeriod === period
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      } border border-gray-200 ${
                        period === "day" ? "rounded-l-lg" : ""
                      } ${period === "year" ? "rounded-r-lg" : ""}`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <DonationChart period={selectedPeriod} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentTips />

              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">User{i + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            sol...{i}xyz
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(100 - i * 15).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {10 - i} donations
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streams" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Stream Performance</h2>
              <div className="h-[350px]">
                <div className="text-center text-muted-foreground mt-16">
                  Stream performance chart will be displayed here
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Recent Streams</h2>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Stream #{i + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            Date.now() - i * 86400000
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{60 - i * 10} minutes</p>
                        <p className="text-sm text-muted-foreground">
                          {50 - i * 5} viewers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">
                  Stream Highlights
                </h2>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Peak moment #{i + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {80 - i * 10} concurrent viewers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(50 - i * 8).toFixed(2)} tips
                        </p>
                        <p className="text-sm text-muted-foreground">
                          During stream #{i + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="viewers" className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">
                Viewer Demographics
              </h2>
              <div className="h-[350px]">
                <div className="text-center text-muted-foreground mt-16">
                  Viewer demographics chart will be displayed here
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Viewer Retention</h2>
                <div className="h-[250px]">
                  <div className="text-center text-muted-foreground mt-16">
                    Viewer retention chart will be displayed here
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Viewer Growth</h2>
                <div className="h-[250px]">
                  <div className="text-center text-muted-foreground mt-16">
                    Viewer growth chart will be displayed here
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
