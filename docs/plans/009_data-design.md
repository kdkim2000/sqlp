# 009 — 데이터 설계서 작성 (ai-dlc-data-design)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | DONE |
| 담당 | Orchestrator (ai-dlc-data-design 스킬) |

## 배경 및 목적

Part 3 이론MD·문제JSON·실기JSON·모의고사JSON 스키마 설계서 작성.
`docs/ai-dlc/README.md` 스킬 순서 ⑦번.

## 변경 범위

- 신규: `docs/ai-dlc/데이터설계서_SQLP_20260604.md`
- 갱신: `docs/ai-dlc/README.md` (7/24)

## 검증 기준

- [x] 4종 데이터 구조 스키마 정의 (이론MD·객관식JSON·실기JSON·모의고사JSON)
- [x] Part 3 챕터별 문항 목표 수 명시 (총 220문항, ch3·ch4·ch6 각 40문항)
- [x] 실기 JSON 스키마 (PracticalQuestion 인터페이스 기반, 12문제 목표)

## 배운 점

- ai-dlc-data-design 스킬은 RDBMS 기반이지만, "DB 없음" 명시 시 파일 스키마 설계로 전환 가능
- 실기 문제(practical_*.json)의 content 필드는 마크다운이므로 지문 작성 시 헤딩 구조 일관성 중요
- 모의고사 JSON은 Question 배열 그대로 — 별도 래퍼 없이 챕터 문제를 직접 샘플링
- validate-questions.ts에 실기 JSON 검증 로직 추가 필요 (현재 객관식만 검증)
