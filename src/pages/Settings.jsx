import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { User as UserIcon, Palette, Bell, Shield, HelpCircle, Globe, Volume2, Sparkles, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

export default function Settings() {
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState({
        sound_effects_enabled: true,
        animations_enabled: true,
        confetti_enabled: true,
        theme: 'light',
        color_scheme: 'default',
        background_style: 'soft',
        learning_level: 'متوسط',
        learning_categories: [],
        daily_new_words_goal: 10,
        daily_review_words_goal: 20,
        source_type: 'all',
        selected_juz: [],
        selected_surahs: [],
        language: 'ar',
        word_card_elements: [
          {id: "meaning", label: "المعنى", visible: true, order: 0},
          {id: "alternative_meanings", label: "معانٍ بديلة", visible: true, order: 1},
          {id: "root", label: "الجذر", visible: true, order: 2},
          {id: "context", label: "السياق القرآني", visible: true, order: 3},
          {id: "example", label: "مثال الاستخدام", visible: true, order: 4},
          {id: "reflection", label: "سؤال للتفكير", visible: true, order: 5},
          {id: "similar_words", label: "كلمات مشابهة", visible: true, order: 6},
          {id: "learning_history", label: "تاريخ التعلم", visible: false, order: 7},
          {id: "image", label: "صورة توضيحية", visible: true, order: 8},
          {id: "note", label: "ملاحظتك", visible: true, order: 9}
        ]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('account');

    // Get current language
    const lang = preferences.language || 'ar';
    const isArabic = lang === 'ar';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                if (currentUser.preferences) {
                    const fetchedPreferences = currentUser.preferences;
                    const defaultWordCardElements = preferences.word_card_elements;
                    
                    const mergedWordCardElements = defaultWordCardElements.map(defaultEl => {
                        const existingEl = fetchedPreferences.word_card_elements?.find(el => el.id === defaultEl.id);
                        return existingEl ? { ...defaultEl, ...existingEl } : defaultEl;
                    });

                    const newElements = fetchedPreferences.word_card_elements
                        ?.filter(el => !defaultWordCardElements.some(defaultEl => defaultEl.id === el.id)) || [];

                    const finalWordCardElements = [...mergedWordCardElements, ...newElements].sort((a, b) => a.order - b.order);

                    setPreferences(prev => ({
                        ...prev,
                        ...fetchedPreferences,
                        word_card_elements: finalWordCardElements
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleJuzSelection = (juz) => {
        const juzNumber = parseInt(juz);
        setPreferences(prev => ({
            ...prev,
            selected_juz: prev.selected_juz.includes(juzNumber)
                ? prev.selected_juz.filter(j => j !== juzNumber)
                : [...prev.selected_juz, juzNumber]
        }));
    };

    const handleSurahSelection = (surah) => {
        setPreferences(prev => ({
            ...prev,
            selected_surahs: prev.selected_surahs.includes(surah)
                ? prev.selected_surahs.filter(s => s !== surah)
                : [...prev.selected_surahs, surah]
        }));
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        try {
            await base44.auth.updateMe({ preferences });
            
            toast({
                title: isArabic ? "تم الحفظ!" : "Saved!",
                description: isArabic ? "تم حفظ تفضيلاتك بنجاح." : "Your preferences have been saved successfully.",
                className: "bg-green-100 text-green-800"
            });
            
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            console.error("Failed to save preferences:", error);
            toast({
                title: isArabic ? "خطأ" : "Error",
                description: isArabic ? "لم يتم حفظ التفضيلات. حاول مرة أخرى." : "Failed to save preferences. Try again.",
                variant: "destructive"
            });
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(preferences.word_card_elements);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        handlePreferenceChange('word_card_elements', updatedItems);
    };

    const toggleElementVisibility = (id) => {
        const updatedElements = preferences.word_card_elements.map(el =>
            el.id === id ? { ...el, visible: !el.visible } : el
        );
        handlePreferenceChange('word_card_elements', updatedElements);
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return (
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="fullName">{isArabic ? "الاسم الكامل" : "Full Name"}</Label>
                            <Input id="fullName" value={user?.full_name || ''} disabled />
                        </div>
                        <div>
                            <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
                            <Input id="email" type="email" value={user?.email || ''} disabled />
                        </div>
                         <CardDescription>
                            {isArabic 
                                ? "لا يمكن تعديل معلومات الحساب الأساسية من هنا. تتم إدارتها عبر منصة base44."
                                : "Basic account information cannot be edited here. It is managed through the base44 platform."
                            }
                        </CardDescription>
                    </CardContent>
                );
            
            case 'appearance':
                return (
                    <CardContent className="space-y-6">
                        {/* Language Selection */}
                        <div>
                            <Label className="flex items-center gap-2 text-lg font-semibold">
                                <Globe className="w-5 h-5" />
                                {isArabic ? "🌍 اللغة" : "🌍 Language"}
                            </Label>
                            <p className="text-xs text-foreground/70 mb-3">
                                {isArabic ? "اختر لغة التطبيق (سيتم إعادة تحميل الصفحة)" : "Choose app language (page will reload)"}
                            </p>
                            <Select
                                value={preferences.language}
                                onValueChange={(value) => handlePreferenceChange('language', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ar">
                                        <span className="flex items-center gap-2">
                                            🇸🇦 العربية
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="en">
                                        <span className="flex items-center gap-2">
                                            🇺🇸 English
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-6"></div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                                <span>{isArabic ? "الوضع الليلي" : "Dark Mode"}</span>
                                <span className="text-xs font-normal leading-snug text-muted-foreground">
                                    {isArabic 
                                        ? "لتغيير مظهر التطبيق إلى داكن أو فاتح."
                                        : "Switch between dark and light theme."
                                    }
                                </span>
                            </Label>
                            <Switch
                                id="dark-mode"
                                checked={preferences.theme === 'dark'}
                                onCheckedChange={(checked) => handlePreferenceChange('theme', checked ? 'dark' : 'light')}
                            />
                        </div>

                        {/* Color Scheme */}
                        <div>
                            <Label>{isArabic ? "نظام الألوان" : "Color Scheme"}</Label>
                            <p className="text-xs text-foreground/70 mb-3">
                                {isArabic ? "اختر اللون الرئيسي للتطبيق" : "Choose the primary color for the app"}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'default', label: 'زمردي', labelEn: 'Emerald', preview: 'bg-emerald-600' },
                                    { value: 'blue', label: 'أزرق', labelEn: 'Blue', preview: 'bg-blue-500' },
                                    { value: 'purple', label: 'بنفسجي', labelEn: 'Purple', preview: 'bg-purple-600' },
                                    { value: 'orange', label: 'برتقالي', labelEn: 'Orange', preview: 'bg-orange-500' }
                                ].map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => handlePreferenceChange('color_scheme', option.value)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            preferences.color_scheme === option.value
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full ${option.preview} mb-2`}></div>
                                        <p className="font-medium text-sm">{isArabic ? option.label : option.labelEn}</p>
                                        {preferences.color_scheme === option.value && (
                                            <p className="text-xs text-primary mt-1">
                                                ✓ {isArabic ? "محدد" : "Selected"}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Effects & Animations */}
                        <div className="border-t pt-6">
                            <Label className="flex items-center gap-2 text-lg font-semibold mb-4">
                                <Sparkles className="w-5 h-5" />
                                {isArabic ? "✨ التأثيرات والرسوم المتحركة" : "✨ Effects & Animations"}
                            </Label>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-background-soft rounded-lg">
                                    <Label htmlFor="sound-effects" className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2">
                                            <Volume2 className="w-4 h-4" />
                                            {isArabic ? "المؤثرات الصوتية" : "Sound Effects"}
                                        </span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {isArabic 
                                                ? "تشغيل الأصوات عند الإجابة الصحيحة/الخاطئة"
                                                : "Play sounds on correct/wrong answers"
                                            }
                                        </span>
                                    </Label>
                                    <Switch
                                        id="sound-effects"
                                        checked={preferences.sound_effects_enabled}
                                        onCheckedChange={(checked) => handlePreferenceChange('sound_effects_enabled', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-background-soft rounded-lg">
                                    <Label htmlFor="confetti" className="flex flex-col gap-1">
                                        <span>🎉 {isArabic ? "احتفالات Confetti" : "Confetti Celebrations"}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {isArabic 
                                                ? "إظهار احتفال عند رفع المستوى أو إنجاز"
                                                : "Show celebration on level up or achievement"
                                            }
                                        </span>
                                    </Label>
                                    <Switch
                                        id="confetti"
                                        checked={preferences.confetti_enabled}
                                        onCheckedChange={(checked) => handlePreferenceChange('confetti_enabled', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-background-soft rounded-lg">
                                    <Label htmlFor="animations" className="flex flex-col gap-1">
                                        <span>🌊 {isArabic ? "تأثير الموجة" : "Wave Effect"}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {isArabic 
                                                ? "إظهار موجة عند الإجابة الصحيحة"
                                                : "Show wave on correct answer"
                                            }
                                        </span>
                                    </Label>
                                    <Switch
                                        id="animations"
                                        checked={preferences.animations_enabled}
                                        onCheckedChange={(checked) => handlePreferenceChange('animations_enabled', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                                💡 {isArabic 
                                    ? "سيتم تطبيق التغييرات بعد حفظها وإعادة تحميل الصفحة."
                                    : "Changes will be applied after saving and reloading the page."
                                }
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                );
            
            case 'learning':
                return (
                    <CardContent className="space-y-6">
                        <div>
                            <Label>{isArabic ? "مستوى الصعوبة" : "Difficulty Level"}</Label>
                            <Select
                                value={preferences.learning_level}
                                onValueChange={(value) => handlePreferenceChange('learning_level', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isArabic ? "اختر المستوى" : "Select Level"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="مبتدئ">
                                        {isArabic ? "مبتدئ (مبسط جدًا ومناسب للأطفال)" : "Beginner (Very simple and suitable for children)"}
                                    </SelectItem>
                                    <SelectItem value="متوسط">
                                        {isArabic ? "متوسط (معاني واضحة ومختصرة)" : "Intermediate (Clear and concise meanings)"}
                                    </SelectItem>
                                    <SelectItem value="متقدم">
                                        {isArabic ? "متقدم (معاني عميقة وتحليل لغوي)" : "Advanced (Deep meanings and linguistic analysis)"}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label>{isArabic ? "هدف الكلمات الجديدة اليومي" : "Daily New Words Goal"}</Label>
                            <Input 
                                type="number" 
                                value={preferences.daily_new_words_goal} 
                                onChange={e => handlePreferenceChange('daily_new_words_goal', parseInt(e.target.value) || 0)} 
                                min="0" 
                            />
                        </div>
                        
                        <div>
                            <Label>{isArabic ? "هدف المراجعة اليومي" : "Daily Review Goal"}</Label>
                            <Input 
                                type="number" 
                                value={preferences.daily_review_words_goal} 
                                onChange={e => handlePreferenceChange('daily_review_words_goal', parseInt(e.target.value) || 0)} 
                                min="0" 
                            />
                        </div>
                    </CardContent>
                );
            
            case 'source':
                return (
                    <CardContent className="space-y-6">
                        <div>
                            <Label>{isArabic ? "مصدر الكلمات" : "Word Source"}</Label>
                            <Select
                                value={preferences.source_type}
                                onValueChange={(value) => handlePreferenceChange('source_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isArabic ? "اختر المصدر" : "Select Source"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isArabic ? "جميع القرآن" : "Entire Quran"}</SelectItem>
                                    <SelectItem value="juz">{isArabic ? "حسب الأجزاء" : "By Juz"}</SelectItem>
                                    <SelectItem value="surah">{isArabic ? "حسب السور" : "By Surah"}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {preferences.source_type === 'juz' && (
                            <div>
                                <Label>{isArabic ? "اختر الأجزاء" : "Select Juz"}</Label>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                                        <Button
                                            key={juz}
                                            variant={preferences.selected_juz.includes(juz) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleJuzSelection(juz)}
                                            className="h-10"
                                        >
                                            {juz}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preferences.source_type === 'surah' && (
                            <div>
                                <Label>{isArabic ? "اختر السور" : "Select Surahs"}</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                                    {SURAHS.map((surah, index) => (
                                        <Button
                                            key={surah}
                                            variant={preferences.selected_surahs.includes(surah) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleSurahSelection(surah)}
                                            className="justify-start text-sm"
                                        >
                                            {index + 1}. {surah}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                );

            case 'card-elements':
                return (
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-lg font-semibold mb-2 block">
                                {isArabic ? "📝 عناصر بطاقة التعلم" : "📝 Learning Card Elements"}
                            </Label>
                            <p className="text-sm text-foreground/70 mb-4">
                                {isArabic 
                                    ? "اسحب لإعادة الترتيب، واضغط على العين لإخفاء/إظهار العنصر"
                                    : "Drag to reorder, click eye icon to show/hide element"
                                }
                            </p>
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="word-card-elements">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2"
                                    >
                                        {preferences.word_card_elements
                                            .slice()
                                            .sort((a, b) => a.order - b.order)
                                            .map((element, index) => (
                                            <Draggable
                                                key={element.id}
                                                draggableId={element.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`
                                                            flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                                                            ${snapshot.isDragging ? 'border-primary bg-primary/10 shadow-lg' : 'border-border bg-background-soft'}
                                                            ${!element.visible ? 'opacity-50' : ''}
                                                            ${isArabic ? 'text-right' : 'text-left'}
                                                        `}
                                                    >
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="cursor-grab active:cursor-grabbing p-1"
                                                        >
                                                            <GripVertical className="w-5 h-5 text-foreground/40" />
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <p className="font-medium">{element.label}</p>
                                                            <p className="text-xs text-foreground/60">
                                                                {isArabic ? `الترتيب: ${index + 1}` : `Order: ${index + 1}`}
                                                            </p>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleElementVisibility(element.id)}
                                                            className={element.visible ? 'text-primary' : 'text-foreground/40'}
                                                        >
                                                            {element.visible ? (
                                                                <Eye className="w-5 h-5" />
                                                            ) : (
                                                                <EyeOff className="w-5 h-5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                                💡 {isArabic 
                                    ? "العناصر المخفية لن تظهر في بطاقات التعلم. يمكنك إعادة ترتيبها وإظهارها في أي وقت."
                                    : "Hidden elements won't appear in learning cards. You can reorder and show them anytime."
                                }
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                );
            
            default:
                return null;
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-primary">جارٍ تحميل الإعدادات...</p>
                </div>
            </div>
        );
    }

    const tabs = [
      { id: 'account', label: isArabic ? 'الحساب' : 'Account', icon: UserIcon },
      { id: 'appearance', label: isArabic ? 'المظهر' : 'Appearance', icon: Palette },
      { id: 'learning', label: isArabic ? 'التعلم' : 'Learning', icon: Bell },
      { id: 'source', label: isArabic ? 'مصدر الكلمات' : 'Word Source', icon: Shield },
      { id: 'card-elements', label: isArabic ? 'عناصر البطاقة' : 'Card Elements', icon: HelpCircle },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold gradient-text mb-8">
                    {isArabic ? "الإعدادات" : "Settings"}
                </h1>
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <div className="flex flex-col space-y-2">
                           {tabs.map(tab => (
                                <Button
                                    key={tab.id}
                                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="justify-start gap-2"
                                >
                                    <tab.icon className="w-4 h-4"/>
                                    {tab.label}
                                </Button>
                           ))}
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
                            </CardHeader>
                            {renderContent()}
                        </Card>
                         <div className="mt-6 flex justify-end">
                            <Button onClick={handleSaveChanges}>
                                {isArabic ? "💾 حفظ التغييرات" : "💾 Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}