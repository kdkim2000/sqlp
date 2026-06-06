# 3과목 6장: 고급 SQL 튜닝

## 1. 소트 튜닝

### 소트 발생 원인

```sql
-- ORDER BY
SELECT * FROM emp ORDER BY sal;

-- GROUP BY
SELECT deptno, COUNT(*) FROM emp GROUP BY deptno;

-- DISTINCT
SELECT DISTINCT deptno FROM emp;

-- 집합 연산
SELECT * FROM emp UNION SELECT * FROM emp;  -- UNION은 중복 제거(소트 발생)
SELECT * FROM emp UNION ALL SELECT * FROM emp;  -- UNION ALL은 소트 없음

-- 윈도우 함수
SELECT ename, RANK() OVER (ORDER BY sal DESC) FROM emp;
```

### Sort Area와 Temp Tablespace

- **PGA Sort Area**: 메모리 내 정렬 (빠름)
- **Temp Tablespace**: Sort Area 부족 시 디스크로 밀림 (느림)

```sql
-- Sort Area 크기 확인 (세션 레벨)
SHOW PARAMETER SORT_AREA_SIZE;

-- 정렬 통계 확인
SELECT name, value FROM V$SYSSTAT WHERE name LIKE 'sort%';
-- sort (memory): 메모리 정렬 횟수
-- sort (disk): 디스크 정렬 횟수 → 이 값이 크면 소트 영역 부족
```

### 소트 튜닝 방법

1. **인덱스 활용 (정렬 생략)**
   ```sql
   -- idx_sal 인덱스 있으면 ORDER BY sal 정렬 생략
   SELECT /*+ INDEX(emp idx_sal) */ empno, sal
   FROM   emp ORDER BY sal;
   ```

2. **불필요한 DISTINCT 제거**
   ```sql
   -- EXISTS로 대체 (소트 없음)
   SELECT empno FROM emp e
   WHERE EXISTS (SELECT 1 FROM dept d WHERE e.deptno = d.deptno);
   ```

3. **UNION → UNION ALL**
   ```sql
   -- 중복이 없다면 UNION ALL 사용 (소트 없음)
   SELECT deptno FROM emp WHERE sal > 3000
   UNION ALL  -- UNION 대신
   SELECT deptno FROM dept WHERE loc = 'NEW YORK';
   ```

---

## 2. DML 튜닝

### DML 성능 저하 원인

| 원인 | 설명 | 해결책 |
|------|------|--------|
| 불필요한 인덱스 | DML 시 모든 인덱스 동시 갱신 | 사용하지 않는 인덱스 제거 |
| Redo/Undo 생성 | 데이터 변경 시 로그 기록 | `NOLOGGING` (복구 불필요 시) |
| Lock 경합 | 동시 DML 시 행 잠금 | 트랜잭션 크기 조정 |
| 과도한 COMMIT | 매 행마다 COMMIT | 배치 COMMIT |

### 대용량 DML 최적화

```sql
-- ❌ 느린 방법: 행 단위 UPDATE
DECLARE
  CURSOR c IS SELECT empno FROM emp;
BEGIN
  FOR r IN c LOOP
    UPDATE emp SET sal = sal * 1.1 WHERE empno = r.empno;
    COMMIT;  -- 매 행마다 COMMIT
  END LOOP;
END;

-- ✅ 빠른 방법: 집합 기반 UPDATE
UPDATE emp SET sal = sal * 1.1;
COMMIT;  -- 한 번만 COMMIT
```

### INSERT 최적화

```sql
-- Direct Path Insert (NOLOGGING + Append 힌트)
INSERT /*+ APPEND NOLOGGING */ INTO target_table
SELECT * FROM source_table;
COMMIT;
-- ※ 병렬 처리 가능, Redo 최소화, 단 복구 불가
```

### MERGE 문 활용

```sql
MERGE INTO target t
USING source s ON (t.id = s.id)
WHEN MATCHED THEN
  UPDATE SET t.val = s.val
WHEN NOT MATCHED THEN
  INSERT (id, val) VALUES (s.id, s.val);
-- INSERT + UPDATE를 하나의 DML로 처리 (성능 우수)
```

---

## 3. DB Call 최소화

### DB Call의 종류

