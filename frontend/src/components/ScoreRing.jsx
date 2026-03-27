import { getScoreColor } from '../utils/matchUtils'
import './ScoreRing.css'

export default function ScoreRing({ score, size = 56 }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="ring-bg"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth="3"
        />
        <circle
          className="ring-progress"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth="3"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease)' }}
        />
      </svg>
      <span className="ring-label" style={{ color }}>{score}%</span>
    </div>
  )
}
