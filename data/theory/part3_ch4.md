# 3과목 4장: 조인 튜닝

## 1. NL 조인 (Nested Loop Join)

### NL 조인 원리

**이중 for 루프** 형태로 동작. 외부 테이블(Driving Table)의 각 행에 대해 내부 테이블(Inner Table)에 접근한다.

```
FOR each row in [Driving Table]
  FOR each row in [Inner Table] WHERE join_condition
    → 결과 행 반환
```

### NL 조인 특징

| 특징 | 내용 |
|------|------|
| 적합 상황 | 소량 데이터, OLTP 환경 |
| 인덱스 | Inner Table 조인 컬럼에 인덱스 필수 |
| Driving Table | 소량의 결과를 반환하는 테이블이 적합 |
| 순차성 | 첫 번째 행을 빨리 반환 (Random Access) |

```sql
-- NL 조인 힌트
SELECT /*+ USE_NL(e d) LEADING(d) */ e.ename, d.dname
FROM   emp e, dept d
WHERE  e.deptno = d.deptno;
```

### NL 조인 성능 결정 요소

1. **Driving Table의 결과 건수**: 적을수록 유리
2. **Inner Table의 인덱스**: 조인 컬럼에 인덱스 있어야 함
3. **Inner Table 액세스 비용**: Clustering Factor가 낮을수록 유리

### NL 조인 최적화

```sql
-- ❌ 나쁜 예: Driving Table이 대용량
SELECT /*+ USE_NL(e d) LEADING(e) */ e.ename, d.dname
FROM   emp e, dept d  -- emp가 대용량이면 성능 저하
WHERE  e.deptno = d.deptno;

-- ✅ 좋은 예: 소량 테이블이 Driving
SELECT /*+ USE_NL(e d) LEADING(d) */ e.ename, d.dname
FROM   emp e, dept d  -- dept(4건)가 Driving → 4번만 Inner 접근
WHERE  e.deptno = d.deptno;
```

---

## 2. 소트 머지 조인 (Sort Merge Join)

### 소트 머지 조인 원리

두 테이블을 각각 **정렬**한 후 **병합(Merge)** 하는 방식.

```
1단계: 양쪽 테이블을 조인 컬럼 기준으로 정렬
2단계: 정렬된 두 집합을 머지하며 조인
```

### 소트 머지 조인 특징

| 특징 | 내용 |
|------|------|
| 적합 상황 | 대량 데이터, 비동등 조인 (`>`, `<`, `BETWEEN`) |
| 인덱스 | 조인 컬럼에 인덱스 불필요 |
| 정렬 비용 | 대용량에서 PGA 부족 시 Temp 디스크 사용 |
| 장점 | 정렬이 이미 된 경우 머지만으로 빠름 |

```sql
-- 소트 머지 조인 힌트
SELECT /*+ USE_MERGE(e d) */ e.ename, d.dname
FROM   emp e, dept d
WHERE  e.deptno = d.deptno;
```

### 소트 머지 조인이 유리한 경우

- 조인 조건이 등치(=)가 아닌 범위 조건
- 대용량 테이블 간 조인
- 정렬된 결과가 이미 필요한 경우
- 해시 조인 불가 시 (해시 함수 메모리 부족 등)

---

## 3. 해시 조인 (Hash Join)

### 해시 조인 원리

작은 테이블(Build Input)로 **해시 테이블** 생성 후, 큰 테이블(Probe Input)을 스캔하며 조인.

```
1단계: Build Phase
  - 작은 테이블을 해시 테이블로 변환 (PGA의 Hash Area 사용)
2단계: Probe Phase
  - 큰 테이블을 스캔하며 해시 테이블과 비교
```

### 해시 조인 특징

| 특징 | 내용 |
|------|------|
| 적합 상황 | 대량 데이터, 등치(=) 조인 |
| 인덱스 | 불필요 |
| 메모리 | PGA의 Hash Area 사용 (부족 시 디스크 사용) |
| 단점 | 비등치 조인 불가, 첫 행 반환이 느림 |

```sql
-- 해시 조인 힌트
SELECT /*+ USE_HASH(e d) */ e.ename, d.dname
FROM   emp e, dept d
WHERE  e.deptno = d.deptno;
```

### 해시 조인 최적화

```sql
-- 작은 테이블을 Build Input으로 지정
SELECT /*+ USE_HASH(e d) LEADING(d) SWAP_JOIN_INPUTS(d) */ e.ename, d.dname
FROM   emp e, dept d
WHERE  e.deptno = d.deptno;
-- dept(4건)이 Build Input → 작은 해시 테이블 생성 → 효율적
```

### 조인 방법 비교

| 구분 | NL 조인 | 소트 머지 조인 | 해시 조인 |
|------|---------|--------------|---------|
| 적합 | 소량, OLTP | 대량, 비등치 | 대량, 등치 |
| 인덱스 | Inner 필요 | 불필요 | 불필요 |
| 첫 행 반환 | 빠름 | 느림 | 느림 |
| 메모리 | 낮음 | Sort Area | Hash Area |
| 조인 조건 | 등치/비등치 | 등치/비등치 | 등치만 가능 |

---

## 4. 스칼라 서브쿼리 튜닝

### 스칼라 서브쿼리

SELECT 절에 사용되어 **1행 1열 반환**하는 서브쿼리.

```sql
SELECT e.ename,
       (SELECT d.dname FROM dept d WHERE d.deptno = e.deptno) AS dname
FROM   emp e;
```

