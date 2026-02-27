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
        <div className="text-center py-8 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 text-[#A594BA]">
          <Trophy size={48} className="mx-auto mb-3 opacity-20" />
          <p>הסולם כרגע ריק.<br/>תהיה הראשון להירשם ולכבוש את הפסגה!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {displayPlayers.map((player) => {
          let rankColor = "bg-white/10 text-white";
          
          if (player.rank === 1) { rankColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-[0_0_15px_rgba(253,224,71,0.4)]"; }
          else if (player.rank === 2) { rankColor = "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-[0_0_15px_rgba(203,213,225,0.4)]"; }
          else if (player.rank === 3) { rankColor = "bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-[0_0_15px_rgba(251,146,60,0.4)]"; }

          return (
            <div key={player.id} className="flex items-center justify-between p-4 rounded-[20px] bg-white/5 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-lg ${rankColor}`}>
                  {player.rank}
                </div>
                <h3 className="font-bold text-white text-lg tracking-wide">{player.name}</h3>
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
        <div className="text-center pt-4 pb-6 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#E020A3]/20 rounded-full blur-[40px] z-0"></div>
           <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] relative z-10 drop-shadow-lg">הסולם הרשמי</h2>
           <p className="text-[#A594BA] mt-1 relative z-10 font-medium">מודל ההחלפה (Leapfrog)</p>
        </div>

        {players.map((player) => {
          const isMe = myPlayer && myPlayer.id === player.id;
          const isChallengeable = myPlayer && !isMe && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3;
          
          let rankColor = "bg-white/10 text-[#A594BA]";
          let cardStyle = "bg-white/5 border-white/10 backdrop-blur-md";
          
          if (player.rank === 1) { rankColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-[0_0_15px_rgba(253,224,71,0.5)]"; cardStyle="bg-white/10 border-yellow-500/30 backdrop-blur-lg"; }
          else if (player.rank === 2) { rankColor = "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"; cardStyle="bg-white/5 border-slate-400/30 backdrop-blur-md"; }
          else if (player.rank === 3) { rankColor = "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_0_10px_rgba(251,146,60,0.3)]"; cardStyle="bg-white/5 border-orange-500/30 backdrop-blur-md"; }
          
          if (isMe) {
            cardStyle = "bg-[#8A2BE2]/10 border-[#E020A3] shadow-[0_0_20px_rgba(224,32,163,0.15)] backdrop-blur-lg";
            rankColor = "bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] text-white";
          }

          return (
            <div key={player.id} className={`flex items-center justify-between p-4 rounded-[24px] border transition-all ${cardStyle}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xl ${rankColor}`}>
                  {player.rank}
                </div>
                <div>
                  <h3 className={`font-bold text-lg tracking-wide ${isMe ? 'text-white drop-shadow-md' : 'text-white'}`}>
                    {player.name} {isMe && <span className="text-[#E020A3] text-sm ml-1">(את/ה)</span>}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {isChallengeable && (
                  <button 
                    onClick={() => openWhatsApp(player.phone, myPlayer.name)}
                    className="bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white px-5 py-2 rounded-full text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(224,32,163,0.4)] active:scale-95"
                  >
                    <Zap size={16} fill="currentColor" />
                    אתגר
                  </button>
                )}
                
                {!isMe && myPlayer && (myPlayer.rank - player.rank) <= 3 && myPlayer.rank > player.rank && (
                   <button 
                   onClick={() => setMatchModal({ isOpen: true, opponent: player })}
                   className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/20 active:scale-95"
                 >
                   עדכן ניצחון
                 </button>
                )}
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="text-center py-16 text-[#A594BA]">
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
      <div className="text-center pt-8 pb-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E020A3]/20 rounded-full blur-[60px] z-0"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] mb-6 shadow-[0_0_30px_rgba(224,32,163,0.5)] relative z-10">
          <Trophy size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A594BA] mb-2 relative z-10 drop-shadow-sm">
          סקווש חיפה
        </h1>
        <p className="text-[#A594BA] relative z-10 font-medium tracking-wide">הסולם מחכה לך. הגיע הזמן להוכיח.</p>
      </div>

      {/* Rules Mini-Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-5 border border-white/10 flex gap-4 items-center">
        <div className="bg-gradient-to-br from-[#8A2BE2]/20 to-[#E020A3]/20 p-3 rounded-full border border-[#E020A3]/30">
          <ChevronUp className="text-[#E020A3]" size={24} />
        </div>
        <div className="text-right">
          <h3 className="font-bold text-white mb-1">איך זה עובד?</h3>
          <p className="text-sm text-[#A594BA] leading-tight">נרשמים בתחתית. מאתגרים עד 3 שלבים מעליך. ניצחת? לקחת להם את המקום!</p>
        </div>
      </div>

      {/* Join Form */}
      <div className="bg-white/5 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border border-white/10 relative overflow-hidden">
        <h2 className="text-2xl font-black text-white mb-6">הצטרפות לליגה</h2>
        
        <form onSubmit={handleJoin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">שם מלא</label>
            <input required type="text" name="name" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:ring-1 focus:ring-[#E020A3] focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder="איך יקראו לך בסולם?" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">מספר וואטסאפ</label>
            <input required type="tel" name="phone" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:ring-1 focus:ring-[#E020A3] focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder="050-0000000" />
            <p className="text-xs text-[#A594BA]/70 mt-2">* משמש רק לאתגור למשחקים.</p>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white font-black text-lg py-4 rounded-full transition-all shadow-[0_8px_25px_rgba(224,32,163,0.4)] hover:shadow-[0_8px_35px_rgba(224,32,163,0.6)] active:scale-95 mt-4">
            הכנס אותי למשחק
          </button>
        </form>
      </div>

      {/* Live Ladder Preview */}
      <div className="pt-4">
        <h3 className="text-center font-bold text-[#E020A3] mb-4 uppercase tracking-widest text-xs">הצצה לדירוג הנוכחי</h3>
        {renderLadderPreview()}
      </div>

    </div>
  );

  const renderRules = () => (
    <div className="bg-white/5 backdrop-blur-xl p-7 rounded-[32px] shadow-xl border border-white/10 space-y-6 text-[#A594BA] leading-relaxed" dir="rtl">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="bg-gradient-to-br from-[#8A2BE2]/20 to-[#E020A3]/20 p-3 rounded-full border border-[#E020A3]/30">
          <BookOpen className="text-[#E020A3]" size={24} />
        </div>
        <h2 className="text-2xl font-black text-white">חוקי הליגה</h2>
      </div>
      
      <div className="space-y-5">
        <div className="bg-[#0A0410]/40 p-5 rounded-[24px] border border-white/5">
          <h3 className="font-black text-lg text-white mb-3 flex items-center gap-3">
            <span className="bg-[#E020A3] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm shadow-[0_0_10px_rgba(224,32,163,0.5)]">1</span>
            אתגר שחקנים
          </h3>
          <ul className="list-disc pr-6 space-y-2 text-sm">
            <li>ניתן לאתגר שחקנים שמדורגים עד <strong className="text-[#E020A3]">3 שלבים</strong> מעליך.</li>
            <li>שחקן שאותגר חייב לקבל את האתגר ולשחק תוך 7 ימים.</li>
          </ul>
        </div>

        <div className="bg-[#0A0410]/40 p-5 rounded-[24px] border border-white/5">
          <h3 className="font-black text-lg text-white mb-3 flex items-center gap-3">
            <span className="bg-[#8A2BE2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm shadow-[0_0_10px_rgba(138,43,226,0.5)]">2</span>
            משחקים ותוצאות
          </h3>
          <ul className="list-disc pr-6 space-y-2 text-sm">
            <li>המשחקים משוחקים בשיטת "הטוב מ-5".</li>
            <li><strong className="text-white">ניצחון של מאתגר:</strong> לוקח את המיקום של המפסיד. כל השאר יורדים שלב.</li>
            <li><strong className="text-white">ניצחון של מדורג גבוה:</strong> הדירוג נשאר ללא שינוי.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) {
      return (
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/10 max-w-md mx-auto mt-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#FF0055] to-[#E020A3]"></div>
          <ShieldCheck size={56} className="text-[#FF0055] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,0,85,0.5)]" />
          <h2 className="text-2xl font-black text-white mb-2">אזור מנהלים</h2>
          <p className="text-[#A594BA] text-sm mb-6">נא להזין קוד גישה</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white focus:border-[#FF0055] focus:outline-none tracking-[0.5em]"
            />
            <button type="submit" className="w-full bg-[#FF0055]/10 hover:bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 font-black py-4 rounded-full transition-colors active:scale-95">
              היכנס למערכת
            </button>
          </form>
        </div>
      );
    }
    return (
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10 space-y-6">
        <h2 className="text-xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-2">
          <ShieldCheck className="text-[#FF0055]" />
          פאנל ניהול שחקנים
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="text-[#A594BA] text-sm border-b border-white/10">
                <th className="p-3 font-medium">דירוג</th>
                <th className="p-3 font-medium">שם שחקן</th>
                <th className="p-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <input type="number" defaultValue={player.rank} onBlur={(e) => adminUpdatePlayer(player.id, player.name, e.target.value)} 
                    className="w-16 px-2 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-center text-white focus:border-[#E020A3] focus:outline-none" />
                  </td>
                  <td className="p-3">
                    <input type="text" defaultValue={player.name} onBlur={(e) => adminUpdatePlayer(player.id, e.target.value, player.rank)} 
                    className="w-full px-3 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white focus:border-[#E020A3] focus:outline-none" />
                  </td>
                  <td className="p-3">
                    <button onClick={() => adminDeletePlayer(player.id)} className="text-[#FF0055] hover:text-white bg-[#FF0055]/10 hover:bg-[#FF0055] p-2 rounded-full transition-colors">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0410] to-[#1B0B2E] text-center p-6" dir="rtl">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap'); * { font-family: 'Heebo', sans-serif; }`}</style>
        <AlertTriangle size={64} className="text-[#FF0055] mb-4 drop-shadow-[0_0_15px_rgba(255,0,85,0.8)]" />
        <h2 className="text-2xl font-black text-white mb-2">
          {isApiKeyError ? 'מפתח ה-API שגוי או חסר' : 'שגיאת אבטחה בחיבור'}
        </h2>
        <div className="text-[#A594BA] mb-6 max-w-md bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/10">
          {isApiKeyError ? (
            <>
              <p className="mb-4 text-white">נראה שמפתח ה-API שהעתקנו קודם חלקי (חסרות בו אותיות).</p>
              <p className="font-bold text-[#E020A3] mb-2">איך לתקן?</p>
              <ol className="list-decimal text-right pr-5 mt-2 space-y-2 text-sm">
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
        <div className="bg-black/50 p-4 rounded-2xl text-xs text-[#A594BA] font-mono text-left w-full max-w-md border border-[#FF0055]/20" dir="ltr">
          {authError}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0410] to-[#1B0B2E]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap'); * { font-family: 'Heebo', sans-serif; }`}</style>
        <RefreshCw className="animate-spin text-[#E020A3] mb-4 drop-shadow-[0_0_10px_rgba(224,32,163,0.5)]" size={40} />
        <span className="font-bold tracking-widest text-sm text-[#A594BA] uppercase">טוען נתונים...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0410] to-[#1B0B2E] text-white pb-24 relative overflow-hidden" dir="rtl">
      {/* הזרקת פונט Heebo לכל האפליקציה */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap');
        * { font-family: 'Heebo', sans-serif; }
      `}</style>

      {/* אורות ניאון רקע (Ambient Glow) */}
      <div className="fixed top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#8A2BE2]/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#E020A3]/10 blur-[100px] pointer-events-none z-0"></div>

      <main className="max-w-xl mx-auto p-5 mt-2 relative z-10">
        {view === 'join' && renderJoin()}
        {view === 'ladder' && renderLadder()}
        {view === 'rules' && renderRules()}
        {view === 'admin' && renderAdmin()}
      </main>

      {matchModal.isOpen && matchModal.opponent && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_40px_rgba(138,43,226,0.3)]">
            <div className="w-20 h-20 bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(224,32,163,0.5)]">
              <Trophy size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-center text-white mb-2">אישור ניצחון</h3>
            <p className="text-center text-[#A594BA] mb-8">
              האם אתה מאשר שניצחת את <strong className="text-white">{matchModal.opponent.name}</strong>?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 px-4 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-colors">ביטול</button>
              <button onClick={() => submitMatchResult(user.uid, matchModal.opponent.id)} className="flex-1 px-4 py-4 bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white rounded-full font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(224,32,163,0.5)] active:scale-95 transition-all">
                <Check size={20} /> אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {view !== 'join' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0410]/80 backdrop-blur-xl border-t border-white/10 z-20 pb-safe">
          <div className="max-w-xl mx-auto flex justify-around p-3">
            <button onClick={() => setView('ladder')} className={`flex flex-col items-center p-2 transition-all ${view === 'ladder' ? 'text-[#E020A3] drop-shadow-[0_0_8px_rgba(224,32,163,0.8)]' : 'text-[#A594BA] hover:text-white'}`}>
              <Trophy size={24} className="mb-1" />
              <span className="text-[11px] font-bold tracking-wide">סולם</span>
            </button>
            <button onClick={() => setView('rules')} className={`flex flex-col items-center p-2 transition-all ${view === 'rules' ? 'text-[#E020A3] drop-shadow-[0_0_8px_rgba(224,32,163,0.8)]' : 'text-[#A594BA] hover:text-white'}`}>
              <BookOpen size={24} className="mb-1" />
              <span className="text-[11px] font-bold tracking-wide">חוקים</span>
            </button>
            <button onClick={() => setView('admin')} className={`flex flex-col items-center p-2 transition-all ${view === 'admin' ? 'text-[#E020A3] drop-shadow-[0_0_8px_rgba(224,32,163,0.8)]' : 'text-[#A594BA] hover:text-white'}`}>
              <ShieldCheck size={24} className="mb-1" />
              <span className="text-[11px] font-bold tracking-wide">אדמין</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}