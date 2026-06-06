# 015 — 실기 페이지 생성 (Phase D)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Quiz Builder (Agent 5) |

## 생성 파일

- `components/quiz/PracticalQuestion.tsx` — 실기 풀이 4단계 UI
- `pages/quiz/practical.tsx` — SCR-012 실기 목록
- `pages/practical/[practiceId].tsx` — SCR-013 실기 풀이
- `lib/questions.ts` 수정 — getPracticalQuestionIds() 추가

## 검증 기준

- [x] /quiz/practical 정상 렌더링 구현 (빈 배열 시 "준비 중" 안내)
- [x] /practical/[id] SSG 경로 생성 (getPracticalQuestionIds → fallback: false)
- [x] 4단계 상태 전환 (isSubmitted·showSampleAnswer·selfScore)
- [x] localStorage 실시간 저장 + 마운트 시 복원
- [x] GNB "실기" 메뉴 추가

## 배운 점

- PracticalQuestion 컴포넌트는 `'use client'`가 필요 — useState/useEffect 사용
- pages/practical/[practiceId].tsx 에서 getStaticPaths가 빈 배열 반환해도 빌드 성공 (fallback: false)
- 실기 지문/모범답안 모두 Markdown이므로 ScenarioPanel 재사용 가능 (같은 파일에 함수 정의)
- localStorage 키 패턴: `practical_{practiceId}_answer`, `_submitted`, `_score` — 각각 분리 저장
