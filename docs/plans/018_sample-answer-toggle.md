# 018 — SampleAnswerToggle 컴포넌트 생성

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Quiz Builder (Agent 5) |

## 배경

화면명세서 SCR-013 명세 컴포넌트 중 SampleAnswerToggle 미생성.
components/practical/ 4종 완비 목표.

## 생성/수정 파일

- 신규: `components/practical/SampleAnswerToggle.tsx`
- 수정: `components/quiz/PracticalQuestion.tsx` (showSampleAnswer state 제거)

## 배운 점

- SampleAnswerToggle의 `showAnswer` state는 컴포넌트 내부에서 관리 (세션 UI 상태 → localStorage 불필요)
- `aria-expanded` 속성 추가로 접근성 향상
- PracticalQuestion.tsx가 이제 순수 조립(composition) 컴포넌트 — 상태 없음, import만 있음
- ScoringGuide에서 `scoringGuide` prop을 제거 → SampleAnswerToggle이 담당하도록 책임 이동
