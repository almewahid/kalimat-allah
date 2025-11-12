import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Flame } from "lucide-react";

export default function LearningProgress({ currentIndex, totalWords, learnedToday }) {
  const progressPercentage = totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0;

  return (
    <Card className="bg-card backdrop-blur-lg border-border shadow-md rounded-2xl mb-6 md:mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-semibold text-primary">تقدم الجلسة</h3>
            <p className="text-sm text-foreground/70">
              {totalWords > 0 ? `${currentIndex + 1} من ${totalWords} كلمة` : "لا توجد كلمات حالياً"}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-background-soft text-foreground border border-border gap-1 rounded-md">
              <Target className="w-3 h-3 text-foreground/70" />
              {Math.round(progressPercentage)}%
            </Badge>
            {learnedToday > 0 && (
              <Badge className="bg-background-soft text-foreground border border-border gap-1 rounded-md">
                <Flame className="w-3 h-3 text-red-500" />
                +{learnedToday} اليوم
              </Badge>
            )}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-3" />
      </CardContent>
    </Card>
  );
}