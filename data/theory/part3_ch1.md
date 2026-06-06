# 3과목 1장: SQL 수행 구조

## 1. 데이터베이스 아키텍처

### Oracle 아키텍처 구성

Oracle DBMS는 크게 **인스턴스(Instance)** 와 **데이터베이스(Database)** 로 구성된다.

```
[ Oracle 서버 ]
  ├── 인스턴스(Instance)
  │     ├── SGA (System Global Area)
  │     │     ├── DB Buffer Cache
  │     │     ├── Shared Pool (Library Cache, Data Dictionary Cache)
  │     │     ├── Redo Log Buffer
  │     │     └── Large Pool / Java Pool
  │     └── 백그라운드 프로세스
  │           ├── DBWR (Database Writer)
  │           ├── LGWR (Log Writer)
  │           ├── SMON (System Monitor)
  │           ├── PMON (Process Monitor)
  │           └── CKPT (Checkpoint)
  └── 데이터베이스(Database)
        ├── 데이터파일
        ├── Redo Log 파일
        └── 컨트롤 파일
```

### SGA (System Global Area) 주요 구성요소

| 구성요소 | 설명 | 역할 |
|---------|------|------|
| **DB Buffer Cache** | 디스크에서 읽은 데이터 블록을 캐싱 | 반복 I/O 최소화 |
| **Shared Pool** | SQL/PL SQL 파싱 결과·데이터 딕셔너리 캐싱 | 파싱 비용 절감 |
| **Library Cache** | 파싱된 SQL의 실행 계획 저장 | SQL 재사용 |
| **Data Dictionary Cache** | 테이블·인덱스 메타데이터 캐싱 | 파싱 속도 향상 |
| **Redo Log Buffer** | 변경 사항을 Redo Log에 쓰기 전 임시 저장 | 복구 보장 |

### PGA (Program Global Area)

서버 프로세스마다 **개별 할당**되는 메모리 영역. SGA와 달리 프로세스 간 공유되지 않음.

| SQL Work Area | 용도 | 부족 시 |
|-------------|------|--------|
| **Sort Area** | ORDER BY, GROUP BY, 인덱스 생성 | Temp Tablespace 사용 |
| **Hash Area** | 해시 조인, 해시 집계 | Temp Tablespace 사용 |
| **Bitmap Area** | 비트맵 인덱스 병합 | 성능 저하 |

```sql
-- PGA 관련 파라미터 확인
SHOW PARAMETER PGA_AGGREGATE_TARGET;  -- 전체 PGA 목표 크기
SHOW PARAMETER WORKAREA_SIZE_POLICY;  -- AUTO: PGA_AGGREGATE_TARGET으로 자동 관리

-- 세션별 PGA 사용량 확인
SELECT s.sid, s.pga_used_mem, s.pga_alloc_mem, s.pga_max_mem
FROM   V$SESSION s
WHERE  s.type = 'USER';
```

> **핵심**: `PGA_AGGREGATE_TARGET` 부족 시 정렬/해시 작업이 Temp Tablespace로 밀려나 성능 저하. `sort (disk)` 통계가 많으면 PGA 확장 검토.

### Buffer Cache 상세 구조

DB Buffer Cache는 **LRU (Least Recently Used)** 알고리즘으로 관리된다.

| Buffer Pool | 목적 | 적합 대상 |
|------------|------|---------|
| **Default Pool** | 일반 블록 캐싱 (LRU) | 대부분의 테이블/인덱스 |
| **Keep Pool** | 자주 사용하는 블록 영구 유지 | 소형 참조 테이블 |
| **Recycle Pool** | 재사용 가능성 낮은 블록 즉시 제거 | 대형 스캔 전용 |

```sql
-- 테이블별 Buffer Pool 지정
ALTER TABLE emp STORAGE (BUFFER_POOL KEEP);   -- Keep Pool 사용
ALTER TABLE log STORAGE (BUFFER_POOL RECYCLE); -- Recycle Pool 사용

-- Buffer Cache 히트율 확인
SELECT (1 - (phyrds / (gets + phyrds))) * 100 AS hit_ratio
FROM   (SELECT SUM(physical_reads) phyrds, SUM(db_block_gets + consistent_gets) gets
        FROM   V$BUFFER_POOL_STATISTICS);
-- 히트율 95% 이상이 목표
```

---

## 2. SQL 처리 과정

### SQL 처리 단계

```
사용자 SQL 입력
      │
      ▼
① 파싱 (Parsing)
  ├── 문법 검사 (Syntax Check)
  ├── 시맨틱 검사 (Semantic Check) - 테이블/컬럼 존재 여부
  └── Shared Pool 검색 (Soft Parse / Hard Parse)
      │
      ▼
② 최적화 (Optimization)
  ├── 쿼리 변환 (Query Transformation)
  ├── 비용 산정 (Cost Estimation)
  └── 실행 계획 생성 (Plan Generation)
      │
      ▼
③ 행 소스 생성 (Row Source Generation)
      │
      ▼
④ 실행 (Execution)
```

### Soft Parse vs Hard Parse

