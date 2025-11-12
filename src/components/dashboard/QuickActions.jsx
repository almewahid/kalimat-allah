import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Brain, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickActions() {
  const actions = [
    {
      title: "ابدأ التعلم",
      description: "تعلم كلمات جديدة",
      icon: BookOpen,
      url: createPageUrl("Learn"),
      isPrimary: true,
    },
    {
      title: "اختبر نفسك",
      description: "قيّم معرفتك",
      icon: Brain,
      url: createPageUrl("Quiz"),
      isPrimary: false,
    },
    {
      title: "تابع تقدمك",
      description: "شاهد إحصائياتك",
      icon: BarChart3,
      url: createPageUrl("Progress"),
      isPrimary: false,
    }
  ];

  return (
    <Card className="bg-card backdrop-blur-sm border-border mb-8 shadow-md">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">
            ماذا تريد أن تفعل؟
          </h2>
          <p className="text-foreground/70">اختر النشاط الذي تريده</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link to={action.url} className="h-full flex">
                <Card className={`w-full cursor-pointer border-border shadow-lg hover:shadow-xl transition-all duration-300 ${action.isPrimary ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${action.isPrimary ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <action.icon className={`w-8 h-8 ${action.isPrimary ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${action.isPrimary ? 'text-white' : 'text-primary'}`}>{action.title}</h3>
                    <p className={`${action.isPrimary ? 'opacity-80' : 'text-foreground/70'}`}>{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}