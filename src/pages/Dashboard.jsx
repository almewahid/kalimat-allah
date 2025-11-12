import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Star, 
  Target, 
  Calendar,
  Zap,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

import LevelCard from "../components/dashboard/LevelCard";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentWords from "../components/dashboard/RecentWords";
import QuickActions from "../components/dashboard/QuickActions";
import TutorialModal from "../components/onboarding/TutorialModal";

export default function Dashboard() {
  const [userProgress, setUserProgress] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [todayXP, setTodayXP] = useState(0);
  const [user, setUser] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if user needs to see tutorial
      if (!currentUser.has_seen_tutorial) {
        setShowTutorial(true);
      }
      
      const [progressList, wordsData, sessions] = await Promise.all([
        base44.entities.UserProgress.filter({ created_by: currentUser.email }),
        base44.entities.QuranicWord.list(),
        base44.entities.QuizSession.filter({ created_by: currentUser.email }, '-created_date', 5)
      ]);
      
      let progress = progressList[0] || {
        total_xp: 0,
        current_level: 1,
        words_learned: 0,
        quiz_streak: 0,
        learned_words: [],
        consecutive_login_days: 1,
        last_login_date: new Date().toISOString().split('T')[0]
      };

      // Login streak logic
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const lastLogin = new Date(progress.last_login_date || '1970-01-01');
      lastLogin.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      let needsUpdate = false;
      
      if (lastLogin.getTime() < today.getTime()) { 
        if (lastLogin.getTime() === yesterday.getTime()) {
          progress.consecutive_login_days = (progress.consecutive_login_days || 0) + 1;
        } else {
          progress.consecutive_login_days = 1;
        }
        progress.last_login_date = todayStr;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
         if (progress.id) {
            await base44.entities.UserProgress.update(progress.id, {
                consecutive_login_days: progress.consecutive_login_days,
                last_login_date: progress.last_login_date
            });
         } else {
            const newProgress = await base44.entities.UserProgress.create({
                ...progress,
                created_by: currentUser.email
            });
            progress = newProgress;
         }
      }

      setUserProgress(progress);
      setAllWords(wordsData);
      setRecentSessions(sessions);

      // Calculate today's XP
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(session => 
        session.created_date?.startsWith(todayDateStr)
      );
      const xpToday = todaySessions.reduce((sum, session) => sum + (session.xp_earned || 0), 0);
      setTodayXP(xpToday);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleCloseTutorial = async (settings) => {
    setShowTutorial(false);
    
    try {
      // حفظ الإعدادات التي اختارها المستخدم
      await base44.auth.updateMe({ 
        has_seen_tutorial: true,
        preferences: {
          ...user?.preferences,
          ...settings
        }
      });
      
      // إعادة تحميل البيانات لتطبيق الإعدادات
      window.location.reload();
    } catch (error) {
      console.error("Error updating tutorial status:", error);
    }
  };

  const getLevelProgress = () => {
    if (!userProgress) return 0;
    const currentLevelXP = (userProgress.current_level - 1) * 100;
    const nextLevelXP = userProgress.current_level * 100;
    const progressInLevel = userProgress.total_xp - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    return (progressInLevel / levelRange) * 100;
  };

  if (!userProgress) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Tutorial Modal */}
        <TutorialModal 
          isOpen={showTutorial}
          onClose={handleCloseTutorial}
        />

        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            أهلاً وسهلاً {user?.full_name?.split(' ')[0] || 'بك'}
          </h1>
          <p className="text-center text-foreground/70 mb-6 md:mb-8">لنواصل رحلة تعلم كلمات القرآن الكريم.</p>
        </motion.div>

        {/* Level Progress Card */}
        <LevelCard 
          currentLevel={userProgress.current_level}
          totalXP={userProgress.total_xp}
          progressPercentage={getLevelProgress()}
          todayXP={todayXP}
        />

        {/* Stats Grid */}
        <StatsGrid 
          wordsLearned={userProgress.words_learned}
          totalWords={allWords.length}
          quizStreak={userProgress.quiz_streak}
          recentSessions={recentSessions}
          consecutiveLoginDays={userProgress.consecutive_login_days}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Words */}
        <RecentWords 
          learnedWordsIds={userProgress.learned_words || []} 
          allWords={allWords} 
        />
      </div>
    </div>
  );
}