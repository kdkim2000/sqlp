import Head from 'next/head'
import type { GetStaticProps } from 'next'
import type { PracticalQuestion } from '@/types'
import { getPracticalQuestions } from '@/lib/questions'
import PracticalCard from '@/components/quiz/PracticalCard'

interface Props {
  sqlTuning: PracticalQuestion[]
  troubleshooting: PracticalQuestion[]
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="col-span-full text-center py-12 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--q-border)' }}>
      <p className="text-sm" style={{ color: 'var(--q-ink-3)' }}>{label} 문제가 준비 중입니다</p>
    </div>
  )
}

export default function PracticalPage({ sqlTuning, troubleshooting }: Props) {
  const sections = [
    { key: 'sql-tuning', title: 'SQL 튜닝 (3유형)', icon: '⚡', items: sqlTuning },
    { key: 'troubleshooting', title: '성능 트러블슈팅 (2유형)', icon: '🔍', items: troubleshooting },
  ]

  return (
    <>
      <Head>
        <title>실기 연습 | SQLP Quest</title>
        <meta name="description" content="SQLP 실기 — SQL 튜닝 및 성능 트러블슈팅 문제를 풀어보세요" />
      </Head>

      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-1" style={{ color: 'var(--q-ink)' }}>
            실기 연습
          </h1>
          <p className="text-sm" style={{ color: 'var(--q-ink-3)' }}>
            SQL 튜닝·성능 트러블슈팅 문제를 풀고 자기채점(0 / 7 / 15점)을 해보세요
          </p>
        </div>

        {/* 실기 채점 안내 */}
        <div className="q-card mb-8 p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--q-ink)' }}>문항 배점</p>
              <p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>문항당 최대 15점 × 2문항 = 30점</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--q-ink)' }}>자기채점</p>
              <p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>0점(오답) · 7점(부분) · 15점(만점)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--q-ink)' }}>풀이 흐름</p>
              <p className="text-xs" style={{ color: 'var(--q-ink-3)' }}>지문 확인 → SQL 작성 → 제출 → 모범답안 비교</p>
            </div>
          </div>
        </div>

        {/* 섹션별 문제 목록 */}
        {sections.map(({ key, title, icon, items }) => (
          <section key={key} className="mb-10">
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-amber-50">
              <span className="text-xl">{icon}</span>
              <h2 className="font-display font-bold text-base md:text-lg text-amber-700">{title}</h2>
              <span className="ml-auto text-xs font-medium" style={{ color: 'var(--q-ink-3)' }}>
                {items.length}문제
              </span>
            </div>

            {items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((q) => <PracticalCard key={q.id} question={q} />)}
              </div>
            ) : (
              <EmptySection label={title} />
            )}
          </section>
        ))}
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const all = getPracticalQuestions()
  return {
    props: {
      sqlTuning: all.filter((q) => q.type === 'sql-tuning'),
      troubleshooting: all.filter((q) => q.type === 'troubleshooting'),
    },
  }
}
