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

// --- Translations Dictionary (מילון תרגומים) ---
const translations = {
  he: {
    dir: 'rtl',
    nav_home: "בית", nav_ladder: "סולם", nav_history: "היסטוריה", nav_admin: "אדמין",
    arena_subtitle: "זירת הסולם הרשמית", hello: "שלום",
    account_frozen: "חשבונך מוקפא. אינך מופיע בסולם הדירוג.",
    btn_to_ladder: "לסולם הדירוג", btn_view_ladder: "צפה בסולם",
    btn_login: "כניסה לרשומים", btn_join: "הצטרפות לליגה",
    rules_title: "חוקי הליגה", rules_subtitle: "הסולם חי ונושם רק בזכותכם! ככל שתשחקו יותר, כך הליגה תהיה מעניינת יותר.",
    rule1_title: "צ׳אלנג׳:", rule1_text: "רשאים לאתגר שחקנים המדורגים עד 3 שלבים מעליכם (לחיצה על הכפתור תפתח וואטסאפ). חובה לקבל אתגר תוך 7 ימים ולתאם משחק בשיטת הטוב מ-5.",
    rule2_title: "ניצחון ומיקומים:", rule2_text: "ניצחת שחקן מעליך? תפסת לו את המקום! המפסיד ומי שביניכם יורדים שלב. אם השחקן המדורג גבוה ניצח, המיקומים נשארים.",
    rule3_title: "איך מעדכנים תוצאה?", rule3_text: "בסיום המשחק, המנצח בלבד נכנס לסולם ולוחץ על לחצן ״ניצחון״ שמופיע ליד שם השחקן שהפסיד. המערכת תעשה את השאר!",
    btn_full_rules: "תקנון הליגה והמדריך המלא",
    admin_name: "מנהל הליגה:", admin_phone: "טלפון לבירורים:",
    whatsapp_group: "קהילת הליגה בוואטסאפ",
    ladder_preview: "הצצה לדירוג הנוכחי", no_active_players: "אין עדיין שחקנים פעילים.", show_all_ladder: "הצג את כל הדירוג",
    global_network: "רשת הליגות הארצית",
    join_title: "טופס הרשמה לליגה", f_name: "שם מלא", f_name_ph: "שם פרטי ומשפחה",
    f_phone: "מספר וואטסאפ", f_phone_note: "* קריטי: ודאו שהמספר מדויק! דרך מספר זה שחקני הליגה יפנו אליכם בוואטסאפ לתיאום משחקים.",
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
    manage_history: "ניהול היסטוריית משחקים", club_settings: "הגדרות מועדון", s_name: "שם המועדון (לתצוגה בכותרת)", s_color1: "צבע ראשי (למשל סגול)", s_color2: "צבע משני (למשל ורוד)",
    s_logo: "קישור ללוגו מותאם אישית (URL)", s_logo_hint: "טיפ: השתמשו בקובץ PNG עם רקע שקוף, ביחס ריבוע (1:1). השאירו ריק להצגת הגביע כברירת מחדל.",
    s_admin: "שם מנהל הליגה", s_admin_pass: "סיסמת הנהלה (לכניסה לאזור זה)", s_phone: "מספר טלפון לפרסום בתקנון", s_wa: "קישור לקבוצת וואטסאפ של הליגה", btn_save_settings: "שמור הגדרות מועדון", btn_reset_league: "איפוס ליגה (מחיקת כל הנתונים)",
    sa_title: "לוח בקרה ארצי", sa_subtitle: "ניהול רשת מועדוני הסקווש", sa_new_club: "הקמת מועדון חדש", f_club_id: "מזהה באנגלית (למשל: tlv)", f_club_name: "שם תצוגה (מופיע בכותרת)", f_club_lang: "שפת הממשק (Language)", f_club_pass: "סיסמת הנהלה מקומית", btn_create_club: "צור מועדון ושמור",
    sa_active_clubs: "מועדונים פעילים ברשת", btn_manage: "נהל", btn_reset_pwd: "איפוס", direct_link: "קישור ישיר להעתקה:",
    forgot_pin_title: "שכחת קוד גישה?", forgot_pin_sub: "מטעמי אבטחה, שחזור קוד מתבצע רק מול הנהלת הליגה.", btn_check_details: "בדוק פרטים",
    rules_modal_title: "תקנון", reset_modal_title: "אזהרה חמורה!", reset_modal_sub: "פעולה זו תמחק לצמיתות את כל השחקנים ואת כל היסטוריית המשחקים מהמערכת של המועדון הזה. לא ניתן לשחזר את הנתונים לאחר מכן.", reset_modal_confirm: "אני מבין/ה שפעולה זו היא בלתי הפיכה ומאשר/ת את מחיקת כל נתוני הליגה של מועדון", btn_delete_all: "מחק הכל",
    stats_rank: "מקום בסולם", stats_frozen: "שחקן לא פעיל (מוקפא)", stats_matches: "משחקים", stats_winrate: "אחוזי הצלחה", stats_wins: "ניצחונות", stats_losses: "הפסדים", h2h_title: "היסטוריה מולך (ראש בראש)", h2h_my_wins: "ניצחונות שלך", h2h_opp_wins: "ניצחונות שלו/ה",
    player_details: "פרטי שחקן", p_frozen: "מוקפא", p_name: "שם מלא", p_phone: "מספר וואטסאפ", p_email: "אימייל", p_id: "תעודת זהות", p_health: "אישור הצהרת בריאות", p_rules: "אישור תקנון ליגה", close: "סגור",
    // Detailed Rules Modal
    rules_welcome: "ברוכים הבאים לליגת הסקווש! בהרשמתך לליגה, הנך מסכים/ה לתנאים הבאים:",
    privacy_title: "1. פרטיות ושיתוף מספר טלפון", privacy_text: "לצורך תיאום המשחקים בין השחקנים, מספר הטלפון שתזין/י יהיה גלוי לשאר השחקנים הרשומים במערכת. השימוש במספר זה מותר אך ורק לצורך תיאום משחקי הליגה באמצעות אפליקציית WhatsApp.",
    detailed_rules_title: "2. חוקי הליגה והמשחקים", dr_1: "הליגה פועלת במודל החלפה (סולם).", dr_2: "שחקן רשאי לאתגר שחקנים המדורגים עד 3 שלבים מעליו.", dr_3: "המשחקים משוחקים בשיטת 'הטוב מ-5' מערכות (עד 11 נקודות במערכה, הפרש 2 במידת הצורך).", dr_4: "על השחקן המאותגר לקבל את האתגר ולתאם משחק בתוך 7 ימים ממועד הפנייה.", dr_5: "מנצח מזין את התוצאה במערכת.", dr_6: "ניצחון של מאתגר יעניק לו את המיקום של המפסיד, והמפסיד (וכל מי שביניהם) ירד שלב אחד.", dr_7: "הזנת תוצאה שקרית תוביל להרחקה מיידית מהליגה.",
    health_title: "3. הצהרת בריאות", health_text: "השחקן מצהיר כי הוא בריא וכשיר לפעילות ספורטיבית. הנהלת הליגה אינה אחראית לכל נזק פיזי או רפואי שייגרם במהלך המשחקים.",
    guide_title: "4. מדריך טכני - שימוש באפליקציה", guide_login: "כניסה: לאחר ההרשמה, התחברו עם מספר הוואטסאפ וקוד ה-PIN שלכם. רק משתמשים מחוברים יכולים לבצע פעולות בסולם.", guide_challenge: "יצירת צ'אלנג': לחצו על כפתור ״צ׳אלנג׳״ ליד השחקן שתרצו לאתגר. הפעולה תפתח חלון וואטסאפ ישירות אליו עם הודעה מוכנה.", guide_report: "דיווח תוצאות: הזנת התוצאה היא באחריות המנצח בלבד. המנצח יאתר את המפסיד בסולם וילחץ על כפתור ״ניצחון״ שלידו.", guide_stats: "סטטיסטיקות: בלחיצה על כרטיסיית שחקן תוכלו לראות את הסטטיסטיקה שלו, ובלשונית 'היסטוריה' למטה תראו את כל המשחקים האחרונים ששוחקו בליגה.",
    f_club_admin_name: "שם מנהל הליגה"
  },
  en: {
    dir: 'ltr',
    nav_home: "Home", nav_ladder: "Ladder", nav_history: "History", nav_admin: "Admin",
    arena_subtitle: "Official Ladder Arena", hello: "Hello",
    account_frozen: "Your account is frozen. You are hidden from the ladder.",
    btn_to_ladder: "Go to Ladder", btn_view_ladder: "View Ladder",
    btn_login: "Login", btn_join: "Join the League",
    rules_title: "League Rules", rules_subtitle: "The ladder lives through you! Play more to make it more interesting.",
    rule1_title: "Challenge:", rule1_text: "Challenge players up to 3 spots above you (clicking opens WhatsApp). Must be accepted within 7 days, Best of 5.",
    rule2_title: "Victory & Ranks:", rule2_text: "Won against a higher rank? You take their spot! The loser drops one spot. If the higher rank wins, positions remain.",
    rule3_title: "How to update?", rule3_text: "After the match, ONLY the winner clicks 'Victory' on the ladder. The system does the rest!",
    btn_full_rules: "Full League Rules & Guide",
    admin_name: "League Admin:", admin_phone: "Contact Phone:",
    whatsapp_group: "WhatsApp Community",
    ladder_preview: "Current Standings Preview", no_active_players: "No active players yet.", show_all_ladder: "Show Full Ladder",
    global_network: "Global League Network",
    join_title: "League Registration", f_name: "Full Name", f_name_ph: "First & Last Name",
    f_phone: "WhatsApp Number", f_phone_note: "* Critical: Ensure accuracy! Used for match coordination.",
    f_email: "Email Address", f_id: "ID / Passport",
    f_pin: "Access Code (PIN)", f_pin_ph: "4 digits", f_pin_note: "* Choose a 4-digit code for future logins.",
    f_health: "I declare that I am healthy and fit for physical sports activities.",
    f_rules: "I have read and understood the league rules.", btn_submit_join: "Put me on the ladder!", btn_joining: "Registering...",
    btn_cancel: "Cancel and return Home",
    ladder_title: "Rankings Ladder", login_required: "* Log in to challenge players and record victories",
    frozen_alert: "* Your account is frozen. You are not visible on the ladder.", you: "(You)", click_stats: "Stats",
    btn_challenge: "Challenge", btn_victory: "Victory", confirm_win_title: "Confirm Victory", confirm_win_text: "Do you confirm your victory against", btn_confirm: "Confirm", cancel: "Cancel",
    history_title: "Recent Results", history_subtitle: "League Match History", filter_all: "All League", filter_mine: "My Matches", no_matches: "No matches to display.", winner: "Winner", loser: "Loser",
    admin_login_title: "Admin Login", admin_protected: "Protected Area -", f_user: "Username", f_pass: "Password",
    login_err: "Invalid credentials", btn_admin_login: "Login to System", forgot_admin: "Forgot Admin Password",
    manage_players: "Manage Players", btn_export: "Export to Excel", btn_save: "Save Changes", t_info: "Info", t_rank: "Rank/Status", t_name: "Player Name", t_actions: "PIN/Del", active_checkbox: "Active on ladder",
    manage_history: "Manage Match History", club_settings: "Club Settings", s_name: "Club Name (Display Title)", s_color1: "Primary Color", s_color2: "Secondary Color",
    s_logo: "Custom Logo Link (URL)", s_logo_hint: "Tip: Use a transparent PNG, square ratio (1:1). Leave empty to use default Trophy.",
    s_admin: "Admin Name", s_admin_pass: "Admin Password", s_phone: "Public Phone Number", s_wa: "WhatsApp Group Link", btn_save_settings: "Save Club Settings", btn_reset_league: "Reset League (Delete All Data)",
    sa_title: "Global Dashboard", sa_subtitle: "Squash Clubs Network Management", sa_new_club: "Create New Club", f_club_id: "Club ID (e.g., nyc)", f_club_name: "Display Name (Title)", f_club_lang: "Interface Language", f_club_pass: "Local Admin Password", btn_create_club: "Create & Save Club",
    sa_active_clubs: "Active Network Clubs", btn_manage: "Manage", btn_reset_pwd: "Reset", direct_link: "Direct link to copy:",
    forgot_pin_title: "Forgot PIN?", forgot_pin_sub: "For security reasons, PIN recovery is handled by the league admin.", btn_check_details: "Check Details",
    rules_modal_title: "Regulations", reset_modal_title: "SEVERE WARNING!", reset_modal_sub: "This action will permanently delete ALL players and match history from this club's system. Data cannot be recovered.", reset_modal_confirm: "I understand this action is irreversible and confirm the deletion of all league data for club", btn_delete_all: "Delete Everything",
    stats_rank: "Ladder Rank", stats_frozen: "Inactive (Frozen)", stats_matches: "Matches", stats_winrate: "Win Rate", stats_wins: "Wins", stats_losses: "Losses", h2h_title: "Head-to-Head", h2h_my_wins: "Your Wins", h2h_opp_wins: "Their Wins",
    player_details: "Player Details", p_frozen: "Frozen", p_name: "Full Name", p_phone: "WhatsApp", p_email: "Email", p_id: "ID", p_health: "Health Declaration", p_rules: "Rules Accepted", close: "Close",
    // Detailed Rules Modal
    rules_welcome: "Welcome to the Squash League! By registering, you agree to the following terms:",
    privacy_title: "1. Privacy & Phone Number Sharing", privacy_text: "To coordinate matches, the phone number you provide will be visible to other registered players. This number is strictly for match coordination via WhatsApp.",
    detailed_rules_title: "2. League Rules & Matches", dr_1: "The league operates on a leapfrog ladder model.", dr_2: "You can challenge players ranked up to 3 spots above you.", dr_3: "Matches are played 'Best of 5' games (up to 11 points, win by 2).", dr_4: "Challenged players must accept and schedule the match within 7 days.", dr_5: "The winner is responsible for entering the result in the system.", dr_6: "If the challenger wins, they take the loser's rank. The loser and everyone in between drops one spot.", dr_7: "Entering a false score will lead to immediate expulsion from the league.",
    health_title: "3. Health Declaration", health_text: "The player declares they are healthy and fit for sports activities. League management is not responsible for any physical or medical injuries during matches.",
    guide_title: "4. Technical Guide - App Usage", guide_login: "Login: After registering, log in with your WhatsApp number and PIN. Only logged-in users can perform actions on the ladder.", guide_challenge: "Challenges: Click the 'Challenge' button next to an opponent. This will open a pre-written WhatsApp message.", guide_report: "Reporting Results: The WINNER must report the score by clicking the 'Victory' button next to the loser's name.", guide_stats: "Statistics: Click on a player's card to view their stats, and use the 'History' tab to see recent matches.",
    f_club_admin_name: "League Admin Name"
  }
};

