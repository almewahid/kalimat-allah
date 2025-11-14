import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Pause, Play, X, Volume1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from './AudioContext';

export default function GlobalAudioPlayer() {
  const {
    isPlaying,
    currentWord,
    currentType,
    error,
    volume,
    pause,
    resume,
    stop,
    changeVolume,
    clearError
  } = useAudio();

  // إذا لم يكن هناك صوت يشتغل أو كلمة حالية، لا نعرض شيء
  if (!currentWord && !error) return null;

  const getTypeLabel = () => {
    switch (currentType) {
      case 'ayah':
        return '🟢 تلاوة الآية';
      case 'word':
        return '🔵 نطق الكلمة';
      case 'meaning':
        return '🟣 نطق المعنى';
      default:
        return '🎵 صوت';
    }
  };

  const getTypeColor = () => {
    switch (currentType) {
      case 'ayah':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500';
      case 'word':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      case 'meaning':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-500';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 border-gray-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <Card className={`max-w-4xl mx-auto border-2 ${getTypeColor()} shadow-2xl backdrop-blur-sm`}>
          <CardContent className="p-4">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg flex items-center justify-between"
              >
                <span className="text-red-800 dark:text-red-300 text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <Button
                size="icon"
                onClick={isPlaying ? pause : resume}
                className="flex-shrink-0"
                disabled={currentType === 'meaning' && !isPlaying}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* Word Info */}
              <div className="flex-1 min-w-0">
                {currentWord && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel()}
                      </Badge>
                      {currentWord.surah_name && (
                        <Badge variant="outline" className="text-xs">
                          {currentWord.surah_name} - آية {currentWord.ayah_number}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary arabic-font truncate">
                      {currentWord.word || 'جاري التشغيل...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-foreground/70" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5 text-foreground/70" />
                ) : (
                  <Volume2 className="w-5 h-5 text-foreground/70" />
                )}
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => changeVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={stop}
                className="flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}