import {
  NbaGame,
  PlayEvent,
  PlayerLeader,
  ScorePoint,
  SmartAlert,
  UserSettings,
} from '../types/nba';
import { FIGMA_GAMES_LIVE, FIGMA_SCORE_HISTORY } from '../data/mockFigmaData';

const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
const ESPN_SUMMARY_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=';

const TEAM_ALIAS_MAP: Record<string, string> = {
  GS: 'GSW',
  NY: 'NYK',
  SA: 'SAS',
  NO: 'NOP',
  UTAH: 'UTA',
  WSH: 'WAS',
  PHO: 'PHX',
};

function normalizeAbbr(abbr: string): string {
  const upper = (abbr || 'NBA').toUpperCase();
  return TEAM_ALIAS_MAP[upper] || upper;
}

export function clockToSeconds(clock: string): number {
  if (!clock) return 720;
  const parts = clock.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secs = Math.floor(parseFloat(parts[1]));
    return (isNaN(mins) ? 0 : mins * 60) + (isNaN(secs) ? 0 : secs);
  }
  const sec = Math.floor(parseFloat(clock));
  return isNaN(sec) ? 0 : sec;
}

export function secondsToClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatLiveClockDisplay(
  quarter?: number,
  clock?: string,
  phase?: string,
  isTimeout?: boolean,
  stoppageReason?: string | null,
  stoppageDetail?: string | null
): string {
  const q = quarter || 1;
  const isOt = phase === 'OVERTIME' || q > 4;
  const isClutch = phase === 'CLUTCH';
  const periodPrefix = isOt ? 'OT' : isClutch ? '' : `Q${q}`;

  if (!clock || clockToSeconds(clock) <= 0 || /end|half/i.test(clock)) {
    if (/half/i.test(clock || '')) return 'Halftime';
    return isOt ? 'End of OT' : `End of Q${q}`;
  }

  const stoppage = isTimeout
    ? 'Timeout'
    : stoppageDetail || stoppageReason;

  if (stoppage) {
    return periodPrefix
      ? `${periodPrefix} • ${clock} • ${stoppage}`
      : `${clock} • ${stoppage}`;
  }

  return periodPrefix ? `${periodPrefix} • ${clock}` : clock;
}

function parseClockMinutes(clock: string): number {
  return clockToSeconds(clock) / 60;
}

export function evaluateLivePhase(
  quarter: number,
  clock: string,
  awayScore: number,
  homeScore: number
): 'LIVE' | 'CLUTCH' | 'OVERTIME' {
  const secsLeft = clockToSeconds(clock);
  const diff = Math.abs(awayScore - homeScore);
  if (quarter > 4) {
    return 'OVERTIME';
  }
  if (quarter === 4 && secsLeft > 0 && secsLeft <= 120 && diff <= 5) {
    return 'CLUTCH';
  }
  return 'LIVE';
}

export function tickLiveGamesOneSecond(games: NbaGame[]): NbaGame[] {
  let changed = false;
  const next = games.map((g) => {
    if (
      g.phase !== 'LIVE' &&
      g.phase !== 'CLUTCH' &&
      g.phase !== 'OVERTIME'
    ) {
      return g;
    }

    // When game action is stopped (free throws, throw-in, timeout, review, end of period), DO NOT TICK!
    const isStopped =
      g.isClockRunning === false ||
      g.isTimeout ||
      Boolean(g.stoppageReason) ||
      Boolean(g.stoppageDetail) ||
      /timeout|end|half/i.test(g.clock || '');

    if (isStopped) {
      // In basketball, an inbounds throw-in lasts at most 8 seconds.
      // If throw-in stoppage has elapsed for 8 ticks without an API update,
      // the ball has been inbounded: clear stoppage and resume live clock ticking!
      if (g.stoppageReason === 'Throw-in') {
        const ticks = (g.stoppageTicks || 0) + 1;
        if (ticks >= 8) {
          changed = true;
          return {
            ...g,
            stoppageReason: null,
            stoppageDetail: undefined,
            isClockRunning: true,
            stoppageTicks: 0,
          };
        }
        return { ...g, stoppageTicks: ticks };
      }
      return g;
    }

    const currentSecs = clockToSeconds(g.clock);
    if (currentSecs <= 0) {
      return g;
    }
    changed = true;
    const nextQuarter = g.quarter || 1;
    const nextSecs = Math.max(0, currentSecs - 1);
    const nextClock = secondsToClock(nextSecs);
    const nextPhase = evaluateLivePhase(
      nextQuarter,
      nextClock,
      g.awayScore,
      g.homeScore
    );
    const diff = Math.abs(g.awayScore - g.homeScore);
    const nextClutchNote =
      nextPhase === 'CLUTCH' && !g.clutchNote
        ? diff === 0
          ? 'Tie game in the final 2 minutes'
          : `${diff} point game in the final 2 minutes`
        : g.clutchNote;

    return {
      ...g,
      quarter: nextQuarter,
      clock: nextClock,
      phase: nextPhase,
      clutchNote: nextClutchNote,
      stoppageTicks: 0,
    };
  });
  return changed ? next : games;
}

export function mergeGamesMonotonically(
  prevGames: NbaGame[] | undefined,
  incomingGames: NbaGame[]
): NbaGame[] {
  if (!prevGames || prevGames.length === 0) {
    return incomingGames;
  }

  const prevMap = new Map<string, NbaGame>();
  for (const pg of prevGames) {
    prevMap.set(pg.id, pg);
  }

  return incomingGames.map((incoming) => {
    const prev = prevMap.get(incoming.id);
    if (!prev) return incoming;

    const isIncomingLive =
      incoming.phase === 'LIVE' ||
      incoming.phase === 'CLUTCH' ||
      incoming.phase === 'OVERTIME';
    const isPrevLive =
      prev.phase === 'LIVE' ||
      prev.phase === 'CLUTCH' ||
      prev.phase === 'OVERTIME';

    if (!isIncomingLive || !isPrevLive) {
      return incoming;
    }

    const prevQ = prev.quarter || 1;
    const incQ = incoming.quarter || 1;

    // 1. If quarter advanced, accept the new quarter and its clock
    if (incQ > prevQ) {
      return incoming;
    }

    // 2. If API returned a stale older quarter, hold current quarter
    if (incQ < prevQ) {
      return {
        ...incoming,
        quarter: prevQ,
        clock: prev.clock,
        phase: prev.phase,
      };
    }

    // 3. Same quarter: CLOCK MUST BE STRICTLY MONOTONICALLY NON-INCREASING!
    // A basketball clock counts down. It can NEVER jump backwards to a higher time remaining!
    const prevSecs = clockToSeconds(prev.clock);
    const incSecs = clockToSeconds(incoming.clock);
    let effectiveClock = incoming.clock;
    if (incSecs > prevSecs && prevSecs > 0) {
      // Incoming API packet is cached/delayed: preserve our lower local ticked clock!
      effectiveClock = prev.clock;
    }

    // 4. SCORE AND PLAY LOCKSTEP:
    // If incoming points increased over prev, but incoming has no confirmed scoring play at top,
    // delay the score bump until the play call arrives so points and plays NEVER desync!
    let effectiveAwayScore = incoming.awayScore;
    let effectiveHomeScore = incoming.homeScore;
    let effectiveLastPlays = incoming.lastPlays;
    let effectiveLastPlayShort = incoming.lastPlayShort;

    const scoreIncreased =
      incoming.awayScore > prev.awayScore || incoming.homeScore > prev.homeScore;

    if (scoreIncreased) {
      const topPlay = incoming.lastPlays?.[0];
      const hasMatchingScoringPlay =
        topPlay &&
        (topPlay.isScoringPlay ||
          /makes|3-pointer|three|dunk|layup|jumper|free throw/i.test(
            topPlay.description || ''
          ));

      if (!hasMatchingScoringPlay && prev.lastPlays && prev.lastPlays.length > 0) {
        effectiveAwayScore = prev.awayScore;
        effectiveHomeScore = prev.homeScore;
        effectiveLastPlays = prev.lastPlays;
        effectiveLastPlayShort = prev.lastPlayShort;
      }
    }

    return {
      ...incoming,
      clock: effectiveClock,
      awayScore: effectiveAwayScore,
      homeScore: effectiveHomeScore,
      lastPlays: effectiveLastPlays,
      lastPlayShort: effectiveLastPlayShort,
    };
  });
}

