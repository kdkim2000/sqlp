# 3과목 5장: SQL 옵티마이저

## 1. SQL 옵티마이징 원리

### 옵티마이저 (Optimizer) 개요

SQL의 최적 실행 계획을 수립하는 DBMS 핵심 모듈. 크게 **규칙 기반(RBO)** 과 **비용 기반(CBO)** 으로 구분되며, 현재 DBMS는 모두 CBO를 사용한다.

### 비용 기반 옵티마이저 (CBO) 동작

```
SQL 입력
  → 쿼리 변환 (Query Transformation)
  → 비용 산정 (Cost Estimation)
       ├── 통계 정보 참조 (테이블, 인덱스, 컬럼 통계)
       ├── 선택도 계산 (Selectivity)
       └── 카디널리티 계산 (Cardinality)
  → 실행 계획 선택 (Plan Generation)
```

### 통계 정보 (Statistics)

CBO가 비용을 계산하는 기반 데이터.

```sql
-- 통계 수집
EXEC DBMS_STATS.GATHER_TABLE_STATS('SCOTT', 'EMP', CASCADE => TRUE);
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('SCOTT');

-- 통계 확인
SELECT num_rows, blocks, avg_row_len, last_analyzed
FROM   user_tables
WHERE  table_name = 'EMP';
```

| 통계 항목 | 설명 |
|---------|------|
| num_rows | 테이블 행 수 |
| blocks | 데이터 블록 수 |
| avg_row_len | 평균 행 길이 |
| num_distinct | 유일값 수 (컬럼 통계) |
| density | 1/num_distinct, 선택도 |
| histogram | 데이터 분포 정보 |

### 히스토그램 (Histogram)

컬럼 값의 **분포**를 저장하여 CBO가 더 정확한 카디널리티 예측.

| 종류 | 설명 | 적용 조건 |
|------|------|---------|
| **Frequency** | 각 값의 빈도를 정확히 저장 | distinct_values ≤ 254개 |
| **Height-Balanced** | 전체를 254 버킷으로 나눠 근사 저장 | distinct_values > 254 |
| **Top-Frequency** | 상위 빈도 값만 정확히 저장 (12c+) | 편향 분포, 고카디널리티 |
| **Hybrid** | Frequency + Height-Balanced 혼합 (12c+) | 일반적인 경우 |

```sql
-- 히스토그램 수집
EXEC DBMS_STATS.GATHER_TABLE_STATS('SCOTT', 'EMP',
  METHOD_OPT => 'FOR COLUMNS deptno SIZE 254');

-- 히스토그램 확인
SELECT column_name, histogram, num_distinct, num_buckets
FROM   user_tab_col_statistics
WHERE  table_name = 'EMP';
```

> **핵심**: 데이터 분포가 균등하지 않으면 히스토그램 필수. 히스토그램 없으면 CBO가 균등 분포로 가정 → 잘못된 실행 계획 가능.

### Stale Statistics (오래된 통계)

테이블 데이터가 크게 변경되었는데 통계를 갱신하지 않으면 CBO가 잘못된 비용 계산.

```sql
-- 통계 수집 일자 확인
SELECT table_name, num_rows, last_analyzed,
       CASE WHEN last_analyzed < SYSDATE - 30 THEN '갱신 필요' ELSE '최신' END AS status
FROM   user_tables
ORDER  BY last_analyzed;

-- 자동 통계 수집 설정 (Oracle 10g+)
EXEC DBMS_AUTO_TASK_ADMIN.ENABLE(
  client_name => 'auto optimizer stats collection', operation => NULL, window_name => NULL);
```

### Dynamic Sampling

통계가 없거나 오래된 경우 CBO가 **실행 시점에 일부 블록을 직접 샘플링**하여 비용 계산.

```sql
-- Dynamic Sampling 힌트 (레벨 2: 기본)
SELECT /*+ DYNAMIC_SAMPLING(2) */ * FROM temp_table WHERE col = 100;
-- 레벨 0: 비활성, 레벨 1~10: 샘플링 블록 수 증가
-- 레벨 2가 기본 권장

-- 세션 레벨 설정
ALTER SESSION SET OPTIMIZER_DYNAMIC_SAMPLING = 2;
```

