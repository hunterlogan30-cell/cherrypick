export interface NbaTeamInfo {
  abbr: string;
  name: string;
  city: string;
  gradient: string;
  horizontalGradient: string;
  chartGradient: string;
  glowGradient: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface PlayEvent {
  id: string;
  clock: string;
  quarter: number;
  teamAbbr: string;
  description: string;
  isScoringPlay?: boolean;
  pointsScored?: number;
  awayScore?: number;
  homeScore?: number;
}

export interface PlayerLeader {
  name: string;
  jersey: string;
  teamAbbr: string;
  pts: number;
  reb: number;
  ast: number;
}

export interface ScorePoint {
  progress: number; // 0 to 1 across 4 quarters
  diff: number; // positive = teamA (top/away or fav) leading, negative = teamB leading
}

export type GamePhase = 'SCHEDULED' | 'LIVE' | 'CLUTCH' | 'OVERTIME' | 'FINAL';

export type StoppageReason =
  | 'Free Throws'
  | 'Throw-in'
  | 'Timeout'
  | 'Review'
  | 'Jump Ball'
  | 'End of Period'
  | null;

export interface NbaGame {
  id: string;
  awayTeam: string; // e.g. 'PHI'
  homeTeam: string; // e.g. 'NYK'
  awayScore: number;
  homeScore: number;
  phase: GamePhase;
  quarter: number;
  clock: string; // e.g. '4:12' or '1:48'
  isTimeout?: boolean; // When game clock is paused on a team or official timeout
  isClockRunning?: boolean; // True when game action is actively live; false on whistles, fouls, free throws, stoppages
  stoppageReason?: StoppageReason; // Reason game clock is stopped: 'Free Throws', 'Throw-in', 'Timeout', 'Review', 'Jump Ball'
  stoppageDetail?: string; // Specific stoppage label to display in the top-right timing slot (e.g. "Free Throw (1 of 2)" or "Throw-in")
  stoppageTicks?: number; // In-memory ticks elapsed since stoppage began
  startTimeText?: string; // e.g. '5:00 PM EST'
  dayLabel?: 'TODAY' | 'TOMORROW';
  possession?: 'away' | 'home' | null;
  activeRunText?: string; // e.g. 'PHI 8-0 run'
  activeRunTeam?: string; // e.g. 'PHI'
  runPoints?: number; // current unanswered points by activeRunTeam
  clutchNote?: string; // e.g. '3 lead changes in 2 min'
  lastPlayShort?: string; // e.g. 'Lebron pull-up three'
  momentumValue: number; // -100 (away full) to +100 (home full), or relative to top/bottom team
  scoreHistory: ScorePoint[];
  lastPlays: PlayEvent[];
  leaders: PlayerLeader[];
  mvp?: PlayerLeader;
}

export type AlertType =
  | 'OVERTIME'
  | 'LEAD_CHANGE'
  | 'TIP_OFF'
  | 'RUN'
  | 'CLUTCH'
  | 'FINAL'
  | 'MVP'
  | 'BUCKET';

export interface SmartAlert {
  id: string;
  type: AlertType;
  gameId: string;
  teamAbbr: string;
  opponentAbbr: string;
  timestampText: string; // e.g. 'Now' or 'Q3 • 4:12'
  headline: string; // e.g. 'PHI takes the lead'
  subline?: string;
  awayScore?: number;
  homeScore?: number;
  mvp?: PlayerLeader;
  createdAt: number;
}

export interface NotificationPrefs {
  bigMoments: boolean; // Lead changes, runs, clutch time, OT
  tipOff: boolean; // When your game starts
  finalScore: boolean; // Result and MVP
  everyBucket: boolean; // For the obsessed
}

export interface UserSettings {
  onboardingComplete: boolean;
   onboardingStep: number; // 0 = Welcome (Frame 2), 1 = Team (Frame 48), 2 = Alerts (Frame 49), 3 = Done (Frame 50)
  favoriteTeam: string; // Default 'PHI'
  notifications: NotificationPrefs;
  pinnedGameId: string | null;
  overlayVisible: boolean;
  overlayExpanded: boolean;
  dataSourceMode: 'live_api' | 'figma_demo';
}

