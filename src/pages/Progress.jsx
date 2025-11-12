import React, { useState, useEffect } from "react";
import { QuranicWord, UserProgress, QuizSession } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp,
  Flame,
  BookOpen,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

import WeeklyChart from "../components/progress/WeeklyChart";

export default function Progress() {
  const [userProgress, setUserProgress] = useState(null);
  const [quizSessions, setQuizSessions] = useState([]);
  const [totalWords, setTotalWords] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const user = await User.me();
      if (!user?.email) {
        console.warn("User email not found");
        setIsLoading(false);
        return;
      }

      const progressList = await UserProgress.filter({ created_by: user.email });
      const progress = progressList[0] || {
        total_xp: 0,
        current_level: 1,
        words_learned: 0,
        quiz_streak: 0,
        learned_words: []
      };
      setUserProgress(progress);

      const sessions = await QuizSession.filter({ created_by: user.email }, '-created_date');
      const validSessions = sessions.filter(session => session && typeof session === 'object');
      setQuizSessions(validSessions);

      const words = await QuranicWord.list();
      setTotalWords(Array.isArray(words) ? words.length : 0);

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayXP = validSessions
          .filter(session => {
            if (!session.created_date) return false;
            try {
              const sessionDate = parseISO(session.created_date);
              if (!isValid(sessionDate)) return false;
              return session.created_date.startsWith(dateStr);
            } catch (error) {
              console.warn("Invalid session date:", session.created_date);
              return false;
            }
          })
          .reduce((sum, session) => {
            const xp = typeof session.xp_earned === 'number' ? session.xp_earned : 0;
            return sum + xp;
          }, 0);

        last7Days.push({
          date: format(date, 'EEE', { locale: ar }),
          xp: dayXP
        });
      }
      setWeeklyData(last7Days);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading progress data:", error);
      setIsLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!userProgress || totalWords === 0) return 0;
    const wordsLearned = typeof userProgress.words_learned === 'number' ? userProgress.words_learned : 0;
    return Math.round((wordsLearned / totalWords) * 100);
  };

  const getLevelProgress = () => {
    if (!userProgress) return 0;
    const currentLevel = typeof userProgress.current_level === 'number' ? userProgress.current_level : 1;
    const totalXP = typeof userProgress.total_xp === 'number' ? userProgress.total_xp : 0;
    
    const currentLevelXP = (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * 100;
    const progressInLevel = totalXP - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    
    return Math.max(0, Math.min(100, (progressInLevel / levelRange) * 100));
  };

  const getAverageScore = () => {
    const validScores = quizSessions
      .filter(session => typeof session.score === 'number')
      .map(session => session.score);
    
    if (validScores.length === 0) return 0;
    
    return Math.round(
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    );
  };

  const formatSessionDate = (dateString) => {
    if (!dateString) return 'لا يوجد تاريخ';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'تاريخ غير صالح';
      return format(date, 'dd MMM yyyy', { locale: ar });
    } catch (error) {
      console.warn("Error formatting date:", dateString);
      return 'تاريخ غير صالح';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center" role="status" aria-busy="true" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-primary">جارٍ تحميل بيانات التقدم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">تقدمك في التعلم</h1>
          <p className="text-primary">تابع إنجازاتك ومستواك</p>
        </motion.div>

        {/* Level and XP Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
           <Card className="lg:col-span-2 bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
             <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-primary font-semibold text-2xl">المستوى {userProgress?.current_level || 1}</CardTitle>
                            <p className="text-foreground/70">إجمالي النقاط: {userProgress?.total_xp || 0} XP</p>
                        </div>
                    </div>
                </div>
             </CardHeader>
            <CardContent className="pt-0 p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-foreground/80">
                  <span>التقدم للمستوى التالي</span>
                  <span>{Math.round(getLevelProgress())}%</span>
                </div>
                <ProgressBar 
                  value={getLevelProgress()} 
                  className="h-3"
                  aria-label={`تقدم المستوى: ${Math.round(getLevelProgress())}%`}
                />
                <p className="text-foreground/70 text-sm">
                  {100 - ((userProgress?.total_xp || 0) % 100)} نقطة للمستوى التالي
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                سلسلة النجاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {userProgress?.quiz_streak || 0}
                </div>
                <p className="text-foreground/70 text-sm">اختبار متتالي ناجح</p>
                {(userProgress?.quiz_streak || 0) >= 7 && (
                  <Badge className="mt-3 bg-background-soft text-foreground border border-border">
                    🔥 في قمة الحماس!
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">
                {userProgress?.words_learned || 0}
              </div>
              <p className="text-foreground/70 text-sm">كلمة متعلمة</p>
              <div className="mt-2">
                <ProgressBar 
                  value={getCompletionPercentage()} 
                  className="h-2"
                  aria-label={`إكمال التعلم: ${getCompletionPercentage()}%`}
                />
                <p className="text-xs text-blue-500 mt-1">
                  {getCompletionPercentage()}% مكتمل
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">
                {quizSessions.length}
              </div>
              <p className="text-foreground/70 text-sm">اختبار مكتمل</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">
                {getAverageScore()}%
              </div>
              <p className="text-foreground/70 text-sm">متوسط النتائج</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">
                {weeklyData.reduce((sum, day) => sum + (day.xp || 0), 0)}
              </div>
              <p className="text-foreground/70 text-sm">نقاط هذا الأسبوع</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WeeklyChart data={weeklyData} />
          
          <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                آخر الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" role="list" aria-label="قائمة آخر الاختبارات">
                {quizSessions.slice(0, 5).map((session, index) => (
                  <motion.div
                    key={session.id || `session-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-background-soft rounded-lg"
                    role="listitem"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {session.correct_answers || 0}/{session.total_questions || 0} صحيح
                      </p>
                      <p className="text-xs text-foreground/70">
                        {formatSessionDate(session.created_date)}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge 
                        className={
                          (session.score || 0) >= 80 ? "bg-green-100 text-green-700" :
                          (session.score || 0) >= 60 ? "bg-white text-gray-700 border border-gray-200" :
                          "bg-red-100 text-red-700"
                        }
                        role="status"
                        aria-label={`النتيجة: ${session.score || 0}%`}
                      >
                        {session.score || 0}%
                      </Badge>
                      <p className="text-xs text-primary mt-1">
                        +{session.xp_earned || 0} XP
                      </p>
                    </div>
                  </motion.div>
                ))}
                {quizSessions.length === 0 && (
                  <p className="text-foreground/70 text-center py-4" role="status">
                    لم تقم بأي اختبار بعد
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}