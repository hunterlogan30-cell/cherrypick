import React, { useState, useEffect } from 'react';
import { NbaGame, SmartAlert, ScorePoint, PlayEvent, PlayerLeader, NotificationPrefs } from '../types/nba';
import { FloatingGameCard } from '../components/FloatingGameCard';
import { SmartAlertToast } from '../components/SmartAlertToast';
import { FloatingWidgetContainer } from '../components/FloatingWidgetContainer';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { PopupDashboard } from '../components/PopupDashboard';
import { tickLiveGamesOneSecond } from '../services/espnNbaService';
import { NBA_TEAMS, getTeamInfo, getTeamStars } from '../data/teams';
import {
  FIGMA_GAMES_LIVE,
  FIGMA_CENTRAL_HUB_GAMES,
  FIGMA_SCORE_HISTORY_Q3,
  FIGMA_SCORE_HISTORY_CLUTCH,
  FIGMA_SCORE_HISTORY_FINAL,
  FIGMA_SMART_ALERTS,
} from '../data/mockFigmaData';

interface ShowcasePageProps {
  onBackToIndex?: () => void;
  onOpenPlayground?: () => void;
}

const SIM_MILESTONES = [
  { time: 0, label: 'Regulation' },
  { time: 22, label: 'Run' },
  { time: 42, label: 'Clutch' },
  { time: 55, label: 'Overtime' },
  { time: 68, label: 'Final' },
];

const CALLOUT_ITEMS = [
  {
    key: 'TIP_OFF',
    label: 'Tip-Off',
    alert: FIGMA_SMART_ALERTS.TIP_OFF,
    desc: 'Fires when regulation begins, letting you know the ball is in the air without checking a schedule.',
  },
  {
    key: 'RUN',
    label: 'Scoring Run',
    alert: FIGMA_SMART_ALERTS.RUN,
    desc: 'Activates only when a team scores more than 4 unanswered points, capturing authentic momentum swings.',
  },
  {
    key: 'LEAD_CHANGE',
    label: 'Lead Change',
    alert: FIGMA_SMART_ALERTS.LEAD_CHANGE,
    desc: 'Alerts when the lead changes hands during high-leverage second-half play.',
  },
  {
    key: 'CLUTCH',
    label: 'Clutch Mode',
    alert: FIGMA_SMART_ALERTS.CLUTCH,
    desc: 'Engages in Q4 or OT inside 5:00 minutes when the score differential is within 5 points.',
  },
  {
    key: 'OVERTIME',
    label: 'Overtime',
    alert: FIGMA_SMART_ALERTS.OVERTIME,
    desc: 'Alerts immediately when regulation ends deadlocked, signaling free bonus basketball.',
  },
  {
    key: 'FINAL',
    label: 'Final',
    alert: FIGMA_SMART_ALERTS.FINAL,
    desc: 'Displays the final score and victor styled in the winning franchise’s signature gradient wash.',
  },
];

interface SimEvent {
  simTime: number;
  play: PlayEvent;
  progress: number;
  diff: number;
  maxeyPts: number;
  brunsonPts: number;
}

const HISTORICAL_PLAYS: PlayEvent[] = [
  {
    id: 'sim-p0a',
    quarter: 3,
    clock: '5:48',
    teamAbbr: 'PHI',
    description: 'Maxey 14-ft pull-up jumper',
    isScoringPlay: true,
  },
  {
    id: 'sim-p0b',
    quarter: 3,
    clock: '6:22',
    teamAbbr: 'NYK',
    description: 'Towns hook shot in paint',
    isScoringPlay: true,
  },
  {
    id: 'sim-p0c',
    quarter: 3,
    clock: '7:10',
    teamAbbr: 'PHI',
    description: 'Embiid face-up mid-range',
    isScoringPlay: true,
  },
];

const SIM_EVENTS: SimEvent[] = [
  {
    simTime: 15,
    progress: 0.61,
    diff: 5.0,
    play: {
      id: 'sim-p1',
      quarter: 3,
      clock: '5:30',
      teamAbbr: 'PHI',
      description: 'Maxey 16-ft pull-up jumper',
      isScoringPlay: true,
    },
    maxeyPts: 24,
    brunsonPts: 19,
  },
  {
    simTime: 22,
    progress: 0.66,
    diff: 8.0,
    play: {
      id: 'sim-p2',
      quarter: 3,
      clock: '4:25',
      teamAbbr: 'PHI',
      description: 'Maxey pull-up 3-pointer',
      isScoringPlay: true,
    },
    maxeyPts: 27,
    brunsonPts: 19,
  },
  {
    simTime: 28,
    progress: 0.70,
    diff: 11.0,
    play: {
      id: 'sim-p3',
      quarter: 3,
      clock: '3:45',
      teamAbbr: 'PHI',
      description: 'Embiid steal, fast-break dunk',
      isScoringPlay: true,
    },
    maxeyPts: 27,
    brunsonPts: 19,
  },
  {
    simTime: 35,
    progress: 0.78,
    diff: 4.0,
    play: {
      id: 'sim-p4',
      quarter: 4,
      clock: '5:45',
      teamAbbr: 'NYK',
      description: 'Brunson step-back 3-pointer',
      isScoringPlay: true,
    },
    maxeyPts: 27,
    brunsonPts: 25,
  },
  {
    simTime: 42,
    progress: 0.84,
    diff: 2.0,
    play: {
      id: 'sim-p5',
      quarter: 4,
      clock: '3:15',
      teamAbbr: 'NYK',
      description: 'Towns baseline power slam',
      isScoringPlay: true,
    },
    maxeyPts: 27,
    brunsonPts: 25,
  },
  {
    simTime: 49,
    progress: 0.90,
    diff: -1.0,
    play: {
      id: 'sim-p6',
      quarter: 4,
      clock: '1:30',
      teamAbbr: 'NYK',
      description: 'Brunson driving floater off glass',
      isScoringPlay: true,
    },
    maxeyPts: 27,
    brunsonPts: 28, // Brunson takes scoring lead!
  },
  {
    simTime: 52,
    progress: 0.94,
    diff: 0.0,
    play: {
      id: 'sim-p7',
      quarter: 4,
      clock: '0:02',
      teamAbbr: 'NYK',
      description: 'Brunson buzzer bank shot',
      isScoringPlay: true,
    },
    maxeyPts: 29,
    brunsonPts: 31, // Brunson leads 31-29!
  },
  {
    simTime: 62,
    progress: 0.98,
    diff: 3.0,
    play: {
      id: 'sim-p8',
      quarter: 5,
      clock: '1:12',
      teamAbbr: 'PHI',
      description: 'Embiid turnaround fadeaway jumper',
      isScoringPlay: true,
    },
    maxeyPts: 33, // Maxey retakes scoring lead!
    brunsonPts: 31,
  },
  {
    simTime: 68,
    progress: 1.00,
    diff: 5.0,
    play: {
      id: 'sim-p9',
      quarter: 5,
      clock: '0:06',
      teamAbbr: 'PHI',
      description: 'Maxey iced free throws (2/2)',
      isScoringPlay: true,
    },
    maxeyPts: 36, // Maxey finishes with 36 PTS!
    brunsonPts: 31,
  },
];

const BASE_POINTS: ScorePoint[] = [
  { progress: 0.0, diff: 0.0 },     // Tip-off (0-0 even on midline)
  { progress: 0.08, diff: -3.0 },    // NYK early 3pt lead (-3, dips under)
  { progress: 0.16, diff: -6.0 },    // NYK up 6 (-6, under)
  { progress: 0.25, diff: -2.0 },    // End of Q1: PHI cuts lead to 2 (-2, under)
  { progress: 0.35, diff: 0.0 },     // Q2: PHI ties it up (0.0, on midline)
  { progress: 0.44, diff: 3.0 },     // Q2: PHI takes 3pt lead (+3, above)
  { progress: 0.50, diff: 5.0 },     // Halftime: PHI up 5 (+5, above)
  { progress: 0.56, diff: 3.0 },     // Q3 start: PHI up 3 (+3, above)
];

