import React from 'react';
import { NbaGame, UserSettings } from '../types/nba';
import { getTeamInfo } from '../data/teams';
import { formatLiveClockDisplay } from '../services/espnNbaService';

interface PopupDashboardProps {
  games: NbaGame[];
  settings: UserSettings;
  onSelectGame: (gameId: string) => void;
  onOpenSettings: () => void;
}

export const PopupDashboard: React.FC<PopupDashboardProps> = ({
  games,
  settings,
  onSelectGame,
  onOpenSettings,
}) => {
  const favAbbr = settings.favoriteTeam || 'PHI';

  // Find Hero "MY TEAM" game (prefer today's game if playing both days, otherwise tomorrow's)
  const heroGame =
    games.find(
      (g) =>
        (g.awayTeam === favAbbr || g.homeTeam === favAbbr) &&
        g.dayLabel !== 'TOMORROW'
    ) ||
    games.find((g) => g.awayTeam === favAbbr || g.homeTeam === favAbbr) ||
    games[0];

  const otherGames = games.filter((g) => g.id !== heroGame?.id);
  const todayOthers = otherGames.filter((g) => g.dayLabel !== 'TOMORROW');
  const tomorrowOthers = otherGames.filter((g) => g.dayLabel === 'TOMORROW');

  const todayTotalCount = games.filter((g) => g.dayLabel !== 'TOMORROW').length;
  const tomorrowTotalCount = games.filter(
    (g) => g.dayLabel === 'TOMORROW'
  ).length;

  const heroAwayInfo = heroGame
    ? getTeamInfo(heroGame.awayTeam)
    : getTeamInfo('PHI');
  const heroHomeInfo = heroGame
    ? getTeamInfo(heroGame.homeTeam)
    : getTeamInfo('NYK');
  const favTeamInfo = getTeamInfo(favAbbr);

  const heroAwayLeading = heroGame
    ? heroGame.awayScore >= heroGame.homeScore
    : true;
  const heroHomeLeading = heroGame
    ? heroGame.homeScore > heroGame.awayScore
    : false;
  const heroWinnerInfo = heroAwayLeading ? heroAwayInfo : heroHomeInfo;

  const isHeroGlowActive =
    heroGame?.phase === 'CLUTCH' ||
    heroGame?.phase === 'FINAL';
  let heroGlowBackground =
    'radial-gradient(89.17% 100% at 50.86% 0%, rgba(255, 206, 126, 0.22) 0%, rgba(15, 16, 19, 0.2) 100%)';
  if (heroGame?.phase === 'FINAL') {
    heroGlowBackground = heroWinnerInfo.glowGradient;
  }

  let heroBackground = `linear-gradient(#0F1013, #0F1013) padding-box, ${favTeamInfo.gradient} border-box`;
  let heroBorder = '1.5px solid transparent';
  if (heroGame?.phase === 'CLUTCH') {
    heroBackground = '#0F1013';
    heroBorder = '1px solid rgba(255, 206, 126, 0.25)';
  } else if (heroGame?.phase === 'FINAL') {
    heroBackground = '#0F1013';
    heroBorder = '1px solid rgba(255, 255, 255, 0.08)';
  } else if (heroGame?.phase === 'OVERTIME') {
    heroBackground = '#0F1013';
    heroBorder = '1px solid rgba(255, 255, 255, 0.16)';
  }

  const renderGameListItem = (g: NbaGame) => {
    const awayInfo = getTeamInfo(g.awayTeam);
    const homeInfo = getTeamInfo(g.homeTeam);
    const isScheduled = g.phase === 'SCHEDULED';
    const awayLead = g.awayScore >= g.homeScore;
    const homeLead = g.homeScore > g.awayScore;
    const isPinned = settings.pinnedGameId === g.id;

    return (
      <div
        key={g.id}
        className={`cp-surface-card ${
          isPinned ? 'cp-surface-card-active' : ''
        }`}
        style={{ height: 98, flexShrink: 0 }}
        onClick={() => onSelectGame(g.id)}
      >
        {/* Left Teams & Scores Column (220-228px wide, gap 8px) */}
        <div className="cp-col" style={{ width: 216, gap: 8 }}>
          {/* Away Row */}
          <div className="cp-row-between" style={{ height: 29 }}>
            <div className="cp-row-center" style={{ gap: 8 }}>
              <div
                className="cp-team-square"
                style={{ background: awayInfo.gradient }}
              />
              <span className="cp-team-abbr">{g.awayTeam}</span>
              {g.possession === 'away' &&
                !isScheduled &&
                g.phase !== 'FINAL' && <div className="cp-possession-dot" />}
            </div>
            {!isScheduled && (
              <span
                key={`list-away-${g.id}-${g.awayScore}`}
                className={`cp-score-24 cp-anim-score-bump ${
                  awayLead ? 'cp-score-leading' : 'cp-score-trailing'
                }`}
              >
                {g.awayScore}
              </span>
            )}
          </div>

          {/* Home Row */}
          <div className="cp-row-between" style={{ height: 29 }}>
            <div className="cp-row-center" style={{ gap: 8 }}>
              <div
                className="cp-team-square"
                style={{ background: homeInfo.gradient }}
              />
              <span className="cp-team-abbr">{g.homeTeam}</span>
              {g.possession === 'home' &&
                !isScheduled &&
                g.phase !== 'FINAL' && <div className="cp-possession-dot" />}
            </div>
            {!isScheduled && (
              <span
                key={`list-home-${g.id}-${g.homeScore}`}
                className={`cp-score-24 cp-anim-score-bump ${
                  homeLead ? 'cp-score-leading' : 'cp-score-trailing'
                }`}
              >
                {g.homeScore}
              </span>
            )}
          </div>
        </div>

        {/* Right Status Indicator */}
        <div
          className="cp-row-center"
          style={{ justifyContent: 'flex-end', flexShrink: 0 }}
        >
          {g.phase === 'LIVE' ||
          g.phase === 'CLUTCH' ||
          g.phase === 'OVERTIME' ? (
            <div className="cp-live-badge">
              <div className="cp-live-dot-outer">
                <div className="cp-live-dot-inner" />
              </div>
              <span className="cp-live-clock-red">
                {formatLiveClockDisplay(
                  g.quarter,
                  g.clock,
                  g.phase,
                  Boolean(
                    g.isTimeout ||
                      /timeout/i.test(g.clock || '') ||
                      (g.lastPlayShort && /timeout/i.test(g.lastPlayShort))
                  ),
                  g.stoppageReason,
                  g.stoppageDetail
                )}
              </span>
            </div>
          ) : g.phase === 'FINAL' ? (
            <span className="cp-text-muted">FINAL</span>
          ) : (
            <span className="cp-text-muted">
              {g.startTimeText || '5:00 PM EST'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="cp-card cp-step-card-anim"
      style={{
        height: 652,
        maxHeight: 652,
      }}
    >
      {/* Frame 50: Header Row (362x51px) */}
      <div className="cp-row-between" style={{ height: 51, flexShrink: 0 }}>
        <div className="cp-col" style={{ gap: 4, width: 'auto' }}>
          <span className="cp-heading-24">CherryPick</span>
          <span className="cp-text-muted">
            {tomorrowTotalCount > 0
              ? `${todayTotalCount} games tonight • ${tomorrowTotalCount} tomorrow`
              : `${games.length} games tonight`}
          </span>
        </div>

        {/* Frame 49: Settings Gear Button (51x51px, #15161A, border-radius 16px) */}
        <button
          type="button"
          className="cp-icon-btn"
          title="Team & Notification Settings"
          onClick={onOpenSettings}
        >
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Scrollable Games Feed (Hero Card + Today + Tomorrow Upcoming) */}
      <div
        className="cp-col cp-scroll-clean"
        style={{
          gap: 16,
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          minHeight: 0,
          width: '100%',
          padding: '2px 4px',
          margin: '0 -4px',
          boxSizing: 'border-box',
        }}
      >
        {/* Frame 36: Featured Hero Card */}
        {heroGame && (
          <div
            className="cp-hero-card"
            style={{
              minHeight:
                heroGame.phase === 'SCHEDULED'
                  ? undefined
                  : heroGame.phase === 'FINAL'
                  ? 185
                  : 197,
              background: heroBackground,
              border: heroBorder,
              flexShrink: 0,
            }}
            onClick={() => onSelectGame(heroGame.id)}
          >
            <div
              className={`cp-card-glow-layer ${
                isHeroGlowActive ? 'cp-card-glow-layer-active' : ''
              }`}
              style={{ background: heroGlowBackground }}
            />
            {/* Top Row inside Hero Card (Frame 35 / Frame 37) */}
            {heroGame.phase === 'CLUTCH' ? (
              <div className="cp-row-between" style={{ height: 29 }}>
                <span className="cp-pill cp-pill-gold cp-anim-clutch-pill">
                  CLUTCH
                </span>
                <span className="cp-clutch-clock cp-anim-clutch-clock">
                  {formatLiveClockDisplay(
                    heroGame.quarter,
                    heroGame.clock,
                    heroGame.phase,
                    Boolean(
                      heroGame.isTimeout ||
                        /timeout/i.test(heroGame.clock || '') ||
                        (heroGame.lastPlayShort &&
                          /timeout/i.test(heroGame.lastPlayShort))
                    ),
                    heroGame.stoppageReason,
                    heroGame.stoppageDetail
                  )}
                </span>
              </div>
            ) : heroGame.phase === 'FINAL' ? (
              <div className="cp-row-between" style={{ height: 17 }}>
                <span className="cp-text-white-14-semi">FINAL</span>
              </div>
            ) : (
              <div className="cp-row-between" style={{ height: 25 }}>
                <span
                  className="cp-pill cp-pill-team"
                  style={{ background: favTeamInfo.gradient }}
                >
                  MY TEAM
                </span>
                {heroGame.phase === 'SCHEDULED' ? (
                  <span className="cp-text-muted">
                    {heroGame.startTimeText || '5:00 PM EST'}
                  </span>
                ) : (
                  <div className="cp-live-badge">
                    <div className="cp-live-dot-outer">
                      <div className="cp-live-dot-inner" />
                    </div>
                    <span className="cp-live-clock-red">
                      {formatLiveClockDisplay(
                        heroGame.quarter,
                        heroGame.clock,
                        heroGame.phase,
                        Boolean(
                          heroGame.isTimeout ||
                            /timeout/i.test(heroGame.clock || '') ||
                            (heroGame.lastPlayShort &&
                              /timeout/i.test(heroGame.lastPlayShort))
                        ),
                        heroGame.stoppageReason,
                        heroGame.stoppageDetail
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Scores Stack (Frame 10: gap 8px & 29px rows when scheduled, gap 4px & 58px rows when live/final) */}
            <div
              className="cp-col"
              style={{ gap: heroGame.phase === 'SCHEDULED' ? 8 : 4 }}
            >
              <div
                className="cp-row-between"
                style={{ height: heroGame.phase === 'SCHEDULED' ? 29 : 58 }}
              >
                <div className="cp-row-center">
                  <div
                    className="cp-team-square"
                    style={{ background: heroAwayInfo.gradient }}
                  />
                  <span className="cp-team-abbr">{heroGame.awayTeam}</span>
                  {heroGame.possession === 'away' &&
                    heroGame.phase !== 'SCHEDULED' &&
                    heroGame.phase !== 'FINAL' && (
                      <div className="cp-possession-dot" />
                    )}
                </div>
                {heroGame.phase !== 'SCHEDULED' && (
                  <span
                    key={`hero-away-${heroGame.id}-${heroGame.awayScore}`}
                    className={`cp-score-48 cp-anim-score-bump ${
                      heroAwayLeading
                        ? 'cp-score-leading'
                        : 'cp-score-trailing'
                    }`}
                  >
                    {heroGame.awayScore}
                  </span>
                )}
              </div>

              <div
                className="cp-row-between"
                style={{ height: heroGame.phase === 'SCHEDULED' ? 29 : 58 }}
              >
                <div className="cp-row-center">
                  <div
                    className="cp-team-square"
                    style={{ background: heroHomeInfo.gradient }}
                  />
                  <span className="cp-team-abbr">{heroGame.homeTeam}</span>
                  {heroGame.possession === 'home' &&
                    heroGame.phase !== 'SCHEDULED' &&
                    heroGame.phase !== 'FINAL' && (
                      <div className="cp-possession-dot" />
                    )}
                </div>
                {heroGame.phase !== 'SCHEDULED' && (
                  <span
                    key={`hero-home-${heroGame.id}-${heroGame.homeScore}`}
                    className={`cp-score-48 cp-anim-score-bump ${
                      heroHomeLeading
                        ? 'cp-score-leading'
                        : 'cp-score-trailing'
                    }`}
                  >
                    {heroGame.homeScore}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Today's Games */}
        {todayOthers.map(renderGameListItem)}

        {/* Tomorrow's Upcoming Games */}
        {tomorrowOthers.length > 0 && (
          <>
            <div
              className="cp-row-between"
              style={{ paddingTop: 4, flexShrink: 0 }}
            >
              <span className="cp-text-muted">TOMORROW</span>
              <span className="cp-text-dim">
                {tomorrowOthers.length} upcoming
              </span>
            </div>
            {tomorrowOthers.map(renderGameListItem)}
          </>
        )}
      </div>
    </div>
  );
};
