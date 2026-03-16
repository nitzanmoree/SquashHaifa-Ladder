import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc, getDocs, getDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Trash2, Check, RefreshCw, AlertTriangle, Zap, Info, Home, List, BarChart2, LogIn, LogOut, Save, Eye, RotateCcw, KeyRound, MessageCircle, Globe, Plus, Settings, Download, PauseCircle, PlayCircle, ExternalLink } from 'lucide-react';

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

// --- Translations Dictionary ---
const translations = {
  he: {
    dir: 'rtl',
    nav_home: "בית", nav_ladder: "סולם", nav_history: "היסטוריה", nav_admin: "אדמין",
    arena_subtitle: "זירת הסולם הרשמית", hello: "שלום",
    account_frozen: "חשבונך מוקפא. אינך מופיע בסולם.",
    btn_to_ladder: "לסולם הדירוג", btn_view_ladder: "צפה בסולם",
    btn_login: "כניסה לרשומים", btn_join: "הצטרפות לליגה",
    rules_title: "חוקי הליגה", rules_subtitle: "הסולם חי ונושם בזכותכם! שחקו כדי לטפס.",
    rule1_title: "צ׳אלנג׳:", rule1_text: "אתגר שחקנים עד 3 שלבים מעליך. חובה לשחק תוך 7 ימים.",
    rule2_title: "ניצחון:", rule2_text: "ניצחת שחקן מעליך? תפסת לו את המקום!",
    rule3_title: "דיווח:", rule3_text: "המשחק נגמר? המנצח בלבד מעדכן בלחצן ״ניצחון״.",
    btn_full_rules: "תקנון הליגה והמדריך המלא",
    admin_name: "מנהל הליגה:", admin_phone: "טלפון:",
    whatsapp_group: "קהילת הוואטסאפ",
    ladder_preview: "הצצה לדירוג", no_active_players: "אין שחקנים.", show_all_ladder: "הצג הכל",
    global_network: "רשת הליגות הארצית",
    join_title: "הרשמה לליגה", f_name: "שם מלא", f_name_ph: "פרטי ומשפחה",
    f_phone: "מספר וואטסאפ", f_phone_note: "* וודאו שהמספר מדויק לתיאום משחקים.",
    f_email: "אימייל", f_id: "ת.ז / דרכון",
    f_pin: "קוד PIN", f_pin_ph: "4 ספרות", f_pin_note: "* לשימוש בכניסות הבאות.",
    f_health: "אני מצהיר כי אני כשיר לפעילות ספורטיבית.",
    f_rules: "אני מסכים לתנאי התקנון.", btn_submit_join: "הכנס אותי לסולם!", btn_joining: "רושם...",
    btn_cancel: "ביטול",
    ladder_title: "סולם הדירוג", login_required: "* התחבר כדי לבצע פעולות",
    frozen_alert: "* חשבונך מוקפא.", you: "(את/ה)", click_stats: "סטטיסטיקה",
    btn_challenge: "צ׳אלנג׳", btn_victory: "ניצחון", confirm_win_title: "אישור ניצחון", confirm_win_text: "האם ניצחת את", btn_confirm: "אישור", cancel: "ביטול",
    history_title: "תוצאות אחרונות", history_subtitle: "היסטוריית המשחקים", filter_all: "הכל", filter_mine: "שלי", no_matches: "אין משחקים.", winner: "מנצח/ת", loser: "מפסיד/ה",
    admin_login_title: "כניסת הנהלה", admin_protected: "אזור מוגן -", f_user: "משתמש", f_pass: "סיסמה",
    login_err: "פרטים שגויים", btn_admin_login: "היכנס", forgot_admin: "שכחתי סיסמה",
    manage_players: "ניהול שחקנים", btn_export: "ייצא לאקסל", btn_save: "שמור שינויים", t_info: "מידע", t_rank: "דירוג", t_name: "שם שחקן", t_actions: "קוד/מחק", active_checkbox: "פעיל",
    manage_history: "ניהול משחקים", club_settings: "הגדרות מועדון", s_name: "שם המועדון", s_color1: "צבע ראשי", s_color2: "צבע משני",
    s_admin: "שם מנהל", s_admin_pass: "סיסמה", s_phone: "טלפון", s_wa: "קישור וואטסאפ", btn_save_settings: "שמור הגדרות", btn_reset_league: "איפוס ליגה",
    sa_title: "לוח בקרה ארצי", sa_subtitle: "ניהול רשת המועדונים", sa_new_club: "הקמת מועדון", f_club_id: "מזהה (אנגלית)", f_club_name: "שם תצוגה", f_club_lang: "שפה", f_club_pass: "סיסמת מנהל", f_club_admin_name: "שם מנהל", btn_create_club: "צור ושמור",
    sa_active_clubs: "מועדונים פעילים", btn_manage: "נהל", btn_reset_pwd: "איפוס", direct_link: "לינק להעתקה:",
    forgot_pin_title: "שכחת PIN?", forgot_pin_sub: "פנה למנהל המועדון.", btn_check_details: "בדיקה",
    rules_modal_title: "תקנון המועדון", reset_modal_title: "אזהרה!", reset_modal_sub: "מחיקה סופית של הנתונים.", reset_modal_confirm: "מאשר מחיקה למועדון", btn_delete_all: "מחק",
    stats_rank: "מקום", stats_frozen: "מוקפא", stats_matches: "משחקים", stats_winrate: "הצלחה", stats_wins: "ניצחונות", stats_losses: "הפסדים", h2h_title: "ראש בראש", h2h_my_wins: "שלך", h2h_opp_wins: "שלו/ה",
    player_details: "פרטי שחקן", p_frozen: "מוקפא", p_name: "שם מלא", p_phone: "וואטסאפ", p_email: "אימייל", p_id: "ת.ז", p_health: "הצהרת בריאות", p_rules: "תקנון", close: "סגור",
    rules_welcome: "ברוכים הבאים! בהרשמתכם אתם מסכימים לתנאים הבאים:",
    privacy_title: "1. פרטיות", privacy_text: "הטלפון יהיה גלוי לשאר השחקנים לתיאום משחקים בלבד.",
    detailed_rules_title: "2. חוקי המשחק", dr_1: "דירוג בשיטת סולם.", dr_2: "אתגר עד 3 שלבים מעליך.", dr_3: "משחק בשיטת הטוב מ-5.", dr_4: "תיאום משחק תוך 7 ימים.", dr_5: "מנצח מזין תוצאה.", dr_6: "מנצח תופס את מקום המפסיד.", dr_7: "דיווח שקרי גורר הרחקה.",
    health_title: "3. הצהרת בריאות", health_text: "השחקן כשיר לספורט. ההנהלה אינה אחראית לנזק גופני.",
    guide_title: "4. מדריך טכני", guide_login: "כניסה: עם טלפון וקוד PIN.", guide_challenge: "אתגר: לחץ 'צ'אלנג' לוואטסאפ.", guide_report: "דיווח: המנצח לוחץ 'ניצחון'.", guide_stats: "סטטיסטיקה: לחץ על שחקן לראות ביצועים."
  },
  en: {
    dir: 'ltr',
    nav_home: "Home", nav_ladder: "Ladder", nav_history: "History", nav_admin: "Admin",
    arena_subtitle: "Official Ladder Arena", hello: "Hello",
    account_frozen: "Your account is frozen.",
    btn_to_ladder: "Go to Ladder", btn_view_ladder: "View Ladder",
    btn_login: "Login", btn_join: "Join League",
    rules_title: "League Rules", rules_subtitle: "The ladder lives through you! Play to climb.",
    rule1_title: "Challenge:", rule1_text: "Challenge up to 3 spots above you. Must play within 7 days.",
    rule2_title: "Victory:", rule2_text: "Winner takes the loser's spot!",
    rule3_title: "Update:", rule3_text: "Winner reports by clicking 'Victory'.",
    btn_full_rules: "Full League Rules",
    admin_name: "Admin:", admin_phone: "Phone:",
    whatsapp_group: "WhatsApp",
    ladder_preview: "Standings", no_active_players: "No players.", show_all_ladder: "Show All",
    global_network: "Global League Network",
    join_title: "Registration", f_name: "Full Name", f_name_ph: "First & Last",
    f_phone: "WhatsApp", f_phone_note: "* For match coordination.",
    f_email: "Email", f_id: "ID / Passport",
    f_pin: "PIN Code", f_pin_ph: "4 Digits", f_pin_note: "* For future logins.",
    f_health: "I am fit for sports.",
    f_rules: "I agree to the rules.", btn_submit_join: "Join Ladder!", btn_joining: "Registering...",
    btn_cancel: "Cancel",
    ladder_title: "Ladder", login_required: "* Login to record results",
    frozen_alert: "* Account frozen.", you: "(You)", click_stats: "Stats",
    btn_challenge: "Challenge", btn_victory: "Victory", confirm_win_title: "Confirm Win", confirm_win_text: "Did you win against", btn_confirm: "Confirm", cancel: "Cancel",
    history_title: "Recent Results", history_subtitle: "Match History", filter_all: "All", filter_mine: "Mine", no_matches: "No matches.", winner: "Winner", loser: "Loser",
    admin_login_title: "Admin", admin_protected: "Protected Area -", f_user: "User", f_pass: "Password",
    login_err: "Invalid credentials", btn_admin_login: "Login", forgot_admin: "Forgot password",
    manage_players: "Players", btn_export: "Export", btn_save: "Save", t_info: "Info", t_rank: "Rank", t_name: "Name", t_actions: "PIN/Del", active_checkbox: "Active",
    manage_history: "History", club_settings: "Club Settings", s_name: "Club Name", s_color1: "Primary", s_color2: "Secondary",
    s_admin: "Admin", s_admin_pass: "Password", s_phone: "Phone", s_wa: "WA Link", btn_save_settings: "Save", btn_reset_league: "Reset Data",
    sa_title: "Global Dashboard", sa_subtitle: "Clubs Management", sa_new_club: "New Club", f_club_id: "ID", f_club_name: "Name", f_club_lang: "Language", f_club_pass: "Admin Password", f_club_admin_name: "Admin Name", btn_create_club: "Create",
    sa_active_clubs: "Active Clubs", btn_manage: "Manage", btn_reset_pwd: "Reset", direct_link: "Link:",
    forgot_pin_title: "Forgot PIN?", forgot_pin_sub: "Contact admin.", btn_check_details: "Check",
    rules_modal_title: "Regulations", reset_modal_title: "WARNING!", reset_modal_sub: "Data will be deleted.", reset_modal_confirm: "Confirm for", btn_delete_all: "Delete",
    stats_rank: "Rank", stats_frozen: "Frozen", stats_matches: "Matches", stats_winrate: "Success", stats_wins: "Wins", stats_losses: "Losses", h2h_title: "Head-to-Head", h2h_my_wins: "Yours", h2h_opp_wins: "Theirs",
    player_details: "Player Info", p_frozen: "Frozen", p_name: "Name", p_phone: "WhatsApp", p_email: "Email", p_id: "ID", p_health: "Health", p_rules: "Rules", close: "Close",
    rules_welcome: "Welcome! By registering, you agree:",
    privacy_title: "1. Privacy", privacy_text: "Numbers shared for coordination only.",
    detailed_rules_title: "2. Rules", dr_1: "Ladder leapfrog system.", dr_2: "Challenge up to 3 ranks.", dr_3: "Best of 5.", dr_4: "Play within 7 days.", dr_5: "Winner updates score.", dr_6: "Winner takes spot.", dr_7: "False info = ban.",
    health_title: "3. Health", health_text: "Fit for sports.",
    guide_title: "4. Technical Guide", guide_login: "Login via WA and PIN.", guide_challenge: "Challenge via WhatsApp.", guide_report: "Winner reports win.", guide_stats: "View performance."
  }
};