const REGULATION_EVENTS = SIM_EVENTS.filter((e) => e.simTime < 55);

// Pre-compute regulation score histories (Q1..Q4)
const CACHED_REGULATION_HISTORIES: ScorePoint[][] = [
  BASE_POINTS,
  ...REGULATION_EVENTS.map((_, idx) => [
    ...BASE_POINTS,
    ...REGULATION_EVENTS.slice(0, idx + 1).map((e) => ({ progress: e.progress, diff: e.diff })),
  ]),
];

// Pre-compute Overtime score histories: graph resets to OT baseline at midline (0-0), then tracks OT scoring
const CACHED_OT_HISTORIES: ScorePoint[][] = [
  // OT Start: 5:00 on clock, 0-0 even on midline
  [
    { progress: 0.0, diff: 0.0 },
    { progress: 0.05, diff: 0.0 },
  ],
  // OT Mid: Embiid turnaround fadeaway at 1:12 (+3.0 lead)
  [
    { progress: 0.0, diff: 0.0 },
    { progress: 0.72, diff: 3.0 },
  ],
  // OT Final: Maxey iced free throws at 0:06 (111-106 final)
  [
    { progress: 0.0, diff: 0.0 },
    { progress: 0.72, diff: 3.0 },
    { progress: 1.00, diff: 5.0 },
  ],
];

// Pre-compute lastPlays for each event index 0..9
const CACHED_LAST_PLAYS: PlayEvent[][] = [
  HISTORICAL_PLAYS.slice(0, 3),
  ...SIM_EVENTS.map((_, idx) => {
    const active = SIM_EVENTS.slice(0, idx + 1);
    const recent = active.map((e) => e.play).reverse();
    return [...recent, ...HISTORICAL_PLAYS].slice(0, 3);
  }),
];

// Pre-compute leaders for each event index 0..9
const CACHED_LEADERS: PlayerLeader[][] = [
  [
    { name: 'Tyrese Maxey', jersey: '0', teamAbbr: 'PHI', pts: 22, reb: 5, ast: 4 },
    { name: 'Jalen Brunson', jersey: '11', teamAbbr: 'NYK', pts: 19, reb: 3, ast: 5 },
  ],
  ...SIM_EVENTS.map((event, idx) => {
    const t = event.simTime;
    const maxeyPts = event.maxeyPts;
    const brunsonPts = event.brunsonPts;
    const maxeyLeader: PlayerLeader = {
      name: 'Tyrese Maxey',
      jersey: '0',
      teamAbbr: 'PHI',
      pts: maxeyPts,
      reb: t >= 68 ? 11 : t >= 52 ? 9 : t >= 28 ? 7 : 5,
      ast: t >= 68 ? 6 : t >= 28 ? 5 : 4,
    };
    const brunsonLeader: PlayerLeader = {
      name: 'Jalen Brunson',
      jersey: '11',
      teamAbbr: 'NYK',
      pts: brunsonPts,
      reb: t >= 49 ? 4 : 3,
      ast: t >= 62 ? 8 : t >= 49 ? 7 : t >= 35 ? 6 : 5,
    };
    return brunsonPts > maxeyPts ? [brunsonLeader, maxeyLeader] : [maxeyLeader, brunsonLeader];
  }),
];

function getSimEventIndex(t: number): number {
  let count = 0;
  for (let i = 0; i < SIM_EVENTS.length; i++) {
    if (SIM_EVENTS[i].simTime <= t) {
      count = i + 1;
    } else {
      break;
    }
  }
  return count;
}

function computeSimScoreHistory(t: number): ScorePoint[] {
  // When in Overtime (t >= 55), the regulation chart resets to the OT period with 'OT' label!
  if (t >= 55) {
    if (t >= 68) {
      return CACHED_OT_HISTORIES[2];
    } else if (t >= 62) {
      return CACHED_OT_HISTORIES[1];
    } else {
      return CACHED_OT_HISTORIES[0];
    }
  }

  // Regulation (t < 55): Q1..Q4
  const k = Math.min(REGULATION_EVENTS.length, getSimEventIndex(t));
  return CACHED_REGULATION_HISTORIES[k];
}

function getSimLastPlays(t: number): PlayEvent[] {
  const k = getSimEventIndex(t);
  return CACHED_LAST_PLAYS[k];
}

function getSimLeaders(t: number): PlayerLeader[] {
  const k = getSimEventIndex(t);
  return CACHED_LEADERS[k];
}

interface SimClockAnchor {
  simTime: number;
  baseClockSecs: number;
}

// Exact game clock anchors matching actual play-by-play events
// At 1x speed, clock counts down at exactly 1 game second per real second!
const SIM_CLOCK_ANCHORS: SimClockAnchor[] = [
  { simTime: 0, baseClockSecs: 348 },   // Q3 5:48 (348s)
  { simTime: 15, baseClockSecs: 330 },  // Q3 5:30 (330s)
  { simTime: 22, baseClockSecs: 265 },  // Q3 4:25 (265s)
  { simTime: 28, baseClockSecs: 225 },  // Q3 3:45 (225s)
  { simTime: 35, baseClockSecs: 345 },  // Q4 5:45 (345s)
  { simTime: 42, baseClockSecs: 195 },  // Q4 3:15 (195s)
  { simTime: 49, baseClockSecs: 90 },   // Q4 1:30 (90s)
  { simTime: 52, baseClockSecs: 2 },    // Q4 0:02 (2s)
  { simTime: 55, baseClockSecs: 80 },   // OT 1:20 (80s)
  { simTime: 62, baseClockSecs: 72 },   // OT 1:12 (72s)
  { simTime: 68, baseClockSecs: 6 },    // OT 0:06 (6s)
];

