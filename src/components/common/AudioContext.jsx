import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

// ✅ دالة تنظيف النص العربي
const normalizeArabicText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[\u0670]/g, '')
    .replace(/[\u0600-\u061C]/g, '')
    .replace(/[\u06D6-\u06FF]/g, '')
    .replace(/\u0640/g, '')
    .replace(/ٱ/g, 'ا')
    .replace(/أ/g, 'ا')
    .replace(/إ/g, 'ا')
    .replace(/آ/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0600-\u06FF\s]/g, '')
    .trim();
};

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentType, setCurrentType] = useState(null); // 'ayah' | 'word' | 'meaning'
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(1);

  // ✅ 1. تلاوة الآية
  const playAyah = useCallback(async (surahNumber, ayahNumber, wordData) => {
    if (!surahNumber || !ayahNumber) {
      setError('❌ معلومات الآية غير متوفرة');
      return;
    }

    console.log(`[AudioContext] 🎵 Playing ayah: ${surahNumber}:${ayahNumber}`);

    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      const sources = [
        `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`,
        `https://verses.quran.com/${surahNumber}_${ayahNumber}.mp3`,
        `https://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/${surahNumber}:${ayahNumber}`
      ];

      let played = false;

      for (let i = 0; i < sources.length; i++) {
        console.log(`[AudioContext] 🔗 Trying source ${i + 1}`);
        
        try {
          audioRef.current.src = sources[i];
          audioRef.current.volume = volume;
          await audioRef.current.play();
          
          setIsPlaying(true);
          setCurrentWord(wordData);
          setCurrentType('ayah');
          setError(null);
          
          console.log(`[AudioContext] ✅ Playing from source ${i + 1}`);
          played = true;
          break;
        } catch (err) {
          console.log(`[AudioContext] ⚠️ Source ${i + 1} failed`);
          if (i === sources.length - 1) {
            setError('❌ فشل تشغيل الصوت من جميع المصادر');
          }
        }
      }

    } catch (err) {
      console.error('[AudioContext] Error:', err);
      setError('⚠️ حدث خطأ أثناء تشغيل الصوت');
    }
  }, [volume]);

  // ✅ 2. نطق الكلمة
  const playWord = useCallback(async (surahNumber, ayahNumber, word, wordData) => {
    if (!surahNumber || !ayahNumber || !word) {
      setError('❌ معلومات الكلمة غير متوفرة');
      return;
    }

    console.log(`[AudioContext] 🔵 Fetching word audio: ${surahNumber}:${ayahNumber}`);

    try {
      const response = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?words=true&word_fields=text_uthmani,audio_url`
      );

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      const words = data.verse?.words || [];

      console.log(`[AudioContext] 📊 Words from API: ${words.length}`);

      const normalizedTarget = normalizeArabicText(word);
      let matchingWord = null;

      for (const w of words) {
        const normalizedAPIWord = normalizeArabicText(w.text_uthmani);
        if (normalizedAPIWord === normalizedTarget) {
          matchingWord = w;
          break;
        }
      }

      if (!matchingWord) {
        for (const w of words) {
          const normalizedAPIWord = normalizeArabicText(w.text_uthmani);
          if (normalizedAPIWord.includes(normalizedTarget) || normalizedTarget.includes(normalizedAPIWord)) {
            matchingWord = w;
            break;
          }
        }
      }

      if (matchingWord?.audio_url) {
        let fullAudioUrl = matchingWord.audio_url;
        if (!fullAudioUrl.startsWith('http')) {
          fullAudioUrl = `https://audio.qurancdn.com/${fullAudioUrl}`;
        }

        console.log('[AudioContext] ✅ Found word audio');

        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = fullAudioUrl;
        audioRef.current.volume = volume;
        await audioRef.current.play();

        setIsPlaying(true);
        setCurrentWord(wordData || { word, surah_number: surahNumber, ayah_number: ayahNumber });
        setCurrentType('word');
        setError(null);
      } else {
        console.log('[AudioContext] ⚠️ Word audio not found, falling back to ayah');
        playAyah(surahNumber, ayahNumber, wordData);
      }
    } catch (error) {
      console.error('[AudioContext] Error:', error);
      setError('❌ فشل تحميل صوت الكلمة');
    }
  }, [volume, playAyah]);

  // ✅ 3. TTS للمعنى
  const playMeaning = useCallback((meaningText) => {
    if (!('speechSynthesis' in window)) {
      setError('❌ TTS غير مدعوم في هذا المتصفح');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(meaningText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.pitch = 0.7;
    utterance.volume = volume;

    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(voice =>
      voice.lang.startsWith('ar') &&
      (voice.name.toLowerCase().includes('male') || voice.name.includes('Majed'))
    );

    if (maleVoice) {
      utterance.voice = maleVoice;
    } else {
      const anyArabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
      if (anyArabicVoice) {
        utterance.voice = anyArabicVoice;
        utterance.pitch = 0.5;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentType('meaning');
      setError(null);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [volume]);

  // ✅ التحكم بالتشغيل
  const pause = useCallback(() => {
    if (currentType === 'meaning') {
      window.speechSynthesis.cancel();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, [currentType]);

  const resume = useCallback(() => {
    if (currentType !== 'meaning' && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentType]);

  const stop = useCallback(() => {
    if (currentType === 'meaning') {
      window.speechSynthesis.cancel();
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentWord(null);
    setCurrentType(null);
  }, [currentType]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  }, []);

  // ✅ مراقبة انتهاء الصوت
  React.useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      setError('⚠️ حدث خطأ أثناء تشغيل الصوت');
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const value = {
    isPlaying,
    currentWord,
    currentType,
    error,
    volume,
    playAyah,
    playWord,
    playMeaning,
    pause,
    resume,
    stop,
    changeVolume,
    clearError: () => setError(null)
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};