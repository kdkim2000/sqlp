import type { CSSProperties } from 'react'

interface ScoringGuideProps {
  selfScore: 0 | 7 | 15 | null
  onScore: (score: 0 | 7 | 15) => void
  disabled?: boolean
  scoringGuide?: string
}

const SCORE_OPTIONS: { score: 0 | 7 | 15; label: string }[] = [
  { score: 0,  label: '0점 (오답)' },
  { score: 7,  label: '7점 (부분)' },
  { score: 15, label: '15점 (만점)' },
]

const SCORE_SELECTED_STYLE: Record<number, CSSProperties> = {
  0:  { borderColor: '#FF6B6B', backgroundColor: '#FFF1F2', color: '#FF6B6B' },
  7:  { borderColor: '#F59E0B', backgroundColor: '#FFFBEB', color: '#B45309' },
  15: { borderColor: '#12B76A', backgroundColor: '#ECFDF3', color: '#12B76A' },
}

export default function ScoringGuide({ selfScore, onScore, disabled = false, scoringGuide }: ScoringGuideProps) {
  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: disabled ? 'var(--q-ink-3)' : 'var(--q-ink-2)' }}>
        자기채점 {disabled && '(제출 후 활성)'}
      </p>

      {scoringGuide && !disabled && (
        <div className="mb-3 p-3 rounded-lg bg-primary-50">
          <p className="text-xs font-semibold text-primary-700 mb-1">채점 기준</p>
          <p className="text-xs text-primary-600 whitespace-pre-line">{scoringGuide}</p>
        </div>
      )}

      <div className="flex gap-2">
        {SCORE_OPTIONS.map(({ score, label }) => {
          const isSelected = selfScore === score
          return (
            <button
              key={score}
              onClick={() => !disabled && onScore(score)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-disabled={disabled}
              className="flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all"
              style={
                disabled
                  ? { borderColor: 'var(--q-border)', background: 'var(--q-surface)', color: 'var(--q-ink-3)', cursor: 'not-allowed', opacity: 0.4 }
                  : isSelected
                    ? { ...SCORE_SELECTED_STYLE[score], cursor: 'pointer' }
                    : { borderColor: 'var(--q-border)', background: 'var(--q-surface)', color: 'var(--q-ink-2)', cursor: 'pointer' }
              }
            >
              {label}
            </button>
          )
        })}
      </div>

      {selfScore !== null && (
        <p className="text-xs mt-2 text-center font-medium" style={{ color: 'var(--q-ink-3)' }}>
          선택한 점수: {selfScore}점 (저장됨)
        </p>
      )}
    </div>
  )
}
