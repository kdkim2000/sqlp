import type { ProgressStore, AnswerResult, ExamResult, Stats, PracticalAnswer } from '@/types'
import { getAllQuestions } from '@/lib/questions'

const STORAGE_KEY = 'sqlp_progress'
const MAX_EXAM_HISTORY = 10

const isBrowser = typeof window !== 'undefined'

function defaultProgress(): ProgressStore {
  return {
    answers: {},
    bookmarks: [],
    lastVisited: null,
    examHistory: [],
    practicalAnswers: [],
  }
}

export function loadProgress(): ProgressStore {
  if (!isBrowser) return defaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as ProgressStore
    // defaultProgress와 병합하여 새 필드(practicalAnswers 등) 누락 방어
    return {
      ...defaultProgress(),
      ...parsed,
      // 구 데이터(part3Score 없음) 호환 — undefined 접근 방지
      examHistory: (parsed.examHistory ?? []).map((r) => ({
        ...r,
        part3Score: r.part3Score ?? 0,
      })),
    }
  } catch (err) {
    console.warn('[progress] failed to parse stored progress, resetting', err)
    return defaultProgress()
  }
}

export function saveProgress(store: ProgressStore): void {
  if (!isBrowser) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function markAnswer(id: string, result: AnswerResult): void {
  const store = loadProgress()
  store.answers[id] = result
  saveProgress(store)
}

export function toggleBookmark(id: string): void {
  const store = loadProgress()
  const idx = store.bookmarks.indexOf(id)
  if (idx === -1) {
    store.bookmarks.push(id)
  } else {
    store.bookmarks.splice(idx, 1)
  }
  saveProgress(store)
}

export function saveExamResult(result: ExamResult): void {
  const store = loadProgress()
  store.examHistory = [result, ...store.examHistory].slice(0, MAX_EXAM_HISTORY)
  saveProgress(store)
}

/** 실기 자기채점 답안 저장 (upsert) */
export function savePracticalAnswer(answer: PracticalAnswer): void {
  const store = loadProgress()
  if (!store.practicalAnswers) store.practicalAnswers = []
  const idx = store.practicalAnswers.findIndex((a) => a.questionId === answer.questionId)
  if (idx === -1) {
    store.practicalAnswers.push(answer)
  } else {
    store.practicalAnswers[idx] = answer
  }
  saveProgress(store)
}

export function resetProgress(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEY)
}

/** SQLP 합격 판정: 전체 60점 이상 + 과목별 40% 이상 */
export function isExamPassed(result: ExamResult): boolean {
  return (
    result.score >= 60 &&
    result.part1Score >= 4 &&   // 1과목 10점 만점 × 40%
    result.part2Score >= 8 &&   // 2과목 20점 만점 × 40%
    result.part3Score >= 16     // 3과목 40점 만점 × 40%
  )
}

export function getStats(): Stats {
  const store = loadProgress()
  const questions = getAllQuestions()

  const byChapter: Stats['byChapter'] = {}
  const byPart: Stats['byPart'] = {
    1: { total: 0, correct: 0, attempted: 0 },
    2: { total: 0, correct: 0, attempted: 0 },
    3: { total: 0, correct: 0, attempted: 0 },
  }

  for (const q of questions) {
    if (!byChapter[q.chapter]) {
      byChapter[q.chapter] = { total: 0, correct: 0, attempted: 0 }
    }
    byChapter[q.chapter].total++
    if (byPart[q.part]) byPart[q.part].total++

    const result = store.answers[q.id]
    if (result && result !== 'skipped') {
      byChapter[q.chapter].attempted++
      if (byPart[q.part]) byPart[q.part].attempted++
      if (result === 'correct') {
        byChapter[q.chapter].correct++
        if (byPart[q.part]) byPart[q.part].correct++
      }
    }
  }

  const total = questions.length
  const attempted = Object.values(store.answers).filter((r) => r !== 'skipped').length
  const correct = Object.values(store.answers).filter((r) => r === 'correct').length

  return { total, attempted, correct, byChapter, byPart }
}
