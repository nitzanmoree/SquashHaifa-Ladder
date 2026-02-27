<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ליגת כדורסל 3x3</title>
    <!-- ייבוא פונט Heebo -->
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet">
    
    <style>
        :root {
            /* צבעי רקע חצות עמוקים */
            --bg-dark: #0A0410;
            --bg-light: #1B0B2E;
            
            /* עיצוב Glassmorphism */
            --glass-bg: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            
            /* גרדיאנטים וניאון */
            --neon-magenta: #E020A3;
            --neon-purple: #8A2BE2;
            --primary-gradient: linear-gradient(135deg, var(--neon-purple), var(--neon-magenta));
            
            /* טיפוגרפיה */
            --text-main: #FFFFFF;
            --text-muted: #A594BA;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Heebo', sans-serif;
            background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-light) 100%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            -webkit-font-smoothing: antialiased;
        }

        /* מעטפת האפליקציה המותאמת למובייל */
        .app-container {
            width: 100%;
            max-w-width: 480px;
            padding: 24px 20px;
            padding-bottom: 80px;
        }

        /* הדר (Header) */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-weight: 900;
            font-size: 28px;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 20px rgba(224, 32, 163, 0.3);
        }

        /* כרטיסיית זכוכית כללית */
        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        /* תגית Live */
        .badge-live {
            background: #FF0055;
            color: #FFF;
            padding: 4px 14px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 0 15px rgba(255, 0, 85, 0.4);
            animation: pulse 2s infinite;
        }

        .badge-live::before {
            content: '';
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            display: inline-block;
        }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(255, 0, 85, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0); }
        }

        /* משחק נוכחי */
        .match-teams {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
        }

        .team {
            text-align: center;
            flex: 1;
        }

        .team-name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .vs {
            font-size: 16px;
            color: var(--text-muted);
            font-weight: 300;
        }

        .score {
            font-size: 32px;
            font-weight: 900;
            margin-top: 10px;
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* כפתור ראשי */
        .btn-primary {
            background: var(--primary-gradient);
            border: none;
            color: white;
            border-radius: 16px;
            padding: 16px;
            width: 100%;
            font-size: 16px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(138, 43, 226, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:active {
            transform: translateY(2px);
            box-shadow: 0 4px 10px rgba(138, 43, 226, 0.2);
        }

        /* רשימת דירוג */
        .section-title {
            font-size: 20px;
            font-weight: 700;
            margin: 30px 0 16px 0;
            color: white;
        }

        .leaderboard-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .leaderboard-item {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.3s;
        }

        .leaderboard-item:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .rank-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 14px;
            margin-left: 12px;
            color: var(--neon-magenta);
        }

        .team-info h4 {
            font-size: 16px;
            margin-bottom: 2px;
        }

        .team-info p {
            font-size: 12px;
            color: var(--text-muted);
        }

        .team-pts {
            font-weight: 900;
            font-size: 18px;
        }
    </style>
</head>
<body>

    <div class="app-container">
        
        <header class="header">
            <h1>ליגת 3x3</h1>
            <!-- כאן יכנסו כפתורי התפריט שלך מהקוד המקורי -->
        </header>

        <!-- דוגמה לכרטיסיית משחק פעיל (Glassmorphism) -->
        <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge-live">Live</span>
                <span style="color: var(--text-muted); font-size: 14px;">גמר</span>
            </div>
            
            <div class="match-teams">
                <div class="team">
                    <div class="team-name">האריות</div>
                    <div class="score">14</div>
                </div>
                <div class="vs">נגד</div>
                <div class="team">
                    <div class="team-name">קליעה חופשית</div>
                    <div class="score">12</div>
                </div>
            </div>
            
            <button class="btn-primary" style="margin-top: 24px;">עדכון תוצאה</button>
        </div>

        <!-- דוגמה לרשימת קבוצות -->
        <h2 class="section-title">טבלת הליגה</h2>
        <ul class="leaderboard-list">
            <li class="leaderboard-item">
                <div style="display: flex; align-items: center;">
                    <div class="rank-circle">1</div>
                    <div class="team-info">
                        <h4>האריות</h4>
                        <p>5 ניצחונות | 1 הפסדים</p>
                    </div>
                </div>
                <div class="team-pts">15</div>
            </li>
            <li class="leaderboard-item">
                <div style="display: flex; align-items: center;">
                    <div class="rank-circle" style="color: var(--text-muted);">2</div>
                    <div class="team-info">
                        <h4>קליעה חופשית</h4>
                        <p>4 ניצחונות | 2 הפסדים</p>
                    </div>
                </div>
                <div class="team-pts">12</div>
            </li>
        </ul>

    </div>

</body>
</html>