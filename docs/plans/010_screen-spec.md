# 010 — 화면명세서 작성 (ai-dlc-screen-spec)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-screen-spec 스킬) |

## 배경 및 목적

실기 화면 SCR-012(실기 목록) · SCR-013(실기 풀이) 화면 상세 명세서 작성.
`docs/ai-dlc/README.md` 스킬 순서 ⑧번.

## 변경 범위

- 신규: `docs/ai-dlc/화면명세서_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (8/24)

## 검증 기준

- [x] SCR-012·013 상세 명세 생성
- [x] ASCII 레이아웃 다이어그램 (초기/제출후 2가지)
- [x] 4단계 상태 전환 이벤트 흐름 명세

## 배운 점

- SCR-013은 단순 PROC 화면이 아닌 **4단계 상태 머신** (작성→제출→모범답안→채점)
- BR-015 (모범답안 제출 후 공개)와 BR-014 (채점값 0/7/15)를 UI 상태로 구현 시 `isSubmitted` 플래그 하나로 관리 가능
- SQL textarea의 readOnly 전환: 제출 후에도 내용은 유지되어야 하므로 값 초기화 금지
- 공통 컴포넌트 5개 (ScenarioPanel, AnswerTextEditor, SampleAnswerToggle, ScoringGuide, PracticalCard) 명세화 → Phase D 구현 가이드로 활용