function formatYyyyMmDdInEst(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '11';
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  return `${year}${month}${day}`;
}

function parseEspnEvent(
  ev: any,
  dayLabel: 'TODAY' | 'TOMORROW',
  prevGame?: NbaGame
): NbaGame {
  const comp = ev.competitions?.[0];
  const competitors: any[] = comp?.competitors || [];
  const awayComp =
    competitors.find((c) => c.homeAway === 'away') || competitors[0];
  const homeComp =
    competitors.find((c) => c.homeAway === 'home') || competitors[1];

  const awayTeam = normalizeAbbr(awayComp?.team?.abbreviation || 'PHI');
  const homeTeam = normalizeAbbr(homeComp?.team?.abbreviation || 'NYK');
  let awayScore = parseInt(awayComp?.score || '0', 10);
  let homeScore = parseInt(homeComp?.score || '0', 10);

  const statusObj = ev.status || comp?.status;
  const state: string = statusObj?.type?.state || 'pre'; // 'pre' | 'in' | 'post'
  const statusName: string = statusObj?.type?.name || '';
  const quarter: number = statusObj?.period || 1;
  const shortDetail: string = statusObj?.type?.shortDetail || '';
  const isBetweenQuarters =
    statusName === 'STATUS_END_PERIOD' ||
    statusName === 'STATUS_HALFTIME' ||
    /end of|halftime/i.test(shortDetail);
  let displayClock: string = isBetweenQuarters
    ? '0:00'
    : statusObj?.displayClock || '0:00';

  // Apply monotonic clock rule if prevGame exists in the same quarter:
  // A basketball game clock only counts down; it must NEVER jump backwards to a higher time!
  if (
    prevGame &&
    (prevGame.phase === 'LIVE' ||
      prevGame.phase === 'CLUTCH' ||
      prevGame.phase === 'OVERTIME') &&
    quarter === prevGame.quarter &&
    !isBetweenQuarters
  ) {
    const prevSecs = clockToSeconds(prevGame.clock);
    const incSecs = clockToSeconds(displayClock);
    if (incSecs > prevSecs && prevSecs > 0) {
      displayClock = prevGame.clock;
    }
  }

  let phase: NbaGame['phase'] = 'SCHEDULED';
  if (state === 'post') {
    phase = 'FINAL';
  } else if (state === 'in') {
    phase = evaluateLivePhase(quarter, displayClock, awayScore, homeScore);
  }

  // Parse start time if scheduled
  let startTimeText = '7:00 PM EST';
  if (ev.date) {
    try {
      const dt = new Date(ev.date);
      const timeStr =
        dt.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York',
        }) + ' EST';
      startTimeText = dayLabel === 'TOMORROW' ? `TOM • ${timeStr}` : timeStr;
    } catch {
      startTimeText = shortDetail || '7:00 PM EST';
    }
  }

  // Extract leaders from scoreboard competitor leaders if available
  const leaders: PlayerLeader[] = [];
  for (const c of [awayComp, homeComp]) {
    if (!c) continue;
    const cAbbr = normalizeAbbr(c.team?.abbreviation || '');
    const ptsLeader = c.leaders?.find(
      (l: any) => l.name === 'points' || l.abbreviation === 'PTS'
    )?.leaders?.[0];
    const rebLeader = c.leaders?.find(
      (l: any) => l.name === 'rebounds' || l.abbreviation === 'REB'
    )?.leaders?.[0];
    const astLeader = c.leaders?.find(
      (l: any) => l.name === 'assists' || l.abbreviation === 'AST'
    )?.leaders?.[0];

    if (ptsLeader?.athlete) {
      const athleteName = ptsLeader.athlete.displayName || ptsLeader.athlete.shortName;
      const isRebSame = rebLeader?.athlete?.id === ptsLeader.athlete.id;
      const isAstSame = astLeader?.athlete?.id === ptsLeader.athlete.id;
      leaders.push({
        name: athleteName,
        jersey: ptsLeader.athlete.jersey || '0',
        teamAbbr: cAbbr,
        pts: Math.round(Number(ptsLeader.value || 0)),
        reb: isRebSame ? Math.round(Number(rebLeader?.value || 0)) : 0,
        ast: isAstSame ? Math.round(Number(astLeader?.value || 0)) : 0,
      });
    }
  }

  const scoreDiff = awayScore - homeScore;
  const momentumValue = Math.max(-50, Math.min(50, -scoreDiff * 3));

  const compTeamMap: Record<string, string> = {};
  if (awayComp?.id) compTeamMap[String(awayComp.id)] = awayTeam;
  if (awayComp?.team?.id) compTeamMap[String(awayComp.team.id)] = awayTeam;
  if (homeComp?.id) compTeamMap[String(homeComp.id)] = homeTeam;
  if (homeComp?.team?.id) compTeamMap[String(homeComp.team.id)] = homeTeam;

  const situation = comp?.situation;
  const rawLastPlay = situation?.lastPlay?.text;
  const playTeam =
    situation?.lastPlay?.team?.id && compTeamMap[String(situation.lastPlay.team.id)]
      ? compTeamMap[String(situation.lastPlay.team.id)]
      : awayTeam;
  let lastPlayText: string | undefined = rawLastPlay || (
    phase === 'LIVE' || phase === 'CLUTCH'
      ? `${awayTeam} vs ${homeTeam} live action`
      : undefined
  );

  let possession: 'away' | 'home' | null = prevGame?.possession || null;
  const isLivePhase =
    phase === 'LIVE' || phase === 'CLUTCH' || phase === 'OVERTIME';

  if (isLivePhase) {
    const posId = situation?.possession ? String(situation.possession) : '';
    if (posId && compTeamMap[posId]) {
      possession = compTeamMap[posId] === awayTeam ? 'away' : 'home';
    } else if (situation?.lastPlay) {
      const inferred = inferPossessionFromPlay(
        situation.lastPlay,
        awayTeam,
        homeTeam,
        compTeamMap
      );
      if (inferred) possession = inferred;
    }

    // If a team just scored on the scoreboard, possession shifts to the opposing team
    if (prevGame) {
      if (awayScore > prevGame.awayScore) {
        possession = 'home';
      } else if (homeScore > prevGame.homeScore) {
        possession = 'away';
      }
    }

    if (!possession) {
      possession = prevGame?.possession || 'away';
    }
  }

  let mvp: PlayerLeader | undefined;
  if (phase === 'FINAL' && leaders.length > 0) {
    const winningTeam = awayScore >= homeScore ? awayTeam : homeTeam;
    mvp = leaders.find((l) => l.teamAbbr === winningTeam) || leaders[0];
  }

  const isTimeout =
    state === 'in' &&
    Boolean(
      statusName === 'STATUS_TIMEOUT' ||
        /timeout/i.test(shortDetail) ||
        /timeout/i.test(statusObj?.type?.detail || '') ||
        /timeout/i.test(situation?.lastPlay?.text || '') ||
        /timeout/i.test(situation?.lastPlay?.type?.text || '')
    );

  const isStoppage =
    isBetweenQuarters ||
    isTimeout ||
    Boolean(
      rawLastPlay &&
        /foul|free\s+throw|timeout|review|instant\s+replay|stoppage|injury|out\s+of\s+bounds|violation|jump\s+ball/i.test(
          rawLastPlay
        )
    );
  const isClockRunning = state === 'in' && !isStoppage;

  let lastPlays: PlayEvent[] = prevGame?.lastPlays ? [...prevGame.lastPlays] : [];

  if (rawLastPlay && lastPlayText) {
    const isScoring =
      Boolean(situation?.lastPlay?.scoringPlay) ||
      Number(situation?.lastPlay?.scoreValue || 0) > 0 ||
      /makes/i.test(rawLastPlay);
    const playId = String(
      situation?.lastPlay?.id || `${displayClock}-${lastPlayText}`
    );
    const exists = lastPlays.some(
      (lp) =>
        lp.id === playId ||
        (lp.clock === displayClock &&
          lp.description === shortenPlayText(lastPlayText))
    );
    if (!exists) {
      const newPlay: PlayEvent = {
        id: playId,
        clock: displayClock,
        quarter,
        teamAbbr: playTeam,
        description: shortenPlayText(lastPlayText) || lastPlayText,
        isScoringPlay: isScoring,
        pointsScored: Number(
          situation?.lastPlay?.scoreValue || (isScoring ? 2 : 0)
        ),
        awayScore,
        homeScore,
      };
      lastPlays = [newPlay, ...lastPlays].slice(0, 4);
    }
  }

  // If scoreboard score is ahead of prevGame but play-by-play description has not arrived yet,
  // hold prevGame's aligned score and plays so points and plays NEVER desync!
  if (
    prevGame &&
    (prevGame.phase === 'LIVE' ||
      prevGame.phase === 'CLUTCH' ||
      prevGame.phase === 'OVERTIME')
  ) {
    if (awayScore > prevGame.awayScore || homeScore > prevGame.homeScore) {
      awayScore = prevGame.awayScore;
      homeScore = prevGame.homeScore;
      lastPlays = prevGame.lastPlays;
      lastPlayText = prevGame.lastPlayShort || lastPlayText;
    }
  }

  return {
    id: String(ev.id),
    awayTeam,
    homeTeam,
    awayScore,
    homeScore,
    phase,
    quarter,
    clock: displayClock,
    isTimeout,
    isClockRunning,
    startTimeText,
    dayLabel,
    possession,
    lastPlayShort: shortenPlayText(lastPlayText),
    momentumValue,
    scoreHistory:
      phase === 'SCHEDULED'
        ? []
        : buildSyntheticScoreHistory(awayScore, homeScore, quarter),
    lastPlays,
    leaders,
    mvp,
  };
}

