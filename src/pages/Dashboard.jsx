import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        setUserProgress(progressSnap.data());
      } else {
        setUserProgress({
          userId: user.uid,
          total_xp: 0,
          current_level: 1,
          words_learned: 0,
          quiz_streak: 0,
          consecutive_login_days: 1
        });
      }
    } catch (error) {
      console.error('خطأ:', error);
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

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>مرحباً، {user?.displayName || user?.email} 👋</h1>

      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '30px', 
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <h2>المستوى {userProgress?.current_level || 1} 🏆</h2>
        <p>{userProgress?.total_xp || 0} XP</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '10px' }}>
          <h3>{userProgress?.words_learned || 0}</h3>
          <p>كلمة متعلمة 📚</p>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '10px' }}>
          <h3>{userProgress?.quiz_streak || 0}</h3>
          <p>سلسلة 🔥</p>
        </div>

        <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '10px' }}>
          <h3>{userProgress?.consecutive_login_days || 1}</h3>
          <p>أيام 📅</p>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        style={{
          padding: '12px 30px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        تسجيل الخروج
      </button>
    </div>
  );
}
