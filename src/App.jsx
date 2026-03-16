import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc, getDocs, getDoc } from 'firebase/firestore';
import { Trophy, BookOpen, ShieldCheck, UserPlus, Trash2, Check, RefreshCw, AlertTriangle, ChevronUp, Zap, Info, Home, List, BarChart2, LogIn, LogOut, Save, Eye, RotateCcw, KeyRound, MessageCircle, Globe, Plus, Settings, Download, PauseCircle, PlayCircle, ExternalLink } from 'lucide-react';

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
    account_frozen: "חשבונך מוקפא. אינך מופיע בסולם הדירוג.",
    btn_to_ladder: "לסולם הדירוג", btn_view_ladder: "צפה בסולם",
    btn_login: "כניסה לרשומים", btn_join: "הצטרפות לליגה",
    rules_title: "חוקי הליגה", rules_subtitle: "הסולם חי ונושם רק בזכותכם! ככל שתשחקו יותר, כך הליגה תהיה מעניינת יותר.",
    rule1_title: "צ׳אלנג׳:", rule1_text: "רשאים לאתגר שחקנים המדורגים עד 3 שלבים מעליכם. חובה לקבל אתגר תוך 7 ימים ולתאם משחק בשיטת הטוב מ-5.",
    rule2_title: "ניצחון ומיקומים:", rule2_text: "ניצחת שחקן מעליך? תפסת לו את המקום! המפסיד ומי שביניכם יורדים שלב. אם המדורג גבוה ניצח, המיקומים נשארים.",
    rule3_title: "איך מעדכנים?", rule3_text: "בסיום המשחק, המנצח בלבד נכנס לסולם ולוחץ על לחצן ״ניצחון״. המערכת תעשה את השאר!",
    btn_full_rules: "תקנון הליגה והמדריך המלא",
    admin_name: "מנהל הליגה:", admin_phone: "טלפון לבירורים:",
    whatsapp_group: "קהילת הליגה בוואטסאפ",
    ladder_preview: "הצצה לדירוג הנוכחי", no_active_players: "אין עדיין שחקנים פעילים.", show_all_ladder: "הצג את כל הדירוג",
    global_network: "רשת הליגות הארצית",
    join_title: "טופס הרשמה לליגה", f_name: "שם מלא", f_name_ph: "שם פרטי ומשפחה",
    f_phone: "מספר וואטסאפ", f_phone_note: "* קריטי: ודאו שהמספר מדויק! לתיאום משחקים.",
    f_email: "כתובת אימייל", f_id: "תעודת זהות",
    f_pin: "קוד גישה (PIN)", f_pin_ph: "4 ספרות", f_pin_note: "* בחר קוד בן 4 ספרות שישמש אותך להתחברות בעתיד.",
    f_health: "אני מצהיר/ה בזאת כי מצבי הבריאותי תקין ואני כשיר/ה לפעילות ספורטיבית מאומצת.",
    f_rules: "קראתי והבנתי את תקנון וחוקי הליגה.", btn_submit_join: "הכנס אותי לסולם!", btn_joining: "מבצע רישום...",
    btn_cancel: "ביטול וחזרה למסך הראשי",
    ladder_title: "סולם הדירוג", login_required: "* התחבר בחשבון כדי לעשות צ׳אלנג׳ ולהזין תוצאות",
    frozen_alert: "* חשבונך מוקפא ולכן אינך מופיע בסולם.", you: "(את/ה)", click_stats: "לסטטיסטיקה",
    btn_challenge: "צ׳אלנג׳", btn_victory: "ניצחון", confirm_win_title: "אישור ניצחון", confirm_win_text: "האם אתה מאשר שניצחת את", btn_confirm: "אישור", cancel: "ביטול",
    history_title: "תוצאות אחרונות", history_subtitle: "היסטוריית המשחקים של הליגה", filter_all: "כל הליגה", filter_mine: "המשחקים שלי", no_matches: "אין משחקים להצגה.", winner: "מנצח/ת", loser: "מפסיד/ה",
    admin_login_title: "כניסת הנהלה", admin_protected: "אזור מוגן -", f_user: "שם משתמש", f_pass: "סיסמה",
    login_err: "פרטי התחברות שגויים", btn_admin_login: "היכנס למערכת", forgot_admin: "שכחתי סיסמת הנהלה",
    manage_players: "ניהול שחקנים", btn_export: "ייצא לאקסל", btn_save: "שמור שינויים", t_info: "מידע", t_rank: "דירוג/סטטוס", t_name: "שם שחקן", t_actions: "קוד/מחק", active_checkbox: "פעיל בסולם",
    manage_history: "ניהול היסטוריית משחקים", club_settings: "הגדרות מועדון", s_name: "שם המועדון (לתצוגה בכותרת)", s_color1: "צבע ראשי", s_color2: "צבע משני",
    s_admin: "שם מנהל הליגה", s_admin_pass: "סיסמת הנהלה", s_phone: "מספר טלפון לפרסום", s_wa: "קישור לקבוצת וואטסאפ", btn_save_settings: "שמור הגדרות מועדון", btn_reset_league: "איפוס ליגה (מחיקת כל הנתונים)",
    sa_title: "לוח בקרה ארצי", sa_subtitle: "ניהול רשת מועדוני הסקווש", sa_new_club: "הקמת מועדון חדש", f_club_id: "מזהה באנגלית", f_club_name: "שם תצוגה", f_club_lang: "שפת ממשק", f_club_pass: "סיסמת הנהלה מקומית", f_club_admin_name: "שם מנהל המועדון", btn_create_club: "צור מועדון ושמור",
    sa_active_clubs: "מועדונים פעילים ברשת", btn_manage: "נהל", btn_reset_pwd: "איפוס", direct_link: "קישור ישיר להעתקה:",
    forgot_pin_title: "שכחת קוד גישה?", forgot_pin_sub: "שחזור קוד מתבצע רק מול הנהלת הליגה.", btn_check_details: "בדוק פרטים",
    rules_modal_title: "תקנון", reset_modal_title: "אזהרה חמורה!", reset_modal_sub: "מחיקה לצמיתות של כל הנתונים.", reset_modal_confirm: "אני מאשר/ת מחיקה של מועדון", btn_delete_all: "מחק הכל",
    stats_rank: "מקום בסולם", stats_frozen: "מוקפא", stats_matches: "משחקים", stats_winrate: "הצלחה", stats_wins: "ניצחונות", stats_losses: "הפסדים", h2h_title: "ראש בראש", h2h_my_wins: "שלך", h2h_opp_wins: "שלו/ה",
    player_details: "פרטי שחקן", p_frozen: "מוקפא", p_name: "שם מלא", p_phone: "וואטסאפ", p_email: "אימייל", p_id: "ת.ז", p_health: "הצהרת בריאות", p_rules: "תקנון", close: "סגור",
    rules_welcome: "ברוכים הבאים לליגה! בהרשמתך הנך מסכים/ה לתנאים הבאים:",
    privacy_title: "1. פרטיות", privacy_text: "מספר הטלפון יהיה גלוי לשחקנים אחרים לצורך תיאום משחקים בלבד.",
    detailed_rules_title: "2. חוקי הליגה והמשחקים", dr_1: "הליגה פועלת במודל החלפה (סולם).", dr_2: "שחקן רשאי לאתגר שחקנים המדורגים עד 3 שלבים מעליו.", dr_3: "המשחקים משוחקים בשיטת 'הטוב מ-5' מערכות.", dr_4: "על השחקן המאותגר לקבל את האתגר ולתאם משחק בתוך 7 ימים.", dr_5: "מנצח מזין את התוצאה במערכת.", dr_6: "ניצחון של מאתגר יעניק לו את המיקום של המפסיד.", dr_7: "הזנת תוצאה שקרית תוביל להרחקה מיידית מהליגה.",
    health_title: "3. בריאות", health_text: "השחקן מצהיר כי הוא בריא וכשיר לפעילות ספורטיבית. הנהלת הליגה אינה אחראית לכל נזק פיזי.",
    guide_title: "4. מדריך טכני", guide_login: "כניסה: התחברו עם מספר הוואטסאפ וקוד ה-PIN שלכם.", guide_challenge: "יצירת צ'אלנג': לחצו על כפתור ״צ׳אלנג׳״ ליד שחקן.", guide_report: "דיווח תוצאות: המנצח בלבד לוחץ על כפתור ״ניצחון״.", guide_stats: "סטטיסטיקות: בלחיצה על שחקן תוכלו לראות את ביצועיו."
  },
  en: {
    dir: 'ltr',
    nav_home: "Home", nav_ladder: "Ladder", nav_history: "History", nav_admin: "Admin",
    arena_subtitle: "Official Ladder Arena", hello: "Hello",
    account_frozen: "Your account is frozen.",
    btn_to_ladder: "Go to Ladder", btn_view_ladder: "View Ladder",
    btn_login: "Login", btn_join: "Join League",
    rules_title: "League Rules", rules_subtitle: "The ladder lives through you! Play matches to climb.",
    rule1_title: "Challenge:", rule1_text: "Challenge up to 3 ranks above you. Must be accepted within 7 days. Best of 5.",
    rule2_title: "Victory:", rule2_text: "Won? You take their rank! The loser drops 1 spot.",
    rule3_title: "Reporting:", rule3_text: "ONLY the winner reports the result by clicking 'Victory'.",
    btn_full_rules: "Full League Rules",
    admin_name: "League Admin:", admin_phone: "Contact Phone:",
    whatsapp_group: "WhatsApp Community",
    ladder_preview: "Standings Preview", no_active_players: "No active players yet.", show_all_ladder: "Show Full Ladder",
    global_network: "Global League Network",
    join_title: "Registration", f_name: "Full Name", f_name_ph: "First & Last Name",
    f_phone: "WhatsApp Number", f_phone_note: "* Accurate number for match coordination.",
    f_email: "Email Address", f_id: "ID / Passport",
    f_pin: "Access Code (PIN)", f_pin_ph: "4 Digits", f_pin_note: "* Choose 4-digit code.",
    f_health: "I am healthy and fit for sports.",
    f_rules: "I agree to the league rules.", btn_submit_join: "Join Ladder!", btn_joining: "Registering...",
    btn_cancel: "Cancel",
    ladder_title: "Ladder", login_required: "* Login to challenge and record victories",
    frozen_alert: "* Your account is frozen.", you: "(You)", click_stats: "Stats",
    btn_challenge: "Challenge", btn_victory: "Victory", confirm_win_title: "Confirm Victory", confirm_win_text: "Confirm victory against", btn_confirm: "Confirm", cancel: "Cancel",
    history_title: "Results", history_subtitle: "Match History", filter_all: "All", filter_mine: "Mine", no_matches: "No matches.", winner: "Winner", loser: "Loser",
    admin_login_title: "Admin Login", admin_protected: "Protected Area -", f_user: "Username", f_pass: "Password",
    login_err: "Invalid credentials", btn_admin_login: "Login", forgot_admin: "Forgot password",
    manage_players: "Players", btn_export: "Export", btn_save: "Save", t_info: "Info", t_rank: "Rank", t_name: "Player Name", t_actions: "PIN/Del", active_checkbox: "Active",
    manage_history: "History", club_settings: "Club Settings", s_name: "Club Name", s_color1: "Primary", s_color2: "Secondary",
    s_admin: "Admin Name", s_admin_pass: "Password", s_phone: "Phone", s_wa: "WA Link", btn_save_settings: "Save", btn_reset_league: "Reset Data",
    sa_title: "Global Dashboard", sa_subtitle: "Clubs Management", sa_new_club: "New Club", f_club_id: "Club ID", f_club_name: "Name", f_club_lang: "Language", f_club_pass: "Admin Password", f_club_admin_name: "Admin Name", btn_create_club: "Create & Save",
    sa_active_clubs: "Active Clubs", btn_manage: "Manage", btn_reset_pwd: "Reset", direct_link: "Link:",
    forgot_pin_title: "Forgot PIN?", forgot_pin_sub: "Contact admin for recovery.", btn_check_details: "Check",
    rules_modal_title: "Regulations", reset_modal_title: "WARNING!", reset_modal_sub: "Permanent deletion.", reset_modal_confirm: "I confirm deletion for", btn_delete_all: "Delete All",
    stats_rank: "Rank", stats_frozen: "Frozen", stats_matches: "Matches", stats_winrate: "Win Rate", stats_wins: "Wins", stats_losses: "Losses", h2h_title: "Head-to-Head", h2h_my_wins: "Yours", h2h_opp_wins: "Theirs",
    player_details: "Details", p_frozen: "Frozen", p_name: "Name", p_phone: "WhatsApp", p_email: "Email", p_id: "ID", p_health: "Health", p_rules: "Rules", close: "Close",
    rules_welcome: "Welcome! Agree to terms:",
    privacy_title: "1. Privacy", privacy_text: "WhatsApp is used for coordination.",
    detailed_rules_title: "2. Rules", dr_1: "Leapfrog model.", dr_2: "Challenge up to 3 ranks.", dr_3: "Best of 5.", dr_4: "Play within 7 days.", dr_5: "Winner updates score.", dr_6: "Winner takes spot.", dr_7: "False info = ban.",
    health_title: "3. Health", health_text: "Fit for sports.",
    guide_title: "4. Technical Guide", guide_login: "Login via WA and PIN.", guide_challenge: "Challenge via WhatsApp.", guide_report: "Winner clicks 'Victory'.", guide_stats: "View stats."
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
  // זיהוי המועדון מהנתיב (ה-URL הנקי)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const clubFromUrl = pathSegments.length > 0 ? pathSegments[0] : 'haifa';
  
  const [currentClubId, setCurrentClubId] = useState(clubFromUrl);
  const [user, setUser] = useState(null);
  const [localUserId, setLocalUserId] = useState(localStorage.getItem(`squash_user_id_${currentClubId}`) || null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [adminPrivateData, setAdminPrivateData] = useState({}); // מידע רגיש למנהל בלבד
  
  const [leagueConfig, setLeagueConfig] = useState({ 
      displayName: "סקווש חיפה", 
      language: "he",
      adminName: "ניצן מורה", 
      adminPhone: "054-4372323", 
      adminPassword: "squash2026",
      whatsappGroupLink: "",
      themePrimary: "#8A2BE2",
      themeSecondary: "#E020A3",
      docId: null
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

  // נתיבים למסד הנתונים
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

  // האזנה לנתונים ציבוריים
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

  // שאיבת מידע פרטי רק למנהל המחובר
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

  const exportPlayersToCSV = () => {
    const headers = [dict.stats_rank, dict.t_name, 'Phone', 'Email', 'ID', 'PIN', 'Status', 'Joined'];
    const rows = players.map(p => {
        const priv = adminPrivateData[p.id] || {};
        return [p.isActive === false ? 'Frozen' : p.rank, p.name, p.phone, priv.email || '', priv.idNumber || '', priv.pin || '', p.isActive === false ? 'Frozen' : 'Active', p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : ''];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `players_${currentClubId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleLogout = () => {
    localStorage.removeItem(`squash_user_id_${currentClubId}`);
    setLocalUserId(null);
    setView('home');
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

  const saveAdminEdits = async () => {
    const updates = Object.keys(adminEdits).map(id => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, id), { name: adminEdits[id].name, rank: parseInt(adminEdits[id].rank, 10), isActive: adminEdits[id].isActive !== false }));
    await Promise.all(updates);
    setAdminEdits({});
    alert(dict.btn_save);
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

  const switchClubContext = (clubId) => { window.location.href = `/${clubId}`; }

  const renderSuperAdmin = () => (
      <div className="space-y-6 pb-8 animate-in fade-in duration-500 text-start" dir={dict.dir}>
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden border border-indigo-500/30">
              <Globe size={48} className="text-white/20 absolute -end-4 -bottom-4 w-32 h-32" />
              <h2 className="text-3xl font-black text-white relative z-10 flex items-center gap-3 mb-2">{dict.sa_title}</h2>
              <p className="text-indigo-200 relative z-10">{dict.sa_subtitle}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4"><Plus className="text-emerald-400" /> {dict.sa_new_club}</h3>
              <form onSubmit={handleCreateClub} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_id}</label><input type="text" value={newClubForm.id} onChange={(e) => setNewClubForm({...newClubForm, id: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors" dir="ltr" /></div>
                  <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_name}</label><input type="text" value={newClubForm.name} onChange={(e) => setNewClubForm({...newClubForm, name: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors" /></div>
                  <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_lang}</label><select value={newClubForm.language} onChange={(e) => setNewClubForm({...newClubForm, language: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"><option value="he">עברית</option><option value="en">English</option></select></div>
                  <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_admin_name}</label><input type="text" value={newClubForm.adminName} onChange={(e) => setNewClubForm({...newClubForm, adminName: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors" /></div>
                  <div><label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_pass}</label><input type="text" value={newClubForm.password} onChange={(e) => setNewClubForm({...newClubForm, password: e.target.value})} className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors" dir="ltr" /></div>
                  <div className="sm:col-span-2"><button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg h-[50px]">{dict.btn_create_club}</button></div>
              </form>
          </div>
          <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">{dict.sa_active_clubs}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allClubs.map(club => (
                  <div key={club.clubId} className="bg-white/5 p-5 rounded-[20px] border border-white/10 hover:bg-white/10 transition-colors flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                          <h4 className="text-lg font-bold text-white">{club.displayName}</h4>
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <button onClick={() => switchClubContext(club.clubId)} className="flex-1 sm:flex-none bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0"><Settings size={16} /> {dict.btn_manage}</button>
                          </div>
                      </div>
                      <div className="bg-[#0A0410]/50 p-3 rounded-xl border border-white/5 mt-1">
                          <p className="text-[10px] text-[#A594BA] mb-1 uppercase tracking-wider font-bold">{dict.direct_link}</p>
                          <p className="text-sm text-emerald-400 font-mono break-all select-all cursor-pointer" dir="ltr">{window.location.origin}/{club.clubId}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 text-start" dir={dict.dir}>
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
              <button onClick={() => setView('ladder')} className="flex-1 theme-gradient-r text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform text-sm">{myPlayer.isActive === false ? dict.btn_view_ladder : dict.btn_to_ladder}</button>
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
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center"><p className="text-white font-bold mb-1">{dict.admin_name} {leagueConfig.adminName}</p><p className="text-[#A594BA] text-sm">{dict.admin_phone} <a href={`tel:${leagueConfig.adminPhone}`} className="theme-text-secondary hover:underline" dir="ltr">{leagueConfig.adminPhone}</a></p></div>
      </div>
      {allClubs.length > 1 && (
          <div className="mt-6 mb-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[#A594BA] text-xs uppercase tracking-widest font-bold mb-3 flex items-center justify-center gap-1"><Globe size={12} /> {dict.global_network}</p>
              <div className="flex flex-wrap justify-center gap-2">{allClubs.filter(c => c.clubId !== currentClubId).map(club => (<a key={club.clubId} href={`/${club.clubId}`} className="text-xs bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/10">{club.displayName}</a>))}</div>
          </div>
      )}
    </div>
  );

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
      .theme-bg-secondary-10 { background-color: rgba(var(--theme-secondary-rgb), 0.1); }
      .theme-bg-secondary-20 { background-color: rgba(var(--theme-secondary-rgb), 0.2); }
      .theme-bg-secondary-hover:hover { background-color: rgba(var(--theme-secondary-rgb), 0.8); }
      .theme-border-primary { border-color: var(--theme-primary); }
      .theme-border-secondary { border-color: var(--theme-secondary); }
      .theme-border-primary-30 { border-color: rgba(var(--theme-primary-rgb), 0.3); }
      .theme-border-secondary-30 { border-color: rgba(var(--theme-secondary-rgb), 0.3); }
      .theme-gradient-r { background: linear-gradient(to right, var(--theme-primary), var(--theme-secondary)); }
      .theme-gradient-br { background: linear-gradient(to bottom right, var(--theme-primary), var(--theme-secondary)); }
      .theme-glow-primary-20 { box-shadow: 0 0 20px rgba(var(--theme-primary-rgb), 0.2); }
      .theme-glow-primary-30 { box-shadow: 0 0 30px rgba(var(--theme-primary-rgb), 0.3); }
      .theme-glow-secondary-15 { box-shadow: 0 0 20px rgba(var(--theme-secondary-rgb), 0.15); }
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
        {view === 'home' && renderHome()}
        {view === 'join' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 mt-6 text-start" dir={dict.dir}>
            <div className="bg-gradient-to-br from-[#0A0410]/90 to-[#1B0B2E]/90 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border theme-border-secondary-30 relative overflow-hidden">
              <h2 className="text-2xl font-black text-white mb-6">{dict.join_title}</h2>
              <form onSubmit={handleJoin} className="space-y-5 relative z-10">
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_name}</label><input required type="text" name="name" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none transition-all" placeholder={dict.f_name_ph} /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_phone}</label><input required type="tel" name="phone" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none" dir="ltr" /><p className="text-xs text-yellow-400/90 mt-2 font-bold leading-tight">{dict.f_phone_note}</p></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_email}</label><input required type="email" name="email" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none" dir="ltr" /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_id}</label><input required type="text" name="idNumber" className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none" dir="ltr" /></div>
                <div><label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_pin}</label><input required type="password" name="pin" pattern="\d{4}" maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none text-center tracking-[0.5em]" placeholder="••••" dir="ltr" /><p className="text-xs text-[#A594BA]/70 mt-2">{dict.f_pin_note}</p></div>
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
                <div key={match.id} className="backdrop-blur-md p-4 rounded-[20px] border border-white/10 flex justify-between items-center">
                  <div className="flex flex-col items-center flex-1 text-center"><span className="theme-text-secondary text-[10px] font-bold uppercase mb-1">{dict.winner}</span><span className="font-black text-white">{match.winnerName}</span></div>
                  <div className="flex flex-col items-center px-4 shrink-0"><div className="bg-white/10 px-3 py-1 rounded-full text-[#A594BA] text-[10px] mb-2" dir="ltr">{match.dateString}</div><Trophy size={14} className="text-yellow-500 opacity-50" /></div>
                  <div className="flex flex-col items-center flex-1 text-center"><span className="text-[#A594BA] text-[10px] font-bold mb-1">{dict.loser}</span><span className="font-medium text-white/70">{match.loserName}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'admin' && renderAdmin()}
      </main>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setLoginModalOpen(false)}>
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 start-4 text-[#A594BA] hover:text-white">✕</button>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white"><LogIn size={32} /></div>
            <h3 className="text-2xl font-black text-center text-white mb-6">{dict.btn_login}</h3>
            <form onSubmit={handleLogin}>
              <input required type="tel" name="phone" placeholder={dict.f_phone} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input text-center mb-3" dir="ltr" />
              <input required type="password" name="pin" placeholder={dict.f_pin_ph} maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input text-center tracking-[0.5em] mb-4" dir="ltr" />
              <button type="submit" className="w-full theme-gradient-r text-white font-black py-4 rounded-full active:scale-95 mb-2">{dict.btn_login}</button>
              <button type="button" onClick={() => { setForgotPasswordOpen(true); }} className="w-full text-[#A594BA] text-sm py-2 hover:text-white transition-colors">{dict.forgot_pin_title}</button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {renderStatsModal()}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-[#0A0410]/90 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in" onClick={() => setShowRulesModal(false)}>
           <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative max-h-[80vh] overflow-y-auto text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
               <button onClick={() => setShowRulesModal(false)} className="absolute top-4 start-4 text-[#A594BA] hover:text-white bg-white/5 rounded-full p-1">✕</button>
               <h3 className="text-2xl font-black text-white mb-4 border-b border-white/10 pb-4">{dict.rules_modal_title}</h3>
               <div className="text-[#A594BA] space-y-4 text-sm leading-relaxed">
                   <p>{dict.rules_welcome}</p>
                   <h4 className="text-white font-bold">{dict.privacy_title}</h4><p>{dict.privacy_text}</p>
                   <h4 className="text-white font-bold">{dict.detailed_rules_title}</h4>
                   <ul className="list-disc ps-5 space-y-2"><li>{dict.dr_1}</li><li>{dict.dr_2}</li><li>{dict.dr_3}</li><li>{dict.dr_4}</li><li>{dict.dr_5}</li><li>{dict.dr_6}</li><li>{dict.dr_7}</li></ul>
                   <h4 className="text-white font-bold">{dict.health_title}</h4><p>{dict.health_text}</p>
                   <h4 className="text-white font-bold">{dict.guide_title}</h4>
                   <ul className="list-disc ps-5 space-y-2"><li><strong>{dict.guide_login.split(':')[0]}:</strong> {dict.guide_login.split(':')[1]}</li><li><strong>{dict.guide_challenge.split(':')[0]}:</strong> {dict.guide_challenge.split(':')[1]}</li><li><strong>{dict.guide_report.split(':')[0]}:</strong> {dict.guide_report.split(':')[1]}</li><li><strong>{dict.guide_stats.split(':')[0]}:</strong> {dict.guide_stats.split(':')[1]}</li></ul>
               </div>
               <button onClick={() => setShowRulesModal(false)} className="w-full mt-6 theme-bg-secondary text-white font-bold py-3 rounded-full">{dict.close}</button>
           </div>
        </div>
      )}

      {/* Admin Player Modal (Shows Private Data) */}
      {adminSelectedPlayer && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setAdminSelectedPlayer(null)}>
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
            <button onClick={() => setAdminSelectedPlayer(null)} className="absolute top-5 start-5 text-[#A594BA] hover:text-white">✕</button>
            <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">{dict.player_details}</h3>
            <div className="space-y-4 text-sm">
              <div><span className="text-[#A594BA] block text-xs">{dict.p_name}</span><strong className="text-white text-lg">{adminSelectedPlayer.name}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">{dict.p_phone}</span><strong className="text-white" dir="ltr">{adminSelectedPlayer.phone}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">{dict.p_email}</span><strong className="text-white" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.email || '-'}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">{dict.p_id}</span><strong className="text-white" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.idNumber || '-'}</strong></div>
              <div><span className="text-[#A594BA] block text-xs">PIN Code</span><strong className="text-white font-mono">{adminPrivateData[adminSelectedPlayer.id]?.pin || '-'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {renderResetModal()}

      {/* Bottom Nav */}
      {view !== 'join' && (
        <nav className="fixed bottom-0 start-0 end-0 bg-[#0A0410]/90 backdrop-blur-xl border-t border-white/10 z-20 pb-safe">
          <div className="max-w-xl mx-auto flex justify-around p-3">
            <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 transition-all ${view === 'home' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}><Home size={24} className="mb-1" /><span className="text-[11px] font-bold">{dict.nav_home}</span></button>
            <button onClick={() => setView('ladder')} className={`flex flex-col items-center p-2 transition-all ${view === 'ladder' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}><List size={24} className="mb-1" /><span className="text-[11px] font-bold">{dict.nav_ladder}</span></button>
            <button onClick={() => setView('history')} className={`flex flex-col items-center p-2 transition-all ${view === 'history' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}><RefreshCw size={24} className="mb-1" /><span className="text-[11px] font-bold">{dict.nav_history}</span></button>
            <button onClick={() => setView('admin')} className={`flex flex-col items-center p-2 transition-all ${view === 'admin' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}><ShieldCheck size={24} className="mb-1" /><span className="text-[11px] font-bold">{dict.nav_admin}</span></button>
          </div>
        </nav>
      )}

      {/* Match Confirmation */}
      {matchModal.isOpen && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 theme-gradient-br rounded-full flex items-center justify-center mx-auto mb-6 text-white"><Trophy size={40} /></div>
            <h3 className="text-2xl font-black text-white mb-2">{dict.confirm_win_title}</h3>
            <p className="text-[#A594BA] mb-8">{dict.confirm_win_text} <strong className="text-white">{matchModal.opponent?.name}</strong>?</p>
            <div className="flex gap-4">
              <button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full font-bold">{dict.cancel}</button>
              <button onClick={() => submitMatchResult(localUserId, matchModal.opponent.id)} className="flex-1 py-4 theme-gradient-r rounded-full font-black flex items-center justify-center gap-2 active:scale-95"><Check size={20} /> {dict.btn_confirm}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}