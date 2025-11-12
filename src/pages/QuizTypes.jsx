import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const allQuizTypes = [
  {
    id: "normal",
    title: "اختبار عادي",
    description: "اختبر معرفتك بمعاني الكلمات القرآنية",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
    link: createPageUrl("Quiz"),
    levels: ["مبتدئ", "متوسط", "متقدم"]
  },
  {
    id: "roots",
    title: "اختبار الجذور",
    description: "اختبر معرفتك بجذور الكلمات",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    link: createPageUrl("RootQuiz"),
    levels: ["متوسط", "متقدم"]
  },
  {
    id: "context",
    title: "اختبار السياق",
    description: "اختبر فهمك للكلمات في سياق الآيات",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    link: createPageUrl("ContextQuiz"),
    levels: ["متوسط", "متقدم"]
  }
  // تم إخفاء اختبار الاستماع مؤقتاً
  // {
  //   id: "listening",
  //   title: "اختبار الاستماع",
  //   description: "استمع للكلمات واختر المعنى الصحيح",
  //   icon: Volume2,
  //   color: "from-orange-500 to-red-500",
  //   link: createPageUrl("ListeningQuiz"),
  //   levels: ["متوسط", "متقدم"]
  // }
];

export default function QuizTypes() {
  const [userLevel, setUserLevel] = useState("متوسط");

  useEffect(() => {
    loadUserLevel();
  }, []);

  const loadUserLevel = async () => {
    try {
      const user = await base44.auth.me();
      const level = user?.preferences?.learning_level || "متوسط";
      setUserLevel(level);
    } catch (error) {
      console.error("Error loading user level:", error);
    }
  };

  // تصفية الاختبارات حسب مستوى المستخدم
  const availableQuizzes = allQuizTypes.filter(quiz => 
    quiz.levels.includes(userLevel)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-3">اختر نوع الاختبار</h1>
        <p className="text-foreground/70 text-lg">اختر النوع المناسب لك واختبر مهاراتك</p>
        <p className="text-primary text-sm mt-2">مستواك الحالي: <strong>{userLevel}</strong></p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableQuizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={quiz.link}>
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${quiz.color}`}></div>
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${quiz.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <quiz.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">{quiz.description}</p>
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
                    ابدأ الاختبار
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {availableQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/70 text-lg">لا توجد اختبارات متاحة لمستواك الحالي.</p>
        </div>
      )}
    </div>
  );
}