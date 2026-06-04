# 003 — 요구사항정의서 생성 (ai-dlc-requirements)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-requirements 스킬) |

## 배경 및 목적

`docs/ai-dlc/README.md`에 완료(✅) 표시된 `요구사항정의서_DAP_Master_20260603.md`가 실제 파일로 존재하지 않는다. CLAUDE.md 기준(SQLP 3과목) 요구사항정의서를 새로 생성한다.

## 변경 범위

- 신규: `docs/ai-dlc/요구사항정의서_DAP_Master_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (링크 업데이트)

## 검증 기준

- [x] `docs/ai-dlc/요구사항정의서_DAP_Master_20260604.md` 생성
- [x] FR 항목이 CLAUDE.md 시험 구조와 일치 (FR-001~FR-023, 총 23건)
- [x] 실기 요구사항(SQL튜닝 FR-014~FR-018, 트러블슈팅 포함) 포함
- [x] `docs/ai-dlc/README.md` 링크 갱신

## 배운 점

- 기존 `요구사항정의서_DAP_Master_20260603.md`는 README에 참조만 있고 실제 파일이 없었음 → 날짜를 20260604로 변경하여 신규 생성
- FR 23건, 비기능(PR+SR+QR+IR+DR+CR) 16건, 총 39건 도출
- 실기 요구사항(FR-014~FR-018)이 SQLP만의 핵심 신규 기능임을 명확히 구분
- ai-dlc-requirements 스킬은 template.md의 자리표시자를 순서대로 채우는 방식 — 입력 소스(CLAUDE.md, PRD.md)가 충실할수록 품질이 높아짐
