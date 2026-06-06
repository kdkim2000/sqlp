# 025 — 최종 코드 리뷰 (SQLD 잔재 집중 점검)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | QA (Agent 8) |

## 검증 기준

- [x] 소스코드 내 SQLD 잔재 0건 (ts, tsx, json 전체)
- [x] 발견된 3건 즉시 수정 완료
- [x] README.md SQLD → SQLP 전면 재작성

## 수정 내역

| 파일 | 수정 내용 |
|------|---------|
| `data/theory/part1_ch2.md` | "데이터 모델과 성능" → "데이터 모델과 SQL" (SQLD→SQLP 챕터명) |
| `components/layout/Sidebar.tsx` | 동일 챕터명 수정 |
| `README.md` | SQLD 전체 내용 → SQLP 전면 재작성 (3과목·70문항·180분·실기 포함) |

## 의도적 SQLD 참조 (수정 불필요)

| 파일 | 내용 | 이유 |
|------|------|------|
| `docs/harness/AGENTS.md:186` | "레이아웃 구조는 SQLD와 동일 유지" | 역사적 맥락 설명 |
| `docs/harness/PRD.md:7` | "SQLD 취득 후" | SQLP 대상 사용자 정의 (사실 정보) |

## 배운 점

- SQLD→SQLP 전환 시 README.md를 빠뜨리기 쉬움 → 최종 리뷰 필수
- 챕터명(데이터 모델과 성능 → 데이터 모델과 SQL)이 데이터 파일에 잔재했음
- 레거시 파일(Sidebar.tsx)에도 구 챕터명이 남아있었음
- Grep을 통한 전수 검사가 효과적 (ts/tsx/md/json 파일 포함)
