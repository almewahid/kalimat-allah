import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function LevelCard({ currentLevel, totalXP, progressPercentage, todayXP }) {
  const nextLevelXP = currentLevel * 100;
  const currentLevelXP = (currentLevel - 1) * 100;
  const xpInLevel = totalXP - currentLevelXP;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8"
    >
      <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-primary font-semibold text-2xl">المستوى {currentLevel}</CardTitle>
                <p className="text-foreground/70">إجمالي النقاط: {totalXP}</p>
              </div>
            </div>
            {todayXP > 0 && (
              <Badge variant="outline" className="bg-background-soft text-foreground border border-border">
                <Zap className="w-4 h-4 ml-1 text-primary" />
                +{todayXP} اليوم
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-foreground/80">
              <span>التقدم للمستوى التالي</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-foreground/70">
              <span>{xpInLevel} نقطة</span>
              <span>{nextLevelXP - totalXP} نقطة متبقية</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}