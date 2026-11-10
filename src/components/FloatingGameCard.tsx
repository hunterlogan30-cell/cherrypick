import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NbaGame } from '../types/nba';
import { getTeamInfo } from '../data/teams';
import {
  formatLiveClockDisplay,
  clockToSeconds,
  secondsToClock,
} from '../services/espnNbaService';
import { ScoreChart } from './ScoreChart';

interface FloatingGameCardProps {
  game: NbaGame;
  expanded: boolean;
  onToggleExpand?: () => void;
  onBack?: () => void;
}

export const FloatingGameCard: React.FC<FloatingGameCardProps> = ({
  game,
  expanded,
  onToggleExpand,
  onBack,
}) => {
  const awayInfo = getTeamInfo(game.awayTeam);
  const homeInfo = getTeamInfo(game.homeTeam);

  const innerRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (innerRef.current) {
        setCardHeight(Math.round(innerRef.current.getBoundingClientRect().height) + 32);
      }
    };

    updateHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        updateHeight();
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [expanded, game.id, game.phase, game.lastPlays.length, game.leaders.length, game.activeRunText, game.lastPlayShort]);

  const isScheduled = game.phase === 'SCHEDULED';
  const awayLeading = game.awayScore >= game.homeScore;
  const homeLeading = game.homeScore > game.awayScore;
  const winningInfo = awayLeading ? awayInfo : homeInfo;

  // Glow overlay applies to BOTH compact and expanded views and smoothly fades in on CLUTCH / FINAL
  const isGlowActive =
    game.phase === 'CLUTCH' ||
    game.phase === 'FINAL';
  let glowOverlayBackground =
    'radial-gradient(89.17% 100% at 50.86% 0%, rgba(255, 206, 126, 0.22) 0%, rgba(15, 16, 19, 0.2) 100%)';
  if (game.phase === 'FINAL') {
    glowOverlayBackground = winningInfo.glowGradient;
  }

  // Smooth 60fps real-time animation for the Momentum Bar (Frame 11)
  const targetScoreDiff = game.awayScore - game.homeScore;
  const [animatedDiff, setAnimatedDiff] = useState<number>(targetScoreDiff);
  const prevDiffRef = useRef<number>(targetScoreDiff);
  const rafBarRef = useRef<number | null>(null);

  useEffect(() => {
    const fromDiff = prevDiffRef.current;
    const toDiff = targetScoreDiff;
    if (Math.abs(fromDiff - toDiff) < 0.01) {
      setAnimatedDiff(toDiff);
      prevDiffRef.current = toDiff;
      return;
    }

    if (rafBarRef.current) cancelAnimationFrame(rafBarRef.current);
    const startTime = performance.now();
    const duration = 560;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - rawT, 3);
      const curr = fromDiff + (toDiff - fromDiff) * ease;
      setAnimatedDiff(curr);

      if (rawT < 1) {
        rafBarRef.current = requestAnimationFrame(tick);
      } else {
        setAnimatedDiff(toDiff);
        prevDiffRef.current = toDiff;
      }
    };

    rafBarRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafBarRef.current) cancelAnimationFrame(rafBarRef.current);
    };
  }, [targetScoreDiff]);

  const centerPx = 185;
  const isLeftMomentum = animatedDiff >= 0;
  const barWidth = Math.min(
    isLeftMomentum ? 185 : 175,
    Math.max(0, Math.abs(animatedDiff) * 12.12)
  );
  const fillLeft = isLeftMomentum
    ? centerPx - barWidth + 1.5
    : centerPx + 1.5;
  const fillBorderRadius = isLeftMomentum
    ? '39px 0px 0px 39px'
    : '0px 39px 39px 0px';
  const fillGradient = isLeftMomentum
    ? awayInfo.horizontalGradient
    : homeInfo.horizontalGradient;

  // Run pill ONLY appears when there is an active unanswered run > 4 points
  const hasActiveRun =
    !isScheduled &&
    game.phase !== 'FINAL' &&
    Boolean(game.activeRunText && game.activeRunText.trim().length > 0) &&
    (game.runPoints === undefined || game.runPoints > 4);
  const runTeamInfo = getTeamInfo(game.activeRunTeam || game.awayTeam);

  const getCalloutAnimClass = (
    text?: string,
    isScoringPlay?: boolean
  ): string => {
    const lower = (text || '').toLowerCase();
    if (
      isScoringPlay ||
      /makes|3-pointer|three|dunk|layup|jumper|free throw|splash|hook|fadeaway|alley-oop|tip-in|bank shot/i.test(
        lower
      )
    ) {
      return 'cp-anim-score-callout';
    }
    if (
      /foul|turnover|travel|violation|charge|technical|bad pass|lost ball|flagrant|goaltending/i.test(
        lower
      )
    ) {
      return 'cp-anim-foul-callout';
    }
    return 'cp-anim-play-callout';
  };

  const renderBackButton = () => {
    if (!onBack) return null;
    return (
      <button
        type="button"
        className="cp-back-arrow-btn"
        title="Back to game schedule"
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>
    );
  };

  // Shared Top Status Row for both Compact and Expanded cards
  const renderTopStatusRow = () => {
    const isTimeout = Boolean(
      game.isTimeout ||
        /timeout/i.test(game.clock || '') ||
        game.lastPlays?.some(
          (lp) =>
            lp.clock === game.clock && /timeout/i.test(lp.description || '')
        ) ||
        (game.lastPlays?.[0]?.description &&
          /timeout/i.test(game.lastPlays[0].description)) ||
        (game.lastPlayShort && /timeout/i.test(game.lastPlayShort))
    );

    let stoppageReason = game.stoppageReason;
    let stoppageDetail = game.stoppageDetail;

    if (!stoppageReason && !stoppageDetail) {
      if (isTimeout) {
        stoppageReason = 'Timeout';
        stoppageDetail = 'Timeout';
      } else if (game.isClockRunning === false) {
        const checkText = `${game.lastPlayShort || ''} ${game.lastPlays?.[0]?.description || ''}`;
        if (/free\s*throw|shooting\s*foul/i.test(checkText)) {
          stoppageReason = 'Free Throws';
          stoppageDetail = 'Free Throws';
        } else if (/throw-in|throwin|inbounds|out\s+of\s+bounds|turnover|violation|foul|substitution/i.test(checkText)) {
          stoppageReason = 'Throw-in';
          stoppageDetail = 'Throw-in';
        } else if (/review|challenge|replay/i.test(checkText)) {
          stoppageReason = 'Review';
          stoppageDetail = 'Review';
        } else if (/jump\s*ball|held\s*ball/i.test(checkText)) {
          stoppageReason = 'Jump Ball';
          stoppageDetail = 'Jump Ball';
        }
      }
    }

    const isStopped = Boolean(
      stoppageReason ||
      stoppageDetail ||
      isTimeout ||
      game.isClockRunning === false
    );

    const clockLabel = formatLiveClockDisplay(
      game.quarter,
      game.clock,
      game.phase,
      isTimeout,
      stoppageReason,
      stoppageDetail
    );
    if (game.phase === 'CLUTCH') {
      return (
        <div className="cp-row-between" style={{ height: 29 }}>
          <div className="cp-row-center" style={{ gap: 8 }}>
            {renderBackButton()}
            <span className="cp-pill cp-pill-gold cp-anim-clutch-pill">
              CLUTCH
            </span>
          </div>
          <span
            className={
              isStopped
                ? 'cp-text-muted'
                : 'cp-clutch-clock cp-anim-clutch-clock'
            }
            style={
              isStopped
                ? { fontSize: 14, fontWeight: 600, color: '#FFCE7E' }
                : undefined
            }
          >
            {clockLabel}
          </span>
        </div>
      );
    }
    if (game.phase === 'FINAL') {
      return (
        <div
          className="cp-row-between"
          style={{ height: onBack ? 28 : 17 }}
        >
          <div className="cp-row-center" style={{ gap: 8 }}>
            {renderBackButton()}
            <span className="cp-text-white-14-semi">FINAL</span>
          </div>
        </div>
      );
    }
    if (game.phase === 'OVERTIME') {
      return (
        <div
          className="cp-row-between"
          style={{ height: onBack ? 28 : 25 }}
        >
          <div className="cp-row-center" style={{ gap: 8 }}>
            {renderBackButton()}
            <span className="cp-pill cp-pill-white cp-anim-clutch-pill">
              OVERTIME
            </span>
          </div>
          <span className={isStopped ? 'cp-text-white-14-semi' : 'cp-live-clock-red'}>
            {clockLabel}
          </span>
        </div>
      );
    }
    if (game.phase === 'SCHEDULED') {
      return (
        <div
          className="cp-row-between"
          style={{ height: onBack ? 28 : 17 }}
        >
          <div className="cp-row-center" style={{ gap: 8 }}>
            {renderBackButton()}
            <span className="cp-text-muted">UPCOMING</span>
          </div>
          <span className="cp-text-muted">
            {game.startTimeText || '7:00 PM EST'}
          </span>
        </div>
      );
    }
    // game.phase === 'LIVE'
    return (
      <div
        className="cp-row-between"
        style={{ height: onBack ? 28 : 17 }}
      >
        <div className="cp-row-center" style={{ gap: 8 }}>
          {renderBackButton()}
          <div className="cp-live-badge">
            <div className="cp-live-dot-outer">
              <div className="cp-live-dot-inner" />
            </div>
            <span className="cp-live-text">LIVE</span>
          </div>
        </div>
        <span
          className={isStopped ? 'cp-text-white-14-semi' : 'cp-text-muted'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {clockLabel}
        </span>
      </div>
    );
  };

  const plays = isScheduled ? [] : game.lastPlays.slice(0, 3);
  const leaders = isScheduled ? [] : game.leaders.slice(0, 2);
  const isThreeDigit = game.awayScore >= 100 || game.homeScore >= 100;

  return (
    <div
      className="cp-card"
      style={{
        boxSizing: 'border-box',
        padding: 16,
        background: '#0F1013',
        cursor: onToggleExpand ? 'pointer' : 'default',
        height: cardHeight !== null ? `${cardHeight}px` : undefined,
      }}
      onClick={onToggleExpand}
    >
      <div
        className={`cp-card-glow-layer ${
          isGlowActive ? 'cp-card-glow-layer-active' : ''
        }`}
        style={{ background: glowOverlayBackground }}
      />

      <div ref={innerRef} className="cp-card-inner">
        {/* Top Status Row (Shared across Compact & Expanded) */}
        {renderTopStatusRow()}

        {expanded ? (
          <>
            {/* Frame 10: Horizontal Score Header */}
            <div
              key="expanded-header"
              className="cp-row-between cp-anim-expand-header"
              style={{ height: isScheduled ? 29 : 58, gap: 4 }}
            >
              {/* Away Team */}
              <div className="cp-row-center" style={{ gap: 6, flexShrink: 0 }}>
                <div
                  className="cp-team-square"
                  style={{ background: awayInfo.gradient }}
                />
                <span className="cp-team-abbr">{game.awayTeam}</span>
                {game.possession === 'away' &&
                  !isScheduled &&
                  game.phase !== 'FINAL' && (
                    <div className="cp-possession-dot" />
                  )}
              </div>

              {/* Center Score (hidden when scheduled) */}
              {!isScheduled && (
                <div
                  className="cp-row-center"
                  style={{ gap: 6, flexShrink: 0 }}
                >
                  <span
                    key={`exp-away-${game.id}-${game.awayScore}`}
                    className={`cp-score-48 cp-anim-score-bump ${
                      awayLeading ? 'cp-score-leading' : 'cp-score-trailing'
                    }`}
                    style={
                      isThreeDigit
                        ? { fontSize: 40, lineHeight: '48px' }
                        : undefined
                    }
                  >
                    {game.awayScore}
                  </span>
                  <span
                    className="cp-score-48 cp-score-leading"
                    style={
                      isThreeDigit
                        ? { fontSize: 40, lineHeight: '48px' }
                        : undefined
                    }
                  >
                    -
                  </span>
                  <span
                    key={`exp-home-${game.id}-${game.homeScore}`}
                    className={`cp-score-48 cp-anim-score-bump ${
                      homeLeading ? 'cp-score-leading' : 'cp-score-trailing'
                    }`}
                    style={
                      isThreeDigit
                        ? { fontSize: 40, lineHeight: '48px' }
                        : undefined
                    }
                  >
                    {game.homeScore}
                  </span>
                </div>
              )}

              {/* Home Team */}
              <div className="cp-row-center" style={{ gap: 6, flexShrink: 0 }}>
                {game.possession === 'home' &&
                  !isScheduled &&
                  game.phase !== 'FINAL' && (
                    <div
                      key={`exp-pos-home-${game.id}`}
                      className="cp-possession-dot"
                    />
                  )}
                <span className="cp-team-abbr">{game.homeTeam}</span>
                <div
                  className="cp-team-square"
                  style={{ background: homeInfo.gradient }}
                />
              </div>
            </div>

            {/* If Final, MVP row placed over the graph */}
            {game.phase === 'FINAL' && game.mvp && (
              <div
                className="cp-row-between cp-anim-expand-chart"
                style={{ height: 38, width: '100%', alignItems: 'center' }}
              >
                <div className="cp-col" style={{ gap: 4 }}>
                  <span className="cp-text-white-14-semi">
                    {game.mvp.name}
                  </span>
                  <span className="cp-text-muted">
                    {game.mvp.pts} PTS • {game.mvp.reb} REB • {game.mvp.ast} AST
                  </span>
                </div>
                <span className="cp-pill cp-pill-gold">MVP</span>
              </div>
            )}

            {/* Run Pill Row — ONLY present when there is an actual active run */}
            {hasActiveRun && (
              <div
                className="cp-row-between cp-anim-expand-chart"
                style={{ height: 25 }}
              >
                <div
                  key={game.activeRunText}
                  className="cp-pill cp-pill-team cp-anim-run-pill"
                  style={{ background: runTeamInfo.gradient }}
                >
                  {game.activeRunText}
                </div>
              </div>
            )}

            {/* Frame 24: Score Differential Area Chart */}
            <div className="cp-col cp-anim-expand-chart">
              <ScoreChart
                awayTeam={game.awayTeam}
                homeTeam={game.homeTeam}
                scoreHistory={game.scoreHistory}
                phase={game.phase}
                quarter={game.quarter}
              />
            </div>

            {/* If scheduled, show tip-off note instead of LAST PLAYS / LEADERS */}
            {isScheduled ? (
              <span className="cp-text-muted cp-anim-expand-plays">
                Card goes live at tip-off. We’ll ping you then.
              </span>
            ) : (
              <>
                {/* Frame 47: LAST PLAYS (only when plays exist) */}
                {plays.length > 0 && (
                  <div
                    className="cp-col cp-anim-expand-plays"
                    style={{ gap: 16 }}
                  >
                    <span className="cp-text-muted">LAST PLAYS</span>
                    <div className="cp-col" style={{ gap: 8 }}>
                      {plays.map((play, idx) => {
                        const pTeam = getTeamInfo(play.teamAbbr);
                        const rowAnimClass =
                          idx === 0
                            ? getCalloutAnimClass(
                                play.description,
                                play.isScoringPlay
                              )
                            : 'cp-anim-play-cascade';
                        return (
                          <div
                            key={`${play.id}-${idx}`}
                            className={`cp-row-center ${rowAnimClass}`}
                            style={{
                              gap: 16,
                              minHeight: 18,
                              width: '100%',
                              alignItems: 'flex-start',
                            }}
                          >
                            <span
                              className="cp-text-dim"
                              style={{
                                width: 34,
                                textAlign: 'left',
                                fontVariantNumeric: 'tabular-nums',
                                flexShrink: 0,
                              }}
                            >
                              {play.clock}
                            </span>
                            <div
                              className="cp-row-center"
                              style={{
                                gap: 8,
                                alignItems: 'flex-start',
                                flex: 1,
                              }}
                            >
                              <div
                                className="cp-team-square"
                                style={{ background: pTeam.gradient }}
                              />
                              <span
                                className="cp-text-white-14"
                                style={{ wordBreak: 'break-word' }}
                              >
                                {play.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Frame 48: LEADERS (only when leaders exist) */}
                {leaders.length > 0 && (
                  <div
                    className="cp-col cp-anim-expand-leaders"
                    style={{ gap: 16 }}
                  >
                    <span className="cp-text-muted">LEADERS</span>
                    <div className="cp-col" style={{ gap: 8 }}>
                      {leaders.map((leader, idx) => {
                        const lTeam = getTeamInfo(leader.teamAbbr);
                        return (
                          <div
                            key={idx}
                            className="cp-row-between"
                            style={{ minHeight: 18 }}
                          >
                            <div className="cp-row-center" style={{ gap: 8 }}>
                              <div
                                className="cp-team-square"
                                style={{ background: lTeam.gradient }}
                              />
                              <span className="cp-text-white-14">
                                {leader.name} #{leader.jersey}
                              </span>
                            </div>
                            <span className="cp-text-muted">
                              {leader.pts} PTS • {leader.reb} REB • {leader.ast}{' '}
                              AST
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div
            key="compact-body"
            className="cp-col cp-anim-compact-body"
            style={{ gap: 16 }}
          >
            {/* Scores Stack (Frame 10: gap 8px & 29px rows when scheduled, gap 4px & 58px rows when live/final) */}
            <div className="cp-col" style={{ gap: isScheduled ? 8 : 4 }}>
              {/* Away Team Row */}
              <div
                className="cp-row-between"
                style={{ height: isScheduled ? 29 : 58 }}
              >
                <div className="cp-row-center">
                  <div
                    className="cp-team-square"
                    style={{ background: awayInfo.gradient }}
                  />
                  <span className="cp-team-abbr">{game.awayTeam}</span>
                  {game.possession === 'away' &&
                    !isScheduled &&
                    game.phase !== 'FINAL' && (
                      <div
                        key={`pos-away-${game.id}`}
                        className="cp-possession-dot"
                      />
                    )}
                </div>
                {!isScheduled && (
                  <span
                    key={`away-${game.id}-${game.awayScore}`}
                    className={`cp-score-48 cp-anim-score-bump ${
                      awayLeading ? 'cp-score-leading' : 'cp-score-trailing'
                    }`}
                  >
                    {game.awayScore}
                  </span>
                )}
              </div>

              {/* Home Team Row */}
              <div
                className="cp-row-between"
                style={{ height: isScheduled ? 29 : 58 }}
              >
                <div className="cp-row-center">
                  <div
                    className="cp-team-square"
                    style={{ background: homeInfo.gradient }}
                  />
                  <span className="cp-team-abbr">{game.homeTeam}</span>
                  {game.possession === 'home' &&
                    !isScheduled &&
                    game.phase !== 'FINAL' && (
                      <div
                        key={`pos-home-${game.id}`}
                        className="cp-possession-dot"
                      />
                    )}
                </div>
                {!isScheduled && (
                  <span
                    key={`home-${game.id}-${game.homeScore}`}
                    className={`cp-score-48 cp-anim-score-bump ${
                      homeLeading ? 'cp-score-leading' : 'cp-score-trailing'
                    }`}
                  >
                    {game.homeScore}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Section based on Game Phase */}
            {isScheduled ? (
              <span className="cp-text-muted">
                Card goes live at tip-off. We’ll ping you then.
              </span>
            ) : game.phase === 'FINAL' ? (
              game.mvp && (
                <div className="cp-row-between" style={{ height: 38 }}>
                  <div className="cp-col" style={{ gap: 4 }}>
                    <span className="cp-text-white-14-semi">
                      {game.mvp.name}
                    </span>
                    <span className="cp-text-muted">
                      {game.mvp.pts} PTS • {game.mvp.reb} REB • {game.mvp.ast}{' '}
                      AST
                    </span>
                  </div>
                  <span className="cp-pill cp-pill-gold">MVP</span>
                </div>
              )
            ) : (
              <>
                {/* Momentum Bar (Frame 11) */}
                <div className="cp-momentum-wrap">
                  <div className="cp-momentum-track" />
                  <div
                    className="cp-momentum-fill"
                    style={{
                      width: `${barWidth}px`,
                      left: `${fillLeft}px`,
                      background: fillGradient,
                      borderRadius: fillBorderRadius,
                    }}
                  />
                  <div className="cp-momentum-tick" />
                </div>

                {/* Footer Row: Clutch shows clutchNote, Live shows Run pill (only if active) + lastPlayShort */}
                {game.phase === 'CLUTCH' ? (
                  game.clutchNote && (
                    <div className="cp-row-between" style={{ minHeight: 17 }}>
                      <span
                        key={game.clutchNote}
                        className="cp-text-muted cp-anim-play-callout"
                      >
                        {game.clutchNote}
                      </span>
                    </div>
                  )
                ) : (
                  (hasActiveRun || game.lastPlayShort) && (
                    <div
                      className="cp-row-between"
                      style={{ minHeight: 17, alignItems: 'center', gap: 12 }}
                    >
                      {hasActiveRun && (
                        <div
                          key={game.activeRunText}
                          className="cp-pill cp-pill-team cp-anim-run-pill"
                          style={{ background: runTeamInfo.gradient }}
                        >
                          {game.activeRunText}
                        </div>
                      )}
                      {game.lastPlayShort && (
                        <span
                          key={game.lastPlayShort}
                          className={`cp-text-muted ${getCalloutAnimClass(
                            game.lastPlayShort,
                            game.lastPlays[0]?.isScoringPlay
                          )}`}
                          style={{
                            marginLeft: 'auto',
                            textAlign: 'right',
                            wordBreak: 'break-word',
                          }}
                        >
                          {game.lastPlayShort}
                        </span>
                      )}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
