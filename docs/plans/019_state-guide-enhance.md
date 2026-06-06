# 019 — 실기 답안 상태 관리 강화 (ai-dlc-fe-state-guide)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Quiz Builder (Agent 5) |

## 배경 및 목적

usePracticalAnswer 복원 로직에 이중 소스(localStorage + sqlp_progress) 적용.
localStorage 초기화 후에도 이전 답안 복원 가능.

## 수정 파일

- `lib/usePracticalAnswer.ts` — fallback 복원 로직 추가

## 검증 기준

- [x] localStorage 없는 경우 sqlp_progress.practicalAnswers에서 복원
- [x] 복원 후 localStorage 재동기화 (이후 1순위 처리)
- [x] 최초 방문 시 빈 상태 유지 (prev 없음 → 초기값)

## 배운 점

- `useEffect` 의존성에서 `progress`를 의도적으로 제외 → 마운트 시 1회만 복원 (eslint-disable 주석 추가)
- 이중 소스 패턴: localStorage(실시간) + sqlp_progress(영구) → 데이터 내구성 향상
- fallback 복원 후 localStorage 재동기화가 중요 → 이후 재방문 시 localStorage 1순위로 처리
- `storedAnswer !== null` (null 체크)와 `storedAnswer` (falsy 체크)의 차이: 빈 문자열('')도 localStorage에 저장되어 있으면 1순위로 처리