### 스칼라 서브쿼리 캐싱

- Oracle은 스칼라 서브쿼리 결과를 **캐싱**하여 동일 입력값에 재사용
- Cardinality가 낮은(중복값 많은) 경우 캐싱 효율 높음
- Cardinality가 높은 경우 캐시 미스 증가 → 성능 저하 가능

### 스칼라 서브쿼리 → 조인 변환

```sql
-- 스칼라 서브쿼리 (Cardinality 높을 때 느릴 수 있음)
SELECT e.ename, (SELECT d.dname FROM dept d WHERE d.deptno = e.deptno) AS dname
FROM   emp e;

-- LEFT OUTER JOIN으로 변환 (대량 데이터에서 더 효율적)
SELECT e.ename, d.dname
FROM   emp e
LEFT OUTER JOIN dept d ON e.deptno = d.deptno;
```

---

## 5. 고급 조인 기법

### 인라인 뷰를 활용한 조인

```sql
-- 부분 범위 처리: 조인 전 결과 제한
SELECT e.ename, d.dname
FROM   (SELECT * FROM emp WHERE sal > 2000) e
       JOIN dept d ON e.deptno = d.deptno;
```

### 조인 순서 제어 (LEADING 힌트)

```sql
-- a → b → c 순서로 조인
SELECT /*+ LEADING(a b c) */ *
FROM   table_a a, table_b b, table_c c
WHERE  a.id = b.a_id AND b.id = c.b_id;
```

### 부분 범위 처리 (ROWNUM, FETCH)

```sql
-- 상위 10건만 조회 (인덱스 활용하여 소트 생략)
SELECT /*+ INDEX(e idx_sal) */ ename, sal
FROM   emp e
WHERE  ROWNUM <= 10
ORDER  BY sal DESC;
-- ※ ROWNUM 조건이 ORDER BY 전에 적용되므로 의도와 다를 수 있음

-- 올바른 방법
SELECT ename, sal
FROM   (SELECT ename, sal FROM emp ORDER BY sal DESC)
WHERE  ROWNUM <= 10;
```

---

## 6. Anti-Join과 Semi-Join

### Semi-Join (반조인)

메인 쿼리에서 서브쿼리에 존재하는 데이터만 조회. **EXISTS**가 대표적.

```sql
-- Semi-Join: 부서에 사원이 있는 부서만 조회
SELECT * FROM dept d
WHERE EXISTS (SELECT 1 FROM emp e WHERE e.deptno = d.deptno);
-- 옵티마이저가 내부적으로 Semi-Join으로 변환하여 중복 제거
```

### Anti-Join (안티조인)

서브쿼리에 없는 데이터만 조회. **NOT EXISTS**, **NOT IN**이 대표적.

```sql
-- Anti-Join: 사원이 없는 부서 조회

-- 방법 1: NOT EXISTS (NULL 안전, 더 권장)
SELECT * FROM dept d
WHERE NOT EXISTS (SELECT 1 FROM emp e WHERE e.deptno = d.deptno);

-- 방법 2: NOT IN (NULL이 없을 때만 안전)
SELECT * FROM dept d
WHERE deptno NOT IN (SELECT deptno FROM emp WHERE deptno IS NOT NULL);
-- ※ 서브쿼리에 NULL이 있으면 NOT IN은 아무 행도 반환 안 함!

-- 방법 3: MINUS (정렬 발생, 성능 낮을 수 있음)
SELECT deptno FROM dept
MINUS
SELECT DISTINCT deptno FROM emp;
```

### EXISTS vs IN 성능 비교

| 구분 | EXISTS | IN |
|------|--------|-----|
| 서브쿼리 실행 | 조건 만족 즉시 중단 | 전체 결과 집합 생성 후 비교 |
| NULL 처리 | 안전 | NOT IN에서 NULL 주의 |
| Driving 기준 | 메인 쿼리 드라이빙 | 서브쿼리 결과 집합 기반 |
| 적합 상황 | 서브쿼리 결과가 대용량 | 서브쿼리 결과가 소량 |

```sql
-- 옵티마이저의 EXISTS → IN (또는 JOIN) 변환 제어
SELECT * FROM dept WHERE EXISTS
  (SELECT /*+ NO_UNNEST */ 1 FROM emp WHERE emp.deptno = dept.deptno);
-- NO_UNNEST: 서브쿼리를 조인으로 변환하지 않도록 강제
```

---

## 출제 포인트

- **NL 조인**: Driving Table이 작을수록 유리, Inner Table 인덱스 필수
- **소트 머지 조인**: 비등치 조인 가능, 정렬 비용 주의
- **해시 조인**: 등치 조인만 가능, Build Input(소량)과 Probe Input(대량) 구분
- **조인 방법 선택 기준**: 데이터 양(소량→NL, 대량→Hash), 조인 조건(등치/비등치)
- **스칼라 서브쿼리 캐싱**: Cardinality 낮을 때 효율적, 높을 때 조인으로 변환
- **Semi-Join**: EXISTS — 조건 만족 즉시 중단, 대용량 서브쿼리에 유리
- **Anti-Join**: NOT EXISTS 권장 — NULL 안전. NOT IN은 서브쿼리 NULL 주의
- **LEADING 힌트**: 조인 순서 제어
- **ROWNUM 함정**: ORDER BY 전에 적용되므로 인라인 뷰로 감싸야 함
