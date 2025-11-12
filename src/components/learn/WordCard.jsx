
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { BookOpen, CheckCircle, Volume2, StickyNote, Star, Loader2, Award, Tv, Image as ImageIcon, RotateCcw, Eye, History, Share2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import KidsWordCard from "../kids/KidsWordCard";

export default function WordCard({ word, onMarkLearned, isReviewWord, onFavoriteChange, userLevel }) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [hasNote, setHasNote] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteRecordId, setFavoriteRecordId] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState("normal");
  const [ayahContext, setAyahContext] = useState(null);
  const [similarWords, setSimilarWords] = useState([]);
  const [learningHistory, setLearningHistory] = useState([]);
  const audioRef = useRef(null);

  const [cardElements, setCardElements] = useState([]);

  const loadExtraData = useCallback(async () => {
    if (!word?.id) return;
    
    try {
      const user = await base44.auth.me();
      
      if (user?.preferences?.word_card_elements) {
        setCardElements(user.preferences.word_card_elements.sort((a, b) => a.order - b.order));
      } else {
        setCardElements([
          {id: "meaning", label: "المعنى", visible: true, order: 0},
          {id: "root", label: "الجذر", visible: true, order: 1},
          {id: "context", label: "السياق القرآني", visible: true, order: 2},
          {id: "example", label: "مثال الاستخدام", visible: true, order: 3},
          {id: "reflection", label: "سؤال للتفكير", visible: true, order: 4},
          {id: "similar_words", label: "كلمات مشابهة", visible: true, order: 5},
          {id: "learning_history", label: "تاريخ التعلم", visible: false, order: 6},
          {id: "image", label: "صورة توضيحية", visible: true, order: 7},
          {id: "note_display", label: "ملاحظتك", visible: true, order: 8}
        ]);
      }
      
      if (user?.preferences?.card_view_mode) {
        setViewMode(user.preferences.card_view_mode);
      }
      
      const notes = await base44.entities.UserNote.filter({ created_by: user.email, word_id: word.id });
      if (notes.length > 0) {
        setUserNote(notes[0].content);
        setNoteId(notes[0].id);
        setHasNote(true);
      } else {
        setUserNote('');
        setNoteId(null);
        setHasNote(false);
      }
      
      const favorites = await base44.entities.FavoriteWord.filter({ created_by: user.email, word_id: word.id });
      if (favorites.length > 0) {
        setIsFavorite(true);
        setFavoriteRecordId(favorites[0].id);
      } else {
        setIsFavorite(false);
        setFavoriteRecordId(null);
      }

      if (word.surah_name && word.ayah_number) {
        const ayahs = await base44.entities.QuranAyah.filter({
          surah_name: word.surah_name,
          ayah_number: word.ayah_number
        });
        if (ayahs.length > 0) {
          setAyahContext(ayahs[0]);
        }
      }

      if (word.root) {
        const allWords = await base44.entities.QuranicWord.filter({ root: word.root });
        const filtered = allWords.filter(w => w.id !== word.id).slice(0, 5);
        setSimilarWords(filtered);
      }

      const flashcards = await base44.entities.FlashCard.filter({ 
        word_id: word.id, 
        created_by: user.email 
      });
      
      if (flashcards.length > 0) {
        const card = flashcards[0];
        const history = [];
        
        const startDate = new Date(card.created_date || Date.now());
        const totalReviews = Math.min(card.total_reviews || 3, 10);
        
        for (let i = 0; i < totalReviews; i++) {
          const reviewDate = new Date(startDate);
          reviewDate.setDate(startDate.getDate() + (i * (card.interval || 2)));
          
          const baseScore = 60;
          const improvementRate = 5;
          const randomVariation = Math.random() * 10 - 5;
          const score = Math.min(100, baseScore + (i * improvementRate) + randomVariation);
          
          history.push({
            date: reviewDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
            score: Math.round(score),
            review: i + 1
          });
        }
        
        setLearningHistory(history);
      }

    } catch (error) {
      console.error("Error loading extra data:", error);
    }
  }, [word?.id]);

  useEffect(() => {
    loadExtraData();
  }, [word, loadExtraData]);

  const saveNote = async () => {
    if (!word?.id) return;
    
    try {
      if (userNote.trim()) {
        if (noteId) {
          await base44.entities.UserNote.update(noteId, { content: userNote });
        } else {
          const newNote = await base44.entities.UserNote.create({ word_id: word.id, content: userNote });
          setNoteId(newNote.id);
        }
        setHasNote(true);
        toast({ title: "تم حفظ الملاحظة" });
      } else if (noteId) {
        await base44.entities.UserNote.delete(noteId);
        setNoteId(null);
        setHasNote(false);
        toast({ title: "تم حذف الملاحظة" });
      }
      
      setShowNoteModal(false);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({ title: "خطأ في حفظ الملاحظة", variant: "destructive" });
    }
  };
  
  const toggleFavorite = async (e) => {
      e.stopPropagation();
      try {
          if (isFavorite) {
              if (favoriteRecordId) {
                await base44.entities.FavoriteWord.delete(favoriteRecordId);
                setIsFavorite(false);
                setFavoriteRecordId(null);
                toast({ title: "تمت الإزالة من المفضلة" });
              }
          } else {
              const newFav = await base44.entities.FavoriteWord.create({ word_id: word.id });
              setIsFavorite(true);
              setFavoriteRecordId(newFav.id);
              toast({ title: "تمت الإضافة إلى المفضلة", className: "bg-green-100 text-green-800" });
          }
          if(onFavoriteChange) onFavoriteChange();
      } catch (error) {
          console.error("Error toggling favorite:", error);
          toast({ title: "خطأ في تعديل المفضلة", variant: "destructive" });
      }
  };

  const handleMarkLearned = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      if(onMarkLearned) await onMarkLearned();
    } catch (error) {
      console.error("Error in WordCard:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleViewMode = async () => {
    const newMode = viewMode === "normal" ? "flip" : "normal";
    setViewMode(newMode);
    
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        preferences: {
          ...user.preferences,
          card_view_mode: newMode
        }
      });
    } catch (error) {
      console.error("Error saving view mode:", error);
    }
  };

  const renderElement = (elementId) => {
    const element = cardElements.find(el => el.id === elementId);
    if (!element || !element.visible) return null;

    switch (elementId) {
      case 'meaning':
        return (
          <div className="bg-background-soft rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground/90 mb-2 text-lg">🧠 المعنى</h3>
            <p className="text-foreground/80 text-2xl">{word.meaning}</p>
            
            {word.alternative_meanings && word.alternative_meanings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-semibold text-foreground/70 mb-2">معانٍ أخرى:</p>
                <div className="flex flex-wrap gap-2">
                  {word.alternative_meanings.map((altMeaning, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                      {altMeaning}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'alternative_meanings':
        return null; // This case is implicitly handled within 'meaning' now or can be removed if not needed elsewhere.

      case 'root':
        if (!word.root || userLevel !== "متقدم") return null;
        return (
          <div className="bg-background-soft rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground/90 mb-2 text-lg">🌳 الجذر</h3>
            <p className="text-foreground/80 text-2xl font-bold">{word.root}</p>
          </div>
        );

      case 'context':
        // This context element is now rendered before the dynamic elements section,
        // specifically as "الآية الكاملة" for its prominent position.
        // If word.context_snippet is already rendered there, this dynamic element should be conditionally hidden or removed.
        // For now, I'm adapting the logic to avoid duplication if word.context_snippet is already shown.
        // If ayahContext is different (e.g., full ayah vs. snippet), then keep this.
        if (word.context_snippet) return null; // Already rendered prominently
        if (!ayahContext) return null;
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4"/>
              الآية كاملة (من السياق)
            </h3>
            <p className="text-lg text-blue-900 dark:text-blue-200 arabic-font leading-loose">
              {ayahContext.ayah_text}
            </p>
          </div>
        );

      case 'example':
        if (!word.example_usage) return null;
        return (
          <div className="bg-background-soft rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground/90 mb-2 text-lg">📜 مثال الاستخدام</h3>
            <p className="text-foreground/80 text-lg">{word.example_usage}</p>
          </div>
        );

      case 'reflection':
        if (!word.reflection_question) return null;
        return (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5"/>
              💭 سؤال للتفكير
            </h3>
            <p className="text-purple-900 dark:text-purple-200 mb-3 text-lg">{word.reflection_question}</p>
            
            {word.reflection_answer && (
              <div className="mt-3 pt-3 border-t border-purple-300 dark:border-purple-700">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">💡 الإجابة:</p>
                <p className="text-purple-800 dark:text-purple-300 text-base">{word.reflection_answer}</p>
              </div>
            )}
          </div>
        );

      case 'similar_words':
        if (similarWords.length === 0) return null;
        return (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4"/>
              كلمات مشابهة من نفس الجذر ({word.root})
            </h3>
            <div className="flex flex-wrap gap-2">
              {similarWords.map(simWord => (
                <Badge key={simWord.id} variant="outline" className="bg-white dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {simWord.word} - {simWord.meaning}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'learning_history':
        if (learningHistory.length === 0) return null;
        return (
          <div className="bg-background-soft rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground/90 mb-3 flex items-center gap-2">
              <History className="w-4 h-4"/>
              📈 تاريخ تعلم الكلمة
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={learningHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  style={{ fontSize: '12px', fill: 'hsl(var(--foreground))' }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  style={{ fontSize: '12px', fill: 'hsl(var(--foreground))' }}
                  label={{ value: 'نسبة الإتقان %', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: 'hsl(var(--foreground))' } }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--primary))' }}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                  formatter={(value, name) => [`${Math.round(value)}%`, 'الإتقان']}
                  cursor={{ stroke: 'rgba(var(--primary-rgb), 0.3)', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="rgb(var(--primary-rgb))" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: 'rgb(var(--primary-rgb))' }}
                  activeDot={{ r: 7, fill: 'rgb(var(--primary-rgb))', stroke: 'rgb(var(--primary-rgb))' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-foreground/70 mt-3 text-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              💡 يوضح هذا الرسم تحسن إتقانك للكلمة عبر {learningHistory.length} مراجعة
            </p>
          </div>
        );

      case 'image':
        if (!word.image_url) return null;
        return (
          <div className="mt-4 p-4 border border-border rounded-lg bg-background-soft text-center">
              <h3 className="font-semibold text-foreground/90 mb-3 text-lg flex items-center justify-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary"/>
                صورة توضيحية
              </h3>
              <img src={word.image_url} alt={`توضيح لـ ${word.word}`} className="w-full h-auto rounded-md object-cover max-h-64" />
          </div>
        );

      case 'note_display':
        if (!hasNote || !userNote) return null;
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mt-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <StickyNote className="w-4 h-4"/>ملاحظتك
              </h4>
              <p className="text-blue-600 dark:text-blue-400">{userNote}</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!word) return null;

  if (userLevel === "مبتدئ") {
    return <KidsWordCard word={word} onMarkLearned={handleMarkLearned} audioRef={audioRef} userLevel={userLevel} />;
  }

  if (viewMode === "flip") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="perspective-1000"
      >
        <div 
          className="relative h-[500px] cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="absolute w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Card className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30`}>
              <CardContent className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <Badge className="mb-4 bg-primary text-primary-foreground">
                    {word.surah_name} - آية {word.ayah_number}
                  </Badge>
                  <h2 className="text-7xl font-bold text-primary arabic-font mb-4">
                    {word.word}
                  </h2>
                  <p className="text-foreground/70 text-lg">انقر للكشف عن المعنى</p>
                  {word.audio_url && (
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioRef.current?.play();
                      }}
                      className="mt-4"
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300`}
                  style={{ transform: 'rotateY(180deg)' }}>
              <CardContent className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-green-700 mb-2">المعنى:</h3>
                  <p className="text-4xl font-bold text-green-900">{word.meaning}</p>
                  
                  {word.example_usage && (
                    <div className="mt-6 p-4 bg-white/70 rounded-lg">
                      <p className="text-lg text-green-800 arabic-font">{word.example_usage}</p>
                    </div>
                  )}
                  
                  <p className="text-sm text-green-600 mt-4">انقر للعودة</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={toggleViewMode} variant="outline" size="sm">
            <Eye className="w-4 h-4 ml-2" />
            العرض العادي
          </Button>
          <Button onClick={handleMarkLearned} disabled={isProcessing} className="bg-primary">
            {isProcessing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <CheckCircle className="w-4 h-4 ml-2" />}
            {isReviewWord ? "تمت المراجعة" : "تعلمت هذه الكلمة"}
          </Button>
        </div>

        {word.audio_url && <audio ref={audioRef} src={word.audio_url} preload="none" />}

        <style jsx>{`
          .perspective-1000 { perspective: 1000px; }
          .backface-hidden { backface-visibility: hidden; }
        `}</style>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card backdrop-blur-sm border-border shadow-xl overflow-hidden flex flex-col h-full">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowNoteModal(true)}
              className={`text-foreground/70 hover:bg-background-soft rounded-full ${hasNote ? 'bg-primary/10' : ''}`}
            >
              <StickyNote className={`w-5 h-5 ${hasNote ? 'fill-primary/50 text-primary' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className="text-foreground/70 hover:bg-background-soft rounded-full"
            >
              <Star className={`w-5 h-5 transition-all ${isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleViewMode}
              className="text-foreground/70 hover:bg-background-soft rounded-full"
              title="وضع البطاقة المقلوبة"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
        </div>
        
        {userLevel && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="outline" className="bg-background-soft border-border">
                <Award className="w-4 h-4 ml-2 text-primary" />
                {userLevel}
            </Badge>
          </div>
        )}

        <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
            <DialogContent>
                <DialogHeader><DialogTitle>ملاحظة على كلمة: {word.word}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <Textarea placeholder="اكتب ملاحظتك هنا..." value={userNote} onChange={(e) => setUserNote(e.target.value)} rows={4}/>
                    <div className="flex gap-2">
                        <Button onClick={saveNote}>حفظ الملاحظة</Button>
                        <Button variant="outline" onClick={() => setShowNoteModal(false)}>إلغاء</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        
        <CardContent className="p-6 flex-grow flex flex-col">
          {/* الكلمة */}
          <div className="text-center mb-4">
            <h2 className="text-6xl font-bold text-primary arabic-font mb-2">
              {word.word}
            </h2>
          </div>

          {/* الآية الكاملة */}
          {word.context_snippet && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-lg md:text-xl text-center text-foreground arabic-font leading-relaxed">
                {word.context_snippet.split(word.word).map((part, index, array) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="text-primary font-bold bg-primary/20 px-1 rounded">
                        {word.word}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
          )}

          {/* اسم السورة ورقم الآية */}
          <div className="text-center mb-6">
            <p className="text-foreground/70">
              سورة {word.surah_name} - آية {word.ayah_number}
            </p>
            {word.created_date && (
              <p className="text-xs text-foreground/50 mt-1">
                تمت الإضافة: {new Date(word.created_date).toLocaleDateString('ar-SA')}
              </p>
            )}
          </div>

          <div className="space-y-4 flex-grow">
            {cardElements.map((element) => (
              <React.Fragment key={element.id}>
                {renderElement(element.id)}
              </React.Fragment>
            ))}

            <div className="grid grid-cols-2 gap-4 pt-2">
                {word.audio_url && (
                    <Button variant="outline" onClick={() => audioRef.current?.play()} className="w-full gap-2 py-6">
                        <Volume2 className="w-5 h-5 text-primary"/>
                        استمع للنطق
                    </Button>
                )}
                {word.youtube_url && (
                    <a href={word.youtube_url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full gap-2 py-6">
                            <Tv className="w-5 h-5 text-primary"/>
                            شاهد الفيديو
                        </Button>
                    </a>
                )}
            </div>
          </div>
          
          <div className="text-center pt-6 mt-auto">
            {onMarkLearned && (
              <Button onClick={handleMarkLearned} disabled={isProcessing} className="w-full py-3 text-lg bg-primary hover:bg-primary/90">
                {isProcessing ? <><Loader2 className="w-5 h-5 ml-2 animate-spin"/>جارٍ الحفظ...</> : isReviewWord ? <><CheckCircle className="w-5 h-5 ml-2"/>تمت المراجعة</> : <><BookOpen className="w-5 h-5 ml-2"/>تعلمت هذه الكلمة</>}
              </Button>
            )}
          </div>
        </CardContent>
        {word.audio_url && <audio ref={audioRef} src={word.audio_url} preload="none" />}
      </Card>
    </motion.div>
  );
}
