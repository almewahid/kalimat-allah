import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, BookOpen, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SURAHS = [
  { number: 1, name: "الفاتحة", ayahCount: 7, juz: 1 },
  { number: 2, name: "البقرة", ayahCount: 286, juz: 1 },
  { number: 3, name: "آل عمران", ayahCount: 200, juz: 3 },
  { number: 4, name: "النساء", ayahCount: 176, juz: 4 },
  { number: 5, name: "المائدة", ayahCount: 120, juz: 6 },
  { number: 6, name: "الأنعام", ayahCount: 165, juz: 7 },
  { number: 7, name: "الأعراف", ayahCount: 206, juz: 8 },
  { number: 8, name: "الأنفال", ayahCount: 75, juz: 9 },
  { number: 9, name: "التوبة", ayahCount: 129, juz: 10 },
  { number: 10, name: "يونس", ayahCount: 109, juz: 11 },
  { number: 11, name: "هود", ayahCount: 123, juz: 11 },
  { number: 12, name: "يوسف", ayahCount: 111, juz: 12 },
  { number: 13, name: "الرعد", ayahCount: 43, juz: 13 },
  { number: 14, name: "إبراهيم", ayahCount: 52, juz: 13 },
  { number: 15, name: "الحجر", ayahCount: 99, juz: 14 },
  { number: 16, name: "النحل", ayahCount: 128, juz: 14 },
  { number: 17, name: "الإسراء", ayahCount: 111, juz: 15 },
  { number: 18, name: "الكهف", ayahCount: 110, juz: 15 },
  { number: 19, name: "مريم", ayahCount: 98, juz: 16 },
  { number: 20, name: "طه", ayahCount: 135, juz: 16 },
  { number: 21, name: "الأنبياء", ayahCount: 112, juz: 17 },
  { number: 22, name: "الحج", ayahCount: 78, juz: 17 },
  { number: 23, name: "المؤمنون", ayahCount: 118, juz: 18 },
  { number: 24, name: "النور", ayahCount: 64, juz: 18 },
  { number: 25, name: "الفرقان", ayahCount: 77, juz: 18 },
  { number: 26, name: "الشعراء", ayahCount: 227, juz: 19 },
  { number: 27, name: "النمل", ayahCount: 93, juz: 19 },
  { number: 28, name: "القصص", ayahCount: 88, juz: 20 },
  { number: 29, name: "العنكبوت", ayahCount: 69, juz: 20 },
  { number: 30, name: "الروم", ayahCount: 60, juz: 21 },
  { number: 31, name: "لقمان", ayahCount: 34, juz: 21 },
  { number: 32, name: "السجدة", ayahCount: 30, juz: 21 },
  { number: 33, name: "الأحزاب", ayahCount: 73, juz: 21 },
  { number: 34, name: "سبأ", ayahCount: 54, juz: 22 },
  { number: 35, name: "فاطر", ayahCount: 45, juz: 22 },
  { number: 36, name: "يس", ayahCount: 83, juz: 22 },
  { number: 37, name: "الصافات", ayahCount: 182, juz: 23 },
  { number: 38, name: "ص", ayahCount: 88, juz: 23 },
  { number: 39, name: "الزمر", ayahCount: 75, juz: 23 },
  { number: 40, name: "غافر", ayahCount: 85, juz: 24 },
  { number: 41, name: "فصلت", ayahCount: 54, juz: 24 },
  { number: 42, name: "الشورى", ayahCount: 53, juz: 25 },
  { number: 43, name: "الزخرف", ayahCount: 89, juz: 25 },
  { number: 44, name: "الدخان", ayahCount: 59, juz: 25 },
  { number: 45, name: "الجاثية", ayahCount: 37, juz: 25 },
  { number: 46, name: "الأحقاف", ayahCount: 35, juz: 26 },
  { number: 47, name: "محمد", ayahCount: 38, juz: 26 },
  { number: 48, name: "الفتح", ayahCount: 29, juz: 26 },
  { number: 49, name: "الحجرات", ayahCount: 18, juz: 26 },
  { number: 50, name: "ق", ayahCount: 45, juz: 26 },
  { number: 51, name: "الذاريات", ayahCount: 60, juz: 26 },
  { number: 52, name: "الطور", ayahCount: 49, juz: 27 },
  { number: 53, name: "النجم", ayahCount: 62, juz: 27 },
  { number: 54, name: "القمر", ayahCount: 55, juz: 27 },
  { number: 55, name: "الرحمن", ayahCount: 78, juz: 27 },
  { number: 56, name: "الواقعة", ayahCount: 96, juz: 27 },
  { number: 57, name: "الحديد", ayahCount: 29, juz: 27 },
  { number: 58, name: "المجادلة", ayahCount: 22, juz: 28 },
  { number: 59, name: "الحشر", ayahCount: 24, juz: 28 },
  { number: 60, name: "الممتحنة", ayahCount: 13, juz: 28 },
  { number: 61, name: "الصف", ayahCount: 14, juz: 28 },
  { number: 62, name: "الجمعة", ayahCount: 11, juz: 28 },
  { number: 63, name: "المنافقون", ayahCount: 11, juz: 28 },
  { number: 64, name: "التغابن", ayahCount: 18, juz: 28 },
  { number: 65, name: "الطلاق", ayahCount: 12, juz: 28 },
  { number: 66, name: "التحريم", ayahCount: 12, juz: 28 },
  { number: 67, name: "الملك", ayahCount: 30, juz: 29 },
  { number: 68, name: "القلم", ayahCount: 52, juz: 29 },
  { number: 69, name: "الحاقة", ayahCount: 52, juz: 29 },
  { number: 70, name: "المعارج", ayahCount: 44, juz: 29 },
  { number: 71, name: "نوح", ayahCount: 28, juz: 29 },
  { number: 72, name: "الجن", ayahCount: 28, juz: 29 },
  { number: 73, name: "المزمل", ayahCount: 20, juz: 29 },
  { number: 74, name: "المدثر", ayahCount: 56, juz: 29 },
  { number: 75, name: "القيامة", ayahCount: 40, juz: 29 },
  { number: 76, name: "الإنسان", ayahCount: 31, juz: 29 },
  { number: 77, name: "المرسلات", ayahCount: 50, juz: 29 },
  { number: 78, name: "النبأ", ayahCount: 40, juz: 30 },
  { number: 79, name: "النازعات", ayahCount: 46, juz: 30 },
  { number: 80, name: "عبس", ayahCount: 42, juz: 30 },
  { number: 81, name: "التكوير", ayahCount: 29, juz: 30 },
  { number: 82, name: "الانفطار", ayahCount: 19, juz: 30 },
  { number: 83, name: "المطففين", ayahCount: 36, juz: 30 },
  { number: 84, name: "الانشقاق", ayahCount: 25, juz: 30 },
  { number: 85, name: "البروج", ayahCount: 22, juz: 30 },
  { number: 86, name: "الطارق", ayahCount: 17, juz: 30 },
  { number: 87, name: "الأعلى", ayahCount: 19, juz: 30 },
  { number: 88, name: "الغاشية", ayahCount: 26, juz: 30 },
  { number: 89, name: "الفجر", ayahCount: 30, juz: 30 },
  { number: 90, name: "البلد", ayahCount: 20, juz: 30 },
  { number: 91, name: "الشمس", ayahCount: 15, juz: 30 },
  { number: 92, name: "الليل", ayahCount: 21, juz: 30 },
  { number: 93, name: "الضحى", ayahCount: 11, juz: 30 },
  { number: 94, name: "الشرح", ayahCount: 8, juz: 30 },
  { number: 95, name: "التين", ayahCount: 8, juz: 30 },
  { number: 96, name: "العلق", ayahCount: 19, juz: 30 },
  { number: 97, name: "القدر", ayahCount: 5, juz: 30 },
  { number: 98, name: "البينة", ayahCount: 8, juz: 30 },
  { number: 99, name: "الزلزلة", ayahCount: 8, juz: 30 },
  { number: 100, name: "العاديات", ayahCount: 11, juz: 30 },
  { number: 101, name: "القارعة", ayahCount: 11, juz: 30 },
  { number: 102, name: "التكاثر", ayahCount: 8, juz: 30 },
  { number: 103, name: "العصر", ayahCount: 3, juz: 30 },
  { number: 104, name: "الهمزة", ayahCount: 9, juz: 30 },
  { number: 105, name: "الفيل", ayahCount: 5, juz: 30 },
  { number: 106, name: "قريش", ayahCount: 4, juz: 30 },
  { number: 107, name: "الماعون", ayahCount: 7, juz: 30 },
  { number: 108, name: "الكوثر", ayahCount: 3, juz: 30 },
  { number: 109, name: "الكافرون", ayahCount: 6, juz: 30 },
  { number: 110, name: "النصر", ayahCount: 3, juz: 30 },
  { number: 111, name: "المسد", ayahCount: 5, juz: 30 },
  { number: 112, name: "الإخلاص", ayahCount: 4, juz: 30 },
  { number: 113, name: "الفلق", ayahCount: 5, juz: 30 },
  { number: 114, name: "الناس", ayahCount: 6, juz: 30 }
];