function getSimClockStr(t: number): string {
  let anchor = SIM_CLOCK_ANCHORS[0];
  for (let i = 0; i < SIM_CLOCK_ANCHORS.length; i++) {
    if (SIM_CLOCK_ANCHORS[i].simTime <= t) {
      anchor = SIM_CLOCK_ANCHORS[i];
    } else {
      break;
    }
  }
  const elapsed = t - anchor.simTime;
  const currentSecs = Math.max(0, Math.floor(anchor.baseClockSecs - elapsed));
  const mins = Math.floor(currentSecs / 60);
  const secs = String(currentSecs % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function computeRawSimSnapshot(clamped: number) {
  const liveClock = getSimClockStr(clamped);

  // Phase 1: 0 to 15s -> Early Regulation (Calm, Noise Filtered)
  if (clamped < 15) {
    const progress = clamped / 15;
    return {
      quarter: 3,
      clock: liveClock,
      awayScore: 70,
      homeScore: 67,
      possession: 'home' as const,
      phase: 'LIVE' as const,
      activeRunText: undefined,
      activeRunTeam: undefined,
      runPoints: 0,
      clutchNote: undefined,
      lastPlayShort: clamped < 8 ? 'NYK non-shooting foul' : 'Brunson mid-range miss',
      momentumValue: -8,
      engineState: 'REGULATION (CALM)',
      engineStateColor: { bg: '#f4f4f5', text: 'rgba(0,0,0,0.5)', border: '#e4e4e7' },
      engineRule: 'Noise Filtering: Suppress routine non-shooting fouls and dead-ball whistles',
      engineExplanation: 'Game in natural flow. Routine fouls and timeouts are silenced to preserve your deep focus.',
      activeAlert: null,
      filteredWhistles: Math.floor(8 + progress * 4),
      milestoneIndex: 0,
    };
  }

  // Phase 2: 15s to 35s -> The 8-0 Scoring Run (> 4 pts Threshold)
  if (clamped < 35) {
    if (clamped < 22) {
      return {
        quarter: 3,
        clock: liveClock,
        awayScore: 72,
        homeScore: 67,
        possession: 'away' as const,
        phase: 'LIVE' as const,
        activeRunText: undefined,
        activeRunTeam: 'PHI',
        runPoints: 2,
        clutchNote: undefined,
        lastPlayShort: 'Maxey pull-up jumper (2 pts)',
        momentumValue: -18,
        engineState: 'RUN FORMING (2-0, BELOW THRESHOLD)',
        engineStateColor: { bg: '#f4f4f5', text: '#52525b', border: '#e4e4e7' },
        engineRule: 'Scoring Run Threshold: Requires > 4 unanswered points to trigger alert',
        engineExplanation: 'Maxey hits pull-up 2. PHI leads 2-0 run, but it is below threshold (> 4 pts). Keeping the card silent.',
        activeAlert: null,
        filteredWhistles: 12,
        milestoneIndex: 1,
      };
    } else if (clamped < 28) {
      return {
        quarter: 3,
        clock: liveClock,
        awayScore: 75,
        homeScore: 67,
        possession: 'away' as const,
        phase: 'LIVE' as const,
        activeRunText: 'PHI 5-0 run',
        activeRunTeam: 'PHI',
        runPoints: 5,
        clutchNote: undefined,
        lastPlayShort: 'Maxey pull-up 3-pointer',
        momentumValue: -28,
        engineState: '🚀 SCORING RUN ACTIVATED (5-0)',
        engineStateColor: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
        engineRule: 'Scoring Run Threshold Crossed (> 4 unanswered points met)',
        engineExplanation: 'Maxey sinks pull-up 3! 5-0 unanswered run crosses threshold. Active run badge surfaces with team gradient.',
        activeAlert: FIGMA_SMART_ALERTS.RUN,
        filteredWhistles: 13,
        milestoneIndex: 1,
      };
    } else {
      return {
        quarter: 3,
        clock: liveClock,
        awayScore: 78,
        homeScore: 67,
        possession: 'away' as const,
        phase: 'LIVE' as const,
        activeRunText: 'PHI 8-0 run',
        activeRunTeam: 'PHI',
        runPoints: 8,
        clutchNote: undefined,
        lastPlayShort: 'Embiid steal, fast-break dunk',
        momentumValue: -40,
        engineState: '🚀 PHI 8-0 SCORING RUN ACTIVE',
        engineStateColor: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
        engineRule: 'Momentum Alert: 8-0 unanswered run in 1:18',
        engineExplanation: 'Embiid steal and breakaway dunk! Momentum shifts decisively toward Philadelphia. 8-0 run badge pinned.',
        activeAlert: FIGMA_SMART_ALERTS.RUN,
        filteredWhistles: 14,
        milestoneIndex: 1,
      };
    }
  }

  // Phase 3: 35s to 55s -> 4th Quarter Comeback & Clutch Time Trigger
  if (clamped < 55) {
    if (clamped < 42) {
      return {
        quarter: 4,
        clock: liveClock,
        awayScore: 96,
        homeScore: 92,
        possession: 'home' as const,
        phase: 'LIVE' as const,
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        clutchNote: undefined,
        lastPlayShort: 'Brunson step-back 3',
        momentumValue: -10,
        engineState: 'REGULATION (KNICKS RALLY)',
        engineStateColor: { bg: '#f4f4f5', text: '#52525b', border: '#e4e4e7' },
        engineRule: 'Clutch Condition Check: Requires Q4 ≤ 5:00 & margin ≤ 5 pts',
        engineExplanation: 'Knicks cut the lead to 4. Because clock is still above 5:00, Clutch Mode stays idle.',
        activeAlert: null,
        filteredWhistles: 16,
        milestoneIndex: 2,
      };
    } else if (clamped < 49) {
      return {
        quarter: 4,
        clock: liveClock,
        awayScore: 98,
        homeScore: 96,
        possession: 'away' as const,
        phase: 'CLUTCH' as const,
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        clutchNote: '3 lead changes in 2 min',
        lastPlayShort: 'Towns baseline power slam',
        momentumValue: 8,
        engineState: '⚡ CLUTCH TIME TRIGGERED',
        engineStateColor: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
        engineRule: 'Clutch Threshold Met: Q4 inside 5:00 & score differential ≤ 5 pts',
        engineExplanation: 'Threshold crossed! Clock under 5 minutes and margin is 2 points. Golden ambient glow and Clutch pill engaged.',
        activeAlert: FIGMA_SMART_ALERTS.CLUTCH,
        filteredWhistles: 18,
        milestoneIndex: 2,
      };
    } else {
      const isTied = clamped >= 52;
      return {
        quarter: 4,
        clock: liveClock,
        awayScore: isTied ? 104 : 100,
        homeScore: isTied ? 104 : 101,
        possession: isTied ? ('away' as const) : ('home' as const),
        phase: 'CLUTCH' as const,
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        clutchNote: isTied ? 'Tied 104-104 at buzzer' : '4 lead changes in 3 min',
        lastPlayShort: isTied ? 'Brunson tying floater at buzzer' : 'Brunson driving floater',
        momentumValue: isTied ? 0 : 22,
        engineState: isTied ? '⚡ CLUTCH TIME (DEADLOCKED)' : '⚡ CLUTCH TIME (LEAD CHANGE)',
        engineStateColor: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
        engineRule: isTied ? 'Regulation Ending Tied: Preparing Overtime Elevation' : 'Lead Change Detected: NYK takes lead in clutch window',
        engineExplanation: isTied
          ? 'Brunson floater off glass ties game 104-104 with 2 seconds left! Regulation expires deadlocked.'
          : 'Knicks take 101-100 lead with 2:10 left! High-leverage lead change detected in clutch window.',
        activeAlert: isTied ? null : FIGMA_SMART_ALERTS.LEAD_CHANGE,
        filteredWhistles: 20,
        milestoneIndex: 2,
      };
    }
  }

  // Phase 4: 55s to 68s -> Overtime Thriller Transition
  if (clamped < 68) {
    if (clamped < 62) {
      return {
        quarter: 5,
        clock: liveClock,
        awayScore: 104,
        homeScore: 104,
        possession: 'away' as const,
        phase: 'OVERTIME' as const,
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        clutchNote: 'Overtime Period',
        lastPlayShort: 'Overtime tip-off won by PHI',
        momentumValue: 0,
        engineState: '🔥 OVERTIME PERIOD COMMENCED',
        engineStateColor: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
        engineRule: 'Overtime Rule: Regulation ends in tie → Elevate phase to OVERTIME',
        engineExplanation: 'Regulation expired deadlocked at 104-104. Engine immediately elevates into bonus basketball with Overtime badge.',
        activeAlert: FIGMA_SMART_ALERTS.OVERTIME,
        filteredWhistles: 21,
        milestoneIndex: 3,
      };
    } else {
      return {
        quarter: 5,
        clock: liveClock,
        awayScore: 109,
        homeScore: 106,
        possession: 'away' as const,
        phase: 'OVERTIME' as const,
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        clutchNote: 'OT Final 90 seconds',
        lastPlayShort: 'Embiid turnaround fadeaway (2 pts)',
        momentumValue: -24,
        engineState: '🔥 OVERTIME THRILLER (CLUTCH DAGGER)',
        engineStateColor: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
        engineRule: 'High-Leverage Clutch Bucket in OT Period',
        engineExplanation: 'Embiid hits turnaround baseline jumper over Towns to put Sixers up 109-106 with 1:12 remaining.',
        activeAlert: null,
        filteredWhistles: 22,
        milestoneIndex: 3,
      };
    }
  }

  // Phase 5: 68s to 75s -> Final Buzzer & MVP Toast
  return {
    quarter: 5,
    clock: clamped >= 74 ? '0:00' : liveClock,
    awayScore: 111,
    homeScore: 106,
    possession: null,
    phase: 'FINAL' as const,
    activeRunText: undefined,
    activeRunTeam: undefined,
    runPoints: 0,
    clutchNote: undefined,
    lastPlayShort: 'Final Buzzer — PHI takes victory',
    momentumValue: -35,
    engineState: '🏆 FINAL & MVP PERFORMANCE ELEVATED',
    engineStateColor: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    engineRule: 'Game Concluded: Surface Final Alert',
    engineExplanation: 'Final buzzer sounds! Philadelphia wins 111-106. Engine generates the official victory alert with franchise gradient.',
    activeAlert: FIGMA_SMART_ALERTS.FINAL,
    filteredWhistles: 23,
    milestoneIndex: 4,
  };
}

function getSimSnapshot(t: number) {
  const clamped = Math.max(0, Math.min(75, t));
  const raw = computeRawSimSnapshot(clamped);
  return {
    ...raw,
    scoreHistory: computeSimScoreHistory(clamped),
    lastPlays: getSimLastPlays(clamped),
    leaders: getSimLeaders(clamped),
  };
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ onBackToIndex, onOpenPlayground }) => {
  // --- Hero Interactive Stage State ---
  const [heroGame, setHeroGame] = useState<NbaGame>(FIGMA_GAMES_LIVE[0]);
  const [heroExpanded, setHeroExpanded] = useState<boolean>(false);
  const [heroAlert, setHeroAlert] = useState<SmartAlert | null>(null);

  // Live 1-second countdown clock for the Hero stage game
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroGame((prev) => {
        const nextList = tickLiveGamesOneSecond([prev]);
        return nextList[0];
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Team Gradient Lab State ---
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<string>('PHI');
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<string>('NYK');

  // --- 3-State Morphing Explorer ---
  const [morphState, setMorphState] = useState<'pill' | 'compact' | 'expanded'>('pill');

  // --- Live Event & Notification Simulation State ---
  const [simTime, setSimTime] = useState<number>(0);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simExpanded, setSimExpanded] = useState<boolean>(false);

  // --- Onboarding Architecture State ---
  const [onboardingTab, setOnboardingTab] = useState<number>(0);
  const [onboardingFavTeam, setOnboardingFavTeam] = useState<string>('PHI');
  const [hubPinnedGameId, setHubPinnedGameId] = useState<string>('hub-phi-cle');
  const [onboardingPrefs, setOnboardingPrefs] = useState<NotificationPrefs>({
    bigMoments: true,
    tipOff: true,
    finalScore: true,
    everyBucket: false,
  });

  const ONBOARDING_STEPS = [
    {
      step: 0,
      label: '1. Welcome',
      badge: 'Frame 2 (389×214px)',
      desc: "Introductory card establishing CherryPick's philosophy: quiet when you need focus, noticeable when it counts.",
    },
    {
      step: 1,
      label: '2. Select Team',
      badge: 'Frame 48 (394×544px)',
      desc: 'All 30 NBA franchises with real-time fuzzy search, instant filter, and signature team gradient badges.',
    },
    {
      step: 2,
      label: '3. Alert Filter',
      badge: 'Frame 49 (394×490px)',
      desc: 'Smart notification thresholds for scoring runs (>4 pts), clutch mode, overtime thriller, and game endings.',
    },
    {
      step: 3,
      label: '4. Ready to Play',
      badge: 'Frame 50 (389×352px)',
      desc: 'Matchup preview confirming selected franchise and preferences before launching your multitasking companion.',
    },
    {
      step: 4,
      label: '5. Central Hub',
      badge: 'Frame 36 (394×652px)',
      desc: 'The central hub for upcoming and active games: live scores, featured hero matchup, and tomorrow’s schedule.',
    },
  ];

  // --- Slow Auto-Advancing Callout Showcase State ---
  const [calloutIndex, setCalloutIndex] = useState<number>(0);
  const [isCalloutAutoPlay, setIsCalloutAutoPlay] = useState<boolean>(true);

  useEffect(() => {
    if (!isCalloutAutoPlay) return;
    const interval = setInterval(() => {
      setCalloutIndex((prev) => (prev + 1) % CALLOUT_ITEMS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isCalloutAutoPlay]);

  useEffect(() => {
    if (!isSimPlaying) return;
    const interval = setInterval(() => {
      setSimTime((prev) => {
        if (prev >= 75) {
          return 75;
        }
        return Math.min(75, Number((prev + 0.1 * simSpeed).toFixed(1)));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSimPlaying, simSpeed]);

  const simSnapshot = getSimSnapshot(simTime);

  const applyPreset = (
    preset: 'normal' | 'run' | 'clutch' | 'final' | 'freethrows' | 'throwin' | 'timeout'
  ) => {
    if (preset === 'normal') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'LIVE',
        quarter: 3,
        clock: '4:12',
        awayScore: 78,
        homeScore: 67,
        isClockRunning: true,
        stoppageReason: null,
        stoppageDetail: undefined,
        isTimeout: false,
        possession: 'away',
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        momentumValue: 0,
        scoreHistory: FIGMA_SCORE_HISTORY_Q3,
        lastPlayShort: undefined,
      });
      setHeroAlert(null);
    } else if (preset === 'run') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'LIVE',
        quarter: 3,
        clock: '4:12',
        awayScore: 78,
        homeScore: 67,
        isClockRunning: true,
        stoppageReason: null,
        stoppageDetail: undefined,
        isTimeout: false,
        possession: 'away',
        activeRunText: 'PHI 8-0 run',
        activeRunTeam: 'PHI',
        runPoints: 8,
        momentumValue: -28,
        scoreHistory: FIGMA_SCORE_HISTORY_Q3,
        lastPlayShort: 'Maxey pull-up three',
      });
      setHeroAlert(null);
    } else if (preset === 'freethrows') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'LIVE',
        quarter: 3,
        clock: '3:45',
        awayScore: 81,
        homeScore: 68,
        isClockRunning: false,
        stoppageReason: 'Free Throws',
        stoppageDetail: 'Free Throw (1 of 2)',
        isTimeout: false,
        possession: 'home',
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        momentumValue: -20,
        scoreHistory: FIGMA_SCORE_HISTORY_Q3,
        lastPlayShort: 'Brunson shooting foul (2 FTs)',
        lastPlays: [
          {
            id: 'ft1',
            clock: '3:45',
            quarter: 3,
            teamAbbr: 'NYK',
            description: 'Brunson fouled by Maxey on driving layup (2 FTs)',
            isScoringPlay: false,
            pointsScored: 0,
          },
          ...FIGMA_GAMES_LIVE[0].lastPlays,
        ],
      });
      setHeroAlert(null);
    } else if (preset === 'throwin') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'LIVE',
        quarter: 3,
        clock: '3:20',
        awayScore: 81,
        homeScore: 69,
        isClockRunning: false,
        stoppageReason: 'Throw-in',
        stoppageDetail: 'Throw-in',
        isTimeout: false,
        possession: 'away',
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        momentumValue: -18,
        scoreHistory: FIGMA_SCORE_HISTORY_Q3,
        lastPlayShort: 'Deflected out of bounds by NYK',
        lastPlays: [
          {
            id: 'th1',
            clock: '3:20',
            quarter: 3,
            teamAbbr: 'NYK',
            description: 'Brunson lost ball deflected out of bounds',
            isScoringPlay: false,
            pointsScored: 0,
          },
          ...FIGMA_GAMES_LIVE[0].lastPlays,
        ],
      });
      setHeroAlert(null);
    } else if (preset === 'timeout') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'LIVE',
        quarter: 3,
        clock: '2:55',
        awayScore: 84,
        homeScore: 69,
        isTimeout: true,
        isClockRunning: false,
        stoppageReason: 'Timeout',
        stoppageDetail: 'Timeout',
        possession: 'home',
        activeRunText: 'PHI 11-2 run',
        activeRunTeam: 'PHI',
        runPoints: 11,
        momentumValue: -34,
        scoreHistory: FIGMA_SCORE_HISTORY_Q3,
        lastPlayShort: 'NYK Full Timeout',
        lastPlays: [
          {
            id: 'to1',
            clock: '2:55',
            quarter: 3,
            teamAbbr: 'NYK',
            description: 'Knicks 60-second full timeout',
            isScoringPlay: false,
            pointsScored: 0,
          },
          ...FIGMA_GAMES_LIVE[0].lastPlays,
        ],
      });
      setHeroAlert(null);
    } else if (preset === 'clutch') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'CLUTCH',
        quarter: 4,
        clock: '1:48',
        awayScore: 101,
        homeScore: 99,
        isClockRunning: true,
        stoppageReason: null,
        stoppageDetail: undefined,
        isTimeout: false,
        possession: 'home',
        activeRunText: undefined,
        activeRunTeam: undefined,
        runPoints: 0,
        clutchNote: '3 lead changes in 2 min',
        momentumValue: -15,
        scoreHistory: FIGMA_SCORE_HISTORY_CLUTCH,
        lastPlayShort: undefined,
      });
      setHeroAlert(null);
    } else if (preset === 'final') {
      setHeroGame({
        ...FIGMA_GAMES_LIVE[0],
        phase: 'FINAL',
        quarter: 4,
        clock: 'FINAL',
        awayScore: 112,
        homeScore: 109,
        isClockRunning: false,
        stoppageReason: null,
        stoppageDetail: undefined,
        isTimeout: false,
        possession: null,
        activeRunText: undefined,
        activeRunTeam: undefined,
        clutchNote: undefined,
        momentumValue: 0,
        scoreHistory: FIGMA_SCORE_HISTORY_FINAL,
        mvp: {
          name: 'Tyrese Maxey',
          jersey: '0',
          teamAbbr: 'PHI',
          pts: 36,
          reb: 11,
          ast: 6,
        },
        leaders: [
          {
            name: 'Tyrese Maxey',
            jersey: '0',
            teamAbbr: 'PHI',
            pts: 36,
            reb: 11,
            ast: 6,
          },
          {
            name: 'Jalen Brunson',
            jersey: '11',
            teamAbbr: 'NYK',
            pts: 28,
            reb: 4,
            ast: 7,
          },
        ],
      });
      setHeroAlert(null);
    }
  };

  const featuredTeams = [
    { abbr: 'PHI', name: '76ers', hex: '#EB1616', label: 'Crimson & Cobalt' },
    { abbr: 'NYK', name: 'Knicks', hex: '#F66409', label: 'MSG Blue & Blaze' },
    { abbr: 'LAL', name: 'Lakers', hex: '#EBDA16', label: 'Forum Gold & Purple' },
    { abbr: 'GSW', name: 'Warriors', hex: '#1E14EA', label: 'Royal & Sun Gold' },
    { abbr: 'BOS', name: 'Celtics', hex: '#008348', label: 'Clover & Gold' },
    { abbr: 'MIA', name: 'Heat', hex: '#98002E', label: 'Crimson & Amber' },
    { abbr: 'CHI', name: 'Bulls', hex: '#CE1141', label: 'Matador Red & Black' },
    { abbr: 'DEN', name: 'Nuggets', hex: '#FEC524', label: 'Mile High Navy & Gold' },
  ];

  const awayInfo = getTeamInfo(selectedAwayTeam);
  const homeInfo = getTeamInfo(selectedHomeTeam);
  const awayStars = getTeamStars(selectedAwayTeam);
  const homeStars = getTeamStars(selectedHomeTeam);

  const currentLabGame: NbaGame = {
    ...FIGMA_GAMES_LIVE[0],
    id: `lab-${selectedAwayTeam}-${selectedHomeTeam}`,
    awayTeam: selectedAwayTeam,
    homeTeam: selectedHomeTeam,
    awayScore: 89,
    homeScore: 86,
    activeRunTeam: selectedAwayTeam,
    activeRunText: `${selectedAwayTeam} 7-0 run`,
    momentumValue: -24,
    lastPlays: [
      {
        id: `lp-${selectedAwayTeam}-1`,
        quarter: 3,
        clock: '4:12',
        teamAbbr: selectedAwayTeam,
        description: awayStars[0].scoringPlay,
        isScoringPlay: true,
      },
      {
        id: `lp-${selectedHomeTeam}-2`,
        quarter: 3,
        clock: '4:35',
        teamAbbr: selectedHomeTeam,
        description: homeStars[0].scoringPlay,
        isScoringPlay: true,
      },
      {
        id: `lp-${selectedAwayTeam}-3`,
        quarter: 3,
        clock: '5:01',
        teamAbbr: selectedAwayTeam,
        description: awayStars[1].altPlay,
        isScoringPlay: false,
      },
    ],
    leaders: [
      {
        name: awayStars[0].name,
        jersey: awayStars[0].jersey,
        teamAbbr: selectedAwayTeam,
        pts: awayStars[0].pts,
        reb: awayStars[0].reb,
        ast: awayStars[0].ast,
      },
      {
        name: homeStars[0].name,
        jersey: homeStars[0].jersey,
        teamAbbr: selectedHomeTeam,
        pts: homeStars[0].pts,
        reb: homeStars[0].reb,
        ast: homeStars[0].ast,
      },
    ],
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Minimal Editorial Breadcrumb */}
        <aside style={styles.aside}>
          <div style={styles.asideRow}>
            <button
              onClick={onBackToIndex}
              style={styles.backIndexBtn}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 4L1.5 8M1.5 8L5.5 12M1.5 8H10C11.3807 8 12.5 6.88071 12.5 5.5V5.5C12.5 4.11929 11.3807 3 10 3H8.5" stroke="currentColor"/>
              </svg>
              Index
            </button>
          </div>
        </aside>

        {/* Article Header */}
        <header style={styles.header}>
          <h1 style={styles.articleTitle}>CherryPick</h1>
          <time style={styles.articleTime}>2 November, 2026</time>
          <p style={styles.leadParagraph}>
            CherryPick is a live NBA multitasking companion for Chrome. A floating widget, event detection, momentum tracking, and zero tabs to switch. Injected cleanly into your active page.
          </p>
        </header>

        {/* Hero Interactive Component Stage */}
        <section style={styles.heroStageSection}>
          <div style={styles.heroCardContainer}>
            <div style={styles.hintText}>
              Click card to {heroExpanded ? 'collapse' : 'expand'}
            </div>
            <FloatingGameCard
              game={heroGame}
              expanded={heroExpanded}
              onToggleExpand={() => setHeroExpanded(!heroExpanded)}
            />
          </div>

          {/* Canvas Interactive Controls Bar */}
          <div style={styles.canvasControlsBar}>
            <div style={styles.controlGroup}>
              <span style={styles.controlLabel}>Game Presets:</span>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.phase === 'LIVE' && !heroGame.activeRunText ? 'active' : ''
                }`}
                onClick={() => applyPreset('normal')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.phase === 'LIVE' && !heroGame.activeRunText ? styles.btnGhostActive : {}),
                }}
              >
                Q3 Normal
              </button>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.activeRunText === 'PHI 8-0 run' ? 'active' : ''
                }`}
                onClick={() => applyPreset('run')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.activeRunText === 'PHI 8-0 run' ? styles.btnGhostActive : {}),
                }}
              >
                Run
              </button>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.phase === 'CLUTCH' ? 'active' : ''
                }`}
                onClick={() => applyPreset('clutch')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.phase === 'CLUTCH' ? styles.btnGhostActive : {}),
                }}
              >
                Clutch
              </button>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.stoppageReason === 'Free Throws' ? 'active' : ''
                }`}
                onClick={() => applyPreset('freethrows')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.stoppageReason === 'Free Throws' ? styles.btnGhostActive : {}),
                }}
              >
                Free Throws
              </button>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.stoppageReason === 'Throw-in' ? 'active' : ''
                }`}
                onClick={() => applyPreset('throwin')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.stoppageReason === 'Throw-in' ? styles.btnGhostActive : {}),
                }}
              >
                Throw-in
              </button>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.isTimeout ? 'active' : ''
                }`}
                onClick={() => applyPreset('timeout')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.isTimeout ? styles.btnGhostActive : {}),
                }}
              >
                Timeout
              </button>
              <button
                className={`cp-text-selector-btn ${
                  heroGame.phase === 'FINAL' ? 'active' : ''
                }`}
                onClick={() => applyPreset('final')}
                style={{
                  ...styles.btnGhost,
                  ...(heroGame.phase === 'FINAL' ? styles.btnGhostActive : {}),
                }}
              >
                Final
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: The Why */}
        <section style={styles.articleSection}>
          <h2 style={styles.sectionTitle}>The Attention Deficit of Sports Multitasking</h2>
          <p style={styles.prose}>
            During the NBA season, thousands of games happen simultaneously while people are designing,
            reading articles, or streaming movies. The way we consume live scores conflicts with focus:
          </p>

          <p style={styles.prose}>
            <strong>1. The Second Tab:</strong> Alt-tabbing to ESPN or Twitter ruins your flow. Studies show that even a 3-second context interruption takes several minutes of recovery time.
          </p>

          <p style={styles.prose}>
            <strong>2. Split-Screen Picture-in-Picture:</strong> Snapping a broadcast to half your screen robs you of workspace, and continuous video and content pulls your attention away from deep work.
          </p>

          <p style={styles.prose}>
            I didn’t want another dashboard. I wanted slight peripheral awareness. An interactive and adaptive object that sits in the corner of whatever you’re doing, whispering the score when it’s calm, and loud only when needed.
          </p>
        </section>

        {/* Section 2: The Figma UI Direction */}
        <section style={styles.articleSection}>
          <h2 style={styles.sectionTitle}>Figma Direction: Expressing Teams Through Gradients</h2>
          <p style={styles.prose}>
            When I designed CherryPick in Figma, one core idea and design choice drove the visual language: try to get away from using team logos. Logos can be asymmetrical and clash with interfaces and other team logos. They create tension. Instead, In the age of gradients being a very trendy design choice, I wanted to practice how these gradients can express an entire franchise’s identity.
          </p>

          {/* Interactive Team Palette Explorer */}
          <div style={styles.demoBox}>
            <div style={styles.demoBoxHeader}>
              <span style={styles.demoBoxTitle}>Interactive Palette Explorer</span>
              <span style={styles.demoBoxSub}>
                Change Team 1 and Team 2 to watch the franchise gradients, area chart lobes, and momentum bar mix and match:
              </span>
            </div>

            {/* Team 1 Selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.4)', marginBottom: 8 }}>
                Team 1
              </div>
              <div style={styles.teamPaletteGrid}>
                {featuredTeams.map((t) => {
                  const isSelected = selectedAwayTeam === t.abbr;
                  const team = NBA_TEAMS[t.abbr];
                  return (
                    <button
                      key={`away-${t.abbr}`}
                      onClick={() => setSelectedAwayTeam(t.abbr)}
                      style={{
                        ...styles.teamSelectBtn,
                        borderColor: isSelected ? '#111111' : '#e4e4e7',
                        background: '#ffffff',
                        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: isSelected ? '0 6px 16px rgba(0, 0, 0, 0.08)' : 'none',
                      }}
                    >
                      <div style={{ ...styles.colorPip, background: team.gradient }} />
                      <div style={styles.teamSelectMeta}>
                        <span
                          style={{
                            ...styles.teamSelectAbbr,
                            color: isSelected ? '#111111' : 'rgba(0, 0, 0, 0.4)',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {t.abbr}
                        </span>
                        <span
                          style={{
                            ...styles.teamSelectName,
                            color: isSelected ? '#111111' : 'rgba(0, 0, 0, 0.4)',
                          }}
                        >
                          {t.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team 2 Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.4)', marginBottom: 8 }}>
                Team 2
              </div>
              <div style={styles.teamPaletteGrid}>
                {featuredTeams.map((t) => {
                  const isSelected = selectedHomeTeam === t.abbr;
                  const team = NBA_TEAMS[t.abbr];
                  return (
                    <button
                      key={`home-${t.abbr}`}
                      onClick={() => setSelectedHomeTeam(t.abbr)}
                      style={{
                        ...styles.teamSelectBtn,
                        borderColor: isSelected ? '#111111' : '#e4e4e7',
                        background: '#ffffff',
                        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: isSelected ? '0 6px 16px rgba(0, 0, 0, 0.08)' : 'none',
                      }}
                    >
                      <div style={{ ...styles.colorPip, background: team.gradient }} />
                      <div style={styles.teamSelectMeta}>
                        <span
                          style={{
                            ...styles.teamSelectAbbr,
                            color: isSelected ? '#111111' : 'rgba(0, 0, 0, 0.4)',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {t.abbr}
                        </span>
                        <span
                          style={{
                            ...styles.teamSelectName,
                            color: isSelected ? '#111111' : 'rgba(0, 0, 0, 0.4)',
                          }}
                        >
                          {t.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Component Preview nested inside white card */}
            <div style={styles.liveComponentStage}>
              <div style={styles.stageLabel}>
                {awayInfo.name} ({selectedAwayTeam}) vs. {homeInfo.name} ({selectedHomeTeam})
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <FloatingGameCard
                  game={currentLabGame}
                  expanded={true}
                  onToggleExpand={() => {}}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: The 3 Morphing States */}
        <section style={styles.articleSection}>
          <h2 style={styles.sectionTitle}>3 Morphing States</h2>
          <p style={styles.prose}>
            The second design principle I designed in Figma was that fixed window sizes can be distracting if not adaptable. When you're deeply concentrating on a task, even a 394px card takes too much attention. CherryPick morphs between three distinct states to your liking.
          </p>

          <div style={styles.demoBox}>
            <div style={styles.morphNavRow}>
              <button
                className={`cp-text-selector-btn ${morphState === 'pill' ? 'active' : ''}`}
                onClick={() => setMorphState('pill')}
                style={{
                  ...styles.morphNavBtn,
                  ...(morphState === 'pill' ? styles.morphNavBtnActive : {}),
                }}
              >
                Numbers
              </button>
              <button
                className={`cp-text-selector-btn ${morphState === 'compact' ? 'active' : ''}`}
                onClick={() => setMorphState('compact')}
                style={{
                  ...styles.morphNavBtn,
                  ...(morphState === 'compact' ? styles.morphNavBtnActive : {}),
                }}
              >
                Compact
              </button>
              <button
                className={`cp-text-selector-btn ${morphState === 'expanded' ? 'active' : ''}`}
                onClick={() => setMorphState('expanded')}
                style={{
                  ...styles.morphNavBtn,
                  ...(morphState === 'expanded' ? styles.morphNavBtnActive : {}),
                }}
              >
                Expanded
              </button>
            </div>

            <div style={styles.morphDisplayArea}>
              {morphState === 'pill' && (
                <div style={styles.morphContentBlock}>
                  <p style={styles.morphCaption}>
                    Strips away everything except the essentials: a live dot, team color gradients, and scores. Height is just 28 pixels. It sits quietly at whatever place on your monitor you choose.
                  </p>
                  <div style={styles.pillShowcaseStage}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 16px',
                        background: '#0F1013',
                        borderRadius: 999,
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div className="cp-live-dot-outer">
                        <div className="cp-live-dot-inner" />
                      </div>
                      <div className="cp-row-center" style={{ gap: 6 }}>
                        <div
                          className="cp-team-square"
                          style={{ width: 14, height: 14, background: getTeamInfo('PHI').gradient }}
                        />
                        <span className="cp-text-white-14-semi" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          PHI 78
                        </span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>–</span>
                      <div className="cp-row-center" style={{ gap: 6 }}>
                        <div
                          className="cp-team-square"
                          style={{ width: 14, height: 14, background: getTeamInfo('NYK').gradient }}
                        />
                        <span className="cp-text-white-14-semi" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          67 NYK
                        </span>
                      </div>
                      <span style={{ color: '#E04F54', fontSize: 12, fontWeight: 700, marginLeft: 4 }}>
                        Q3 4:12
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {morphState === 'compact' && (
                <div style={styles.morphContentBlock}>
                  <p style={styles.morphCaption}>
                    For general watching while working. Gives you the score, possession indicator, active scoring run badge, and the momentum tug-of-war bar.
                  </p>
                  <div style={styles.cardShowcaseStage}>
                    <FloatingGameCard
                      game={heroGame}
                      expanded={false}
                      onToggleExpand={() => {}}
                    />
                  </div>
                </div>
              )}

              {morphState === 'expanded' && (
                <div style={styles.morphContentBlock}>
                  <p style={styles.morphCaption}>
                    Click anywhere on the compact card to unfold the full context: continuous lead change chart, leading performers, and the last 3 scoring possessions.
                  </p>
                  <div style={styles.cardShowcaseStage}>
                    <FloatingGameCard
                      game={heroGame}
                      expanded={true}
                      onToggleExpand={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: The Smart Notification & Event Detection Engine */}
        <section style={styles.articleSection}>
          <h2 style={styles.sectionTitle}>Smart Notifications & Event Detection</h2>
          <p style={styles.prose}>
            Sports apps love spamming notifications for every foul, routine whistle, and free throw. When you're trying to work or watch something else, that constant barrage breaks your concentration. CherryPick instead uses an event-detection engine that surfaces only genuine high-leverage moments: unanswered scoring runs, tight clutch finishes, overtime thrillers, and decisive highlight plays.
          </p>

          {/* The 6 Peripheral Callouts Box (placed directly under Smart Notifications & Event Detection) */}
          <div style={styles.demoBox}>
            {/* Minimal Text Navigation */}
            <div style={styles.simNavRow}>
              {CALLOUT_ITEMS.map((item, idx) => {
                const isActive = calloutIndex === idx;
                return (
                  <button
                    key={item.key}
                    className={`cp-text-selector-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setCalloutIndex(idx);
                      setIsCalloutAutoPlay(false);
                    }}
                    style={{
                      ...styles.simNavBtn,
                      ...(isActive ? styles.simNavBtnActive : {}),
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Auto-cycling Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.4)' }}>
                {isCalloutAutoPlay ? 'Auto-cycling callouts every 4s' : 'Paused on manual selection'}
              </span>
              <button
                onClick={() => setIsCalloutAutoPlay(!isCalloutAutoPlay)}
                style={styles.simTextActionBtn}
              >
                {isCalloutAutoPlay ? 'Pause Cycle' : 'Resume Cycle'}
              </button>
            </div>

            {/* Staged Toast Stage */}
            <div style={styles.simCenteredCardStage}>
              <div
                key={CALLOUT_ITEMS[calloutIndex].key}
                style={{
                  width: '100%',
                  maxWidth: 394,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <SmartAlertToast
                  alert={CALLOUT_ITEMS[calloutIndex].alert}
                  onDismiss={() => {}}
                />
                <p
                  style={{
                    fontSize: 14,
                    color: '#52525b',
                    lineHeight: 1.6,
                    textAlign: 'center',
                    marginTop: 18,
                    marginBottom: 0,
                    maxWidth: 380,
                  }}
                >
                  {CALLOUT_ITEMS[calloutIndex].desc}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Demo Box */}
          <div style={styles.demoBox}>
            {/* Minimal Nav Row (no bounding box, black when active, gray when inactive, simply: Regulation, Run, Clutch, Overtime, Final) */}
            <div style={styles.simNavRow}>
              {SIM_MILESTONES.map((m, idx) => {
                const isActive = simSnapshot.milestoneIndex === idx;
                return (
                  <button
                    key={m.label}
                    className={`cp-text-selector-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSimTime(m.time);
                      setIsSimPlaying(true);
                    }}
                    style={{
                      ...styles.simNavBtn,
                      ...(isActive ? styles.simNavBtnActive : {}),
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Playback Controls & Progress Bar (clean & borderless) */}
            <div style={styles.simPlaybackRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => {
                    if (simTime >= 75) {
                      setSimTime(0);
                      setIsSimPlaying(true);
                    } else {
                      setIsSimPlaying(!isSimPlaying);
                    }
                  }}
                  style={styles.simTextActionBtn}
                  title={isSimPlaying ? 'Pause' : 'Play'}
                >
                  {isSimPlaying ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      <span>{simTime >= 75 ? 'Replay' : 'Play'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSimTime(0);
                    setIsSimPlaying(true);
                  }}
                  style={styles.simTextActionBtn}
                  title="Restart"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>Restart</span>
                </button>

                <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                  {[1, 2, 3].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 13,
                        fontWeight: simSpeed === spd ? 600 : 400,
                        color: simSpeed === spd ? '#111111' : 'rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.simTimeDisplay}>
                <span>{Math.floor(simTime / 60)}:{String(Math.floor(simTime % 60)).padStart(2, '0')}</span>
                <span style={{ color: 'rgba(0,0,0,0.3)', margin: '0 4px' }}>/</span>
                <span style={{ color: 'rgba(0,0,0,0.4)' }}>1:15</span>
              </div>
            </div>

            {/* Scrubber Slider */}
            <div style={{ marginTop: 10, marginBottom: 28 }}>
              <input
                type="range"
                min={0}
                max={75}
                step={0.1}
                value={simTime}
                onChange={(e) => setSimTime(Number(e.target.value))}
                style={styles.simScrubber}
              />
            </div>

            {/* Centered Live Card Stage */}
            <div style={styles.simCenteredCardStage}>
              <FloatingGameCard
                game={{
                  ...FIGMA_GAMES_LIVE[0],
                  quarter: simSnapshot.quarter,
                  clock: simSnapshot.clock,
                  awayScore: simSnapshot.awayScore,
                  homeScore: simSnapshot.homeScore,
                  possession: simSnapshot.possession,
                  phase: simSnapshot.phase,
                  clutchNote: simSnapshot.clutchNote,
                  activeRunText: simSnapshot.activeRunText,
                  activeRunTeam: simSnapshot.activeRunTeam,
                  runPoints: simSnapshot.runPoints,
                  lastPlayShort: simSnapshot.lastPlayShort,
                  scoreHistory: simSnapshot.scoreHistory,
                  lastPlays: simSnapshot.lastPlays,
                  leaders: simSnapshot.leaders,
                }}
                expanded={simExpanded}
                onToggleExpand={() => setSimExpanded(!simExpanded)}
              />
              <div style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.4)', marginTop: 14, textAlign: 'center' }}>
                Click card to {simExpanded ? 'collapse' : 'expand into live lead chart, box score & plays'}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Onboarding & Preference Architecture */}
        <section style={styles.articleSection}>
          <h2 style={styles.sectionTitle}>Onboarding & Preference Architecture</h2>
          <p style={styles.prose}>
            During initial setup, CherryPick guides fans through four focused Figma-designed cards: introducing the floating multitasking companion, picking a franchise, tailoring smart alerts, and confirming their upcoming matchup, showcasing upcoming and active games.
          </p>

          <div style={styles.demoBox}>
            {/* Tab navigation */}
            <div style={styles.simNavRow}>
              {ONBOARDING_STEPS.map((item) => (
                <button
                  key={item.step}
                  className={`cp-text-selector-btn ${onboardingTab === item.step ? 'active' : ''}`}
                  onClick={() => setOnboardingTab(item.step)}
                  style={{
                    fontWeight: onboardingTab === item.step ? 600 : 400,
                    color: onboardingTab === item.step ? '#111111' : 'rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Centered Onboarding Stage / Central Hub */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', minHeight: 460, alignItems: 'center' }}>
              {onboardingTab === 4 ? (
                <PopupDashboard
                  games={FIGMA_CENTRAL_HUB_GAMES}
                  settings={{
                    favoriteTeam: onboardingFavTeam,
                    notifications: onboardingPrefs,
                    onboardingComplete: true,
                    onboardingStep: 3,
                    pinnedGameId: hubPinnedGameId,
                    overlayVisible: true,
                    overlayExpanded: false,
                    dataSourceMode: 'figma_demo',
                  }}
                  onSelectGame={(id) => setHubPinnedGameId(id)}
                  onOpenSettings={() => setOnboardingTab(1)}
                />
              ) : (
                <OnboardingFlow
                  key={onboardingFavTeam}
                  currentStep={onboardingTab}
                  favoriteTeam={onboardingFavTeam}
                  notifications={onboardingPrefs}
                  games={FIGMA_CENTRAL_HUB_GAMES}
                  onStepChange={(nextStep) => setOnboardingTab(nextStep)}
                  onComplete={(team, prefs) => {
                    setOnboardingFavTeam(team);
                    setOnboardingPrefs(prefs);
                    setOnboardingTab(4);
                  }}
                  onBack={() => {
                    setOnboardingTab((prev) => Math.max(0, prev - 1));
                  }}
                />
              )}
            </div>

            <div style={styles.morphCaption}>
              <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                {ONBOARDING_STEPS[onboardingTab].badge}
              </div>
              <div style={{ color: 'rgba(0, 0, 0, 0.55)' }}>
                {ONBOARDING_STEPS[onboardingTab].desc}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Seamless Multitasking */}
        <section style={styles.articleSection}>
          <h2 style={styles.sectionTitle}>Seamless Multitasking</h2>
          <p style={styles.prose}>
            This extension lives as a movable card on any tab that you open in Chrome, allowing for seamless multitasking.
          </p>
        </section>

        {/* Article Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerDivider} />
          <div style={styles.footerMeta}>
            <div>
              <strong>CherryPick</strong> by Logan O'Neill
            </div>
            <div style={{ color: '#71717a' }}>
              Built with React, TypeScript, and Figma design tokens.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Styles for pristine, blank white Benji-style editorial layout matching the homepage
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#18181b',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    padding: '72px 24px 96px',
    fontSize: 14,
  },
  container: {
    maxWidth: 620,
    margin: '0 auto',
  },
  aside: {
    marginBottom: 24,
  },
  asideRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIndexBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: 400,
    transition: 'color 0.15s ease',
  },
  header: {
    marginBottom: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: '#111111',
    margin: 0,
  },
  articleTime: {
    display: 'block',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 16,
    fontWeight: 400,
  },
  leadParagraph: {
    fontSize: 14,
    lineHeight: 1.65,
    color: '#27272a',
    margin: 0,
    fontWeight: 400,
  },
  heroStageSection: {
    margin: '36px 0',
  },
  heroCardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 0',
    width: '100%',
  },
  canvasControlsBar: {
    marginTop: 0,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.4)',
    marginRight: 4,
  },
  btnGhost: {
    background: 'transparent',
    border: 'none',
    padding: '4px 6px',
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
  btnGhostActive: {
    background: 'transparent',
    borderColor: 'transparent',
    color: '#111111',
    fontWeight: 600,
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 16,
    textAlign: 'center',
  },
  articleSection: {
    margin: '40px 0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: '#111111',
    margin: '0 0 12px',
  },
  prose: {
    fontSize: 14,
    lineHeight: 1.65,
    color: '#27272a',
    margin: '0 0 16px',
    fontWeight: 400,
  },
  editorialQuote: {
    margin: '20px 0',
    padding: '0 0 0 16px',
    borderLeft: '2px solid #111111',
    fontSize: 14,
    fontStyle: 'normal',
    lineHeight: 1.65,
    color: '#111111',
  },
  inlineCode: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: '13px',
    background: '#f4f4f5',
    border: '1px solid #e4e4e7',
    padding: '2px 5px',
    borderRadius: 4,
    color: '#111111',
  },
  codeFigure: {
    margin: '20px 0',
    borderRadius: 8,
    border: '1px solid #e4e4e7',
    background: '#fafafa',
    overflow: 'hidden',
  },
  codeBlock: {
    margin: 0,
    padding: 16,
    fontSize: 13,
    lineHeight: 1.65,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    color: '#27272a',
    overflowX: 'auto',
  },
  demoBox: {
    margin: '24px 0',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #e4e4e7',
    background: '#ffffff',
  },
  demoBoxHeader: {
    marginBottom: 16,
  },
  demoBoxTitle: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#111111',
    letterSpacing: '-0.01em',
    marginBottom: 4,
  },
  demoBoxSub: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  teamPaletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 8,
    marginBottom: 20,
  },
  teamSelectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background 0.18s ease, border-color 0.18s ease',
    willChange: 'transform',
  },
  colorPip: {
    width: 14,
    height: 14,
    borderRadius: 4,
    flexShrink: 0,
  },
  teamSelectMeta: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  teamSelectAbbr: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111111',
  },
  teamSelectName: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  liveComponentStage: {
    background: 'transparent',
    border: 'none',
    padding: '36px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: '0.02em',
    marginBottom: 12,
    textAlign: 'center',
  },
  tokenSpecBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
    maxWidth: 420,
  },
  tokenLine: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    overflowX: 'auto',
  },
  tokenVar: {
    color: '#111111',
    fontWeight: 500,
  },
  tokenVal: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
  morphNavRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 18,
    borderBottom: '1px solid #e4e4e7',
    paddingBottom: 10,
  },
  morphNavBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.4)',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
  morphNavBtnActive: {
    background: 'transparent',
    color: '#111111',
    fontWeight: 600,
  },
  morphDisplayArea: {
    background: 'transparent',
    border: 'none',
    padding: '36px 0',
    width: '100%',
  },
  morphContentBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  morphCaption: {
    fontSize: 14,
    color: '#27272a',
    lineHeight: 1.65,
    textAlign: 'center',
    maxWidth: 520,
    margin: 0,
  },
  pillShowcaseStage: {
    padding: '36px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  cardShowcaseStage: {
    padding: '36px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  simNavRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 18,
    borderBottom: '1px solid #e4e4e7',
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  simNavBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.4)',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
  simNavBtnActive: {
    background: 'transparent',
    color: '#111111',
    fontWeight: 600,
  },
  simPlaybackRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    padding: '4px 0',
  },
  simTextActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: 'none',
    color: '#111111',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 4,
    transition: 'opacity 0.15s ease',
  },
  simTimeDisplay: {
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    fontWeight: 500,
    color: '#111111',
  },
  simScrubber: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#111111',
  },
  simCenteredCardStage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0 24px 0',
    width: '100%',
  },
  footer: {
    marginTop: 56,
  },
  footerDivider: {
    height: 1,
    background: '#f4f4f5',
    marginBottom: 20,
  },
  footerMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
  },
};
