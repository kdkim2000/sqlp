'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PracticalAnswer } from '@/types'
import { useProgress } from '@/context/ProgressContext'

interface UsePracticalAnswerReturn {
  userAnswer: string
  isSubmitted: boolean
  selfScore: 0 | 7 | 15 | null
  handleAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: () => void
  handleScore: (score: 0 | 7 | 15) => void
}

/**
 * 실기 답안 localStorage 저장·복원 훅 (BR-016, BR-018)
 *
 * localStorage 키 구조:
 *   practical_{practiceId}_answer    — SQL 답안 텍스트 (실시간 저장)
 *   practical_{practiceId}_submitted — 제출 여부 ('true')
 *   practical_{practiceId}_score     — 자기채점 (0|7|15)
 *
 * 이중 소스 복원 전략:
 *   1순위: localStorage (최신 데이터, 실시간 저장)
 *   2순위: sqlp_progress.practicalAnswers (localStorage 초기화 시 fallback)
 */
export function usePracticalAnswer(practiceId: string): UsePracticalAnswerReturn {
  const { progress, savePracticalAnswer } = useProgress()

  const [userAnswer, setUserAnswer]   = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selfScore, setSelfScore]     = useState<0 | 7 | 15 | null>(null)

  // 마운트 시 이중 소스 복원 (localStorage → sqlp_progress fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedAnswer    = localStorage.getItem(`practical_${practiceId}_answer`)
    const storedSubmitted = localStorage.getItem(`practical_${practiceId}_submitted`)
    const storedScore     = localStorage.getItem(`practical_${practiceId}_score`)

    if (storedAnswer !== null) {
      // 1순위: localStorage에 데이터 있으면 우선 복원
      setUserAnswer(storedAnswer)
      if (storedSubmitted === 'true') setIsSubmitted(true)
      if (storedScore !== null) {
        const n = parseInt(storedScore, 10)
        if (n === 0 || n === 7 || n === 15) setSelfScore(n as 0 | 7 | 15)
      }
    } else {
      // 2순위: localStorage 없으면 sqlp_progress.practicalAnswers에서 복원
      const prev = (progress.practicalAnswers ?? []).find((a) => a.questionId === practiceId)
      if (prev) {
        setUserAnswer(prev.userAnswer)
        setSelfScore(prev.selfScore)
        setIsSubmitted(true)
        // localStorage 재동기화 — 이후 접근 시 1순위로 처리
        localStorage.setItem(`practical_${practiceId}_answer`, prev.userAnswer)
        localStorage.setItem(`practical_${practiceId}_submitted`, 'true')
        localStorage.setItem(`practical_${practiceId}_score`, String(prev.selfScore))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId]) // progress는 의도적으로 제외 — 마운트 시 1회만 복원

  /** SQL 답안 변경 시 localStorage 즉시 저장 (BR-016) */
  const handleAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      setUserAnswer(val)
      localStorage.setItem(`practical_${practiceId}_answer`, val)
    },
    [practiceId]
  )

  /** 답안 제출 — isSubmitted 전환 + 영속화 */
  const handleSubmit = useCallback(() => {
    setIsSubmitted(true)
    localStorage.setItem(`practical_${practiceId}_submitted`, 'true')
  }, [practiceId])

  /** 자기채점 선택 (BR-014) — localStorage 저장 + Context 동기화 */
  const handleScore = useCallback(
    (score: 0 | 7 | 15) => {
      setSelfScore(score)
      localStorage.setItem(`practical_${practiceId}_score`, String(score))
      const answer: PracticalAnswer = {
        questionId: practiceId,
        userAnswer,
        selfScore: score,
      }
      savePracticalAnswer(answer)
    },
    [practiceId, userAnswer, savePracticalAnswer]
  )

  return { userAnswer, isSubmitted, selfScore, handleAnswerChange, handleSubmit, handleScore }
}