export async function fetchLiveNbaGames(
  existingGames?: NbaGame[]
): Promise<{
  games: NbaGame[];
  isFallback: boolean;
}> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = formatYyyyMmDdInEst(now);
    const tomorrowStr = formatYyyyMmDdInEst(tomorrow);

    const [todayRes, tomorrowRes] = await Promise.all([
      fetch(`${ESPN_SCOREBOARD_URL}?dates=${todayStr}`, { cache: 'no-store' }),
      fetch(`${ESPN_SCOREBOARD_URL}?dates=${tomorrowStr}`, {
        cache: 'no-store',
      }),
    ]);

    const todayData = todayRes.ok ? await todayRes.json() : { events: [] };
    const tomorrowData = tomorrowRes.ok
      ? await tomorrowRes.json()
      : { events: [] };

    const todayEvents: any[] = todayData?.events || [];
    const tomorrowEvents: any[] = tomorrowData?.events || [];

    const existingMap = new Map<string, NbaGame>();
    if (existingGames) {
      for (const eg of existingGames) {
        existingMap.set(eg.id, eg);
      }
    }

    const seenIds = new Set<string>();
    const parsedGames: NbaGame[] = [];

    for (const ev of todayEvents) {
      const id = String(ev.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        parsedGames.push(
          parseEspnEvent(ev, 'TODAY', existingMap.get(id))
        );
      }
    }

    for (const ev of tomorrowEvents) {
      const id = String(ev.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        parsedGames.push(
          parseEspnEvent(ev, 'TOMORROW', existingMap.get(id))
        );
      }
    }

    if (parsedGames.length === 0) {
      return { games: FIGMA_GAMES_LIVE, isFallback: true };
    }

    return { games: parsedGames, isFallback: false };
  } catch (err) {
    console.warn('[CherryPick] Falling back to Figma games:', err);
    return { games: FIGMA_GAMES_LIVE, isFallback: true };
  }
}

