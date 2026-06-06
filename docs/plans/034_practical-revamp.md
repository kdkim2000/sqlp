# 034 — `/quiz/practical` 실기 문제 전면 재작성

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-06 |
| 상태 | DONE |
| 담당 | Content Writer (Agent 2) |

## 문제

현재 12문항 (`data/practical/questions.json`)은 공식 SQLP 실기 시험 유형과 불일치.
- 유형 레이블: 실제 시험 유형명 미반영 (FILTER/NL 세미조인, Hash Anti Join 등 없음)
- 문제 내용: 실제 SQLP 시험 힌트 구문·실행계획·서술형 구조 미반영
- 문항 수: 12문항 → 5문항으로 정리 (각 유형 1문항, 대표 고품질 문제)

## 공식 SQLP 실기 5유형

| # | type | subType | 유형명 |
|---|------|---------|--------|
| 1 | sql-tuning | 1 | FILTER 비효율 → NL 세미조인 (UNNEST/NL_SJ/QB_NAME) |
| 2 | sql-tuning | 2 | 목표 실행계획 기반 SQL (LEADING/USE_HASH/SWAP_JOIN_INPUTS) |
| 3 | sql-tuning | 3 | 동적 쿼리 UNION ALL 분리 (Static SQL 전환) |
| 4 | troubleshooting | 1 | NOT IN → Hash Anti Join (HASH_AJ 힌트) |
| 5 | troubleshooting | 2 | 묵시적 형변환 원인분석 (서술형) |

## 수정 파일

- `data/practical/questions.json` — 5문항 전면 재작성
- `components/quiz/PracticalCard.tsx` — SUBTYPE_LABEL 업데이트
- `pages/practical/[practiceId].tsx` — SUBTYPE_LABEL 업데이트
- `docs/plans/034_practical-revamp.md` — 본 파일

## 검증

- `npm run build` 성공 (SSG 5개 경로 생성)
- 각 문항 페이지 접속·답안 저장 확인
