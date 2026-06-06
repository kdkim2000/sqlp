import Head from 'next/head'
import Link from 'next/link'
import { useProgress } from '@/context/ProgressContext'
import { CHAPTERS } from '@/lib/chapters'
import { isExamPassed } from '@/lib/progress'

const PART_META: Record<number, { label: string; icon: string; color: string; bg: string; hoverBorder: string }> = {
  1: { label: '1과목 데이터 모델링의 이해', icon: '🗂️', color: 'text-primary-600', bg: 'bg-primary-50',  hoverBorder: 'hover:border-primary-300' },
  2: { label: '2과목 SQL 기본 및 활용',    icon: '🛢️', color: 'text-mint-500',    bg: 'bg-mint-50',     hoverBorder: 'hover:border-mint-500'    },
  3: { label: '3과목 SQL 고급활용 및 튜닝', icon: '⚡', color: 'text-amber-600',   bg: 'bg-amber-50',    hoverBorder: 'hover:border-amber-400'   },
}

export default function QuizIndex() {
  const { stats, progress } = useProgress()

  const wrongCount    = Object.values(progress.answers).filter((r) => r === 'wrong').length
  const bookmarkCount = progress.bookmarks.length

  const part1 = CHAPTERS.filter((c) => c.part === 1)
  const part2 = CHAPTERS.filter((c) => c.part === 2)
  const part3 = CHAPTERS.filter((c) => c.part === 3)

  return (
    <>
      <Head>
        <title>문제 풀기 | SQLP Quest</title>
      </Head>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-1" style={{ color: 'var(--q-ink)' }}>
            문제 풀기
          </h1>
          <p className="text-sm" style={{ color: 'var(--q-ink-3)' }}>
            전체 {stats.total}문제 중 {stats.attempted}문제 풀이 완료 &middot; 정답률{' '}
            {stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0}%
          </p>
        </div>

        {/* 챕터별 문제풀기 */}
        <section className="mb-8">
          {[
            { part: 1, items: part1 },
            { part: 2, items: part2 },
            { part: 3, items: part3 },
          ].map(({ part, items }) => {
            const meta = PART_META[part]
            return (
              <div key={part} className="mb-8">
                {/* 과목 헤더 */}
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl ${meta.bg}`}>
                  <span className="text-xl">{meta.icon}</span>
                  <h2 className={`font-display font-bold text-base md:text-lg ${meta.color}`}>
                    {meta.label}
                  </h2>
                  <span className="ml-auto text-xs font-medium" style={{ color: 'var(--q-ink-3)' }}>
                    {items.length}챕터
                  </span>
                </div>

                {/* 챕터 카드 */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((ch) => (
                    <Link
                      key={ch.id}
                      href={`/quiz/chapter/${ch.id}`}
                      className={`group q-card hover:shadow-q-md transition-all ${meta.hoverBorder}`}
                    >
                      <p className={`text-xs font-semibold mb-1 ${meta.color}`}>
                        {part}과목 · {ch.chapter}장
                      </p>
                      <p className="font-medium text-sm" style={{ color: 'var(--q-ink)' }}>
                        {ch.title}
                      </p>
                      <p className="text-xs mt-2" style={{ color: 'var(--q-ink-3)' }}>
                        문제 풀기 →
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* 특별 모드 */}
        <section className="mb-8">
          <h2 className="font-display font-bold text-base mb-3" style={{ color: 'var(--q-ink-2)' }}>
            특별 모드
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 모의고사 1회 */}
            <Link
              href="/quiz/exam?n=1"
              className="flex flex-col items-center p-5 rounded-2xl text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7F56D9, #6941C6)' }}
            >
              <span className="text-3xl mb-2">📝</span>
              <span className="font-bold text-base">모의고사 1회</span>
              <span className="text-xs mt-1 opacity-80">70문항 · 180분</span>
            </Link>

            {/* 모의고사 2회 */}
            <Link
              href="/quiz/exam?n=2"
              className="flex flex-col items-center p-5 rounded-2xl text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #53389E, #42307D)' }}
            >
              <span className="text-3xl mb-2">📋</span>
              <span className="font-bold text-base">모의고사 2회</span>
              <span className="text-xs mt-1 opacity-80">70문항 · 180분</span>
            </Link>

            {/* 오답 노트 */}
            <Link
              href="/quiz/wrong"
              className={`flex flex-col items-center p-5 rounded-2xl transition-all ${
                wrongCount > 0
                  ? 'bg-red-50 border-2 border-red-200 hover:border-red-400'
                  : 'bg-gray-50 border-2 border-gray-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl mb-2">📌</span>
              <span className="font-bold text-base text-gray-800">오답 노트</span>
              <span className="text-xs mt-1 text-gray-500">{wrongCount}문제</span>
            </Link>

            {/* 북마크 */}
            <Link
              href="/quiz/bookmarks"
              className={`flex flex-col items-center p-5 rounded-2xl transition-all ${
                bookmarkCount > 0
                  ? 'bg-amber-50 border-2 border-amber-200 hover:border-amber-400'
                  : 'bg-gray-50 border-2 border-gray-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl mb-2">🔖</span>
              <span className="font-bold text-base text-gray-800">북마크</span>
              <span className="text-xs mt-1 text-gray-500">{bookmarkCount}문제</span>
            </Link>
          </div>
        </section>

        {/* 최근 모의고사 기록 */}
        {progress.examHistory.length > 0 && (
          <section className="q-card">
            <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--q-ink-2)' }}>
              최근 모의고사 기록
            </h2>
            <div className="space-y-3">
              {progress.examHistory.slice(0, 5).map((exam) => {
                const passed = isExamPassed(exam)
                return (
                  <div
                    key={exam.date}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 border-b last:border-0"
                    style={{ borderColor: 'var(--q-border)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--q-ink-3)' }}>
                      {new Date(exam.date).toLocaleDateString('ko-KR')}
                    </span>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
                        1과목 {exam.part1Score}점
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-mint-50 text-mint-500 font-medium">
                        2과목 {exam.part2Score}점
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                        3과목 {exam.part3Score ?? 0}점
                      </span>
                      <span
                        className="font-bold text-sm"
                        style={{ color: passed ? '#039855' : '#BE123C' }}
                      >
                        {exam.score}점 {passed ? '✓ 합격' : '✗ 불합격'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* SQLP 합격 기준 안내 */}
            <div className="mt-4 rounded-xl px-4 py-3 text-xs" style={{ background: 'var(--q-surface-soft)', color: 'var(--q-ink-3)' }}>
              <span className="font-semibold" style={{ color: 'var(--q-ink-2)' }}>SQLP 합격 기준</span>
              &nbsp;— 총점 60점 이상 &amp; 1과목 4점↑ &amp; 2과목 8점↑ &amp; 3과목 16점↑ (각 과목 40% 이상)
            </div>
          </section>
        )}
      </div>
    </>
  )
}
