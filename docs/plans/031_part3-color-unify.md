# 031 — 3과목 색상 통일 (홈 대시보드 ↔ 이론 목록)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-06 |
| 상태 | DONE |
| 담당 | Dashboard Builder (Agent 7) |

## 문제

`/`(홈) 의 ChapterProgress 컴포넌트에서 3과목 배지·진행 바가 2과목과 동일한 green 색상을 사용했다.
`/theory` 이론 목록 페이지는 3과목에 amber(`text-amber-600` / `bg-amber-50`) 를 사용하여 불일치.

## 수정 내용

`components/dashboard/ChapterProgress.tsx`:
- 과목 배지: `bg-green-100 text-green-700` (else) → `ch.part === 3` 분기 추가 → `bg-amber-50 text-amber-600`
- 진행 바: `bg-green-500` (else) → `ch.part === 3` 분기 추가 → `bg-amber-500`

## 과목별 색상 기준 (theory/index.tsx 기준)

| 과목 | 배지 bg | 배지 text | 진행 바 |
|------|---------|----------|--------|
| 1과목 | `bg-blue-100` | `text-blue-700` | `bg-blue-500` |
| 2과목 | `bg-green-100` | `text-green-700` | `bg-green-500` |
| 3과목 | `bg-amber-50` | `text-amber-600` | `bg-amber-500` |

> theory/index.tsx의 3과목 기준: `text-amber-600` / `bg-amber-50`

## 수정 파일

- `components/dashboard/ChapterProgress.tsx`
