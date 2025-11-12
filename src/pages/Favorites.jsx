import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { QuranicWord, FavoriteWord } from "@/api/entities";
import WordCard from "../components/learn/WordCard";
import { Star, Frown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesPage() {
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const favoriteRecords = await FavoriteWord.filter({ created_by: user.email });
      const wordIds = favoriteRecords.map(f => f.word_id);

      if (wordIds.length > 0) {
        // Fetch all words at once
        const words = await QuranicWord.filter({ id: { '$in': wordIds } });
        // Preserve the order of favoriting
        const orderedWords = wordIds.map(id => words.find(w => w.id === id)).filter(Boolean).reverse();
        setFavoriteWords(orderedWords);
      } else {
        setFavoriteWords([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleFavoriteChange = () => {
    // Reload favorites from DB to reflect the change
    loadFavorites();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        <Star className="w-8 h-8 text-amber-500" />
        <h1 className="text-3xl font-bold gradient-text">كلماتي المفضلة</h1>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-foreground/70 mt-4">جارٍ تحميل المفضلة...</p>
        </div>
      ) : (
        <AnimatePresence>
          {favoriteWords.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteWords.map((word, index) => (
                <motion.div
                  key={word.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WordCard
                    word={word}
                    onFavoriteChange={handleFavoriteChange}
                    isLearned={true} // Favorited words are always considered "learned"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-card border border-border rounded-xl"
            >
              <Frown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">لا توجد كلمات مفضلة بعد</h2>
              <p className="text-foreground/70">
                يمكنك إضافة كلمات إلى المفضلة بالضغط على أيقونة النجمة ⭐ في بطاقات التعلم.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}