# 017 — 실기 답안 localStorage 저장·복원 패턴 (ai-dlc-fe-state-guide)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Quiz Builder (Agent 5) |

## 배경

PracticalQuestion.tsx 내 localStorage 로직을 커스텀 훅으로 분리.
단일 책임 원칙, 테스트 가능성, 재사용성 향상.

## 생성/수정 파일

- 신규: `lib/usePracticalAnswer.ts`
- 수정: `components/quiz/PracticalQuestion.tsx`

## localStorage 키 구조

```
practical_{practiceId}_answer     — SQL 답안
practical_{practiceId}_submitted  — 제출 여부
practical_{practiceId}_score      — 자기채점
```

## 검증 기준

- [x] lib/usePracticalAnswer.ts 생성 (JSDoc 주석 포함)
- [x] PracticalQuestion.tsx에서 직접 useState/useEffect/localStorage 제거
- [x] PracticalQuestion.tsx가 순수 렌더링 컴포넌트로 간결해짐 (~80줄)

## 배운 점

- `'use client'` 지시어가 필요한 훅은 파일 상단에 선언 (Next.js Pages Router에서는 사실 불필요하지만 명시적으로 표시)
- localStorage 키 구조를 `practical_{id}_answer|submitted|score`로 통일 → 키 충돌 방지
- 훅에서 useProgress()를 호출하면 Context 의존성이 훅 내부로 이동 → 컴포넌트 테스트 시 훅만 모킹하면 됨
- PracticalQuestion.tsx의 `showSampleAnswer`는 localStorage 불필요(세션 내 UI 상태) → 컴포넌트에 유지
