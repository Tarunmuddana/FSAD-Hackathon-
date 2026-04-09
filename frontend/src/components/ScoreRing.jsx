import { useEffect, useRef } from 'react';
import { getCssVariableFromScore } from '../utils/matchUtils';

export default function ScoreRing({ score, size = 64, strokeWidth = 5 }) {
  const circleRef = useRef(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const color = getCssVariableFromScore(score ?? 0);

  // Animate stroke on mount
  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - ((score ?? 0) / 100) * circumference;
    // Start fully empty then animate in
    circleRef.current.style.strokeDashoffset = circumference;
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)';
          circleRef.current.style.strokeDashoffset = offset;
        }
      }, 100);
    });
    return () => cancelAnimationFrame(raf);
  }, [score, circumference]);

  if (score === undefined || score === null) return null;

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          filter={`url(#glow-${score})`}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', lineHeight: 1,
      }}>
        <span className="score-text" style={{ color, fontSize: size * 0.195 + 'px' }}>
          {score}%
        </span>
      </div>
    </div>
  );
}
