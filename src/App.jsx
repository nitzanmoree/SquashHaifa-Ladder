import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Trash2, Check, RefreshCw, AlertTriangle, ChevronUp, Zap, Info, Home, List, BarChart2, LogIn, LogOut, Save, Eye, RotateCcw } from 'lucide-react';

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
  const [localUserId, setLocalUserId] = useState(localStorage.getItem('squash_user_id') || null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modals & States
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [statsModalPlayer, setStatsModalPlayer] = useState(null);
  const [matchModal, setMatchModal] = useState({ isOpen: false, opponent: null });
  const [adminSelectedPlayer, setAdminSelectedPlayer] = useState(null); // פרטי שחקן לאדמין
  const [adminEdits, setAdminEdits] = useState({});

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);

  useEffect(() => {
    document.title = "ליגת סקווש חיפה";
  }, []);

  // --- Auth & Data Fetching ---
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
    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');
    
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      playersData.sort((a, b) => a.rank - b.rank);
      setPlayers(playersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching players:", error);
      setAuthError(error.message);
      setLoading(false);
    });

    const unsubscribeMatches = onSnapshot(matchesRef, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      matchesData.sort((a, b) => b.timestamp - a.timestamp);
      setMatches(matchesData);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, [user]);

  // --- Helpers ---
  const myPlayer = players.find(p => p.id === localUserId);
  const cleanPhone = (p) => p.replace(/\D/g, '');

  const getPlayerStats = (playerId) => {
    const playerMatches = matches.filter(m => m.winnerId === playerId || m.loserId === playerId);
    const wins = playerMatches.filter(m => m.winnerId === playerId).length;
    const losses = playerMatches.length - wins;
    const winPercent = playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0;
    return { total: playerMatches.length, wins, losses, winPercent };
  };

  // --- Actions ---
  const handleLogin = (e) => {
    e.preventDefault();
    const inputPhone = cleanPhone(e.target.phone.value);
    const found = players.find(p => cleanPhone(p.phone) === inputPhone);
    
    if (found) {
      localStorage.setItem('squash_user_id', found.id);
      setLocalUserId(found.id);
      setLoginModalOpen(false);
      setView('ladder');
    } else {
      alert("לא נמצא שחקן רשום עם מספר הטלפון הזה.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('squash_user_id');
    setLocalUserId(null);
    setView('home');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (isSubmittingJoin) return;
    setIsSubmittingJoin(true);

    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const email = e.target.email.value;
    const idNumber = e.target.idNumber.value;
    const healthDeclaration = e.target.health.checked;
    const rulesAgreed = e.target.rulesCheck.checked;
    
    const newRank = players.length > 0 ? players.length + 1 : 1;
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', user.uid), {
        name,
        phone,
        email,
        idNumber,
        healthDeclaration,
        rulesAgreed,
        rank: newRank,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
      
      localStorage.setItem('squash_user_id', user.uid);
      setLocalUserId(user.uid);
      setView('ladder');
    } catch (err) {
      console.error("Error joining:", err);
      alert("שגיאה ברישום. נסה שוב.");
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const submitMatchResult = async (winnerId, loserId) => {
    const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
    const winnerIdx = sortedPlayers.findIndex(p => p.id === winnerId);
    const loserIdx = sortedPlayers.findIndex(p => p.id === loserId);

    if (winnerIdx === -1 || loserIdx === -1) return;

    // צילום מצב הדירוג הנוכחי כדי לאפשר שחזור עתידי ע"י המנהל
    const playersSnapshot = sortedPlayers.map(p => ({ id: p.id, rank: p.rank }));

    try {
      if (sortedPlayers[winnerIdx].rank > sortedPlayers[loserIdx].rank) {
        const winnerObj = sortedPlayers.splice(winnerIdx, 1)[0];
        sortedPlayers.splice(loserIdx, 0, winnerObj);

        const updates = [];
        sortedPlayers.forEach((p, index) => {
          const expectedRank = index + 1;
          if (p.rank !== expectedRank) {
            updates.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', p.id), {
              rank: expectedRank,
              ...(p.id === winnerId ? { lastActive: new Date().toISOString() } : {})
            }));
          }
        });
        await Promise.all(updates);
      } else {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', winnerId), {
          lastActive: new Date().toISOString()
        });
      }
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'matches'), {
        winnerId,
        loserId,
        winnerName: players.find(p => p.id === winnerId)?.name || 'לא ידוע',
        loserName: players.find(p => p.id === loserId)?.name || 'לא ידוע',
        playersSnapshot, // שמירת היסטוריית מיקומים לביטול
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })
      });

      setMatchModal({ isOpen: false, opponent: null });
    } catch (err) {
      console.error("Error updating match result:", err);
      alert("אירעה שגיאה בעת עדכון התוצאה.");
    }
  };

  const openWhatsApp = (phone, myName, e) => {
    e.stopPropagation(); 
    const finalPhone = cleanPhone(phone).startsWith('0') ? '972' + cleanPhone(phone).substring(1) : cleanPhone(phone);
    const text = encodeURIComponent(`היי! מדבר ${myName} מליגת הסקווש. אני רוצה לעשות לך צ׳אלנג׳ למשחק במסגרת הסולם! מתי נוח לך? 🎾`);
    const url = `https://wa.me/${finalPhone}?text=${text}`;
    
    // פתיחה בטאב חדש בצורה שעובדת נהדר באייפון בלי להרוס את האפליקציה
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Admin Actions ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'squash2026') {
      setIsAdmin(true);
      setAdminLoginError(false);
    } else {
      setAdminLoginError(true);
    }
  };

  const handleAdminEditChange = (id, field, value) => {
    setAdminEdits(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || players.find(p => p.id === id)),
        [field]: value
      }
    }));
  };

  const saveAdminEdits = async () => {
    if (Object.keys(adminEdits).length === 0) return;
    try {
      const updates = Object.keys(adminEdits).map(id => {
        const data = adminEdits[id];
        return updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', id), {
          name: data.name,
          rank: parseInt(data.rank, 10)
        });
      });
      await Promise.all(updates);
      setAdminEdits({});
      alert("כל השינויים נשמרו בהצלחה!");
    } catch (err) {
      console.error("Admin save error:", err);
      alert("שגיאה בשמירת הנתונים.");
    }
  };

  const adminDeletePlayer = async (playerId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק שחקן זה? המחיקה הינה סופית.")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId));
        setAdminEdits(prev => { const newEdits = {...prev}; delete newEdits[playerId]; return newEdits; });
      } catch (err) {
        console.error("Admin delete error:", err);
      }
    }
  };

  const adminDeleteMatch = async (match) => {
    if (window.confirm("למחוק משחק זה?\nאם יש תיעוד, הדירוג יחזור למצב שהיה לפני המשחק.")) {
      try {
        if (match.playersSnapshot) {
           const updates = match.playersSnapshot.map(p => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', p.id), {
              rank: p.rank
           }));
           await Promise.all(updates);
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'matches', match.id));
        alert("המשחק נמחק והדירוג שוחזר!");
      } catch (err) {
        console.error("Admin delete match error:", err);
      }
    }
  };

  const adminReverseMatch = async (match) => {
    if (!match.playersSnapshot) {
       alert("אין נתוני היסטוריה ישנים למשחק זה ולכן לא ניתן להפוך אותו אוטומטית.");
       return;
    }
    if (window.confirm("להפוך את התוצאה?\nהמפסיד יוכרז כמנצח, והדירוג יחושב מחדש כאילו הוא ניצח במקור.")) {
       try {
          const newWinnerId = match.loserId;
          const newLoserId = match.winnerId;

          // לוקחים את הדירוג שהיה לפני המשחק
          let currentPlayersState = [...match.playersSnapshot].sort((a,b) => a.rank - b.rank);
          const winnerIdx = currentPlayersState.findIndex(p => p.id === newWinnerId);
          const loserIdx = currentPlayersState.findIndex(p => p.id === newLoserId);

          // מדמים מחדש את ההחלפה (הקפיצה)
          if (winnerIdx !== -1 && loserIdx !== -1) {
              if (currentPlayersState[winnerIdx].rank > currentPlayersState[loserIdx].rank) {
                  const winnerObj = currentPlayersState.splice(winnerIdx, 1)[0];
                  currentPlayersState.splice(loserIdx, 0, winnerObj);
                  currentPlayersState.forEach((p, index) => { p.rank = index + 1; });
              }
              const updates = currentPlayersState.map(p => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', p.id), { rank: p.rank }));
              await Promise.all(updates);
          }

          // מעדכנים את המסמך של המשחק עצמו שהתהפך
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'matches', match.id), {
              winnerId: newWinnerId,
              loserId: newLoserId,
              winnerName: match.loserName,
              loserName: match.winnerName
          });

          alert("התוצאה הופכה והדירוג עודכן בהתאם!");
       } catch(e) {
          console.error("Reverse error:", e);
       }
    }
  };

  // --- Renders ---
  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Hero Header */}
      <div className="text-center pt-8 pb-2 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E020A3]/20 rounded-full blur-[60px] z-0"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] mb-6 shadow-[0_0_30px_rgba(224,32,163,0.5)] relative z-10">
          <Trophy size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A594BA] mb-2 relative z-10 drop-shadow-sm">
          סקווש חיפה
        </h1>
        <p className="text-[#A594BA] relative z-10 font-medium tracking-wide">זירת הסולם הרשמית</p>
      </div>

      {/* Login / Actions Section */}
      <div className="relative z-10 flex flex-col gap-4">
        {myPlayer ? (
          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-[24px] border border-[#8A2BE2]/30 text-center shadow-[0_0_20px_rgba(138,43,226,0.2)]">
            <p className="text-[#A594BA] mb-2">שלום, <strong className="text-white">{myPlayer.name}</strong></p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setView('ladder')} className="flex-1 bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform">
                לסולם הדירוג
              </button>
              <button onClick={handleLogout} className="px-4 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => setLoginModalOpen(true)} className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-lg">
              <LogIn size={22} /> כניסה לרשומים
            </button>
            <button onClick={() => setView('join')} className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_25px_rgba(224,32,163,0.4)] active:scale-95 transition-all">
              <UserPlus size={22} /> הצטרפות לליגה
            </button>
          </>
        )}
      </div>

      {/* Rules Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-7 border border-white/10 shadow-xl relative z-10 text-right mt-6">
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
          <div className="bg-[#8A2BE2]/20 p-2 rounded-full text-[#8A2BE2]">
            <Info size={24} />
          </div>
          <h2 className="text-xl font-black text-white">חוקי המשחק</h2>
        </div>
        
        <ul className="space-y-4 text-sm text-[#A594BA]">
          <li className="flex items-start gap-3">
            <span className="bg-[#E020A3] w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">1</span>
            <div><strong className="text-white">צ׳אלנג׳:</strong> רשאים לאתגר שחקנים המדורגים עד <strong className="text-[#E020A3]">3 שלבים</strong> מעליכם. חובה לקבל אתגר תוך 7 ימים.</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-[#8A2BE2] w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">2</span>
            <div><strong className="text-white">שיטה וניצחון:</strong> הטוב מ-5. ניצחת שחקן מעליך? <strong className="text-white">תפסת לו את המקום</strong>! המפסיד ומי שביניכם יורדים שלב.</div>
          </li>
        </ul>
      </div>

      {/* Ladder Preview */}
      <div className="pt-4 pb-8">
        <h3 className="text-center font-bold text-[#E020A3] mb-4 uppercase tracking-widest text-xs">הצצה לדירוג הנוכחי</h3>
        <div className="space-y-3">
          {players.length === 0 ? (
            <div className="text-center py-6 text-[#A594BA] bg-white/5 rounded-2xl border border-white/10">אין עדיין שחקנים.</div>
          ) : (
            players.slice(0, 5).map(player => (
              <div key={player.id} className="flex items-center justify-between p-4 rounded-[20px] bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${player.rank <= 3 ? 'bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] text-white' : 'bg-white/10 text-white'}`}>
                    {player.rank}
                  </div>
                  <h3 className="font-bold text-white tracking-wide">{player.name}</h3>
                </div>
              </div>
            ))
          )}
        </div>
        {players.length > 5 && (
          <button onClick={() => setView('ladder')} className="w-full mt-4 text-[#A594BA] text-sm hover:text-white transition-colors">
            הצג את כל הדירוג ({players.length} שחקנים)
          </button>
        )}
      </div>
    </div>
  );

  const renderJoinForm = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 mt-6">
      <div className="bg-gradient-to-br from-[#0A0410]/90 to-[#1B0B2E]/90 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border border-[#E020A3]/30 relative overflow-hidden">
        <h2 className="text-2xl font-black text-white mb-6">טופס הרשמה לליגה</h2>
        
        <form onSubmit={handleJoin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">שם מלא</label>
            <input required type="text" name="name" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:ring-1 focus:ring-[#E020A3] focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder="שם פרטי ומשפחה" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">מספר וואטסאפ</label>
            <input required type="tel" name="phone" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:ring-1 focus:ring-[#E020A3] focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder="050-0000000" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">כתובת אימייל</label>
            <input required type="email" name="email" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:ring-1 focus:ring-[#E020A3] focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">תעודת זהות</label>
            <input required type="text" name="idNumber" pattern="\d{8,9}" title="אנא הזן ת.ז תקנית בת 9 ספרות"
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:ring-1 focus:ring-[#E020A3] focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder="9 ספרות חובה" />
          </div>
          
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-start gap-3 mt-4">
              <input required type="checkbox" id="health" className="mt-1 w-4 h-4 accent-[#E020A3]" />
              <label htmlFor="health" className="text-sm text-[#A594BA] leading-tight cursor-pointer">אני מצהיר/ה בזאת כי מצבי הבריאותי תקין ואני כשיר/ה לפעילות ספורטיבית מאומצת.</label>
            </div>
            <div className="flex items-start gap-3 mt-4">
              <input required type="checkbox" id="rulesCheck" className="mt-1 w-4 h-4 accent-[#E020A3]" />
              <label htmlFor="rulesCheck" className="text-sm text-[#A594BA] leading-tight cursor-pointer">קראתי והבנתי את תקנון וחוקי הליגה.</label>
            </div>
          </div>

          <button type="submit" disabled={isSubmittingJoin} className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white font-black text-lg py-4 rounded-full transition-all shadow-[0_8px_25px_rgba(224,32,163,0.4)] hover:shadow-[0_8px_35px_rgba(224,32,163,0.6)] active:scale-95 mt-4 disabled:opacity-50">
            {isSubmittingJoin ? 'מבצע רישום...' : 'הכנס אותי לסולם!'}
          </button>
          
          <button type="button" onClick={() => setView('home')} className="w-full mt-3 text-[#A594BA] hover:text-white transition-colors py-2 text-sm font-bold">
            ביטול וחזרה למסך הראשי
          </button>
        </form>
      </div>
    </div>
  );

  const renderLadder = () => (
    <div className="space-y-4 pb-8 mt-4 animate-in fade-in duration-300">
      <div className="text-center pb-6 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#8A2BE2]/20 rounded-full blur-[40px] z-0"></div>
         <h2 className="text-3xl font-black text-white relative z-10 drop-shadow-lg flex justify-center items-center gap-3">
            <List className="text-[#E020A3]" size={32} /> סולם הדירוג
         </h2>
         {!myPlayer && (
           <p className="text-[#E020A3] mt-2 text-sm relative z-10">* התחבר בחשבון כדי לעשות צ׳אלנג׳ ולהזין תוצאות</p>
         )}
      </div>

      {players.map((player) => {
        const isMe = myPlayer && myPlayer.id === player.id;
        const isChallengeable = myPlayer && !isMe && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3;
        
        let rankColor = "bg-white/10 text-[#A594BA]";
        let cardStyle = "bg-white/5 border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/10";
        
        if (player.rank === 1) { rankColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-[0_0_15px_rgba(253,224,71,0.5)]"; cardStyle="bg-white/10 border-yellow-500/30 backdrop-blur-lg cursor-pointer hover:bg-white/20"; }
        else if (player.rank === 2) { rankColor = "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"; }
        else if (player.rank === 3) { rankColor = "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_0_10px_rgba(251,146,60,0.3)]"; }
        
        if (isMe) {
          cardStyle = "bg-[#8A2BE2]/10 border-[#E020A3] shadow-[0_0_20px_rgba(224,32,163,0.15)] backdrop-blur-lg cursor-pointer";
          rankColor = "bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] text-white";
        }

        return (
          <div key={player.id} onClick={() => setStatsModalPlayer(player)} className={`flex items-center justify-between p-4 rounded-[24px] border transition-all ${cardStyle}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xl shrink-0 ${rankColor}`}>
                {player.rank}
              </div>
              <div className="flex flex-col">
                <h3 className={`font-bold text-lg tracking-wide ${isMe ? 'text-white drop-shadow-md' : 'text-white'}`}>
                  {player.name} {isMe && <span className="text-[#E020A3] text-sm ml-1">(את/ה)</span>}
                </h3>
                <span className="text-[#A594BA] text-xs flex items-center gap-1 mt-0.5"><BarChart2 size={12}/> לחץ לסטטיסטיקה</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              {isChallengeable && (
                <button 
                  onClick={(e) => openWhatsApp(player.phone, myPlayer.name, e)}
                  className="bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white px-5 py-2 rounded-full text-sm font-black transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(224,32,163,0.4)] active:scale-95"
                >
                  <Zap size={16} fill="currentColor" />
                  צ׳אלנג׳
                </button>
              )}
              
              {!isMe && myPlayer && (myPlayer.rank - player.rank) <= 3 && myPlayer.rank > player.rank && (
                 <button 
                 onClick={(e) => { e.stopPropagation(); setMatchModal({ isOpen: true, opponent: player }); }}
                 className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/20 active:scale-95"
               >
                 עדכן ניצחון
               </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6 pb-8 mt-4 animate-in fade-in duration-300">
      <div className="text-center pb-2 relative">
         <h2 className="text-3xl font-black text-white relative z-10 flex justify-center items-center gap-3">
            <RefreshCw className="text-[#8A2BE2]" size={32} /> תוצאות אחרונות
         </h2>
         <p className="text-[#A594BA] mt-2 text-sm relative z-10">היסטוריית המשחקים של הליגה</p>
      </div>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10 text-[#A594BA]">אין עדיין תיעוד משחקים.</div>
        ) : (
          matches.map(match => (
            <div key={match.id} className="bg-white/5 backdrop-blur-md p-5 rounded-[20px] border border-white/10 flex justify-between items-center">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[#E020A3] text-xs font-bold uppercase mb-1">מנצח/ת</span>
                <span className="text-white font-black text-lg">{match.winnerName}</span>
              </div>
              <div className="flex flex-col items-center px-4">
                <div className="bg-white/10 px-3 py-1 rounded-full text-[#A594BA] text-[10px] whitespace-nowrap mb-2">{match.dateString}</div>
                <Trophy size={16} className="text-yellow-500 opacity-50" />
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[#A594BA] text-xs font-bold mb-1">מפסיד/ה</span>
                <span className="text-white/70 font-medium text-lg">{match.loserName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!isAdmin) {
      return (
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/10 max-w-md mx-auto mt-10 text-center relative overflow-hidden animate-in fade-in">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#FF0055] to-[#E020A3]"></div>
          <ShieldCheck size={56} className="text-[#FF0055] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,0,85,0.5)]" />
          <h2 className="text-2xl font-black text-white mb-2">כניסת הנהלה</h2>
          <p className="text-[#A594BA] text-sm mb-6">אזור מוגן - אנא הזדהה</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
            <input 
              type="text" 
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="שם משתמש" 
              className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white focus:border-[#FF0055] focus:outline-none transition-colors"
            />
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="סיסמה" 
              className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white focus:border-[#FF0055] focus:outline-none tracking-[0.3em] transition-colors"
            />
            
            {adminLoginError && (
              <div className="text-[#FF0055] text-sm font-bold bg-[#FF0055]/10 p-2 rounded-lg">פרטי התחברות שגויים</div>
            )}

            <button type="submit" className="w-full bg-[#FF0055]/10 hover:bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 font-black py-4 rounded-full transition-colors active:scale-95 mt-2">
              היכנס למערכת
            </button>
          </form>
        </div>
      );
    }

    const hasEdits = Object.keys(adminEdits).length > 0;

    return (
      <div className="space-y-6 pb-8 animate-in fade-in duration-300">
        
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10 relative">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
             <h2 className="text-xl font-black text-white flex items-center gap-2">
               <ShieldCheck className="text-[#FF0055]" />
               ניהול שחקנים
             </h2>
             <button 
               onClick={saveAdminEdits}
               disabled={!hasEdits}
               className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${hasEdits ? 'bg-[#FF0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.5)] active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
             >
               <Save size={16} /> שמור שינויים
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="text-[#A594BA] text-sm border-b border-white/10">
                  <th className="p-3 font-medium text-center">מידע</th>
                  <th className="p-3 font-medium">דירוג</th>
                  <th className="p-3 font-medium">שם שחקן</th>
                  <th className="p-3 font-medium text-center">מחק</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const currentData = adminEdits[player.id] || player;
                  const isEdited = !!adminEdits[player.id];

                  return (
                    <tr key={player.id} className={`border-b border-white/5 transition-colors ${isEdited ? 'bg-[#FF0055]/10' : 'hover:bg-white/5'}`}>
                      <td className="p-2 text-center">
                        <button onClick={() => setAdminSelectedPlayer(player)} className="text-[#A594BA] hover:text-white p-2 transition-colors">
                          <Eye size={18} className="mx-auto" />
                        </button>
                      </td>
                      <td className="p-2">
                        <input type="number" value={currentData.rank} onChange={(e) => handleAdminEditChange(player.id, 'rank', e.target.value)} 
                        className={`w-16 px-2 py-2 bg-[#0A0410]/50 border ${isEdited ? 'border-[#FF0055]' : 'border-white/10'} rounded-xl text-center text-white focus:outline-none`} />
                      </td>
                      <td className="p-2">
                        <input type="text" value={currentData.name} onChange={(e) => handleAdminEditChange(player.id, 'name', e.target.value)} 
                        className={`w-full px-3 py-2 bg-[#0A0410]/50 border ${isEdited ? 'border-[#FF0055]' : 'border-white/10'} rounded-xl text-white focus:outline-none`} />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => adminDeletePlayer(player.id)} className="text-[#FF0055] hover:text-white bg-[#FF0055]/10 hover:bg-[#FF0055] p-2 rounded-full transition-colors">
                          <Trash2 size={16} className="mx-auto" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10">
          <h2 className="text-xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-2 mb-4">
            <RefreshCw className="text-[#8A2BE2]" />
            ניהול היסטוריית משחקים
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="text-[#A594BA] text-sm border-b border-white/10">
                  <th className="p-3 font-medium text-white">מנצח</th>
                  <th className="p-3 font-medium text-[#A594BA]">מפסיד</th>
                  <th className="p-3 font-medium text-center">פעולות עריכה</th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center text-slate-500">אין משחקים</td></tr>
                ) : matches.map(match => (
                  <tr key={match.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                    <td className="p-3 font-bold text-white">{match.winnerName}</td>
                    <td className="p-3 text-[#A594BA]">{match.loserName}</td>
                    <td className="p-3 text-center flex justify-center gap-3">
                      <button onClick={() => adminReverseMatch(match)} title="הפוך תוצאה" className="text-yellow-500 hover:text-white bg-yellow-500/10 p-2 rounded-full transition-colors">
                        <RotateCcw size={16} />
                      </button>
                      <button onClick={() => adminDeleteMatch(match)} title="מחק ושחזר דירוג" className="text-[#FF0055] hover:text-white bg-[#FF0055]/10 p-2 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- Modals ---
  const renderLoginModal = () => {
    if (!loginModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
        <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative">
          <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 left-4 text-[#A594BA] hover:text-white">✕</button>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
            <LogIn size={32} />
          </div>
          <h3 className="text-2xl font-black text-center text-white mb-6">כניסה לרשומים</h3>
          <form onSubmit={handleLogin}>
            <input required type="tel" name="phone" placeholder="מספר וואטסאפ איתו נרשמת" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl focus:border-[#E020A3] focus:outline-none text-center mb-4" />
            <button type="submit" className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] text-white font-black py-4 rounded-full active:scale-95 transition-all">
              התחבר
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderStatsModal = () => {
    if (!statsModalPlayer) return null;
    const stats = getPlayerStats(statsModalPlayer.id);
    
    return (
      <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setStatsModalPlayer(null)}>
        <div className="bg-gradient-to-br from-[#1B0B2E] to-[#0A0410] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_40px_rgba(138,43,226,0.3)] relative text-center" onClick={e => e.stopPropagation()}>
          <button onClick={() => setStatsModalPlayer(null)} className="absolute top-5 left-5 text-[#A594BA] hover:text-white text-xl">✕</button>
          
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] rounded-full flex items-center justify-center text-4xl font-black text-white shadow-[0_0_20px_rgba(224,32,163,0.5)] mb-4 border-4 border-[#0A0410]">
            {statsModalPlayer.rank}
          </div>
          
          <h3 className="text-2xl font-black text-white mb-1">{statsModalPlayer.name}</h3>
          <p className="text-[#A594BA] text-sm mb-6 flex items-center justify-center gap-1"><Trophy size={14}/> מקום בסולם</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black text-white">{stats.total}</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">משחקים</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black text-[#E020A3]">{stats.winPercent}%</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">אחוזי הצלחה</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black text-emerald-400">{stats.wins}</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">ניצחונות</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black text-slate-400">{stats.losses}</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">הפסדים</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminPlayerModal = () => {
    if (!adminSelectedPlayer) return null;
    return (
      <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setAdminSelectedPlayer(null)}>
        <div className="bg-[#1B0B2E] border border-[#FF0055]/30 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative text-right" onClick={e => e.stopPropagation()}>
          <button onClick={() => setAdminSelectedPlayer(null)} className="absolute top-5 left-5 text-[#A594BA] hover:text-white text-xl">✕</button>
          
          <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">פרטי שחקן</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-[#A594BA] block text-xs">שם מלא</span>
              <strong className="text-white text-lg">{adminSelectedPlayer.name}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">מספר וואטסאפ</span>
              <strong className="text-white">{adminSelectedPlayer.phone}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">אימייל</span>
              <strong className="text-white">{adminSelectedPlayer.email || 'לא הוזן'}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">תעודת זהות</span>
              <strong className="text-white">{adminSelectedPlayer.idNumber || 'לא הוזן'}</strong>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                {adminSelectedPlayer.healthDeclaration ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-[#FF0055]" />}
                <span className="text-white">אישור הצהרת בריאות</span>
              </div>
              <div className="flex items-center gap-2">
                {adminSelectedPlayer.rulesAgreed ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-[#FF0055]" />}
                <span className="text-white">אישור תקנון ליגה</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Layout Render ---
  if (authError) return <div className="min-h-screen flex items-center justify-center bg-[#0A0410] text-[#FF0055] p-6 text-center">{authError}</div>;
  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0410]"><RefreshCw className="animate-spin text-[#E020A3] mb-4" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0410] text-white pb-24 relative overflow-hidden" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap'); * { font-family: 'Heebo', sans-serif; }`}</style>

      {/* Ambient Glow */}
      <div className="fixed top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#8A2BE2]/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#E020A3]/10 blur-[100px] pointer-events-none z-0"></div>

      <main className="max-w-xl mx-auto p-5 relative z-10">
        {view === 'home' && renderHome()}
        {view === 'join' && renderJoinForm()}
        {view === 'ladder' && renderLadder()}
        {view === 'history' && renderHistory()}
        {view === 'admin' && renderAdmin()}
      </main>

      {/* Modals */}
      {renderLoginModal()}
      {renderStatsModal()}
      {renderAdminPlayerModal()}
      
      {matchModal.isOpen && matchModal.opponent && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-[#8A2BE2] to-[#E020A3] rounded-full flex items-center justify-center mx-auto mb-6 text-white">
              <Trophy size={40} />
            </div>
            <h3 className="text-2xl font-black text-center text-white mb-2">אישור ניצחון</h3>
            <p className="text-center text-[#A594BA] mb-8">
              האם אתה מאשר שניצחת את <strong className="text-white">{matchModal.opponent.name}</strong>?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors">ביטול</button>
              <button onClick={() => submitMatchResult(localUserId, matchModal.opponent.id)} className="flex-1 py-4 bg-gradient-to-r from-[#8A2BE2] to-[#E020A3] rounded-full font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Check size={20} /> אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      {view !== 'join' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0410]/90 backdrop-blur-xl border-t border-white/10 z-20 pb-safe">
          <div className="max-w-xl mx-auto flex justify-around p-3">
            <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 transition-all ${view === 'home' ? 'text-[#E020A3]' : 'text-[#A594BA] hover:text-white'}`}>
              <Home size={24} className="mb-1" />
              <span className="text-[11px] font-bold">בית</span>
            </button>
            <button onClick={() => setView('ladder')} className={`flex flex-col items-center p-2 transition-all ${view === 'ladder' ? 'text-[#E020A3]' : 'text-[#A594BA] hover:text-white'}`}>
              <List size={24} className="mb-1" />
              <span className="text-[11px] font-bold">סולם</span>
            </button>
            <button onClick={() => setView('history')} className={`flex flex-col items-center p-2 transition-all ${view === 'history' ? 'text-[#E020A3]' : 'text-[#A594BA] hover:text-white'}`}>
              <RefreshCw size={24} className="mb-1" />
              <span className="text-[11px] font-bold">היסטוריה</span>
            </button>
            <button onClick={() => setView('admin')} className={`flex flex-col items-center p-2 transition-all ${view === 'admin' ? 'text-[#E020A3]' : 'text-[#A594BA] hover:text-white'}`}>
              <ShieldCheck size={24} className="mb-1" />
              <span className="text-[11px] font-bold">אדמין</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}