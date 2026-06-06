# 008 — Next.js 구현 계획 (ai-dlc-nxt-impl-plan)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-nxt-impl-plan 스킬) |

## 배경 및 목적

CLS-001~011 + SCR-001~011 + UC-001~008 기반으로 Pages Router 구현 계획서 작성.
`docs/ai-dlc/README.md` 스킬 순서 ⑥번.

## 변경 범위

- 신규: `docs/ai-dlc/구현계획서_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (6/24)

## 검증 기준

- [x] 구현계획서 생성 (Phase A~E + QA)
- [x] 파일별 변경 16개·신규 17개 구분 표시
- [x] SSG 라우트 12개 (`getStaticPaths` 패턴) 명세

## 배운 점

- ai-dlc-nxt-impl-plan 스킬은 App Router 기반이지만, 입력 인자로 "Pages Router + SSG" 명시하면 올바르게 적응됨
- Phase C (Quiz + Theory) 는 병렬 실행 가능: 서로 다른 파일 소유 (components/quiz vs components/theory)
- 실기 페이지 SSG: `getPracticalQuestions()` 로 동적 경로 생성 — `data/practical/questions.json` 이 빌드 전에 존재해야 함 (Phase B 선행 필수)
- 설계 단계 6개 스킬 완료 (분석 4 + 설계 2) → 구현 Phase A 진입 준비 완료