### 선택도 (Selectivity)와 카디널리티 (Cardinality)

```
선택도 = 조건을 만족하는 행 비율 (0 ~ 1)
카디널리티 = 전체 행 수 × 선택도

예) WHERE deptno = 10, deptno의 distinct = 4
  선택도 = 1/4 = 0.25
  카디널리티 = 1000(전체) × 0.25 = 250건
```

---

## 2. SQL 공유 및 재사용

### Shared Pool과 Library Cache

Shared Pool의 Library Cache는 파싱된 SQL의 **실행 계획을 저장**하여 재사용.

```
SQL 실행 요청
  → Library Cache 검색 (SQL Text 해시값으로 비교)
  ├── 있음 (Soft Parse): 저장된 실행 계획 재사용
  └── 없음 (Hard Parse): 새로 파싱·최적화·저장
```

### SQL 공유 조건

SQL은 **정확히 동일한 텍스트**여야만 Library Cache에서 재사용된다.

```sql
-- 공유 불가 (동일 로직이지만 다른 SQL)
SELECT * FROM emp WHERE empno = 7788;
select * from emp where empno = 7788;  -- 대소문자 다름
SELECT * FROM emp WHERE empno = 7369;  -- 리터럴값 다름

-- 공유 가능 (바인드 변수로 동일 SQL)
SELECT * FROM emp WHERE empno = :empno;  -- 항상 동일 SQL
```

### 바인드 변수 사용의 장단점

| 구분 | 장점 | 단점 |
|------|------|------|
| 바인드 변수 사용 | Hard Parse 감소, Library Cache 절약 | Bind Peeking 문제 가능 |
| 리터럴 사용 | 컬럼 분포에 맞는 최적 실행 계획 | SQL별 별도 파싱, Cache 낭비 |

### Adaptive Cursor Sharing (ACS)

Bind Peeking의 단점을 보완한 Oracle 11g 이상의 기능. **바인드 변수 값에 따라 다른 실행 계획**을 선택할 수 있도록 Child Cursor를 여러 개 유지.

```sql
-- ACS 동작 확인
SELECT sql_id, child_number, is_bind_sensitive, is_bind_aware, executions
FROM   V$SQL
WHERE  sql_text LIKE '%emp%deptno%';
-- IS_BIND_SENSITIVE=Y: 바인드 값에 따라 실행 계획 민감
-- IS_BIND_AWARE=Y: 실제로 다른 실행 계획 사용 중
```

### Bind Peeking 문제

Oracle 9i 이상에서 **첫 번째 실행 시 바인드 변수 값을 엿보아** 실행 계획 수립.
이후 동일 SQL에 다른 값이 들어와도 첫 번째 실행 계획을 재사용.

```sql
-- 데이터 분포: deptno=10(10건), deptno=30(800건)
SELECT * FROM emp WHERE deptno = :deptno;
-- 첫 실행: :deptno = 10 → Index Range Scan 선택
-- 이후 실행: :deptno = 30 → 여전히 Index Range Scan (비효율)
```

---

## 3. 쿼리 변환 (Query Transformation)

### 쿼리 변환이란

옵티마이저가 **더 효율적인 실행 계획**을 위해 SQL을 내부적으로 변환하는 과정.
결과는 동일하지만 처리 방식이 바뀜.

### 주요 쿼리 변환 종류

#### 뷰 Merging (View Merging)

```sql
-- 원본 SQL (인라인 뷰)
SELECT * FROM (SELECT empno, ename FROM emp WHERE deptno = 10) v
WHERE  ename LIKE 'S%';

-- 옵티마이저 변환 후
SELECT empno, ename FROM emp
WHERE  deptno = 10 AND ename LIKE 'S%';
-- → 하나의 쿼리로 합쳐 인덱스 최적 활용 가능
```

#### 서브쿼리 Unnesting

