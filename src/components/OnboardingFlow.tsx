import React, { useState } from 'react';
import { NotificationPrefs, NbaGame } from '../types/nba';
import {
  ALL_TEAM_ORDER,
  NBA_TEAMS,
  getTeamInfo,
} from '../data/teams';

interface OnboardingFlowProps {
  initialStep?: number;
  currentStep?: number;
  isSettingsMode?: boolean;
  favoriteTeam: string;
  notifications: NotificationPrefs;
  games: NbaGame[];
  onStepChange?: (step: number) => void;
  onComplete: (team: string, notifications: NotificationPrefs) => void;
  onBack?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialStep = 0,
  currentStep,
  isSettingsMode = false,
  favoriteTeam,
  notifications,
  games,
  onStepChange,
  onComplete,
  onBack,
}) => {
  const [internalStep, setInternalStep] = useState<number>(
    isSettingsMode ? 1 : currentStep !== undefined ? currentStep : initialStep
  );

  const step = currentStep !== undefined ? currentStep : internalStep;

  const goToStep = (next: number) => {
    setInternalStep(next);
    onStepChange?.(next);
  };
  const [selectedTeam, setSelectedTeam] = useState<string>(
    favoriteTeam || 'PHI'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [prefs, setPrefs] = useState<NotificationPrefs>(notifications);

  const selectedTeamInfo = getTeamInfo(selectedTeam);

  const renderBackArrow = (onClick: () => void) => (
    <button
      type="button"
      className="cp-back-arrow-btn"
      title="Back"
      onClick={onClick}
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

  // Show all 30 NBA teams (starting with the 12 Figma teams, followed by the other 18 teams)
  const displayedTeams = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allOrdered = ALL_TEAM_ORDER.map((abbr) => NBA_TEAMS[abbr]).filter(
      Boolean
    );
    if (!q) {
      return allOrdered;
    }
    return allOrdered.filter(
      (t) =>
        t.abbr.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Frame 2: Welcome Card (389x214px)
  if (step === 0) {
    return (
      <div
        className="cp-card cp-card-onboarding cp-step-card-anim"
        style={{
          minHeight: 214,
          justifyContent: 'flex-end',
        }}
      >
        <div className="cp-col" style={{ gap: 8 }}>
          <h1 className="cp-heading-24" style={{ width: 357 }}>
            Every game, right ahead. Anywhere you go.
          </h1>
          <p className="cp-text-muted" style={{ width: 357 }}>
            CherryPick keeps you in the game while you multitask. Quiet when you
            need it, noticeable when it counts.
          </p>
        </div>

        <button
          type="button"
          className="cp-primary-btn"
          onClick={() => goToStep(1)}
        >
          Get started
        </button>
      </div>
    );
  }

  // Frame 48: Who's your team? (394x544px)
  if (step === 1) {
    return (
      <div
        className="cp-card cp-card-onboarding cp-step-card-anim"
        style={{ justifyContent: 'space-between' }}
      >
        {isSettingsMode ? (
          onBack ? (
            renderBackArrow(onBack)
          ) : null
        ) : (
          <div className="cp-row-between" style={{ width: '100%' }}>
            {renderBackArrow(() => goToStep(0))}
            <span className="cp-text-muted">STEP 1 OF 3</span>
          </div>
        )}

        <div className="cp-col" style={{ gap: 8 }}>
          <h1 className="cp-heading-24">Who’s your team?</h1>
          <p className="cp-text-muted">
            Your card will follow your team by default. You can change this at
            any time.
          </p>
        </div>

        {/* Search teams input (Frame 6) */}
        <div className="cp-search-box" style={{ flexShrink: 0 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle
              cx="7.2"
              cy="7.2"
              r="5.5"
              stroke="#9B9CA6"
              strokeWidth="2"
            />
            <line
              x1="11.5"
              y1="11.5"
              x2="14.7"
              y2="14.7"
              stroke="#9B9CA6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            className="cp-search-input"
            placeholder="Search teams"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 3x10 Team Grid (Frame 64) */}
        <div className="cp-team-grid">
          {displayedTeams.map((team, idx) => {
            const isSelected = team.abbr === selectedTeam;
            return (
              <button
                key={team.abbr}
                type="button"
                className={`cp-team-tile ${isSelected ? 'cp-team-tile-selected' : ''}`}
                style={{
                  height: 45,
                  background: isSelected
                    ? `linear-gradient(#15161A, #15161A) padding-box, ${team.gradient} border-box`
                    : '#15161A',
                  border: '1.5px solid transparent',
                }}
                onClick={() => setSelectedTeam(team.abbr)}
              >
                <div
                  className="cp-team-square"
                  style={{ background: team.gradient }}
                />
                <span className="cp-team-abbr">{team.abbr}</span>
              </button>
            );
          })}
        </div>

        {/* Continue with PHI button (Frame 65) */}
        <button
          type="button"
          className="cp-primary-btn"
          style={{
            background: selectedTeamInfo.gradient,
            color: '#FFFFFF',
            flexShrink: 0,
          }}
          onClick={() => goToStep(2)}
        >
          Continue with {selectedTeam}
        </button>
      </div>
    );
  }

  // Frame 49: Want a heads-up?
  if (step === 2) {
    const toggleItems: Array<{
      key: keyof NotificationPrefs;
      title: string;
      desc: string;
    }> = [
      {
        key: 'bigMoments',
        title: 'Big moments',
        desc: 'Lead changes, runs, clutch time, OT',
      },
      {
        key: 'tipOff',
        title: 'Tip-off',
        desc: 'When your game starts',
      },
      {
        key: 'finalScore',
        title: 'Final score',
        desc: 'Result and MVP',
      },
      {
        key: 'everyBucket',
        title: 'Every bucket',
        desc: 'For the obsessed',
      },
    ];

    return (
      <div className="cp-card cp-card-onboarding cp-step-card-anim">
        {isSettingsMode ? (
          renderBackArrow(() => goToStep(1))
        ) : (
          <div className="cp-row-between" style={{ width: '100%' }}>
            {renderBackArrow(() => goToStep(1))}
            <span className="cp-text-muted">STEP 2 OF 3</span>
          </div>
        )}

        <div className="cp-col" style={{ gap: 8 }}>
          <h1 className="cp-heading-24">Want a heads-up?</h1>
          <p className="cp-text-muted">
            We’ll only ping you for {selectedTeam} games and only when it
            matters.
          </p>
        </div>

        <div className="cp-col" style={{ gap: 12 }}>
          {toggleItems.map((item) => {
            const isOn = prefs[item.key];
            return (
              <div
                key={item.key}
                className={`cp-surface-card ${isOn ? 'cp-surface-card-active' : ''}`}
                style={{
                  minHeight: 78,
                  padding: '14px 16px',
                  boxShadow: isOn ? '0 0 0 1.5px rgba(255, 255, 255, 0.22), 0 4px 18px rgba(0, 0, 0, 0.35)' : undefined,
                }}
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                }
              >
                <div className="cp-col" style={{ gap: 6, width: 271 }}>
                  <span className="cp-heading-24">{item.title}</span>
                  <span className="cp-text-muted">{item.desc}</span>
                </div>

                {/* Toggle Switch (Frame 74) */}
                <div
                  className="cp-toggle-track"
                  style={{
                    background: isOn
                      ? selectedTeamInfo.gradient
                      : '#2F3039',
                    justifyContent: isOn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    className="cp-toggle-knob"
                    style={{
                      background: isOn ? '#FFFFFF' : '#8E8F99',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="cp-primary-btn"
          style={{ flexShrink: 0 }}
          onClick={() => {
            if (isSettingsMode) {
              onComplete(selectedTeam, prefs);
            } else {
              goToStep(3);
            }
          }}
        >
          {isSettingsMode ? 'Save settings' : 'Turn on notifications'}
        </button>
      </div>
    );
  }

  // Frame 50: You're all set. (389x352px)
  const teamGame = games.find(
    (g) => g.awayTeam === selectedTeam || g.homeTeam === selectedTeam
  );
  const opponentAbbr = teamGame
    ? teamGame.awayTeam === selectedTeam
      ? teamGame.homeTeam
      : teamGame.awayTeam
    : selectedTeam === 'PHI'
    ? 'NYK'
    : 'PHI';
  const opponentInfo = getTeamInfo(opponentAbbr);

  return (
    <div
      className="cp-card cp-card-onboarding cp-step-card-anim"
      style={{ minHeight: 352 }}
    >
      <div className="cp-row-between" style={{ width: '100%' }}>
        {renderBackArrow(() => goToStep(2))}
        <span className="cp-text-muted">STEP 3 OF 3</span>
      </div>

      <div className="cp-col" style={{ gap: 8 }}>
        <h1 className="cp-heading-24">You’re all set.</h1>
        <p className="cp-text-muted">
          Your card will follow your team by default. You can change this at any
          time.
        </p>
      </div>

      {/* Upcoming / Current Game Preview Card (Frame 51: 362x102px with team gradient stroke) */}
      <div
        className="cp-surface-card cp-surface-card-active"
        style={{
          height: 102,
          cursor: 'default',
          background: `linear-gradient(#15161A, #15161A) padding-box, ${selectedTeamInfo.gradient} border-box`,
          border: '1.5px solid transparent',
        }}
      >
        <div className="cp-col" style={{ gap: 8 }}>
          <div className="cp-row-center" style={{ height: 29 }}>
            <div
              className="cp-team-square"
              style={{ background: selectedTeamInfo.gradient }}
            />
            <span className="cp-team-abbr">{selectedTeam}</span>
          </div>
          <div className="cp-row-center" style={{ height: 29 }}>
            <div
              className="cp-team-square"
              style={{ background: opponentInfo.gradient }}
            />
            <span className="cp-team-abbr">{opponentAbbr}</span>
          </div>
        </div>

        <span className="cp-text-muted">
          {teamGame?.startTimeText || '5:00 PM EST'}
        </span>
      </div>

      <span className="cp-text-muted">
        Card goes live at tip-off. We’ll ping you then.
      </span>

      <button
        type="button"
        className="cp-primary-btn"
        onClick={() => {
          onComplete(selectedTeam, prefs);
          goToStep(4);
        }}
      >
        Done
      </button>
    </div>
  );
};

