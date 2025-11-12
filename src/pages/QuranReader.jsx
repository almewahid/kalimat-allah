import React, { useState, useEffect } from "react";
import { QuranAyah } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QURAN_SURAHS = [
  { number: 1, name: "الفاتحة" },
  { number: 2, name: "البقرة" },
  { number: 3, name: "آل عمران" },
  { number: 4, name: "النساء" },
  { number: 5, name: "المائدة" },
  { number: 6, name: "الأنعام" },
  { number: 7, name: "الأعراف" },
  { number: 8, name: "الأنفال" },
  { number: 9, name: "التوبة" },
  { number: 10, name: "يونس" },
  { number: 11, name: "هود" },
  { number: 12, name: "يوسف" },
  { number: 13, name: "الرعد" },
  { number: 14, name: "إبراهيم" },
  { number: 15, name: "الحجر" },
  { number: 16, name: "النحل" },
  { number: 17, name: "الإسراء" },
  { number: 18, name: "الكهف" },
  { number: 19, name: "مريم" },
  { number: 20, name: "طه" },
  { number: 21, name: "الأنبياء" },
  { number: 22, name: "الحج" },
  { number: 23, name: "المؤمنون" },
  { number: 24, name: "النور" },
  { number: 25, name: "الفرقان" },
  { number: 26, name: "الشعراء" },
  { number: 27, name: "النمل" },
  { number: 28, name: "القصص" },
  { number: 29, name: "العنكبوت" },
  { number: 30, name: "الروم" },
  { number: 31, name: "لقمان" },
  { number: 32, name: "السجدة" },
  { number: 33, name: "الأحزاب" },
  { number: 34, name: "سبأ" },
  { number: 35, name: "فاطر" },
  { number: 36, name: "يس" },
  { number: 37, name: "الصافات" },
  { number: 38, name: "ص" },
  { number: 39, name: "الزمر" },
  { number: 40, name: "غافر" },
  { number: 41, name: "فصلت" },
  { number: 42, name: "الشورى" },
  { number: 43, name: "الزخرف" },
  { number: 44, name: "الدخان" },
  { number: 45, name: "الجاثية" },
  { number: 46, name: "الأحقاف" },
  { number: 47, name: "محمد" },
  { number: 48, name: "الفتح" },
  { number: 49, name: "الحجرات" },
  { number: 50, name: "ق" },
  { number: 51, name: "الذاريات" },
  { number: 52, name: "الطور" },
  { number: 53, name: "النجم" },
  { number: 54, name: "القمر" },
  { number: 55, name: "الرحمن" },
  { number: 56, name: "الواقعة" },
  { number: 57, name: "الحديد" },
  { number: 58, name: "المجادلة" },
  { number: 59, name: "الحشر" },
  { number: 60, name: "الممتحنة" },
  { number: 61, name: "الصف" },
  { number: 62, name: "الجمعة" },
  { number: 63, name: "المنافقون" },
  { number: 64, name: "التغابن" },
  { number: 65, name: "الطلاق" },
  { number: 66, name: "التحريم" },
  { number: 67, name: "الملك" },
  { number: 68, name: "القلم" },
  { number: 69, name: "الحاقة" },
  { number: 70, name: "المعارج" },
  { number: 71, name: "نوح" },
  { number: 72, name: "الجن" },
  { number: 73, name: "المزمل" },
  { number: 74, name: "المدثر" },
  { number: 75, name: "القيامة" },
  { number: 76, name: "الإنسان" },
  { number: 77, name: "المرسلات" },
  { number: 78, name: "النبأ" },
  { number: 79, name: "النازعات" },
  { number: 80, name: "عبس" },
  { number: 81, name: "التكوير" },
  { number: 82, name: "الانفطار" },
  { number: 83, name: "المطففين" },
  { number: 84, name: "الانشقاق" },
  { number: 85, name: "البروج" },
  { number: 86, name: "الطارق" },
  { number: 87, name: "الأعلى" },
  { number: 88, name: "الغاشية" },
  { number: 89, name: "الفجر" },
  { number: 90, name: "البلد" },
  { number: 91, name: "الشمس" },
  { number: 92, name: "الليل" },
  { number: 93, name: "الضحى" },
  { number: 94, name: "الشرح" },
  { number: 95, name: "التين" },
  { number: 96, name: "العلق" },
  { number: 97, name: "القدر" },
  { number: 98, name: "البينة" },
  { number: 99, name: "الزلزلة" },
  { number: 100, name: "العاديات" },
  { number: 101, name: "القارعة" },
  { number: 102, name: "التكاثر" },
  { number: 103, name: "العصر" },
  { number: 104, name: "الهمزة" },
  { number: 105, name: "الفيل" },
  { number: 106, name: "قريش" },
  { number: 107, name: "الماعون" },
  { number: 108, name: "الكوثر" },
  { number: 109, name: "الكافرون" },
  { number: 110, name: "النصر" },
  { number: 111, name: "المسد" },
  { number: 112, name: "الإخلاص" },
  { number: 113, name: "الفلق" },
  { number: 114, name: "الناس" }
];

export default function QuranReaderPage() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahs, setAyahs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSurah(selectedSurah);
  }, [selectedSurah]);

  const loadSurah = async (surahNumber) => {
    setIsLoading(true);
    try {
      const allAyahs = await QuranAyah.filter({ surah_number: surahNumber });
      setAyahs(allAyahs.sort((a, b) => a.ayah_number - b.ayah_number));
    } catch (error) {
      console.error("Error loading surah:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousSurah = () => {
    if (selectedSurah > 1) {
      setSelectedSurah(selectedSurah - 1);
    }
  };

  const handleNextSurah = () => {
    if (selectedSurah < 114) {
      setSelectedSurah(selectedSurah + 1);
    }
  };

  const currentSurah = QURAN_SURAHS.find(s => s.number === selectedSurah);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-center gap-4 mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">قارئ القرآن الكريم</h1>
        </div>

        {/* Surah Selector */}
        <Card className="mb-6 bg-card shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousSurah}
                disabled={selectedSurah === 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <Select
                value={selectedSurah.toString()}
                onValueChange={(value) => setSelectedSurah(parseInt(value))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {QURAN_SURAHS.map((surah) => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      {surah.number}. {surah.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextSurah}
                disabled={selectedSurah === 114}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Surah Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
            <p className="text-foreground/70">جارٍ تحميل السورة...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSurah}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-card shadow-lg">
                <CardHeader className="text-center border-b border-border">
                  <CardTitle className="text-3xl gradient-text mb-2">
                    سورة {currentSurah?.name}
                  </CardTitle>
                  <div className="flex justify-center gap-3">
                    <Badge variant="outline">
                      {ayahs.length} آية
                    </Badge>
                    {ayahs[0] && (
                      <Badge variant="outline">
                        الجزء {ayahs[0].juz_number}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {/* البسملة */}
                  {selectedSurah !== 1 && selectedSurah !== 9 && (
                    <p 
                      className="text-3xl text-center mb-8 text-primary"
                      style={{ fontFamily: 'Amiri, serif' }}
                    >
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  )}

                  {/* Ayahs */}
                  <div className="space-y-6">
                    {ayahs.map((ayah, index) => (
                      <motion.div
                        key={ayah.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-background-soft transition-colors">
                          <Badge 
                            variant="outline" 
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-lg"
                          >
                            {ayah.ayah_number}
                          </Badge>
                          <p 
                            className="text-2xl leading-loose text-foreground flex-1"
                            style={{ fontFamily: 'Amiri, serif' }}
                          >
                            {ayah.ayah_text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}