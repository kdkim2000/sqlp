# 013 — Part 3 이론 MD 심화 보완 (ai-dlc-data-revise)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Content Writer (Agent 2) |

## 배경 및 목적

Part 3 이론 MD 초안(012) 검토 결과 평균 72% 완성도.
SQLP 시험 빈도 높은 고급 개념 +420줄 보완하여 86% 수준으로 향상.

## 보완 파일 목록

- ch1: Buffer Cache LRU, PGA Work Area, Parent/Child Cursor, Prefetch
- ch2: Predicate Information 심화, Plan Hash Value, Wait Event 분류, DB Time
- ch3: Bitmap Index, 인덱스 통계 해석, 재구성 조건, 정량적 기준
- ch4: Anti/Semi-Join, EXISTS vs IN, Driving Table 정량 기준
- ch5: 히스토그램 종류, Dynamic Sampling, ACS, WITH절, Stale Statistics
- ch6: PARALLEL 힌트, GTT, Window Function 비용, 파티션 인덱스, Result Cache
- ch7: ITL, CR Block, Lock Mode 호환성 매트릭스, 교착 상태 예방

## 검증 기준

- [x] 7개 파일 수정 완료 (~420줄 추가)
- [x] SQL 코드 예시 포함 (Buffer Pool, V$SQL, Bitmap Index, Anti-Join 등)
- [x] 출제 포인트 섹션 보완 (각 챕터 2~4항목 추가)

## 배운 점

- ch5(옵티마이저)에 히스토그램·Dynamic Sampling·ACS·WITH절 추가 — 가장 고급 내용으로 분량 증가가 컸음
- ch7에 ITL·CR Block 추가 — MVCC 메커니즘의 내부 구현 이해에 중요
- 출제 포인트는 단순 나열보다 "비교" 형태(예: UNION vs UNION ALL)가 시험에 더 유용
- ch3 Bitmap Index는 DW 환경 특수 케이스이지만 SQLP에서 자주 출제
