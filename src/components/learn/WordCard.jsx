import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Volume2, CheckCircle, BookOpen, Sparkles, Edit, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/common/AudioContext";

export default function WordCard({ word, onMarkLearned, isReviewWord, userLevel }) {
  const [userNote, setUserNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [cardElements, setCardElements] = useState([]);
  const { playAyah, playWord, playMeaning } = useAudio();

  useEffect(() => {
    console.log('[WordCard] 📝 Current word data:', {
      word: word?.word,
      surah_number: word?.surah_number,
      ayah_number: word?.ayah_number,
      surah_name: word?.surah_name,
      context_snippet: word?.context_snippet
    });
  }, [word]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.preferences?.word_card_elements) {
          setCardElements(user.preferences.word_card_elements);
        } else {
          // Default elements if not set
          setCardElements([
            { id: "meaning", visible: true },
            { id: "alternative_meanings", visible: true },
            { id: "root", visible: true },
            { id: "context", visible: true },
            { id: "example", visible: true },
            { id: "reflection", visible: true },
            { id: "image", visible: true },
            { id: "note", visible: true }
          ]);
        }
      } catch (error) {
        console.log("Could not load card preferences:", error);
        setCardElements([
          { id: "meaning", visible: true },
          { id: "alternative_meanings", visible: true },
          { id: "root", visible: true },
          { id: "context", visible: true },
          { id: "example", visible: true },
          { id: "reflection", visible: true },
          { id: "image", visible: true },
          { id: "note", visible: true }
        ]);
      }
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    const loadNote = async () => {
      if (!word) return;
      try {
        const user = await base44.auth.me();
        const notes = await base44.entities.UserNote.filter({
          word_id: word.id,
          created_by: user.email
        });
        if (notes.length > 0) {
          setUserNote(notes[0].content);
        }
      } catch (error) {
        console.log("Could not load note:", error);
      }
    };
    loadNote();
  }, [word]);

  const handleSaveNote = async () => {
    if (!word) return;
    try {
      const user = await base44.auth.me();
      const existingNotes = await base44.entities.UserNote.filter({
        word_id: word.id,
        created_by: user.email
      });

      if (existingNotes.length > 0) {
        await base44.entities.UserNote.update(existingNotes[0].id, { content: userNote });
      } else {
        await base44.entities.UserNote.create({
          word_id: word.id,
          content: userNote
        });
      }
      setIsEditingNote(false);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handlePlayAyahRecitation = () => {
    console.log('[WordCard] 🎵 Attempting to play ayah');
    console.log('[WordCard] Word data:', word);
    
    if (!word?.surah_number || !word?.ayah_number) {
      console.warn('[WordCard] ❌ Missing surah_number or ayah_number:', {
        surah_number: word?.surah_number,
        ayah_number: word?.ayah_number,
        word: word?.word
      });
      alert('⚠️ معلومات الآية غير متوفرة لهذه الكلمة. يرجى التحقق من البيانات.');
      return;
    }
    
    console.log('[WordCard] ✅ Playing ayah:', `${word.surah_number}:${word.ayah_number}`);
    playAyah(word.surah_number, word.ayah_number, word);
  };

  const handlePlayWordAudio = () => {
    console.log('[WordCard] 🔵 Attempting to play word audio');
    
    if (!word?.surah_number || !word?.ayah_number || !word?.word) {
      console.warn('[WordCard] ❌ Missing data for word audio:', {
        surah_number: word?.surah_number,
        ayah_number: word?.ayah_number,
        word: word?.word
      });
      alert('⚠️ معلومات الكلمة غير مكتملة. يرجى التحقق من البيانات.');
      return;
    }
    
    console.log('[WordCard] ✅ Playing word:', word.word);
    playWord(word.surah_number, word.ayah_number, word.word, word);
  };

  const handleSpeakMeaning = () => {
    if (!word?.meaning) return;
    const textToSpeak = `${word.meaning}. ${word.alternative_meanings?.join('، ') || ''}`;
    playMeaning(textToSpeak);
  };

  const isElementVisible = (elementId) => {
    const element = cardElements.find(el => el.id === elementId);
    return element ? element.visible : true;
  };

  if (!word) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="bg-card backdrop-blur-sm border-border shadow-xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {/* Word Header */}
          <div className="text-center mb-6">
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-primary mb-4 arabic-font"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {word.word}
            </motion.h2>

            {/* ✅ الآية الكاملة مع زر التلاوة - لجميع المستويات */}
            {word.context_snippet && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-800 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    📖 الآية الكريمة
                  </h4>
                  
                  {/* 🟢 زر تلاوة الآية */}
                  {word.surah_number && word.ayah_number && (
                    <Button
                      size="sm"
                      onClick={handlePlayAyahRecitation}
                      className="bg-green-600 hover:bg-green-700 gap-1 h-8"
                      title="استمع لتلاوة الآية"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-xs">تلاوة</span>
                    </Button>
                  )}
                </div>
                
                <p className="text-lg md:text-xl text-center text-amber-900 dark:text-amber-100 arabic-font leading-loose mb-3">
                  {word.context_snippet}
                </p>
                
                {/* رقم الآية واسم السورة */}
                <div className="text-center">
                  <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50 border-amber-300">
                    سورة {word.surah_name} - آية {word.ayah_number}
                  </Badge>
                </div>
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="flex justify-center gap-3 mb-4 flex-wrap">
              {/* 🔵 نطق الكلمة */}
              {word.surah_number && word.ayah_number && (
                <Button
                  size="lg"
                  onClick={handlePlayWordAudio}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  title="استمع لنطق الكلمة فقط"
                >
                  <Volume2 className="w-5 h-5" />
                  🔵 نطق الكلمة
                </Button>
              )}

              <Button
                size="lg"
                onClick={onMarkLearned}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {isReviewWord ? "راجعتها" : "حفظتها"}
              </Button>
            </div>
          </div>

          {/* Card Elements */}
          <div className="space-y-6">
            {/* المعنى */}
            {word.meaning && isElementVisible("meaning") && (
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    المعنى
                  </h3>
                  <Button
                    size="sm"
                    onClick={handleSpeakMeaning}
                    className="bg-purple-600 hover:bg-purple-700 gap-2"
                    title="استمع للمعنى (TTS)"
                  >
                    <Volume2 className="w-4 h-4" />
                    🟣 استمع
                  </Button>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {word.meaning}
                </p>
              </div>
            )}

            {/* المعاني البديلة */}
            {word.alternative_meanings && word.alternative_meanings.length > 0 && isElementVisible("alternative_meanings") && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                  معانٍ بديلة
                </h3>
                <ul className="space-y-2">
                  {word.alternative_meanings.map((meaning, index) => (
                    <li key={index} className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-lg">{meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* الجذر */}
            {word.root && isElementVisible("root") && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
                  الجذر اللغوي
                </h3>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 arabic-font text-center">
                  {word.root}
                </p>
              </div>
            )}

            {/* مثال الاستخدام */}
            {word.example_usage && isElementVisible("example") && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-3">
                  مثال الاستخدام
                </h3>
                <p className="text-lg text-orange-900 dark:text-orange-100 italic">
                  "{word.example_usage}"
                </p>
              </div>
            )}

            {/* السؤال التأملي */}
            {word.reflection_question && isElementVisible("reflection") && (
              <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
                <h3 className="text-lg font-semibold text-pink-800 dark:text-pink-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  سؤال للتفكير
                </h3>
                <p className="text-lg text-pink-900 dark:text-pink-100 mb-3">
                  {word.reflection_question}
                </p>
                {word.reflection_answer && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-pink-700 dark:text-pink-400 hover:underline">
                      اضغط لرؤية الإجابة
                    </summary>
                    <p className="mt-2 text-pink-800 dark:text-pink-200 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      {word.reflection_answer}
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* الصورة */}
            {word.image_url && isElementVisible("image") && (
              <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3">
                  صورة توضيحية
                </h3>
                <img
                  src={word.image_url}
                  alt={word.word}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            {/* الملاحظة الشخصية */}
            {isElementVisible("note") && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                    ملاحظتك الشخصية
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (isEditingNote) {
                        handleSaveNote();
                      } else {
                        setIsEditingNote(true);
                      }
                    }}
                    className="text-yellow-700 dark:text-yellow-400"
                  >
                    {isEditingNote ? (
                      <>
                        <Save className="w-4 h-4 ml-1" />
                        حفظ
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                      </>
                    )}
                  </Button>
                </div>
                {isEditingNote ? (
                  <Textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="أضف ملاحظاتك الخاصة هنا..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-yellow-900 dark:text-yellow-100">
                    {userNote || "لا توجد ملاحظات بعد. اضغط 'تعديل' لإضافة ملاحظة."}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}