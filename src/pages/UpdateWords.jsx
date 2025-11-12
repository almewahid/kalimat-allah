import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";

function removeArabicDiacritics(text) {
  return text.replace(/[\u064B-\u0652\u0670]/g, "");
}

export default function UpdateWords() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [processedWords, setProcessedWords] = useState(0);
  const [results, setResults] = useState({ success: 0, failed: 0, skipped: 0 });
  const [logs, setLogs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const updateAllWords = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, skipped: 0 });
    setLogs([]);
    setIsComplete(false);

    addLog("🚀 بدء عملية تحديث الكلمات...", "info");

    try {
      // Get all words
      const allWords = await base44.entities.QuranicWord.list();
      setTotalWords(allWords.length);
      addLog(`📚 تم العثور على ${allWords.length} كلمة في قاعدة البيانات`, "info");

      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < allWords.length; i++) {
        const word = allWords[i];
        setProcessedWords(i + 1);
        setProgress(((i + 1) / allWords.length) * 100);

        try {
          // Check what fields are missing
          const missingFields = [];
          
          if (!word.meaning) missingFields.push('meaning');
          if (!word.category) missingFields.push('category');
          if (!word.root && word.difficulty_level !== 'مبتدئ') missingFields.push('root');
          if (!word.context_snippet) missingFields.push('context_snippet');
          if (!word.example_usage) missingFields.push('example_usage');
          if (!word.reflection_question) missingFields.push('reflection_question');
          if (!word.reflection_answer) missingFields.push('reflection_answer');
          if (!word.alternative_meanings || word.alternative_meanings.length === 0) missingFields.push('alternative_meanings');

          // Skip if no missing fields
          if (missingFields.length === 0) {
            skippedCount++;
            addLog(`⏭️ تم تخطي "${word.word}" - البيانات مكتملة`, "skip");
            continue;
          }

          addLog(`🔄 تحديث "${word.word}" - حقول ناقصة: ${missingFields.join(', ')}`, "info");

          // Find ayah if context_snippet is missing or difficulty is advanced
          let containingAyah = null;
          if (!word.context_snippet || word.difficulty_level === 'متقدم') {
            const ayahs = await base44.entities.QuranAyah.filter({
              surah_name: word.surah_name,
              ayah_number: word.ayah_number
            });
            containingAyah = ayahs.find(a =>
              a.ayah_text_simple && removeArabicDiacritics(a.ayah_text_simple).includes(removeArabicDiacritics(word.word))
            );
          }

          // Prepare LLM prompt
          const prompt = `أنت خبير في معاني كلمات القرآن الكريم. أريدك أن تُنشئ بيانات تعليمية شاملة عن الكلمة القرآنية التالية للمستوى ${word.difficulty_level || 'متوسط'}:

**الكلمة:** ${word.word}
**السورة:** ${word.surah_name}
**المستوى:** ${word.difficulty_level || 'متوسط'}
**الآية رقم:** ${word.ayah_number}
${containingAyah ? `**الآية الكاملة:** ${containingAyah.ayah_text}` : ''}

**مهم جداً للمستوى المتقدم:**
- في حقل "context_snippet": ضع **نص الآية الكاملة فقط** بدون أي شرح أو تفسير
- مثال: "وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ" وليس "وَأَمَّا مَنْ أَعْطَىٰ وَاتَّقَىٰ (الليل: 5) فمقتضى الآية..."

يرجى تقديم البيانات التالية (فقط الحقول الناقصة: ${missingFields.join(', ')}):
1. معنى الكلمة بشكل ${word.difficulty_level === 'مبتدئ' ? 'مبسط جداً ومناسب للأطفال' : word.difficulty_level === 'متوسط' ? 'واضح' : 'متقدم مع التحليل اللغوي'}
2. تصنيف الكلمة (مثال: أسماء، أفعال، حروف، صفات، أخرى)
3. جذر الكلمة (إن وجد، وإذا كان المستوى "مبتدئ" فاجعله فارغاً)
4. جزء من الآية يحتوي على الكلمة ويوضح سياقها (للمستوى "متقدم"، يجب أن يكون نص الآية الكاملة فقط)
5. مثال من القرآن أو جملة توضح استخدام الكلمة
6. سؤال تأملي
7. إجابة مختصرة للسؤال التأملي
8. معانٍ بديلة (إن وجدت، يجب أن تكون قائمة من 2-4 معانٍ)`;

          // Call LLM
          const llmResponse = await base44.integrations.Core.InvokeLLM({
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

          // Prepare update data
          const updateData = {};
          
          if (!word.meaning && llmResponse.meaning) updateData.meaning = llmResponse.meaning;
          if (!word.category && llmResponse.category) updateData.category = llmResponse.category;
          if (!word.root && word.difficulty_level !== 'مبتدئ' && llmResponse.root) updateData.root = llmResponse.root;
          if (!word.example_usage && llmResponse.example_usage) updateData.example_usage = llmResponse.example_usage;
          if (!word.reflection_question && llmResponse.reflection_question) updateData.reflection_question = llmResponse.reflection_question;
          if (!word.reflection_answer && llmResponse.reflection_answer) updateData.reflection_answer = llmResponse.reflection_answer;
          
          // Handle context_snippet
          if (!word.context_snippet) {
            if (word.difficulty_level === 'متقدم' && containingAyah) {
              updateData.context_snippet = containingAyah.ayah_text;
            } else if (llmResponse.context_snippet) {
              updateData.context_snippet = llmResponse.context_snippet;
            }
          }
          
          // Handle alternative_meanings
          if ((!word.alternative_meanings || word.alternative_meanings.length === 0) && llmResponse.alternative_meanings) {
            updateData.alternative_meanings = llmResponse.alternative_meanings;
          }

          // Update word
          if (Object.keys(updateData).length > 0) {
            await base44.entities.QuranicWord.update(word.id, updateData);
            successCount++;
            addLog(`✅ تم تحديث "${word.word}" بنجاح - ${Object.keys(updateData).length} حقل`, "success");
          } else {
            skippedCount++;
            addLog(`⏭️ تم تخطي "${word.word}" - لا توجد بيانات للتحديث`, "skip");
          }

        } catch (error) {
          failedCount++;
          addLog(`❌ فشل تحديث "${word.word}": ${error.message}`, "error");
          console.error(`Error updating word ${word.word}:`, error);
        }

        // Update results
        setResults({ success: successCount, failed: failedCount, skipped: skippedCount });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setIsComplete(true);
      addLog(`🎉 اكتملت عملية التحديث! نجح: ${successCount}, فشل: ${failedCount}, تم تخطيه: ${skippedCount}`, "success");

    } catch (error) {
      addLog(`❌ خطأ عام: ${error.message}`, "error");
      console.error("Error in update process:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <RefreshCw className="w-6 h-6" />
            تحديث بيانات الكلمات
          </CardTitle>
          <p className="text-foreground/70">
            هذه الأداة تقوم بتحديث الحقول الناقصة في جدول QuranicWord باستخدام الذكاء الاصطناعي
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Control Panel */}
          <div className="flex gap-4">
            <Button
              onClick={updateAllWords}
              disabled={isProcessing}
              size="lg"
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جارٍ التحديث...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 ml-2" />
                  بدء تحديث جميع الكلمات
                </>
              )}
            </Button>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم: {processedWords} / {totalWords}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {/* Results Summary */}
          {(isProcessing || isComplete) && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{results.success}</div>
                  <div className="text-sm text-green-600">نجح</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-900/20">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-red-600">فشل</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-900/20">
                <CardContent className="pt-6 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-600">{results.skipped}</div>
                  <div className="text-sm text-gray-600">تم تخطيه</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">سجل العمليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${
                        log.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900/20' :
                        log.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20' :
                        log.type === 'skip' ? 'bg-gray-50 text-gray-800 dark:bg-gray-900/20' :
                        'bg-blue-50 text-blue-800 dark:bg-blue-900/20'
                      }`}
                    >
                      <span className="text-xs opacity-70 ml-2">{log.timestamp}</span>
                      {log.message}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              <strong>ملاحظة:</strong> هذه العملية قد تستغرق وقتاً طويلاً حسب عدد الكلمات. 
              يتم تحديث الحقول الناقصة فقط في كل كلمة. الكلمات المكتملة يتم تخطيها تلقائياً.
              <br />
              <strong>للمستوى المتقدم:</strong> يتم وضع نص الآية الكاملة في حقل context_snippet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}