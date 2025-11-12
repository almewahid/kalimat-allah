import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, CheckCircle, XCircle, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KidsQuizQuestion({ question, onAnswer, timeLeft, onPlayAudio, userLevel }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleAnswerSelect = (option) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(option.meaning);
    setHasAnswered(true);
    
    setTimeout(() => {
      onAnswer(option.meaning);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }, 2000);
  };

  const handlePlayAudio = (e, url) => {
    e.stopPropagation();
    if (url && onPlayAudio) {
      onPlayAudio(url);
    }
  };

  const getButtonStyle = (optionMeaning) => {
    if (!hasAnswered) {
      return "bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white border-4 border-blue-500";
    }
    
    if (optionMeaning === question.correctAnswer) {
      return "bg-green-400 border-4 border-green-600 text-white";
    }
    
    if (optionMeaning === selectedAnswer && optionMeaning !== question.correctAnswer) {
      return "bg-red-400 border-4 border-red-600 text-white";
    }
    
    return "bg-gray-300 border-4 border-gray-400 text-gray-600";
  };

  const getButtonIcon = (optionMeaning) => {
    if (!hasAnswered) return null;
    
    if (optionMeaning === question.correctAnswer) {
      return <CheckCircle className="w-8 h-8 text-white" />;
    }
    
    if (optionMeaning === selectedAnswer && optionMeaning !== question.correctAnswer) {
      return <XCircle className="w-8 h-8 text-white" />;
    }
    
    return null;
  };

  return (
    <motion.div
      key={question.word.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 dark:from-yellow-900/30 dark:via-pink-900/30 dark:to-purple-900/30 border-4 border-rainbow shadow-2xl overflow-hidden relative">
        
        {/* Celebration Animation */}
        <AnimatePresence>
          {hasAnswered && selectedAnswer === question.correctAnswer && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1], rotate: [0, 360] }}
              exit={{ scale: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <Star className="w-32 h-32 text-yellow-400 drop-shadow-2xl" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-8">
          {/* Badge */}
          <div className="text-center mb-6">
            <Badge className="bg-pink-500 text-white text-xl px-6 py-3 animate-pulse">
              <Sparkles className="w-6 h-6 ml-2" />
              وضع الأطفال
            </Badge>
          </div>

          {/* Word Display - تصغير حجم الخط */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4">
              <motion.h2
                className="text-5xl font-black text-purple-700 dark:text-purple-300 arabic-font drop-shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {question.word.word}
              </motion.h2>
              {question.word.audio_url && (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={(e) => handlePlayAudio(e, question.word.audio_url)}
                  className="bg-blue-400 hover:bg-blue-500 rounded-full p-4"
                >
                  <Volume2 className="w-8 h-8 text-white" />
                </Button>
              )}
            </div>
            
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mt-4">
              🤔 ما معنى هذه الكلمة؟
            </p>
          </div>

          {/* Options - تصغير حجم الخط وإضافة h-auto */}
          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleAnswerSelect(option)}
                  disabled={hasAnswered}
                  className={`w-full p-6 text-right justify-between text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${getButtonStyle(option.meaning)} break-words whitespace-normal min-h-[80px] h-auto`}
                >
                  <span className="flex-1 text-right leading-relaxed pr-3 overflow-wrap-anywhere">{option.meaning}</span>
                  <div className="flex items-center gap-3 flex-shrink-0 mr-2">
                    {getButtonIcon(option.meaning)}
                    {option.audio_url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handlePlayAudio(e, option.audio_url)}
                        className="h-10 w-10 bg-white/50 hover:bg-white/80 rounded-full flex-shrink-0"
                      >
                        <Volume2 className="w-6 h-6 text-purple-600" />
                      </Button>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .border-rainbow {
          border-image: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff) 1;
        }
      `}</style>
    </motion.div>
  );
}