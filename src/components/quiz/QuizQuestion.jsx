import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import KidsQuizQuestion from "../kids/KidsQuizQuestion";

export default function QuizQuestion({ question, onAnswer, timeLeft, onPlayAudio, userLevel }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (userLevel === "مبتدئ") {
    return <KidsQuizQuestion
      question={question}
      onAnswer={onAnswer}
      timeLeft={timeLeft}
      onPlayAudio={onPlayAudio}
      userLevel={userLevel}
    />;
  }

  const handleAnswerSelect = (optionMeaning) => {
    if (hasAnswered) return;

    setSelectedAnswer(optionMeaning);
    setHasAnswered(true);

    setTimeout(() => {
      onAnswer(optionMeaning);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }, 1500);
  };

  const handlePlayAudio = (e, url) => {
    e.stopPropagation();
    if (url && onPlayAudio) {
      onPlayAudio(url);
    }
  };

  // دالة لتمييز الكلمة في الآية
  const highlightWordInAyah = (ayahText, word) => {
    if (!ayahText || !word) return ayahText;
    
    const parts = ayahText.split(word);
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="text-primary font-bold bg-primary/20 px-2 py-1 rounded text-3xl">
                {word}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <motion.div
      key={question.word.id}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card backdrop-blur-sm border-border shadow-xl">
        <CardContent className="p-4 md:p-8">
          {/* الكلمة */}
          <div className="text-center mb-6">
            <h2 className="text-5xl md:text-6xl font-bold text-primary arabic-font mb-4">
              {question.word.word}
            </h2>
            {question.word.audio_url && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={(e) => handlePlayAudio(e, question.word.audio_url)} 
                className="mt-2"
              >
                <Volume2 className="w-8 h-8 text-foreground" />
              </Button>
            )}
          </div>

          {/* الآية الكاملة */}
          {question.word.context_snippet && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-800">
              <p className="text-xl md:text-2xl text-center text-foreground arabic-font leading-loose">
                {highlightWordInAyah(question.word.context_snippet, question.word.word)}
              </p>
            </div>
          )}

          {/* اسم السورة ورقم الآية */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="text-base px-4 py-2 bg-background-soft">
              سورة {question.word.surah_name} - آية {question.word.ayah_number}
            </Badge>
          </div>

          {/* الخيارات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option.meaning;
              const isCorrect = hasAnswered && option.meaning === question.correctAnswer;
              const isWrong = hasAnswered && isSelected && option.meaning !== question.correctAnswer;

              return (
                <motion.div
                  key={index}
                  whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                  whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                >
                  <Button
                    onClick={() => !hasAnswered && handleAnswerSelect(option.meaning)}
                    disabled={hasAnswered}
                    className={`
                      w-full min-h-[70px] h-auto text-base md:text-lg p-4 rounded-xl transition-all duration-300
                      ${!hasAnswered ? 'bg-background-soft hover:bg-primary/10 border-2 border-border hover:border-primary text-foreground' : ''}
                      ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-900 dark:text-green-100' : ''}
                      ${isWrong ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-900 dark:text-red-100' : ''}
                      ${!isSelected && !isCorrect && hasAnswered ? 'opacity-50' : ''}
                      whitespace-normal break-words text-right
                    `}
                  >
                    <span className="flex items-center justify-between w-full gap-3">
                      <span className="flex-1 leading-relaxed text-left overflow-wrap-anywhere">{option.meaning}</span>
                      {isCorrect && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />}
                      {isWrong && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}