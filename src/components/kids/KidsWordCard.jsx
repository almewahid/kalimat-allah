import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, CheckCircle, Star, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/common/AudioContext";

export default function KidsWordCard({ word, onMarkLearned }) {
  const { playAyah, playWord, playMeaning } = useAudio();

  const handlePlayAyahRecitation = () => {
    console.log('[KidsWordCard] 🎵 Playing ayah');
    if (!word?.surah_number || !word?.ayah_number) {
      console.warn('[KidsWordCard] ❌ Missing surah/ayah');
      alert('⚠️ معلومات الآية غير متوفرة');
      return;
    }
    playAyah(word.surah_number, word.ayah_number, word);
  };

  const handlePlayWordAudio = () => {
    console.log('[KidsWordCard] 🔵 Playing word');
    if (!word?.surah_number || !word?.ayah_number || !word?.word) {
      console.warn('[KidsWordCard] ❌ Missing word data');
      alert('⚠️ معلومات الكلمة غير مكتملة');
      return;
    }
    playWord(word.surah_number, word.ayah_number, word.word, word);
  };

  const handleSpeakMeaning = () => {
    if (!word?.meaning) return;
    const textToSpeak = `${word.meaning}. ${word.alternative_meanings?.join('، ') || ''}`;
    playMeaning(textToSpeak);
  };

  const categoryEmojis = {
    "أسماء": "📛",
    "أفعال": "⚡",
    "صفات": "✨",
    "حروف": "🔤",
    "أخرى": "📖"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-4 border-purple-300 dark:border-purple-700 shadow-2xl overflow-hidden">
        <CardContent className="p-6 md:p-10">
          {/* عنوان مرح */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block"
            >
              <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
            </motion.div>
            <h3 className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-2">
              تعلم كلمة جديدة! 🌟
            </h3>
          </div>

          {/* الكلمة */}
          <div className="text-center mb-8 bg-white/80 dark:bg-gray-800/80 p-8 rounded-3xl shadow-xl border-4 border-purple-200">
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-8xl md:text-9xl font-bold text-purple-600 dark:text-purple-400 mb-6 arabic-font drop-shadow-lg"
            >
              {word.word}
            </motion.h2>

            {/* أزرار الصوت الكبيرة */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              {/* 🟢 تلاوة الآية */}
              {word.surah_number && word.ayah_number && (
                <Button
                  size="lg"
                  onClick={handlePlayAyahRecitation}
                  className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white gap-2 text-xl px-8 py-8 rounded-3xl shadow-2xl border-4 border-green-300 transform hover:scale-105 transition-all"
                >
                  <Volume2 className="w-8 h-8" />
                  <span className="font-bold">🎵 تلاوة الآية</span>
                </Button>
              )}

              {/* 🔵 نطق الكلمة */}
              {word.surah_number && word.ayah_number && (
                <Button
                  size="lg"
                  onClick={handlePlayWordAudio}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white gap-2 text-xl px-8 py-8 rounded-3xl shadow-2xl border-4 border-blue-300 transform hover:scale-105 transition-all"
                >
                  <Volume2 className="w-8 h-8" />
                  <span className="font-bold">🗣️ نطق الكلمة</span>
                </Button>
              )}
            </div>

            {/* ✅ نص الآية مع رقمها */}
            {word.context_snippet && (
              <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl border-4 border-amber-300 dark:border-amber-700 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    📖 الآية الكريمة
                  </h4>
                </div>
                
                <p className="text-2xl text-amber-900 dark:text-amber-200 arabic-font leading-relaxed mb-3 font-semibold">
                  {word.context_snippet}
                </p>
                
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-400 text-base px-4 py-2">
                  📚 سورة {word.surah_name} - آية {word.ayah_number}
                </Badge>
              </div>
            )}

            {/* الفئة */}
            {word.category && (
              <div className="mt-4">
                <Badge className="text-xl px-6 py-3 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200 border-2 border-purple-400">
                  {categoryEmojis[word.category] || "📖"} {word.category}
                </Badge>
              </div>
            )}
          </div>

          {/* المعنى */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-8 rounded-3xl border-4 border-green-300 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                <Star className="w-7 h-7" />
                المعنى
              </h3>
              <Button
                size="lg"
                onClick={handleSpeakMeaning}
                className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white gap-2 px-6 py-6 rounded-2xl border-4 border-purple-300"
              >
                <Volume2 className="w-6 h-6" />
                🟣 استمع
              </Button>
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">
              {word.meaning}
            </p>
          </div>

          {/* المعاني البديلة */}
          {word.alternative_meanings && word.alternative_meanings.length > 0 && (
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-8 rounded-3xl border-4 border-blue-300 shadow-xl mb-6">
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-4">
                معانٍ أخرى 📚
              </h3>
              <ul className="space-y-3">
                {word.alternative_meanings.map((meaning, index) => (
                  <li key={index} className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
                    <span className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span className="text-2xl font-semibold">{meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* الصورة */}
          {word.image_url && (
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 p-8 rounded-3xl border-4 border-orange-300 shadow-xl mb-6">
              <h3 className="text-2xl font-bold text-orange-800 dark:text-orange-300 mb-4 text-center">
                صورة توضيحية 🖼️
              </h3>
              <img
                src={word.image_url}
                alt={word.word}
                className="w-full rounded-2xl shadow-lg border-4 border-white"
              />
            </div>
          )}

          {/* زر الحفظ */}
          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={onMarkLearned}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-3 text-2xl px-12 py-8 rounded-3xl shadow-2xl border-4 border-purple-300 transform hover:scale-105 transition-all"
            >
              <CheckCircle className="w-10 h-10" />
              <span className="font-bold">حفظتها! ✨</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}