# 005 — 비즈니스 규칙 도출 (ai-dlc-biz-rules-create)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-biz-rules-create 스킬) |

## 배경 및 목적

요구사항정의서(FR-001~023)·화면목록(SCR-001~011)에서 SQLP 사이트 비즈니스 규칙을 도출한다.
`docs/ai-dlc/README.md` 스킬 순서 ③번.

## 변경 범위

- 신규: `docs/ai-dlc/비즈니스규칙_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (완료 스킬 수 3/24)

## 검증 기준

- [x] `docs/ai-dlc/비즈니스규칙_SQLP_20260604.md` 생성 (22건)
- [x] 합격 판정 BR-001·BR-002 (60점+과목별40%) 포함
- [x] 실기 자기채점 BR-014 (0/7/15) 포함
- [x] `docs/ai-dlc/README.md` 갱신 (3/24)

## 배운 점

- BR은 5개 도메인(시험/합격·문제풀이·모의고사·실기·진도데이터)으로 자연스럽게 분류됨
- BR-001과 BR-002는 AND 관계로 연계 — "합격" 판정 로직을 두 BR로 분리하면 테스트 가능
- localStorage SSR 가드(BR-018)는 Next.js Pages Router 특성에서 반드시 필요한 규칙
- 실기 자기채점 값(0/7/15)은 TypeScript `0 | 7 | 15` 리터럴 타입으로 강제해야 BR-014 보장 가능