// פונקציית עזר להמרת צבעי HEX ל-RGB עבור שקיפויות דינמיות
const hexToRgb = (hex) => {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length === 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255].join(',');
    }
    return '138,43,226'; // ברירת מחדל
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
  const [adminPrivateData, setAdminPrivateData] = useState({}); // הכספת הפרטית
  
  // הגדרות ברירת מחדל לליגה
  const [leagueConfig, setLeagueConfig] = useState({ 
      displayName: "סקווש חיפה", 
      language: "he",
      adminName: "ניצן מורה", 
      adminPhone: "054-4372323", 
      adminPassword: "squash2026",
      whatsappGroupLink: "",
      themePrimary: "#8A2BE2",
      themeSecondary: "#E020A3",
      logoUrl: "",
      docId: null
  });

  // שליפת המילון הנוכחי לפי שפת המועדון
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
  
  // Modals & States
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

  // הגדרת נתיבי נתונים דינמיים לפי המועדון הפעיל
  const pPath = currentClubId === 'haifa' ? 'players' : `players_${currentClubId}`;
  const privPath = currentClubId === 'haifa' ? 'private' : `private_${currentClubId}`;
  const mPath = currentClubId === 'haifa' ? 'matches' : `matches_${currentClubId}`;
  const cPath = currentClubId === 'haifa' ? 'config' : `config_${currentClubId}`;

  useEffect(() => {
    document.title = leagueConfig.displayName || "Squash League";
  }, [leagueConfig.displayName]);

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

    // האזנה לנתוני המועדון הנוכחי (הציבוריים)
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', pPath);
    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', mPath);
    const configRef = collection(db, 'artifacts', appId, 'public', 'data', cPath);
    
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        // ברירת מחדל isActive = true אם לא הוגדר אחרת
        isActive: doc.data().isActive !== false, 
        ...doc.data()
      }));
      // מיון השחקנים רק אם הם פעילים
      playersData.sort((a, b) => a.rank - b.rank);
      setPlayers(playersData);
      setLoading(false);
      
      const isLocallyRegistered = localUserId && playersData.some(p => p.id === localUserId);
      const isFirebaseRegistered = playersData.some(p => p.id === user.uid);
      
      if (!isLocallyRegistered && !isFirebaseRegistered && view !== 'rules' && view !== 'admin') {
         if(view !== 'home' && view !== 'join') setView('home');
      } else if ((isLocallyRegistered || isFirebaseRegistered) && view === 'join') {
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
      matchesData.sort((a, b) => b.timestamp - a.timestamp);
      setMatches(matchesData);
    });

    const unsubscribeConfig = onSnapshot(configRef, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setLeagueConfig({
                displayName: data.displayName || "סקווש חיפה",
                language: data.language || "he",
                adminName: data.adminName || "ניצן מורה",
                adminPhone: data.adminPhone || "054-4372323",
                adminPassword: data.adminPassword || "squash2026",
                whatsappGroupLink: data.whatsappGroupLink || "",
                themePrimary: data.themePrimary || "#8A2BE2",
                themeSecondary: data.themeSecondary || "#E020A3",
                logoUrl: data.logoUrl || "",
                docId: snapshot.docs[0].id
            });
        } else {
             // אם אין קונפיגורציה (מועדון חדש לגמרי), נגדיר ברירת מחדל
             setLeagueConfig({ 
                 displayName: `Club ${currentClubId}`, 
                 language: "he",
                 adminName: "Admin", 
                 adminPhone: "", 
                 adminPassword: "squash2026",
                 whatsappGroupLink: "",
                 themePrimary: "#8A2BE2",
                 themeSecondary: "#E020A3",
                 logoUrl: "",
                 docId: null
             });
        }
    });

    // שליפת רשימת כל המועדונים עבור הסופר אדמין ועבור הלינקים בתחתית
    const globalClubsRef = collection(db, 'artifacts', appId, 'public', 'data', 'global_clubs');
    const unsubscribeGlobalClubs = onSnapshot(globalClubsRef, (snapshot) => {
        const clubsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // נוסיף ידנית את חיפה אם היא לא קיימת ברשימה עדיין (לצורך תאימות לאחור)
        if (!clubsData.some(c => c.clubId === 'haifa')) {
             clubsData.push({ clubId: 'haifa', displayName: 'סקווש חיפה' });
        }
        
        setAllClubs(clubsData);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
      unsubscribeConfig();
      unsubscribeGlobalClubs();
    };
  }, [user, localUserId, view, pPath, mPath, cPath]);

  // שאיבת המידע הפרטי (רק כשהאדמין מחובר!)
  useEffect(() => {
    if (isAdmin) {
        const fetchPrivateData = async () => {
            try {
                const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', privPath));
                const data = {};
                snap.forEach(d => { data[d.id] = d.data(); });
                setAdminPrivateData(data);
            } catch (err) {
                console.error("Error fetching private data", err);
            }
        };
        fetchPrivateData();
    }
  }, [isAdmin, privPath]);

  // --- Helpers ---
  const myPlayer = players.find(p => p.id === localUserId);
  // שחקנים פעילים בלבד לתצוגה בסולם
  const activePlayers = players.filter(p => p.isActive !== false);

  const cleanPhone = (p) => p.replace(/\D/g, '');

  const getPlayerStats = (playerId) => {
    const playerMatches = matches.filter(m => m.winnerId === playerId || m.loserId === playerId);
    const wins = playerMatches.filter(m => m.winnerId === playerId).length;
    const losses = playerMatches.length - wins;
    const winPercent = playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0;
    return { total: playerMatches.length, wins, losses, winPercent };
  };

  // פונקציית ייצוא שחקנים לאקסל (הכוללת מידע מהכספת)
  const exportPlayersToCSV = () => {
    const headers = [dict.stats_rank, dict.t_name, 'Phone', 'Email', 'ID', 'PIN', 'Status', 'Health', 'Rules', 'Joined'];
    
    const rows = players.map(p => {
        const priv = adminPrivateData[p.id] || {};
        return [
            p.isActive === false ? 'Frozen' : p.rank,
            p.name,
            p.phone,
            priv.email || p.email || '',
            priv.idNumber || p.idNumber || '',
            priv.pin || p.pin || '',
            p.isActive === false ? 'Frozen' : 'Active',
            (priv.healthDeclaration ?? p.healthDeclaration) ? 'Yes' : 'No',
            (priv.rulesAgreed ?? p.rulesAgreed) ? 'Yes' : 'No',
            p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : ''
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `players_export_${currentClubId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Actions ---
  // התחברות מאובטחת
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
        } catch (err) {
            console.error("Login error:", err);
        }
    }
    
    alert(lang === 'he' ? "מספר הטלפון או קוד הגישה שגויים." : "Invalid phone or PIN.");
  };

  const handleForgotPassword = (e) => {
      e.preventDefault();
      const inputPhone = cleanPhone(e.target.phone.value);
      const found = players.find(p => cleanPhone(p.phone) === inputPhone);

      if (found) {
          alert(lang === 'he' ? `היי ${found.name}, \nמטעמי אבטחה לא ניתן לשחזר קוד גישה אוטומטית.\nאנא פנה למנהל הליגה (${leagueConfig.adminName}, ${leagueConfig.adminPhone}) בוואטסאפ לצורך איפוס קוד הגישה שלך.` : `Hi ${found.name}, please contact the admin (${leagueConfig.adminName}) to reset your PIN.`);
          setForgotPasswordOpen(false);
      } else {
          alert(lang === 'he' ? "לא נמצא שחקן רשום עם מספר טלפון זה." : "Phone number not found.");
      }
  }

  const handleLogout = () => {
    localStorage.removeItem(`squash_user_id_${currentClubId}`);
    setLocalUserId(null);
    setView('home');
  };

  // הרשמה מאובטחת ומפוצלת
  const handleJoin = async (e) => {
    e.preventDefault();
    if (isSubmittingJoin) return;
    
    const phone = e.target.phone.value;
    const cleanedInputPhone = cleanPhone(phone);
    const pin = e.target.pin.value;
    
    if (pin.length !== 4) {
        alert(lang === 'he' ? "קוד הגישה חייב להיות בן 4 ספרות בדיוק." : "PIN must be exactly 4 digits.");
        return;
    }

    const existingPlayer = players.find(p => cleanPhone(p.phone) === cleanedInputPhone);
    if (existingPlayer) {
        alert(lang === 'he' ? "מספר טלפון זה כבר רשום במערכת. אנא התחבר דרך 'כניסה לרשומים' או השתמש במספר אחר." : "This number is already registered.");
        return;
    }

    setIsSubmittingJoin(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const idNumber = e.target.idNumber.value;
    const healthDeclaration = e.target.health.checked;
    const rulesAgreed = e.target.rulesCheck.checked;
    
    const newRank = activePlayers.length > 0 ? activePlayers.length + 1 : 1;
    
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, user.uid), {
        name,
        phone,
        rank: newRank,
        isActive: true,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, user.uid), {
        email,
        idNumber,
        pin,
        healthDeclaration,
        rulesAgreed
      });
      
      localStorage.setItem(`squash_user_id_${currentClubId}`, user.uid);
      setLocalUserId(user.uid);
      setView('ladder');
    } catch (err) {
      console.error("Error joining:", err);
      alert(lang === 'he' ? "שגיאה ברישום. נסה שוב." : "Error during registration. Please try again.");
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // פעולת הקפאה/הפעלה של שחקן
  const togglePlayerStatus = async () => {
      if (!myPlayer) return;
      
      const newStatus = myPlayer.isActive === false; // הפוך את הסטטוס הנוכחי
      let newRank = myPlayer.rank;

      if (newStatus === false) {
           if (!window.confirm(lang === 'he' ? "האם אתה בטוח שברצונך לצאת מהליגה? \n\nפעולה זו תסיר אותך מהסולם הפעיל, אך תשמור את היסטוריית המשחקים שלך. תוכל לחזור בכל שלב (ותתחיל מתחתית הסולם)." : "Are you sure you want to freeze your account?")) {
               return;
           }
           // אם מקפיא את עצמו, צריך לקדם את כל מי שמתחתיו
           const sortedActive = [...activePlayers].sort((a,b) => a.rank - b.rank);
           const updates = [];
           sortedActive.forEach(p => {
               if (p.rank > myPlayer.rank) {
                   updates.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), {
                       rank: p.rank - 1
                   }));
               }
           });
           updates.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, myPlayer.id), {
               isActive: false,
               rank: 9999 // למקם למטה כדי שלא יפריע
           }));
           
           try {
               await Promise.all(updates);
           } catch(e) {
               console.error(e);
           }
      } else {
           // אם חוזר להיות פעיל, מקבל את המקום האחרון
           newRank = activePlayers.length > 0 ? activePlayers.length + 1 : 1;
           try {
               await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, myPlayer.id), {
                   isActive: true,
                   rank: newRank,
                   lastActive: new Date().toISOString()
               });
           } catch(e) {
               console.error(e);
           }
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

        const updates = [];
        sortedPlayers.forEach((p, index) => {
          const expectedRank = index + 1;
          if (p.rank !== expectedRank) {
            updates.push(updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), {
              rank: expectedRank,
              ...(p.id === winnerId ? { lastActive: new Date().toISOString() } : {})
            }));
          }
        });
        await Promise.all(updates);
      } else {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, winnerId), {
          lastActive: new Date().toISOString()
        });
      }
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', mPath), {
        winnerId,
        loserId,
        winnerName: activePlayers.find(p => p.id === winnerId)?.name || 'Unknown',
        loserName: activePlayers.find(p => p.id === loserId)?.name || 'Unknown',
        playersSnapshot, 
        timestamp: Date.now(),
        dateString: new Date().toLocaleString(lang === 'he' ? 'he-IL' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })
      });

      setMatchModal({ isOpen: false, opponent: null });
    } catch (err) {
      console.error("Error updating match result:", err);
      alert(lang === 'he' ? "אירעה שגיאה בעת עדכון התוצאה." : "Error updating match.");
    }
  };

  const openWhatsApp = (phone, myName, e) => {
    e.stopPropagation(); 
    const finalPhone = cleanPhone(phone).startsWith('0') ? '972' + cleanPhone(phone).substring(1) : cleanPhone(phone);
    const t_msg = lang === 'he' 
        ? `היי! מדבר ${myName} מליגת הסקווש. אני רוצה לעשות לך צ׳אלנג׳ למשחק במסגרת הסולם! מתי נוח לך? 🎾`
        : `Hi! This is ${myName} from the Squash League. I want to challenge you for a ladder match! When are you free? 🎾`;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(t_msg)}`;
    
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
    
    // בדיקת סופר אדמין
    if (adminUsername === 'superadmin' && adminPassword === 'master2026') {
        setIsSuperAdmin(true);
        setAdminLoginError(false);
        return; // עוצר כאן, לא נכנס למנהל רגיל
    }

    // בדיקת מנהל מועדון רגיל
    if (adminUsername === 'admin' && adminPassword === (leagueConfig.adminPassword || 'squash2026')) {
      setIsAdmin(true);
      setAdminLoginError(false);
      setAdminConfigEdit({ ...leagueConfig });
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
        return updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, id), {
          name: data.name,
          rank: parseInt(data.rank, 10),
          isActive: data.isActive !== false
        });
      });
      await Promise.all(updates);
      setAdminEdits({});
      alert(lang === 'he' ? "כל השינויים נשמרו בהצלחה!" : "Saved successfully!");
    } catch (err) {
      console.error("Admin save error:", err);
      alert("שגיאה בשמירת הנתונים.");
    }
  };

  const adminDeletePlayer = async (playerId) => {
    if (window.confirm(lang === 'he' ? "האם אתה בטוח שברצונך למחוק שחקן זה? המחיקה הינה סופית." : "Delete player permanently?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, playerId));
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, playerId));
        setAdminEdits(prev => { const newEdits = {...prev}; delete newEdits[playerId]; return newEdits; });
      } catch (err) {
        console.error("Admin delete error:", err);
      }
    }
  };

  const adminResetPin = async (playerId) => {
      const newPin = prompt(lang === 'he' ? "הזן קוד PIN חדש בן 4 ספרות עבור השחקן:" : "Enter new 4-digit PIN for player:");
      if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
          try {
              const privRef = doc(db, 'artifacts', appId, 'public', 'data', privPath, playerId);
              const privDoc = await getDoc(privRef);
              if (privDoc.exists()) {
                  await updateDoc(privRef, { pin: newPin });
              } else {
                  await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, playerId), { pin: newPin });
              }
              setAdminPrivateData(prev => ({...prev, [playerId]: {...(prev[playerId]||{}), pin: newPin}}));
              
              alert(lang === 'he' ? "הקוד אופס בהצלחה." : "PIN reset successfully.");
          } catch (err) {
              console.error("Admin reset PIN error:", err);
              alert("שגיאה באיפוס הקוד.");
          }
      } else if (newPin !== null) {
          alert(lang === 'he' ? "קוד לא תקין. יש להזין 4 ספרות בדיוק." : "Invalid PIN. Must be 4 digits.");
      }
  }

  const adminDeleteMatch = async (match) => {
    if (window.confirm(lang === 'he' ? "למחוק משחק זה?\nאם יש תיעוד, הדירוג יחזור למצב שהיה לפני המשחק." : "Delete match and restore rankings?")) {
      try {
        if (match.playersSnapshot) {
           const updates = match.playersSnapshot.map(p => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id), {
              rank: p.rank
           }));
           await Promise.all(updates);
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', mPath, match.id));
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
    
    if (window.confirm(lang === 'he' ? "בטוח שברצונך להפוך תוצאה?" : "Reverse this match?")) {
       try {
          const newWinnerId = match.loserId;
          const newLoserId = match.winnerId;

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

          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', mPath, match.id), {
              winnerId: newWinnerId,
              loserId: newLoserId,
              winnerName: match.loserName,
              loserName: match.winnerName
          });
       } catch(e) {
          console.error("Reverse error:", e);
       }
    }
  };

  const saveAdminConfig = async () => {
    try {
      const newConfig = {
          displayName: adminConfigEdit.displayName,
          language: adminConfigEdit.language || 'he',
          adminName: adminConfigEdit.adminName,
          adminPhone: adminConfigEdit.adminPhone,
          adminPassword: adminConfigEdit.adminPassword || "squash2026",
          whatsappGroupLink: adminConfigEdit.whatsappGroupLink || "",
          themePrimary: adminConfigEdit.themePrimary,
          themeSecondary: adminConfigEdit.themeSecondary,
          logoUrl: adminConfigEdit.logoUrl || ""
      };

      if (leagueConfig.docId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', cPath, leagueConfig.docId), newConfig);
      } else {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', cPath), newConfig);
      }
      alert(lang === 'he' ? "הגדרות המועדון נשמרו בהצלחה." : "Settings saved.");
    } catch (err) {
      console.error("Error saving admin config:", err);
      alert("שגיאה בשמירת ההגדרות.");
    }
  };

  const adminResetLeague = async () => {
    if (!confirmResetChecked) return;
    try {
      const playerDeletions = players.map(p => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', pPath, p.id)));
      const privDeletions = players.map(p => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', privPath, p.id)));
      const matchDeletions = matches.map(m => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', mPath, m.id)));
      
      await Promise.all([...playerDeletions, ...privDeletions, ...matchDeletions]);
      
      alert(lang === 'he' ? "הליגה אופסה בהצלחה." : "League reset successfully.");
      setShowResetModal(false);
      setConfirmResetChecked(false);
    } catch (err) {
      console.error("Error resetting league:", err);
    }
  };

  // --- פעולות סופר אדמין ---
  const handleCreateClub = async (e) => {
      e.preventDefault();
      const clubId = newClubForm.id.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      if (!clubId || !newClubForm.name) {
          alert("יש להזין מזהה ושם מועדון.");
          return;
      }

      try {
          // רישום המועדון ברשימה הגלובלית
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'global_clubs'), {
              clubId: clubId,
              displayName: newClubForm.name,
              createdAt: new Date().toISOString()
          });

          // יצירת קונפיגורציה ראשונית למועדון החדש
          const newClubConfigPath = `config_${clubId}`;
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', newClubConfigPath), {
              displayName: newClubForm.name,
              language: newClubForm.language || 'he',
              adminName: newClubForm.adminName || "Admin",
              adminPhone: "",
              adminPassword: newClubForm.password || "123456",
              whatsappGroupLink: "",
              themePrimary: "#8A2BE2",
              themeSecondary: "#E020A3",
              logoUrl: ""
          });

          alert(lang === 'he' ? `המועדון הוקם! הלינק שלו: /${clubId}` : `Club Created! Link: /${clubId}`);
          setNewClubForm({ id: '', name: '', password: '', language: 'he', adminName: '' });
      } catch (err) {
          console.error("Error creating club:", err);
          alert("שגיאה בהקמת המועדון.");
      }
  };

  const handleResetClubPassword = async (clubId, clubName) => {
      const newPassword = prompt(`New password for ${clubName}:`);
      if (!newPassword) return;

      try {
          const clubConfigRef = collection(db, 'artifacts', appId, 'public', 'data', `config_${clubId}`);
          const snapshot = await getDocs(clubConfigRef);
          
          if (!snapshot.empty) {
              const docId = snapshot.docs[0].id;
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `config_${clubId}`, docId), {
                  adminPassword: newPassword
              });
              alert(`Password reset for ${clubName}!`);
          } else {
              alert("שגיאה: לא נמצאו הגדרות מועדון במסד הנתונים.");
          }
      } catch (err) {
          console.error("Error resetting club password:", err);
      }
  };

  const handleDeleteClub = async (clubId, clubName) => {
      if (clubId === 'haifa') {
          alert("לא ניתן למחוק את המועדון המקורי (haifa).");
          return;
      }

      if (window.confirm(`אזהרה חמורה!\nהאם אתה בטוח שברצונך למחוק לחלוטין את מועדון "${clubName}"?\n\nפעולה זו תמחק את המועדון, ההגדרות, כל השחקנים וכל המשחקים שלו. פעולה זו היא בלתי הפיכה!`)) {
          try {
              const globalClubsRef = collection(db, 'artifacts', appId, 'public', 'data', 'global_clubs');
              const globalClubsSnapshot = await getDocs(globalClubsRef);
              const clubDocToDelete = globalClubsSnapshot.docs.find(doc => doc.data().clubId === clubId);
              if (clubDocToDelete) {
                  await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'global_clubs', clubDocToDelete.id));
              }

              const configRef = collection(db, 'artifacts', appId, 'public', 'data', `config_${clubId}`);
              const configSnapshot = await getDocs(configRef);
              const configDeletions = configSnapshot.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `config_${clubId}`, d.id)));
              
              const playersRef = collection(db, 'artifacts', appId, 'public', 'data', `players_${clubId}`);
              const playersSnapshot = await getDocs(playersRef);
              const playerDeletions = playersSnapshot.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `players_${clubId}`, d.id)));

              const privPlayersRef = collection(db, 'artifacts', appId, 'public', 'data', `private_${clubId}`);
              const privPlayersSnapshot = await getDocs(privPlayersRef);
              const privPlayerDeletions = privPlayersSnapshot.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `private_${clubId}`, d.id)));

              const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', `matches_${clubId}`);
              const matchesSnapshot = await getDocs(matchesRef);
              const matchDeletions = matchesSnapshot.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `matches_${clubId}`, d.id)));

              await Promise.all([...configDeletions, ...playerDeletions, ...privPlayerDeletions, ...matchDeletions]);
          } catch (err) {
              console.error("Error deleting club:", err);
          }
      }
  };

  const switchClubContext = (clubId) => {
      window.location.href = `/${clubId}`;
  }

  // --- Renders ---
  
  const renderSuperAdmin = () => (
      <div className="space-y-6 pb-8 animate-in fade-in duration-500 text-start" dir={dict.dir}>
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden border border-indigo-500/30">
              <Globe size={48} className="text-white/20 absolute -end-4 -bottom-4 w-32 h-32" />
              <h2 className="text-3xl font-black text-white relative z-10 flex items-center gap-3 mb-2">
                  {dict.sa_title}
              </h2>
              <p className="text-indigo-200 relative z-10">{dict.sa_subtitle}</p>
          </div>

          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                  <Plus className="text-emerald-400" /> {dict.sa_new_club}
              </h3>
              <form onSubmit={handleCreateClub} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                      <label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_id}</label>
                      <input 
                          type="text" 
                          value={newClubForm.id}
                          onChange={(e) => setNewClubForm({...newClubForm, id: e.target.value})}
                          className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                          dir="ltr"
                      />
                  </div>
                  <div>
                      <label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_name}</label>
                      <input 
                          type="text" 
                          value={newClubForm.name}
                          onChange={(e) => setNewClubForm({...newClubForm, name: e.target.value})}
                          className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                  </div>
                  <div>
                      <label className="block text-[#A594BA] text-xs mb-1 font-bold flex items-center gap-1"><Globe size={12}/> {dict.f_club_lang}</label>
                      <select 
                          value={newClubForm.language} 
                          onChange={(e) => setNewClubForm({...newClubForm, language: e.target.value})} 
                          className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors appearance-none cursor-pointer"
                      >
                          <option value="he">עברית (Hebrew RTL)</option>
                          <option value="en">English (LTR)</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_admin_name}</label>
                      <input 
                          type="text" 
                          value={newClubForm.adminName}
                          onChange={(e) => setNewClubForm({...newClubForm, adminName: e.target.value})}
                          className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                  </div>
                  <div>
                      <label className="block text-[#A594BA] text-xs mb-1 font-bold">{dict.f_club_pass}</label>
                      <input 
                          type="text" 
                          value={newClubForm.password}
                          onChange={(e) => setNewClubForm({...newClubForm, password: e.target.value})}
                          className="w-full bg-[#0A0410]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                          dir="ltr"
                      />
                  </div>
                  <div className="sm:col-span-2">
                      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 h-[50px]">
                          {dict.btn_create_club}
                      </button>
                  </div>
              </form>
          </div>

          <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2">{dict.sa_active_clubs}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allClubs.length === 0 ? (
                  <div className="text-slate-400">אין מועדונים (מלבד חיפה ברירת המחדל).</div>
              ) : (
                  allClubs.map(club => (
                      <div key={club.clubId} className="bg-white/5 p-5 rounded-[20px] border border-white/10 hover:bg-white/10 transition-colors flex flex-col gap-3">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                              <h4 className="text-lg font-bold text-white">{club.displayName}</h4>
                              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                  {club.clubId !== 'haifa' && (
                                      <button 
                                          onClick={() => handleDeleteClub(club.clubId, club.displayName)}
                                          className="flex-1 sm:flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-all flex items-center justify-center shrink-0"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  )}
                                  <button 
                                      onClick={() => handleResetClubPassword(club.clubId, club.displayName)}
                                      className="flex-1 sm:flex-none bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 shrink-0"
                                  >
                                      <KeyRound size={16} /> {dict.btn_reset_pwd}
                                  </button>
                                  <button 
                                      onClick={() => switchClubContext(club.clubId)}
                                      className="flex-1 sm:flex-none bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0"
                                  >
                                      <Settings size={16} /> {dict.btn_manage}
                                  </button>
                              </div>
                          </div>
                          <div className="bg-[#0A0410]/50 p-3 rounded-xl border border-white/5 mt-1">
                              <p className="text-[10px] text-[#A594BA] mb-1 uppercase tracking-wider font-bold">{dict.direct_link}</p>
                              <p className="text-sm text-emerald-400 font-mono break-all select-all cursor-pointer" dir="ltr">
                                  {window.location.origin}/{club.clubId}
                              </p>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
  );

  const renderHome = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 text-start" dir={dict.dir}>
      <div className="text-center pt-8 pb-2 relative">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 theme-bg-secondary-20 rounded-full blur-[60px] z-0"></div>
        
        {/* Logo Display Logic */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full theme-gradient-br mb-6 theme-glow-secondary-50 relative z-10 overflow-hidden border border-white/10 shadow-xl">
          {leagueConfig.logoUrl ? (
            <img src={leagueConfig.logoUrl} alt="Club Logo" className="w-full h-full object-cover" />
          ) : (
            <Trophy size={40} className="text-white" />
          )}
        </div>

        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A594BA] mb-2 relative z-10 drop-shadow-sm">
          {leagueConfig.displayName}
        </h1>
        <p className="text-[#A594BA] relative z-10 font-medium tracking-wide">{dict.arena_subtitle}</p>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {myPlayer ? (
          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-[24px] border theme-border-primary-30 text-center theme-glow-primary-20">
            <p className="text-[#A594BA] mb-2">{dict.hello}, <strong className="text-white">{myPlayer.name}</strong></p>
            {myPlayer.isActive === false && (
                <div className="bg-amber-500/10 text-amber-400 text-sm font-bold p-2 rounded-lg mt-2 mb-2 border border-amber-500/20">
                    {dict.account_frozen}
                </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setView('ladder')} className="flex-1 theme-gradient-r text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform text-sm">
                {myPlayer.isActive === false ? dict.btn_view_ladder : dict.btn_to_ladder}
              </button>
              <button 
                onClick={togglePlayerStatus} 
                className={`px-4 font-bold py-3 rounded-xl transition-colors flex items-center justify-center text-sm ${myPlayer.isActive === false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-white/5 border border-white/10 text-[#A594BA] hover:text-white'}`}
              >
                {myPlayer.isActive === false ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
              </button>
              <button onClick={handleLogout} className="px-4 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => setLoginModalOpen(true)} className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-lg">
              <LogIn size={22} /> {dict.btn_login}
            </button>
            <button onClick={() => setView('join')} className="w-full theme-gradient-r text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 theme-glow-secondary-40 active:scale-95 transition-all theme-bg-secondary-hover">
              <UserPlus size={22} /> {dict.btn_join}
            </button>
          </>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-7 border border-white/10 shadow-xl relative z-10 mt-6">
        <div className="flex flex-col gap-2 mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
              <div className="theme-bg-primary-20 p-2 rounded-full theme-text-primary">
                <Info size={24} />
              </div>
              <h2 className="text-xl font-black text-white">{dict.rules_title}</h2>
          </div>
          <p className="text-[#A594BA] text-sm">{dict.rules_subtitle}</p>
        </div>
        
        <ul className="space-y-4 text-sm text-[#A594BA]">
          <li className="flex items-start gap-3">
            <span className="theme-bg-secondary w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">1</span>
            <div><strong className="text-white">{dict.rule1_title}</strong> {dict.rule1_text}</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="theme-bg-primary w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">2</span>
            <div><strong className="text-white">{dict.rule2_title}</strong> {dict.rule2_text}</div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold shrink-0 text-xs mt-0.5">3</span>
            <div><strong className="text-white">{dict.rule3_title}</strong> {dict.rule3_text}</div>
          </li>
        </ul>

        <button onClick={() => setShowRulesModal(true)} className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <BookOpen size={18} />
            {dict.btn_full_rules}
        </button>

        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
            <p className="text-white font-bold mb-1">{dict.admin_name} {leagueConfig.adminName}</p>
            <p className="text-[#A594BA] text-sm">{dict.admin_phone} <a href={`tel:${leagueConfig.adminPhone}`} className="theme-text-secondary hover:underline" dir="ltr">{leagueConfig.adminPhone}</a></p>
        </div>

        {leagueConfig.whatsappGroupLink && (
            <a href={leagueConfig.whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="mt-4 w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_4px_15px_rgba(37,211,102,0.3)] active:scale-95">
                <MessageCircle size={20} />
                {dict.whatsapp_group}
            </a>
        )}
      </div>

      <div className="pt-4 pb-4 text-center">
        <h3 className="font-bold theme-text-secondary mb-4 uppercase tracking-widest text-xs">{dict.ladder_preview}</h3>
        <div className="space-y-3">
          {activePlayers.length === 0 ? (
            <div className="py-6 text-[#A594BA] bg-white/5 rounded-2xl border border-white/10">{dict.no_active_players}</div>
          ) : (
            activePlayers.slice(0, 5).map(player => (
              <div key={player.id} onClick={() => setStatsModalPlayer(player)} className="flex items-center justify-between p-4 rounded-[20px] bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${player.rank <= 3 ? 'theme-gradient-br text-white' : 'bg-white/10 text-white'}`}>
                    {player.rank}
                  </div>
                  <h3 className="font-bold text-white tracking-wide">{player.name}</h3>
                </div>
              </div>
            ))
          )}
        </div>
        {activePlayers.length > 5 && (
          <button onClick={() => setView('ladder')} className="w-full mt-4 text-[#A594BA] text-sm hover:text-white transition-colors">
            {dict.show_all_ladder} ({activePlayers.length})
          </button>
        )}
      </div>
      
      {allClubs.length > 1 && (
          <div className="mt-6 mb-8 pt-6 border-t border-white/10 text-center">
              <p className="text-[#A594BA] text-xs uppercase tracking-widest font-bold mb-3 flex items-center justify-center gap-1">
                  <Globe size={12} /> {dict.global_network}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                  {allClubs.filter(c => c.clubId !== currentClubId).map(club => (
                      <a 
                          key={club.clubId}
                          href={`/${club.clubId}`}
                          className="text-xs bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                      >
                          {club.displayName}
                      </a>
                  ))}
              </div>
          </div>
      )}

    </div>
  );

  const renderJoinForm = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 mt-6 text-start" dir={dict.dir}>
      <div className="bg-gradient-to-br from-[#0A0410]/90 to-[#1B0B2E]/90 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border theme-border-secondary-30 relative overflow-hidden">
        <h2 className="text-2xl font-black text-white mb-6">{dict.join_title}</h2>
        
        <form onSubmit={handleJoin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_name}</label>
            <input required type="text" name="name" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none transition-all placeholder-[#A594BA]/50" 
              placeholder={dict.f_name_ph} />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_phone}</label>
            <input required type="tel" name="phone" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none transition-all placeholder-[#A594BA]/50" 
              dir="ltr" />
            <p className="text-xs text-yellow-400/90 mt-2 font-bold leading-tight">
              {dict.f_phone_note}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_email}</label>
            <input required type="email" name="email" 
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none transition-all placeholder-[#A594BA]/50" 
              dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_id}</label>
            <input required type="text" name="idNumber" pattern="\d{8,9}"
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none transition-all placeholder-[#A594BA]/50" 
              dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#A594BA] mb-2">{dict.f_pin}</label>
            <input required type="password" name="pin" pattern="\d{4}" maxLength={4}
              className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none transition-all tracking-[0.5em] text-center placeholder-[#A594BA]/50" 
              placeholder={dict.f_pin_ph} dir="ltr" />
              <p className="text-xs text-[#A594BA]/70 mt-2">{dict.f_pin_note}</p>
          </div>
          
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-start gap-3 mt-4">
              <input required type="checkbox" id="health" className="mt-1 w-4 h-4 theme-accent" />
              <label htmlFor="health" className="text-sm text-[#A594BA] leading-tight cursor-pointer">{dict.f_health}</label>
            </div>
            <div className="flex items-start gap-3 mt-4">
              <input required type="checkbox" id="rulesCheck" className="mt-1 w-4 h-4 theme-accent" />
              <label htmlFor="rulesCheck" className="text-sm text-[#A594BA] leading-tight">
                  <span className="cursor-pointer" onClick={() => setShowRulesModal(true)}>{dict.f_rules}</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isSubmittingJoin} className="w-full theme-gradient-r text-white font-black text-lg py-4 rounded-full transition-all theme-glow-secondary-40 active:scale-95 mt-4 disabled:opacity-50 theme-bg-secondary-hover">
            {isSubmittingJoin ? dict.btn_joining : dict.btn_submit_join}
          </button>
          
          <button type="button" onClick={() => setView('home')} className="w-full mt-3 text-[#A594BA] hover:text-white transition-colors py-2 text-sm font-bold">
            {dict.btn_cancel}
          </button>
        </form>
      </div>
    </div>
  );

  const renderLadder = () => (
    <div className="space-y-4 pb-8 mt-4 animate-in fade-in duration-300" dir={dict.dir}>
      <div className="text-center pb-6 relative">
         <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 theme-bg-primary-20 rounded-full blur-[40px] z-0"></div>
         <h2 className="text-3xl font-black text-white relative z-10 drop-shadow-lg flex justify-center items-center gap-3">
            <List className="theme-text-secondary" size={32} /> {dict.ladder_title}
         </h2>
         {!myPlayer ? (
           <p className="theme-text-secondary mt-2 text-sm relative z-10">{dict.login_required}</p>
         ) : myPlayer.isActive === false ? (
           <p className="text-amber-400 mt-2 text-sm relative z-10">{dict.frozen_alert}</p>
         ) : null}
      </div>

      {activePlayers.map((player) => {
        const isMe = myPlayer && myPlayer.id === player.id;
        const isChallengeable = myPlayer && myPlayer.isActive !== false && !isMe && player.rank < myPlayer.rank && (myPlayer.rank - player.rank) <= 3;
        
        let rankColor = "bg-white/10 text-[#A594BA]";
        let cardStyle = "bg-white/5 border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/10";
        
        if (player.rank === 1) { rankColor = "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-[0_0_15px_rgba(253,224,71,0.5)]"; cardStyle="bg-white/10 border-yellow-500/30 backdrop-blur-lg cursor-pointer hover:bg-white/20"; }
        else if (player.rank === 2) { rankColor = "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"; }
        else if (player.rank === 3) { rankColor = "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_0_10px_rgba(251,146,60,0.3)]"; }
        
        if (isMe) {
          cardStyle = "theme-bg-primary-10 theme-border-secondary theme-glow-secondary-15 backdrop-blur-lg cursor-pointer";
          rankColor = "theme-gradient-br text-white";
        }

        return (
          <div key={player.id} onClick={() => setStatsModalPlayer(player)} className={`flex items-center justify-between p-4 rounded-[24px] border transition-all ${cardStyle}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-lg shrink-0 ${rankColor}`}>
                {player.rank}
              </div>
              <div className="flex flex-col text-start">
                <h3 className={`font-bold text-base sm:text-lg tracking-wide ${isMe ? 'text-white drop-shadow-md' : 'text-white'}`}>
                  {player.name} {isMe && <span className="theme-text-secondary text-xs sm:text-sm ms-1">{dict.you}</span>}
                </h3>
                <span className="text-[#A594BA] text-[11px] sm:text-xs flex items-center gap-1 mt-0.5"><BarChart2 size={12}/> {dict.click_stats}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              {isChallengeable && (
                <button 
                  onClick={(e) => openWhatsApp(player.phone, myPlayer.name, e)}
                  className="theme-gradient-r text-white px-5 py-2 rounded-full text-sm font-black transition-all flex items-center justify-center gap-1.5 theme-glow-secondary-40 active:scale-95 theme-bg-secondary-hover"
                >
                  <Zap size={16} fill="currentColor" />
                  {dict.btn_challenge}
                </button>
              )}
              
              {!isMe && myPlayer && myPlayer.isActive !== false && Math.abs(myPlayer.rank - player.rank) <= 3 && (
                 <button 
                 onClick={(e) => { e.stopPropagation(); setMatchModal({ isOpen: true, opponent: player }); }}
                 className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold transition-all border border-white/20 active:scale-95"
               >
                 {dict.btn_victory}
               </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHistory = () => {
    const displayedMatches = historyFilter === 'personal' && localUserId 
        ? matches.filter(m => m.winnerId === localUserId || m.loserId === localUserId)
        : matches;

    return (
      <div className="space-y-6 pb-8 mt-4 animate-in fade-in duration-300" dir={dict.dir}>
        <div className="text-center pb-2 relative">
           <h2 className="text-3xl font-black text-white relative z-10 flex justify-center items-center gap-3">
              <RefreshCw className="theme-text-primary" size={32} /> {dict.history_title}
           </h2>
           <p className="text-[#A594BA] mt-2 text-sm relative z-10">{dict.history_subtitle}</p>
        </div>

        <div className="flex justify-center gap-3 mb-6 bg-white/5 p-1.5 rounded-full border border-white/10 max-w-xs mx-auto">
            <button 
                onClick={() => setHistoryFilter('all')} 
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${historyFilter === 'all' ? 'theme-bg-secondary text-white shadow-lg' : 'text-[#A594BA] hover:text-white'}`}
            >
                {dict.filter_all}
            </button>
            {localUserId && (
                <button 
                    onClick={() => setHistoryFilter('personal')} 
                    className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${historyFilter === 'personal' ? 'theme-bg-primary text-white shadow-lg' : 'text-[#A594BA] hover:text-white'}`}
                >
                    {dict.filter_mine}
                </button>
            )}
        </div>

        <div className="space-y-3">
          {displayedMatches.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10 text-[#A594BA]">{dict.no_matches}</div>
          ) : (
            displayedMatches.map(match => {
              const isMyWin = match.winnerId === localUserId;
              const isMyLoss = match.loserId === localUserId;
              
              let cardStyle = "bg-white/5 border-white/10";
              if (historyFilter === 'personal') {
                  if (isMyWin) cardStyle = "bg-emerald-500/10 border-emerald-500/30";
                  if (isMyLoss) cardStyle = "bg-slate-500/10 border-slate-500/30";
              }

              return (
                <div key={match.id} className={`backdrop-blur-md p-4 sm:p-5 rounded-[20px] border flex justify-between items-center transition-all ${cardStyle}`}>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="theme-text-secondary text-[10px] sm:text-xs font-bold uppercase mb-1">{dict.winner}</span>
                    <span className={`font-black text-base sm:text-lg ${isMyWin ? 'text-emerald-400' : 'text-white'}`}>{match.winnerName} {isMyWin && <span className="text-xs font-normal block sm:inline mt-0.5 sm:mt-0">{dict.you}</span>}</span>
                  </div>
                  <div className="flex flex-col items-center px-2 sm:px-4 shrink-0">
                    <div className="bg-white/10 px-2 sm:px-3 py-1 rounded-full text-[#A594BA] text-[9px] sm:text-[10px] whitespace-nowrap mb-2" dir="ltr">{match.dateString}</div>
                    <Trophy size={14} className="text-yellow-500 opacity-50 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex flex-col items-center flex-1 text-center">
                    <span className="text-[#A594BA] text-[10px] sm:text-xs font-bold mb-1">{dict.loser}</span>
                    <span className={`font-medium text-base sm:text-lg ${isMyLoss ? 'text-slate-400' : 'text-white/70'}`}>{match.loserName} {isMyLoss && <span className="text-xs font-normal block sm:inline mt-0.5 sm:mt-0">{dict.you}</span>}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderAdmin = () => {
    if (isSuperAdmin) {
        return renderSuperAdmin();
    }

    if (!isAdmin) {
      return (
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/10 max-w-md mx-auto mt-10 text-center relative overflow-hidden animate-in fade-in" dir={dict.dir}>
          <div className="absolute top-0 end-0 w-full h-1 bg-gradient-to-r from-[#FF0055] to-white"></div>
          <ShieldCheck size={56} className="text-[#FF0055] mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,0,85,0.5)]" />
          <h2 className="text-2xl font-black text-white mb-2">{dict.admin_login_title}</h2>
          <p className="text-[#A594BA] text-sm mb-6">{dict.admin_protected} <strong className="text-white">{leagueConfig.displayName}</strong></p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
            <input 
              type="text" 
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder={dict.f_user} 
              className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white focus:border-[#FF0055] focus:outline-none transition-colors"
              dir="ltr"
            />
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder={dict.f_pass} 
              className="w-full px-5 py-4 bg-[#0A0410]/50 border border-white/10 rounded-2xl text-center text-white focus:border-[#FF0055] focus:outline-none tracking-[0.3em] transition-colors"
              dir="ltr"
            />
            
            {adminLoginError && (
              <div className="text-[#FF0055] text-sm font-bold bg-[#FF0055]/10 p-2 rounded-lg">{dict.login_err}</div>
            )}

            <button type="submit" className="w-full bg-[#FF0055]/10 hover:bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 font-black py-4 rounded-full transition-colors active:scale-95 mt-2">
              {dict.btn_admin_login}
            </button>
            
            <button 
                type="button" 
                onClick={() => alert("Contact Super Admin (Network Admin) to reset your password.")} 
                className="w-full text-[#A594BA] text-sm py-2 hover:text-white transition-colors mt-2"
            >
                {dict.forgot_admin}
            </button>
          </form>
        </div>
      );
    }

    const hasEdits = Object.keys(adminEdits).length > 0;

    return (
      <div className="space-y-6 pb-8 animate-in fade-in duration-300 text-start" dir={dict.dir}>
        
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10 relative">
          <div className="flex flex-wrap justify-between items-center mb-6 border-b border-white/10 pb-4 gap-4">
             <h2 className="text-xl font-black text-white flex items-center gap-2">
               <ShieldCheck className="text-[#FF0055]" />
               {dict.manage_players}
             </h2>
             <div className="flex gap-3 w-full sm:w-auto">
                 <button 
                   onClick={exportPlayersToCSV}
                   className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white active:scale-95"
                 >
                   <Download size={16} /> {dict.btn_export}
                 </button>
                 <button 
                   onClick={saveAdminEdits}
                   disabled={!hasEdits}
                   className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${hasEdits ? 'bg-[#FF0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.5)] active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                 >
                   <Save size={16} /> {dict.btn_save}
                 </button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="text-[#A594BA] text-sm border-b border-white/10">
                  <th className="p-3 font-medium text-center">{dict.t_info}</th>
                  <th className="p-3 font-medium text-start">{dict.t_rank}</th>
                  <th className="p-3 font-medium text-start">{dict.t_name}</th>
                  <th className="p-3 font-medium text-center">{dict.t_actions}</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const currentData = adminEdits[player.id] || player;
                  const isEdited = !!adminEdits[player.id];

                  return (
                    <tr key={player.id} className={`border-b border-white/5 transition-colors ${isEdited ? 'bg-[#FF0055]/10' : 'hover:bg-white/5'} ${player.isActive === false ? 'opacity-50' : ''}`}>
                      <td className="p-2 text-center">
                        <button onClick={() => setAdminSelectedPlayer(player)} className="text-[#A594BA] hover:text-white p-2 transition-colors">
                          <Eye size={18} className="mx-auto" />
                        </button>
                      </td>
                      <td className="p-2 flex flex-col gap-1 items-start">
                        <input type="number" value={currentData.rank} onChange={(e) => handleAdminEditChange(player.id, 'rank', e.target.value)} 
                        className={`w-16 px-2 py-1 bg-[#0A0410]/50 border ${isEdited ? 'border-[#FF0055]' : 'border-white/10'} rounded-lg text-center text-white focus:outline-none text-sm`} />
                        
                        <label className="flex items-center gap-1 text-[10px] text-[#A594BA] cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={currentData.isActive !== false}
                                onChange={(e) => handleAdminEditChange(player.id, 'isActive', e.target.checked)}
                                className="accent-emerald-500 w-3 h-3"
                            />
                            {dict.active_checkbox}
                        </label>
                      </td>
                      <td className="p-2 text-start">
                        <input type="text" value={currentData.name} onChange={(e) => handleAdminEditChange(player.id, 'name', e.target.value)} 
                        className={`w-full px-3 py-2 bg-[#0A0410]/50 border ${isEdited ? 'border-[#FF0055]' : 'border-white/10'} rounded-xl text-white focus:outline-none text-start ${player.isActive === false ? 'line-through text-[#A594BA]' : ''}`} />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => adminResetPin(player.id)} className="text-yellow-500 hover:text-white bg-yellow-500/10 p-2 rounded-full transition-colors">
                              <KeyRound size={16} />
                            </button>
                            <button onClick={() => adminDeletePlayer(player.id)} className="text-[#FF0055] hover:text-white bg-[#FF0055]/10 hover:bg-[#FF0055] p-2 rounded-full transition-colors">
                              <Trash2 size={16} className="mx-auto" />
                            </button>
                        </div>
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
            <RefreshCw className="theme-text-primary" />
            {dict.manage_history}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="text-[#A594BA] text-sm border-b border-white/10">
                  <th className="p-3 font-medium text-white text-start">{dict.winner}</th>
                  <th className="p-3 font-medium text-[#A594BA] text-start">{dict.loser}</th>
                  <th className="p-3 font-medium text-center">+/-</th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center text-slate-500">אין משחקים</td></tr>
                ) : matches.map(match => (
                  <tr key={match.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                    <td className="p-3 font-bold text-white text-start">{match.winnerName}</td>
                    <td className="p-3 text-[#A594BA] text-start">{match.loserName}</td>
                    <td className="p-3 text-center flex justify-center gap-3">
                      <button onClick={() => adminReverseMatch(match)} className="text-yellow-500 hover:text-white bg-yellow-500/10 p-2 rounded-full transition-colors">
                        <RotateCcw size={16} />
                      </button>
                      <button onClick={() => adminDeleteMatch(match)} className="text-[#FF0055] hover:text-white bg-[#FF0055]/10 p-2 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/10">
           <h2 className="text-xl font-black text-white border-b border-white/10 pb-4 flex items-center gap-2 mb-4">
               <Info className="theme-text-primary" />
               {dict.club_settings} (<span className="uppercase text-sm">{currentClubId}</span>)
           </h2>
           <div className="space-y-4">
               <div>
                   <label className="block text-sm text-[#A594BA] mb-1">{dict.s_name}</label>
                   <input type="text" value={adminConfigEdit?.displayName || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, displayName: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white theme-input text-start transition-colors" />
               </div>
               
               <div className="flex gap-4">
                   <div className="flex-1">
                       <label className="block text-sm text-[#A594BA] mb-1">{dict.s_color1}</label>
                       <div className="flex items-center gap-3 bg-[#0A0410]/50 border border-white/10 rounded-xl px-3 py-2">
                           <input type="color" value={adminConfigEdit?.themePrimary || '#8A2BE2'} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, themePrimary: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0" />
                           <span className="text-white text-sm" dir="ltr">{adminConfigEdit?.themePrimary || '#8A2BE2'}</span>
                       </div>
                   </div>
                   <div className="flex-1">
                       <label className="block text-sm text-[#A594BA] mb-1">{dict.s_color2}</label>
                       <div className="flex items-center gap-3 bg-[#0A0410]/50 border border-white/10 rounded-xl px-3 py-2">
                           <input type="color" value={adminConfigEdit?.themeSecondary || '#E020A3'} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, themeSecondary: e.target.value})} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0" />
                           <span className="text-white text-sm" dir="ltr">{adminConfigEdit?.themeSecondary || '#E020A3'}</span>
                       </div>
                   </div>
               </div>

               {/* השדה החדש של הלוגו */}
               <div className="pt-2 border-t border-white/5">
                   <label className="block text-sm text-[#A594BA] mb-1">{dict.s_logo}</label>
                   <input type="url" value={adminConfigEdit?.logoUrl || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, logoUrl: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white theme-input transition-colors" dir="ltr" />
                   <p className="text-[10px] text-[#A594BA] mt-1">{dict.s_logo_hint}</p>
               </div>

               <div className="pt-2 border-t border-white/5">
                   <label className="block text-sm text-[#A594BA] mb-1">{dict.s_admin}</label>
                   <input type="text" value={adminConfigEdit?.adminName || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, adminName: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white theme-input text-start transition-colors" />
               </div>
               <div>
                   <label className="block text-sm text-[#A594BA] mb-1">{dict.s_admin_pass}</label>
                   <input type="text" value={adminConfigEdit?.adminPassword || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, adminPassword: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white theme-input transition-colors" dir="ltr" />
               </div>
               <div>
                   <label className="block text-sm text-[#A594BA] mb-1">{dict.s_phone}</label>
                   <input type="tel" value={adminConfigEdit?.adminPhone || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, adminPhone: e.target.value})} className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white theme-input transition-colors" dir="ltr" />
               </div>
               <div>
                   <label className="block text-sm text-[#A594BA] mb-1">{dict.s_wa}</label>
                   <input type="url" value={adminConfigEdit?.whatsappGroupLink || ''} onChange={(e) => setAdminConfigEdit({...adminConfigEdit, whatsappGroupLink: e.target.value})} placeholder="https://chat.whatsapp.com/..." className="w-full px-4 py-2 bg-[#0A0410]/50 border border-white/10 rounded-xl text-white theme-input transition-colors" dir="ltr" />
               </div>
               <button onClick={saveAdminConfig} className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all w-full mt-2">
                  {dict.btn_save_settings}
               </button>
               
               <div className="pt-6 mt-4 border-t border-white/10">
                 <button onClick={() => {setShowResetModal(true); setConfirmResetChecked(false);}} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3 px-4 rounded-xl transition-all flex justify-center items-center gap-2">
                   <AlertTriangle size={18} />
                   {dict.btn_reset_league}
                 </button>
               </div>
           </div>
        </div>

      </div>
    );
  };

  // --- Modals ---
  const renderRulesModal = () => {
      if (!showRulesModal) return null;
      return (
          <div className="fixed inset-0 bg-[#0A0410]/90 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in" onClick={() => setShowRulesModal(false)}>
              <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative max-h-[80vh] overflow-y-auto custom-scrollbar text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
                  <button onClick={() => setShowRulesModal(false)} className="absolute top-4 start-4 text-[#A594BA] hover:text-white bg-white/5 rounded-full p-1">✕</button>
                  <h3 className="text-2xl font-black text-white mb-4 border-b border-white/10 pb-4">{dict.rules_modal_title} {leagueConfig.displayName}</h3>
                  
                  <div className="text-[#A594BA] space-y-4 text-sm leading-relaxed">
                      <p>{dict.rules_welcome}</p>
                      
                      <h4 className="text-white font-bold mt-4">{dict.privacy_title}</h4>
                      <p>{dict.privacy_text}</p>
                      
                      <h4 className="text-white font-bold mt-4">{dict.detailed_rules_title}</h4>
                      <ul className="list-disc ps-5 space-y-2">
                          <li>{dict.dr_1}</li>
                          <li>{dict.dr_2}</li>
                          <li>{dict.dr_3}</li>
                          <li>{dict.dr_4}</li>
                          <li>{dict.dr_5}</li>
                          <li>{dict.dr_6}</li>
                          <li>{dict.dr_7}</li>
                      </ul>

                      <h4 className="text-white font-bold mt-4">{dict.health_title}</h4>
                      <p>{dict.health_text}</p>
                      
                      <h4 className="text-white font-bold mt-4">{dict.guide_title}</h4>
                      <ul className="list-disc ps-5 space-y-2">
                          <li><strong className="text-white">{dict.guide_login.split(':')[0]}:</strong> {dict.guide_login.split(':')[1] || dict.guide_login}</li>
                          <li><strong className="text-white">{dict.guide_challenge.split(':')[0]}:</strong> {dict.guide_challenge.split(':')[1] || dict.guide_challenge}</li>
                          <li><strong className="text-white">{dict.guide_report.split(':')[0]}:</strong> {dict.guide_report.split(':')[1] || dict.guide_report}</li>
                          <li><strong className="text-white">{dict.guide_stats.split(':')[0]}:</strong> {dict.guide_stats.split(':')[1] || dict.guide_stats}</li>
                      </ul>

                      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                          <p className="text-white font-bold mb-1">{dict.admin_name} {leagueConfig.adminName}</p>
                          <p>{dict.admin_phone} <a href={`tel:${leagueConfig.adminPhone}`} className="theme-text-secondary hover:underline" dir="ltr">{leagueConfig.adminPhone}</a></p>
                      </div>

                      {leagueConfig.whatsappGroupLink && (
                          <a href={leagueConfig.whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="mt-4 w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_4px_15px_rgba(37,211,102,0.3)] active:scale-95">
                              <MessageCircle size={20} />
                              {dict.whatsapp_group}
                          </a>
                      )}
                  </div>
                  
                  <button onClick={() => setShowRulesModal(false)} className="w-full mt-6 theme-bg-secondary text-white font-bold py-3 rounded-full transition-colors theme-bg-secondary-hover">
                      {dict.close}
                  </button>
              </div>
          </div>
      )
  }

  const renderResetModal = () => {
      if (!showResetModal) return null;
      return (
          <div className="fixed inset-0 bg-[#0A0410]/90 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in" onClick={() => setShowResetModal(false)}>
              <div className="bg-[#1B0B2E] border border-red-500/50 rounded-[32px] p-6 max-w-md w-full shadow-[0_0_40px_rgba(255,0,0,0.2)] relative text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
                  <button onClick={() => setShowResetModal(false)} className="absolute top-4 start-4 text-[#A594BA] hover:text-white bg-white/5 rounded-full p-1">✕</button>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                      <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-center text-white mb-2">{dict.reset_modal_title}</h3>
                  <p className="text-center text-[#A594BA] mb-6 leading-relaxed">
                      {dict.reset_modal_sub}
                  </p>

                  <div className="flex items-start gap-3 mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      <input
                          type="checkbox"
                          id="confirmReset"
                          checked={confirmResetChecked}
                          onChange={(e) => setConfirmResetChecked(e.target.checked)}
                          className="mt-1 w-5 h-5 accent-red-500 cursor-pointer shrink-0"
                      />
                      <label htmlFor="confirmReset" className="text-sm text-white cursor-pointer leading-tight">
                          {dict.reset_modal_confirm} {currentClubId}.
                      </label>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setShowResetModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-full transition-colors border border-white/10">
                          {dict.cancel}
                      </button>
                      <button
                          onClick={adminResetLeague}
                          disabled={!confirmResetChecked}
                          className={`flex-1 font-bold py-3 rounded-full transition-all flex justify-center items-center gap-2 ${confirmResetChecked ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,0,0,0.5)] active:scale-95' : 'bg-red-500/30 text-white/50 cursor-not-allowed'}`}
                      >
                          {dict.btn_delete_all}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderLoginModal = () => {
    if (!loginModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => { if(!forgotPasswordOpen) setLoginModalOpen(false) }}>
        
        {forgotPasswordOpen ? (
            <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()} dir={dict.dir}>
                <button onClick={() => setForgotPasswordOpen(false)} className="absolute top-4 start-4 text-[#A594BA] hover:text-white">{dict.nav_home}</button>
                <h3 className="text-xl font-black text-center text-white mb-2 mt-4">{dict.forgot_pin_title}</h3>
                <p className="text-center text-sm text-[#A594BA] mb-6">{dict.forgot_pin_sub}</p>
                <form onSubmit={handleForgotPassword}>
                    <input required type="tel" name="phone" placeholder={dict.f_phone} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none text-center mb-4 transition-colors" dir="ltr" />
                    <button type="submit" className="w-full bg-white/10 text-white font-bold py-4 rounded-full hover:bg-white/20 transition-all">
                        {dict.btn_check_details}
                    </button>
                </form>
            </div>
        ) : (
            <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative text-center" onClick={e => e.stopPropagation()} dir={dict.dir}>
              <button onClick={() => setLoginModalOpen(false)} className="absolute top-4 start-4 text-[#A594BA] hover:text-white">✕</button>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <LogIn size={32} />
              </div>
              <h3 className="text-2xl font-black text-center text-white mb-6">{dict.btn_login}</h3>
              <form onSubmit={handleLogin}>
                <input required type="tel" name="phone" placeholder={dict.f_phone} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none text-center mb-3 transition-colors" dir="ltr" />
                <input required type="password" name="pin" placeholder={dict.f_pin_ph} maxLength={4} className="w-full bg-[#0A0410]/50 text-white px-5 py-4 border border-white/10 rounded-2xl theme-input focus:outline-none text-center tracking-[0.5em] mb-4 transition-colors" dir="ltr" />
                <button type="submit" className="w-full theme-gradient-r text-white font-black py-4 rounded-full active:scale-95 transition-all mb-2 theme-glow-secondary-40 theme-bg-secondary-hover">
                  {dict.btn_login}
                </button>
                <button type="button" onClick={() => setForgotPasswordOpen(true)} className="w-full text-[#A594BA] text-sm py-2 hover:text-white transition-colors">
                    {dict.forgot_pin_title}
                </button>
              </form>
            </div>
        )}
      </div>
    );
  };

  const renderStatsModal = () => {
    if (!statsModalPlayer) return null;
    const stats = getPlayerStats(statsModalPlayer.id);
    
    let h2hStats = null;
    if (localUserId && localUserId !== statsModalPlayer.id) {
        const h2hMatches = matches.filter(m => 
            (m.winnerId === statsModalPlayer.id && m.loserId === localUserId) ||
            (m.loserId === statsModalPlayer.id && m.winnerId === localUserId)
        );
        h2hStats = {
            myWins: h2hMatches.filter(m => m.winnerId === localUserId).length,
            opponentWins: h2hMatches.filter(m => m.winnerId === statsModalPlayer.id).length
        };
    }
    
    return (
      <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setStatsModalPlayer(null)}>
        <div className="bg-gradient-to-br from-[#1B0B2E] to-[#0A0410] border border-white/10 rounded-[32px] p-8 max-w-sm w-full theme-glow-primary-30 relative text-center" onClick={e => e.stopPropagation()} dir={dict.dir}>
          <button onClick={() => setStatsModalPlayer(null)} className="absolute top-5 start-5 text-[#A594BA] hover:text-white text-xl">✕</button>
          
          <div className="w-24 h-24 mx-auto theme-gradient-br rounded-full flex items-center justify-center text-4xl font-black text-white theme-glow-secondary-50 mb-4 border-4 border-[#0A0410]">
            {statsModalPlayer.isActive === false ? '-' : statsModalPlayer.rank}
          </div>
          
          <h3 className="text-2xl font-black text-white mb-1">{statsModalPlayer.name}</h3>
          <p className="text-[#A594BA] text-sm mb-6 flex items-center justify-center gap-1">
             {statsModalPlayer.isActive === false ? dict.stats_frozen : <><Trophy size={14}/> {dict.stats_rank}</>}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black text-white">{stats.total}</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">{dict.stats_matches}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black theme-text-secondary">{stats.winPercent}%</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">{dict.stats_winrate}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black text-emerald-400">{stats.wins}</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">{dict.stats_wins}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black text-slate-400">{stats.losses}</div>
              <div className="text-xs text-[#A594BA] mt-1 font-bold">{dict.stats_losses}</div>
            </div>
          </div>

          {h2hStats && (
              <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-center">{dict.h2h_title}</h4>
                  <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-center flex-1">
                          <div className="text-2xl font-black text-emerald-400">{h2hStats.myWins}</div>
                          <div className="text-[10px] text-[#A594BA] font-bold mt-1">{dict.h2h_my_wins}</div>
                      </div>
                      <div className="text-xl font-black text-white/20">-</div>
                      <div className="text-center flex-1">
                          <div className="text-2xl font-black text-slate-400">{h2hStats.opponentWins}</div>
                          <div className="text-[10px] text-[#A594BA] font-bold mt-1">{dict.h2h_opp_wins}</div>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    );
  };

  const renderAdminPlayerModal = () => {
    if (!adminSelectedPlayer) return null;
    return (
      <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setAdminSelectedPlayer(null)}>
        <div className="bg-[#1B0B2E] border border-[#FF0055]/30 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative text-start" onClick={e => e.stopPropagation()} dir={dict.dir}>
          <button onClick={() => setAdminSelectedPlayer(null)} className="absolute top-5 start-5 text-[#A594BA] hover:text-white text-xl">✕</button>
          
          <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              {dict.player_details}
              {adminSelectedPlayer.isActive === false && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md">{dict.p_frozen}</span>}
          </h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-[#A594BA] block text-xs">{dict.p_name}</span>
              <strong className="text-white text-lg">{adminSelectedPlayer.name}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">{dict.p_phone}</span>
              <strong className="text-white" dir="ltr">{adminSelectedPlayer.phone}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">{dict.p_email}</span>
              <strong className="text-white" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.email || adminSelectedPlayer.email || '-'}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">{dict.p_id}</span>
              <strong className="text-white" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.idNumber || adminSelectedPlayer.idNumber || '-'}</strong>
            </div>
            <div>
              <span className="text-[#A594BA] block text-xs">PIN Code</span>
              <strong className="text-white font-mono" dir="ltr">{adminPrivateData[adminSelectedPlayer.id]?.pin || adminSelectedPlayer.pin || '-'}</strong>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                {(adminPrivateData[adminSelectedPlayer.id]?.healthDeclaration ?? adminSelectedPlayer.healthDeclaration) ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-[#FF0055]" />}
                <span className="text-white">{dict.p_health}</span>
              </div>
              <div className="flex items-center gap-2">
                {(adminPrivateData[adminSelectedPlayer.id]?.rulesAgreed ?? adminSelectedPlayer.rulesAgreed) ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-[#FF0055]" />}
                <span className="text-white">{dict.p_rules}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // משתני ה-CSS הדינמיים שלנו! 
  // האפליקציה תצבע את עצמה לפי הגדרות המועדון.
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

  // --- Main Layout Render ---
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
        {view === 'join' && renderJoinForm()}
        {view === 'ladder' && renderLadder()}
        {view === 'history' && renderHistory()}
        {view === 'admin' && renderAdmin()}
      </main>

      {/* Modals */}
      {renderLoginModal()}
      {renderStatsModal()}
      {renderAdminPlayerModal()}
      {renderRulesModal()}
      {renderResetModal()}
      
      {matchModal.isOpen && matchModal.opponent && (
        <div className="fixed inset-0 bg-[#0A0410]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1B0B2E] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-20 h-20 theme-gradient-br rounded-full flex items-center justify-center mx-auto mb-6 text-white">
              <Trophy size={40} />
            </div>
            <h3 className="text-2xl font-black text-center text-white mb-2">{dict.confirm_win_title}</h3>
            <p className="text-center text-[#A594BA] mb-8">
              {dict.confirm_win_text} <strong className="text-white">{matchModal.opponent.name}</strong>?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setMatchModal({ isOpen: false, opponent: null })} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors">{dict.cancel}</button>
              <button onClick={() => submitMatchResult(localUserId, matchModal.opponent.id)} className="flex-1 py-4 theme-gradient-r rounded-full font-black flex items-center justify-center gap-2 active:scale-95 transition-all theme-bg-secondary-hover">
                <Check size={20} /> {dict.btn_confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      {view !== 'join' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0410]/90 backdrop-blur-xl border-t border-white/10 z-20 pb-safe">
          <div className="max-w-xl mx-auto flex justify-around p-3">
            <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 transition-all ${view === 'home' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}>
              <Home size={24} className="mb-1" />
              <span className="text-[11px] font-bold">{dict.nav_home}</span>
            </button>
            <button onClick={() => setView('ladder')} className={`flex flex-col items-center p-2 transition-all ${view === 'ladder' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}>
              <List size={24} className="mb-1" />
              <span className="text-[11px] font-bold">{dict.nav_ladder}</span>
            </button>
            <button onClick={() => setView('history')} className={`flex flex-col items-center p-2 transition-all ${view === 'history' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}>
              <RefreshCw size={24} className="mb-1" />
              <span className="text-[11px] font-bold">{dict.nav_history}</span>
            </button>
            <button onClick={() => setView('admin')} className={`flex flex-col items-center p-2 transition-all ${view === 'admin' ? 'theme-text-secondary' : 'text-[#A594BA] hover:text-white'}`}>
              <ShieldCheck size={24} className="mb-1" />
              <span className="text-[11px] font-bold">{dict.nav_admin}</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}