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
  Award,
  AlertCircle,
  Search as SearchIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

import LevelCard from "../components/dashboard/LevelCard";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentWords from "../components/dashboard/RecentWords";
import QuickActions from "../components/dashboard/QuickActions";
import TutorialModal from "../components/onboarding/TutorialModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const [userProgress, setUserProgress] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [todayXP, setTodayXP] = useState(0);
  const [user, setUser] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[Dashboard] 🔄 Starting to load dashboard data...');
      
      // Step 1: Get current user
      let currentUser;
      try {
        currentUser = await base44.auth.me();
        console.log('[Dashboard] ✅ User loaded:', currentUser?.email);
        setUser(currentUser);
      } catch (authError) {
        console.error('[Dashboard] ❌ Auth error:', authError);
        throw new Error('فشل تحميل معلومات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
      }
      
      // Check if user needs to see tutorial
      if (!currentUser.has_seen_tutorial) {
        setShowTutorial(true);
      }
      
      // Step 2: Load data in parallel with error handling
      console.log('[Dashboard] 📊 Loading user data...');
      
      let progressList = [];
      let wordsData = [];
      let sessions = [];
      
      try {
        progressList = await base44.entities.UserProgress.filter({ created_by: currentUser.email });
        console.log('[Dashboard] ✅ Progress loaded:', progressList.length, 'records');
      } catch (err) {
        console.warn('[Dashboard] ⚠️ Progress load failed:', err);
        // Continue with empty progress
      }
      
      try {
        wordsData = await base44.entities.QuranicWord.list();
        console.log('[Dashboard] ✅ Words loaded:', wordsData.length, 'words');
      } catch (err) {
        console.warn('[Dashboard] ⚠️ Words load failed:', err);
        // Continue with empty words
      }
      
      try {
        sessions = await base44.entities.QuizSession.filter({ created_by: currentUser.email }, '-created_date', 5);
        console.log('[Dashboard] ✅ Sessions loaded:', sessions.length, 'sessions');
      } catch (err) {
        console.warn('[Dashboard] ⚠️ Sessions load failed:', err);
        // Continue with empty sessions
      }
      
      // Step 3: Process progress
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
      
      // Step 4: Update progress if needed
      if (needsUpdate) {
        try {
          if (progress.id) {
            await base44.entities.UserProgress.update(progress.id, {
              consecutive_login_days: progress.consecutive_login_days,
              last_login_date: progress.last_login_date
            });
            console.log('[Dashboard] ✅ Progress updated');
          } else {
            const newProgress = await base44.entities.UserProgress.create({
              ...progress,
              created_by: currentUser.email
            });
            progress = newProgress;
            console.log('[Dashboard] ✅ Progress created');
          }
        } catch (updateError) {
          console.warn('[Dashboard] ⚠️ Progress update failed:', updateError);
          // Continue without updating
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
      
      console.log('[Dashboard] ✅ Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('[Dashboard] ❌ Critical error loading dashboard:', error);
      setError(error.message || 'حدث خطأ غير متوقع أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTutorial = async (settings) => {
    setShowTutorial(false);
    
    try {
      await base44.auth.updateMe({ 
        has_seen_tutorial: true,
        preferences: {
          ...user?.preferences,
          ...settings
        }
      });
      
      window.location.reload();
    } catch (error) {
      console.error('[Dashboard] Error updating tutorial status:', error);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-20">
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-300">
            <div className="font-bold mb-2">❌ خطأ في تحميل البيانات</div>
            <p className="text-sm mb-4">{error}</p>
            <div className="space-y-2 text-sm">
              <p><strong>الحلول الممكنة:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>تحقق من اتصالك بالإنترنت</li>
                <li>حدّث الصفحة (F5)</li>
                <li>امسح الكاش (Ctrl+Shift+Delete)</li>
                <li>سجل خروج ثم سجل دخول مرة أخرى</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              🔄 إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!userProgress) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">جارٍ إعداد حسابك...</p>
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
          <p className="text-center text-foreground/70 mb-4">لنواصل رحلة تعلم كلمات القرآن الكريم.</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <Input
              type="text"
              placeholder="ابحث عن كلمة، درس، أو معلومة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/Search?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="w-full pr-12 pl-4 py-3 text-lg rounded-xl border-2 border-border focus:border-primary bg-background-soft"
            />
            {searchQuery && (
              <Button
                size="sm"
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/Search?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90"
              >
                بحث
              </Button>
            )}
          </div>
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