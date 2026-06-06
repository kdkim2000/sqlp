import Link from 'next/link'
import type { PracticalQuestion } from '@/types'

interface PracticalCardProps {
  question: PracticalQuestion
}

const SUBTYPE_LABEL: Record<string, Record<number, string>> = {
  'sql-tuning': {
    1: '유형1 — 성능 저하 SQL 개선',
    2: '유형2 — 실행계획 기반 SQL 작성',
    3: '유형3 — 데이터 모델 기반 최적 SQL',
  },
  'troubleshooting': {
    1: '유형1 — 애플리케이션 성능 개선',
    2: '유형2 — 성능 이슈 원인 분석',
  },
}

export default function PracticalCard({ question }: PracticalCardProps) {
  const subtypeLabel = SUBTYPE_LABEL[question.type]?.[question.subType] ?? `유형${question.subType}`
  const preview = question.content
    .replace(/#+\s+/g, '')
    .replace(/```[\s\S]*?```/g, '[SQL]')
    .slice(0, 60)
    .trim()

  return (
    <Link
      href={`/practical/${question.id}`}
      className="group q-card flex flex-col gap-2 hover:border-primary-300 hover:shadow-q-md transition-all"
    >
      <p className="text-xs font-semibold text-primary-600">{subtypeLabel}</p>
      <p
        className="text-sm font-medium leading-relaxed group-hover:text-primary-700 transition-colors"
        style={{ color: 'var(--q-ink)' }}
      >
        {preview}{preview.length >= 60 ? '...' : ''}
      </p>
      <p className="text-xs mt-auto" style={{ color: 'var(--q-ink-3)' }}>풀기 →</p>
    </Link>
  )
}
