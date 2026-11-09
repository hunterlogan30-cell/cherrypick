import React, { useState, useRef, useEffect } from 'react';
import { NbaGame, SmartAlert } from '../types/nba';
import { FloatingGameCard } from './FloatingGameCard';
import { SmartAlertToast } from './SmartAlertToast';
import { getTeamInfo } from '../data/teams';

interface FloatingWidgetContainerProps {
  game: NbaGame;
  expanded: boolean;
  activeAlert: SmartAlert | null;
  onToggleExpand: () => void;
  onDismissAlert: () => void;
  onClose?: () => void;
  onCycleState?: (phase: 'LIVE' | 'CLUTCH' | 'FINAL') => void;
  isEmbeddedPreview?: boolean;
  initialMinimized?: boolean;
}

export const FloatingWidgetContainer: React.FC<FloatingWidgetContainerProps> = ({
  game,
  expanded,
  activeAlert,
  onToggleExpand,
  onDismissAlert,
  onClose,
  isEmbeddedPreview = false,
  initialMinimized = false,
}) => {
  const [minimized, setMinimized] = useState<boolean>(initialMinimized);
  const [pos, setPos] = useState<{ right: number; bottom: number }>({
    right: 24,
    bottom: 24,
  });
  const draggingRef = useRef<{
    startX: number;
    startY: number;
    startRight: number;
    startBottom: number;
    moved: boolean;
  } | null>(null);

  const wasDraggedRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - draggingRef.current.startX;
      const dy = e.clientY - draggingRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        draggingRef.current.moved = true;
        wasDraggedRef.current = true;
      }
      const maxRight = Math.max(12, window.innerWidth - 410);
      const maxBottom = Math.max(12, window.innerHeight - 100);
      setPos({
        right: Math.min(
          maxRight,
          Math.max(12, draggingRef.current.startRight - dx)
        ),
        bottom: Math.min(
          maxBottom,
          Math.max(12, draggingRef.current.startBottom - dy)
        ),
      });
    };
    const handleMouseUp = () => {
      draggingRef.current = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEmbeddedPreview || e.button !== 0) return;
    wasDraggedRef.current = false;
    draggingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: pos.right,
      startBottom: pos.bottom,
      moved: false,
    };
  };

  const handleCardToggle = () => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    onToggleExpand();
  };

  const handlePillClick = () => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    setMinimized(false);
  };

  const awayInfo = getTeamInfo(game.awayTeam);
  const homeInfo = getTeamInfo(game.homeTeam);
  const isScheduled = game.phase === 'SCHEDULED';

  // Minimized smallest view: just the numbers and team colors in a sleek pill
  if (minimized) {
    return (
      <div
        className={`cp-root ${isEmbeddedPreview ? '' : 'cp-floating-wrapper'}`}
        onMouseDown={handleMouseDown}
        style={
          isEmbeddedPreview
            ? { display: 'flex', flexDirection: 'column', gap: 12 }
            : {
                right: pos.right,
                bottom: pos.bottom,
                cursor: 'grab',
                position: 'fixed',
                zIndex: 2147483647,
              }
        }
      >
        <div
          onClick={handlePillClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px',
            background: '#0F1013',
            borderRadius: 999,
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
            userSelect: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {(game.phase === 'LIVE' ||
            game.phase === 'CLUTCH' ||
            game.phase === 'OVERTIME') && (
            <div className="cp-live-dot-outer">
              <div className="cp-live-dot-inner" />
            </div>
          )}

          <div className="cp-row-center" style={{ gap: 6 }}>
            <div
              className="cp-team-square"
              style={{ width: 14, height: 14, background: awayInfo.gradient }}
            />
            <span
              className="cp-text-white-14-semi"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {game.awayTeam}{' '}
              {!isScheduled ? game.awayScore : ''}
            </span>
          </div>

          <span className="cp-text-muted" style={{ opacity: 0.6 }}>
            {isScheduled ? '•' : '-'}
          </span>

          <div className="cp-row-center" style={{ gap: 6 }}>
            <span
              className="cp-text-white-14-semi"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {!isScheduled ? `${game.homeScore} ` : ''}
              {game.homeTeam}
            </span>
            <div
              className="cp-team-square"
              style={{ width: 14, height: 14, background: homeInfo.gradient }}
            />
          </div>

          <div
            style={{
              width: 1,
              height: 14,
              background: 'rgba(255,255,255,0.18)',
              margin: '0 2px',
            }}
          />

          {/* Expand icon to return to full card */}
          <button
            type="button"
            className="cp-mini-action-btn"
            title="Expand to card"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(false);
            }}
            style={{
              padding: '2px 6px',
              fontSize: 12,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          {/* Close X icon */}
          {onClose && (
            <button
              type="button"
              className="cp-mini-action-btn"
              title="Close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                padding: '2px 6px',
                fontSize: 11,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cp-root ${isEmbeddedPreview ? '' : 'cp-floating-wrapper'}`}
      style={
        isEmbeddedPreview
          ? { display: 'flex', flexDirection: 'column', gap: 12 }
          : {
              right: pos.right,
              bottom: pos.bottom,
              position: 'fixed',
              zIndex: 2147483647,
            }
      }
    >
      {/* Floating Toolbar above the popup with Minus and X icons */}
      {!isEmbeddedPreview && (
        <div
          className="cp-floating-toolbar"
          onMouseDown={handleMouseDown}
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          <div className="cp-row-center" style={{ gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#9B9CA6',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="9" cy="5" r="1.5" fill="currentColor" />
                <circle cx="15" cy="5" r="1.5" fill="currentColor" />
                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <circle cx="9" cy="19" r="1.5" fill="currentColor" />
                <circle cx="15" cy="19" r="1.5" fill="currentColor" />
              </svg>
              CHERRYPICK
            </span>
          </div>

          <div className="cp-row-center" style={{ gap: 6 }}>
            {/* Minus icon above popup to minimize to the numbers */}
            <button
              type="button"
              className="cp-mini-action-btn"
              title="Minimize to scores"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                padding: 0,
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              –
            </button>

            {/* X icon above popup to close it */}
            {onClose && (
              <button
                type="button"
                className="cp-mini-action-btn"
                title="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  padding: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Smart Alert Toast */}
      {activeAlert && (
        <SmartAlertToast alert={activeAlert} onDismiss={onDismissAlert} />
      )}

      {/* Main Floating Card */}
      <div onMouseDown={handleMouseDown} style={{ cursor: 'grab' }}>
        <FloatingGameCard
          game={game}
          expanded={expanded}
          onToggleExpand={handleCardToggle}
        />
      </div>
    </div>
  );
};

