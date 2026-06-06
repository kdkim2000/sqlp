# 3과목 3장: 인덱스 튜닝

## 1. 인덱스 기본 원리

### 인덱스 구조 (B*Tree)

Oracle 인덱스의 기본 구조는 **B*Tree (Balanced Tree)** 이다.

```
         [Root Block]
              │
    ┌─────────┼─────────┐
[Branch]  [Branch]  [Branch]
    │          │          │
[Leaf]    [Leaf]    [Leaf] → [Leaf] → [Leaf]
(Key, ROWID)
```

- **Root Block**: 트리의 최상위 블록
- **Branch Block**: Root와 Leaf 사이의 중간 블록
- **Leaf Block**: 인덱스 키와 ROWID 저장. 이중 연결 리스트 구조

### 인덱스 스캔 방식

| 스캔 방식 | 설명 | 사용 조건 |
|----------|------|---------|
| **Index Unique Scan** | 단 하나의 ROWID 반환 | `=` 조건, Unique 인덱스 |
| **Index Range Scan** | 범위 조건으로 여러 ROWID 반환 | `BETWEEN`, `>=`, `LIKE 'A%'` |
| **Index Full Scan** | 인덱스 전체를 순서대로 스캔 | ORDER BY, 인덱스 컬럼 전체 조회 |
| **Index Fast Full Scan** | 인덱스 전체를 Multi Block으로 스캔 | COUNT(*), 인덱스로만 처리 가능 |
| **Index Skip Scan** | 선두 컬럼 조건 없이 후행 컬럼 조건으로 스캔 | 복합 인덱스에서 선두 컬럼 조건 없을 때 |

### 인덱스 Range Scan이 불가능한 경우

```sql
-- 인덱스 컬럼에 함수 적용 → 불가
SELECT * FROM emp WHERE TO_CHAR(hiredate, 'YYYY') = '2020';

-- 부정 조건 → 불가
SELECT * FROM emp WHERE deptno <> 10;

-- LIKE 선두 와일드카드 → 불가
SELECT * FROM emp WHERE ename LIKE '%SON';

-- 묵시적 형변환 → 불가 (문자↔숫자)
SELECT * FROM emp WHERE empno = '7788';  -- empno가 NUMBER일 때

-- OR 조건 → 불가 (인덱스 OR 연산은 별도 처리)
SELECT * FROM emp WHERE deptno = 10 OR deptno = 20;
-- 해결: IN 또는 UNION ALL 사용
```

---

## 2. 테이블 액세스 최소화

### 인덱스 ROWID를 통한 테이블 접근 비용

인덱스로 ROWID를 구한 후 테이블 블록을 읽는 과정은 **Single Block I/O**로 발생한다.
건수가 많으면 테이블 랜덤 액세스가 많아져 오히려 Full Table Scan보다 느릴 수 있다.

### Clustering Factor (클러스터링 팩터)

인덱스의 **컬럼 정렬 순서**와 **테이블 물리 저장 순서**의 유사도.

- **낮을수록** 좋음: 인덱스 순서 = 테이블 저장 순서 → 블록 재사용 많음
- **높을수록** 나쁨: 인덱스 순서 ≠ 테이블 저장 순서 → 매번 다른 블록 읽음

```sql
-- 클러스터링 팩터 확인
SELECT index_name, clustering_factor, num_rows
FROM   user_indexes
WHERE  table_name = 'EMP';
```

### 테이블 액세스 최소화 방법

1. **인덱스 커버링 (Covering Index)**: SELECT 컬럼을 인덱스에 포함 → 테이블 미접근
   ```sql
   -- 인덱스 (deptno, ename, sal)이면 아래 SQL은 테이블 접근 불필요
   SELECT ename, sal FROM emp WHERE deptno = 10;
   ```

2. **IOT (Index Organized Table)**: 테이블 자체를 인덱스 구조로 저장

3. **클러스터 테이블**: 같은 키 값을 가진 행을 같은 블록에 저장

---

## 3. 인덱스 스캔 효율화

### 인덱스 선두 컬럼의 중요성

복합 인덱스에서 **선두 컬럼에 조건이 없으면** Range Scan 불가 (Skip Scan 또는 Full Scan).

```sql
-- 인덱스: (deptno, job, ename)
SELECT * FROM emp WHERE job = 'MANAGER';    -- deptno 조건 없음 → Full Scan
SELECT * FROM emp WHERE deptno = 10;        -- 선두 컬럼 조건 → Range Scan
SELECT * FROM emp WHERE deptno = 10 AND job = 'MANAGER';  -- 최적
```

### 인덱스 컬럼 가공 금지

```sql
-- 가공으로 인덱스 무력화 → 해결책
-- ❌ 가공
WHERE SUBSTR(ename, 1, 3) = 'SCO'
-- ✅ 가공 없이
WHERE ename LIKE 'SCO%'

-- ❌ 가공
WHERE sal + 100 > 3000
-- ✅ 가공 없이
WHERE sal > 2900

-- ❌ 함수
WHERE TRUNC(hiredate) = '2020-01-01'
-- ✅ 범위로 변환
WHERE hiredate >= DATE '2020-01-01' AND hiredate < DATE '2020-01-02'
```

### 복합 인덱스 컬럼 순서 결정 기준

