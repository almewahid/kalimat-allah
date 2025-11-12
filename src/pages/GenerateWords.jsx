
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Upload, Sparkles, FileText, AlertTriangle,
  CheckCircle, Loader2, Zap, BookOpen, Brain, Wand2, PlusCircle, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const SURAHS = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

const JUZ_SURAHS = {
  1: ["الفاتحة", "البقرة"], // Al-Fatiha 1 to Al-Baqarah 141
  2: ["البقرة"], // Al-Baqarah 142 to Al-Baqarah 252
  3: ["البقرة", "آل عمران"], // Al-Baqarah 253 to Al-Imran 92
  4: ["آل عمران", "النساء"], // Al-Imran 93 to An-Nisa 23
  5: ["النساء"], // An-Nisa 24 to An-Nisa 147
  6: ["النساء", "المائدة"], // An-Nisa 148 to Al-Ma'idah 82
  7: ["المائدة", "الأنعام"], // Al-Ma'idah 83 to Al-An'am 110
  8: ["الأنعام", "الأعراف"], // Al-An'am 111 to Al-A'raf 87
  9: ["الأعراف", "الأنفال"], // Al-A'raf 88 to Al-Anfal 40
  10: ["الأنفال", "التوبة"], // Al-Anfal 41 to At-Tawbah 92
  11: ["التوبة", "يونس", "هود"], // At-Tawbah 93 to Hud 5
  12: ["هود", "يوسف"], // Hud 6 to Yusuf 52
  13: ["يوسف", "الرعد", "إبراهيم"], // Yusuf 53 to Ibrahim 52
  14: ["الحجر", "النحل"], // Al-Hijr 1 to An-Nahl 128
  15: ["الإسراء", "الكهف"], // Al-Isra 1 to Al-Kahf 74
  16: ["الكهف", "مريم", "طه"], // Al-Kahf 75 to Taha 135
  17: ["الأنبياء", "الحج"], // Al-Anbiya 1 to Al-Hajj 78
  18: ["المؤمنون", "النور", "الفرقان"], // Al-Mu'minun 1 to Al-Furqan 20
  19: ["الفرقان", "الشعراء", "النمل"], // Al-Furqan 21 to An-Naml 55
  20: ["النمل", "القصص", "العنكبوت"], // An-Naml 56 to Al-Ankabut 44
  21: ["العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب"], // Al-Ankabut 45 to Al-Ahzab 30
  22: ["الأحزاب", "سبأ", "فاطر", "يس"], // Al-Ahzab 31 to Ya-Sin 27
  23: ["يس", "الصافات", "ص", "الزمر"], // Ya-Sin 28 to Az-Zumar 31
  24: ["الزمر", "غافر", "فصلت"], // Az-Zumar 32 to Fussilat 46
  25: ["فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية"], // Fussilat 47 to Al-Jathiyah 37
  26: ["الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات"], // Al-Ahqaf 1 to Adh-Dhariyat 30
  27: ["الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد"], // Adh-Dhariyat 31 to Al-Hadid 29
  28: ["المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم"], // Al-Mujadilah 1 to At-Tahrim 12
  29: ["الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات"], // Al-Mulk 1 to Al-Mursalat 45
  30: ["النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"] // An-Naba 1 to An-Nas 6
};

/**
 * Helper function to remove Arabic diacritics and normalize text.
 * This includes special handling for Alif Wasla (ٱ) to Regular Alif (ا).
 */
const removeArabicDiacritics = (text) => {
  if (!text) return "";
  return text
    // Remove all diacritical marks (Fathatan, Dammatan, Kasratan, Shadda, Sukun, etc.)
    .replace(/[\u064B-\u065F]/g, "")
    // Remove Alif Khanjariya
    .replace(/[\u0670]/g, "")
    // Remove additional diacritics (redundant but harmless regex for safety)
    .replace(/[ًٌٍَُِّْ]/g, "")
    // Normalize Alif Wasla (ٱ) to Regular Alif (ا) for consistent matching
    .replace(/ٱ/g, "ا")
    // Trim leading/trailing whitespace
    .trim();
};

