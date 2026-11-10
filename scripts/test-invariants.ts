import {
  clockToSeconds,
  secondsToClock,
  formatLiveClockDisplay,
  tickLiveGamesOneSecond,
  mergeGamesMonotonically,
} from '../src/services/espnNbaService';
import { NbaGame } from '../src/types/nba';

console.log('--- 1. Testing formatLiveClockDisplay ---');
console.log('Running Q4:', formatLiveClockDisplay(4, '4:10', 'LIVE', false, null, null));
console.log('Free Throws Q4:', formatLiveClockDisplay(4, '4:10', 'LIVE', false, 'Free Throws', 'Free Throws'));
console.log('Throw-in Q4:', formatLiveClockDisplay(4, '4:10', 'LIVE', false, 'Throw-in', 'Throw-in'));
console.log('Timeout Q4:', formatLiveClockDisplay(4, '4:10', 'LIVE', true, 'Timeout', 'Timeout'));
console.log('Clutch running:', formatLiveClockDisplay(4, '1:48', 'CLUTCH', false, null, null));
console.log('Clutch stoppage:', formatLiveClockDisplay(4, '1:48', 'CLUTCH', false, 'Free Throws', 'Free Throws'));

if (formatLiveClockDisplay(4, '4:10', 'LIVE', false, 'Free Throws', 'Free Throws') !== 'Q4 • 4:10 • Free Throws') {
  throw new Error('FAILED: formatLiveClockDisplay does not include both clock and stoppage reason!');
}
if (formatLiveClockDisplay(4, '1:48', 'CLUTCH', false, 'Free Throws', 'Free Throws') !== '1:48 • Free Throws') {
  throw new Error('FAILED: Clutch formatLiveClockDisplay failed!');
}

console.log('--- 2. Testing Monotonic Clock Merge ---');
const prevGame: NbaGame = {
  id: '1',
  phase: 'LIVE',
  quarter: 4,
  clock: '4:05',
  awayTeam: 'PHI',
  homeTeam: 'NYK',
  awayScore: 102,
  homeScore: 99,
  momentumValue: 0,
  scoreHistory: [],
  leaders: [],
  lastPlays: [{ id: 'p1', clock: '4:05', quarter: 4, teamAbbr: 'PHI', description: 'Prev play', isScoringPlay: false }],
  lastPlayShort: 'Prev play',
};

// Incoming API response with older delayed clock 4:10 (ESPN cache)
const staleApiResponse: NbaGame = {
  ...prevGame,
  clock: '4:10',
};

const mergedStale = mergeGamesMonotonically([prevGame], [staleApiResponse]);
console.log('Merged stale clock (should remain 4:05):', mergedStale[0].clock);
if (mergedStale[0].clock !== '4:05') {
  throw new Error('FAILED: Clock jumped backwards!');
}

// Incoming API response with further clock 3:55
const freshApiResponse: NbaGame = {
  ...prevGame,
  clock: '3:55',
};
const mergedFresh = mergeGamesMonotonically([prevGame], [freshApiResponse]);
console.log('Merged fresh clock (should be 3:55):', mergedFresh[0].clock);
if (mergedFresh[0].clock !== '3:55') {
  throw new Error('FAILED: Fresh clock did not advance!');
}

console.log('--- 3. Testing Score and Play Lockstep ---');
// Scoreboard bumped to 104, but play text is still old non-scoring play
const prematureScoreboardResponse: NbaGame = {
  ...prevGame,
  clock: '4:00',
  awayScore: 104,
  homeScore: 99,
  lastPlays: [{ id: 'p1', clock: '4:00', quarter: 4, teamAbbr: 'PHI', description: 'Rebound play', isScoringPlay: false }],
  lastPlayShort: 'Rebound play',
};
const mergedScoreHold = mergeGamesMonotonically([prevGame], [prematureScoreboardResponse]);
console.log('Merged premature score (should hold at 102):', mergedScoreHold[0].awayScore);
if (mergedScoreHold[0].awayScore !== 102) {
  throw new Error('FAILED: Score bumped before play arrived!');
}

// Now confirmed play arrives with score 104
const confirmedScorePlayResponse: NbaGame = {
  ...prevGame,
  clock: '4:00',
  awayScore: 104,
  homeScore: 99,
  lastPlays: [{ id: 'p2', clock: '4:00', quarter: 4, teamAbbr: 'PHI', description: 'Devin Booker makes 18-ft jumper', isScoringPlay: true }],
  lastPlayShort: 'Devin Booker makes 18-ft jumper',
};
const mergedConfirmed = mergeGamesMonotonically([prevGame], [confirmedScorePlayResponse]);
console.log('Merged confirmed score & play (awayScore 104, play Devin Booker):', mergedConfirmed[0].awayScore, mergedConfirmed[0].lastPlayShort);
if (mergedConfirmed[0].awayScore !== 104 || mergedConfirmed[0].lastPlayShort !== 'Devin Booker makes 18-ft jumper') {
  throw new Error('FAILED: Score and play did not update in lockstep!');
}

console.log('--- 4. Testing Stoppage Holding in tickLiveGamesOneSecond ---');
let runningGame: NbaGame = {
  ...prevGame,
  clock: '4:10',
  isClockRunning: true,
};
const ticked1 = tickLiveGamesOneSecond([runningGame]);
console.log('Running tick 1 (should be 4:09):', ticked1[0].clock);
if (ticked1[0].clock !== '4:09') throw new Error('FAILED: Clock did not tick');

// Now whistle blows for Free Throws
runningGame = {
  ...runningGame,
  clock: '4:09',
  isClockRunning: false,
  stoppageReason: 'Free Throws',
  stoppageDetail: 'Free Throws',
};
const tickedFt = tickLiveGamesOneSecond([runningGame]);
console.log('Free throws tick (should HOLD at 4:09):', tickedFt[0].clock);
if (tickedFt[0].clock !== '4:09') throw new Error('FAILED: Clock ticked during Free Throws!');

console.log('\n>>> SUCCESS: ALL INVARIANTS VERIFIED 100% CORRECT! <<<');
