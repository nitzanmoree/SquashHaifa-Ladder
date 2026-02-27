import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Phone, Trash2, Check, RefreshCw, AlertTriangle, ChevronUp, Zap } from 'lucide-react';

// --- Firebase Initialization ---
const fallbackConfig = {
  apiKey: "AIzaSyD1utJy-vxBJy8g-C6TM2iFbRmA9I5B5vw", 
  authDomain: "haifasquash-ladder.firebaseapp.com",
  projectId: "haifasquash-ladder",
  storageBucket: "haifasquash-ladder.firebasestorage.app",
  messagingSenderId: "553434079367",
  appId: "1:553434079367:web:0b284761f96b271d261822"
};

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

  // שינוי שם הטאב בדפדפן
  useEffect(() => {
    document.title = "ליגת סקווש חיפה";
  }, []);

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
  const renderLadderPreview = (limit = null) => {
    const displayPlayers = limit ? players.slice(0, limit) : players;
    
    if (players.length === 0) {
      return (
        <div className="text-center py-8 bg-[#1A1F35] rounded-2xl border border-[#2A314A] text-slate-400">
          <Trophy size={48} className="mx-auto mb-3 opacity-20" />
          <p>הסולם כרגע ריק.<br/>תהיה הראשון להירשם ולכבוש את הפסגה!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {displayPlayers.map((player) => {
          let rankColor = "bg-[#2A314A] text-slate-300";
          let borderGlow = "border-[#2A314A]";
          
          if (player.rank === 1) { rankColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-[0_0_15px_rgba(253,224,71,0.4)]"; borderGlow = "border-yellow-500/30"; }
          else if (player.rank === 2) { rankColor = "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-[0_0_15px_rgba(203,213,225,0.4)]"; borderGlow = "border-slate-400/30"; }
          else if (player.rank === 3) { rankColor = "bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-[0_0_15px_rgba(251,146,60,0.4)]"; borderGlow = "border-orange-500/30"; }

          return (
            <div key={player.id} className={`flex items-center justify-between p-4 rounded-2xl bg-[#1A1F35]/80 backdrop-blur-sm border ${borderGlow} transition-all`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg ${rankColor}`}>
                  {player.rank}
                </div>
                <h3 className="font-bold text-white text-lg">{player.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLadder = () => {
    const myPlayer = players.find(p => p.id === user?.uid);
    
    return (
      <div className="space-y-4 pb-6">
        <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-[1px] rounded-3xl mb-8">
          <div className="bg-[#13172A] rounded-3xl p-6 text-center h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200 relative z-10">הסולם הרשמי - חיפה</h2>
            <p className="text-sm text-blue-200/70 mt-1 relative z-10">אתגר. נצח. טפס לפסגה.</p>
          </div>
        </div>

        {players.map((player) => {
          const isMe = myPlayer && myPlayer.id === player.id;
          const isChallengeable = myPlayer && !isMe && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3;
          
          let rankColor = "bg-[#2A314A] text-slate-300";
          let cardStyle = "bg-[#1A1F35] border-[#2A314A]";
          
          if (player.rank === 1) { rankColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-[0_0_15px_rgba(253,224,71,0.4)]"; cardStyle="bg-gradient-to-l from-[#1A1F35] to-[#252314] border-yellow-500/20"; }
          else if (player.rank === 2) { rankColor = "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-[0_0_15px_rgba(203,213,225,0.4)]"; cardStyle="bg-gradient-to-l from-[#1A1F35] to-[#1c222b] border-slate-400/20"; }
          else if (player.rank === 3) { rankColor = "bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-[0_0_15px_rgba(251,146,60,0.4)]"; cardStyle="bg-gradient-to-l from-[#1A1F35] to-[#2b1f1a] border-orange-500/20"; }
          
          if (isMe) {
            cardStyle = "bg-[#1f2642] border-[#6366f1] shadow-[0_0_15px_rgba(99,102,241,0.15)]";
          }

          return (
            <div key={player.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cardStyle}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl ${rankColor}`}>
                  {player.rank}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isMe ? 'text-[#a5b4fc]' : 'text-white'}`}>{player.name} {isMe && '(את/ה)'}</h3>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isChallengeable && (
                  <button 
                    onClick={() => openWhatsApp(player.phone, myPlayer.name)}
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-[#0f172a] px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  >
                    <Zap size={16} fill="currentColor" />
                    אתגר
                  </button>
                )}
                
                {!isMe && myPlayer && (myPlayer.rank - player.rank) <= 3 && myPlayer.rank > player.rank && (
                   <button 
                   onClick={() => setMatchModal({ isOpen: true, opponent: player })}
                   className="bg-[#2A314A] hover:bg-[#343d5c] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-[#3b4463]"
                 >
                   עדכן ניצחון
                 </button>
                )}
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            אין עדיין שחקנים בליגה.<br/>תהיה הראשון להצטרף!
          </div>
        )}
      </div>
    );
  };

  const renderJoin = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      
      {/* Hero Header */}
      <div className="text-center pt-6 pb-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 mb-4 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
          <Trophy size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 mb-2">
          סקווש חיפה
        </h1>
        <p className="text-slate-400">הסולם מחכה לך. הגיע הזמן להוכיח את עצמך.</p>
      </div>

      {/* Rules Mini-Card */}
      <div className="bg-[#1A1F35] rounded-3xl p-5 border border-[#2A314A] flex gap-4 items-center">
        <div className="bg-[#2A314A] p-3 rounded-2xl">
          <ChevronUp className="text-purple-400" size={24} />
        </div>
        <div className="text-right">
          <h3 className="font-bold text-white mb-1">איך זה עובד?</h3>
          <p className="text-sm text-slate-400 leading-tight">נרשמים בתחתית הסולם. מאתגרים שחקנים עד 3 שלבים מעליך. ניצחת? אתה לוקח להם את המקום!</p>
        </div>
      </div>

      {/* Join Form */}
      <div className="bg-gradient-to-b from-[#1A1F35] to-[#13172A] p-6 rounded-3xl shadow-xl border border-[#2A314A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">הצטרפות לליגה</h2>
        
        <form onSubmit={handleJoin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">שם מלא</label>
            <input required type="text" name="name" 
              className="w-full bg-[#0B0F19] text-white px-5 py-4 border border-[#2A314A] rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder-slate-600" 
              placeholder="איך יקראו לך בסולם?" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">מספר וואטסאפ</label>
            <input required type="tel" name="phone" 
              className="w-full bg-[#0B0F19] text-white px-5 py-4 border border-[#2A314A] rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder-slate-600" 
              placeholder="050-0000000" />
            <p className="text-xs text-slate-500 mt-2">* משמש רק כדי ששחקנים יוכלו לאתגר אותך למשחק.</p>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] mt-2">
            הכנס אותי למשחק
          </button>
        </form>
      </div>

      {/* Live Ladder Preview */}
      <div className="pt-4">
        <h3 className="text-center font-bold text-slate-400 mb-4 uppercase tracking-widest text-sm">הדירוג הנוכחי (הצצה)</h3>
        {renderLadderPreview()}
      </div>

    </div>
  );

  const renderRules = () => (
    <div className="bg-[#1A1F35] p-6 rounded-3xl shadow-xl border border-[#2A314A] space-y-6 text-slate-300 leading-relaxed" dir="rtl">
      <div className="flex items-center gap-3 border-b border-[#2A314A] pb-4">
        <div className="bg-purple-500/20 p-2 rounded-xl">
          <BookOpen className="text-purple-400" size={24} />
        </div>
        <h2 className="text-2xl font-black text-white">חוקי הליגה</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#2A314A]">
          <h3 className="font-black text-lg text-purple-300 mb-2 flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 w-6 h-6 flex items-center justify-center rounded-md text-sm">1</span>
            אתגר שחקנים
          </h3>
          <ul className="list-disc pr-5 space-y-1 text-sm text-slate-400">
            <li>ניתן לאתגר שחקנים שמדורגים עד <strong className="text-white">3 שלבים</strong> מעליך.</li>
            <li>שחקן שאותגר חייב לקבל את האתגר ולשחק תוך 7 ימים.</li>
          </ul>
        </div>

        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-[#2A314A]">
          <h3 className="font-black text-lg text-blue-300 mb-2 flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 w-6 h-6 flex items-center justify-center rounded-md text-sm">2</span>
            משחקים ותוצאות
          </h3>
          <ul className="list-disc pr-5 space-y-1 text-sm text-slate-400">
            <li>המשחקים משוחקים בשיטת "הטוב מ-5".</li>
            <li><strong className="text-emerald-400">ניצחון של מאתגר:</strong> לוקח את המיקום של המפסיד. כל השאר יורדים שלב.</li>
            <li><strong className="text-slate-200">ניצחון של מדורג גבוה:</strong> הדירוג נשאר ללא שינוי.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) {
      return (
        <div className="bg-[#1A1F35] p-8 rounded-3xl shadow-xl border border-[#2A314A] max-w-md mx-auto mt-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <ShieldCheck size={56} className="text-red-500/50 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">אזור מנהלים</h2>
          <p className="text-slate-400 text-sm mb-6">נא להזין קוד גישה</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-5 py-4 bg-[#0B0F19] border border-[#2A314A] rounded-2xl text-center text-white focus:border-red-500 focus:outline-none tracking-[0.5em]"
            />
            <button type="submit" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-4 rounded-2xl transition-colors">
              היכנס למערכת
            </button>
          </form>
        </div>
      );
    }
    return (
      <div className="bg-[#1A1F35] p-6 rounded-3xl shadow-xl border border-[#2A314A] space-y-6">
        <h2 className="text-xl font-black text-white border-b border-[#2A314A] pb-4 flex items-center gap-2">
          <ShieldCheck className="text-red-500" />
          פאנל ניהול שחקנים
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-[#2A314A]">
                <th className="p-3 font-normal">דירוג</th>
                <th className="p-3 font-normal">שם שחקן</th>
                <th className="p-3 font-normal">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b border-[#2A314A]/50 hover:bg-[#2A314A]/30">
                  <td className="p-3">
                    <input type="number" defaultValue={player.rank} onBlur={(e) => adminUpdatePlayer(player.id, player.name, e.target.value)} 
                    className="w-16 px-2 py-2 bg-[#0B0F19] border border-[#2A314A] rounded-lg text-center text-white focus:border-purple-500 focus:outline-none" />
                  </td>
                  <td className="p-3">
                    <input type="text" defaultValue={player.name} onBlur={(e) => adminUpdatePlayer(player.id, e.target.value, player.rank)} 
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-[#2A314A] rounded-lg text-white focus:border-purple-500 focus:outline-none" />
                  </td>
                  <td className="p-3">
                    <button onClick={() => adminDeletePlayer(player.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-2 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </td>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-center p-6" dir="rtl">
        <AlertTriangle size={64} className="text-red-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-white mb-2">
          {isApiKeyError ? 'מפתח ה-API שגוי או חסר' : 'שגיאת אבטחה בחיבור'}
        </h2>
        <div className="text-slate-400 mb-6 max-w-md bg-[#1A1F35] p-6 rounded-2xl border border-[#2A314A]">
          {isApiKeyError ? (
            <>
              <p className="mb-4">נראה שמפתח ה-API שהעתקנו קודם חלקי (חסרות בו אותיות).</p>
              <p className="font-bold text-white mb-2">איך לתקן?</p>
              <ol className="list-decimal text-right pr-5 mt-2 space-y-2 text-sm text-slate-300">
                <li>היכנס לאתר פיירבייס (Firebase Console).</li>
                <li>לחץ על גלגל השיניים ⚙️ ובחר <strong>Project settings</strong>.</li>
                <li>גלול לאזור <strong>Your apps</strong>.</li>
                <li>העתק את הערך המלא של <code>apiKey</code>.</li>
                <li>הדבק אותו בשורה 10 של הקוד.</li>
              </ol>
            </>
          ) : (
            <p>פיירבייס חוסם את האתר הזה מלהתחבר.</p>
          )}
        </div>
        <div className="bg-black/50 p-4 rounded-xl text-xs text-slate-500 font-mono text-left w-full max-w-md border border-red-500/20" dir="ltr">
          {authError}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-purple-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <span className="font-bold tracking-widest text-sm">טוען את הסולם...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-24 selection:bg-purple-500/30 relative" dir="rtl">
      {/* Background ambient glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/10 blur-[120px]"></div>
      </div>

      <main className="max-w-xl mx-auto p-5 mt-2 relative z-10">
        {view === 'join' && renderJoin()}
        {view === 'ladder' && renderLadder()}
        {view === 'rules' && renderRules()}
        {view === 'admin' && renderAdmin()}
      </main>

      {matchModal.isOpen && matchModal.opponent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1A1F35] border border-[#2A314A] rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-2xl font-black text-center text-white mb-2">אישור ניצחון</h3>
            <p className="text-center text-slate-400 mb-8">
              האם אתה מאשר שניצחת את <strong className="text-white">{matchModal.opponent.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 px-4 py-3 bg-[#0B0F19] border border-[#2A314A] text-slate-300 rounded-2xl font-bold hover:bg-[#2A314A] transition-colors">ביטול</button>
              <button onClick={() => submitMatchResult(user.uid, matchModal.opponent.id)} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                <Check size={18} /> אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {view !== 'join' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1F35]/90 backdrop-blur-md border-t border-[#2A314A] z-20 pb-safe">
          <div className="max-w-xl mx-auto flex justify-around p-2">
            <button onClick={() => setView('ladder')} className={`flex flex-col items-center p-3 rounded-2xl transition-all w-20 ${view === 'ladder' ? 'text-white bg-[#2A314A]/50' : 'text-slate-500 hover:text-slate-400'}`}>
              <Trophy size={22} className="mb-1" />
              <span className="text-[10px] font-bold">סולם</span>
            </button>
            <button onClick={() => setView('rules')} className={`flex flex-col items-center p-3 rounded-2xl transition-all w-20 ${view === 'rules' ? 'text-white bg-[#2A314A]/50' : 'text-slate-500 hover:text-slate-400'}`}>
              <BookOpen size={22} className="mb-1" />
              <span className="text-[10px] font-bold">חוקים</span>
            </button>
            <button onClick={() => setView('admin')} className={`flex flex-col items-center p-3 rounded-2xl transition-all w-20 ${view === 'admin' ? 'text-white bg-[#2A314A]/50' : 'text-slate-500 hover:text-slate-400'}`}>
              <ShieldCheck size={22} className="mb-1" />
              <span className="text-[10px] font-bold">אדמין</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}