1. **Equality 조건** 컬럼을 선두에 (= 조건)
2. **Cardinality 높은** 컬럼을 선두에
3. **자주 사용되는 조건** 컬럼을 선두에
4. **Sort 조건** 고려 (ORDER BY 컬럼을 인덱스에 포함하면 정렬 생략)

---

## 4. 인덱스 설계

### 인덱스 설계 원칙

| 원칙 | 설명 |
|------|------|
| 조회 조건 컬럼 | WHERE절 조건 컬럼을 인덱스에 포함 |
| Cardinality | 유일값이 많은 컬럼이 인덱스 효과 높음 |
| 컬럼 수 제한 | 인덱스가 많으면 DML 성능 저하 |
| 복합 인덱스 | 단일 인덱스 여러 개보다 복합 인덱스 1개가 효율적인 경우 多 |

### 인덱스가 효과적이지 않은 경우

- 조회 비율이 10~15% 이상인 경우 (Full Scan이 유리)
- Cardinality가 매우 낮은 컬럼 (성별: M/F 등)
- 자주 변경되는 컬럼 (DML 비용 증가)

### 함수 기반 인덱스 (FBI: Function-Based Index)

```sql
-- 함수를 적용한 컬럼에 인덱스 생성
CREATE INDEX emp_upper_ename ON emp(UPPER(ename));

-- 이제 함수 사용 조건에서도 인덱스 사용 가능
SELECT * FROM emp WHERE UPPER(ename) = 'SCOTT';
```

### Bitmap Index

**낮은 카디널리티** 컬럼(성별, 상태 코드 등)에 적합한 인덱스 구조.

| 구분 | B*Tree 인덱스 | Bitmap 인덱스 |
|------|-------------|-------------|
| 적합 컬럼 | 카디널리티 높음 (사번, 이름) | 카디널리티 낮음 (성별, 상태) |
| 환경 | OLTP | DW, DSS |
| DML 성능 | 행 단위 Lock | 비트맵 전체 Lock → DML 시 주의 |
| AND/OR 조합 | 비효율 | 비트맵 연산으로 매우 효율적 |

```sql
-- Bitmap 인덱스 생성
CREATE BITMAP INDEX emp_gender_bix ON emp(gender);

-- 다중 Bitmap 인덱스 조합 (AND 연산)
SELECT * FROM emp WHERE gender = 'M' AND status = 'ACTIVE' AND dept = 'IT';
-- → 세 개의 Bitmap을 AND 연산 후 ROWID 추출 → 매우 효율적
```

> **주의**: Bitmap 인덱스는 DML 시 해당 값의 비트맵 전체에 Lock → 동시성 낮음. OLTP에는 부적합.

### 인덱스 통계 해석

```sql
-- 인덱스 통계 조회
SELECT index_name, blevel, leaf_blocks, distinct_keys, clustering_factor
FROM   user_indexes
WHERE  table_name = 'EMP';
```

| 항목 | 설명 | 의미 |
|------|------|------|
| **BLEVEL** | 인덱스 트리 깊이 (Root→Leaf 단계 수) | 낮을수록 좋음 (0~3이 정상) |
| **LEAF_BLOCKS** | Leaf 블록 수 | 적을수록 스캔 효율적 |
| **DISTINCT_KEYS** | 유일값 수 (카디널리티) | 높을수록 선택도 우수 |
| **CLUSTERING_FACTOR** | 테이블 정렬과 인덱스 정렬의 유사도 | LEAF_BLOCKS에 가까울수록 좋음 |

### 인덱스 재구성

```sql
-- 인덱스 단편화 확인
ANALYZE INDEX emp_pk VALIDATE STRUCTURE;
SELECT name, lf_rows, del_lf_rows, del_lf_rows/lf_rows*100 AS del_pct
FROM   INDEX_STATS;
-- del_pct > 20%이면 재구성 검토

-- 인덱스 재구성 방법
ALTER INDEX emp_pk REBUILD;             -- Online 재구성 가능 (Oracle Enterprise)
ALTER INDEX emp_pk REBUILD ONLINE;      -- 서비스 중단 없이 재구성
ALTER INDEX emp_pk COALESCE;            -- 인접 블록 병합 (더 빠름, 단 전체 최적화 아님)
```

---

## 출제 포인트

- **인덱스 Range Scan 불가 조건**: 함수 적용, 부정 조건, LIKE '%', 묵시적 형변환
- **Clustering Factor**: 낮을수록 좋음 (인덱스 순서 = 테이블 저장 순서)
- **Covering Index**: SELECT 컬럼을 인덱스에 포함하여 테이블 액세스 제거
- **복합 인덱스 선두 컬럼**: = 조건 컬럼 우선, 카디널리티 높은 컬럼 우선
- **인덱스 컬럼 가공 금지**: 조건절에서 인덱스 컬럼 변환 없이 사용
- **Bitmap Index**: 낮은 카디널리티(성별·상태)에 적합, DW환경, DML 동시성 낮음
- **BLEVEL**: 인덱스 트리 깊이, 0~3이 정상범위
- **인덱스 재구성**: del_pct > 20% 시 REBUILD 검토
- **Index Full Scan vs Index Fast Full Scan**: 순서 유지 vs 순서 미보장
- **Skip Scan**: 선두 컬럼 조건 없을 때 옵티마이저가 선택 가능
