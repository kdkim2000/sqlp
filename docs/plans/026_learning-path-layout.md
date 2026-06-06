# 026 — LearningPath 3줄 레이아웃 (ai-dlc-nxt-code-revise)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Dashboard Builder (Agent 7) |

## 수정 파일

- `components/dashboard/LearningPath.tsx` — 1줄 → 3줄 레이아웃

## 변경 내용

- 기존: 모든 노드(12+BOSS) 1줄 가로 배치 (`min-w-max flex`)
- 변경: 3과목 × 3행 + BOSS 별도 행 (`flex-col`)
- `PathNode` 인터페이스에 `part` 필드 추가 → 과목별 그룹핑
- 버블 크기 살짝 축소 (52→44, BOSS 64→56) → 7챕터 3과목 행 가로 여유 확보
- `PART_LABEL` 상수로 과목 레이블 정의

## 배운 점

- 3과목 7챕터 행이 가장 길어서 버블 크기 조정이 필요했음
- `flex-wrap` 추가로 7챕터 행이 너무 길면 2줄로 자동 분리 가능
- BOSS 노드를 별도 행(border-t 구분선)으로 분리하면 시각적으로 더 명확
