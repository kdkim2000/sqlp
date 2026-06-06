# 007 — 클래스 설계서 작성 (ai-dlc-class-design)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-class-design 스킬) |

## 배경 및 목적

UC-001~008 + BR-001~022 + 기존 코드 기반으로 SQLP TypeScript 인터페이스·클래스 설계서 작성.
`docs/ai-dlc/README.md` 스킬 순서 ⑤번.

## 변경 범위

- 신규: `docs/ai-dlc/클래스설계서_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (5/24)

## 검증 기준

- [x] 클래스설계서 생성 (CLS-001~CLS-011, 총 11건)
- [x] PracticalQuestion(CLS-002)·PracticalAnswer(CLS-003) 신규 인터페이스
- [x] Question.part: 1|2|3 반영 (CLS-001)
- [x] Mermaid classDiagram 포함

## 배운 점

- 서버리스 SSG 프로젝트는 Controller/Repository 레이어 없이 Types→Lib→Context→Component→Pages 5레이어가 더 적합
- 기존 `progress.ts`의 `byPart` 초기화가 `{1:{}, 2:{}}` 뿐 → Part 3 추가 시 `{1:{}, 2:{}, 3:{}}` 확장 필요 (버그 주의)
- `PracticalAnswer.selfScore`를 `0|7|15` 리터럴 타입으로 선언하면 TypeScript가 자동으로 BR-014 강제 적용
- `STORAGE_KEY` 변경(`sqld_progress` → `sqlp_progress`)은 기존 데이터 마이그레이션이 불필요함 (다른 키이므로 새 시작)
