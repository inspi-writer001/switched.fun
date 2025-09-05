import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";

const NA = "0";

const StreamStats = () => {
  return (
    <Card className="overflow-hidden bg-background">
      <div className=" bg-transparent py-2 px-4 w-full border-b">
        <span className="text-white text-sm font-medium">
          Stream Statistics
        </span>
      </div>
      <div className="p-4 flex items-center align-middle justify-center text-2xl text-white font-bold">
        Not available yet
      </div>

      {/* <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{NA}</p>
                <div className="text-xs text-muted-foreground">
                  Total viewers this month
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{NA}</p>
                <div className="text-xs text-muted-foreground">
                  Stream time this month
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Last stream</span>
            <span className="font-medium">{NA}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Avg. viewers</span>
            <span className="font-medium">{NA}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Avg. tips</span>
            <span className="font-medium">{NA}</span>
          </div>
        </div>
      </CardContent> */}
    </Card>
  );
};

export default StreamStats;
