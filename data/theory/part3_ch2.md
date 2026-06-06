# 3과목 2장: SQL 분석 도구

## 1. 예상 실행계획 (Execution Plan)

### 실행계획이란

옵티마이저가 SQL을 처리하기 위해 선택한 **처리 절차**를 트리 구조로 표현한 것.
각 노드는 Row Source이며, 처리 순서는 **안쪽(자식) → 바깥쪽(부모)** 순이다.

### 실행계획 확인 방법

```sql
-- 방법 1: EXPLAIN PLAN
EXPLAIN PLAN FOR
  SELECT * FROM emp e, dept d WHERE e.deptno = d.deptno;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- 방법 2: SET AUTOTRACE (SQL*Plus)
SET AUTOTRACE TRACEONLY EXPLAIN

-- 방법 3: V$SQL_PLAN (실제 수행된 SQL의 실행 계획)
SELECT * FROM V$SQL_PLAN WHERE sql_id = '...';
```

### 실행계획 읽는 법

```
-------------------------------------------------
| Id | Operation            | Name     | Rows |
-------------------------------------------------
|  0 | SELECT STATEMENT     |          |    1 |
|  1 |  NESTED LOOPS        |          |    1 |
|  2 |   TABLE ACCESS FULL  | DEPT     |    4 |
|* 3 |   INDEX RANGE SCAN   | EMP_IDX  |    3 |
-------------------------------------------------
```

> **읽기 규칙**: 들여쓰기가 가장 깊은 것부터, 같은 레벨은 위에서 아래 순서로 실행

### 주요 실행계획 오퍼레이션

| 오퍼레이션 | 설명 |
|-----------|------|
| TABLE ACCESS FULL | Full Table Scan |
| TABLE ACCESS BY INDEX ROWID | 인덱스로 ROWID 획득 후 테이블 접근 |
| INDEX UNIQUE SCAN | Unique 인덱스 단건 조회 |
| INDEX RANGE SCAN | 인덱스 범위 스캔 |
| INDEX FAST FULL SCAN | 인덱스 전체를 Multi Block으로 스캔 |
| NESTED LOOPS | NL 조인 |
| HASH JOIN | 해시 조인 |
| SORT MERGE JOIN | 소트 머지 조인 |
| SORT (ORDER BY) | 정렬 |
| SORT (GROUP BY) | 그룹 집계 |
| FILTER | 조건 필터링 |
| VIEW | 인라인 뷰 또는 뷰 |

### Predicate Information (조건 정보)

```
Predicate Information (identified by operation id):
---------------------------------------------------
   3 - access("E"."DEPTNO"="D"."DEPTNO")
       filter("E"."SAL" > 3000)
```

| 유형 | 역할 | 성능 영향 |
|------|------|---------|
| **access** | 인덱스 Range 범위 결정 (최초 스캔 시작점~종료점) | 스캔 범위 최소화 핵심 |
| **filter** | access 후 추가 체 조건 (모든 블록 읽고 체크) | 불필요한 블록 읽기 발생 가능 |

```sql
-- access vs filter 차이 예시
-- 인덱스: (deptno, sal)

-- 조건 1: deptno = 10 AND sal > 2000
-- → access("DEPTNO"=10) filter("SAL">2000) 
--   deptno=10인 범위에서 sal을 체로 거름

-- 조건 2: deptno = 10 AND sal BETWEEN 2000 AND 5000
-- → access("DEPTNO"=10 AND "SAL">=2000 AND "SAL"<=5000)
--   BETWEEN은 인덱스 Range 범위로 직접 활용 → 더 효율적
```

> **핵심**: filter 조건을 access 조건으로 바꾸는 것이 튜닝의 핵심. 인덱스 컬럼 순서 조정으로 가능.

### Plan Hash Value

동일한 실행 계획을 식별하는 **해시 값**. SQL Text가 달라도 실행 계획이 같으면 동일한 Plan Hash Value.

```sql
-- SQL ID와 Plan Hash Value 확인
SELECT sql_id, plan_hash_value, executions, elapsed_time/executions AS avg_elapsed
FROM   V$SQL
WHERE  sql_text LIKE '%emp%'
ORDER  BY avg_elapsed DESC;

-- 특정 SQL의 실행 계획 변경 이력 추적
SELECT plan_hash_value, timestamp, optimizer, cost
FROM   V$SQL_PLAN_STATISTICS_ALL
WHERE  sql_id = 'abc12345xyz'
ORDER  BY timestamp;
-- plan_hash_value가 바뀌면 실행 계획이 변경된 것
```

---

## 2. SQL 트레이스 (SQL Trace)

### SQL 트레이스 활성화

```sql
-- 세션 레벨 활성화
ALTER SESSION SET SQL_TRACE = TRUE;
-- 또는
EXEC DBMS_SESSION.SET_SQL_TRACE(TRUE);

-- 특정 세션 활성화 (DBA 권한)
EXEC DBMS_SYSTEM.SET_SQL_TRACE_IN_SESSION(sid, serial#, TRUE);
```

### tkprof 변환 도구

SQL Trace 파일(`.trc`)을 사람이 읽기 쉬운 형식으로 변환.

```bash
tkprof trace_file.trc output.txt sys=no sort=prsela,exeela,fchela
```

### tkprof 결과 해석

```
call     count  cpu    elapsed   disk   query  current  rows
-------- -----  -----  -------   ----   -----  -------  ----
Parse        1  0.01   0.01         0       0        0     0
Execute      1  0.00   0.00         0       0        0     0
Fetch        2  0.05   0.12        10     100        0    14
-------- -----  -----  -------   ----   -----  -------  ----
total        4  0.06   0.13        10     100        0    14
```