| Call 종류 | 발생 시점 | 설명 |
|---------|---------|------|
| Parse Call | SQL 파싱 | Shared Pool 검색, Hard/Soft Parse |
| Execute Call | SQL 실행 | DML, DDL 실행 |
| Fetch Call | 결과 조회 | SELECT 결과 행 가져오기 |

### Array Processing (일괄 처리)

```java
// ❌ 행 단위 처리 (Fetch Call 100번 발생)
for (int i = 0; i < 100; i++) {
    ResultSet rs = stmt.executeQuery("SELECT ...");
    while (rs.next()) { ... }
}

// ✅ Fetch Size 설정 (Fetch Call 횟수 감소)
stmt.setFetchSize(100);  // 한 번에 100건 Fetch
ResultSet rs = stmt.executeQuery("SELECT ...");
```

### CURSOR 공유로 Parse Call 감소

```java
// ❌ 매번 새로운 PreparedStatement (Parse Call 반복)
for (String id : ids) {
    PreparedStatement ps = conn.prepareStatement("SELECT ...");
    ps.setString(1, id);
    ps.execute();
    ps.close();
}

// ✅ PreparedStatement 재사용 (Parse Call 1회)
PreparedStatement ps = conn.prepareStatement("SELECT ... WHERE id = ?");
for (String id : ids) {
    ps.setString(1, id);
    ps.execute();
}
ps.close();
```

---

## 4. 파티셔닝

### 파티션 개념

대용량 테이블을 **논리적 기준으로 분할**하여 관리. 쿼리 시 해당 파티션만 스캔(Partition Pruning).

### 파티션 종류

| 종류 | 기준 | 예시 |
|------|------|------|
| Range 파티션 | 연속 범위 | 날짜별 월간 파티션 |
| List 파티션 | 명시적 값 목록 | 지역별(서울, 부산, 대구) |
| Hash 파티션 | 해시 함수 | 균등 분산 목적 |
| Composite 파티션 | 복합 (Range+List 등) | 연도별 + 지역별 |

```sql
-- Range 파티션 생성
CREATE TABLE sales (
  sale_date DATE,
  amount    NUMBER
)
PARTITION BY RANGE (sale_date) (
  PARTITION p2023 VALUES LESS THAN (DATE '2024-01-01'),
  PARTITION p2024 VALUES LESS THAN (DATE '2025-01-01'),
  PARTITION p_max VALUES LESS THAN (MAXVALUE)
);

-- 파티션 프루닝 (자동)
SELECT * FROM sales WHERE sale_date >= DATE '2024-01-01';
-- → p2024 파티션만 스캔
```

### 파티션 Pruning

```sql
-- 파티션 컬럼으로 조건 주면 해당 파티션만 스캔
SELECT * FROM sales PARTITION (p2024);         -- 직접 지정
SELECT * FROM sales WHERE sale_date >= DATE '2024-01-01';  -- 자동 Pruning
```

---

## 5. 대용량 배치 프로그램 튜닝

### 배치 처리 원칙

1. **집합 기반 처리**: 커서 루프 대신 집합 연산 (INSERT...SELECT, MERGE)
2. **적절한 COMMIT 단위**: 너무 자주(성능 저하) vs 너무 적게(Rollback Segment 부족)
3. **병렬 처리**: 독립적인 작업을 병렬로 분산

```sql
-- 배치 처리 패턴: 대용량 DELETE
DELETE FROM log_table WHERE log_date < TRUNC(SYSDATE) - 90;
-- → 수백만 건이면 Undo 폭증 → 분할 처리

-- 분할 DELETE (Commit 단위 조절)
DECLARE
  v_count PLS_INTEGER;
BEGIN
  LOOP
    DELETE FROM log_table
    WHERE log_date < TRUNC(SYSDATE) - 90
      AND ROWNUM <= 10000;  -- 1만 건씩 처리
    v_count := SQL%ROWCOUNT;
    COMMIT;
    EXIT WHEN v_count < 10000;
  END LOOP;
END;
```

### 고급 SQL 활용

```sql
-- CASE 문으로 여러 UPDATE 통합
UPDATE emp SET
  sal = CASE WHEN job = 'MANAGER'  THEN sal * 1.1
             WHEN job = 'ANALYST'  THEN sal * 1.05
             ELSE sal
        END,
  comm = CASE WHEN deptno = 30 THEN sal * 0.1
              ELSE comm
         END;
-- 한 번의 스캔으로 모든 UPDATE 처리
```

---

## 6. 병렬 처리 (Parallel Execution)