const hexToRgb = (hex) => {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length === 3){ c = [c[0], c[0], c[1], c[1], c[2], c[2]]; }
        c = '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255].join(',');
    }
    return '138,43,226'; 
}

export default function App() {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const clubFromUrl = pathSegments.length > 0 ? pathSegments[0] : 'haifa';
  
  const [currentClubId, setCurrentClubId] = useState(clubFromUrl);
  const [user, setUser] = useState(null);
  const [localUserId, setLocalUserId] = useState(localStorage.getItem(`squash_user_id_${currentClubId}`) || null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [adminPrivateData, setAdminPrivateData] = useState({});
  
  const [leagueConfig, setLeagueConfig] = useState({ 
      displayName: "סקווש חיפה", language: "he", adminName: "ניצן מורה", 
      adminPhone: "054-4372323", adminPassword: "squash2026",
      whatsappGroupLink: "", themePrimary: "#8A2BE2", themeSecondary: "#E020A3", docId: null
  });

  const lang = leagueConfig.language || 'he';
  const dict = translations[lang] || translations['he'];

  const [view, setView] = useState('home');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); 
  const [allClubs, setAllClubs] = useState([]); 
  const [newClubForm, setNewClubForm] = useState({ id: '', name: '', password: '', language: 'he', adminName: '' });
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [statsModalPlayer, setStatsModalPlayer] = useState(null);
  const [matchModal, setMatchModal] = useState({ isOpen: false, opponent: null });
  const [adminSelectedPlayer, setAdminSelectedPlayer] = useState(null); 
  const [adminEdits, setAdminEdits] = useState({});
  const [adminConfigEdit, setAdminConfigEdit] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmResetChecked, setConfirmResetChecked] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);

  const pPath = currentClubId === 'haifa' ? 'players' : `players_${currentClubId}`;
  const privPath = currentClubId === 'haifa' ? 'private' : `private_${currentClubId}`;
  const mPath = currentClubId === 'haifa' ? 'matches' : `matches_${currentClubId}`;
  const cPath = currentClubId === 'haifa' ? 'config' : `config_${currentClubId}`;

  useEffect(() => {
    document.title = leagueConfig.displayName || "Squash League";
  }, [leagueConfig.displayName]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        setAuthError(err.message);
        setLoading(false);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', pPath);
    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', mPath);
    const configRef = collection(db, 'artifacts', appId, 'public', 'data', cPath);
    
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, isActive: doc.data().isActive !== false, ...doc.data() }));
      playersData.sort((a, b) => a.rank - b.rank);
      setPlayers(playersData);
      setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });

    const unsubscribeMatches = onSnapshot(matchesRef, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      matchesData.sort((a, b) => b.timestamp - a.timestamp);
      setMatches(matchesData);
    });

    const unsubscribeConfig = onSnapshot(configRef, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setLeagueConfig({ displayName: data.displayName || "סקווש חיפה", language: data.language || "he", adminName: data.adminName || "ניצן מורה", adminPhone: data.adminPhone || "054-4372323", adminPassword: data.adminPassword || "squash2026", whatsappGroupLink: data.whatsappGroupLink || "", themePrimary: data.themePrimary || "#8A2BE2", themeSecondary: data.themeSecondary || "#E020A3", docId: snapshot.docs[0].id });
        }
    });

    const globalClubsRef = collection(db, 'artifacts', appId, 'public', 'data', 'global_clubs');
    const unsubscribeGlobalClubs = onSnapshot(globalClubsRef, (snapshot) => {
        const clubsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!clubsData.some(c => c.clubId === 'haifa')) { clubsData.push({ clubId: 'haifa', displayName: 'סקווש חיפה' }); }
        setAllClubs(clubsData);
    });

    return () => { unsubscribePlayers(); unsubscribeMatches(); unsubscribeConfig(); unsubscribeGlobalClubs(); };
  }, [user, currentClubId, pPath, mPath, cPath]);

  useEffect(() => {
    if (isAdmin) {
        const fetchPrivateData = async () => {
            const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', privPath));
            const data = {};
            snap.forEach(d => { data[d.id] = d.data(); });
            setAdminPrivateData(data);
        };
        fetchPrivateData();
    }
  }, [isAdmin, privPath]);

  const activePlayers = players.filter(p => p.isActive !== false);
  const cleanPhone = (p) => p.replace(/\D/g, '');

  const getPlayerStats = (playerId) => {
    const playerMatches = matches.filter(m => m.winnerId === playerId || m.loserId === playerId);
    const wins = playerMatches.filter(m => m.winnerId === playerId).length;
    const losses = playerMatches.length - wins;
    const winPercent = playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0;
    return { total: playerMatches.length, wins, losses, winPercent };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const inputPhone = cleanPhone(e.target.phone.value);
    const inputPin = e.target.pin.value;
    const foundPublic = players.find(p => cleanPhone(p.phone) === inputPhone);
    if (foundPublic) {
        try {
            const privateDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, foundPublic.id));
            const actualPin = privateDoc.exists() ? privateDoc.data().pin : foundPublic.pin;
            if (actualPin === inputPin) {
                localStorage.setItem(`squash_user_id_${currentClubId}`, foundPublic.id);
                setLocalUserId(foundPublic.id);
                setLoginModalOpen(false);
                setView('ladder');
                return;
            }
        } catch (err) { console.error(err); }
    }
    alert(lang === 'he' ? "מספר הטלפון או קוד הגישה שגויים." : "Invalid phone or PIN.");
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (isSubmittingJoin) return;
    const phone = e.target.phone.value;
    const pin = e.target.pin.value;
    if (pin.length !== 4) { alert(dict.f_pin_ph); return; }
    if (players.some(p => cleanPhone(p.phone) === cleanPhone(phone))) { alert(lang === 'he' ? "רשום כבר." : "Already registered."); return; }
    setIsSubmittingJoin(true);
    const newRank = activePlayers.length > 0 ? activePlayers.length + 1 : 1;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, user.uid), {
        name: e.target.name.value, phone, rank: newRank, isActive: true, joinedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, user.uid), {
        email: e.target.email.value, idNumber: e.target.idNumber.value, pin, healthDeclaration: e.target.health.checked, rulesAgreed: e.target.rulesCheck.checked
      });
      localStorage.setItem(`squash_user_id_${currentClubId}`, user.uid);
      setLocalUserId(user.uid);
      setView('ladder');
    } catch (err) { console.error(err); } finally { setIsSubmittingJoin(false); }
  };

  const handleLogout = () => { localStorage.removeItem(`squash_user_id_${currentClubId}`); setLocalUserId(null); setView('home'); };

  const togglePlayerStatus = async () => {
      if (!myPlayer) return;
      const newStatus = myPlayer.isActive === false;
      if (newStatus === false) {
           if (!window.confirm(lang === 'he' ? "בטוח?" : "Sure?")) return;
           const sortedActive = [...activePlayers].sort((a,b) => a.rank - b.rank);
           const updates = sortedActive.filter(p => p.rank > myPlayer.rank).map(p => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), { rank: p.rank - 1 }));
           updates.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, myPlayer.id), { isActive: false, rank: 9999 }));
           await Promise.all(updates);
      } else {
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, myPlayer.id), { isActive: true, rank: activePlayers.length + 1, lastActive: new Date().toISOString() });
      }
  }

  const submitMatchResult = async (winnerId, loserId) => {
    const sortedPlayers = [...activePlayers].sort((a, b) => a.rank - b.rank);
    const winnerIdx = sortedPlayers.findIndex(p => p.id === winnerId);
    const loserIdx = sortedPlayers.findIndex(p => p.id === loserId);
    if (winnerIdx === -1 || loserIdx === -1) return;
    const playersSnapshot = sortedPlayers.map(p => ({ id: p.id, rank: p.rank }));
    try {
      if (sortedPlayers[winnerIdx].rank > sortedPlayers[loserIdx].rank) {
        const winnerObj = sortedPlayers.splice(winnerIdx, 1)[0];
        sortedPlayers.splice(loserIdx, 0, winnerObj);
        const updates = sortedPlayers.map((p, index) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), { rank: index + 1, ...(p.id === winnerId ? { lastActive: new Date().toISOString() } : {}) }));
        await Promise.all(updates);
      } else {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, winnerId), { lastActive: new Date().toISOString() });
      }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', mPath), { winnerId, loserId, winnerName: activePlayers.find(p => p.id === winnerId)?.name, loserName: activePlayers.find(p => p.id === loserId)?.name, playersSnapshot, timestamp: Date.now(), dateString: new Date().toLocaleString(lang === 'he' ? 'he-IL' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) });
      setMatchModal({ isOpen: false, opponent: null });
    } catch (err) { console.error(err); }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUsername === 'superadmin' && adminPassword === 'master2026') { setIsSuperAdmin(true); setAdminLoginError(false); return; }
    if (adminUsername === 'admin' && adminPassword === (leagueConfig.adminPassword || 'squash2026')) { setIsAdmin(true); setAdminLoginError(false); setAdminConfigEdit({ ...leagueConfig }); } else { setAdminLoginError(true); }
  };

  const handleAdminEditChange = (id, field, value) => { setAdminEdits(prev => ({ ...prev, [id]: { ...(prev[id] || players.find(p => p.id === id)), [field]: value } })); };

  const saveAdminEdits = async () => {
    const updates = Object.keys(adminEdits).map(id => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, id), { name: adminEdits[id].name, rank: parseInt(adminEdits[id].rank, 10), isActive: adminEdits[id].isActive !== false }));
    await Promise.all(updates);
    setAdminEdits({});
    alert(lang === 'he' ? "נשמר!" : "Saved!");
  };

  const handleCreateClub = async (e) => {
      e.preventDefault();
      const clubId = newClubForm.id.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (!clubId || !newClubForm.name) return;
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'global_clubs'), { clubId: clubId, displayName: newClubForm.name, createdAt: new Date().toISOString() });
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `config_${clubId}`), { displayName: newClubForm.name, language: newClubForm.language || 'he', adminName: newClubForm.adminName || "Admin", adminPhone: "", adminPassword: newClubForm.password || "123456", themePrimary: "#8A2BE2", themeSecondary: "#E020A3" });
          alert(`Club Created! Link: /${clubId}`);
          setNewClubForm({ id: '', name: '', password: '', language: 'he', adminName: '' });
      } catch (err) { console.error(err); }
  };

  const themeStyles = `
      :root {
        --theme-primary: ${leagueConfig.themePrimary || '#8A2BE2'};
        --theme-secondary: ${leagueConfig.themeSecondary || '#E020A3'};
        --theme-primary-rgb: ${hexToRgb(leagueConfig.themePrimary || '#8A2BE2')};
        --theme-secondary-rgb: ${hexToRgb(leagueConfig.themeSecondary || '#E020A3')};
      }
      .theme-text-primary { color: var(--theme-primary); }
      .theme-text-secondary { color: var(--theme-secondary); }
      .theme-bg-primary { background-color: var(--theme-primary); }
      .theme-bg-secondary { background-color: var(--theme-secondary); }
      .theme-bg-primary-10 { background-color: rgba(var(--theme-primary-rgb), 0.1); }
      .theme-bg-primary-20 { background-color: rgba(var(--theme-primary-rgb), 0.2); }
      .theme-bg-secondary-hover:hover { background-color: rgba(var(--theme-secondary-rgb), 0.8); }
      .theme-border-primary { border-color: var(--theme-primary); }
      .theme-border-secondary { border-color: var(--theme-secondary); }
      .theme-gradient-r { background: linear-gradient(to right, var(--theme-primary), var(--theme-secondary)); }
      .theme-gradient-br { background: linear-gradient(to bottom right, var(--theme-primary), var(--theme-secondary)); }
      .theme-glow-primary-20 { box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.2); }
      .theme-glow-secondary-40 { box-shadow: 0 8px 25px rgba(var(--theme-secondary-rgb), 0.4); }
      .theme-glow-secondary-50 { box-shadow: 0 0 30px rgba(var(--theme-secondary-rgb), 0.5); }
      .theme-input:focus { border-color: var(--theme-secondary); outline: none; }
      .theme-accent { accent-color: var(--theme-secondary); }
  `;

  if (authError) return <div className="min-h-screen flex items-center justify-center bg-[#0A0410] text-[#FF0055] p-6 text-center">{authError}</div>;
  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0410]"><RefreshCw className="animate-spin theme-text-secondary mb-4" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0410] text-white pb-24 relative overflow-hidden" dir={dict.dir}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap'); 
        * { font-family: 'Heebo', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        ${themeStyles}
      `}</style>
      <main className="max-w-xl mx-auto p-5 relative z-10">
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 text-start">
            <div className="text-center pt-8 pb-2 relative">
              <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 theme-bg-secondary-20 rounded-full blur-[60px] z-0"></div>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full theme-gradient-br mb-6 theme-glow-secondary-50 relative z-10"><Trophy size={40} className="text-white" /></div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A594BA] mb-2 relative z-10">{leagueConfig.displayName}</h1>
              <p className="text-[#A594BA] relative z-10 font-medium tracking-wide">{dict.arena_subtitle}</p>
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              {myPlayer ? (
                <div className="bg-white/10 backdrop-blur-xl p-5 rounded-[24px] border theme-border-primary-30 text-center theme-glow-primary-20">
                  <p className="text-[#A594BA] mb-2">{dict.hello}, <strong className="text-white">{myPlayer.name}</strong></p>
                  {myPlayer.isActive === false && <div className="bg-amber-500/10 text-amber-400 text-sm font-bold p-2 rounded-lg mt-2 mb-2 border border-amber-500/20">{dict.account_frozen}</div>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setView('ladder')} className="flex-1 theme-gradient-r text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 text-sm">{myPlayer.isActive === false ? dict.btn_view_ladder : dict.btn_to_ladder}</button>
                    <button onClick={togglePlayerStatus} className={`px-4 font-bold py-3 rounded-xl transition-colors flex items-center justify-center text-sm ${myPlayer.isActive === false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 border border-white/10 text-[#A594BA]'}`}>{myPlayer.isActive === false ? <PlayCircle size={20} /> : <PauseCircle size={20} />}</button>
                    <button onClick={handleLogout} className="px-4 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 flex items-center justify-center"><LogOut size={20} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => setLoginModalOpen(true)} className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-lg"><LogIn size={22} /> {dict.btn_login}</button>
                  <button onClick={() => setView('join')} className="w-full theme-gradient-r text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 theme-glow-secondary-40 transition-all"><UserPlus size={22} /> {dict.btn_join}</button>
                </>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-7 border border-white/10 shadow-xl relative z-10 mt-6">
              <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4"><Info size={24} className="theme-text-primary"/><h2 className="text-xl font-black text-white">{dict.rules_title}</h2></div>
              <ul className="space-y-4 text-sm text-[#A594BA]">
                <li className="flex items-start gap-3"><span className="theme-bg-secondary w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">1</span><div><strong className="text-white">{dict.rule1_title}</strong> {dict.rule1_text}</div></li>
                <li className="flex items-start gap-3"><span className="theme-bg-primary w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">2</span><div><strong className="text-white">{dict.rule2_title}</strong> {dict.rule2_text}</div></li>
                <li className="flex items-start gap-3"><span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">3</span><div><strong className="text-white">{dict.rule3_title}</strong> {dict.rule3_text}</div></li>
              </ul>
              <button onClick={() => setShowRulesModal(true)} className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">{dict.btn_full_rules}</button>
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center"><p className="text-white font-bold mb-1">{dict.admin_name} {leagueConfig.adminName}</p><p className="text-[#A594BA] text-sm">{dict.admin_phone} <a href={`tel:${leagueConfig.adminPhone}`} className="theme-text-secondary" dir="ltr">{leagueConfig.adminPhone}</a></p></div>
            </div>
            {allClubs.length > 1 && (
                <div className="mt-6 mb-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-[#A594BA] text-xs uppercase tracking-widest font-bold mb-3 flex items-center justify-center gap-1"><Globe size={12} /> {dict.global_network}</p>
                    <div className="flex flex-wrap justify-center gap-2">{allClubs.filter(c => c.clubId !== currentClubId).map(club => (<a key={club.clubId} href={`/${club.clubId}`} className="text-xs bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/10">{club.displayName}</a>))}</div>
                </div>
            )}
          </div>
        )}
        {view === 'join' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 mt-6 text-start" dir={dict.dir}>
            <div className="bg-gradient-to-br from-[#0A0410]/90 to-[#1B0B2E]/90 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border theme-border-secondary-30 relative overflow-hidden">
              <h2 className="text-2xl font-black text-white mb-6">{dict.join_title}</h2>
              <form onSubmit={handleJoin} className="space-y-5 relative z-10">
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_name}</label><input required type="text" name="name" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none" placeholder={dict.f_name_ph} /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_phone}</label><input required type="tel" name="phone" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input" dir="ltr" /><p className="text-xs text-yellow-400/90 mt-2 font-bold leading-tight">{dict.f_phone_note}</p></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_email}</label><input required type="email" name="email" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input" dir="ltr" /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_id}</label><input required type="text" name="idNumber" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input" dir="ltr" /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_pin}</label><input required type="password" name="pin" pattern="\d{4}" maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none text-center tracking-[0.5em]" placeholder="••••" dir="ltr" /></div>
                <div className="pt-2 border-t border-white/10"><div className="flex items-start gap-3 mt-4"><input required type="checkbox" id="health" className="mt-1 w-4 h-4 theme-accent" /><label htmlFor="health" className="text-sm text-[#A594BA] leading-tight cursor-pointer">{dict.f_health}</label></div><div className="flex items-start gap-3 mt-4"><input required type="checkbox" id="rulesCheck" className="mt-1 w-4 h-4 theme-accent" /><label htmlFor="rulesCheck" className="text-sm text-[#A594BA] leading-tight cursor-pointer" onClick={() => setShowRulesModal(true)}>{dict.f_rules}</label></div></div>
                <button type="submit" disabled={isSubmittingJoin} className="w-full theme-gradient-r text-white font-black text-lg py-4 rounded-full active:scale-95 mt-4 disabled:opacity-50">{isSubmittingJoin ? dict.btn_joining : dict.btn_submit_join}</button>
                <button type="button" onClick={() => setView('home')} className="w-full mt-3 text-[#A594BA] hover:text-white transition-colors py-2 text-sm font-bold">{dict.btn_cancel}</button>
              </form>
            </div>
          </div>
        )}
        {view === 'ladder' && (
          <div className="space-y-4 pb-8 mt-4 animate-in fade-in duration-300">
            <div className="text-center pb-6 relative"><h2 className="text-3xl font-black text-white relative z-10 flex justify-center items-center gap-3"><List className="theme-text-secondary" size={32} /> {dict.ladder_title}</h2>{!myPlayer ? (<p className="theme-text-secondary mt-2 text-sm relative z-10">{dict.login_required}</p>) : myPlayer.isActive === false ? (<p className="text-amber-400 mt-2 text-sm relative z-10">{dict.frozen_alert}</p>) : null}</div>
            {activePlayers.map((player) => (
              <div key={player.id} onClick={() => setStatsModalPlayer(player)} className={`flex items-center justify-between p-4 rounded-[24px] border transition-all ${myPlayer?.id === player.id ? 'theme-bg-primary-10 theme-border-secondary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="flex items-center gap-3 text-start"><div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-lg shrink-0 ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' : 'bg-white/10'}`}>{player.rank}</div><div className="flex flex-col"><h3 className="font-bold text-white tracking-wide">{player.name} {myPlayer?.id === player.id && <span className="theme-text-secondary text-xs ms-1">{dict.you}</span>}</h3><span className="text-[#A594BA] text-[11px] sm:text-xs flex items-center gap-1 mt-0.5"><BarChart2 size={12}/> {dict.click_stats}</span></div></div>
                <div className="flex flex-col gap-2 shrink-0">
                  {myPlayer && myPlayer.isActive !== false && myPlayer.id !== player.id && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3 && (<button onClick={(e) => openWhatsApp(player.phone, myPlayer.name, e)} className="theme-gradient-r text-white px-5 py-2 rounded-full text-sm font-black active:scale-95"><Zap size={16} fill="currentColor" /> {dict.btn_challenge}</button>)}
                  {myPlayer && myPlayer.id !== player.id && myPlayer.isActive !== false && Math.abs(myPlayer.rank - player.rank) <= 3 && (<button onClick={(e) => { e.stopPropagation(); setMatchModal({ isOpen: true, opponent: player }); }} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/20 active:scale-95">{dict.btn_victory}</button>)}
                </div>
              </div>
            ))}
          </div>
        )}
        {view === 'history' && (
          <div className="space-y-6 pb-8 mt-4 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-white text-center flex justify-center items-center gap-3"><RefreshCw className="theme-text-primary" size={32} /> {dict.history_title}</h2>
            <div className="flex justify-center gap-3 mb-6 bg-white/5 p-1.5 rounded-full border border-white/10 max-w-xs mx-auto">
                <button onClick={() => setHistoryFilter('all')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${historyFilter === 'all' ? 'theme-bg-secondary text-white' : 'text-[#A594BA]'}`}>{dict.filter_all}</button>
                {localUserId && <button onClick={() => setHistoryFilter('personal')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${historyFilter === 'personal' ? 'theme-bg-primary text-white' : 'text-[#A594BA]'}`}>{dict.filter_mine}</button>}
            </div>
            <div className="space-y-3">
              {matches.filter(m => historyFilter === 'personal' ? (m.winnerId === localUserId || m.loserId === localUserId) : true).map(match => (
                <div key={match.id} className="backdrop-blur-md p-4 rounded-[20px] border border-white/10 flex justify-between items-center">
                  <div className="flex flex-col items-center flex-1 text-center"><span className="theme-text-secondary text-[10px] font-bold uppercase mb-1">{dict.winner}</span><span className="font-black text-white">{match.winnerName}</span></div>
                  <div className="flex flex-col items-center px-4 shrink-0"><div className="bg-white/10 px-3 py-1 rounded-full text-[#A594BA] text-[10px] mb-2" dir="ltr">{match.dateString}</div><Trophy size={14} className="text-yellow-500 opacity-50" /></div>
                  <div className="flex flex-col items-center flex-1 text-center"><span className="text-[#A594BA] text-[10px] font-bold mb-1">{dict.loser}</span><span className="font-medium text-white/70">{match.loserName}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'admin' && (
          <div className="space-y-6 pb-8 animate-in fade-in duration-300 text-start" dir={dict.dir}>
            {isSuperAdmin ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden border border-indigo-500/30">
                  <Globe size={48} className="text-white/20 absolute -end-4 -bottom-4 w-32 h-32" />
                  <h2 className="text-3xl font-black text-white relative z-10">{dict.sa_title}</h2>
                  <p className="text-indigo-200 relative z-10">{dict.sa_subtitle}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-4"><Plus className="text-emerald-400" /> {dict.sa_new_club}</h3>
                  <form onSubmit={handleCreateClub} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_id}</label><input type="text" value={newClubForm.id} onChange={(e) => setNewClubForm({...newClubForm, id: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" dir="ltr" /></div>
                    <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_name}</label><input type="text" value={newClubForm.name} onChange={(e) => setNewClubForm({...newClubForm, name: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" /></div>
                    <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_lang}</label><select value={newClubForm.language} onChange={(e) => setNewClubForm({...newClubForm, language: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white"><option value="he">עברית</option><option value="en">English</option></select></div>
                    <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_admin_name}</label><input type="text" value={newClubForm.adminName} onChange={(e) => setNewClubForm({...newClubForm, adminName: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" /></div>
                    <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_pass}</label><input type="text" value={newClubForm.password} onChange={(e) => setNewClubForm({...newClubForm, password: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" dir="ltr" /></div>
                    <div className="sm:col-span-2"><button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg h-[50px]">{dict.btn_create_club}</button></div>
                  </form>
                </div>
                <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">{dict.sa_active_clubs}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allClubs.map(club => (
                    <div key={club.clubId} className="bg-white/5 p-5 rounded-[20px] border border-white/10 flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-start gap-2"><h4 className="text-lg font-bold text-white">{club.displayName}</h4><button onClick={() => window.location.href = `/${club.clubId}`} className="flex-1 sm:flex-none bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Settings size={16} /> {dict.btn_manage}</button></div>
                      <div className="bg-[#0A0410]/50 p-3 rounded-xl border border-white/5 mt-1"><p className="text-[10px] text-[#A594BA] mb-1 font-bold">{dict.direct_link}</p><p className="text-sm text-emerald-400 font-mono select-all cursor-pointer" dir="ltr">{window.location.origin}/{club.clubId}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !isAdmin ? (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/10 max-w-md mx-auto mt-10 text-center relative overflow-hidden animate-in fade-in" dir={dict.dir}>
                <div className="absolute top-0 end-0 w-full h-1 bg-gradient-to-r from-[#FF0055] to-white"></div>
                <ShieldCheck size={56} className="text-[#FF0055] mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">{dict.admin_login_title}</h2>
                <p className="text-[#A594BA] text-sm mb-6">{dict.admin_protected} <strong className="text-white">{leagueConfig.displayName}</strong></p>
                <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
                  <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder={dict.f_user} className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white focus:outline-none" dir="ltr" />
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder={dict.f_pass} className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white tracking-[0.3em]" dir="ltr" />
                  {adminLoginError && <div className="text-[#FF0055] text-sm font-bold bg-[#FF0055]/10 p-2 rounded-lg">{dict.login_err}</div>}
                  <button type="submit" className="w-full bg-[#FF0055]/10 hover:bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 font-black py-4 rounded-full active:scale-95 mt-2">{dict.btn_admin_login}</button>
                  <button type="button" onClick={() => alert("Contact Super Admin for password recovery.")} className="w-full text-[#A594BA] text-sm py-2 hover:text-white transition-colors mt-2">{dict.forgot_admin}</button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10 relative">
                  <div className="flex flex-wrap justify-between items-center mb-6 border-b border-white/10 pb-4 gap-4">
                     <h2 className="text-xl font-black text-white flex items-center gap-2"><ShieldCheck className="text-[#FF0055]" /> {dict.manage_players}</h2>
                     <div className="flex gap-3 w-full sm:w-auto">
                         <button onClick={exportPlayersToCSV} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"><Download size={16} /> {dict.btn_export}</button>
                         <button onClick={saveAdminEdits} disabled={Object.keys(adminEdits).length === 0} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${Object.keys(adminEdits).length > 0 ? 'bg-[#FF0055] text-white' : 'bg-white/10 text-white/30'}`}><Save size={16} /> {dict.btn_save}</button>
                     </div>
                  </div>
                  <div className="overflow-x-auto"><table className="w-full text-start"><thead><tr className="text-[#A594BA] text-sm border-b border-white/10"><th className="p-3 font-medium text-center">{dict.t_info}</th><th className="p-3 font-medium text-start">{dict.t_rank}</th><th className="p-3 font-medium text-start">{dict.t_name}</th><th className="p-3 font-medium text-center">{dict.t_actions}</th></tr></thead><tbody>{players.map(player => (
                    <tr key={player.id} className={`border-b border-white/5 ${adminEdits[player.id] ? 'bg-[#FF0055]/10' : ''}`}>
                      <td className="p-2 text-center"><button onClick={() => setAdminSelectedPlayer(player)} className="text-[#A594BA] hover:text-white"><Eye size={18} /></button></td>
                      <td className="p-2 flex flex-col gap-1 items-start"><input type="number" value={adminEdits[player.id]?.rank ?? player.rank} onChange={(e) => handleAdminEditChange(player.id, 'rank', e.target.value)} className="w-16 px-2 py-1 bg-[#0A0410]/50 border border-white/10 rounded-lg text-center text-white" /><label className="text-[10px] text-[#A594BA]"><input type="checkbox" checked={adminEdits[player.id]?.isActive ?? player.isActive} onChange={(e) => handleAdminEditChange(player.id, 'isActive', e.target.checked)} className="accent-emerald-500" /> {dict.active_checkbox}</label></td>
                      <td className="p-2 text-start"><input type="text" value={adminEdits[player.id]?.name ?? player.name} onChange={(e) => handleAdminEditChange(player.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" /></td>
                      <td className="p-2 text-center"><button onClick={() => { if(window.confirm('Delete?')) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, player.id)); }} className="text-[#FF0055] bg-[#FF0055]/10 p-2 rounded-full"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}</tbody></table></div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {loginModalOpen && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setLoginModalOpen(false)}>
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 start-4 text-[#A594BA]">✕</button>
            <h3 className="text-2xl font-black text-center text-white mb-6">{dict.btn_login}</h3>
            <form onSubmit={handleLogin}><input required type="tel" name="phone" placeholder={dict.f_phone} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl mb-3" dir="ltr" /><input required type="password" name="pin" placeholder={dict.f_pin_ph} maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl mb-4 text-center tracking-[0.5em]" dir="ltr" /><button type="submit" className="w-full theme-gradient-r text-white font-black py-4 rounded-full active:scale-95 mb-2">{dict.btn_login}</button></form>
          </div>
        </div>
      )}

      {statsModalPlayer && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setStatsModalPlayer(null)}>
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto theme-gradient-br rounded-full flex items-center justify-center text-3xl font-black text-white mb-4">{statsModalPlayer.isActive === false ? '-' : statsModalPlayer.rank}</div>
            <h3 className="text-2xl font-black text-white mb-6">{statsModalPlayer.name}</h3>
            <div className="grid grid-cols-2 gap-4"><div className="bg-white/5 rounded-2xl p-4"><div>{getPlayerStats(statsModalPlayer.id).total}</div><div className="text-xs text-[#A594BA]">{dict.stats_matches}</div></div><div className="bg-white/5 rounded-2xl p-4"><div>{getPlayerStats(statsModalPlayer.id).winPercent}%</div><div className="text-xs text-[#A594BA]">{dict.stats_winrate}</div></div></div>
            <button onClick={() => setStatsModalPlayer(null)} className="w-full mt-6 bg-white/10 py-3 rounded-full">{dict.close}</button>
          </div>
        </div>
      )}

      {adminSelectedPlayer && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setAdminSelectedPlayer(null)}>
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
            <h3 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4">{dict.player_details}</h3>
            <div className="space-y-3"><div><span className="text-[#A594BA] text-xs">{dict.p_name}</span><div className="text-white font-bold">{adminSelectedPlayer.name}</div></div><div><span className="text-[#A594BA] text-xs">{dict.p_phone}</span><div className="text-white" dir="ltr">{adminSelectedPlayer.phone}</div></div><div><span className="text-[#A594BA] text-xs">{dict.p_email}</span><div className="text-white" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.email || '-'}</div></div><div><span className="text-[#A594BA] text-xs">ID Number</span><div className="text-white" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.idNumber || '-'}</div></div><div><span className="text-[#A594BA] text-xs">PIN Code</span><div className="text-white font-mono">{adminPrivateData[adminSelectedPlayer.id]?.pin || '-'}</div></div></div>
            <button onClick={() => setAdminSelectedPlayer(null)} className="w-full mt-6 bg-white/10 py-3 rounded-full">{dict.close}</button>
          </div>
        </div>
      )}

      {showRulesModal && (
        <div className="fixed inset-0 bg-[#0A0410]/90 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in" onClick={() => setShowRulesModal(false)}>
           <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative max-h-[80vh] overflow-y-auto text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
               <h3 className="text-2xl font-black text-white mb-4 border-b border-white/10 pb-4">{dict.rules_modal_title}</h3>
               <div className="text-[#A594BA] space-y-4 text-sm leading-relaxed">
                   <p>{dict.rules_welcome}</p>
                   <h4 className="text-white font-bold">{dict.privacy_title}</h4><p>{dict.privacy_text}</p>
                   <h4 className="text-white font-bold">{dict.detailed_rules_title}</h4><ul className="list-disc ps-5 space-y-2"><li>{dict.dr_1}</li><li>{dict.dr_2}</li><li>{dict.dr_3}</li><li>{dict.dr_4}</li><li>{dict.dr_5}</li><li>{dict.dr_6}</li><li>{dict.dr_7}</li></ul>
                   <h4 className="text-white font-bold">{dict.health_title}</h4><p>{dict.health_text}</p>
                   <h4 className="text-white font-bold">{dict.guide_title}</h4><ul className="list-disc ps-5 space-y-2"><li><strong>{dict.guide_login.split(':')[0]}:</strong> {dict.guide_login.split(':')[1]}</li><li><strong>{dict.guide_challenge.split(':')[0]}:</strong> {dict.guide_challenge.split(':')[1]}</li><li><strong>{dict.guide_report.split(':')[0]}:</strong> {dict.guide_report.split(':')[1]}</li><li><strong>{dict.guide_stats.split(':')[0]}:</strong> {dict.guide_stats.split(':')[1]}</li></ul>
               </div>
               <button onClick={() => setShowRulesModal(false)} className="w-full mt-6 theme-bg-secondary text-white font-bold py-3 rounded-full">{dict.close}</button>
           </div>
        </div>
      )}

      {matchModal.isOpen && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-black text-white mb-4">{dict.confirm_win_title}</h3>
            <p className="text-[#A594BA] mb-8">{dict.confirm_win_text} <strong className="text-white">{matchModal.opponent?.name}</strong>?</p>
            <div className="flex gap-4"><button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full">{dict.cancel}</button><button onClick={() => submitMatchResult(localUserId, matchModal.opponent.id)} className="flex-1 py-4 theme-gradient-r text-white font-black rounded-full active:scale-95">{dict.btn_confirm}</button></div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 start-0 end-0 bg-[#0A0410]/90 backdrop-blur-xl border-t border-white/10 z-20 pb-safe">
        <div className="max-w-xl mx-auto flex justify-around p-3">
          <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 ${view === 'home' ? 'theme-text-secondary' : 'text-[#A594BA]'}`}><Home size={24}/><span className="text-[10px]">{dict.nav_home}</span></button>
          <button onClick={() => setView('ladder')} className={`flex flex-col items-center p-2 ${view === 'ladder' ? 'theme-text-secondary' : 'text-[#A594BA]'}`}><List size={24}/><span className="text-[10px]">{dict.nav_ladder}</span></button>
          <button onClick={() => setView('history')} className={`flex flex-col items-center p-2 ${view === 'history' ? 'theme-text-secondary' : 'text-[#A594BA]'}`}><RefreshCw size={24}/><span className="text-[10px]">{dict.nav_history}</span></button>
          <button onClick={() => setView('admin')} className={`flex flex-col items-center p-2 ${view === 'admin' ? 'theme-text-secondary' : 'text-[#A594BA]'}`}><ShieldCheck size={24}/><span className="text-[10px]">{dict.nav_admin}</span></button>
        </div>
      </nav>
    </div>
  );
}