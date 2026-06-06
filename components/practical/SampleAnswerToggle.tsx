'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface SampleAnswerToggleProps {
  /** 제출 완료 여부 — false면 잠금 상태 (BR-015) */
  isSubmitted: boolean
  /** 모범 답안 마크다운 텍스트 */
  sampleAnswer: string
  /** 채점 기준 텍스트 (선택) */
  scoringGuide?: string
}

/**
 * 모범 답안 공개/숨김 토글 컴포넌트 (BR-015)
 * - isSubmitted=false: 잠금 상태, 버튼 비활성
 * - isSubmitted=true: 토글 버튼 활성화, 클릭으로 내용 공개/숨김
 * - showAnswer는 세션 UI 상태 → localStorage 저장 불필요
 */
export default function SampleAnswerToggle({ isSubmitted, sampleAnswer, scoringGuide }: SampleAnswerToggleProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--q-border)' }}>
      {/* 토글 버튼 */}
      <button
        onClick={() => isSubmitted && setShowAnswer((p) => !p)}
        disabled={!isSubmitted}
        aria-expanded={isSubmitted ? showAnswer : undefined}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
        style={{
          background: 'var(--q-surface)',
          color: isSubmitted ? 'var(--q-ink)' : 'var(--q-ink-3)',
          cursor: isSubmitted ? 'pointer' : 'not-allowed',
        }}
      >
        <span>
          {isSubmitted
            ? (showAnswer ? '👁 모범답안 숨기기' : '👁 모범답안 보기')
            : '🔒 답안 제출 후 공개'}
        </span>
        {isSubmitted && (
          <span className="text-xs" style={{ color: 'var(--q-ink-3)' }}>
            {showAnswer ? '▲' : '▼'}
          </span>
        )}
      </button>

      {/* 모범 답안 내용 */}
      {isSubmitted && showAnswer && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'var(--q-border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--q-ink-3)' }}>모범 답안</p>
          <div className="prose-quiz text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {sampleAnswer}
            </ReactMarkdown>
          </div>
          {scoringGuide && (
            <div className="mt-3 p-3 rounded-lg bg-primary-50">
              <p className="text-xs font-semibold text-primary-700 mb-1">채점 기준</p>
              <p className="text-xs text-primary-600 whitespace-pre-line">{scoringGuide}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
