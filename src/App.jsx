import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Phone, Trash2, Check, RefreshCw, AlertTriangle } from 'lucide-react';

// --- Firebase Initialization ---
const fallbackConfig = {
  // ⚠️ שים לב: המפתח כאן כנראה חלקי. 
  // אנא היכנס ל-Firebase Console -> Project settings -> גלול למטה והעתק את ה-apiKey המלא!
  apiKey: "AIzaSyDlutJy-vxBJy8g-C6TM2iFbRmA9I5B5vw", 
  authDomain: "haifasquash-ladder.firebaseapp.com",
  projectId: "haifasquash-ladder",
  storageBucket: "haifasquash-ladder.firebasestorage.app",
  messagingSenderId: "553434079367",
  appId: "1:553434079367:web:0b284761f96b271d261822"
};

// בודק אם אנחנו בסביבת תצוגה מקדימה או בסביבה האמיתית (StackBlitz/Vercel)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : fallbackConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'haifasquash-ladder';

export default function App() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [view, setView] = useState('ladder');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [matchModal, setMatchModal] = useState({ isOpen: false, opponent: null });

  // --- Auth & Initial Data Fetching ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setAuthError(err.message);
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // נתיב מעודכן שעובד גם בסביבת הטסטים וגם באוויר
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      playersData.sort((a, b) => a.rank - b.rank);
      setPlayers(playersData);
      setLoading(false);
      
      const isRegistered = playersData.some(p => p.id === user.uid);
      if (!isRegistered && view !== 'rules' && view !== 'admin') {
        setView('join');
      } else if (isRegistered && view === 'join') {
        setView('ladder');
      }

    }, (error) => {
      console.error("Error fetching players:", error);
      setAuthError(error.message);
      setLoading(false);
    });

    return () => unsubscribePlayers();
  }, [user]);

  // --- Actions ---
  const handleJoin = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;
    
    const newRank = players.length > 0 ? Math.max(...players.map(p => p.rank)) + 1 : 1;
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', user.uid), {
        name,
        phone,
        rank: newRank,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
      setView('ladder');
    } catch (err) {
      console.error("Error joining:", err);
    }
  };

  const submitMatchResult = async (winnerId, loserId) => {
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);

    if (!winner || !loser) return;

    try {
      if (winner.rank > loser.rank) {
        const newWinnerRank = loser.rank;
        const oldWinnerRank = winner.rank;

        for (const p of players) {
          if (p.rank >= newWinnerRank && p.rank < oldWinnerRank) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', p.id), {
              rank: p.rank + 1
            });
          }
        }
        
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', winnerId), {
          rank: newWinnerRank,
          lastActive: new Date().toISOString()
        });
      } else {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', winnerId), {
          lastActive: new Date().toISOString()
        });
      }
      
      setMatchModal({ isOpen: false, opponent: null });
    } catch (err) {
      console.error("Error updating match result:", err);
    }
  };

  const openWhatsApp = (phone, myName) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      finalPhone = '972' + cleanPhone.substring(1);
    }
    const text = encodeURIComponent(`היי! מדבר ${myName} מליגת הסקווש. אני רוצה לאתגר אותך למשחק במסגרת הסולם! מתי נוח לך? 🎾`);
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
    }
  };

  const adminUpdatePlayer = async (playerId, newName, newRank) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId), {
        name: newName,
        rank: parseInt(newRank, 10)
      });
    } catch (err) {
      console.error("Admin update error:", err);
    }
  };

  const adminDeletePlayer = async (playerId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק שחקן זה?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId));
      } catch (err) {
        console.error("Admin delete error:", err);
      }
    }
  };

  // --- Views ---
  const renderLadder = () => {
    const myPlayer = players.find(p => p.id === user?.uid);
    
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">סולם הדירוג - חיפה</h2>
          <p className="text-sm text-slate-500 mt-1">מודל ההחלפה (Leapfrog)</p>
        </div>

        {players.map((player) => {
          const isMe = myPlayer && myPlayer.id === player.id;
          const isChallengeable = myPlayer && !isMe && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3;

          return (
            <div key={player.id} className={`flex items-center justify-between p-4 rounded-xl border ${isMe ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${player.rank === 1 ? 'bg-yellow-100 text-yellow-600' : player.rank === 2 ? 'bg-gray-200 text-gray-600' : player.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                  {player.rank}
                </div>
                <div>
                  <h3 className={`font-semibold ${isMe ? 'text-blue-800' : 'text-slate-800'}`}>{player.name} {isMe && '(את/ה)'}</h3>
                </div>
              </div>

              {isChallengeable && (
                <button 
                  onClick={() => openWhatsApp(player.phone, myPlayer.name)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Phone size={14} />
                  אתגר
                </button>
              )}
              
              {!isMe && myPlayer && (myPlayer.rank - player.rank) <= 3 && myPlayer.rank > player.rank && (
                 <button 
                 onClick={() => setMatchModal({ isOpen: true, opponent: player })}
                 className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-2"
               >
                 עדכן שניצחת
               </button>
              )}
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            אין עדיין שחקנים בליגה. תהיה הראשון להצטרף!
          </div>
        )}
      </div>
    );
  };

  const renderJoin = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto mt-10">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">הצטרף לליגה</h2>
        <p className="text-slate-500 mt-2">הכנס את הפרטים שלך ותתחיל מהמקום האחרון בסולם.</p>
      </div>
      
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
          <input required type="text" name="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="לדוגמה: יונתן כהן" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">מספר טלפון (לוואטסאפ)</label>
          <input required type="tel" name="phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="050-0000000" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4">
          הצטרף עכשיו
        </button>
      </form>
    </div>
  );

  const renderRules = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-slate-700 leading-relaxed" dir="rtl">
      <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
        <BookOpen className="text-blue-600" />
        חוקי הליגה - מודל ההחלפה
      </h2>
      <h3 className="font-bold text-lg mt-4 text-blue-800">1. אתגר שחקנים</h3>
      <ul className="list-disc pr-5 space-y-1">
        <li>ניתן לאתגר שחקנים שמדורגים עד <strong>3 שלבים</strong> מעליך.</li>
        <li>שחקן שאותגר חייב לקבל את האתגר ולשחק תוך 7 ימים.</li>
      </ul>
      <h3 className="font-bold text-lg mt-4 text-blue-800">2. משחקים ותוצאות</h3>
      <ul className="list-disc pr-5 space-y-1">
        <li>המשחקים משוחקים בשיטת "הטוב מ-5".</li>
        <li><strong>ניצחון של מאתגר:</strong> לוקח את המיקום של המפסיד. כל השאר יורדים שלב.</li>
      </ul>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto mt-10 text-center">
          <ShieldCheck size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">כניסת מנהל</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4 mt-4">
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="סיסמת ניהול" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 transition-colors">
              היכנס
            </button>
          </form>
        </div>
      );
    }
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">פאנל ניהול</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3">דירוג</th>
                <th className="p-3">שם שחקן</th>
                <th className="p-3">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b">
                  <td className="p-3"><input type="number" defaultValue={player.rank} onBlur={(e) => adminUpdatePlayer(player.id, player.name, e.target.value)} className="w-16 px-2 py-1 border rounded" /></td>
                  <td className="p-3"><input type="text" defaultValue={player.name} onBlur={(e) => adminUpdatePlayer(player.id, e.target.value, player.rank)} className="w-full px-2 py-1 border rounded" /></td>
                  <td className="p-3"><button onClick={() => adminDeletePlayer(player.id)} className="text-red-500"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Main Layout ---
  if (authError) {
    const isApiKeyError = authError.includes('api-key-not-valid');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6" dir="rtl">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isApiKeyError ? 'מפתח ה-API שגוי או חסר' : 'שגיאת אבטחה בחיבור'}
        </h2>
        <div className="text-slate-600 mb-6 max-w-md">
          {isApiKeyError ? (
            <>
              <p className="mb-2">נראה שמפתח ה-API שהעתקנו קודם חלקי (חסרות בו אותיות).</p>
              <p className="font-bold">מה עליך לעשות כדי לתקן?</p>
              <ol className="list-decimal text-right pr-5 mt-2 space-y-1">
                <li>היכנס לאתר פיירבייס (Firebase Console).</li>
                <li>לחץ על סמל גלגל השיניים ⚙️ ובחר ב-<strong>Project settings</strong>.</li>
                <li>גלול למטה לאזור שנקרא <strong>Your apps</strong>.</li>
                <li>העתק את הערך המלא והארוך שמופיע ליד המילה <code>apiKey</code>.</li>
                <li>הדבק אותו בשורה 10 של הקוד כאן.</li>
              </ol>
            </>
          ) : (
            <p>פיירבייס חוסם את האתר הזה מלהתחבר.</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-slate-500 text-left w-full max-w-md" dir="ltr">
          Error Details: {authError}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500"><RefreshCw className="animate-spin mr-2" /> טוען נתונים...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20" dir="rtl">
      <header className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            <h1 className="text-xl font-bold">ליגת סקווש חיפה</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 mt-4">
        {view === 'join' && renderJoin()}
        {view === 'ladder' && renderLadder()}
        {view === 'rules' && renderRules()}
        {view === 'admin' && renderAdmin()}
      </main>

      {matchModal.isOpen && matchModal.opponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-center mb-4">אישור ניצחון</h3>
            <p className="text-center text-slate-600 mb-6">
              האם אתה מאשר שניצחת את <strong>{matchModal.opponent.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 px-4 py-2 border rounded-lg">ביטול</button>
              <button onClick={() => submitMatchResult(user.uid, matchModal.opponent.id)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"><Check size={18} /> אישור ניצחון</button>
            </div>
          </div>
        </div>
      )}

      {view !== 'join' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          <div className="max-w-2xl mx-auto flex justify-around">
            <button onClick={() => setView('ladder')} className={`flex flex-col items-center py-3 px-6 ${view === 'ladder' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}><Trophy size={20} className="mb-1" /><span className="text-xs">סולם</span></button>
            <button onClick={() => setView('rules')} className={`flex flex-col items-center py-3 px-6 ${view === 'rules' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}><BookOpen size={20} className="mb-1" /><span className="text-xs">חוקים</span></button>
            <button onClick={() => setView('admin')} className={`flex flex-col items-center py-3 px-6 ${view === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}><ShieldCheck size={20} className="mb-1" /><span className="text-xs">אדמין</span></button>
          </div>
        </nav>
      )}
    </div>
  );
}