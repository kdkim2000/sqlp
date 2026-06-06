import type { Question, PracticalQuestion } from '@/types'
import { CHAPTER_IDS } from '@/lib/chapters'
import part1ch1 from '@/data/questions/part1_ch1.json'
import part1ch2 from '@/data/questions/part1_ch2.json'
import part2ch1 from '@/data/questions/part2_ch1.json'
import part2ch2 from '@/data/questions/part2_ch2.json'
import part2ch3 from '@/data/questions/part2_ch3.json'
import part3ch1 from '@/data/questions/part3_ch1.json'
import part3ch2 from '@/data/questions/part3_ch2.json'
import part3ch3 from '@/data/questions/part3_ch3.json'
import part3ch4 from '@/data/questions/part3_ch4.json'
import part3ch5 from '@/data/questions/part3_ch5.json'
import part3ch6 from '@/data/questions/part3_ch6.json'
import part3ch7 from '@/data/questions/part3_ch7.json'
import exam1 from '@/data/mockexam/exam1.json'
import exam2 from '@/data/mockexam/exam2.json'
import practicalData from '@/data/practical/questions.json'

const CHAPTER_DATA: Record<string, Question[]> = {
  // Part 1
  part1_ch1: part1ch1 as Question[],
  part1_ch2: part1ch2 as Question[],
  // Part 2
  part2_ch1: part2ch1 as Question[],
  part2_ch2: part2ch2 as Question[],
  part2_ch3: part2ch3 as Question[],
  // Part 3
  part3_ch1: part3ch1,
  part3_ch2: part3ch2,
  part3_ch3: part3ch3,
  part3_ch4: part3ch4,
  part3_ch5: part3ch5,
  part3_ch6: part3ch6,
  part3_ch7: part3ch7,
}

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

export function getAllQuestions(): Question[] {
  return CHAPTER_IDS.flatMap((id) => CHAPTER_DATA[id] ?? [])
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return CHAPTER_DATA[chapterId] ?? []
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const all = getAllQuestions()
  const idSet = new Set(ids)
  return all.filter((q) => idSet.has(q.id))
}

/** SQLP 모의고사: 1과목 10 + 2과목 20 + 3과목 40 = 70문항 */
export function sampleExamQuestions(): Question[] {
  const all = getAllQuestions()
  const part1 = all.filter((q) => q.part === 1)
  const part2 = all.filter((q) => q.part === 2)
  const part3 = all.filter((q) => q.part === 3)

  return [
    ...shuffle(part1).slice(0, 10),
    ...shuffle(part2).slice(0, 20),
    ...shuffle(part3).slice(0, 40),
  ]
}

export function getMockExamQuestions(examNum: 1 | 2): Question[] {
  return (examNum === 1 ? exam1 : exam2) as Question[]
}

export function getAllQuestionsFromAllSources(): Question[] {
  return [
    ...getAllQuestions(),
    ...(exam1 as Question[]),
    ...(exam2 as Question[]),
  ]
}

/**
 * 혼합 랜덤 모의고사 문항 선정 (출제 방식: '혼합 랜덤')
 * - 목표: Part 1(10) + Part 2(20) + Part 3(40) = 70문항
 * - Part 3 JSON 미생성 시 Part 3 분량 제외 → 30문항 반환
 * @returns 선정된 Question 배열
 */
export function sampleMixedExam(): Question[] {
  const all = getAllQuestionsFromAllSources()
  const part1Pool = all.filter((q) => q.part === 1)
  const p2c1 = all.filter((q) => q.part === 2 && q.chapter === 'part2_ch1')
  const p2c2 = all.filter((q) => q.part === 2 && q.chapter === 'part2_ch2')
  const p2c3 = all.filter((q) => q.part === 2 && q.chapter === 'part2_ch3')
  const part3Pool = all.filter((q) => q.part === 3)

  return [
    ...shuffle(part1Pool).slice(0, 10),
    ...shuffle(p2c1).slice(0, 8),
    ...shuffle(p2c2).slice(0, 8),
    ...shuffle(p2c3).slice(0, 4),
    ...shuffle(part3Pool).slice(0, 40),
  ]
}

/** 실기 문제 로드 (data/practical/questions.json) */
export function getPracticalQuestions(): PracticalQuestion[] {
  return practicalData as PracticalQuestion[]
}

/** 실기 문제 ID 목록 — getStaticPaths에서 사용 */
export function getPracticalQuestionIds(): string[] {
  return getPracticalQuestions().map((q) => q.id)
}

/** 실기 문제 단건 조회 */
export function getPracticalQuestionById(id: string): PracticalQuestion | undefined {
  return getPracticalQuestions().find((q) => q.id === id)
}

export { CHAPTER_IDS }
