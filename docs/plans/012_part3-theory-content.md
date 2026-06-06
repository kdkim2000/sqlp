# 012 — Part 3 이론 MD 초안 생성 (ai-dlc-data-design Phase 2)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Content Writer (Agent 2) |

## 배경 및 목적

docs/ai-dlc/README.md Phase 2 — `ai-dlc-data-design` 스킬로 Part 3 이론 마크다운 초안 생성.
데이터설계서(⑦)에 정의된 구조(# → ## → ### → 출제포인트)로 7챕터 작성.

## 생성 대상

| 파일 | 챕터 | 주요 항목 |
|------|------|---------|
| `part3_ch1.md` | SQL 수행 구조 | DB 아키텍처, SQL 처리 과정, I/O 메커니즘 |
| `part3_ch2.md` | SQL 분석 도구 | 예상 실행계획, SQL 트레이스, 응답 시간 분석 |
| `part3_ch3.md` | 인덱스 튜닝 | 기본 원리, 테이블 액세스 최소화, 스캔 효율화, 인덱스 설계 |
| `part3_ch4.md` | 조인 튜닝 | NL·소트머지·해시 조인, 스칼라 서브쿼리, 고급 조인 |
| `part3_ch5.md` | SQL 옵티마이저 | 옵티마이징 원리, SQL 공유/재사용, 쿼리 변환 |
| `part3_ch6.md` | 고급 SQL 튜닝 | 소트·DML·DB Call·파티셔닝·배치 튜닝 |
| `part3_ch7.md` | Lock과 트랜잭션 | Lock, 트랜잭션, 동시성 제어 |

## 검증 기준

- [x] 7개 파일 `data/theory/part3_ch1~ch7.md` 생성
- [x] 각 파일 `## 출제 포인트` 섹션 포함
- [x] 헤딩 구조 준수 (`#` → `##` → `###`)
- [x] SQL 코드 블록 ` ```sql ` 적용
- [x] docs/ai-dlc/README.md 갱신 (9/24)

## 배운 점

- Part 3 SQLP 이론은 SQL 튜닝 실무 깊이가 높아 각 챕터당 300~500줄 분량 필요
- ch3(인덱스)·ch4(조인)·ch5(옵티마이저)가 SQLP 실기 문제와 직결되는 핵심 챕터
- 실제 코드 예시(힌트, 실행계획 해석 등) 포함 시 학습 효과 높음
- `ai-dlc-data-revise`로 심화 내용 추가 예정 (특히 ch3 실행계획 판독, ch6 배치 패턴)
