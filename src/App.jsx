import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc, getDocs, getDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Trash2, Check, RefreshCw, AlertTriangle, Zap, Info, Home, List, BarChart2, LogIn, LogOut, Save, Eye, RotateCcw, KeyRound, MessageCircle, Globe, Plus, Settings, Download, PauseCircle, PlayCircle } from 'lucide-react';

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

const translations = {
  he: {
    dir: 'rtl', nav_home: "בית", nav_ladder: "סולם", nav_history: "היסטוריה", nav_admin: "אדמין",
    arena_subtitle: "זירת הסולם הרשמית", hello: "שלום", account_frozen: "חשבונך מוקפא. אינך מופיע בסולם.",
    btn_to_ladder: "לסולם הדירוג", btn_view_ladder: "צפה בסולם", btn_login: "כניסה", btn_join: "הצטרפות",
    rules_title: "חוקי הליגה", rules_subtitle: "הסולם חי בזכותכם! שחקו כדי לטפס.",
    rule1_title: "צ׳אלנג׳:", rule1_text: "אתגר עד 3 שלבים מעליך. שחק תוך 7 ימים.",
    rule2_title: "ניצחון:", rule2_text: "ניצחת שחקן מעליך? תפסת לו את המקום!",
    rule3_title: "דיווח:", rule3_text: "המנצח בלבד מעדכן בלחצן ״ניצחון״.",
    btn_full_rules: "תקנון ומדריך מלא", admin_name: "מנהל:", admin_phone: "טלפון:",
    whatsapp_group: "קהילת וואטסאפ", ladder_preview: "הצצה לדירוג", no_active_players: "אין שחקנים.",
    show_all_ladder: "הצג הכל", global_network: "רשת הליגות", join_title: "הרשמה לליגה",
    f_name: "שם מלא", f_name_ph: "שם משפחה ופרטי", f_phone: "מספר וואטסאפ", f_phone_note: "* וודאו דיוק לתיאום משחקים.",
    f_email: "אימייל", f_id: "ת.ז", f_pin: "PIN (4 ספרות)", f_pin_ph: "••••", f_pin_note: "* לשימוש בכניסות הבאות.",
    f_health: "אני כשיר לפעילות ספורטיבית.", f_rules: "אני מסכים לתקנון הליגה.", btn_submit_join: "הכנס אותי!",
    btn_joining: "נרשם...", btn_cancel: "ביטול", ladder_title: "סולם הדירוג", login_required: "* התחבר לביצוע פעולות",
    frozen_alert: "* חשבונך מוקפא.", you: "(את/ה)", click_stats: "סטטיסטיקה", btn_challenge: "צ׳אלנג׳",
    btn_victory: "ניצחון", confirm_win_title: "אישור ניצחון", confirm_win_text: "האם ניצחת את", btn_confirm: "אישור", cancel: "ביטול",
    history_title: "תוצאות אחרונות", history_subtitle: "היסטוריית המשחקים", filter_all: "הכל", filter_mine: "שלי",
    no_matches: "אין משחקים.", winner: "מנצח/ת", loser: "מפסיד/ה", admin_login_title: "כניסת הנהלה",
    admin_protected: "אזור מוגן -", f_user: "משתמש", f_pass: "סיסמה", login_err: "פרטים שגויים",
    btn_admin_login: "היכנס", forgot_admin: "שכחתי סיסמה", manage_players: "ניהול שחקנים", btn_export: "אקסל",
    btn_save: "שמור", t_info: "מידע", t_rank: "דירוג", t_name: "שם", t_actions: "קוד/מחק", active_checkbox: "פעיל",
    manage_history: "היסטוריה", club_settings: "הגדרות", s_name: "שם מועדון", s_color1: "ראשי", s_color2: "משני",
    s_admin: "מנהל", s_admin_pass: "סיסמת מנהל", s_phone: "טלפון", s_wa: "וואטסאפ", btn_save_settings: "שמור",
    btn_reset_league: "איפוס", sa_title: "סופר אדמין", sa_subtitle: "ניהול רשת הליגות", sa_new_club: "הקמת מועדון",
    f_club_id: "מזהה אנגלית", f_club_name: "שם תצוגה", f_club_lang: "שפה", f_club_pass: "סיסמת ניהול",
    f_club_admin_name: "שם מנהל המועדון", btn_create_club: "צור מועדון", sa_active_clubs: "מועדונים ברשת",
    btn_manage: "נהל", btn_reset_pwd: "PIN", direct_link: "לינק:", stats_rank: "דירוג", stats_frozen: "מוקפא",
    stats_matches: "משחקים", stats_winrate: "הצלחה", stats_wins: "נצ'", stats_losses: "הפס'", h2h_title: "ראש בראש",
    h2h_my_wins: "שלך", h2h_opp_wins: "שלו/ה", player_details: "פרטי שחקן", p_frozen: "מוקפא", p_name: "שם",
    p_phone: "וואטסאפ", p_email: "אימייל", p_id: "ת.ז", p_health: "בריאות", p_rules: "תקנון", close: "סגור",
    rules_welcome: "ברוכים הבאים! בהרשמתכם אתם מסכימים לתנאים הבאים:",
    privacy_title: "1. פרטיות", privacy_text: "הטלפון יהיה גלוי לשאר השחקנים לתיאום משחקים בלבד.",
    detailed_rules_title: "2. חוקי המשחק", dr_1: "דירוג בשיטת סולם.", dr_2: "אתגר עד 3 שלבים מעליך.", dr_3: "משחק בשיטת הטוב מ-5.", dr_4: "תיאום משחק תוך 7 ימים.", dr_5: "מנצח מזין תוצאה.", dr_6: "מנצח תופס את מקום המפסיד.", dr_7: "דיווח שקרי גורר הרחקה.",
    health_title: "3. הצהרת בריאות", health_text: "השחקן כשיר לספורט. ההנהלה אינה אחראית לנזק גופני.",
    guide_title: "4. מדריך טכני", guide_login: "כניסה: עם טלפון וקוד PIN.", guide_challenge: "אתגר: לחץ 'צ'אלנג' לוואטסאפ.", guide_report: "דיווח: המנצח לוחץ 'ניצחון'.", guide_stats: "סטטיסטיקה: לחץ על שחקן לראות ביצועים."
  },
  en: {
    dir: 'ltr', nav_home: "Home", nav_ladder: "Ladder", nav_history: "History", nav_admin: "Admin",
    arena_subtitle: "Official Ladder Arena", hello: "Hello", account_frozen: "Account frozen.",
    btn_to_ladder: "Ladder", btn_view_ladder: "View Ladder", btn_login: "Login", btn_join: "Join",
    rules_title: "Rules", rules_subtitle: "Play to climb the ladder.", rule1_title: "Challenge:",
    rule1_text: "Challenge up to 3 spots. Play within 7 days.", rule2_title: "Victory:",
    rule2_text: "Winner takes the rank!", rule3_title: "Reporting:", rule3_text: "Winner clicks 'Victory'.",
    btn_full_rules: "Full Rules", admin_name: "Admin:", admin_phone: "Phone:",
    whatsapp_group: "WhatsApp", ladder_preview: "Standings", no_active_players: "Empty.",
    show_all_ladder: "Show All", global_network: "Network", join_title: "Join League",
    f_name: "Name", f_name_ph: "Full Name", f_phone: "WhatsApp", f_phone_note: "* Required for coordination.",
    f_email: "Email", f_id: "ID", f_pin: "PIN (4 digits)", f_pin_ph: "••••", f_pin_note: "* For logins.",
    f_health: "I am fit.", f_rules: "I agree to rules.", btn_submit_join: "Join Now!",
    btn_joining: "Saving...", btn_cancel: "Cancel", ladder_title: "Rankings", login_required: "* Login to update",
    frozen_alert: "* Frozen.", you: "(You)", click_stats: "Stats", btn_challenge: "Challenge",
    btn_victory: "Victory", confirm_win_title: "Confirm Win", confirm_win_text: "Did you win vs", btn_confirm: "Yes",
    cancel: "No", history_title: "Results", history_subtitle: "Match History", filter_all: "All",
    filter_mine: "Mine", no_matches: "None.", winner: "Winner", loser: "Loser", admin_login_title: "Admin Login",
    admin_protected: "Protected -", f_user: "User", f_pass: "Pass", login_err: "Invalid",
    btn_admin_login: "Login", forgot_admin: "Forgot Pass", manage_players: "Players", btn_export: "Export",
    btn_save: "Save", t_info: "Info", t_rank: "Rank", t_name: "Name", t_actions: "PIN/Del", active_checkbox: "Active",
    manage_history: "History", club_settings: "Settings", s_name: "Club Name", s_color1: "Primary", s_color2: "Secondary",
    s_admin: "Admin", s_admin_pass: "Password", s_phone: "Phone", s_wa: "WA Link", btn_save_settings: "Save",
    btn_reset_league: "Reset", sa_title: "Master", sa_subtitle: "Network Admin", sa_new_club: "New Club",
    f_club_id: "Slug", f_club_name: "Title", f_club_lang: "Lang", f_club_pass: "Admin Pass",
    f_club_admin_name: "Admin Name", btn_create_club: "Create", sa_active_clubs: "Active Clubs",
    btn_manage: "Manage", btn_reset_pwd: "PIN", direct_link: "Link:", stats_rank: "Rank", stats_frozen: "Frozen",
    stats_matches: "Matches", stats_winrate: "Success", stats_wins: "Wins", stats_losses: "Losses",
    h2h_title: "H2H", h2h_my_wins: "You", h2h_opp_wins: "Them", player_details: "Player Info",
    p_frozen: "Frozen", p_name: "Name", p_phone: "WhatsApp", p_email: "Email", p_id: "ID",
    p_health: "Health", p_rules: "Rules", close: "Close", rules_modal_title: "Regulations",
    forgot_pin_title: "Forgot PIN?", forgot_pin_sub: "Contact admin.", btn_check_details: "Check",
    reset_modal_title: "Warning!", reset_modal_sub: "Irreversible.", reset_modal_confirm: "Confirm for",
    btn_delete_all: "Delete"
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
  const [adminPrivateData, setAdminPrivateData] = useState({}); // הכספת הפרטית למנהלים
  
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

  // הוספת נתיב פרטי מאובטח (privPath)
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
        } else { await signInAnonymously(auth); }
      } catch (err) { setAuthError(err.message); setLoading(false); }
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
    }, (error) => { setLoading(false); });

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

  // שאיבת נתונים פרטיים רק אם האדמין מחובר
  useEffect(() => {
    if (isAdmin) {
        const fetchPrivateData = async () => {
            try {
                const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', privPath));
                const data = {};
                snap.forEach(d => { data[d.id] = d.data(); });
                setAdminPrivateData(data);
            } catch (e) { console.error(e); }
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

  // ייצוא מוגן שמשתמש בכספת
  const exportPlayersToCSV = () => {
    const headers = [dict.stats_rank, dict.t_name, 'Phone', 'Email', 'ID', 'PIN', 'Status', 'Joined'];
    const rows = players.map(p => {
        const priv = adminPrivateData[p.id] || {};
        return [p.isActive === false ? 'Frozen' : p.rank, p.name, p.phone, priv.email || p.email || '', priv.idNumber || p.idNumber || '', priv.pin || p.pin || '', p.isActive === false ? 'Frozen' : 'Active', p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : ''];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', `players_${currentClubId}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // התחברות מאובטחת המשתמשת בכספת
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
                setLocalUserId(foundPublic.id); setLoginModalOpen(false); setView('ladder');
                return;
            }
        } catch (err) { console.error(err); }
    }
    alert(dict.login_err);
  };

  // הרשמה מאובטחת המפצלת נתונים
  const handleJoin = async (e) => {
    e.preventDefault();
    if (isSubmittingJoin) return;
    const phone = e.target.phone.value;
    const pin = e.target.pin.value;
    if (pin.length !== 4) { alert(dict.f_pin_ph); return; }
    if (players.some(p => cleanPhone(p.phone) === cleanPhone(phone))) { alert("Already registered"); return; }
    setIsSubmittingJoin(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, user.uid), {
        name: e.target.name.value, phone, rank: activePlayers.length + 1, isActive: true, joinedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, user.uid), {
        email: e.target.email.value, idNumber: e.target.idNumber.value, pin, healthDeclaration: e.target.health.checked, rulesAgreed: e.target.rulesCheck.checked
      });
      localStorage.setItem(`squash_user_id_${currentClubId}`, user.uid);
      setLocalUserId(user.uid); setView('ladder');
    } catch (err) { console.error(err); } finally { setIsSubmittingJoin(false); }
  };

  const handleLogout = () => { localStorage.removeItem(`squash_user_id_${currentClubId}`); setLocalUserId(null); setView('home'); };

  const togglePlayerStatus = async () => {
      if (!myPlayer) return;
      if (myPlayer.isActive !== false) {
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
      } else { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, winnerId), { lastActive: new Date().toISOString() }); }
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', mPath), { winnerId, loserId, winnerName: activePlayers.find(p => p.id === winnerId)?.name, loserName: activePlayers.find(p => p.id === loserId)?.name, playersSnapshot, timestamp: Date.now(), dateString: new Date().toLocaleString(lang === 'he' ? 'he-IL' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }) });
      setMatchModal({ isOpen: false, opponent: null });
    } catch (err) { console.error(err); }
  };

  const openWhatsApp = (phone, myName, e) => {
    e.stopPropagation(); 
    const finalPhone = cleanPhone(phone).startsWith('0') ? '972' + cleanPhone(phone).substring(1) : cleanPhone(phone);
    const t_msg = lang === 'he' ? `היי! מדבר ${myName} מליגת הסקווש. אני רוצה לעשות לך צ׳אלנג׳ למשחק במסגרת הסולם! מתי נוח לך? 🎾` : `Hi! This is ${myName} from the Squash League. Challenge! 🎾`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(t_msg)}`, '_blank');
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
    alert(dict.btn_save);
  };

  // מחיקת שחקן מאובטחת
  const adminDeletePlayer = async (playerId) => {
    if (window.confirm(lang === 'he' ? "מחיקה סופית?" : "Delete player?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, playerId));
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, playerId));
        setAdminEdits(prev => { const newEdits = {...prev}; delete newEdits[playerId]; return newEdits; });
      } catch (err) { console.error(err); }
    }
  };

  // איפוס קוד מאובטח
  const adminResetPin = async (playerId) => {
      const newPin = prompt("Enter 4-digit PIN:");
      if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
          try {
              const privRef = doc(db, 'artifacts', appId, 'public', 'data', privPath, playerId);
              const privDoc = await getDoc(privRef);
              if (privDoc.exists()) { await updateDoc(privRef, { pin: newPin }); } 
              else { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, playerId), { pin: newPin }); }
              setAdminPrivateData(prev => ({...prev, [playerId]: {...(prev[playerId]||{}), pin: newPin}}));
              alert("PIN Reset!");
          } catch (err) { console.error(err); }
      }
  }

  const adminDeleteMatch = async (match) => {
    if (window.confirm("Delete match?")) {
      try {
        if (match.playersSnapshot) {
           const updates = match.playersSnapshot.map(p => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), { rank: p.rank }));
           await Promise.all(updates);
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', mPath, match.id));
      } catch (err) { console.error(err); }
    }
  };

  const adminReverseMatch = async (match) => {
    if (!match.playersSnapshot) { alert("No history."); return; }
    if (window.confirm("Reverse match?")) {
       try {
          const newWinnerId = match.loserId; const newLoserId = match.winnerId;
          let currentPlayersState = [...match.playersSnapshot].sort((a,b) => a.rank - b.rank);
          const winnerIdx = currentPlayersState.findIndex(p => p.id === newWinnerId);
          const loserIdx = currentPlayersState.findIndex(p => p.id === newLoserId);
          if (winnerIdx !== -1 && loserIdx !== -1) {
              if (currentPlayersState[winnerIdx].rank > currentPlayersState[loserIdx].rank) {
                  const winnerObj = currentPlayersState.splice(winnerIdx, 1)[0];
                  currentPlayersState.splice(loserIdx, 0, winnerObj);
                  currentPlayersState.forEach((p, index) => { p.rank = index + 1; });
              }
              const updates = currentPlayersState.map(p => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), { rank: p.rank }));
              await Promise.all(updates);
          }
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', mPath, match.id), { winnerId: newWinnerId, loserId: newLoserId, winnerName: match.loserName, loserName: match.winnerName });
       } catch(e) { console.error(e); }
    }
  };

  const saveAdminConfig = async () => {
    try {
      const newConfig = { displayName: adminConfigEdit.displayName, language: adminConfigEdit.language || 'he', adminName: adminConfigEdit.adminName, adminPhone: adminConfigEdit.adminPhone, adminPassword: adminConfigEdit.adminPassword || "squash2026", whatsappGroupLink: adminConfigEdit.whatsappGroupLink || "", themePrimary: adminConfigEdit.themePrimary, themeSecondary: adminConfigEdit.themeSecondary };
      if (leagueConfig.docId) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', cPath, leagueConfig.docId), newConfig); } 
      else { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', cPath), newConfig); }
      alert(dict.btn_save);
    } catch (err) { console.error(err); }
  };

  const adminResetLeague = async () => {
    if (!confirmResetChecked) return;
    try {
      const playerDeletions = players.map(p => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id)));
      const privDeletions = players.map(p => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, p.id)));
      const matchDeletions = matches.map(m => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', mPath, m.id)));
      await Promise.all([...playerDeletions, ...privDeletions, ...matchDeletions]);
      setShowResetModal(false); setConfirmResetChecked(false);
    } catch (err) { console.error(err); }
  };

  const handleCreateClub = async (e) => {
      e.preventDefault();
      const clubId = newClubForm.id.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (!clubId || !newClubForm.name) return;
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'global_clubs'), { clubId: clubId, displayName: newClubForm.name, createdAt: new Date().toISOString() });
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `config_${clubId}`), { displayName: newClubForm.name, language: newClubForm.language || 'he', adminName: newClubForm.adminName || "Admin", adminPhone: "", adminPassword: newClubForm.password || "123456", themePrimary: "#8A2BE2", themeSecondary: "#E020A3" });
          alert(`Created: /${clubId}`); setNewClubForm({ id: '', name: '', password: '', language: 'he', adminName: '' });
      } catch (err) { console.error(err); }
  };

  const switchClubContext = (clubId) => { window.location.href = `/${clubId}`; }

  const themeStyles = `
      :root {
        --theme-primary: ${leagueConfig.themePrimary || '#8A2BE2'}; --theme-secondary: ${leagueConfig.themeSecondary || '#E020A3'};
        --theme-primary-rgb: ${hexToRgb(leagueConfig.themePrimary || '#8A2BE2')};
        --theme-secondary-rgb: ${hexToRgb(leagueConfig.themeSecondary || '#E020A3')};
      }
      .theme-text-primary { color: var(--theme-primary); } .theme-text-secondary { color: var(--theme-secondary); }
      .theme-bg-primary { background-color: var(--theme-primary); } .theme-bg-secondary { background-color: var(--theme-secondary); }
      .theme-bg-primary-10 { background-color: rgba(var(--theme-primary-rgb), 0.1); }
      .theme-bg-primary-20 { background-color: rgba(var(--theme-primary-rgb), 0.2); }
      .theme-bg-secondary-hover:hover { background-color: rgba(var(--theme-secondary-rgb), 0.8); }
      .theme-border-primary { border-color: var(--theme-primary); } .theme-border-secondary { border-color: var(--theme-secondary); }
      .theme-gradient-r { background: linear-gradient(to right, var(--theme-primary), var(--theme-secondary)); }
      .theme-gradient-br { background: linear-gradient(to bottom right, var(--theme-primary), var(--theme-secondary)); }
      .theme-glow-primary-20 { box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.2); }
      .theme-glow-secondary-40 { box-shadow: 0 8px 25px rgba(var(--theme-secondary-rgb), 0.4); }
      .theme-glow-secondary-50 { box-shadow: 0 0 30px rgba(var(--theme-secondary-rgb), 0.5); }
      .theme-input:focus { border-color: var(--theme-secondary); outline: none; }
      .theme-accent { accent-color: var(--theme-secondary); }
  `;

  if (authError) return <div className="min-h-screen flex items-center justify-center bg-[#0A0410] text-red-500">{authError}</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0410]"><RefreshCw className="animate-spin theme-text-secondary" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0A0410] text-white pb-24 relative overflow-hidden" dir={dict.dir}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap'); * { font-family: 'Heebo', sans-serif; } .custom-scrollbar::-webkit-scrollbar { width: 6px; } ${themeStyles}`}</style>
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
                <div className="flex flex-col gap-3">
                  <button onClick={() => setLoginModalOpen(true)} className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-lg"><LogIn size={22} /> {dict.btn_login}</button>
                  <button onClick={() => setView('join')} className="w-full theme-gradient-r text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 theme-glow-secondary-40 transition-all"><UserPlus size={22} /> {dict.btn_join}</button>
                </div>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-7 border border-white/10 shadow-xl relative z-10 mt-6 text-start">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 mt-6 text-start">
            <div className="bg-gradient-to-br from-[#0A0410]/90 to-[#1B0B2E]/90 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border theme-border-secondary-30 relative overflow-hidden">
              <h2 className="text-2xl font-black text-white mb-6">{dict.join_title}</h2>
              <form onSubmit={handleJoin} className="space-y-5 relative z-10">
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_name}</label><input required type="text" name="name" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none" placeholder={dict.f_name_ph} /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_phone}</label><input required type="tel" name="phone" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input" dir="ltr" /><p className="text-xs text-yellow-400/90 mt-2 font-bold leading-tight">{dict.f_phone_note}</p></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_email}</label><input required type="email" name="email" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input" dir="ltr" /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_id}</label><input required type="text" name="idNumber" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input" dir="ltr" /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_pin}</label><input required type="password" name="pin" pattern="\d{4}" maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none text-center tracking-[0.5em]" placeholder="••••" dir="ltr" /></div>
                <div className="pt-2 border-t border-white/10"><div className="flex items-start gap-3 mt-4"><input required type="checkbox" id="health" className="mt-1 w-4 h-4 theme-accent" /><label htmlFor="health" className="text-sm text-[#A594BA] leading-tight cursor-pointer">{dict.f_health}</label></div><div className="flex items-start gap-3 mt-4"><input required type="checkbox" id="rulesCheck" className="mt-1 w-4 h-4 theme-accent" /><label htmlFor="rulesCheck" className="text-sm text-[#A594BA] leading-tight cursor-pointer" onClick={() => setShowRulesModal(true)}>{dict.f_rules}</label></div></div>
                <button type="submit" disabled={isSubmittingJoin} className="w-full theme-gradient-r text-white font-black text-lg py-4 rounded-full transition-all active:scale-95 mt-4 disabled:opacity-50">{isSubmittingJoin ? dict.btn_joining : dict.btn_submit_join}</button>
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
                  {myPlayer && myPlayer.isActive !== false && myPlayer.id !== player.id && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3 && (<button onClick={(e) => openWhatsApp(player.phone, myPlayer.name, e)} className="theme-gradient-r text-white px-5 py-2 rounded-full text-sm font-black active:scale-95 transition-all"><Zap size={16} fill="currentColor" /> {dict.btn_challenge}</button>)}
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
                <div key={match.id} className="backdrop-blur-md p-4 rounded-[20px] border border-white/10 flex justify-between items-center text-center">
                  <div className="flex-1"><span className="theme-text-secondary text-[10px] font-bold block">{dict.winner}</span><span className="font-black text-white">{match.winnerName}</span></div>
                  <div className="px-4 shrink-0"><div className="bg-white/10 px-3 py-1 rounded-full text-[#A594BA] text-[10px] mb-2" dir="ltr">{match.dateString}</div><Trophy size={14} className="text-yellow-500 opacity-50 mx-auto" /></div>
                  <div className="flex-1"><span className="text-[#A594BA] text-[10px] font-bold block">{dict.loser}</span><span className="font-medium text-white/70">{match.loserName}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-6 pb-8 animate-in fade-in duration-300 text-start">
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
                      <div className="flex flex-wrap justify-between items-start gap-2"><h4 className="text-lg font-bold text-white">{club.displayName}</h4><button onClick={() => window.location.href = `/${club.clubId}`} className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-xl font-bold"><Settings size={16} /></button></div>
                      <div className="bg-[#0A0410]/50 p-3 rounded-xl border border-white/5 mt-1 text-[10px] text-emerald-400 font-mono select-all cursor-pointer" dir="ltr">{window.location.origin}/{club.clubId}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !isAdmin ? (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 max-w-md mx-auto mt-10 text-center">
                <ShieldCheck size={56} className="text-[#FF0055] mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white mb-2">{dict.admin_login_title}</h2>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder={dict.f_user} className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white" dir="ltr" />
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder={dict.f_pass} className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white tracking-[0.3em]" dir="ltr" />
                  {adminLoginError && <div className="text-[#FF0055] text-sm font-bold">{dict.login_err}</div>}
                  <button type="submit" className="w-full bg-[#FF0055]/10 hover:bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 font-black py-4 rounded-full active:scale-95">{dict.btn_admin_login}</button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10 relative">
                  <div className="flex flex-wrap justify-between items-center mb-6 border-b border-white/10 pb-4 gap-4">
                     <h2 className="text-xl font-black text-white flex items-center gap-2"><ShieldCheck className="text-[#FF0055]" /> {dict.manage_players}</h2>
                     <div className="flex gap-3 w-full sm:w-auto">
                         <button onClick={exportPlayersToCSV} className="bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-full font-bold flex items-center gap-2"><Download size={16} /> {dict.btn_export}</button>
                         <button onClick={saveAdminEdits} disabled={Object.keys(adminEdits).length === 0} className={`px-4 py-2 rounded-full font-bold ${Object.keys(adminEdits).length > 0 ? 'bg-[#FF0055]' : 'bg-white/10 text-white/30'}`}><Save size={16} /></button>
                     </div>
                  </div>
                  <div className="overflow-x-auto"><table className="w-full text-start"><thead><tr className="text-[#A594BA] text-[10px] border-b border-white/10"><th className="p-3 font-medium text-center">INFO</th><th className="p-3 font-medium text-start">RANK</th><th className="p-3 font-medium text-start">NAME</th><th className="p-3 font-medium text-center">DEL</th></tr></thead><tbody>{players.map(player => (
                    <tr key={player.id} className={`border-b border-white/5 ${adminEdits[player.id] ? 'bg-[#FF0055]/10' : ''}`}>
                      <td className="p-2 text-center"><button onClick={() => setAdminSelectedPlayer(player)} className="text-[#A594BA] hover:text-white"><Eye size={18} /></button></td>
                      <td className="p-2 flex flex-col gap-1 items-start"><input type="number" value={adminEdits[player.id]?.rank ?? player.rank} onChange={(e) => handleAdminEditChange(player.id, 'rank', e.target.value)} className="w-16 px-2 py-1 bg-[#0A0410]/50 border border-white/10 rounded-lg text-center text-white" /><label className="text-[8px] text-[#A594BA]"><input type="checkbox" checked={adminEdits[player.id]?.isActive ?? player.isActive} onChange={(e) => handleAdminEditChange(player.id, 'isActive', e.target.checked)} className="accent-emerald-500" /> {dict.active_checkbox}</label></td>
                      <td className="p-2 text-start"><input type="text" value={adminEdits[player.id]?.name ?? player.name} onChange={(e) => handleAdminEditChange(player.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" /></td>
                      <td className="p-2 text-center"><button onClick={() => adminDeletePlayer(player.id)} className="text-[#FF0055] p-2"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}</tbody></table></div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10">
                  <h2 className="text-xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-2 mb-4"><RefreshCw className="theme-text-primary" /> {dict.manage_history}</h2>
                  <div className="overflow-x-auto"><table className="w-full text-start"><thead><tr className="text-[#A594BA] text-sm border-b border-white/10"><th className="p-3 font-medium text-white text-start">{dict.winner}</th><th className="p-3 font-medium text-[#A594BA] text-start">{dict.loser}</th><th className="p-3 font-medium text-center">+/-</th></tr></thead><tbody>{matches.length === 0 ? (<tr><td colSpan="3" className="p-4 text-center text-slate-500">No Matches</td></tr>) : matches.map(match => (
                    <tr key={match.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                      <td className="p-3 font-bold text-white text-start">{match.winnerName}</td><td className="p-3 text-[#A594BA] text-start">{match.loserName}</td>
                      <td className="p-3 text-center flex justify-center gap-3"><button onClick={() => adminReverseMatch(match)} className="text-yellow-500 hover:text-white bg-yellow-500/10 p-2 rounded-full"><RotateCcw size={16} /></button><button onClick={() => adminDeleteMatch(match)} className="text-[#FF0055] hover:text-white bg-[#FF0055]/10 p-2 rounded-full"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}</tbody></table></div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10">
                   <h2 className="text-xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-2 mb-4"><Info className="theme-text-primary" /> {dict.club_settings}</h2>
                   <div className="space-y-4">
                       <div><label className="block text-sm text-[#A594BA] mb-1">{dict.s_name}</label><input type="text" value={adminConfigEdit?.displayName || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, displayName: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" /></div>
                       <div className="flex gap-4"><div className="flex-1"><label className="block text-sm text-[#A594BA] mb-1">{dict.s_color1}</label><div className="flex items-center gap-3 bg-[#0A0410]/50 border border-white/10 rounded-xl px-3 py-2"><input type="color" value={adminConfigEdit?.themePrimary || '#8A2BE2'} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, themePrimary: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0" /><span className="text-white text-sm" dir="ltr">{adminConfigEdit?.themePrimary}</span></div></div><div className="flex-1"><label className="block text-sm text-[#A594BA] mb-1">{dict.s_color2}</label><div className="flex items-center gap-3 bg-[#0A0410]/50 border border-white/10 rounded-xl px-3 py-2"><input type="color" value={adminConfigEdit?.themeSecondary || '#E020A3'} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, themeSecondary: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0" /><span className="text-white text-sm" dir="ltr">{adminConfigEdit?.themeSecondary}</span></div></div></div>
                       <div><label className="block text-sm text-[#A594BA] mb-1">{dict.s_admin}</label><input type="text" value={adminConfigEdit?.adminName || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, adminName: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" /></div>
                       <div><label className="block text-sm text-[#A594BA] mb-1">{dict.s_admin_pass}</label><input type="text" value={adminConfigEdit?.adminPassword || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, adminPassword: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" dir="ltr" /></div>
                       <div><label className="block text-sm text-[#A594BA] mb-1">{dict.s_phone}</label><input type="tel" value={adminConfigEdit?.adminPhone || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, adminPhone: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" dir="ltr" /></div>
                       <div><label className="block text-sm text-[#A594BA] mb-1">{dict.s_wa}</label><input type="url" value={adminConfigEdit?.whatsappGroupLink || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, whatsappGroupLink: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white" dir="ltr" /></div>
                       <button onClick={saveAdminConfig} className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-bold w-full mt-2">{dict.btn_save_settings}</button>
                       <div className="pt-6 mt-4 border-t border-white/10"><button onClick={() => {setShowResetModal(true); setConfirmResetChecked(false);}} className="w-full bg-red-500/10 text-red-500 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2"><AlertTriangle size={18} /> {dict.btn_reset_league}</button></div>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()} dir={dict.dir}>
            <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 start-4 text-[#A594BA]">✕</button>
            <h3 className="text-2xl font-black text-center text-white mb-6">{dict.btn_login}</h3>
            <form onSubmit={handleLogin}><input required type="tel" name="phone" placeholder={dict.f_phone} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl mb-3" dir="ltr" /><input required type="password" name="pin" placeholder={dict.f_pin_ph} maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl mb-4 text-center tracking-[0.5em]" dir="ltr" /><button type="submit" className="w-full theme-gradient-r text-white font-black py-4 rounded-full active:scale-95 mb-2">{dict.btn_login}</button></form>
          </div>
        </div>
      )}

      {statsModalPlayer && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setStatsModalPlayer(null)}>
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto theme-gradient-br rounded-full flex items-center justify-center text-3xl font-black text-white mb-4">{statsModalPlayer.isActive === false ? '-' : statsModalPlayer.rank}</div>
            <h3 className="text-2xl font-black text-white mb-6">{statsModalPlayer.name}</h3>
            <div className="grid grid-cols-2 gap-4"><div className="bg-white/5 rounded-2xl p-4"><div>{getPlayerStats(statsModalPlayer.id).total}</div><div className="text-xs text-[#A594BA]">{dict.stats_matches}</div></div><div className="bg-white/5 rounded-2xl p-4"><div>{getPlayerStats(statsModalPlayer.id).winPercent}%</div><div className="text-xs text-[#A594BA]">{dict.stats_winrate}</div></div></div>
            <button onClick={() => setStatsModalPlayer(null)} className="w-full mt-6 bg-white/10 py-3 rounded-full text-white">{dict.close}</button>
          </div>
        </div>
      )}

      {adminSelectedPlayer && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setAdminSelectedPlayer(null)}>
          <div className="bg-[#1B0B2E] border border-[#FF0055]/30 rounded-[32px] p-8 max-w-sm w-full relative text-start" dir={dict.dir} onClick={e => e.stopPropagation()}>
            <button onClick={() => setAdminSelectedPlayer(null)} className="absolute top-5 start-5 text-[#A594BA]">✕</button>
            <h3 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4">{dict.player_details}</h3>
            <div className="space-y-4 text-sm text-white">
              <div><span className="text-[#A594BA] block text-xs">{dict.p_name}</span><strong>{adminSelectedPlayer.name}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">{dict.p_phone}</span><strong dir="ltr">{adminSelectedPlayer.phone}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">{dict.p_email}</span><strong dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.email || '-'}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">ID Number</span><strong dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.idNumber || '-'}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">PIN Code</span><strong className="font-mono">{adminPrivateData[adminSelectedPlayer.id]?.pin || '-'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {showRulesModal && (
        <div className="fixed inset-0 bg-[#0A0410]/90 backdrop-blur-md flex items-center justify-center p-4 z-[60]" onClick={() => setShowRulesModal(false)}>
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

      {showResetModal && (
        <div className="fixed inset-0 bg-[#0A0410]/90 backdrop-blur-md flex items-center justify-center p-4 z-[70]" onClick={() => setShowResetModal(false)}>
          <div className="bg-[#1B0B2E] border border-red-500/50 rounded-[32px] p-6 max-w-md w-full relative text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
            <h3 className="text-2xl font-black text-center text-white mb-2">{dict.reset_modal_title}</h3>
            <p className="text-center text-[#A594BA] mb-6">{dict.reset_modal_sub}</p>
            <div className="flex items-start gap-3 mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20"><input type="checkbox" checked={confirmResetChecked} onChange={(e) => setConfirmResetChecked(e.target.checked)} className="mt-1 w-5 h-5 accent-red-500" /><label className="text-sm text-white">{dict.reset_modal_confirm} {currentClubId}.</label></div>
            <div className="flex gap-3"><button onClick={() => setShowResetModal(false)} className="flex-1 bg-white/5 text-white font-bold py-3 rounded-full border border-white/10">{dict.cancel}</button><button onClick={adminResetLeague} disabled={!confirmResetChecked} className={`flex-1 font-bold py-3 rounded-full ${confirmResetChecked ? 'bg-red-500 text-white' : 'bg-red-500/30 text-white/50'}`}>{dict.btn_delete_all}</button></div>
          </div>
        </div>
      )}

      {matchModal.isOpen && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-black text-white mb-4">{dict.confirm_win_title}</h3>
            <p className="text-[#A594BA] mb-8">{dict.confirm_win_text} <strong className="text-white">{matchModal.opponent?.name}</strong>?</p>
            <div className="flex gap-4"><button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full font-bold">{dict.cancel}</button><button onClick={() => submitMatchResult(localUserId, matchModal.opponent.id)} className="flex-1 py-4 theme-gradient-r text-white font-black rounded-full active:scale-95">{dict.btn_confirm}</button></div>
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