| 구분 | Soft Parse | Hard Parse |
|------|-----------|-----------|
| 발생 조건 | Shared Pool에 동일 SQL 존재 | 최초 실행 또는 캐시 만료 시 |
| 실행 계획 | 캐시에서 재사용 | 새로 생성 |
| 비용 | 낮음 | 높음 (파싱·최적화 전 과정 수행) |
| 방지법 | 바인드 변수 사용 | — |

```sql
-- Hard Parse 유발 (리터럴 사용)
SELECT * FROM emp WHERE empno = 1234;  -- 실행 계획 새로 생성
SELECT * FROM emp WHERE empno = 5678;  -- 또 새로 생성

-- Soft Parse 가능 (바인드 변수 사용)
SELECT * FROM emp WHERE empno = :empno;  -- 동일 SQL로 인식 → 재사용
```

### Parent Cursor vs Child Cursor

Shared Pool의 Library Cache는 SQL을 **Parent Cursor**와 **Child Cursor** 두 단계로 관리한다.

| 구분 | 설명 |
|------|------|
| **Parent Cursor** | SQL Text의 해시값으로 식별. 동일 텍스트 SQL의 공유 단위 |
| **Child Cursor** | Parent의 자식. 실행 환경(세션 설정, 바인드 변수 값 등)에 따라 여러 개 가능 |

```sql
-- SQL 공유 현황 확인
SELECT sql_id, child_number, executions, plan_hash_value
FROM   V$SQL
WHERE  sql_text LIKE '%emp%'
ORDER  BY sql_id, child_number;
-- child_number가 여러 개면 동일 SQL에 다른 실행 계획이 공존
```

> **핵심**: Child Cursor가 많이 생성되면 Hard Parse 빈도가 높아 성능 저하. 바인드 변수 사용과 세션 설정 일관성 유지가 중요.

### 바인드 변수의 중요성

- OLTP 환경에서 동일 SQL 구조를 반복 실행할 때 필수
- 리터럴 사용 시 Shared Pool 경합 및 Hard Parse 증가
- 단, 컬럼 값의 분포가 불균등한 경우 바인드 변수가 오히려 불리할 수 있음 (Bind Peeking)

---

## 3. 데이터베이스 I/O 메커니즘

### 논리적 I/O vs 물리적 I/O

| 구분 | 논리적 I/O (Logical Read) | 물리적 I/O (Physical Read) |
|------|--------------------------|---------------------------|
| 위치 | Buffer Cache에서 블록 읽기 | 디스크에서 블록 읽기 |
| 속도 | 빠름 (메모리) | 느림 (디스크) |
| 측정 | Consistent Gets + DB Block Gets | Physical Reads |

> **핵심**: 튜닝의 목표는 물리적 I/O를 줄이는 것이 아니라 **논리적 I/O를 줄이는 것**이다. 논리적 I/O가 줄면 물리적 I/O도 자연히 감소한다.

### Single Block I/O vs Multi Block I/O

| 구분 | Single Block I/O | Multi Block I/O |
|------|-----------------|-----------------|
| 발생 조건 | 인덱스 Range Scan, Unique Scan | Full Table Scan |
| 읽기 단위 | 1블록 | `db_file_multiblock_read_count` 값만큼 |
| 적합 대상 | 소량 데이터 조회 | 대량 데이터 Full Scan |

### Direct Path I/O

Buffer Cache를 거치지 않고 직접 디스크에 읽기/쓰기.
- 대용량 배치 처리, 병렬 쿼리에서 활용
- `/*+ PARALLEL */`, `/*+ NOLOGGING */` 힌트와 연관

### I/O 효율화 원칙

1. **인덱스 Range Scan**: 소량 데이터에 Single Block I/O
2. **Full Table Scan**: 대량 데이터(10~15% 이상)에 유리
3. **Clustered Factor**: 인덱스 클러스터링 팩터가 낮을수록 효율적
4. **Prefetch**: 예측 가능한 블록을 미리 읽어 I/O 대기 최소화

---

## 출제 포인트

- **SGA와 PGA의 차이**: SGA는 공유 메모리, PGA는 프로세스 전용 메모리
- **Buffer Pool 3종**: Default(LRU), Keep(영구 유지), Recycle(즉시 제거)
- **Shared Pool과 Library Cache**: SQL 재사용을 위한 핵심 구조
- **Parent Cursor vs Child Cursor**: 동일 SQL에 환경 다르면 Child가 여러 개
- **Hard Parse vs Soft Parse**: 바인드 변수 사용이 핵심 해결책
- **PGA_AGGREGATE_TARGET**: 자동 PGA 관리. 부족 시 Temp 사용 → 성능 저하
- **논리적 I/O가 물리적 I/O보다 중요**: 튜닝의 기본 관점
- **Single Block vs Multi Block I/O**: 인덱스 스캔(Single) vs Full Scan(Multi)
- **SQL 처리 4단계**: 파싱 → 최적화 → 행소스 생성 → 실행 순서
- **Buffer Cache 히트율**: 95% 이상 목표, V$BUFFER_POOL_STATISTICS로 확인