```sql
-- 원본 (비상관 서브쿼리)
SELECT * FROM emp
WHERE  deptno IN (SELECT deptno FROM dept WHERE loc = 'NEW YORK');

-- 옵티마이저 변환 (조인으로 변환)
SELECT e.* FROM emp e, dept d
WHERE  e.deptno = d.deptno AND d.loc = 'NEW YORK';
```

#### 조건절 Pushing

```sql
-- 원본
SELECT * FROM (SELECT e.ename, d.dname FROM emp e, dept d WHERE e.deptno = d.deptno)
WHERE  ename = 'SCOTT';

-- 변환 (조건을 뷰 안으로 Push)
SELECT e.ename, d.dname FROM emp e, dept d
WHERE  e.deptno = d.deptno AND e.ename = 'SCOTT';
```

#### OR Expansion

```sql
-- 원본
SELECT * FROM emp WHERE deptno = 10 OR deptno = 20;

-- 변환 (UNION ALL로 분리 → 각각 인덱스 사용)
SELECT * FROM emp WHERE deptno = 10
UNION ALL
SELECT * FROM emp WHERE deptno = 20;
```

### 힌트를 통한 변환 제어

```sql
-- 뷰 Merging 방지
SELECT /*+ NO_MERGE(v) */ * FROM (SELECT * FROM emp WHERE deptno = 10) v;

-- 서브쿼리 Unnesting 방지
SELECT * FROM emp WHERE deptno IN (SELECT /*+ NO_UNNEST */ deptno FROM dept);

-- 조건절 Pushing 방지
SELECT /*+ NO_PUSH_PRED */ * FROM (SELECT * FROM emp) v WHERE v.ename = 'SCOTT';
```

---

### WITH 절 (Subquery Factoring)

반복 사용되는 서브쿼리를 **임시 결과**로 한 번만 실행하여 재사용.

```sql
-- 일반 서브쿼리 (동일 서브쿼리 2번 실행)
SELECT * FROM (SELECT deptno, AVG(sal) avg_sal FROM emp GROUP BY deptno) v1
WHERE  avg_sal > (SELECT AVG(sal) FROM emp);

-- WITH 절로 최적화 (한 번만 실행)
WITH dept_avg AS (
  SELECT deptno, AVG(sal) avg_sal FROM emp GROUP BY deptno
),
total_avg AS (
  SELECT AVG(sal) total_avg FROM emp
)
SELECT d.deptno, d.avg_sal
FROM   dept_avg d, total_avg t
WHERE  d.avg_sal > t.total_avg;
```

> **힌트**: `/*+ MATERIALIZE */` — 임시 결과를 물리적으로 저장 (큰 서브쿼리에 유리)
> **힌트**: `/*+ INLINE */` — 매번 인라인으로 실행 (작은 서브쿼리에 유리)

---

## 출제 포인트

- **CBO 동작 순서**: 쿼리 변환 → 비용 산정(통계 기반) → 실행 계획 선택
- **통계 수집**: DBMS_STATS.GATHER_TABLE_STATS 사용
- **히스토그램 4종류**: Frequency, Height-Balanced, Top-Frequency, Hybrid
- **히스토그램 필요 조건**: 데이터 분포 불균등 → 없으면 균등 분포 가정
- **Dynamic Sampling**: 통계 없을 때 실행 시 샘플링, 레벨 2가 기본
- **Stale Statistics**: 오래된 통계 → 잘못된 실행 계획 → 주기적 갱신 필요
- **선택도 공식**: 1 / num_distinct (균등 분포 가정)
- **SQL 공유 조건**: 대소문자·공백 하나까지 동일해야 함
- **Bind Peeking**: 첫 실행 바인드 값으로 실행 계획 결정 → 이후 비효율 가능
- **ACS (Adaptive Cursor Sharing)**: 바인드 값별 최적 Child Cursor 유지 (11g+)
- **뷰 Merging, 서브쿼리 Unnesting, OR Expansion**: 주요 쿼리 변환 기법
- **WITH 절**: 반복 서브쿼리 한 번 실행 후 재사용 (MATERIALIZE/INLINE 제어)
