# 004 — 화면목록 도출 (ai-dlc-screen-list)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-screen-list 스킬) |

## 배경 및 목적

요구사항정의서(FR-001~FR-023)를 기반으로 SQLP 사이트 전체 화면 목록을 도출한다.  
`docs/ai-dlc/README.md` 스킬 순서 ②번.

## 변경 범위

- 신규: `docs/ai-dlc/화면목록_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (완료 스킬 수 2/24)

## 검증 기준

- [x] `docs/ai-dlc/화면목록_SQLP_20260604.md` 생성
- [x] FR-001~FR-023 모든 기능이 화면에 매핑됨 (커버리지 100%)
- [x] 실기 화면 SCR-010(목록) · SCR-011(상세 풀이) 포함
- [x] `docs/ai-dlc/README.md` 진행 현황 갱신 (2/24)

## 배운 점

- SQLP는 로그인 없는 단일 액터(학습자) 구조 → 역할별 접근 매핑이 단순
- 동적 라우트(`/theory/[chapterId]`, `/practical/[practiceId]`)는 템플릿 화면 1개로 표현
- 실기 화면(SCR-011)에 ScenarioPanel·AnswerTextEditor·ScoringGuide 3개 컴포넌트 필요 → Phase 4 컴포넌트 설계에 반영 예정
- FR-019(진도 기록)는 여러 화면에서 공통 호출 → 공통 기능으로 명시
- 파일명 규칙이 `_DAP_Master_` → `_SQLP_`로 변경됨 (하네스 훅 패턴도 업데이트 필요)