function removeArabicDiacritics(text) {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/ٱ/g, "ا"); // ✅ استبدال ٱ بـ ا
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function ImportQuran() {
  const [isImporting, setIsImporting] = useState(false);
  const [currentSurah, setCurrentSurah] = useState(0);
  const [totalAyahs, setTotalAyahs] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [selectedSurahs, setSelectedSurahs] = useState([]);

  const toggleSurah = (surahNumber) => {
    if (isImporting) return;
    if (selectedSurahs.includes(surahNumber)) {
      setSelectedSurahs(selectedSurahs.filter(s => s !== surahNumber));
    } else {
      setSelectedSurahs([...selectedSurahs, surahNumber]);
    }
  };

  const selectAll = () => {
    if (isImporting) return;
    setSelectedSurahs(SURAHS.map(s => s.number));
  };

  const deselectAll = () => {
    if (isImporting) return;
    setSelectedSurahs([]);
  };

  const importQuran = async () => {
    if (selectedSurahs.length === 0) {
      setError("⚠️ الرجاء اختيار سورة واحدة على الأقل.");
      return;
    }

    setIsImporting(true);
    setCurrentSurah(0);
    setTotalAyahs(0);
    setStatus("🔄 بدء استيراد السور المحددة...");
    setError("");
    setLogs(["🔄 بدء استيراد السور المحددة..."]);
    
    const surahsToImport = SURAHS.filter(s => selectedSurahs.includes(s.number));

    try {
      const deleteMessage = "🗑️ جارٍ حذف البيانات القديمة للسور المحددة...";
      setStatus(deleteMessage);
      setLogs(prev => [...prev, deleteMessage]);
      
      const existingAyahs = await base44.entities.QuranAyah.filter({ 
        surah_number: { '$in': selectedSurahs } 
      });
      
      if (existingAyahs.length > 0) {
        for (const ayah of existingAyahs) {
          await base44.entities.QuranAyah.delete(ayah.id);
        }
        const deletedMessage = `✅ تم حذف ${existingAyahs.length} آية قديمة من السور المحددة.`;
        setStatus(deletedMessage);
        setLogs(prev => [...prev, deletedMessage]);
      } else {
        const noDataMessage = "ℹ️ لا توجد بيانات قديمة لحذفها للسور المحددة.";
        setStatus(noDataMessage);
        setLogs(prev => [...prev, noDataMessage]);
      }

      let totalImported = 0;
      
      for (let i = 0; i < surahsToImport.length; i++) {
        const surah = surahsToImport[i];
        setCurrentSurah(surah.number);
        
        const surahProgressMessage = `📖 استيراد سورة ${surah.name} (${i + 1}/${surahsToImport.length})...`;
        setStatus(surahProgressMessage);
        setLogs(prev => [...prev, surahProgressMessage]);
        
        try {
          const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surah.number}`);
          
          if (!response.ok) {
            throw new Error(`فشل تحميل سورة ${surah.name}. رمز الحالة: ${response.status}`);
          }
          
          const data = await response.json();
          const verses = data.verses || [];
          
          for (const verse of verses) {
            const ayahText = verse.text_uthmani || "";
            const ayahData = {
              surah_number: surah.number,
              surah_name: surah.name,
              ayah_number: verse.verse_number || (verse.verse_key ? parseInt(verse.verse_key.split(':')[1]) : 1),
              ayah_text: ayahText,
              ayah_text_simple: removeArabicDiacritics(ayahText), // ✅ تطبيق الاستبدال
              juz_number: surah.juz
            };
            
            await base44.entities.QuranAyah.create(ayahData);
            totalImported++;
          }
          
          setTotalAyahs(totalImported);
          const surahSuccessMessage = `✅ تم استيراد ${verses.length} آية من سورة ${surah.name}.`;
          setLogs(prev => [...prev, surahSuccessMessage]);

          if (i < surahsToImport.length - 1) {
            await sleep(500); 
          }
          
        } catch (surahError) {
          const surahErrorMessage = `تحذير: فشل استيراد سورة ${surah.name}: ${surahError.message}`;
          console.error(surahErrorMessage, surahError);
          setError(prev => prev ? `${prev}\n${surahErrorMessage}` : surahErrorMessage);
          setLogs(prev => [...prev, `❌ ${surahErrorMessage}`]);
        }
      }
      
      const finalSuccessMessage = `✅ تم استيراد ${surahsToImport.length} سورة بنجاح! (${totalImported} آية)`;
      setStatus(finalSuccessMessage);
      setLogs(prev => [...prev, finalSuccessMessage]);
      
    } catch (importError) {
      const generalErrorMessage = `❌ خطأ عام في عملية الاستيراد: ${importError.message}`;
      console.error("خطأ في الاستيراد:", importError);
      setError(generalErrorMessage);
      setStatus("فشلت عملية الاستيراد.");
      setLogs(prev => [...prev, generalErrorMessage]);
    } finally {
      setIsImporting(false);
    }
  };

  const currentSurahIndex = currentSurah > 0 ? surahsToImport.findIndex(s => s.number === currentSurah) : -1;
  const surahsToImport = SURAHS.filter(s => selectedSurahs.includes(s.number));
  const displayedCurrentSurahCount = currentSurahIndex !== -1 ? currentSurahIndex + 1 : 0;
  const progressMax = surahsToImport.length;
  const progressValue = progressMax > 0 ? Math.round((displayedCurrentSurahCount / progressMax) * 100) : 0;

  const isImportComplete = !isImporting && status.includes("بنجاح") && !error;
  const isImportFailed = !isImporting && error && !status.includes("بنجاح");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold gradient-text text-center mb-8">استيراد القرآن الكريم</h1>

        <Card className="mb-6 bg-card border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl text-primary">
                  اختيار السور للاستيراد
                </CardTitle>
                <p className="text-sm text-foreground/70 mt-1">
                  اختر السور التي ترغب في استيرادها
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
              <div className="flex gap-2">
                <Button onClick={selectAll} variant="outline" size="sm" disabled={isImporting}>
                  تحديد الكل
                </Button>
                <Button onClick={deselectAll} variant="outline" size="sm" disabled={isImporting}>
                  إلغاء الكل
                </Button>
              </div>
              <Badge variant="secondary" className="text-sm py-1 px-3">
                {selectedSurahs.length} سورة محددة
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {SURAHS.map(surah => (
                <Button
                  key={surah.number}
                  onClick={() => toggleSurah(surah.number)}
                  disabled={isImporting}
                  variant={selectedSurahs.includes(surah.number) ? "default" : "outline"}
                  className="flex justify-between items-center text-sm h-auto py-2 px-3 transition-colors duration-200"
                >
                  <span className="font-medium">
                    {surah.number}. {surah.name}
                  </span>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 min-w-[30px] flex justify-center">
                    {surah.ayahCount}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">بدء عملية الاستيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={importQuran}
              disabled={isImporting || selectedSurahs.length === 0}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جارٍ الاستيراد...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 ml-2" />
                  بدء استيراد السور المحددة
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isImporting && (
          <Card className="mb-6 bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">الحالة والتقدم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-foreground font-medium">{status}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-foreground/70">
                  <span>التقدم ({displayedCurrentSurahCount}/{progressMax} سورة)</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-3" />
                {totalAyahs > 0 && (
                  <p className="text-sm text-foreground/70 text-right">
                    إجمالي الآيات المستوردة: {totalAyahs} آية
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {isImportComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <div className="font-bold mb-2">{status}</div>
                  <div className="text-sm">
                    يمكنك الآن البحث في القرآن الكريم.
                  </div>
                  <Button 
                    onClick={() => {setStatus(""); setError(""); setTotalAyahs(0); setLogs([]); setSelectedSurahs([]);}} 
                    variant="link" 
                    className="mt-2 p-0 h-auto text-green-700 dark:text-green-400"
                  >
                    بدء استيراد جديد
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {isImportFailed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  <div className="font-bold mb-2">حدث خطأ أثناء الاستيراد:</div>
                  <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                  <Button 
                    onClick={() => {setStatus(""); setError(""); setTotalAyahs(0); setLogs([]); setSelectedSurahs([]);}} 
                    variant="link" 
                    className="mt-2 p-0 h-auto text-red-700 dark:text-red-400"
                  >
                    المحاولة مرة أخرى
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {logs.length > 0 && (
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">سجل العمليات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-border rounded-md bg-background-soft custom-scrollbar">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm text-foreground/80 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}