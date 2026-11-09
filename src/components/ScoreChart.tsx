import React, { useEffect, useRef, useState } from 'react';
import { GamePhase, ScorePoint } from '../types/nba';
import { getTeamInfo } from '../data/teams';

interface ScoreChartProps {
  awayTeam: string;
  homeTeam: string;
  scoreHistory: ScorePoint[];
  phase?: GamePhase;
  quarter?: number;
}

interface Pt {
  x: number;
  y: number;
}

function extractColorStops(
  cssGradient: string
): Array<{ offset: string; color: string }> {
  const stopRegex = /(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\))\s*(\d+(?:\.\d+)?%)?/g;
  const matches: Array<{ offset: string; color: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = stopRegex.exec(cssGradient)) !== null) {
    matches.push({
      color: match[1],
      offset: match[2] || '',
    });
  }
  if (matches.length === 0) {
    return [
      { offset: '0%', color: '#EB1616' },
      { offset: '100%', color: '#1E14EA' },
    ];
  }
  return matches.map((m, idx) => ({
    color: m.color,
    offset:
      m.offset ||
      (matches.length === 1
        ? '100%'
        : `${Math.round((idx / (matches.length - 1)) * 100)}%`),
  }));
}

// Sample a polyline of ScorePoints at parameter u in [0, 1] along its index/progress
function sampleCurveAt(points: ScorePoint[], u: number): ScorePoint {
  if (points.length === 0) return { progress: 0, diff: 0 };
  if (points.length === 1) return points[0];
  const scaled = Math.max(0, Math.min(1, u)) * (points.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  if (idx >= points.length - 1) return points[points.length - 1];
  const a = points[idx];
  const b = points[idx + 1];
  return {
    progress: a.progress + (b.progress - a.progress) * frac,
    diff: a.diff + (b.diff - a.diff) * frac,
  };
}

// Split a sequence of screen coordinates into separate closed polygon paths
// above and below midY so EVERY individual peak or dip has its own exact
// objectBoundingBox and always displays 100% of its team's gradient!
function buildSplitLobePaths(
  coords: Pt[],
  midY: number
): { abovePaths: string[]; belowPaths: string[] } {
  const abovePaths: string[] = [];
  const belowPaths: string[] = [];
  if (coords.length < 2) return { abovePaths, belowPaths };

  // Insert exact intersection points wherever a segment crosses y = midY
  const augmented: Pt[] = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const dPrev = prev.y - midY;
    const dCurr = curr.y - midY;

    if ((dPrev < 0 && dCurr > 0) || (dPrev > 0 && dCurr < 0)) {
      const t = Math.abs(dPrev) / (Math.abs(dPrev) + Math.abs(dCurr));
      const crossX = prev.x + t * (curr.x - prev.x);
      augmented.push({ x: crossX, y: midY });
    }
    augmented.push(curr);
  }

  // Group contiguous points that are <= midY (above) or >= midY (below) into closed lobes
  let currentLobe: Pt[] = [];
  let currentSide: 'above' | 'below' | null = null;

  const flushLobe = () => {
    if (currentLobe.length < 2 || !currentSide) {
      currentLobe = [];
      currentSide = null;
      return;
    }
    const maxDeviation = Math.max(
      ...currentLobe.map((p) => Math.abs(p.y - midY))
    );
    if (maxDeviation > 0.25) {
      const first = currentLobe[0];
      const last = currentLobe[currentLobe.length - 1];
      const polyPts: Pt[] = [
        { x: first.x, y: midY },
        ...currentLobe,
        { x: last.x, y: midY },
      ];
      const pathStr =
        polyPts
          .map(
            (p, idx) =>
              `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
          )
          .join(' ') + ' Z';
      if (currentSide === 'above') {
        abovePaths.push(pathStr);
      } else {
        belowPaths.push(pathStr);
      }
    }
    currentLobe = [];
    currentSide = null;
  };

  for (let i = 0; i < augmented.length; i++) {
    const pt = augmented[i];
    const diffY = pt.y - midY;
    const eps = 0.05;

    if (Math.abs(diffY) <= eps) {
      // Point lies on the midline: close current lobe with this point and start next lobe from it
      if (currentLobe.length > 0) {
        currentLobe.push({ x: pt.x, y: midY });
        flushLobe();
      }
      currentLobe = [{ x: pt.x, y: midY }];
      currentSide = null;
    } else {
      const side: 'above' | 'below' = diffY < 0 ? 'above' : 'below';
      if (currentSide && currentSide !== side) {
        flushLobe();
        currentLobe = [pt];
        currentSide = side;
      } else {
        currentSide = side;
        currentLobe.push(pt);
      }
    }
  }
  flushLobe();

  return { abovePaths, belowPaths };
}

export const ScoreChart: React.FC<ScoreChartProps> = ({
  awayTeam,
  homeTeam,
  scoreHistory,
  phase = 'LIVE',
  quarter,
}) => {
  const awayInfo = getTeamInfo(awayTeam);
  const homeInfo = getTeamInfo(homeTeam);

  const isOvertime =
    (quarter !== undefined && quarter >= 5) || phase === 'OVERTIME';
  const otPeriod = quarter && quarter >= 5 ? quarter - 4 : 1;
  const otLabel = otPeriod === 1 ? 'OT' : `${otPeriod}OT`;

  const width = 362;
  const height = 124;
  const midY = 61.5;
  const maxAmplitude = 40;

  const hasData = phase !== 'SCHEDULED' && scoreHistory.length >= 2;

  // Animated score points for smooth expanding reveal when points are scored
  const [animatedPoints, setAnimatedPoints] = useState<ScorePoint[]>(scoreHistory);
  const prevPointsRef = useRef<ScorePoint[]>(scoreHistory);
  const animatingTargetRef = useRef<ScorePoint[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevPeriodKeyRef = useRef<string>(`${quarter ?? 'reg'}-${phase}`);

  // When transitioning between Regulation and Overtime, or between OT1 and OT2, reset immediately
  useEffect(() => {
    const currentKey = `${quarter ?? 'reg'}-${phase}`;
    if (prevPeriodKeyRef.current !== currentKey) {
      prevPeriodKeyRef.current = currentKey;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      animatingTargetRef.current = null;
      setAnimatedPoints(scoreHistory);
      prevPointsRef.current = scoreHistory;
    }
  }, [quarter, phase, scoreHistory]);

  useEffect(() => {
    if (!hasData) {
      setAnimatedPoints([]);
      prevPointsRef.current = [];
      animatingTargetRef.current = null;
      return;
    }

    const toPts = scoreHistory;

    // Helper to check if two point arrays have identical length and values
    const arePointsIdentical = (a: ScorePoint[], b: ScorePoint[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (
          Math.abs(a[i].progress - b[i].progress) >= 0.001 ||
          Math.abs(a[i].diff - b[i].diff) >= 0.01
        ) {
          return false;
        }
      }
      return true;
    };

    // If an animation is already in flight toward this EXACT target, let it run uninterrupted
    if (
      animatingTargetRef.current &&
      arePointsIdentical(toPts, animatingTargetRef.current)
    ) {
      return;
    }

    // If already finalized at this target, do nothing
    if (arePointsIdentical(toPts, prevPointsRef.current)) {
      return;
    }

    // Target has changed: cancel any existing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const fromPts = prevPointsRef.current;

    // Smoothly animate ONLY when exactly 1 new point is appended at the end
    const isSingleAppend =
      fromPts.length > 0 &&
      toPts.length === fromPts.length + 1 &&
      fromPts.every(
        (p, i) =>
          Math.abs(p.progress - toPts[i].progress) < 0.001 &&
          Math.abs(p.diff - toPts[i].diff) < 0.01
      );

    if (!isSingleAppend) {
      // Jumps, backward scrub, or game switches snap immediately
      animatingTargetRef.current = null;
      setAnimatedPoints(toPts);
      prevPointsRef.current = toPts;
      return;
    }

    // Single point appended: smoothly animate tail point expanding outwards
    animatingTargetRef.current = toPts;
    const startTime = performance.now();
    const duration = 460; // ms smooth expanding reveal
    const lastOld = fromPts[fromPts.length - 1];
    const newTarget = toPts[toPts.length - 1];

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(1, elapsed / duration);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - rawT, 3);

      const interpProg =
        lastOld.progress + (newTarget.progress - lastOld.progress) * ease;
      const interpDiff =
        lastOld.diff + (newTarget.diff - lastOld.diff) * ease;

      const current = [
        ...fromPts,
        {
          progress: Number(interpProg.toFixed(3)),
          diff: Number(interpDiff.toFixed(2)),
        },
      ];

      setAnimatedPoints(current);

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimatedPoints(toPts);
        prevPointsRef.current = toPts;
        animatingTargetRef.current = null;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [scoreHistory, hasData]);

  // Clean up RAF on unmount only
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Convert current animated points to SVG screen coordinates
  const coords: Pt[] = React.useMemo(() => {
    if (!hasData || animatedPoints.length < 2) return [];
    const maxAbsDiff = Math.max(
      11.5,
      ...animatedPoints.map((p) => Math.abs(p.diff))
    );
    return animatedPoints.map((p) => {
      const x = Math.max(0, Math.min(width, p.progress * width));
      const y = midY - (p.diff / maxAbsDiff) * maxAmplitude;
      return { x, y };
    });
  }, [hasData, animatedPoints]);

  const { abovePaths, belowPaths } = React.useMemo(
    () => buildSplitLobePaths(coords, midY),
    [coords]
  );

  // Extract stops from each team's chartGradient (matches Figma Vector 2 & Vector 3)
  const awayStops = extractColorStops(
    awayInfo.chartGradient || awayInfo.gradient
  );
  const homeStops = extractColorStops(
    homeInfo.chartGradient || homeInfo.gradient
  );

  const gradIdTop = `cp-grad-top-${awayTeam}`;
  const gradIdBot = `cp-grad-bot-${homeTeam}`;

  const linePath =
    coords.length >= 2
      ? coords
          .map(
            (pt, idx) =>
              `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`
          )
          .join(' ')
      : '';

  const lastPt = coords.length >= 2 ? coords[coords.length - 1] : null;

  return (
    <div className="cp-chart-container">
      <div className="cp-chart-box">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <defs>
            {/*
              objectBoundingBox maps (x1,y1)->(x2,y2) to EACH individual lobe's
              exact width & height! So whether a peak/dip is small or large,
              the FULL team gradient always spans 100% of that shape and expands
              smoothly as the shape grows!
              Angle ~244deg in CSS = from right-top (95%, 15%) to left-bottom (5%, 85%).
            */}
            <linearGradient
              id={gradIdTop}
              gradientUnits="objectBoundingBox"
              x1="0.95"
              y1="0.15"
              x2="0.05"
              y2="0.85"
            >
              {awayStops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>

            <linearGradient
              id={gradIdBot}
              gradientUnits="objectBoundingBox"
              x1="0.95"
              y1="0.15"
              x2="0.05"
              y2="0.85"
            >
              {homeStops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>

          {/* Vertical Quarter Grid Lines: ONLY shown in regulation (Q1, Q2, Q3, Q4) */}
          {!isOvertime && (
            <>
              <line
                x1="91.77"
                y1="10.8"
                x2="91.77"
                y2="113.2"
                stroke="#1A1B20"
                strokeWidth="1.41"
              />
              <line
                x1="183.81"
                y1="10.8"
                x2="183.81"
                y2="113.2"
                stroke="#1A1B20"
                strokeWidth="1.41"
              />
              <line
                x1="276.27"
                y1="10.8"
                x2="276.27"
                y2="113.2"
                stroke="#1A1B20"
                strokeWidth="1.41"
              />
            </>
          )}

          {/* Horizontal Midline (Rectangle 4) */}
          <line
            x1="0"
            y1={midY}
            x2={width}
            y2={midY}
            stroke="#1A1B20"
            strokeWidth="1.41"
          />

          {hasData && (
            <>
              {/* Above-Midline Lobes (Away Team Leading — full away gradient per lobe) */}
              {abovePaths.map((d, idx) => (
                <path key={`above-${idx}`} d={d} fill={`url(#${gradIdTop})`} />
              ))}

              {/* Below-Midline Lobes (Home Team Leading — full home gradient per lobe) */}
              {belowPaths.map((d, idx) => (
                <path key={`below-${idx}`} d={d} fill={`url(#${gradIdBot})`} />
              ))}

              {/* White Curve Stroke (Vector 1: 2px solid #FFFFFF) */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Live Current Point Dot (ball 3: 6x6px #FFFFFF) */}
              {lastPt && (
                <circle cx={lastPt.x} cy={lastPt.y} r="3" fill="#FFFFFF" />
              )}
            </>
          )}
        </svg>
      </div>

      {/* Quarter / Period Labels */}
      {!isOvertime ? (
        <div className="cp-chart-quarters">
          <span className="cp-text-dim">Q1</span>
          <span className="cp-text-dim">Q2</span>
          <span className="cp-text-dim">Q3</span>
          <span className="cp-text-dim">Q4</span>
        </div>
      ) : (
        <div
          className="cp-chart-quarters"
          style={{ justifyContent: 'center', height: 18, alignItems: 'center' }}
        >
          <span
            className="cp-text-dim"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            {otLabel}
          </span>
        </div>
      )}
    </div>
  );
};
