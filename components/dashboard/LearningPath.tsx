import Link from 'next/link'
import { CHAPTERS } from '@/lib/chapters'

type ChapterStatMap = Record<string, { attempted: number; correct: number }>

interface LearningPathProps {
  chapterStats: ChapterStatMap
}

interface PathNode {
  id: string
  part: number
  label: string
  shortLabel: string
  href: string
  status: 'done' | 'current' | 'locked' | 'boss'
}

const PART_LABEL: Record<number, string> = {
  1: '1과목',
  2: '2과목',
  3: '3과목',
}

export default function LearningPath({ chapterStats }: LearningPathProps) {
  // Determine node status for each chapter
  const nodes: PathNode[] = CHAPTERS.map((ch, idx) => {
    const s = chapterStats[ch.id] ?? { attempted: 0, correct: 0 }
    const correctPct = s.attempted > 0 ? (s.correct / s.attempted) * 100 : 0
    const isDone = s.attempted >= 5 && correctPct >= 60

    let status: PathNode['status'] = 'locked'
    if (isDone) {
      status = 'done'
    } else {
      const allPrevDone = CHAPTERS.slice(0, idx).every((prevCh) => {
        const ps = chapterStats[prevCh.id] ?? { attempted: 0, correct: 0 }
        const pPct = ps.attempted > 0 ? (ps.correct / ps.attempted) * 100 : 0
        return ps.attempted >= 5 && pPct >= 60
      })
      if (allPrevDone) {
        status = s.attempted > 0 ? 'current' : idx === 0 ? 'current' : 'locked'
      }
    }

    return {
      id: ch.id,
      part: ch.part,
      label: ch.title,
      shortLabel: ch.title.length > 8 ? ch.title.slice(0, 7) + '…' : ch.title,
      href: `/quiz/chapter/${ch.id}`,
      status,
    }
  })

  // Boss node
  const allDone = nodes.every((n) => n.status === 'done')
  const bossNode: PathNode = {
    id: 'boss',
    part: 0,
    label: '최종 모의고사',
    shortLabel: 'BOSS',
    href: '/quiz/exam',
    status: allDone ? 'current' : 'boss',
  }

  // If no attempts at all, first node is current
  const hasAnyAttempt = nodes.some((n) => n.status !== 'locked')
  if (!hasAnyAttempt && nodes.length > 0) nodes[0].status = 'current'

  // Group by part (1 / 2 / 3)
  const partGroups: Record<number, PathNode[]> = { 1: [], 2: [], 3: [] }
  nodes.forEach((n) => {
    if (partGroups[n.part]) partGroups[n.part].push(n)
  })

  return (
    <div className="q-card">
      <h2 className="text-sm font-bold mb-5" style={{ color: 'var(--q-ink-2)' }}>
        학습 경로
      </h2>

      {/* 과목별 3개 행 */}
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((part) => {
          const group = partGroups[part] ?? []
          if (group.length === 0) return null
          return (
            <div key={part} className="flex items-center gap-0">
              {/* 과목 레이블 */}
              <span
                className="text-xs font-bold shrink-0 w-14 text-center"
                style={{ color: 'var(--q-ink-3)' }}
              >
                {PART_LABEL[part]}
              </span>

              {/* 챕터 버블 + 연결선 */}
              <div className="flex items-center gap-0 flex-wrap">
                {group.map((node, idx) => (
                  <div key={node.id} className="flex items-center">
                    <NodeBubble node={node} />
                    {idx < group.length - 1 && (
                      <div
                        className="h-0.5 w-6 sm:w-8 shrink-0"
                        style={{
                          background:
                            group[idx + 1].status !== 'locked' && group[idx + 1].status !== 'boss'
                              ? '#12B76A'
                              : 'var(--q-border)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* BOSS 노드 */}
        <div className="flex items-center justify-center gap-2 pt-1 border-t" style={{ borderColor: 'var(--q-border)' }}>
          <span className="text-xs font-bold shrink-0" style={{ color: 'var(--q-ink-3)' }}>
            모의고사
          </span>
          <NodeBubble node={bossNode} />
        </div>
      </div>
    </div>
  )
}

function NodeBubble({ node }: { node: PathNode }) {
  const isDone = node.status === 'done'
  const isCurrent = node.status === 'current'
  const isLocked = node.status === 'locked'
  const isBoss = node.status === 'boss'

  const size = isBoss ? 56 : 44
  const fontSize = isBoss ? '1.1rem' : '0.9rem'

  let bubbleBg: string
  let bubbleBorder: string
  let iconContent: string

  if (isDone) {
    bubbleBg = '#12B76A'
    bubbleBorder = '#039855'
    iconContent = '✓'
  } else if (isCurrent) {
    bubbleBg = '#7F56D9'
    bubbleBorder = '#6941C6'
    iconContent = node.id === 'boss' ? '👑' : '▶'
  } else if (isBoss) {
    bubbleBg = 'linear-gradient(135deg, #FF6B6B, #FFB627)'
    bubbleBorder = '#FF6B6B'
    iconContent = '👑'
  } else {
    bubbleBg = 'var(--q-surface-soft)'
    bubbleBorder = 'var(--q-border)'
    iconContent = '🔒'
  }

  const inner = (
    <div className="flex flex-col items-center gap-1">
      <div
        className={isCurrent ? 'q-bounce' : ''}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bubbleBg,
          border: `2.5px solid ${bubbleBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          color: isLocked ? 'var(--q-ink-3)' : '#ffffff',
          fontWeight: 700,
          boxShadow: isCurrent ? '0 0 0 6px rgba(127,86,217,0.15)' : undefined,
          transition: 'box-shadow 0.2s',
          cursor: isLocked ? 'not-allowed' : 'pointer',
        }}
      >
        {iconContent}
      </div>
      <span
        className="text-center"
        style={{
          fontSize: '0.6rem',
          maxWidth: size + 12,
          color: isLocked ? 'var(--q-ink-3)' : isCurrent ? '#7F56D9' : 'var(--q-ink-2)',
          fontWeight: isCurrent ? 700 : 500,
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        {node.shortLabel}
      </span>
    </div>
  )

  if (isLocked) {
    return <div className="flex flex-col items-center px-0.5">{inner}</div>
  }

  return (
    <Link href={node.href} className="flex flex-col items-center px-0.5 hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  )
}