function GenerateWords() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const [totalWordsToProcess, setTotalWordsToProcess] = useState(0);
  const [processedWords, setProcessedWords] = useState([]);
  const [errors, setErrors] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Image Gallery Modal
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImageFor, setSelectedImageFor] = useState(""); // 'manual' or 'batch'

  const [smartForm, setSmartForm] = useState({
    source_type: "juz",
    selected_juz: [],
    selected_surahs: [],
    difficulty_level: "مبتدئ"
  });

  const [manualForm, setManualForm] = useState({
    word: "",
    surah_name: "",
    ayah_number: "",
    juz_number: "",
    difficulty_level: "مبتدئ",
    meaning: "",
    category: "أخرى",
    root: "",
    context_snippet: "",
    example_usage: "",
    image_url: "",
    audio_url: "",
    youtube_url: "",
    reflection_question: "",
    reflection_answer: "",
    alternative_meanings: ""
  });

  const [batchForm, setBatchForm] = useState({
    batch_text: "",
    difficulty_level: "مبتدئ"
  });

  React.useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser.role === 'admin');
    } catch (error) {
      console.error("[pages/GenerateWords.js] Error checking admin:", error);
      toast({
        title: "خطأ في المصادقة",
        description: "تعذر التحقق من دور المستخدم. قد لا تكون لديك الصلاحيات.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(fileType)) {
        setSelectedFile(file);
        setErrors([]);
        toast({
          title: "✅ تم اختيار الملف",
          description: file.name,
          className: "bg-green-100 text-green-800"
        });
      } else {
        toast({
          title: "⚠️ نوع ملف خاطئ",
          description: "يرجى رفع ملف CSV أو Excel فقط (.csv, .xlsx, .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const openImageGallery = async (formType) => {
    setSelectedImageFor(formType);
    try {
      const images = await base44.entities.images.list("-created_date", 500); // Fetch up to 500 images, ordered by creation date desc
      setGalleryImages(images);
      setShowImageGallery(true);
    } catch (error) {
      console.error("[pages/GenerateWords.js] Error fetching image gallery:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل معرض الصور",
        variant: "destructive"
      });
    }
  };

  const selectImageFromGallery = (imageUrl) => {
    if (selectedImageFor === "manual") {
      setManualForm({ ...manualForm, image_url: imageUrl });
    }
    // No batch processing image selection planned in outline, but could be added here
    setShowImageGallery(false);
    toast({
      title: "✅ تم اختيار الصورة",
      description: "تم إضافة الصورة بنجاح"
    });
  };

  const processFileAndGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: "⚠️ لا يوجد ملف",
        description: "يرجى اختيار ملف أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentWordCount(0);
    setProcessedWords([]);
    setErrors([]);

    try {
      setProgress(10);
      const uploadResult = await base44.integrations.Core.UploadFile({ file: selectedFile });
      const fileUrl = uploadResult.file_url;

      setProgress(20);

      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: "object",
          properties: {
            words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  surah_name: { type: "string" },
                  ayah_number: { type: "integer" },
                  juz_number: { type: "integer" },
                  difficulty_level: { type: "string" },
                  meaning: { type: "string" },
                  context_snippet: { type: "string" },
                  category: { type: "string" },
                  root: { type: "string" },
                  example_usage: { type: "string" },
                  reflection_question: { type: "string" },
                  reflection_answer: { type: "string" },
                  image_url: { type: "string" },
                  audio_url: { type: "string" },
                  youtube_url: { type: "string" },
                  alternative_meanings: { type: "string" } // Assuming comma-separated string from file
                },
                required: ["word", "surah_name", "ayah_number"]
              }
            }
          }
        }
      });

      if (extractionResult.status === "error") {
        throw new Error(extractionResult.details || "فشل استخراج البيانات من الملف. يرجى التحقق من تنسيق الملف.");
      }

      const words = extractionResult.output?.words || [];

      if (words.length === 0) {
        throw new Error("لم يتم العثور على كلمات في الملف. يرجى التأكد من أن الملف يحتوي على البيانات المطلوبة.");
      }

      setTotalWordsToProcess(words.length);
      setProgress(30);

      const generatedWords = [];
      const processingErrors = [];

      for (let i = 0; i < words.length; i++) {
        try {
          const wordData = words[i];
          setCurrentWordCount(i + 1);

          if (!wordData.word || !wordData.surah_name || !wordData.ayah_number) {
            throw new Error("بيانات الكلمة غير مكتملة (الكلمة أو السورة أو رقم الآية مفقود)");
          }

          // Determine effective difficulty level first, as it affects fetching behavior
          const effectiveDifficultyLevel = wordData.difficulty_level || "مبتدئ";

          // Find ayah data needed for context snippet, juz number, and LLM prompt
          let containingAyahForLLM = null;
          // Fetch ayah if context_snippet is missing, juz_number is missing, or if difficulty is advanced (to ensure full ayah text)
          if (!wordData.juz_number || !wordData.context_snippet || effectiveDifficultyLevel === 'متقدم') {
              const ayahs = await base44.entities.QuranAyah.filter({
                  surah_name: wordData.surah_name,
                  ayah_number: wordData.ayah_number
              });
              containingAyahForLLM = ayahs.find(a =>
                  a.ayah_text_simple && removeArabicDiacritics(a.ayah_text_simple).includes(removeArabicDiacritics(wordData.word))
              ) || ayahs[0]; // Fallback to the first ayah found if exact word match isn't found
          }

          let llmResponse = {};
          // Only invoke LLM if meaning is empty OR category/root/context/example/reflection/alternative_meanings are empty.
          const shouldInvokeLLM = !(
            wordData.meaning &&
            wordData.category &&
            wordData.root &&
            wordData.context_snippet &&
            wordData.example_usage &&
            wordData.reflection_question &&
            wordData.reflection_answer &&
            wordData.alternative_meanings
          );

          if (shouldInvokeLLM) { // Only invoke LLM if we need to fill *any* of the LLM-fillable fields
            const prompt = `أنت خبير في معاني كلمات القرآن الكريم. أريدك أن تُنشئ بيانات تعليمية شاملة عن الكلمة القرآنية التالية للمستوى ${effectiveDifficultyLevel}:

**الكلمة:** ${wordData.word}
**السورة:** ${wordData.surah_name}
**المستوى:** ${effectiveDifficultyLevel}
**الآية رقم:** ${wordData.ayah_number}
${containingAyahForLLM ? `**الآية الكاملة:** ${containingAyahForLLM.ayah_text}` : ''}

**مهم جداً للمستوى المتقدم:**
- في حقل "context_snippet": ضع **نص الآية الكاملة فقط** بدون أي شرح أو تفسير
- مثال: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ" وليس "وَأَمَّا مَنْ أَعْطَىٰ وَاتَّقَىٰ (الليل: 5) فمقتضى الآية هنا..."

يرجى تقديم:
1. معنى الكلمة بشكل ${effectiveDifficultyLevel === 'مبتدئ' ? 'مبسط جداً ومناسب للأطفال' : effectiveDifficultyLevel === 'متوسط' ? 'واضح' : 'متقدم مع التحليل اللغوي'}
2. تصنيف الكلمة (مثال: أسماء، أفعال، حروف، صفات، أخرى)
3. جذر الكلمة (إن وجد، وإذا كان المستوى "مبتدئ" فاجعله فارغاً)
4. جزء من الآية يحتوي على الكلمة ويوضح سياقها (إذا كان المعنى يكتمل بجزء من الآية، وإلا فالآية كاملة. للمستوى "متقدم"، يجب أن يكون هذا الحقل هو نص الآية الكاملة فقط، مثل: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ")
5. مثال من القرآن أو جملة توضح استخدام الكلمة
6. سؤال تأملي
7. إجابة مختصرة للسؤال التأملي
8. معانٍ بديلة (إن وجدت، يجب أن تكون قائمة (array) من 2-4 معانٍ)
`;

            llmResponse = await base44.integrations.Core.InvokeLLM({
              prompt: prompt,
              response_json_schema: {
                type: "object",
                properties: {
                  meaning: { type: "string" },
                  category: { type: "string", enum: ["أسماء", "أفعال", "صفات", "حروف", "أخرى"] },
                  root: { type: "string" },
                  context_snippet: { type: "string" },
                  example_usage: { type: "string" },
                  reflection_question: { type: "string" },
                  reflection_answer: { type: "string" },
                  alternative_meanings: { type: "array", items: { type: "string" } }
                }
              }
            });
          }

          const alternativeMeaningsArrayFromFile = wordData.alternative_meanings
            ? wordData.alternative_meanings.split(',').map(m => m.trim()).filter(m => m)
            : [];
          const alternativeMeaningsArray = alternativeMeaningsArrayFromFile.length > 0
            ? alternativeMeaningsArrayFromFile
            : (llmResponse.alternative_meanings || []);

          const newWord = {
            word: wordData.word,
            meaning: wordData.meaning || llmResponse.meaning || "",
            alternative_meanings: alternativeMeaningsArray,
            // Context snippet priority: from file, then LLM, then full ayah text if available and appropriate
            context_snippet: wordData.context_snippet ||
                             ((effectiveDifficultyLevel === 'متقدم' && containingAyahForLLM) ? containingAyahForLLM.ayah_text : (llmResponse.context_snippet || "")) ||
                             (containingAyahForLLM ? containingAyahForLLM.ayah_text : ""),
            surah_name: wordData.surah_name,
            ayah_number: wordData.ayah_number,
            juz_number: wordData.juz_number || (containingAyahForLLM ? containingAyahForLLM.juz_number : 1), // Default to 1 if not provided, or use from found ayah
            difficulty_level: effectiveDifficultyLevel, // Default to "مبتدئ"
            category: wordData.category || llmResponse.category || "أخرى", // Default
            root: (effectiveDifficultyLevel === 'مبتدئ' ? "" : (wordData.root || llmResponse.root || "")), // Root empty for مبتدئ
            example_usage: wordData.example_usage || llmResponse.example_usage || "", // Default
            reflection_question: wordData.reflection_question || llmResponse.reflection_question || "", // Default
            reflection_answer: wordData.reflection_answer || llmResponse.reflection_answer || "", // Default
            image_url: wordData.image_url || "",
            audio_url: wordData.audio_url || "",
            youtube_url: wordData.youtube_url || ""
          };
          generatedWords.push(newWord);

          setProgress(30 + Math.round((i + 1) / words.length * 60));

        } catch (error) {
          console.error(`[pages/GenerateWords.js] Error processing word ${words[i]?.word}:`, error);
          processingErrors.push({
            word: words[i]?.word || "غير معروف",
            error: error.message || "فشل معالجة الكلمة"
          });
        }
      }

      setProgress(95);

      if (generatedWords.length > 0) {
        await base44.entities.QuranicWord.bulkCreate(generatedWords);
      }

      setProgress(100);
      setProcessedWords(generatedWords);
      setErrors(processingErrors);

      toast({
        title: "✅ تم التوليد بنجاح!",
        description: `تم توليد ${generatedWords.length} كلمة بنجاح`,
        className: "bg-green-100 text-green-800"
      });

    } catch (error) {
      console.error("[pages/GenerateWords.js] Error processing file:", error);
      toast({
        title: "❌ خطأ",
        description: error.message || "حدث خطأ أثناء معالجة الملف",
        variant: "destructive"
      });
      setErrors([{ word: "عام", error: error.message || "خطأ غير متوقع أثناء معالجة الملف" }]);
    } finally {
      setIsProcessing(false);
      setSelectedFile(null); // Clear selected file after processing
    }
  };

  const generateSmartWords = async () => {
    if (smartForm.source_type === 'juz' && smartForm.selected_juz.length === 0) {
      toast({
        title: "⚠️ بيانات ناقصة",
        description: "يرجى اختيار جزء واحد على الأقل للمتابعة.",
        variant: "destructive"
      });
      return;
    }

    if (smartForm.source_type === 'surah' && smartForm.selected_surahs.length === 0) {
      toast({
        title: "⚠️ بيانات ناقصة",
        description: "يرجى اختيار سورة واحدة على الأقل للمتابعة.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentWordCount(0);
    setProcessedWords([]);
    setErrors([]);

    try {
      setProgress(10);

      const allAyahs = await base44.entities.QuranAyah.list();

      let filteredAyahs = [];
      if (smartForm.source_type === 'juz') {
        filteredAyahs = allAyahs.filter(ayah => smartForm.selected_juz.includes(ayah.juz_number));

        // If specific surahs are also selected within the chosen juzes
        if (smartForm.selected_surahs.length > 0) {
          filteredAyahs = filteredAyahs.filter(ayah => smartForm.selected_surahs.includes(ayah.surah_name));
        }
      } else { // source_type === 'surah'
        filteredAyahs = allAyahs.filter(ayah => smartForm.selected_surahs.includes(ayah.surah_name));
      }

      if (filteredAyahs.length === 0) {
        throw new Error("لم يتم العثور على آيات مطابقة لاختياراتك. يرجى تعديل التحديد.");
      }

      setProgress(20);

      const wordsSet = new Set();
      filteredAyahs.forEach(ayah => {
        // Simple split, filter for words longer than 2 chars to avoid common prepositions/particles
        const words = (ayah.ayah_text_simple || "").split(/\s+/).filter(w => w && w.length > 2);
        words.forEach(word => wordsSet.add(word));
      });

      const existingWords = await base44.entities.QuranicWord.list();
      const existingWordsSet = new Set(existingWords.map(w => removeArabicDiacritics(w.word)));

      const wordsToGenerate = Array.from(wordsSet).filter(word => !existingWordsSet.has(removeArabicDiacritics(word)));

      if (wordsToGenerate.length === 0) {
        toast({
          title: "معلومة",
          description: "جميع الكلمات المطابقة لاختيارك موجودة بالفعل في قاعدة البيانات!",
          className: "bg-blue-100 text-blue-800"
        });
        setIsProcessing(false);
        return; // Exit early if no new words to generate
      }

      setTotalWordsToProcess(wordsToGenerate.length);
      setProgress(30);

      const generatedWords = [];
      const processingErrors = [];

      for (let i = 0; i < wordsToGenerate.length; i++) {
        try {
          const word = wordsToGenerate[i];
          setCurrentWordCount(i + 1);

          // Find an ayah containing the word from the filtered set to provide context to the LLM
          const containingAyah = filteredAyahs.find(a => (a.ayah_text_simple || "").includes(word));

          if (!containingAyah) {
            // This case should ideally not happen if words are extracted from filteredAyahs
            // but adding a check for robustness
            processingErrors.push({
              word: word,
              error: "لم يتم العثور على سياق الآية للكلمة."
            });
            continue;
          }

          const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `أنت خبير في اللغة العربية والقرآن الكريم. أريد معلومات تفصيلية عن الكلمة القرآنية التالية للمستوى ${smartForm.difficulty_level}:

الكلمة: ${word}
من سورة: ${containingAyah.surah_name}
الآية رقم: ${containingAyah.ayah_number}
**الآية الكاملة:** ${containingAyah.ayah_text}

يرجى تقديم:
1. معنى الكلمة بشكل ${smartForm.difficulty_level === 'مبتدئ' ? 'مبسط جداً ومناسب للأطفال' : smartForm.difficulty_level === 'متوسط' ? 'واضح' : 'متقدم مع التحليل اللغوي'}
2. تصنيف الكلمة (مثال: أسماء، أفعال، حروف، صفات، أخرى)
3. جذر الكلمة (إن وجد، وإذا كان المستوى "مبتدئ" فاجعله فارغاً)
4. جزء من الآية يحتوي على الكلمة ويوضح سياقها (إذا كان المعنى يكتمل بجزء من الآية، وإلا فالآية كاملة. للمستوى "متقدم"، يجب أن يكون هذا الحقل هو نص الآية الكاملة فقط، مثل: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ")
5. مثال من القرآن أو جملة توضح استخدام الكلمة
6. سؤال تأملي
7. إجابة مختصرة للسؤال التأملي
8. معانٍ بديلة (إن وجدت، يجب أن تكون قائمة (array) من 2-4 معانٍ)
`,
            response_json_schema: {
              type: "object",
              properties: {
                meaning: { type: "string" },
                category: { type: "string", enum: ["أسماء", "أفعال", "صفات", "حروف", "أخرى"] },
                root: { type: "string" },
                context_snippet: { type: "string" },
                example_usage: { type: "string" },
                reflection_question: { type: "string" },
                reflection_answer: { type: "string" },
                alternative_meanings: { type: "array", items: { type: "string" } }
              },
              required: ["meaning", "category"] // Ensure basic fields are returned
            }
          });

          const newWord = {
            word,
            meaning: llmResponse.meaning,
            alternative_meanings: llmResponse.alternative_meanings || [],
            // For 'متقدم', ensure context_snippet is the full ayah_text as per prompt instruction
            context_snippet: smartForm.difficulty_level === 'متقدم' ? containingAyah.ayah_text : (llmResponse.context_snippet || ""),
            surah_name: containingAyah.surah_name,
            ayah_number: containingAyah.ayah_number,
            juz_number: containingAyah.juz_number,
            difficulty_level: smartForm.difficulty_level,
            category: llmResponse.category || "أخرى",
            root: smartForm.difficulty_level === 'مبتدئ' ? "" : (llmResponse.root || ""), // Root empty for مبتدئ
            example_usage: llmResponse.example_usage || "",
            reflection_question: llmResponse.reflection_question || "",
            reflection_answer: llmResponse.reflection_answer || ""
          };

          generatedWords.push(newWord);
          setProgress(30 + Math.round((i + 1) / wordsToGenerate.length * 60));

        } catch (error) {
          console.error(`[pages/GenerateWords.js] Error processing word ${wordsToGenerate[i]}:`, error);
          processingErrors.push({
            word: wordsToGenerate[i],
            error: error.message || "فشل معالجة الكلمة بواسطة الذكاء الاصطناعي."
          });
        }
      }

      setProgress(95);

      if (generatedWords.length > 0) {
        await base44.entities.QuranicWord.bulkCreate(generatedWords);
      }

      setProgress(100);
      setProcessedWords(generatedWords);
      setErrors(processingErrors);

      toast({
        title: "✅ تم التوليد الذكي بنجاح!",
        description: `تم توليد ${generatedWords.length} كلمة جديدة بالذكاء الاصطناعي. ${processingErrors.length > 0 ? `مع ${processingErrors.length} أخطاء.` : ''}`,
        className: "bg-green-100 text-green-800"
      });

    } catch (error) {
      console.error("[pages/GenerateWords.js] Error in smart generation:", error);
      toast({
        title: "❌ خطأ",
        description: error.message || "حدث خطأ أثناء التوليد الذكي. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      setErrors([{ word: "عام", error: error.message || "خطأ غير متوقع أثناء التوليد الذكي" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSingleWord = async () => {
    if (!manualForm.word || !manualForm.surah_name || !manualForm.ayah_number) {
      toast({
        title: "⚠️ بيانات ناقصة",
        description: "يرجى ملء حقول (الكلمة، اسم السورة، ورقم الآية) المطلوبة للمتابعة.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Find the ayah containing the word for accurate context
      const ayahs = await base44.entities.QuranAyah.filter({
        surah_name: manualForm.surah_name,
        ayah_number: parseInt(manualForm.ayah_number)
      });
      
      const ayahContainingWord = ayahs.find(a =>
        a.ayah_text_simple && removeArabicDiacritics(a.ayah_text_simple).includes(removeArabicDiacritics(manualForm.word))
      );

      if (!ayahContainingWord) {
        toast({
          title: "تحذير",
          description: `لم يتم العثور على الكلمة "${manualForm.word}" في آية ${manualForm.ayah_number} من سورة ${manualForm.surah_name}. سيتم إنشاء البيانات بدون سياق الآية.`,
          variant: "destructive"
        });
      }

      let llmResponse = {};
      // Only invoke LLM if meaning, category, root, context, example, reflection, or alternative_meanings are empty
      const shouldInvokeLLM = !(
        manualForm.meaning.trim() &&
        manualForm.category.trim() &&
        manualForm.root.trim() &&
        manualForm.context_snippet.trim() &&
        manualForm.example_usage.trim() &&
        manualForm.reflection_question.trim() &&
        manualForm.reflection_answer.trim() &&
        manualForm.alternative_meanings.trim()
      );

      if (shouldInvokeLLM) {
        const prompt = `أنت خبير في معاني كلمات القرآن الكريم. أريدك أن تُنشئ بيانات تعليمية شاملة عن الكلمة القرآنية التالية:

**الكلمة:** ${manualForm.word}
**السورة:** ${manualForm.surah_name}
**المستوى:** ${manualForm.difficulty_level}
${ayahContainingWord ? `**الآية:** ${ayahContainingWord.ayah_text} (آية ${ayahContainingWord.ayah_number})` : ''}

**مهم جداً للمستوى المتقدم:**
- في حقل "context_snippet": ضع **نص الآية الكاملة فقط** بدون أي شرح أو تفسير
- مثال: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ" وليس "وَأَمَّا مَنْ أَعْطَىٰ وَاتَّقَىٰ (الليل: 5) فمقتضى الآية هنا..."

**إرشادات حسب المستوى:**

- **مبتدئ:** معاني بسيطة جداً، بدون جذور أو تحليل لغوي، مناسبة للأطفال
- **متوسط:** معاني واضحة ومختصرة، جذر بسيط، سياق مبسط
- **متقدم:** معاني عميقة، تحليل لغوي، جذر مفصل، معانٍ بديلة متعددة

**المطلوب:**
أنشئ JSON كامل يحتوي على **جميع** هذه الحقول:

{
  "word": "الكلمة بالضبط كما وردت",
  "meaning": "المعنى الرئيسي المناسب للمستوى ${manualForm.difficulty_level}",
  "alternative_meanings": ["معنى بديل 1", "معنى بديل 2", "معنى بديل 3"],
  "context_snippet": "${manualForm.difficulty_level === 'متقدم' && ayahContainingWord ? ayahContainingWord.ayah_text : 'نص الآية الكاملة فقط - بدون شرح أو تحليل حسب مستوى الصعوبة'}",
  "surah_name": "${manualForm.surah_name}",
  "ayah_number": ${ayahContainingWord ? ayahContainingWord.ayah_number : parseInt(manualForm.ayah_number)},
  "juz_number": ${ayahContainingWord ? ayahContainingWord.juz_number : (parseInt(manualForm.juz_number) || 1)},
  "difficulty_level": "${manualForm.difficulty_level}",
  "category": "اختر من: أسماء، أفعال، صفات، حروف، أخرى",
  "root": "${manualForm.difficulty_level === 'مبتدئ' ? '' : 'الجذر الثلاثي أو الرباعي'}",
  "example_usage": "جملة توضح استخدام الكلمة في سياق آخر",
  "reflection_question": "سؤال يدفع للتأمل في معنى الكلمة",
  "reflection_answer": "إجابة مختصرة للسؤال"
}

**ملاحظات:**
- **context_snippet** للمستوى المتقدم يجب أن يكون **نص الآية فقط** (مثل: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ")
- "alternative_meanings" يجب أن تكون قائمة (array) من 2-4 معانٍ بديلة
- إذا كان المستوى "مبتدئ"، اجعل "root" فارغاً
- "reflection_question" و "reflection_answer" يجب أن يتناسبا مع المستوى

أرجع فقط JSON بدون أي نص إضافي.
`;
        llmResponse = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              word: { type: "string" },
              meaning: { type: "string" },
              alternative_meanings: {
                type: "array",
                items: { type: "string" }
              },
              context_snippet: { type: "string" },
              surah_name: { type: "string" },
              ayah_number: { type: "integer" },
              juz_number: { type: "integer" },
              difficulty_level: { type: "string" },
              category: { type: "string", enum: ["أسماء", "أفعال", "صفات", "حروف", "أخرى"] },
              root: { type: "string" },
              example_usage: { type: "string" },
              reflection_question: { type: "string" },
              reflection_answer: { type: "string" }
            },
            required: ["word", "meaning"]
          }
        });
      }

      const altMeaningsArray = manualForm.alternative_meanings
        ? manualForm.alternative_meanings.split(',').map(m => m.trim()).filter(m => m)
        : (llmResponse.alternative_meanings || []);

      const newWord = {
        word: manualForm.word,
        meaning: manualForm.meaning || llmResponse.meaning || "",
        alternative_meanings: altMeaningsArray,
        context_snippet: manualForm.context_snippet || ((manualForm.difficulty_level === 'متقدم' && ayahContainingWord) ? ayahContainingWord.ayah_text : (llmResponse.context_snippet || "")),
        surah_name: manualForm.surah_name,
        ayah_number: parseInt(manualForm.ayah_number),
        juz_number: parseInt(manualForm.juz_number) || (ayahContainingWord ? ayahContainingWord.juz_number : 1), // Use found ayah juz_number if available
        difficulty_level: manualForm.difficulty_level,
        category: manualForm.category || llmResponse.category || "أخرى",
        root: (manualForm.difficulty_level === 'مبتدئ' ? "" : (manualForm.root || llmResponse.root || "")), // Root empty for مبتدئ
        example_usage: manualForm.example_usage || llmResponse.example_usage || "",
        reflection_question: manualForm.reflection_question || llmResponse.reflection_question || "",
        reflection_answer: manualForm.reflection_answer || llmResponse.reflection_answer || "",
        image_url: manualForm.image_url || "",
        audio_url: manualForm.audio_url || "",
        youtube_url: manualForm.youtube_url || ""
      };

      await base44.entities.QuranicWord.create(newWord);

      toast({
        title: "✅ تم الإنشاء!",
        description: `تم إنشاء كلمة "${manualForm.word}" بنجاح.`,
        className: "bg-green-100 text-green-800"
      });

      // Clear form after successful creation
      setManualForm({
        word: "",
        surah_name: "",
        ayah_number: "",
        juz_number: "",
        difficulty_level: "مبتدئ",
        meaning: "",
        category: "أخرى",
        root: "",
        context_snippet: "",
        example_usage: "",
        image_url: "",
        audio_url: "",
        youtube_url: "",
        reflection_question: "",
        reflection_answer: "",
        alternative_meanings: ""
      });

    } catch (error) {
      console.error("[pages/GenerateWords.js] Error generating word:", error);
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل إنشاء الكلمة. يرجى التحقق من المدخلات والمحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // NEW: Batch processing function
  const processBatchWords = async () => {
    if (!batchForm.batch_text.trim()) {
      toast({
        title: "⚠️ لا يوجد نص",
        description: "يرجى لصق الكلمات بالتنسيق المطلوب.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentWordCount(0);
    setProcessedWords([]);
    setErrors([]);

    try {
      const lines = batchForm.batch_text.trim().split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error("لم يتم العثور على أي كلمات في النص الملصق.");
      }

      setTotalWordsToProcess(lines.length);
      setProgress(10);

      const generatedWords = [];
      const processingErrors = [];

      for (let i = 0; i < lines.length; i++) {
        try {
          setCurrentWordCount(i + 1);

          let word, meaning = "", surah_name_raw, effective_difficulty_level = batchForm.difficulty_level;

          const tokens = lines[i].split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p);

          if (tokens.length < 2) {
            throw new Error(`السطر ${i+1}: يجب أن يحتوي كل سطر على الكلمة والسورة على الأقل، مفصولين بمسافات أو Tab.`);
          }

          word = tokens[0];

          let potentialSurahIndex = -1;
          let potentialDifficultyIndex = -1;

          // Check last token for difficulty
          if (["مبتدئ", "متوسط", "متقدم"].includes(tokens[tokens.length - 1])) {
            effective_difficulty_level = tokens[tokens.length - 1];
            potentialDifficultyIndex = tokens.length - 1;
          }

          // Check second to last token for surah if difficulty was last, or last for surah if no difficulty
          if (potentialDifficultyIndex !== -1 && tokens.length > 2) { // Difficulty found, look for surah before it
            potentialSurahIndex = tokens.length - 2;
          } else if (potentialDifficultyIndex === -1 && tokens.length > 1) { // No difficulty, last token is surah
            potentialSurahIndex = tokens.length - 1;
          }

          if (potentialSurahIndex !== -1) {
            surah_name_raw = tokens[potentialSurahIndex];
            // Meaning is everything between word and surah/difficulty
            meaning = tokens.slice(1, potentialSurahIndex).join(' ');
          } else {
            // This case might happen if only word and difficulty are given, but not surah.
            // But validation already ensures at least 2 tokens (word and surah).
            throw new Error(`السطر ${i+1}: لم يتم تحديد اسم السورة بشكل صحيح.`);
          }

          // Normalize surah name by removing diacritics and matching against the known list
          const cleanSurahInput = removeArabicDiacritics(surah_name_raw);
          const matchingSurah = SURAHS.find(s => removeArabicDiacritics(s) === cleanSurahInput);

          if (!matchingSurah) {
            throw new Error(`السطر ${i+1}: اسم السورة "${surah_name_raw}" غير صحيح. تأكد من كتابة الاسم بدون تشكيل أو أخطاء إملائية. الأسماء المتاحة مثل: ${SURAHS.slice(0, 5).join('، ')}...`);
          }

          // Use the correct surah name from SURAHS list for consistency
          const correctSurahName = matchingSurah;

          // Normalize word for search (remove diacritics and Alif Wasla)
          const cleanWord = removeArabicDiacritics(word);

          // ✅ استخدام $ilike للبحث في قاعدة البيانات مباشرة
          const ayahsContainingWord = await base44.entities.QuranAyah.filter({
            surah_name: correctSurahName,
            ayah_text_simple: { '$ilike': `%${cleanWord}%` }
          });

          if (!ayahsContainingWord || ayahsContainingWord.length === 0) {
            throw new Error(`السطر ${i+1}: لم يتم العثور على الكلمة "${word}" في سورة "${correctSurahName}". تأكد من كتابة الكلمة بشكل صحيح ووجودها في الآيات المستوردة (من صفحة استيراد القرآن).`);
          }

          const matchingAyah = ayahsContainingWord[0]; // Take the first matching ayah
          const ayah_number = matchingAyah.ayah_number;
          const juz_number = matchingAyah.juz_number;

          // Generate details with LLM
          const llmPrompt = `أنت خبير في معاني كلمات القرآن الكريم. أريدك أن تُنشئ بيانات تعليمية شاملة عن الكلمة القرآنية التالية للمستوى ${effective_difficulty_level}:

**الكلمة:** ${word}
**السورة:** ${correctSurahName}
**المستوى:** ${effective_difficulty_level}
**الآية:** ${matchingAyah.ayah_text} (آية ${ayah_number})

${meaning.trim() ? `**المعنى المدخل:** ${meaning}` : ''}

**مهم جداً للمستوى المتقدم:**
- في حقل "context_snippet": ضع **نص الآية الكاملة فقط** بدون أي شرح أو تفسير
- مثال: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ" وليس "وَأَمَّا مَنْ أَعْطَىٰ وَاتَّقَىٰ (الليل: 5) فمقتضى الآية..."

**إرشادات حسب المستوى:**
- **مبتدئ:** معاني بسيطة جداً، بدون جذور أو تحليل لغوي، مناسبة للأطفال
- **متوسط:** معاني واضحة ومختصرة، جذر بسيط، سياق مبسط
- **متقدم:** معاني عميقة، تحليل لغوي، جذر مفصل، معانٍ بديلة متعددة

**المطلوب:**
أنشئ JSON كامل يحتوي على **جميع** هذه الحقول:

{
  "word": "الكلمة بالضبط كما وردت",
  "meaning": "المعنى الرئيسي المناسب للمستوى ${effective_difficulty_level}",
  "alternative_meanings": ["معنى بديل 1", "معنى بديل 2", "معنى بديل 3"],
  "context_snippet": "${effective_difficulty_level === 'متقدم' ? matchingAyah.ayah_text : 'نص الآية الكاملة فقط - بدون شرح أو تحليل حسب مستوى الصعوبة'}",
  "surah_name": "${correctSurahName}",
  "ayah_number": ${ayah_number},
  "juz_number": ${juz_number},
  "difficulty_level": "${effective_difficulty_level}",
  "category": "اختر من: أسماء، أفعال، صفات، حروف، أخرى",
  "root": "${effective_difficulty_level === 'مبتدئ' ? '' : 'الجذر الثلاثي أو الرباعي'}",
  "example_usage": "جملة توضح استخدام الكلمة في سياق آخر",
  "reflection_question": "سؤال يدفع للتأمل في معنى الكلمة",
  "reflection_answer": "إجابة مختصرة للسؤال"
}

**ملاحظات:**
- **context_snippet** للمستوى المتقدم يجب أن يكون **نص الآية فقط** (مثل: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ")
- "alternative_meanings" يجب أن تكون قائمة (array) من 2-4 معانٍ بديلة
- إذا كان المستوى "مبتدئ"، اجعل "root" فارغاً
- "reflection_question" و "reflection_answer" يجب أن يتناسبا مع المستوى

أرجع فقط JSON بدون أي نص إضافي.
`;

          const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: llmPrompt,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                word: { type: "string" },
                meaning: { type: "string" },
                alternative_meanings: {
                  type: "array",
                  items: { type: "string" }
                },
                context_snippet: { type: "string" },
                surah_name: { type: "string" },
                ayah_number: { type: "integer" },
                juz_number: { type: "integer" },
                difficulty_level: { type: "string" },
                category: { type: "string", enum: ["أسماء", "أفعال", "صفات", "حروف", "أخرى"] },
                root: { type: "string" },
                example_usage: { type: "string" },
                reflection_question: { type: "string" },
                reflection_answer: { type: "string" }
              },
              required: ["word", "meaning"]
            }
          });

          const newWord = {
            word: word,
            meaning: meaning.trim() || llmResponse.meaning,
            alternative_meanings: llmResponse.alternative_meanings || [],
            context_snippet: effective_difficulty_level === 'متقدم' ? matchingAyah.ayah_text : (llmResponse.context_snippet || matchingAyah.ayah_text || ""),
            surah_name: correctSurahName,
            ayah_number: ayah_number,
            juz_number: juz_number,
            difficulty_level: effective_difficulty_level,
            category: llmResponse.category || "أخرى",
            root: (effective_difficulty_level === 'مبتدئ' ? "" : (llmResponse.root || "")),
            example_usage: llmResponse.example_usage || "",
            reflection_question: llmResponse.reflection_question || "",
            reflection_answer: llmResponse.reflection_answer || "",
            image_url: "",
            audio_url: "",
            youtube_url: ""
          };

          await base44.entities.QuranicWord.create(newWord);
          generatedWords.push(newWord);

          setProgress(10 + Math.round((i + 1) / lines.length * 85));

        } catch (error) {
          console.error(`[pages/GenerateWords.js] Error processing line ${i + 1} (${lines[i]}):`, error);
          processingErrors.push({
            word: lines[i],
            error: error.message || "خطأ في معالجة هذا السطر"
          });
        }
      }

      setProgress(100);
      setProcessedWords(generatedWords);
      setErrors(processingErrors);

      toast({
        title: "✅ تم التوليد!",
        description: `تم توليد ${generatedWords.length} كلمة بنجاح${processingErrors.length > 0 ? ` مع ${processingErrors.length} أخطاء` : ''}.`,
        className: "bg-green-100 text-green-800"
      });

      // Clear form on success
      if (processingErrors.length === 0) {
        setBatchForm({
          batch_text: "",
          difficulty_level: "مبتدئ"
        });
      }

    } catch (error) {
      console.error("[pages/GenerateWords.js] Error in batch processing:", error);
      toast({
        title: "❌ خطأ",
        description: error.message || "حدث خطأ أثناء معالجة الدفعة.",
        variant: "destructive"
      });
      setErrors([{ word: "عام", error: error.message || "خطأ غير متوقع" }]);
    } finally {
      setIsProcessing(false);
    }
  };


  const handleJuzSelection = (juz) => {
    const juzNum = parseInt(juz);
    setSmartForm(prev => ({
      ...prev,
      selected_juz: prev.selected_juz.includes(juzNum)
        ? prev.selected_juz.filter(j => j !== juzNum)
        : [...prev.selected_juz, juzNum]
    }));
  };

  const handleSurahSelection = (surah) => {
    setSmartForm(prev => ({
      ...prev,
      selected_surahs: prev.selected_surahs.includes(surah)
        ? prev.selected_surahs.filter(s => s !== surah)
        : [...prev.selected_surahs, surah]
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl text-primary-foreground/70 mr-4">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTriangle className="w-5 h-5" />
          <AlertDescription className="text-lg">
            <strong>⛔ غير مصرح</strong><br />
            هذه الصفحة متاحة للمسؤولين فقط. يرجى تسجيل الدخول بحساب مسؤول.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Determine available surahs based on selected juz for filtering in the UI
  const availableSurahsInJuz = smartForm.selected_juz.length > 0
    ? Array.from(new Set(
        smartForm.selected_juz.flatMap(juz => JUZ_SURAHS[juz] || [])
      )).sort((a, b) => SURAHS.indexOf(a) - SURAHS.indexOf(b)) // Sort by general surah order
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">⚡ توليد الكلمات بالذكاء الاصطناعي</h1>
            <p className="text-foreground/70">توليد ذكي، رفع ملف، أو إدخال يدوي للكلمات القرآنية ومعانيها</p>
          </div>
        </div>

        <Tabs defaultValue="batch" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="smart">
              <Wand2 className="w-4 h-4 ml-2" />
              توليد ذكي كامل
            </TabsTrigger>
            <TabsTrigger value="batch">
              <PlusCircle className="w-4 h-4 ml-2" />
              إدخال دفعة
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload className="w-4 h-4 ml-2" />
              رفع ملف
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Brain className="w-4 h-4 ml-2" />
              إدخال يدوي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  🤖 توليد ذكي بالكامل - حدد الأجزاء أو السور
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <AlertDescription className="text-purple-800 dark:text-purple-300">
                    <strong>💡 كيف يعمل:</strong><br/>
                    1. اختر الأجزاء أو السور التي تريد توليد الكلمات منها.<br/>
                    2. حدد مستوى الصعوبة المطلوب للمعاني والتفاصيل.<br/>
                    3. اضغط "ابدأ" - سيقوم الذكاء الاصطناعي بتوليد معلومات <strong>لكل الكلمات الفريدة</strong> في الآيات المختارة.<br/>
                    4. سيتم تجاهل الكلمات الموجودة مسبقاً في قاعدة البيانات تلقائياً لمنع التكرار.
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="text-sm font-medium mb-3 block">تحديد مصدر الكلمات:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={smartForm.source_type === 'juz' ? 'default' : 'outline'}
                      onClick={() => setSmartForm({...smartForm, source_type: 'juz', selected_surahs: []})}
                      className="h-16"
                    >
                      📚 حسب الأجزاء
                    </Button>
                    <Button
                      variant={smartForm.source_type === 'surah' ? 'default' : 'outline'}
                      onClick={() => setSmartForm({...smartForm, source_type: 'surah', selected_juz: []})}
                      className="h-16"
                    >
                      📖 حسب السور
                    </Button>
                  </div>
                </div>

                {smartForm.source_type === 'juz' && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">اختر الأجزاء القرآنية:</label>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {Array.from({length: 30}, (_, i) => i + 1).map(juz => (
                        <Button
                          key={juz}
                          variant={smartForm.selected_juz.includes(juz) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleJuzSelection(juz)}
                          className="h-12 font-bold"
                        >
                          {juz}
                        </Button>
                      ))}
                    </div>

                    {smartForm.selected_juz.length > 0 && availableSurahsInJuz.length > 0 && (
                      <div className="mt-6">
                        <label className="text-sm font-medium mb-3 block">
                          📝 (اختياري) تحديد سور معينة ضمن الأجزاء المختارة:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                          {availableSurahsInJuz.map((surah) => (
                            <Button
                              key={surah}
                              variant={smartForm.selected_surahs.includes(surah) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSurahSelection(surah)}
                              className="justify-start text-sm h-10"
                            >
                              {SURAHS.indexOf(surah) + 1}. {surah}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {smartForm.source_type === 'surah' && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">اختر السور القرآنية:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                      {SURAHS.map((surah, index) => (
                        <Button
                          key={surah}
                          variant={smartForm.selected_surahs.includes(surah) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSurahSelection(surah)}
                          className="justify-start text-sm h-10"
                        >
                          {index + 1}. {surah}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">مستوى الصعوبة لتوليد المعاني:</label>
                  <Select
                    value={smartForm.difficulty_level}
                    onValueChange={(value) => setSmartForm({...smartForm, difficulty_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مبتدئ">مبتدئ (مبسط جداً ومناسب للأطفال)</SelectItem>
                      <SelectItem value="متوسط">متوسط (معاني واضحة ومختصرة)</SelectItem>
                      <SelectItem value="متقدم">متقدم (معاني عميقة وتحليل لغوي)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generateSmartWords}
                  disabled={isProcessing || (smartForm.source_type === 'juz' && smartForm.selected_juz.length === 0) || (smartForm.source_type === 'surah' && smartForm.selected_surahs.length === 0)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جارٍ التوليد الذكي...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 ml-2" />
                      🚀 ابدأ التوليد الذكي
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  إدخال دفعة من الكلمات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <strong>📋 كيفية الاستخدام:</strong><br/>
                    الصق كلماتك بأحد التنسيقات التالية (كل كلمة في سطر):<br/>
                    <code className="block mt-2 p-2 bg-white dark:bg-blue-950 rounded text-sm">
                      الكلمة  السورة<br/>
                      الكلمة  المعنى  السورة<br/>
                      الكلمة  المعنى  السورة  المستوى
                    </code>
                    <br/>
                    💡 استخدم Tab أو عدة مسافات (حرفان فأكثر) للفصل بين الأعمدة.<br/>
                    ⚠️ تأكد من استيراد آيات القرآن من صفحة "استيراد القرآن" أولاً.
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="text-sm font-medium mb-2 block">الصق الكلمات هنا</label>
                  <Textarea
                    value={batchForm.batch_text}
                    onChange={(e) => setBatchForm({...batchForm, batch_text: e.target.value})}
                    placeholder={"رحمة  البقرة\nهدى  الهداية والإرشاد  البقرة\nصبر  الصبر والتحمل  البقرة  متوسط"}
                    rows={10}
                    className="font-mono text-sm"
                    dir="rtl"
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    عدد الأسطر: {batchForm.batch_text.trim() ? batchForm.batch_text.trim().split('\n').filter(line => line.trim()).length : 0}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">مستوى الصعوبة الافتراضي</label>
                  <Select
                    value={batchForm.difficulty_level}
                    onValueChange={(value) => setBatchForm({...batchForm, difficulty_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="متقدم">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-foreground/60 mt-1">
                    سيُطبق على السطور التي لا تحدد مستوى.
                  </p>
                </div>

                <Button
                  onClick={processBatchWords}
                  disabled={isProcessing || !batchForm.batch_text.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جارٍ المعالجة...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 ml-2" />
                      ابدأ توليد الدفعة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  رفع ملف Excel أو CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <strong>📋 تنسيق الملف المطلوب (CSV أو Excel):</strong>
                    <ul className="list-disc mr-6 mt-2 space-y-1">
                      <li><code>word</code> (الكلمة) - <strong>مطلوب</strong></li>
                      <li><code>surah_name</code> (اسم السورة) - <strong>مطلوب</strong></li>
                      <li><code>ayah_number</code> (رقم الآية) - <strong>مطلوب</strong></li>
                      <li><code>juz_number</code> (رقم الجزء) - <em>اختياري</em></li>
                      <li><code>difficulty_level</code> (مستوى الصعوبة) - <em>اختياري</em></li>
                      <li><code>meaning</code> (المعنى) - <em>اختياري.</em> إذا كان فارغاً، سيتم توليده بواسطة الذكاء الاصطناعي.</li>
                      <li><code>context_snippet</code> (سياق الآية) - <em>اختياري.</em> جزء من الآية يوضح سياق الكلمة.</li>
                      <li><code>category</code> (التصنيف) - <em>اختياري.</em></li>
                      <li><code>root</code> (الجذر) - <em>اختياري.</em></li>
                      <li><code>example_usage</code> (مثال الاستخدام) - <em>اختياري.</em></li>
                      <li><code>reflection_question</code> (سؤال تأملي) - <em>اختياري.</em></li>
                      <li><code>reflection_answer</code> (إجابة تأملية) - <em>اختياري.</em></li>
                      <li><code>alternative_meanings</code> (معانٍ بديلة، مفصولة بفاصلة) - <em>اختياري.</em></li>
                      <li><code>image_url</code> (رابط الصورة) - <em>اختياري.</em></li>
                      <li><code>audio_url</code> (رابط الملف الصوتي) - <em>اختياري.</em></li>
                      <li><code>youtube_url</code> (رابط فيديو يوتيوب) - <em>اختياري.</em></li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground/70 mb-4">
                    اسحب الملف هنا أو اضغط للاختيار
                  </p>
                  <p className="text-xs text-foreground/50 mb-4">
                    الملفات المدعومة: .csv, .xlsx, .xls
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild variant="outline">
                      <span>اختر ملف</span>
                    </Button>
                  </label>
                </div>

                {selectedFile && (
                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      <strong>✅ تم اختيار الملف:</strong> {selectedFile.name}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={processFileAndGenerate}
                  disabled={!selectedFile || isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جارٍ المعالجة...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 ml-2" />
                      ابدأ التوليد من الملف
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  إضافة كلمة يدوياً (جميع الحقول)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">الكلمة *</label>
                    <Input
                      value={manualForm.word}
                      onChange={(e) => setManualForm({...manualForm, word: e.target.value})}
                      placeholder="مثال: رحمة"
                      className="text-lg arabic-font"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">اسم السورة *</label>
                    <Select
                      value={manualForm.surah_name}
                      onValueChange={(value) => setManualForm({...manualForm, surah_name: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر السورة" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto">
                        {SURAHS.map((surah, idx) => (
                          <SelectItem key={idx} value={surah}>
                            {idx + 1}. {surah}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">رقم الآية *</label>
                    <Input
                      type="number"
                      value={manualForm.ayah_number}
                      onChange={(e) => setManualForm({...manualForm, ayah_number: e.target.value})}
                      placeholder="مثال: 157"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">رقم الجزء</label>
                    <Input
                      type="number"
                      value={manualForm.juz_number}
                      onChange={(e) => setManualForm({...manualForm, juz_number: e.target.value})}
                      placeholder="مثال: 2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">مستوى الصعوبة</label>
                    <Select
                      value={manualForm.difficulty_level}
                      onValueChange={(value) => setManualForm({...manualForm, difficulty_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="متقدم">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">التصنيف</label>
                    <Select
                      value={manualForm.category}
                      onValueChange={(value) => setManualForm({...manualForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="أسماء">أسماء</SelectItem>
                        <SelectItem value="أفعال">أفعال</SelectItem>
                        <SelectItem value="صفات">صفات</SelectItem>
                        <SelectItem value="حروف">حروف</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">المعنى</label>
                  <Textarea
                    value={manualForm.meaning}
                    onChange={(e) => setManualForm({...manualForm, meaning: e.target.value})}
                    placeholder="إذا تركته فارغاً، سيتم توليده بالذكاء الاصطناعي"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">الجذر</label>
                  <Input
                    value={manualForm.root}
                    onChange={(e) => setManualForm({...manualForm, root: e.target.value})}
                    placeholder="مثال: رحم"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">سياق الآية</label>
                  <Textarea
                    value={manualForm.context_snippet}
                    onChange={(e) => setManualForm({...manualForm, context_snippet: e.target.value})}
                    placeholder="جزء من الآية يحتوي على الكلمة"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">مثال الاستخدام</label>
                  <Textarea
                    value={manualForm.example_usage}
                    onChange={(e) => setManualForm({...manualForm, example_usage: e.target.value})}
                    placeholder="مثال لاستخدام الكلمة في جملة"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">رابط الصورة</label>
                  <div className="flex gap-2">
                    <Input
                      value={manualForm.image_url}
                      onChange={(e) => setManualForm({...manualForm, image_url: e.target.value})}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openImageGallery("manual")}
                    >
                      <ImageIcon className="w-4 h-4 ml-1" />
                      اختر من المعرض
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">رابط الملف الصوتي</label>
                  <Input
                    value={manualForm.audio_url}
                    onChange={(e) => setManualForm({...manualForm, audio_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">رابط فيديو يوتيوب</label>
                  <Input
                    value={manualForm.youtube_url}
                    onChange={(e) => setManualForm({...manualForm, youtube_url: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">سؤال تأملي</label>
                  <Textarea
                    value={manualForm.reflection_question}
                    onChange={(e) => setManualForm({...manualForm, reflection_question: e.target.value})}
                    placeholder="سؤال يحفز التفكير حول معنى الكلمة"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">إجابة السؤال التأملي</label>
                  <Textarea
                    value={manualForm.reflection_answer}
                    onChange={(e) => setManualForm({...manualForm, reflection_answer: e.target.value})}
                    placeholder="إجابة مختصرة للسؤال التأملي"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">معانٍ بديلة (مفصولة بفاصلة)</label>
                  <Textarea
                    value={manualForm.alternative_meanings}
                    onChange={(e) => setManualForm({...manualForm, alternative_meanings: e.target.value})}
                    placeholder="معنى 1, معنى 2, معنى 3"
                    rows={2}
                  />
                </div>

                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-300">
                    💡 الحقول الفارغة (المعنى، التصنيف، الجذر، السياق، مثال الاستخدام، السؤال التأملي، الإجابة التأملية، المعاني البديلة) سيتم توليدها تلقائياً بواسطة الذكاء الاصطناعي. الروابط يجب إدخالها يدوياً.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={generateSingleWord}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جارٍ التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      توليد وإضافة الكلمة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AnimatePresence>
          {isProcessing && progress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 mt-6">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 dark:text-blue-300 font-semibold">
                        جارٍ المعالجة...
                      </span>
                      <span className="text-blue-600 font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                      {progress < 20 && "📤 تحضير البيانات ورفع الملف..."}
                      {progress >= 20 && progress < 30 && "📄 استخراج الكلمات من المصدر..."}
                      {progress >= 30 && progress < 95 && `🤖 توليد المعاني والتفاصيل بالذكاء الاصطناعي (${currentWordCount} / ${totalWordsToProcess} كلمة)...`}
                      {progress >= 95 && progress < 100 && "💾 حفظ الكلمات في قاعدة البيانات..."}
                      {progress === 100 && "✅ تم الانتهاء من المعالجة!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {processedWords.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                الكلمات التي تم توليدها بنجاح ({processedWords.length} كلمة)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {processedWords.map((word, index) => (
                  <div key={index} className="p-4 bg-background-soft rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-foreground arabic-font">{word.word}</h4>
                        <p className="text-sm text-primary mt-1">{word.meaning}</p>
                        {word.context_snippet && (
                            <p className="text-xs text-foreground/60 mt-1">
                                سياق: "{word.context_snippet}"
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">{word.surah_name}</Badge>
                          <Badge variant="secondary">الآية {word.ayah_number}</Badge>
                          {word.juz_number && <Badge variant="secondary">الجزء {word.juz_number}</Badge>}
                          <Badge className="bg-primary/10 text-primary">{word.category}</Badge>
                          <Badge variant="outline">{word.difficulty_level}</Badge>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {errors.length > 0 && (
          <Card className="mt-6 bg-red-50 dark:bg-red-900/20 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                أخطاء واجهت المعالجة ({errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-red-900/30 rounded border border-red-300">
                    <p className="font-semibold text-red-800 dark:text-red-300">الكلمة/السطر: {error.word}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">تفاصيل الخطأ: {error.error}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Image Gallery Modal */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>اختر صورة من المعرض</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {galleryImages.map((img) => (
              <motion.div
                key={img.id}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer border-2 border-transparent hover:border-primary rounded-lg overflow-hidden"
                onClick={() => selectImageFromGallery(img.url)}
              >
                <img
                  src={img.url}
                  alt={img.title || "صورة"}
                  className="w-full h-40 object-cover"
                />
                {img.title && (
                  <div className="p-2 bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium truncate">{img.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GenerateWords;