### PARALLEL 힌트

대용량 처리 시 여러 프로세스가 **분할하여 동시 처리**.

```sql
-- 테이블 Full Scan 병렬 처리
SELECT /*+ PARALLEL(t 4) */ COUNT(*) FROM big_table t;
-- DOP=4: 4개의 병렬 프로세스 사용

-- INSERT를 병렬로 (Direct Path)
INSERT /*+ PARALLEL(t 4) APPEND */ INTO target_table t
SELECT /*+ PARALLEL(s 4) */ * FROM source_table s;
COMMIT;

-- 테이블에 기본 병렬도 설정
ALTER TABLE big_table PARALLEL 4;
```

> **병렬 처리 조건**: Full Scan 또는 파티션 단위 처리에 효과적. 단, 리소스 경합 주의.

### Global Temporary Table (GTT)

세션 또는 트랜잭션 범위의 **임시 테이블**. Redo/Undo 최소화.

```sql
-- 트랜잭션 범위 GTT (COMMIT 시 데이터 삭제)
CREATE GLOBAL TEMPORARY TABLE tmp_work (
  id NUMBER, val VARCHAR2(100)
) ON COMMIT DELETE ROWS;

-- 세션 범위 GTT (세션 종료 시 데이터 삭제)
CREATE GLOBAL TEMPORARY TABLE tmp_session (
  id NUMBER, val VARCHAR2(100)
) ON COMMIT PRESERVE ROWS;

-- 활용: 복잡한 집계를 단계적으로 임시 저장
INSERT INTO tmp_work SELECT ...;  -- 1단계 결과 저장
SELECT * FROM final_result f JOIN tmp_work t ON f.id = t.id;
```

### Window Function (분석 함수) 정렬 비용

```sql
-- Window Function은 OVER(ORDER BY) 절로 정렬 발생
SELECT ename, sal,
       RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS rnk
FROM   emp;
-- → SORT (PARTITION BY) 발생 → PGA Sort Area 사용

-- 인덱스로 정렬 생략 가능한 경우
-- idx_deptno_sal: (deptno, sal DESC) 인덱스 있으면
-- → WINDOW SORT PUSHED RANK: 정렬 생략 가능
```

### 파티션 인덱스 선택 기준

| 인덱스 유형 | 설명 | 특징 |
|----------|------|------|
| **Local Index** | 파티션별 독립 인덱스 | 파티션과 동일 범위, 관리 용이 |
| **Global Index** | 파티션 전체를 하나의 인덱스 | 비파티션 컬럼 조회에 유리, 파티션 작업 시 영향 |

```sql
-- Local Index (파티션별)
CREATE INDEX sales_local_idx ON sales(sale_id)
LOCAL;  -- 각 파티션에 독립 인덱스

-- Global Partitioned Index (전체 테이블에 단일 인덱스)
CREATE INDEX sales_global_idx ON sales(customer_id)
GLOBAL PARTITION BY RANGE (customer_id)
  (PARTITION p1 VALUES LESS THAN (1000),
   PARTITION p2 VALUES LESS THAN (MAXVALUE));
```

---

## 출제 포인트

- **UNION vs UNION ALL**: UNION은 소트 발생, UNION ALL은 소트 없음
- **Sort Area 부족**: Temp Tablespace 사용 → 성능 저하, `sort (disk)` 통계로 확인
- **Direct Path Insert**: APPEND + NOLOGGING 힌트, Redo 최소화 (복구 불가 주의)
- **MERGE 문**: INSERT + UPDATE 통합 처리
- **DB Call 최소화**: Array Processing, PreparedStatement 재사용
- **PARALLEL 힌트**: DOP 설정으로 병렬 처리, Full Scan/파티션에 효과적
- **Global Temporary Table**: ON COMMIT DELETE/PRESERVE ROWS, Redo/Undo 최소화
- **Window Function 정렬**: OVER(ORDER BY) 정렬 발생, 인덱스로 생략 가능
- **Local vs Global 파티션 인덱스**: 파티션 관리(Local) vs 전범위 조회(Global)
- **파티션 Pruning**: 파티션 컬럼 조건으로 해당 파티션만 스캔
- **배치 분할 처리**: 대용량 DML은 Commit 단위를 나눠 Undo 관리
- **집합 기반 처리**: 행 단위 루프 대신 SET 연산으로 성능 향상
