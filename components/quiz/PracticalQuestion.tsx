'use client'

import type { PracticalQuestion as PracticalQuestionType } from '@/types'
import { usePracticalAnswer } from '@/lib/usePracticalAnswer'
import ScenarioPanel from '@/components/practical/ScenarioPanel'
import AnswerTextEditor from '@/components/practical/AnswerTextEditor'
import SampleAnswerToggle from '@/components/practical/SampleAnswerToggle'
import ScoringGuide from '@/components/practical/ScoringGuide'

interface Props {
  question: PracticalQuestionType
  practiceId: string
}

export default function PracticalQuestion({ question, practiceId }: Props) {
  const { userAnswer, isSubmitted, selfScore, handleAnswerChange, handleSubmit, handleScore } =
    usePracticalAnswer(practiceId)

  const typeLabel    = question.type === 'sql-tuning' ? 'SQL 튜닝' : '성능 트러블슈팅'
  const subtypeLabel = `${typeLabel} 유형${question.subType}`

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full" style={{ minHeight: '70vh' }}>

      {/* ── 좌측: 지문 패널 ── */}
      <div
        className="lg:w-1/2 p-5 border-r overflow-y-auto"
        style={{ borderColor: 'var(--q-border)', background: 'var(--q-surface)' }}
      >
        <ScenarioPanel content={question.content} typeLabel={subtypeLabel} />
      </div>

      {/* ── 우측: 답안 입력 + 채점 ── */}
      <div
        className="lg:w-1/2 p-5 flex flex-col gap-4"
        style={{ background: 'var(--q-surface-soft)' }}
      >
        <AnswerTextEditor
          value={userAnswer}
          onChange={handleAnswerChange}
          readOnly={isSubmitted}
        />

        {/* 제출 버튼 */}
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors"
          >
            제출 및 모범답안 확인
          </button>
        ) : (
          <div
            className="w-full py-2.5 rounded-xl text-center text-sm font-medium border"
            style={{ borderColor: '#12B76A', color: '#039855', background: '#ECFDF3' }}
          >
            ✓ 제출 완료
          </div>
        )}

        <SampleAnswerToggle
          isSubmitted={isSubmitted}
          sampleAnswer={question.sampleAnswer}
          scoringGuide={question.scoringGuide}
        />

        <ScoringGuide
          selfScore={selfScore}
          onScore={handleScore}
          disabled={!isSubmitted}
        />
      </div>
    </div>
  )
}