| 항목 | 설명 |
|------|------|
| count | 호출 횟수 |
| cpu | CPU 사용 시간 |
| elapsed | 경과 시간 (wait 포함) |
| disk | 물리적 I/O 블록 수 |
| query | Consistent Mode 논리적 읽기 |
| current | Current Mode 논리적 읽기 |
| rows | 처리 건수 |

> **elapsed vs cpu**: elapsed - cpu = 대기 시간. 대기 시간이 길면 I/O 또는 Lock 대기 의심

### 10046 이벤트 (확장 트레이스)

```sql
-- 레벨 4: 바인드 변수 포함
ALTER SESSION SET EVENTS '10046 TRACE NAME CONTEXT FOREVER, LEVEL 4';

-- 레벨 8: Wait 이벤트 포함
ALTER SESSION SET EVENTS '10046 TRACE NAME CONTEXT FOREVER, LEVEL 8';

-- 레벨 12: 바인드 변수 + Wait 이벤트
ALTER SESSION SET EVENTS '10046 TRACE NAME CONTEXT FOREVER, LEVEL 12';
```

---

## 3. 응답 시간 분석 (Response Time Analysis)

### 응답 시간의 구성

```
응답 시간 = 서비스 시간 + 대기 시간
           = CPU 시간 + I/O 대기 + Lock 대기 + 네트워크 대기 + ...
```

### Wait Event 분류 체계

Wait Event는 **발생 원인에 따라 5개 카테고리**로 분류된다.

| 카테고리 | 대표 Wait Event | 의미 |
|---------|---------------|------|
| **User I/O** | db file sequential read, db file scattered read | 실제 디스크 I/O |
| **System I/O** | control file I/O, log file parallel write | 시스템 파일 I/O |
| **Concurrency** | buffer busy waits, latch: library cache | 내부 경합 |
| **Application** | enq: TX - row lock contention | 애플리케이션 설계 문제 |
| **Configuration** | log file sync, log buffer space | 설정 최적화 필요 |

| Wait Event | 원인 | 해결책 |
|-----------|------|--------|
| db file sequential read | 인덱스 Range Scan, Single Block I/O | 인덱스 최적화, Clustering Factor 개선 |
| db file scattered read | Full Table Scan, Multi Block I/O | 인덱스 추가 또는 파티션 |
| buffer busy waits | Buffer Cache 블록 경합 (핫 블록) | Reverse Key Index, 파티션 분산 |
| latch: library cache | Shared Pool 경합, 과도한 Hard Parse | 바인드 변수 사용 |
| enq: TX - row lock contention | 행 잠금 대기 | 트랜잭션 크기 최소화, 잠금 순서 조정 |
| log file sync | COMMIT 대기, LGWR 디스크 쓰기 | 배치 COMMIT, 빠른 디스크 |

### DB Time 개념

```
DB Time = On CPU Time + Wait Time(non-idle)

On CPU Time: 실제 CPU 연산
Non-Idle Wait: db file sequential read, buffer busy waits 등 실질적 대기
Idle Wait: SQL*Net message from client (클라이언트 응답 기다리는 시간, 제외)
```

```sql
-- AWR에서 DB Time 기반 Top 5 Wait Event 확인
SELECT event, time_waited_micro/1000000 AS seconds_waited,
       ROUND(time_waited_micro * 100 / db_time, 1) AS pct_of_db_time
FROM   DBA_HIST_SYSTEM_EVENT e,
       (SELECT SUM(time_waited_micro) AS db_time FROM DBA_HIST_SYSTEM_EVENT
        WHERE wait_class != 'Idle') t
WHERE  e.wait_class != 'Idle'
ORDER  BY seconds_waited DESC
FETCH FIRST 5 ROWS ONLY;
```

> **튜닝 방향**: DB Time에서 차지하는 비율이 높은 Wait Event를 우선 해결

### AWR (Automatic Workload Repository)

Oracle의 성능 통계 자동 수집 도구 (10g 이상).

```sql
-- AWR 보고서 생성
SELECT OUTPUT FROM TABLE(DBMS_WORKLOAD_REPOSITORY.AWR_REPORT_TEXT(
  dbid       => :dbid,
  inst_num   => 1,
  bid        => :begin_snap_id,
  eid        => :end_snap_id
));
```

### ASH (Active Session History)

현재 활성 세션의 샘플링 데이터 (1초 간격). Wait Event 분석에 활용.

```sql
SELECT event, count(*) AS cnt
FROM   V$ACTIVE_SESSION_HISTORY
WHERE  sample_time > SYSDATE - 1/24
GROUP  BY event
ORDER  BY cnt DESC;
```

---

## 출제 포인트

- **실행계획 읽기 순서**: 안쪽(깊은 들여쓰기) → 바깥쪽, 같은 레벨은 위→아래
- **access vs filter**: access는 인덱스 Range 범위 결정, filter는 체 조건 (성능 차이 큼)
- **Plan Hash Value**: 실행 계획 변경 여부 추적에 활용 (V$SQL)
- **tkprof 주요 컬럼**: elapsed vs cpu, elapsed-cpu=대기시간
- **10046 이벤트 레벨**: 4(바인드변수), 8(Wait), 12(바인드+Wait)
- **Wait Event 5개 카테고리**: User I/O / System I/O / Concurrency / Application / Configuration
- **db file sequential read**: 인덱스 Single Block I/O (User I/O)
- **db file scattered read**: Full Scan Multi Block I/O (User I/O)
- **DB Time**: On CPU + Non-Idle Wait, Idle Wait 제외
- **응답 시간 = 서비스 시간 + 대기 시간** 공식 기억
