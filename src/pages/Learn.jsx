
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDueCards, updateCardWithSM2 } from "../components/srs/SRSAlgorithm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Brain, Trophy, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WordCard from "../components/learn/WordCard";
import LearningProgress from "../components/learn/LearningProgress";

import { triggerConfetti } from "../components/common/Confetti";
import { playSound } from "../components/common/SoundEffects";

import { WordsCache } from "../components/utils/WordsCache";

export default function Learn() {
  const { toast } = useToast();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedTodayCount, setLearnedTodayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [flashCardMap, setFlashCardMap] = useState(new Map());
  const [displayWord, setDisplayWord] = useState(null);
  const [userLevel, setUserLevel] = useState(null);

  const [userPreferences, setUserPreferences] = useState({
    sound_effects_enabled: true,
    confetti_enabled: true
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.preferences) {
          setUserPreferences({
            sound_effects_enabled: currentUser.preferences.sound_effects_enabled !== false,
            confetti_enabled: currentUser.preferences.confetti_enabled !== false
          });
        }
      } catch (error) {
        console.log("Could not load preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  const loadLearningData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const level = currentUser?.preferences?.learning_level || "all";
      setUserLevel(level);
      
      console.log('[Learn.js] 🔍 بدء تحميل البيانات...');
      console.log('[Learn.js] 👤 المستخدم:', currentUser.email);
      console.log('[Learn.js] 📊 المستوى المحدد:', level);
      
      let allWords;
      let allFlashCards;

      // ✅ مسح Cache للحصول على أحدث البيانات
      WordsCache.clear();
      
      const flashCardsPromise = base44.entities.FlashCard.filter({ created_by: currentUser.email });

      [allWords, allFlashCards] = await Promise.all([
        base44.entities.QuranicWord.list(),
        flashCardsPromise,
      ]);
      WordsCache.set(allWords);
      
      console.log('[Learn.js] 📚 إجمالي الكلمات المحملة:', allWords.length);
      
      // 🐛 DEBUG: طباعة أول 5 كلمات لمعرفة قيم difficulty_level الفعلية
      console.log('[Learn.js] 🔍 عينة من مستويات الصعوبة:');
      allWords.slice(0, 5).forEach(w => {
        console.log(`  - الكلمة: "${w.word}", المستوى: "${w.difficulty_level}", النوع: ${typeof w.difficulty_level}`);
      });
      
      // 🔍 طباعة جميع المستويات الفريدة المتاحة
      const uniqueLevels = [...new Set(allWords.map(w => w.difficulty_level))].filter(Boolean); // Filter out null/undefined/empty string levels
      console.log('[Learn.js] 📋 جميع المستويات المتاحة:', uniqueLevels);
      
      // ✅ الخطوة 1: فلترة حسب المستوى (مع تطبيع النصوص)
      let levelFilteredWords = allWords;
      if (level !== "all") {
        levelFilteredWords = allWords.filter(word => {
          // تطبيع النص: إزالة المسافات الزائدة وتوحيد الترميز
          const wordLevel = (word.difficulty_level || "").trim();
          const targetLevel = level.trim();
          return wordLevel === targetLevel;
        });
        console.log(`[Learn.js] 🎯 كلمات بعد فلترة المستوى (${level}):`, levelFilteredWords.length);
        
        // 🐛 DEBUG: إذا لم نجد كلمات، اطبع المستويات المتاحة مرة أخرى
        if (levelFilteredWords.length === 0) {
          console.log('[Learn.js] ⚠️ لم نجد كلمات بمستوى:', level);
          console.log('[Learn.js] 💡 المستويات المتاحة هي:', uniqueLevels);
        }
      }
      
      if (levelFilteredWords.length === 0 && level !== "all") {
        toast({
          title: "⚠️ لا توجد كلمات بهذا المستوى",
          description: `لم نجد كلمات بمستوى "${level}". المستويات المتاحة: ${uniqueLevels.length > 0 ? uniqueLevels.join('، ') : 'لا توجد مستويات محددة'}. يمكنك تغيير المستوى من الإعدادات أو إضافة كلمات جديدة.`,
          variant: "destructive",
          duration: 8000
        });
        setWords([]);
        setIsLoading(false);
        return;
      }
      
      // الخطوة 2: فلترة حسب المصدر (جزء/سورة)
      let filteredWords = levelFilteredWords;
      if (currentUser.preferences) {
        const { source_type, selected_juz, selected_surahs } = currentUser.preferences;
        
        console.log('[Learn.js] 🔧 إعدادات المصدر:', { source_type, selected_juz, selected_surahs });
        
        if (source_type === 'juz' && selected_juz?.length > 0) {
            const beforeJuzFilter = filteredWords.length;
            filteredWords = filteredWords.filter(word => selected_juz.includes(word.juz_number));
            console.log('[Learn.js] 📖 كلمات بعد فلترة الأجزاء:', filteredWords.length, `(كان ${beforeJuzFilter})`);
            
            if (filteredWords.length === 0 && beforeJuzFilter > 0) {
              toast({
                title: "⚠️ لا توجد كلمات في الأجزاء المحددة",
                description: "لم نجد كلمات في الأجزاء التي اخترتها. جرب اختيار أجزاء أخرى أو اختر 'جميع القرآن' من الإعدادات.",
                variant: "destructive",
                duration: 6000
              });
              setWords([]);
              setIsLoading(false);
              return;
            }
        } else if (source_type === 'surah' && selected_surahs?.length > 0) {
            const beforeSurahFilter = filteredWords.length;
            filteredWords = filteredWords.filter(word => selected_surahs.includes(word.surah_name));
            console.log('[Learn.js] 📜 كلمات بعد فلترة السور:', filteredWords.length, `(كان ${beforeSurahFilter})`);
            
            if (filteredWords.length === 0 && beforeSurahFilter > 0) {
              toast({
                title: "⚠️ لا توجد كلمات في السور المحددة",
                description: "لم نجد كلمات في السور التي اخترتها. جرب اختيار سور أخرى أو اختر 'جميع القرآن' من الإعدادات.",
                variant: "destructive",
                duration: 6000
              });
              setWords([]);
              setIsLoading(false);
              return;
            }
        } else {
          console.log('[Learn.js] ✅ لا توجد فلترة مصدر (جميع القرآن)');
        }
      }

      console.log('[Learn.js] ✅ إجمالي الكلمات بعد الفلترة:', filteredWords.length);

      const newFlashCardMap = new Map(allFlashCards.map(fc => [fc.word_id, fc]));
      setFlashCardMap(newFlashCardMap);
      
      console.log('[Learn.js] 🃏 عدد FlashCards:', allFlashCards.length);
      
      // الخطوة 3: تحديد الكلمات المستحقة للمراجعة
      const dueFlashCards = getDueCards(allFlashCards);
      console.log('[Learn.js] ⏰ عدد FlashCards المستحقة للمراجعة:', dueFlashCards.length);
      
      const dueWordIds = new Set(dueFlashCards.map(fc => fc.word_id));
      const reviewWords = filteredWords.filter(word => dueWordIds.has(word.id));
      console.log('[Learn.js] 📝 كلمات المراجعة:', reviewWords.length);
      
      // الخطوة 4: تحديد الكلمات الجديدة
      const newWords = filteredWords.filter(word => !newFlashCardMap.has(word.id));
      console.log('[Learn.js] 🆕 كلمات جديدة:', newWords.length);
      
      // ترتيب كلمات المراجعة حسب الأولوية
      const sortedReviewWords = reviewWords.sort((a, b) => {
        const fcA = newFlashCardMap.get(a.id);
        const fcB = newFlashCardMap.get(b.id);
        const dateA = fcA ? new Date(fcA.next_review) : new Date(0);
        const dateB = fcB ? new Date(fcB.next_review) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });

      // دمج كلمات المراجعة والكلمات الجديدة
      const sessionWords = [...sortedReviewWords, ...newWords];
      console.log('[Learn.js] 🎓 إجمالي كلمات الجلسة:', sessionWords.length);
      
      // 🐛 DEBUG: طباعة أول كلمة
      if (sessionWords.length > 0) {
        console.log('[Learn.js] 📝 أول كلمة في الجلسة:', sessionWords[0].word);
      }
      
      setWords(sessionWords);
      setCurrentIndex(0);
      
      console.log('[Learn.js] ✅ تم تحميل البيانات بنجاح');
      
    } catch (error) {
      console.error("[Learn.js] ❌ خطأ في تحميل البيانات:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل كلمات التعلم والمراجعة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLearningData();
  }, [loadLearningData]);

  useEffect(() => {
    console.log('[Learn.js] 🔄 تحديث displayWord, currentIndex:', currentIndex, 'words.length:', words.length);
    if (words.length > 0 && currentIndex < words.length) {
      const word = words[currentIndex];
      console.log('[Learn.js] 📌 عرض الكلمة:', word?.word);
      setDisplayWord(word);
    } else {
      console.log('[Learn.js] ⚠️ لا توجد كلمة لعرضها');
      setDisplayWord(null);
    }
  }, [currentIndex, words]);


  const handleWordLearned = async () => {
    if (!displayWord || !user) return;
    const currentWord = displayWord;
    const isNew = !flashCardMap.has(currentWord.id);
    
    if (isNew) {
      try {
        let [progress] = await base44.entities.UserProgress.filter({ created_by: user.email });
        
        let oldTotalXP = progress?.total_xp || 0;
        
        if (!progress) {
          progress = await base44.entities.UserProgress.create({ created_by: user.email });
        }
        
        const newCardData = { word_id: currentWord.id, created_by: user.email, is_new: true };
        const flashcard = await base44.entities.FlashCard.create(newCardData);
        
        const updatedCard = updateCardWithSM2(flashcard, 5);
        await base44.entities.FlashCard.update(flashcard.id, updatedCard);
        
        const xpGained = 10;
        const newTotalXP = oldTotalXP + xpGained;
        const newLearnedWords = [...new Set([...(progress.learned_words || []), currentWord.id])];
  
        await base44.entities.UserProgress.update(progress.id, {
          learned_words: newLearnedWords,
          words_learned: newLearnedWords.length,
          total_xp: newTotalXP,
          current_level: Math.floor(newTotalXP / 100) + 1
        });
  
        setFlashCardMap(prevMap => new Map(prevMap).set(flashcard.word_id, updatedCard));
        setLearnedTodayCount(prev => prev + 1);
        
        if (userPreferences.sound_effects_enabled) {
          playSound('achievement');
        }

        const newLevel = Math.floor(newTotalXP / 100) + 1;
        const oldLevel = Math.floor(oldTotalXP / 100) + 1;
        
        if (newLevel > oldLevel && userPreferences.confetti_enabled) {
          triggerConfetti('levelUp');
        }

        toast({
          title: "✅ تم الحفظ بنجاح",
          description: "أحسنت! الكلمة أُضيفت إلى مراجعاتك.",
          duration: 3000,
          className: "bg-green-100 text-green-800 top-0 right-0",
        });
      } catch (error) {
        console.error("Error marking new word as learned:", error);
        toast({
          title: "خطأ في حفظ الكلمة",
          description: "حدث خطأ في حفظ التقدم. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }
    } else {
      try {
        const flashcard = flashCardMap.get(currentWord.id);
        if (!flashcard) {
          console.warn("Flashcard not found for review word:", currentWord.id);
          return;
        }

        const updatedCard = updateCardWithSM2(flashcard, 5);
        await base44.entities.FlashCard.update(flashcard.id, updatedCard);
        
        setFlashCardMap(prevMap => new Map(prevMap).set(flashcard.word_id, updatedCard));
        
        toast({
          title: "🔁 تمت المراجعة",
          description: updatedCard.next_review_message || "ستظهر لك هذه الكلمة مجددًا في المستقبل.",
          duration: 4000,
          className: "bg-blue-100 text-blue-800 top-0 right-0",
        });
      } catch (error) {
        console.error("Error marking word as reviewed:", error);
        toast({
          title: "خطأ في تحديث المراجعة",
          description: "حدث خطأ في تحديث المراجعة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setTimeout(() => {
      const remainingWords = words.filter(w => w.id !== currentWord.id);
      
      setWords(remainingWords);

      if (remainingWords.length === 0) {
        loadLearningData();
      } else {
        if (currentIndex >= remainingWords.length) {
            setCurrentIndex(remainingWords.length - 1);
        }
      }
    }, 300);
  };


  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadLearningData();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const currentWord = displayWord;
  const isReviewWord = currentWord && flashCardMap.has(currentWord.id) && !flashCardMap.get(currentWord.id)?.is_new;

  if (isLoading || (words.length > 0 && !displayWord)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-foreground/70 mt-4">جارٍ تحضير جلسة التعلم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text text-center mb-2">
            تعلم ومراجعة
          </h1>
          <p className="text-center text-foreground/70 mb-6 md:mb-8">ابدأ رحلتك في تعلم كلمات القرآن الكريم.</p>
          
          {/* ملاحظة للمستخدم */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
              💡 <strong>ملاحظة:</strong> يمكنك التحكم في ظهور عناصر بطاقة التعلم من خلال: <strong>الإعدادات → عناصر البطاقة → حفظ التغييرات</strong>
            </p>
          </div>
          
          <LearningProgress 
            currentIndex={currentIndex}
            totalWords={words.length}
            learnedToday={learnedTodayCount}
          />
        </motion.div>

        {words.length === 0 ? (
           <div className="text-center max-w-lg mx-auto mt-12">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-card shadow-md rounded-2xl border border-border p-8 transition-all duration-300 ease-in-out hover:shadow-lg">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">أحسنت صنعًا!</h2>
                <p className="text-foreground/70 mb-6">
                  لا توجد كلمات جديدة أو مراجعات مستحقة الآن. أنت على اطلاع دائم!
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-xl">
                  <Link to={createPageUrl("Quiz")}>
                    <Brain className="w-5 h-5 ml-2" />
                    اختبر معرفتك الآن
                  </Link>
                </Button>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <WordCard 
                  key={currentWord?.id || currentIndex}
                  word={currentWord}
                  onMarkLearned={handleWordLearned}
                  isReviewWord={isReviewWord} 
                  userLevel={userLevel}
                />
              </AnimatePresence>

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 rounded-xl bg-card"
                >
                  <ArrowRight className="w-5 h-5" />
                  السابق
                </Button>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/70">
                    {currentIndex + 1} / {words.length}
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={goToNext}
                  disabled={currentIndex === words.length - 1}
                  className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground"
                >
                  التالي
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-primary font-semibold text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    إنجازات اليوم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/80">كلمات جديدة</span>
                      <Badge className="bg-primary/10 text-primary rounded-md">
                        {learnedTodayCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/80">نقاط الخبرة</span>
                      <Badge className="bg-background-soft text-foreground border border-border rounded-md">
                        +{learnedTodayCount * 10} XP
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card shadow-md rounded-2xl border border-border transition-all duration-300 ease-in-out hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <h3 className="text-lg font-bold text-primary mb-2">استمر في التقدم</h3>
                    <p className="text-foreground/80 text-sm mb-4">
                      حوّل معرفتك إلى نقاط في قسم الاختبار.
                    </p>
                    <Button asChild variant="default" className="w-full rounded-xl">
                      <Link to={createPageUrl("Quiz")}>
                        <Brain className="w-4 h-4 ml-2" />
                        ابدأ الاختبار
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
