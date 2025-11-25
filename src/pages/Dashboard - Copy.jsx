import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userProgress, setUserProgress] = useState(null);
  const [learnedWords, setLearnedWords] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyXPEarned, setDailyXPEarned] = useState(0);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // جلب تقدم المستخدم
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressSnap = await getDoc(progressRef);

      if (!progressSnap.exists()) {
        // إنشاء تقدم جديد
        const newProgress = {
          userId: user.uid,
          total_xp: 0,
          current_level: 1,
          words_learned: 0,
          quiz_streak: 0,
          learned_words: [],
          consecutive_login_days: 1,
          last_login_date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        await setDoc(progressRef, newProgress);
        setUserProgress(newProgress);
      } else {
        const progressData = progressSnap.data();
        
        // تحديث تسجيل الدخول اليومي
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = progressData.last_login_date;
        
        if (lastLogin !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const newConsecutiveDays = lastLogin === yesterdayStr 
            ? (progressData.consecutive_login_days || 0) + 1 
            : 1;
          
          await updateDoc(progressRef, {
            last_login_date: today,
            consecutive_login_days: newConsecutiveDays
          });
          
          setUserProgress({ ...progressData, consecutive_login_days: newConsecutiveDays });
        } else {
          setUserProgress(progressData);
        }
      }

      // جلب الاختبارات الأخيرة
      const quizzesQuery = query(
        collection(db, 'quizSessions'),
        where('userId', '==', user.uid)
      );
      const quizzesSnap = await getDocs(quizzesQuery);
      const quizzes = quizzesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setRecentQuizzes(quizzes);

      // حساب XP اليومي
      const today = new Date().toISOString().split('T')[0];
      const todayQuizzes = quizzes.filter(q => q.createdAt?.startsWith(today));
      const todayXP = todayQuizzes.reduce((sum, q) => sum + (q.xp_earned || 0), 0);
      setDailyXPEarned(todayXP);

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      setError('حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // حساب التقدم نحو المستوى التالي
  const currentLevelXP = userProgress?.total_xp || 0;
  const currentLevel = userProgress?.current_level || 1;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentLevelXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const levelProgress = Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0070f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px', color: '#666' }}>جارٍ تحميل لوحة التحكم...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: '#fee', 
          padding: '30px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#c00', marginBottom: '10px' }}>خطأ في تحميل البيانات</h2>
          <p style={{ color: '#900', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={loadDashboardData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* رسالة ترحيبية */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
          مرحباً، {user?.displayName?.split(' ')[0] || user?.email} 👋
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          استمر في رحلتك لتعلم كلمات القرآن الكريم
        </p>
      </div>

      {/* بطاقة المستوى */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '25px', 
        borderRadius: '12px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>المستوى {currentLevel}</h2>
            <p style={{ color: '#666' }}>{currentLevelXP} XP / {xpForNextLevel} XP</p>
          </div>
          <div style={{ fontSize: '2rem' }}>🏆</div>
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '12px', 
          backgroundColor: '#ddd', 
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${levelProgress}%`, 
            height: '100%', 
            backgroundColor: '#0070f3',
            transition: 'width 0.5s ease'
          }} />
        </div>
        
        <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
          XP اليوم: {dailyXPEarned} نقطة
        </p>
      </div>

      {/* الإحصائيات */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📚</div>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {userProgress?.words_learned || 0}
          </h3>
          <p style={{ color: '#666' }}>كلمة متعلمة</p>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {userProgress?.quiz_streak || 0}
          </h3>
          <p style={{ color: '#666' }}>سلسلة الاختبارات</p>
        </div>

        <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {userProgress?.consecutive_login_days || 1}
          </h3>
          <p style={{ color: '#666' }}>يوم متتالي</p>
        </div>
      </div>

      {/* زر تسجيل الخروج */}
      <button 
        onClick={handleLogout}
        style={{
          padding: '12px 30px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        تسجيل الخروج
      </button>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
