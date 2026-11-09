import React, { useEffect, useState } from 'react';
import {
  AppStateSnapshot,
  getInitialSnapshot,
  loadState,
  saveState,
  subscribeToState,
} from './services/storageService';
import { PopupApp } from './popup/PopupApp';
import { FloatingGameCard } from './components/FloatingGameCard';
import { SmartAlertToast } from './components/SmartAlertToast';
import { OnboardingFlow } from './components/OnboardingFlow';
import { FloatingWidgetContainer } from './components/FloatingWidgetContainer';
import {
  FIGMA_GAMES_LIVE,
  FIGMA_SMART_ALERTS,
  getFigmaGamePreset,
} from './data/mockFigmaData';
import {
  evaluateLivePhase,
  tickLiveGamesOneSecond,
} from './services/espnNbaService';
import { AlertType } from './types/nba';

export const PlaygroundApp: React.FC = () => {
  const [snapshot, setSnapshot] = useState<AppStateSnapshot>(
    getInitialSnapshot()
  );
  const [activeTab, setActiveTab] = useState<
    'interactive' | 'all_frames'
  >('interactive');
  const [autoSimulating, setAutoSimulating] = useState(false);

  useEffect(() => {
    loadState().then(setSnapshot);
    return subscribeToState(setSnapshot);
  }, []);

  // Real-time 1-second game clock countdown + automatic CLUTCH trigger (Q4 <= 2:00 & diff <= 5)
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setSnapshot((prev) => {
        const nextGames = tickLiveGamesOneSecond(prev.games);
        if (nextGames === prev.games) return prev;
        saveState({ games: nextGames });
        return { ...prev, games: nextGames };
      });
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const toggleTimeout = () => {
    const target =
      snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
      snapshot.games[0];
    if (!target) return;
    const isNowTimeout = !target.isTimeout;
    const desc = isNowTimeout ? `${target.awayTeam} Full timeout` : undefined;
    const updatedGame = {
      ...target,
      isTimeout: isNowTimeout,
      lastPlayShort: desc || target.lastPlayShort,
      lastPlays: isNowTimeout
        ? [
            {
              id: `to-${Date.now()}`,
              clock: target.clock || '3:45',
              quarter: target.quarter || 3,
              teamAbbr: target.awayTeam,
              description: desc!,
              isScoringPlay: false,
            },
            ...target.lastPlays.slice(0, 2),
          ]
        : target.lastPlays,
    };
    const updatedGames = snapshot.games.map((g) =>
      g.id === updatedGame.id ? updatedGame : g
    );
    saveState({ games: updatedGames });
  };

  const jumpToPreClutch = () => {
    const target =
      snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
      snapshot.games[0];
    if (!target) return;

    const updatedGame = {
      ...target,
      phase: 'LIVE' as const,
      quarter: 4,
      clock: '2:03',
      awayScore: 101,
      homeScore: 99,
      clutchNote: '2 point game • 3 lead changes in 2 min',
    };
    const updatedGames = snapshot.games.map((g) =>
      g.id === updatedGame.id ? updatedGame : g
    );
    saveState({ games: updatedGames });
  };

  const simulateBucket = (scoringSide: 'away' | 'home', pts: 2 | 3) => {
    const target =
      snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
      snapshot.games[0];
    if (!target) return;

    const newAway =
      scoringSide === 'away' ? target.awayScore + pts : target.awayScore;
    const newHome =
      scoringSide === 'home' ? target.homeScore + pts : target.homeScore;
    const newDiff = newAway - newHome;

    const prevHistory =
      target.scoreHistory.length >= 2
        ? target.scoreHistory
        : [
            { progress: 0, diff: 0 },
            { progress: 0.1, diff: 0 },
          ];
    const lastProg = prevHistory[prevHistory.length - 1].progress;
    const nextProg = Math.min(0.99, lastProg + 0.045);

    const scoringTeamAbbr =
      scoringSide === 'away' ? target.awayTeam : target.homeTeam;
    const isContinuingRun = target.activeRunTeam === scoringTeamAbbr;
    const nextRunPoints = isContinuingRun ? (target.runPoints || 0) + pts : pts;
    const nextRunText =
      nextRunPoints > 4 ? `${scoringTeamAbbr} ${nextRunPoints}-0 run` : undefined;

    const playDescriptions =
      pts === 3
        ? [
            'step-back 3-pointer',
            'pull-up three',
            'corner three splash',
          ]
        : [
            'driving layup',
            'fast-break dunk',
            'mid-range jumper',
          ];
    const desc = `${scoringTeamAbbr} ${
      playDescriptions[Math.floor(Math.random() * playDescriptions.length)]
    }`;

    const q = target.quarter || 3;
    const clk = target.clock || '3:45';
    const nextPhase =
      target.phase === 'FINAL'
        ? ('FINAL' as const)
        : evaluateLivePhase(q, clk, newAway, newHome);

    const updatedGame = {
      ...target,
      phase: nextPhase,
      awayScore: newAway,
      homeScore: newHome,
      possession: scoringSide === 'away' ? ('home' as const) : ('away' as const),
      activeRunTeam: scoringTeamAbbr,
      runPoints: nextRunPoints,
      activeRunText: nextRunText,
      lastPlayShort: desc,
      scoreHistory: [
        ...prevHistory,
        { progress: nextProg, diff: newDiff },
      ],
      lastPlays: [
        {
          id: `sim-${Date.now()}`,
          clock: target.clock || '3:45',
          quarter: target.quarter || 3,
          teamAbbr: scoringTeamAbbr,
          description: desc,
          isScoringPlay: true,
          pointsScored: pts,
        },
        ...target.lastPlays.slice(0, 2),
      ],
    };

    const updatedGames = snapshot.games.map((g) =>
      g.id === updatedGame.id ? updatedGame : g
    );
    saveState({ games: updatedGames });
  };

  const simulateCallout = (kind: 'foul' | 'defense') => {
    const target =
      snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
      snapshot.games[0];
    if (!target) return;

    const side: 'away' | 'home' =
      target.possession === 'away' ? 'away' : 'home';
    const otherSide: 'away' | 'home' = side === 'away' ? 'home' : 'away';
    const teamAbbr = side === 'away' ? target.awayTeam : target.homeTeam;
    const otherAbbr = otherSide === 'away' ? target.awayTeam : target.homeTeam;

    const shooterLeader =
      target.leaders.find((l) => l.teamAbbr === otherAbbr) ||
      target.leaders[0];
    const shooterName = shooterLeader ? shooterLeader.name : otherAbbr;

    if (kind === 'foul') {
      const ftPoints = 2;
      const newAway =
        otherSide === 'away' ? target.awayScore + ftPoints : target.awayScore;
      const newHome =
        otherSide === 'home' ? target.homeScore + ftPoints : target.homeScore;
      const newDiff = newAway - newHome;

      const prevHistory =
        target.scoreHistory.length >= 2
          ? target.scoreHistory
          : [
              { progress: 0, diff: 0 },
              { progress: 0.1, diff: 0 },
            ];
      const lastProg = prevHistory[prevHistory.length - 1].progress;
      const nextProg = Math.min(0.99, lastProg + 0.035);

      const isContinuingRun = target.activeRunTeam === otherAbbr;
      const nextRunPoints = isContinuingRun
        ? (target.runPoints || 0) + ftPoints
        : ftPoints;
      const nextRunText =
        nextRunPoints > 4
          ? `${otherAbbr} ${nextRunPoints}-0 run`
          : undefined;

      const desc = `${shooterName} makes 2 of 2 free throws`;
      const foulDesc = `${teamAbbr} shooting foul`;

      const q = target.quarter || 3;
      const clk = target.clock || '3:45';
      const nextPhase =
        target.phase === 'FINAL'
          ? ('FINAL' as const)
          : evaluateLivePhase(q, clk, newAway, newHome);

      const updatedGame = {
        ...target,
        phase: nextPhase,
        awayScore: newAway,
        homeScore: newHome,
        possession: side,
        activeRunTeam: otherAbbr,
        runPoints: nextRunPoints,
        activeRunText: nextRunText,
        lastPlayShort: desc,
        scoreHistory: [
          ...prevHistory,
          { progress: nextProg, diff: newDiff },
        ],
        lastPlays: [
          {
            id: `sim-ft-${Date.now()}`,
            clock: clk,
            quarter: q,
            teamAbbr: otherAbbr,
            description: desc,
            isScoringPlay: true,
            pointsScored: ftPoints,
          },
          {
            id: `sim-foul-${Date.now() - 1}`,
            clock: clk,
            quarter: q,
            teamAbbr: teamAbbr,
            description: foulDesc,
            isScoringPlay: false,
            pointsScored: 0,
          },
          ...target.lastPlays.slice(0, 1),
        ],
      };

      const updatedGames = snapshot.games.map((g) =>
        g.id === updatedGame.id ? updatedGame : g
      );
      saveState({ games: updatedGames });
      return;
    }

    const defenseTexts = [
      `${otherAbbr} steal and fast-break possession`,
      `${otherAbbr} block at the rim, defensive rebound`,
      `${teamAbbr} offensive rebound, reset shot clock`,
    ];
    const desc = defenseTexts[Math.floor(Math.random() * defenseTexts.length)];

    const updatedGame = {
      ...target,
      phase: target.phase === 'SCHEDULED' ? ('LIVE' as const) : target.phase,
      possession: side,
      lastPlayShort: desc,
      lastPlays: [
        {
          id: `sim-call-${Date.now()}`,
          clock: target.clock || '3:45',
          quarter: target.quarter || 3,
          teamAbbr: otherAbbr,
          description: desc,
          isScoringPlay: false,
          pointsScored: 0,
        },
        ...target.lastPlays.slice(0, 2),
      ],
    };

    const updatedGames = snapshot.games.map((g) =>
      g.id === updatedGame.id ? updatedGame : g
    );
    saveState({ games: updatedGames });
  };

  useEffect(() => {
    if (!autoSimulating) return;
    const timer = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.2) {
        simulateCallout('foul');
      } else if (roll < 0.35) {
        simulateCallout('defense');
      } else {
        const side: 'away' | 'home' = Math.random() > 0.45 ? 'away' : 'home';
        const pts: 2 | 3 = Math.random() > 0.6 ? 3 : 2;
        simulateBucket(side, pts);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [autoSimulating, snapshot]);

  const triggerAlert = (type: AlertType) => {
    const alertObj = {
      ...FIGMA_SMART_ALERTS[type],
      id: `${type}-${Date.now()}`,
      createdAt: Date.now(),
    };
    saveState({ activeAlert: alertObj });
  };

  const pinnedGame =
    snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
    snapshot.games[0];

  return (
    <div
      className="cp-root"
      style={{
        minHeight: '100vh',
        background: '#1C1D22',
        color: '#FFFFFF',
        padding: '28px 32px 120px 32px',
      }}
    >
      {/* Top Studio Header */}
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto 28px auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          padding: '16px 24px',
          background: '#0F1013',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'linear-gradient(225deg, #EB1616 0%, #1E14EA 100%)',
            }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>
              CherryPick — NBA Chrome Extension Studio
            </div>
            <div style={{ color: '#9B9CA6', fontSize: 13, marginTop: 2 }}>
              Popup Control Center + Draggable Floating PiP Widget + Live ESPN
              NBA Feed
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className={`cp-mini-action-btn ${
              activeTab === 'interactive' ? 'cp-mini-action-btn-active' : ''
            }`}
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => setActiveTab('interactive')}
          >
            Interactive Extension & PiP
          </button>
          <button
            type="button"
            className={`cp-mini-action-btn ${
              activeTab === 'all_frames' ? 'cp-mini-action-btn-active' : ''
            }`}
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => setActiveTab('all_frames')}
          >
            All Figma Frames Canvas
          </button>
        </div>
      </div>

      {activeTab === 'interactive' ? (
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Column 1: Chrome Extension Toolbar Popup */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 394,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#9B9CA6',
                  textTransform: 'uppercase',
                }}
              >
                1. Toolbar Popup (Click game or Gear icon)
              </span>
              <span style={{ fontSize: 12, color: '#5C5C65' }}>
                Frames 5, 47, 6
              </span>
            </div>
            <PopupApp />
          </div>

          {/* Column 2: Floating Card Variants & Expanded View */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                width: 394,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#9B9CA6',
                  textTransform: 'uppercase',
                }}
              >
                2. Expanded Live Game View (Frame 4)
              </span>
              <span style={{ fontSize: 12, color: '#5C5C65' }}>
                Click card to collapse
              </span>
            </div>
            {pinnedGame && (
              <>
                <FloatingGameCard
                  game={pinnedGame}
                  expanded={false}
                  onToggleExpand={() =>
                    saveState({
                      settings: {
                        ...snapshot.settings,
                        overlayExpanded: !snapshot.settings.overlayExpanded,
                      },
                    })
                  }
                />
                <FloatingGameCard
                  game={pinnedGame}
                  expanded={true}
                  onToggleExpand={() =>
                    saveState({
                      settings: {
                        ...snapshot.settings,
                        overlayExpanded: !snapshot.settings.overlayExpanded,
                      },
                    })
                  }
                />
                {/* Real-Time Graph Animation Controls */}
                <div
                  style={{
                    width: 394,
                    background: '#0F1013',
                    borderRadius: 16,
                    padding: '12px 16px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#9B9CA6',
                        textTransform: 'uppercase',
                      }}
                    >
                      Real-Time Graph Animator
                    </span>
                    <button
                      type="button"
                      className={`cp-mini-action-btn ${
                        autoSimulating ? 'cp-mini-action-btn-active' : ''
                      }`}
                      onClick={() => setAutoSimulating((v) => !v)}
                    >
                      {autoSimulating ? '⏸ Stop Live Sim' : '▶ Auto-Sim Live'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      onClick={() => simulateBucket('away', 2)}
                    >
                      +2 {pinnedGame.awayTeam}
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      onClick={() => simulateBucket('away', 3)}
                    >
                      +3 {pinnedGame.awayTeam}
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      onClick={() => simulateBucket('home', 2)}
                    >
                      +2 {pinnedGame.homeTeam}
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      onClick={() => simulateBucket('home', 3)}
                    >
                      +3 {pinnedGame.homeTeam}
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      onClick={() => simulateCallout('foul')}
                    >
                      Foul / Turnover
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      onClick={() => simulateCallout('defense')}
                    >
                      Steal / Block
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      style={{
                        background: 'rgba(255, 206, 126, 0.16)',
                        color: '#FFCE7E',
                      }}
                      onClick={jumpToPreClutch}
                    >
                      ⏱ Q4 • 2:03 (Watch Clutch)
                    </button>
                    <button
                      type="button"
                      className="cp-mini-action-btn"
                      style={
                        pinnedGame.isTimeout
                          ? {
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#ef4444',
                              borderColor: '#ef4444',
                            }
                          : undefined
                      }
                      onClick={toggleTimeout}
                    >
                      {pinnedGame.isTimeout ? '⏸ In Timeout' : '⏸ Call Timeout'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Column 3: Smart Alerts Trigger Panel & Compact Card States */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                width: 394,
                background: '#0F1013',
                borderRadius: 20,
                padding: 16,
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#9B9CA6',
                  textTransform: 'uppercase',
                }}
              >
                3. Trigger Smart Alerts on Floating PiP Widget
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(
                  [
                    'CLUTCH',
                    'LEAD_CHANGE',
                    'RUN',
                    'OVERTIME',
                    'TIP_OFF',
                    'FINAL',
                    'MVP',
                  ] as AlertType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`cp-mini-action-btn ${
                      snapshot.activeAlert?.type === type
                        ? 'cp-mini-action-btn-active'
                        : ''
                    }`}
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => triggerAlert(type)}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
                {snapshot.activeAlert && (
                  <button
                    type="button"
                    className="cp-mini-action-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      color: '#E04F54',
                    }}
                    onClick={() => saveState({ activeAlert: null })}
                  >
                    Clear Alert
                  </button>
                )}
              </div>
            </div>

            {/* Compact Card States Preview (Frames 46, 1, 3) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <FloatingGameCard
                game={getFigmaGamePreset('clutch')}
                expanded={false}
              />
              <FloatingGameCard
                game={getFigmaGamePreset('live_101_99')}
                expanded={false}
              />
              <FloatingGameCard
                game={getFigmaGamePreset('final')}
                expanded={false}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ALL FIGMA FRAMES CANVAS VIEW */
        <div
          style={{
            maxWidth: 1680,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 48,
          }}
        >
          {/* Section A: Smart Alert Toast Cards (Frames 54, 45, 51, 52, 53, 55, 56) */}
          <div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#9B9CA6',
                marginBottom: 16,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Smart Alert Notification Cards (Frames 54, 45, 51, 52, 53, 55, 56)
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.OVERTIME} />
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.LEAD_CHANGE} />
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.TIP_OFF} />
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.RUN} />
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.CLUTCH} />
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.FINAL} />
              <SmartAlertToast alert={FIGMA_SMART_ALERTS.MVP} />
            </div>
          </div>

          {/* Section B: Onboarding Flow (Frames 2, 48, 49, 50) */}
          <div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#9B9CA6',
                marginBottom: 16,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Onboarding & Preferences Flow (Frames 2, 48, 49, 50)
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                alignItems: 'flex-end',
              }}
            >
              <OnboardingFlow
                initialStep={0}
                favoriteTeam="PHI"
                notifications={snapshot.settings.notifications}
                games={FIGMA_GAMES_LIVE}
                onComplete={() => {}}
              />
              <OnboardingFlow
                initialStep={1}
                favoriteTeam="PHI"
                notifications={snapshot.settings.notifications}
                games={FIGMA_GAMES_LIVE}
                onComplete={() => {}}
              />
              <OnboardingFlow
                initialStep={2}
                favoriteTeam="PHI"
                notifications={snapshot.settings.notifications}
                games={FIGMA_GAMES_LIVE}
                onComplete={() => {}}
              />
              <OnboardingFlow
                initialStep={3}
                favoriteTeam="PHI"
                notifications={snapshot.settings.notifications}
                games={FIGMA_GAMES_LIVE}
                onComplete={() => {}}
              />
            </div>
          </div>

          {/* Section C: Floating Cards & Popup Screens (Frames 46, 1, 3, 4) */}
          <div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#9B9CA6',
                marginBottom: 16,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Floating Game Cards — Compact & Expanded (Frames 46, 1, 3, 4)
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                alignItems: 'flex-start',
              }}
            >
              <FloatingGameCard
                game={getFigmaGamePreset('live_101_99')}
                expanded={false}
              />
              <FloatingGameCard
                game={getFigmaGamePreset('clutch')}
                expanded={false}
              />
              <FloatingGameCard
                game={getFigmaGamePreset('final')}
                expanded={false}
              />
              <FloatingGameCard
                game={getFigmaGamePreset('live_q3')}
                expanded={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Draggable Floating PiP Overlay in Bottom-Right of Window */}
      {snapshot.settings.overlayVisible && pinnedGame && (
        <FloatingWidgetContainer
          game={pinnedGame}
          expanded={snapshot.settings.overlayExpanded}
          activeAlert={snapshot.activeAlert}
          onToggleExpand={() =>
            saveState({
              settings: {
                ...snapshot.settings,
                overlayExpanded: !snapshot.settings.overlayExpanded,
              },
            })
          }
          onDismissAlert={() => saveState({ activeAlert: null })}
          onCycleState={(phase) => {
            const presetKey =
              phase === 'CLUTCH'
                ? 'clutch'
                : phase === 'FINAL'
                ? 'final'
                : 'live_101_99';
            const presetGame = getFigmaGamePreset(presetKey);
            const updatedGames = FIGMA_GAMES_LIVE.map((g, idx) =>
              idx === 0 ? presetGame : g
            );
            saveState({
              games: updatedGames,
              settings: {
                ...snapshot.settings,
                dataSourceMode: 'figma_demo',
                pinnedGameId: presetGame.id,
              },
            });
          }}
        />
      )}
    </div>
  );
};

