# 011 — 클래스 설계 수정 v0.2 (ai-dlc-class-revise)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-class-revise 스킬) |

## 수정 원인

화면명세서·데이터설계서 생성 후 검토 결과 3가지 누락 발견.

## 수정 항목

1. CLS-010 ProgressLib — `isExamPassed()` 메서드 추가
2. CLS-012 ChapterDef — 신규 인터페이스 정의
3. 공통 타입 별칭 섹션 추가

## 변경 범위

- 신규: `docs/ai-dlc/클래스설계서_SQLP_20260604_v0.2.md`
- 갱신: `docs/ai-dlc/README.md` (링크 업데이트)

## 배운 점

- 검토 결과 3가지 누락 발견 — 단순 명세 누락이 아니라 실제 구현 시 런타임 버그로 이어질 수 있는 항목들
- `isExamPassed()`는 result.tsx에서 반드시 필요한 함수 — 클래스 설계에 없으면 개발자가 별도로 구현하거나 BR 규칙을 알지 못할 수 있음
- `ChapterDef extends ChapterMeta` 패턴 — TypeScript에서 `extends`로 표현, Mermaid에서 `--|>` 화살표로 표현
- 타입 별칭은 클래스 노드가 아닌 별도 섹션으로 문서화하는 것이 적절 (classDiagram 노드는 인터페이스/클래스만)
