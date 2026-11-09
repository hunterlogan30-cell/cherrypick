import React from 'react';
import { SmartAlert } from '../types/nba';
import { getTeamInfo } from '../data/teams';

interface SmartAlertToastProps {
  alert: SmartAlert;
  onDismiss?: () => void;
}

export const SmartAlertToast: React.FC<SmartAlertToastProps> = ({
  alert,
  onDismiss,
}) => {
  const teamInfo = getTeamInfo(alert.teamAbbr);
  const oppInfo = getTeamInfo(alert.opponentAbbr);

  // Frame 54: OVERTIME (Figma Frame 54: Pure dark card with crisp white capsule badge)
  if (alert.type === 'OVERTIME') {
    return (
      <div
        className="cp-card cp-card-toast"
        style={{
          minHeight: 124,
          background: '#0F1013',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
          cursor: onDismiss ? 'pointer' : 'default',
        }}
        onClick={onDismiss}
      >
        <div className="cp-row-between" style={{ height: 25 }}>
          <span
            className="cp-pill"
            style={{
              background: '#FFFFFF',
              color: '#000000',
              fontWeight: 700,
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 999,
              letterSpacing: '0.02em',
            }}
          >
            OVERTIME
          </span>
          <span className="cp-text-muted" style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.45)' }}>
            {alert.timestampText || 'Now'}
          </span>
        </div>
        <div
          className="cp-heading-24"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.25,
            marginTop: 8,
          }}
        >
          {alert.headline}
        </div>
      </div>
    );
  }

  // Frame 45: LEAD CHANGE
  if (alert.type === 'LEAD_CHANGE') {
    return (
      <div
        className="cp-card cp-card-toast"
        style={{ minHeight: 102, cursor: onDismiss ? 'pointer' : 'default' }}
        onClick={onDismiss}
      >
        <div className="cp-row-between" style={{ height: 25 }}>
          <span
            className="cp-pill cp-pill-team"
            style={{ background: teamInfo.gradient }}
          >
            LEAD CHANGE
          </span>
          <span className="cp-text-muted">{alert.timestampText}</span>
        </div>
        <div className="cp-row-between" style={{ height: 29 }}>
          <span className="cp-heading-24">{alert.headline}</span>
          <div className="cp-row-center" style={{ gap: 8 }}>
            <span className="cp-score-24 cp-score-leading">
              {alert.awayScore ?? 78}
            </span>
            <span className="cp-score-24 cp-score-leading">-</span>
            <span className="cp-score-24 cp-score-trailing">
              {alert.homeScore ?? 67}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Frame 51: TIP-OFF
  if (alert.type === 'TIP_OFF') {
    return (
      <div
        className="cp-card cp-card-toast"
        style={{ minHeight: 102, cursor: onDismiss ? 'pointer' : 'default' }}
        onClick={onDismiss}
      >
        <div className="cp-row-between" style={{ height: 25 }}>
          <span className="cp-pill cp-pill-white">TIP-OFF</span>
          <span className="cp-text-muted">{alert.timestampText || 'Now'}</span>
        </div>
        <div className="cp-row-center" style={{ height: 29, gap: 8 }}>
          <div className="cp-row-center" style={{ gap: 8 }}>
            <div
              className="cp-team-square"
              style={{ background: teamInfo.gradient }}
            />
            <span className="cp-team-abbr">{alert.teamAbbr}</span>
          </div>
          <span className="cp-heading-24">•</span>
          <div className="cp-row-center" style={{ gap: 8 }}>
            <div
              className="cp-team-square"
              style={{ background: oppInfo.gradient }}
            />
            <span className="cp-team-abbr">{alert.opponentAbbr}</span>
          </div>
        </div>
      </div>
    );
  }

  // Frame 52: RUN or BUCKET (Every bucket)
  if (alert.type === 'RUN' || alert.type === 'BUCKET') {
    return (
      <div
        className="cp-card cp-card-toast"
        style={{ minHeight: 106, cursor: onDismiss ? 'pointer' : 'default' }}
        onClick={onDismiss}
      >
        <div className="cp-row-between" style={{ height: 25 }}>
          <span
            className="cp-pill cp-pill-team"
            style={{ background: teamInfo.gradient }}
          >
            {alert.type === 'BUCKET' ? alert.subline || 'BUCKET' : 'RUN'}
          </span>
          <span className="cp-text-muted">{alert.timestampText}</span>
        </div>
        <div className="cp-row-between" style={{ minHeight: 29, gap: 12 }}>
          <span className="cp-heading-24" style={{ maxWidth: 220 }}>
            {alert.headline}
          </span>
          <div className="cp-row-center" style={{ gap: 8, flexShrink: 0 }}>
            <span className="cp-score-24 cp-score-leading">
              {alert.awayScore ?? 78}
            </span>
            <span className="cp-score-24 cp-score-leading">-</span>
            <span className="cp-score-24 cp-score-trailing">
              {alert.homeScore ?? 67}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Frame 53: CLUTCH
  if (alert.type === 'CLUTCH') {
    return (
      <div
        className="cp-card cp-card-toast cp-card-clutch"
        style={{ minHeight: 106, cursor: onDismiss ? 'pointer' : 'default' }}
        onClick={onDismiss}
      >
        <div className="cp-row-between" style={{ height: 29 }}>
          <span className="cp-pill cp-pill-gold">CLUTCH</span>
          <span className="cp-clutch-clock">{alert.timestampText}</span>
        </div>
        <div className="cp-heading-24">{alert.headline}</div>
      </div>
    );
  }

  // Frame 55: FINAL (Figma Frame 55: Rich team victory gradient across top right)
  if (alert.type === 'FINAL') {
    return (
      <div
        className="cp-card cp-card-toast"
        style={{
          minHeight: 124,
          background: `linear-gradient(135deg, rgba(235, 22, 22, 0.45) 0%, rgba(30, 20, 234, 0.55) 100%), #0F1013`,
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65)',
          cursor: onDismiss ? 'pointer' : 'default',
        }}
        onClick={onDismiss}
      >
        <div className="cp-row-between" style={{ height: 18 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.75)',
              textTransform: 'uppercase',
            }}
          >
            FINAL
          </span>
        </div>
        <div className="cp-row-between" style={{ minHeight: 58, alignItems: 'center', marginTop: 4 }}>
          <span
            className="cp-heading-24"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#FFFFFF',
              maxWidth: 220,
              lineHeight: 1.25,
            }}
          >
            {alert.headline}
          </span>
          <div className="cp-row-center" style={{ gap: 8 }}>
            <span className="cp-score-24 cp-score-leading" style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', fontFamily: "'Inter', sans-serif", fontVariantNumeric: 'normal' }}>
              {alert.awayScore ?? 110}
            </span>
            <span className="cp-score-24 cp-score-leading" style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', fontFamily: "'Inter', sans-serif", fontVariantNumeric: 'normal' }}>
              -
            </span>
            <span className="cp-score-24 cp-score-trailing" style={{ fontSize: 24, fontWeight: 800, color: '#9B9CA6', fontFamily: "'Inter', sans-serif", fontVariantNumeric: 'normal' }}>
              {alert.homeScore ?? 101}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Frame 56: MVP
  const mvp = alert.mvp || {
    name: alert.headline || 'Tyrese Maxey',
    jersey: '0',
    teamAbbr: alert.teamAbbr,
    pts: 36,
    reb: 11,
    ast: 6,
  };

  return (
    <div
      className="cp-card cp-card-toast"
      style={{
        minHeight: 127,
        background: teamInfo.glowGradient,
        cursor: onDismiss ? 'pointer' : 'default',
      }}
      onClick={onDismiss}
    >
      <div className="cp-row-between" style={{ height: 25 }}>
        <span className="cp-pill cp-pill-gold">MVP</span>
      </div>
      <div className="cp-col" style={{ gap: 8 }}>
        <span className="cp-heading-24">{mvp.name}</span>
        <div className="cp-row-center" style={{ gap: 8 }}>
          <span
            className="cp-text-muted"
            style={{ fontWeight: 600 }}
          >
            {mvp.pts} PTS
          </span>
          <span className="cp-text-muted" style={{ fontWeight: 600 }}>
            •
          </span>
          <span
            className="cp-text-muted"
            style={{ fontWeight: 600 }}
          >
            {mvp.reb} REB
          </span>
          <span className="cp-text-muted" style={{ fontWeight: 600 }}>
            •
          </span>
          <span
            className="cp-text-muted"
            style={{ fontWeight: 600 }}
          >
            {mvp.ast} AST
          </span>
        </div>
      </div>
    </div>
  );
};