export async function enrichGameWithSummary(game: NbaGame): Promise<NbaGame> {
  if (game.id.startsWith('figma-')) {
    return game;
  }
  try {
    const res = await fetch(`${ESPN_SUMMARY_URL}${game.id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return game;
    const summary = await res.json();

    const rawPlays: any[] = summary?.plays || [];
    let lastPlays: PlayEvent[] = [];

    const teamIdToAbbr: Record<string, string> = {};
    const boxTeams: any[] = summary?.boxscore?.teams || [];
    for (const bt of boxTeams) {
      if (bt?.team?.id && bt?.team?.abbreviation) {
        teamIdToAbbr[String(bt.team.id)] = normalizeAbbr(bt.team.abbreviation);
      }
    }

    // 1. Compute unanswered scoring runs strictly from actual scoreboard point increases (awayScore / homeScore)
    let activeRunText: string | undefined = undefined;
    let activeRunTeam: string | undefined = undefined;
    let runPoints = 0;
    let clutchNote = game.clutchNote;

    let prevA = 0;
    let prevH = 0;
    let currentRunSide: 'away' | 'home' | null = null;
    let currentRunPts = 0;
    const trueScoringPlays: any[] = [];

    for (let i = 0; i < rawPlays.length; i++) {
      const p = rawPlays[i];
      const a = typeof p?.awayScore === 'number' ? p.awayScore : prevA;
      const h = typeof p?.homeScore === 'number' ? p.homeScore : prevH;
      const dA = a - prevA;
      const dH = h - prevH;

      const pText = String(p?.text || '');
      const pAbbr =
        (p?.team?.id && teamIdToAbbr[String(p.team.id)]) || '';
      const isMadeFtFallback =
        dA === 0 && dH === 0 && /makes\s+free\s+throw/i.test(pText);

      const effDA =
        dA > 0 ? dA : isMadeFtFallback && pAbbr === game.awayTeam ? 1 : 0;
      const effDH =
        dH > 0 ? dH : isMadeFtFallback && pAbbr === game.homeTeam ? 1 : 0;

      if (effDA > 0 && effDH === 0) {
        trueScoringPlays.push({ ...p, _ptsScored: effDA, _side: 'away' });
        if (currentRunSide === 'away') {
          currentRunPts += effDA;
        } else {
          currentRunSide = 'away';
          currentRunPts = effDA;
        }
      } else if (effDH > 0 && effDA === 0) {
        trueScoringPlays.push({ ...p, _ptsScored: effDH, _side: 'home' });
        if (currentRunSide === 'home') {
          currentRunPts += effDH;
        } else {
          currentRunSide = 'home';
          currentRunPts = effDH;
        }
      }
      prevA = a;
      prevH = h;
    }

    if (currentRunSide && currentRunPts > 0) {
      activeRunTeam =
        currentRunSide === 'away' ? game.awayTeam : game.homeTeam;
      runPoints = currentRunPts;
      if (currentRunPts > 4) {
        activeRunText = `${activeRunTeam} ${currentRunPts}-0 run`;
      }
    }

    if (trueScoringPlays.length >= 2) {
      let leadChanges = 0;
      let prevLeader: 'away' | 'home' | 'tie' = 'tie';
      const recentWindow = trueScoringPlays.slice(-10);
      for (const sp of recentWindow) {
        const a = Number(sp.awayScore || 0);
        const h = Number(sp.homeScore || 0);
        const leader = a > h ? 'away' : h > a ? 'home' : 'tie';
        if (
          leader !== 'tie' &&
          prevLeader !== 'tie' &&
          leader !== prevLeader
        ) {
          leadChanges++;
        }
        if (leader !== 'tie') prevLeader = leader;
      }
      if (leadChanges >= 2) {
        clutchNote = `${leadChanges} lead changes in 2 min`;
      }
    }

    // 2. Build recent plays list with foul -> free throw shooter highlighting
    // Also ensure that at the same clock timestamp, free throws / baskets appear above the foul that triggered them
    const startIdx = Math.max(0, rawPlays.length - 18);
    const windowPlays: { raw: any; idx: number }[] = [];
    for (let i = startIdx; i < rawPlays.length; i++) {
      if (rawPlays[i]?.text) {
        windowPlays.push({ raw: rawPlays[i], idx: i });
      }
    }

    // Sort windowPlays from newest to oldest, but if two plays share the exact same period & clock,
    // put scoring / free-throw plays ahead of the foul play so the score increase matches the top play
    windowPlays.sort((a, b) => {
      const sameClock =
        a.raw?.period?.number === b.raw?.period?.number &&
        a.raw?.clock?.displayValue === b.raw?.clock?.displayValue;
      if (sameClock) {
        const aScore = Boolean(a.raw?.scoringPlay) || /free throw/i.test(a.raw?.text || '');
        const bScore = Boolean(b.raw?.scoringPlay) || /free throw/i.test(b.raw?.text || '');
        if (aScore !== bScore) {
          return aScore ? -1 : 1;
        }
      }
      return b.idx - a.idx;
    });

    for (const item of windowPlays) {
      const p = item.raw;
      const text = String(p.text || '');
      if (/^substitution:|enters the game for/i.test(text) && windowPlays.length > 4) {
        continue;
      }
      const formatted = formatPlayWithFreeThrows(p, item.idx, rawPlays, teamIdToAbbr, game);
      lastPlays.push(formatted);
      if (lastPlays.length >= 4) break;
    }

    const scoringPlays = trueScoringPlays;

    let scoreHistory: ScorePoint[] = game.scoreHistory;
    if (scoringPlays.length >= 4) {
      const step = Math.max(1, Math.floor(scoringPlays.length / 12));
      const pts: ScorePoint[] = [{ progress: 0, diff: 0 }];
      for (let i = 0; i < scoringPlays.length; i += step) {
        const sp = scoringPlays[i];
        const q = Math.min(4, Number(sp.period?.number || 1));
        const minsLeft = parseClockMinutes(sp.clock?.displayValue || '6:00');
        const qProgress = Math.max(0, Math.min(1, (12 - minsLeft) / 12));
        const progress = Math.min(1, (q - 1 + qProgress) / 4);
        const diff = Number(sp.awayScore || 0) - Number(sp.homeScore || 0);
        pts.push({ progress, diff });
      }
      scoreHistory = pts;
    }

    const boxPlayers: any[] = summary?.boxscore?.players || [];
    const extractedLeaders: PlayerLeader[] = [];
    for (const teamGroup of boxPlayers) {
      const tAbbr = normalizeAbbr(teamGroup?.team?.abbreviation || '');
      const statsGroup = teamGroup?.statistics?.[0];
      const keys: string[] = statsGroup?.names || statsGroup?.labels || [];
      const ptsIdx = keys.findIndex((k) => k.toUpperCase() === 'PTS');
      const rebIdx = keys.findIndex((k) => k.toUpperCase() === 'REB');
      const astIdx = keys.findIndex((k) => k.toUpperCase() === 'AST');

      const athletes: any[] = statsGroup?.athletes || [];
      let bestAthlete: PlayerLeader | null = null;
      for (const a of athletes) {
        const stats: string[] = a?.stats || [];
        if (!stats.length) continue;
        const pts = parseInt(
          stats[ptsIdx >= 0 ? ptsIdx : stats.length - 1] || '0',
          10
        );
        const reb = parseInt(stats[rebIdx >= 0 ? rebIdx : 4] || '0', 10);
        const ast = parseInt(stats[astIdx >= 0 ? astIdx : 5] || '0', 10);
        if (!isNaN(pts) && (!bestAthlete || pts > bestAthlete.pts)) {
          const athleteName = a.athlete?.displayName || a.athlete?.shortName || 'Player';
          bestAthlete = {
            name: athleteName,
            jersey: a.athlete?.jersey || '0',
            teamAbbr: tAbbr,
            pts,
            reb: isNaN(reb) ? 0 : reb,
            ast: isNaN(ast) ? 0 : ast,
          };
        }
      }
      if (bestAthlete) {
        extractedLeaders.push(bestAthlete);
      }
    }

    const finalLeaders =
      extractedLeaders.length > 0 ? extractedLeaders : game.leaders;
    const winningTeam =
      game.awayScore >= game.homeScore ? game.awayTeam : game.homeTeam;
    const mvp =
      game.phase === 'FINAL'
        ? finalLeaders.find((l) => l.teamAbbr === winningTeam) || finalLeaders[0]
        : game.mvp;

    let livePossession: 'away' | 'home' | null = game.possession || null;
    const isLivePhase =
      game.phase === 'LIVE' ||
      game.phase === 'CLUTCH' ||
      game.phase === 'OVERTIME';
    const recentRaw = windowPlays.map((w) => w.raw);
    if (isLivePhase && recentRaw.length > 0) {
      const actionPlay =
        recentRaw.find(
          (p) =>
            p?.team?.id &&
            !/enters the game|timeout/i.test(String(p?.text || ''))
        ) || recentRaw.find((p) => p?.team?.id);
      if (actionPlay) {
        const inferred = inferPossessionFromPlay(
          actionPlay,
          game.awayTeam,
          game.homeTeam,
          teamIdToAbbr
        );
        if (inferred) livePossession = inferred;
      }
      if (!livePossession) {
        livePossession = game.possession || 'away';
      }
    }

    // Find the most recent non-substitution action or stoppage play
    const nonSubPlays = rawPlays.filter(
      (p) => !/^substitution:|enters the game for/i.test(String(p?.text || ''))
    );
    const latestActionPlay =
      nonSubPlays.length > 0 ? nonSubPlays[nonSubPlays.length - 1] : null;
    const latestActionText = String(latestActionPlay?.text || '');
    const latestRawPlay =
      rawPlays.length > 0 ? rawPlays[rawPlays.length - 1] : null;
    const latestRawText = String(latestRawPlay?.text || '');

    // Check if the latest action was a timeout, or if any play at the current game clock is a timeout
    const currentClockPlays = rawPlays.filter(
      (p) =>
        p?.clock?.displayValue === game.clock &&
        p?.period?.number === game.quarter
    );
    const hasTimeoutAtCurrentClock = currentClockPlays.some(
      (p) =>
        /timeout/i.test(String(p?.text || '')) ||
        /timeout/i.test(String(p?.type?.text || ''))
    );
    const isActionTimeout =
      /timeout/i.test(latestActionText) ||
      /timeout/i.test(String(latestActionPlay?.type?.text || ''));

    const statusType = summary?.header?.competitions?.[0]?.status?.type;
    const isDetailTimeout =
      statusType?.name === 'STATUS_TIMEOUT' ||
      /timeout/i.test(String(statusType?.detail || '')) ||
      /timeout/i.test(String(statusType?.shortDetail || ''));

    // If game was previously in timeout, only clear timeout if clock has moved or an active basketball play occurred
    const hasActiveBasketballPlayResumed =
      latestActionPlay &&
      !/timeout/i.test(latestActionText) &&
      !/foul|free\s+throw|review|stoppage|injury|violation/i.test(
        latestActionText
      ) &&
      latestActionPlay.clock?.displayValue !== game.clock;

    const isTimeout = Boolean(
      isDetailTimeout ||
        hasTimeoutAtCurrentClock ||
        isActionTimeout ||
        (game.isTimeout && !hasActiveBasketballPlayResumed)
    );

    // Stoppage classification: identify exact state (Free Throws, Throw-in, Timeout, Review, Jump Ball)
    let stoppageReason: NbaGame['stoppageReason'] = null;
    let stoppageDetail: string | undefined = undefined;

    if (isTimeout) {
      stoppageReason = 'Timeout';
      stoppageDetail = 'Timeout';
    } else if (/review|challenge|replay/i.test(latestActionText)) {
      stoppageReason = 'Review';
      stoppageDetail = 'Review';
    } else if (/jump\s+ball|held\s+ball/i.test(latestActionText)) {
      stoppageReason = 'Jump Ball';
      stoppageDetail = 'Jump Ball';
    } else if (
      /free\s+throw|shooting\s+foul|technical\s+foul|flagrant\s+foul/i.test(
        latestActionText
      ) ||
      /free\s+throw/i.test(String(latestActionPlay?.type?.text || ''))
    ) {
      const ftMatch = latestActionText.match(/\b([1-3])\s+of\s+([1-3])\b/i);
      if (ftMatch && parseInt(ftMatch[1], 10) < parseInt(ftMatch[2], 10)) {
        stoppageReason = 'Free Throws';
        stoppageDetail = `Free Throw (${ftMatch[1]} of ${ftMatch[2]})`;
      } else if (
        /shooting\s+foul|technical\s+foul|flagrant\s+foul/i.test(
          latestActionText
        )
      ) {
        stoppageReason = 'Free Throws';
        stoppageDetail = 'Free Throws';
      } else if (/free\s+throw/i.test(latestActionText)) {
        if (/makes/i.test(latestActionText)) {
          stoppageReason = 'Throw-in';
          stoppageDetail = 'Throw-in';
        } else {
          stoppageReason = null;
          stoppageDetail = undefined;
        }
      } else {
        stoppageReason = 'Free Throws';
        stoppageDetail = 'Free Throws';
      }
    } else if (
      /out\s+of\s+bounds|turnover|bad\s+pass|traveling|violation|foul|substitution|enters\s+the\s+game/i.test(
        latestActionText
      ) ||
      /enters the game|substitution/i.test(latestRawText)
    ) {
      stoppageReason = 'Throw-in';
      stoppageDetail = 'Throw-in';
    }

    // If an in-play live basketball play occurred (shot, rebound, steal), stoppage is cleared
    const isInPlayLiveAction =
      /makes\s+(?:2|3|two|three|jump|dunk|layup|tip|hook|pullup|floating|bank)|misses\s+(?:2|3|two|three|jump|dunk|layup|tip|hook|pullup|floating|bank|free)|rebound|steal|blocks/i.test(
        latestActionText
      );
    if (isInPlayLiveAction && stoppageReason === 'Throw-in') {
      stoppageReason = null;
      stoppageDetail = undefined;
    }

    const isStoppage = Boolean(stoppageReason || isTimeout);
    const isClockRunning = isLivePhase && !isStoppage;

    // Synchronize scoreboard points with play calls so points and plays NEVER desync
    let syncedAwayScore = game.awayScore;
    let syncedHomeScore = game.homeScore;
    let syncedClock = game.clock;
    let syncedQuarter = game.quarter;

    if (rawPlays.length > 0 && game.phase !== 'FINAL') {
      for (let i = rawPlays.length - 1; i >= 0; i--) {
        const p = rawPlays[i];
        if (typeof p?.awayScore === 'number' && typeof p?.homeScore === 'number') {
          syncedAwayScore = p.awayScore;
          syncedHomeScore = p.homeScore;
          break;
        }
      }
      const topPlay = lastPlays[0];
      let candidateClock = syncedClock;
      if (topPlay) {
        if (isStoppage && topPlay.clock) {
          candidateClock = topPlay.clock;
        } else {
          const headerClock = summary?.header?.competitions?.[0]?.status?.displayClock;
          candidateClock = headerClock || topPlay.clock || syncedClock;
        }
        if (topPlay.quarter) {
          syncedQuarter = topPlay.quarter;
        }
      }

      // Enforce monotonic clock rule: never jump backwards within the same quarter!
      if (syncedQuarter === game.quarter && game.clock) {
        const currentSecs = clockToSeconds(game.clock);
        const candSecs = clockToSeconds(candidateClock);
        if (candSecs > currentSecs && currentSecs > 0) {
          syncedClock = game.clock;
        } else {
          syncedClock = candidateClock;
        }
      } else {
        syncedClock = candidateClock;
      }
    }

    // If a timeout is active, callout should highlight the timeout play
    const timeoutPlay = lastPlays.find((lp) =>
      /timeout/i.test(lp.description)
    );
    const preferredCalloutPlay =
      isTimeout && timeoutPlay
        ? timeoutPlay
        : runPoints > 4 &&
          lastPlays[0] &&
          !lastPlays[0].isScoringPlay &&
          !/FT:|free throw|shooting/i.test(lastPlays[0].description)
        ? lastPlays.find((lp) => lp.isScoringPlay) || lastPlays[0]
        : lastPlays[0];

    return {
      ...game,
      awayScore: syncedAwayScore,
      homeScore: syncedHomeScore,
      clock: syncedClock,
      quarter: syncedQuarter,
      possession: livePossession,
      isTimeout,
      isClockRunning,
      stoppageReason,
      stoppageDetail,
      lastPlays: lastPlays.length > 0 ? lastPlays : game.lastPlays,
      lastPlayShort: preferredCalloutPlay?.description || game.lastPlayShort,
      activeRunText,
      activeRunTeam,
      runPoints,
      clutchNote: clutchNote || game.clutchNote,
      scoreHistory,
      leaders: finalLeaders,
      mvp,
    };
  } catch {
    return game;
  }
}

function formatPlayWithFreeThrows(
  p: any,
  idx: number,
  rawPlays: any[],
  teamIdToAbbr: Record<string, string>,
  game: NbaGame
): PlayEvent {
  const rawText = String(p?.text || '').replace(/\s+/g, ' ').trim();
  const tAbbr =
    (p?.team?.id && teamIdToAbbr[String(p.team.id)]) || game.awayTeam;
  const clockStr = p?.clock?.displayValue || game.clock;
  const quarterNum = p?.period?.number || game.quarter;

  const prevPlay = idx > 0 ? rawPlays[idx - 1] : null;
  const prevA = typeof prevPlay?.awayScore === 'number' ? prevPlay.awayScore : 0;
  const prevH = typeof prevPlay?.homeScore === 'number' ? prevPlay.homeScore : 0;
  const currA = typeof p?.awayScore === 'number' ? p.awayScore : prevA;
  const currH = typeof p?.homeScore === 'number' ? p.homeScore : prevH;
  const isMadeFreeThrow = /makes\s+free\s+throw/i.test(rawText);
  const actualPts = Math.max(
    isMadeFreeThrow ? 1 : 0,
    currA - prevA + (currH - prevH)
  );
  const isTrueScoring =
    actualPts > 0 ||
    isMadeFreeThrow ||
    Boolean(p?.scoringPlay && Number(p?.scoreValue || 0) > 0);

  const description = shortenPlayText(rawText) || rawText;

  return {
    id: String(p?.id || Math.random()),
    clock: clockStr,
    quarter: quarterNum,
    teamAbbr: tAbbr,
    description,
    isScoringPlay: isTrueScoring,
    pointsScored: actualPts,
    awayScore: p?.awayScore,
    homeScore: p?.homeScore,
  };
}

function inferPossessionFromPlay(
  play: any,
  awayTeam: string,
  homeTeam: string,
  teamIdToAbbr: Record<string, string>
): 'away' | 'home' | null {
  const tid = play?.team?.id ? String(play.team.id) : '';
  const pAbbr =
    (tid && teamIdToAbbr[tid]) ||
    normalizeAbbr(play?.team?.abbreviation || '');
  const playSide: 'away' | 'home' | null =
    pAbbr === awayTeam ? 'away' : pAbbr === homeTeam ? 'home' : null;
  if (!playSide) return null;

  const otherSide: 'away' | 'home' = playSide === 'away' ? 'home' : 'away';
  const text = String(play?.text || '').toLowerCase();
  const typeText = String(play?.type?.text || '').toLowerCase();

  // 1. Defending team fouls -> the FOUL was committed by playSide, so the OFFENSE (otherSide) is shooting free throws or inbounding!
  // E.g., "Ausar Thompson shooting foul" (DET committed foul -> PHI is shooting free throws, PHI has possession!)
  const isDefensiveFoul =
    (text.includes('foul') || typeText.includes('foul')) &&
    !text.includes('offensive foul') &&
    !text.includes('charge');
  if (isDefensiveFoul) {
    return otherSide;
  }

  // 2. Offensive foul or Turnover -> possession flips to other side
  const isTurnover =
    text.includes('turnover') ||
    text.includes('bad pass') ||
    text.includes('lost ball') ||
    text.includes('traveling') ||
    text.includes('shot clock') ||
    text.includes('offensive foul') ||
    text.includes('charge') ||
    typeText.includes('turnover');
  if (isTurnover) {
    return otherSide;
  }

  // 3. Made basket:
  // Intermediate free throws (e.g., "1 of 2", "1 of 3", "2 of 3") -> shooter's team still shooting and has possession!
  const isIntermediateFreeThrow = /1 of [23]|2 of 3/i.test(text);
  if (isIntermediateFreeThrow) {
    return playSide;
  }

  // Final made field goal or final free throw -> other side takes ball out
  const isFinalMadeBasket =
    Boolean(play?.scoringPlay) ||
    Number(play?.scoreValue || 0) > 0 ||
    text.includes('makes');
  if (isFinalMadeBasket) {
    return otherSide;
  }

  // 4. Missed shot / field goal attempt:
  // If text says "Player A misses 25-foot 3-point jumper", Player A's team is currently shooting! They have possession!
  if (text.includes('misses') && !text.includes('defensive rebound')) {
    return playSide;
  }

  return playSide;
}

function shortenPlayText(text?: string): string | undefined {
  if (!text) return undefined;
  return text
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSyntheticScoreHistory(
  awayScore: number,
  homeScore: number,
  quarter: number
): ScorePoint[] {
  const currentDiff = awayScore - homeScore;
  const maxProgress = Math.min(1, Math.max(0.18, quarter * 0.22));
  return FIGMA_SCORE_HISTORY.filter((p) => p.progress <= maxProgress).map(
    (p, idx, arr) =>
      idx === arr.length - 1
        ? { progress: maxProgress, diff: currentDiff }
        : p
  );
}

export function detectSmartAlerts(
  prevGames: NbaGame[],
  nextGames: NbaGame[],
  settings: UserSettings
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const fav = settings.favoriteTeam;

  for (const next of nextGames) {
    const involvesFav = next.awayTeam === fav || next.homeTeam === fav;
    if (!involvesFav && next.id !== settings.pinnedGameId) continue;

    const prev = prevGames.find((g) => g.id === next.id);
    if (!prev) continue;

    if (
      settings.notifications.tipOff &&
      prev.phase === 'SCHEDULED' &&
      (next.phase === 'LIVE' || next.phase === 'CLUTCH')
    ) {
      alerts.push({
        id: `tipoff-${next.id}-${Date.now()}`,
        type: 'TIP_OFF',
        gameId: next.id,
        teamAbbr: next.awayTeam,
        opponentAbbr: next.homeTeam,
        timestampText: 'Now',
        headline: `${next.awayTeam} • ${next.homeTeam}`,
        createdAt: Date.now(),
      });
    }

    if (
      settings.notifications.bigMoments &&
      prev.phase !== 'OVERTIME' &&
      next.phase === 'OVERTIME'
    ) {
      alerts.push({
        id: `ot-${next.id}-${Date.now()}`,
        type: 'OVERTIME',
        gameId: next.id,
        teamAbbr: next.awayTeam,
        opponentAbbr: next.homeTeam,
        timestampText: 'Now',
        headline: `${next.awayTeam} and ${next.homeTeam} headed to overtime`,
        createdAt: Date.now(),
      });
    }

    if (
      settings.notifications.bigMoments &&
      prev.phase !== 'CLUTCH' &&
      next.phase === 'CLUTCH'
    ) {
      const diff = Math.abs(next.awayScore - next.homeScore);
      const leader =
        next.awayScore >= next.homeScore ? next.awayTeam : next.homeTeam;
      alerts.push({
        id: `clutch-${next.id}-${Date.now()}`,
        type: 'CLUTCH',
        gameId: next.id,
        teamAbbr: leader,
        opponentAbbr: leader === next.awayTeam ? next.homeTeam : next.awayTeam,
        timestampText: `Q${next.quarter} • ${next.clock}`,
        headline:
          diff === 0
            ? `Tie game ${next.awayScore}-${next.homeScore} in crunch time`
            : `${diff} point game. ${leader} leading`,
        createdAt: Date.now(),
      });
    }

    const prevLeader =
      prev.awayScore > prev.homeScore
        ? prev.awayTeam
        : prev.homeScore > prev.awayScore
        ? prev.homeTeam
        : null;
    const nextLeader =
      next.awayScore > next.homeScore
        ? next.awayTeam
        : next.homeScore > next.awayScore
        ? next.homeTeam
        : null;

    if (
      settings.notifications.bigMoments &&
      prevLeader &&
      nextLeader &&
      prevLeader !== nextLeader
    ) {
      alerts.push({
        id: `lead-${next.id}-${Date.now()}`,
        type: 'LEAD_CHANGE',
        gameId: next.id,
        teamAbbr: nextLeader,
        opponentAbbr: prevLeader,
        timestampText: `Q${next.quarter} • ${next.clock}`,
        headline: `${nextLeader} takes the lead`,
        awayScore: next.awayScore,
        homeScore: next.homeScore,
        createdAt: Date.now(),
      });
    }

    // Active scoring run alert (> 4 unanswered points)
    if (
      settings.notifications.bigMoments &&
      next.runPoints &&
      next.runPoints > 4 &&
      next.runPoints > (prev.runPoints || 0) &&
      next.activeRunTeam
    ) {
      const runTeam = next.activeRunTeam;
      const oppTeam = runTeam === next.awayTeam ? next.homeTeam : next.awayTeam;
      const diff = Math.abs(next.awayScore - next.homeScore);
      const leader =
        next.awayScore >= next.homeScore ? next.awayTeam : next.homeTeam;
      alerts.push({
        id: `run-${next.id}-${next.runPoints}-${Date.now()}`,
        type: 'RUN',
        gameId: next.id,
        teamAbbr: runTeam,
        opponentAbbr: oppTeam,
        timestampText: `Q${next.quarter} • ${next.clock}`,
        headline: `${runTeam} on a ${next.runPoints}-0 run • ${
          diff === 0 ? 'Tied up' : `${leader} up ${diff}`
        }`,
        awayScore: next.awayScore,
        homeScore: next.homeScore,
        createdAt: Date.now(),
      });
    }

    // Every bucket alert when score increases
    const awayDelta = next.awayScore - prev.awayScore;
    const homeDelta = next.homeScore - prev.homeScore;
    if (
      settings.notifications.everyBucket &&
      (awayDelta > 0 || homeDelta > 0)
    ) {
      const scoringTeam = awayDelta > 0 ? next.awayTeam : next.homeTeam;
      const otherTeam = awayDelta > 0 ? next.homeTeam : next.awayTeam;
      const ptsAdded = awayDelta > 0 ? awayDelta : homeDelta;
      alerts.push({
        id: `bucket-${next.id}-${next.awayScore}-${next.homeScore}-${Date.now()}`,
        type: 'BUCKET',
        gameId: next.id,
        teamAbbr: scoringTeam,
        opponentAbbr: otherTeam,
        timestampText: `Q${next.quarter} • ${next.clock}`,
        headline:
          next.lastPlayShort ||
          `${scoringTeam} scores +${ptsAdded} (${next.awayScore}-${next.homeScore})`,
        awayScore: next.awayScore,
        homeScore: next.homeScore,
        createdAt: Date.now(),
      });
    }

    if (
      settings.notifications.finalScore &&
      prev.phase !== 'FINAL' &&
      next.phase === 'FINAL'
    ) {
      const winner =
        next.awayScore >= next.homeScore ? next.awayTeam : next.homeTeam;
      const loser = winner === next.awayTeam ? next.homeTeam : next.awayTeam;
      alerts.push({
        id: `final-${next.id}-${Date.now()}`,
        type: 'FINAL',
        gameId: next.id,
        teamAbbr: winner,
        opponentAbbr: loser,
        timestampText: 'FINAL',
        headline: `${winner} takes the win over ${loser}`,
        awayScore: Math.max(next.awayScore, next.homeScore),
        homeScore: Math.min(next.awayScore, next.homeScore),
        createdAt: Date.now(),
      });
    }
  }

  return alerts;
}

export function buildContextualAlertForGame(
  game: NbaGame,
  settings: UserSettings
): SmartAlert | null {
  const { bigMoments, tipOff, finalScore, everyBucket } = settings.notifications;
  if (!bigMoments && !tipOff && !finalScore && !everyBucket) {
    return null;
  }

  const leader =
    game.awayScore >= game.homeScore ? game.awayTeam : game.homeTeam;
  const trailer = leader === game.awayTeam ? game.homeTeam : game.awayTeam;
  const diff = Math.abs(game.awayScore - game.homeScore);

  if (bigMoments && game.phase === 'OVERTIME') {
    return {
      id: `ctx-ot-${game.id}-${Date.now()}`,
      type: 'OVERTIME',
      gameId: game.id,
      teamAbbr: game.awayTeam,
      opponentAbbr: game.homeTeam,
      timestampText: `OT • ${game.clock}`,
      headline: `${game.awayTeam} and ${game.homeTeam} in overtime`,
      createdAt: Date.now(),
    };
  }

  if (bigMoments && game.phase === 'CLUTCH') {
    return {
      id: `ctx-clutch-${game.id}-${Date.now()}`,
      type: 'CLUTCH',
      gameId: game.id,
      teamAbbr: leader,
      opponentAbbr: trailer,
      timestampText: `Q${game.quarter} • ${game.clock}`,
      headline:
        diff === 0
          ? `Tie game ${game.awayScore}-${game.homeScore} in crunch time`
          : `${diff} point game. ${leader} leading`,
      createdAt: Date.now(),
    };
  }

  if (
    bigMoments &&
    game.runPoints &&
    game.runPoints > 4 &&
    game.activeRunTeam &&
    (game.phase === 'LIVE' || game.phase === 'CLUTCH' || game.phase === 'OVERTIME')
  ) {
    const runTeam = game.activeRunTeam;
    const opp = runTeam === game.awayTeam ? game.homeTeam : game.awayTeam;
    return {
      id: `ctx-run-${game.id}-${Date.now()}`,
      type: 'RUN',
      gameId: game.id,
      teamAbbr: runTeam,
      opponentAbbr: opp,
      timestampText: `Q${game.quarter} • ${game.clock}`,
      headline: `${runTeam} on a ${game.runPoints}-0 run • ${
        diff === 0 ? 'Tied up' : `${leader} up ${diff}`
      }`,
      awayScore: game.awayScore,
      homeScore: game.homeScore,
      createdAt: Date.now(),
    };
  }

  if (
    everyBucket &&
    (game.phase === 'LIVE' || game.phase === 'CLUTCH' || game.phase === 'OVERTIME') &&
    game.lastPlayShort
  ) {
    return {
      id: `ctx-bucket-${game.id}-${Date.now()}`,
      type: 'BUCKET',
      gameId: game.id,
      teamAbbr: leader,
      opponentAbbr: trailer,
      timestampText: `Q${game.quarter} • ${game.clock}`,
      headline: game.lastPlayShort,
      awayScore: game.awayScore,
      homeScore: game.homeScore,
      createdAt: Date.now(),
    };
  }

  if (
    bigMoments &&
    (game.phase === 'LIVE' || game.phase === 'CLUTCH')
  ) {
    return {
      id: `ctx-live-${game.id}-${Date.now()}`,
      type: diff <= 5 ? 'LEAD_CHANGE' : 'RUN',
      gameId: game.id,
      teamAbbr: leader,
      opponentAbbr: trailer,
      timestampText: `Q${game.quarter} • ${game.clock}`,
      headline:
        diff === 0
          ? `${game.awayTeam} and ${game.homeTeam} tied ${game.awayScore}-${game.homeScore}`
          : `${leader} leads ${trailer} ${Math.max(
              game.awayScore,
              game.homeScore
            )}-${Math.min(game.awayScore, game.homeScore)}`,
      awayScore: game.awayScore,
      homeScore: game.homeScore,
      createdAt: Date.now(),
    };
  }

  if (finalScore && game.phase === 'FINAL') {
    if (game.mvp) {
      return {
        id: `ctx-mvp-${game.id}-${Date.now()}`,
        type: 'MVP',
        gameId: game.id,
        teamAbbr: game.mvp.teamAbbr || leader,
        opponentAbbr: trailer,
        timestampText: 'MVP',
        headline: `${game.mvp.name} ${game.mvp.jersey}`,
        subline: `${game.mvp.pts} PTS • ${game.mvp.reb} REB • ${game.mvp.ast} AST`,
        createdAt: Date.now(),
      };
    }
    return {
      id: `ctx-final-${game.id}-${Date.now()}`,
      type: 'FINAL',
      gameId: game.id,
      teamAbbr: leader,
      opponentAbbr: trailer,
      timestampText: 'FINAL',
      headline: `${leader} takes the win over ${trailer}`,
      awayScore: Math.max(game.awayScore, game.homeScore),
      homeScore: Math.min(game.awayScore, game.homeScore),
      createdAt: Date.now(),
    };
  }

  // Tip-off alert ONLY when the game is actively starting (Quarter 1 opening minutes)
  if (
    tipOff &&
    (game.phase === 'LIVE' || game.phase === 'CLUTCH') &&
    game.quarter === 1 &&
    typeof game.clock === 'string' &&
    (game.clock.startsWith('12:') || game.clock.startsWith('11:'))
  ) {
    return {
      id: `ctx-tipoff-${game.id}-${Date.now()}`,
      type: 'TIP_OFF',
      gameId: game.id,
      teamAbbr: game.awayTeam,
      opponentAbbr: game.homeTeam,
      timestampText: 'Just tipped off',
      headline: `${game.awayTeam} • ${game.homeTeam}`,
      createdAt: Date.now(),
    };
  }

  return null;
}
