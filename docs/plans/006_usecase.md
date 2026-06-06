# 006 — 유즈케이스 도출 (ai-dlc-usecase-create)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-usecase-create 스킬) |

## 배경 및 목적

FR-001~023 + SCR-001~011 + BR-001~022 기반으로 학습자 행위 유즈케이스 8건 도출.
`docs/ai-dlc/README.md` 스킬 순서 ④번.

## 변경 범위

- 신규: `docs/ai-dlc/유즈케이스_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (4/24)

## 검증 기준

- [x] UC 8건 생성 (UC-001~UC-008)
- [x] FR-001~023 전체 커버리지 (100%)
- [x] Mermaid graph LR 다이어그램 포함 (UC 간 이동 흐름 포함)
- [x] README.md 갱신 (4/24)

## 배운 점

- 단일 액터(학습자) 구조이므로 UC 다이어그램보다 **UC 간 흐름 연결**이 더 중요 (UC-003→UC-004, UC-008→UC-001/002 등)
- FR-019(진도 기록)는 여러 UC에서 공통 호출되는 시스템 동작 → 별도 UC가 아닌 사후 조건으로 처리
- 분석 단계(UC 포함) 4개 스킬 완료 → `ai-dlc-class-design`(설계 단계)로 진입 준비
