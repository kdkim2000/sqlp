import type { ChapterMeta } from '@/types'

export interface ChapterDef extends ChapterMeta {
  idPrefix: string
}

export const CHAPTERS: ChapterDef[] = [
  // 1과목: 데이터 모델링의 이해
  { id: 'part1_ch1', part: 1, chapter: 1, title: '데이터 모델링의 이해',        idPrefix: 'p1c1_', questionCount: 0 },
  { id: 'part1_ch2', part: 1, chapter: 2, title: '데이터 모델과 SQL',           idPrefix: 'p1c2_', questionCount: 0 },
  // 2과목: SQL 기본 및 활용
  { id: 'part2_ch1', part: 2, chapter: 1, title: 'SQL 기본',                    idPrefix: 'p2c1_', questionCount: 0 },
  { id: 'part2_ch2', part: 2, chapter: 2, title: 'SQL 활용',                    idPrefix: 'p2c2_', questionCount: 0 },
  { id: 'part2_ch3', part: 2, chapter: 3, title: '관리 구문',                   idPrefix: 'p2c3_', questionCount: 0 },
  // 3과목: SQL 고급활용 및 튜닝
  { id: 'part3_ch1', part: 3, chapter: 1, title: 'SQL 수행 구조',               idPrefix: 'p3c1_', questionCount: 0 },
  { id: 'part3_ch2', part: 3, chapter: 2, title: 'SQL 분석 도구',               idPrefix: 'p3c2_', questionCount: 0 },
  { id: 'part3_ch3', part: 3, chapter: 3, title: '인덱스 튜닝',                 idPrefix: 'p3c3_', questionCount: 0 },
  { id: 'part3_ch4', part: 3, chapter: 4, title: '조인 튜닝',                   idPrefix: 'p3c4_', questionCount: 0 },
  { id: 'part3_ch5', part: 3, chapter: 5, title: 'SQL 옵티마이저',              idPrefix: 'p3c5_', questionCount: 0 },
  { id: 'part3_ch6', part: 3, chapter: 6, title: '고급 SQL 튜닝',               idPrefix: 'p3c6_', questionCount: 0 },
  { id: 'part3_ch7', part: 3, chapter: 7, title: 'Lock과 트랜잭션 동시성 제어', idPrefix: 'p3c7_', questionCount: 0 },
]

export const CHAPTER_IDS = CHAPTERS.map((c) => c.id)

export const CHAPTER_BY_ID: Record<string, ChapterDef> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c])
)

export const CHAPTER_ID_PREFIX: Record<string, string> = Object.fromEntries(
  CHAPTERS.map((c) => [c.id, c.idPrefix])
)

export function getChapterById(id: string): ChapterDef | undefined {
  return CHAPTER_BY_ID[id]
}

export function getChapterTitle(id: string): string {
  return CHAPTER_BY_ID[id]?.title ?? id
}

export function getChapterFullLabel(id: string): string {
  const c = CHAPTER_BY_ID[id]
  if (!c) return id
  return `${c.part}과목 ${c.chapter}장 - ${c.title}`
}

export function getChapterIdByQuestionId(questionId: string): string | undefined {
  return CHAPTERS.find((c) => questionId.startsWith(c.idPrefix))?.id
}
