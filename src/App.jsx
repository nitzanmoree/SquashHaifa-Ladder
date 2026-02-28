import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Phone, Trash2, Check, RefreshCw, AlertTriangle, ChevronUp, Zap, Info } from 'lucide-react';

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
  const [matches, setMatches] = useState([]); // תיעוד היסטוריית משחקים
  const [view, setView] = useState('ladder');
  const [loading, setLoading] = useState(true);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false); // למניעת כפילויות ולחיצות ריקות
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin Login States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);

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
    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');
    
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

    const unsubscribeMatches = onSnapshot(matchesRef, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      matchesData.sort((a, b) => b.timestamp - a.timestamp); // חדש למעלה
      setMatches(matchesData);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, [user, view]);

  // --- Actions ---
  const handleJoin = async (e) => {
    e.preventDefault();
    if (isSubmittingJoin) return;
    setIsSubmittingJoin(true);

    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const email = e.target.email.value;
    const idNumber = e.target.idNumber.value;
    
    // מניעת באג סנכרון: חישוב בטוח של המיקום הבא
    const newRank = players.length > 0 ? players.length + 1 : 1;
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', user.uid), {
        name,
        phone,
        email,
        idNumber,
        rank: newRank,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
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

    try {
      if (sortedPlayers[winnerIdx].rank > sortedPlayers[loserIdx].rank) {
        // מודל החלפה (Upset): המנצח לוקח את המקום של המפסיד
        const winnerObj = sortedPlayers.splice(winnerIdx, 1)[0];
        sortedPlayers.splice(loserIdx, 0, winnerObj);

        // מסדר מחדש באופן מוחלט את כל המערך כדי למנוע חורים ודילוגים (1,2,3...)
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
        // המדורג גבוה ניצח את המדורג נמוך (הגן על תוארו) - הדירוג נשאר, רק תאריך מתעדכן
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', winnerId), {
          lastActive: new Date().toISOString()
        });
      }
      
      // שמירת תיעוד המשחק בהיסטוריה לאזור מנהלים
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'matches'), {
        winnerId,
        loserId,
        winnerName: sortedPlayers.find(p => p.id === winnerId)?.name || 'לא ידוע',
        loserName: sortedPlayers.find(p => p.id === loserId)?.name || 'לא ידוע',
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })
      });

      setMatchModal({ isOpen: false, opponent: null });
    } catch (err) {
      console.error("Error updating match result:", err);
      alert("אירעה שגיאה בעת עדכון התוצאה במסד הנתונים.");
    }
  };

  const openWhatsApp = (phone, myName) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      finalPhone = '972' + cleanPhone.substring(1);
    }
    const text = encodeURIComponent(`היי! מדבר ${myName} מליגת הסקווש. אני רוצה לאתגר אותך למשחק במסגרת הסולם! מתי נוח לך? 🎾`);
    const url = `https://wa.me/${finalPhone}?text=${text}`;
    
    // פתרון לבאג מסך לבן באייפון - ניווט ישיר באותו חלון למנוע חסימת פופאפ
    window.location.href = url;
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'squash2026') {
      setIsAdmin(true);
      setAdminLoginError(false);
    } else {
      setAdminLoginError(true);
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
    if (window.confirm("האם אתה בטוח שברצונך למחוק שחקן זה? המחיקה הינה סופית.")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId));
      } catch (err) {
        console.error("Admin delete error:", err);
      }
    }
  };

  const adminDeleteMatch = async (matchId) => {
    if (window.confirm("למחוק תיעוד משחק זה?\nשים לב: המחיקה אינה משנה את הדירוג אחורה באופן אוטומטי. אם יש צורך, תקן את מספרי הדירוג של השחקנים עצמם ידנית.")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId));
      } catch (err) {
        console.error("Admin delete match error:", err);
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
                
                {!isMe && myPlayer && (myPlayer.rank - player