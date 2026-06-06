import Head from 'next/head'
import Link from 'next/link'
import type { GetStaticPaths, GetStaticProps } from 'next'
import type { PracticalQuestion } from '@/types'
import { getPracticalQuestionIds, getPracticalQuestionById } from '@/lib/questions'
import PracticalQuestionComponent from '@/components/quiz/PracticalQuestion'

interface Props {
  practiceId: string
  question: PracticalQuestion
}

const TYPE_LABEL: Record<string, string> = {
  'sql-tuning': 'SQL 튜닝',
  'troubleshooting': '성능 트러블슈팅',
}

const SUBTYPE_LABEL: Record<string, Record<number, string>> = {
  'sql-tuning': {
    1: '유형1: FILTER 비효율 → NL 세미조인',
    2: '유형2: 목표 실행계획 기반 SQL 작성',
    3: '유형3: 동적 쿼리 UNION ALL 분리',
  },
  'troubleshooting': {
    1: '유형1: NOT IN → Hash Anti Join',
    2: '유형2: 묵시적 형변환 원인분석 (서술형)',
  },
}

export default function PracticalDetailPage({ practiceId, question }: Props) {
  const typeLabel = TYPE_LABEL[question.type] ?? question.type
  const subtypeLabel = SUBTYPE_LABEL[question.type]?.[question.subType] ?? `유형${question.subType}`
  const pageTitle = `${typeLabel} ${subtypeLabel} | SQLP Quest`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`SQLP 실기 연습 — ${subtypeLabel}`} />
      </Head>

      <div className="flex flex-col h-full">
        {/* 상단 네비게이션 바 */}
        <div
          className="flex items-center gap-3 px-4 md:px-6 py-3 border-b"
          style={{ borderColor: 'var(--q-border)', background: 'var(--q-surface)' }}
        >
          <Link
            href="/quiz/practical"
            className="flex items-center gap-1 text-sm transition-colors hover:text-primary-600"
            style={{ color: 'var(--q-ink-3)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            실기 목록
          </Link>
          <span style={{ color: 'var(--q-ink-3)' }}>·</span>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#FEF9C3', color: '#854D0E' }}
            >
              {typeLabel}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--q-ink)' }}>
              {subtypeLabel}
            </span>
          </div>
          <span className="ml-auto text-xs" style={{ color: 'var(--q-ink-3)' }}>
            {practiceId}
          </span>
        </div>

        {/* 실기 풀이 컴포넌트 */}
        <div className="flex-1 overflow-hidden">
          <PracticalQuestionComponent
            question={question}
            practiceId={practiceId}
          />
        </div>

        {/* 하단 안내 */}
        <div
          className="px-4 py-2 border-t text-center text-xs"
          style={{ borderColor: 'var(--q-border)', color: 'var(--q-ink-3)', background: 'var(--q-surface)' }}
        >
          작성한 답안은 자동으로 저장됩니다 · 배점: 문항당 최대 15점
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = getPracticalQuestionIds()
  return {
    paths: ids.map((id) => ({ params: { practiceId: id } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const practiceId = params?.practiceId as string
  const question = getPracticalQuestionById(practiceId)

  if (!question) return { notFound: true }

  return {
    props: { practiceId, question },
  }
}
