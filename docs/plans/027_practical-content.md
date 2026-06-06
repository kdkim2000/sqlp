# 027 — 실기 문제 콘텐츠 완성 (12문제)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Content Writer (Agent 2) |

## 생성 목표

`data/practical/questions.json` — 12문제 (실제 SQLP 시험 형식)

## 생성된 문제 목록 (12문제)

| ID | 유형 | 주제 |
|----|------|------|
| practical_001 | SQL튜닝 유형1 | 인덱스 컬럼 가공(TO_CHAR) → Full Scan 개선 |
| practical_002 | SQL튜닝 유형1 | NL 조인 Inner Table 인덱스 부재 → 인덱스 추가 |
| practical_003 | SQL튜닝 유형1 | 스칼라 서브쿼리 반복 → JOIN 변환 |
| practical_004 | SQL튜닝 유형2 | 대용량 집계 → Hash Join 힌트 작성 |
| practical_005 | SQL튜닝 유형2 | 소량 OLTP → NL Join + INDEX_DESC 힌트 |
| practical_006 | SQL튜닝 유형2 | ORDER BY 소트 제거 → 인덱스 설계 |
| practical_007 | SQL튜닝 유형3 | ERD 기반 Optional/Mandatory 관계 → Outer Join |
| practical_008 | SQL튜닝 유형3 | 파티션 테이블 → 파티션 프루닝 SQL |
| practical_009 | 트러블슈팅 유형1 | Row-by-Row 배치 → MERGE 집합 처리 |
| practical_010 | 트러블슈팅 유형1 | N+1 쿼리/Chatty → 단일 JOIN 쿼리 |
| practical_011 | 트러블슈팅 유형2 | AWR db file sequential read → Clustering Factor 분석 |
| practical_012 | 트러블슈팅 유형2 | Lock 경합 → 트랜잭션 범위 최소화 |

## 배운 점

- SQLP 실기 문제는 실행계획 분석·힌트 작성·인덱스 설계·트랜잭션 설계가 핵심
- content 마크다운에 테이블구조·인덱스현황·실행계획을 코드블록으로 표현 → 가독성 향상
- scoringGuide에 배점을 명시하여 자기채점 기준 명확화
