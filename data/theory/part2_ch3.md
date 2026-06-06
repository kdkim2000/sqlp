# 2과목 3장: 관리 구문

## 1. DML (Data Manipulation Language)

### DML이란

데이터를 **조작**하는 명령어. 테이블의 행을 삽입·수정·삭제하며, **트랜잭션의 대상**이 된다.

| 명령어 | 기능 |
|--------|------|
| INSERT | 새로운 행 삽입 |
| UPDATE | 기존 행의 컬럼 값 수정 |
| DELETE | 기존 행 삭제 |
| MERGE | 조건에 따라 INSERT·UPDATE·DELETE 통합 처리 |

---

### INSERT

```sql
-- 단건 삽입
INSERT INTO emp (empno, ename, deptno)
VALUES (9999, '홍길동', 10);

-- 서브쿼리를 이용한 다건 삽입 (SELECT 결과 전체 삽입)
INSERT INTO emp_copy
SELECT * FROM emp WHERE deptno = 20;

-- 멀티 테이블 INSERT (조건별 삽입)
INSERT ALL
  WHEN sal > 3000 THEN INTO high_sal_emp VALUES (empno, ename, sal)
  WHEN sal <= 3000 THEN INTO low_sal_emp VALUES (empno, ename, sal)
SELECT empno, ename, sal FROM emp;
```

> **주의**: `INSERT INTO emp VALUES (...)` — VALUES 없이 컬럼 순서 생략 시 테이블 정의 순서와 일치해야 함

---

### UPDATE

```sql
-- 단순 수정
UPDATE emp
SET    sal = sal * 1.1,
       comm = 500
WHERE  deptno = 10;

-- 서브쿼리를 이용한 수정
UPDATE emp e
SET    sal = (SELECT MAX(sal) FROM emp WHERE deptno = e.deptno)
WHERE  empno = 7788;
```

> **주의**: WHERE 절 없으면 전체 행 수정됨. `WHERE empno = :empno` 형태로 특정 행 지정 필수

---

### DELETE

```sql
-- 단순 삭제
DELETE FROM emp WHERE deptno = 30;

-- 전체 행 삭제 (ROLLBACK 가능, 로그 기록)
DELETE FROM emp;
```

### DELETE vs TRUNCATE 비교

| 항목 | DELETE | TRUNCATE |
|------|--------|---------|
| 분류 | DML | DDL |
| ROLLBACK | 가능 | 불가능 |
| 실행 속도 | 느림 (행 단위) | 빠름 (세그먼트 단위) |
| WHERE 절 | 사용 가능 | 사용 불가 |
| 트리거 발동 | 발동 | 발동 안 함 |
| AUTO COMMIT | 아님 | 자동 COMMIT |

---

### MERGE

하나의 SQL로 INSERT/UPDATE/DELETE를 조건에 따라 처리.

```sql
MERGE INTO target t
USING source s
ON (t.id = s.id)
WHEN MATCHED THEN
  UPDATE SET t.val = s.val,
             t.upd_dt = SYSDATE
  DELETE WHERE s.del_yn = 'Y'   -- 선택적
WHEN NOT MATCHED THEN
  INSERT (id, val, ins_dt)
  VALUES (s.id, s.val, SYSDATE);
```

> **활용**: 배치 처리 시 조건부 INSERT/UPDATE를 하나의 SQL로 처리 → 성능 향상

---

## 2. TCL (Transaction Control Language)

### 트랜잭션이란

**논리적인 작업 단위**. ACID 특성을 가진다.

| 특성 | 설명 |
|------|------|
| **원자성(Atomicity)** | 모두 성공 또는 모두 실패 (All or Nothing) |
| **일관성(Consistency)** | 트랜잭션 전후 데이터 무결성 유지 |
| **격리성(Isolation)** | 동시 실행 트랜잭션이 서로 영향 없음 |
| **지속성(Durability)** | COMMIT된 데이터는 영구 저장 |

### TCL 명령어

```sql
-- COMMIT: 변경 영구 반영 + Lock 해제
COMMIT;

-- ROLLBACK: 변경 취소 (최근 COMMIT 시점 또는 SAVEPOINT로 복귀)
ROLLBACK;

-- SAVEPOINT: 중간 저장점 설정
SAVEPOINT sp1;
UPDATE emp SET sal = 5000 WHERE empno = 7788;
SAVEPOINT sp2;
UPDATE emp SET sal = 6000 WHERE empno = 7369;

-- sp2 이후만 롤백 (7369 UPDATE 취소, 7788 UPDATE는 유지)
ROLLBACK TO SAVEPOINT sp2;
COMMIT;
```

### Oracle 트랜잭션 시작 시점

- Oracle: **첫 번째 DML 실행 시** 자동 시작 (명시적 `BEGIN TRANSACTION` 불필요)
- COMMIT 또는 ROLLBACK으로 트랜잭션 종료

### DDL 실행과 AUTO COMMIT

```sql
UPDATE emp SET sal = 9000 WHERE empno = 7788;  -- DML (미COMMIT)
CREATE TABLE temp_table (id NUMBER);              -- DDL → AUTO COMMIT!
-- UPDATE가 자동 COMMIT됨 → ROLLBACK 불가
```

> **핵심**: Oracle에서 DDL 실행 시 이전 DML이 자동 COMMIT됨

---

## 3. DDL (Data Definition Language)

데이터베이스 **객체를 정의·수정·삭제**하는 명령어. **AUTO COMMIT** 특성.

| 명령어 | 기능 |
|--------|------|
| CREATE | 객체(테이블, 인덱스, 뷰 등) 생성 |
| ALTER | 객체 구조 변경 |
| DROP | 객체 삭제 |
| TRUNCATE | 테이블 데이터 전체 삭제 |
| RENAME | 객체 이름 변경 |
| COMMENT | 설명 추가 |

---

### CREATE TABLE

```sql
CREATE TABLE orders (
  order_no     VARCHAR2(20)  NOT NULL,
  customer_id  VARCHAR2(10)  NOT NULL,
  order_dt     DATE          DEFAULT SYSDATE,
  order_amt    NUMBER(15, 2),
  status_cd    VARCHAR2(2)   DEFAULT 'P',
  CONSTRAINT pk_orders PRIMARY KEY (order_no),
  CONSTRAINT fk_orders_cust FOREIGN KEY (customer_id)
    REFERENCES customers (customer_id),
  CONSTRAINT chk_status CHECK (status_cd IN ('P', 'C', 'X'))
);

-- 서브쿼리로 복사 (구조 + 데이터)
CREATE TABLE emp_copy AS SELECT * FROM emp WHERE deptno = 10;

-- 구조만 복사 (데이터 없음)
CREATE TABLE emp_empty AS SELECT * FROM emp WHERE 1 = 2;
```

### 제약 조건 종류

| 제약 조건 | 설명 |
|---------|------|
| PRIMARY KEY | 유일성 + NOT NULL (테이블당 1개) |
| UNIQUE | 유일성 (NULL 허용) |
| NOT NULL | NULL 불허 |
| FOREIGN KEY | 참조 무결성 (다른 테이블 PK 참조) |
| CHECK | 컬럼값 범위·규칙 제한 |
| DEFAULT | 값 미입력 시 기본값 |

---

### ALTER TABLE

```sql
-- 컬럼 추가
ALTER TABLE emp ADD (email VARCHAR2(100));

-- 컬럼 수정 (크기·타입·기본값)
ALTER TABLE emp MODIFY (ename VARCHAR2(60) NOT NULL);

-- 컬럼 삭제
ALTER TABLE emp DROP COLUMN email;

-- 컬럼 이름 변경
ALTER TABLE emp RENAME COLUMN ename TO emp_name;

-- 제약 조건 추가
ALTER TABLE emp ADD CONSTRAINT uk_emp_email UNIQUE (email);

-- 제약 조건 삭제
ALTER TABLE emp DROP CONSTRAINT uk_emp_email;

-- 제약 조건 비활성화/활성화
ALTER TABLE emp DISABLE CONSTRAINT fk_emp_dept;
ALTER TABLE emp ENABLE  CONSTRAINT fk_emp_dept;
```

---

### DROP vs TRUNCATE

```sql
-- DROP: 테이블 구조 + 데이터 모두 삭제 (복구 불가)
DROP TABLE emp;
DROP TABLE emp CASCADE CONSTRAINTS;  -- 참조 제약까지 삭제

-- TRUNCATE: 구조 유지, 데이터만 삭제 (빠르고 복구 불가)
TRUNCATE TABLE emp;
```

### 뷰 (VIEW)

```sql
-- 뷰 생성
CREATE OR REPLACE VIEW v_emp_dept AS
SELECT e.empno, e.ename, d.dname
FROM   emp e JOIN dept d ON e.deptno = d.deptno;

-- 뷰 삭제
DROP VIEW v_emp_dept;
```

> **뷰의 특징**:
> - 실제 데이터 미저장 (논리적 가상 테이블)
> - SELECT에는 항상 사용 가능
> - 단순 뷰(단일 테이블, 집계 없음): DML 가능
> - 복잡 뷰(조인, 집계, DISTINCT): DML 대부분 불가

---

## 4. DCL (Data Control Language)

데이터베이스 **권한을 관리**하는 명령어.

| 명령어 | 기능 |
|--------|------|
| GRANT | 권한 부여 |
| REVOKE | 권한 회수 |

### GRANT

```sql
-- 객체 권한 부여
GRANT SELECT, INSERT, UPDATE ON emp TO user1;
GRANT SELECT ON emp TO PUBLIC;           -- 모든 사용자
GRANT SELECT ON emp TO user1 WITH GRANT OPTION;  -- 재부여 권한 포함

-- 시스템 권한 부여
GRANT CREATE TABLE TO user1;
GRANT CREATE SESSION TO user1;

-- 롤(Role)에 권한 부여 후 사용자에게 롤 부여
GRANT SELECT ON emp TO app_role;
GRANT app_role TO user1;
```

### REVOKE

```sql
-- 객체 권한 회수
REVOKE SELECT, INSERT ON emp FROM user1;

-- WITH GRANT OPTION으로 부여한 권한 회수 시 연쇄 회수
REVOKE SELECT ON emp FROM user1;  -- user1이 재부여한 권한도 모두 회수
```

### 권한 종류 비교

| 구분 | 시스템 권한 | 객체 권한 |
|------|---------|---------|
| 대상 | 데이터베이스 작업 권한 | 특정 객체 접근 권한 |
| 예시 | CREATE TABLE, CREATE SESSION | SELECT, INSERT, UPDATE, DELETE |
| 부여 대상 | 사용자, 롤 | 사용자, 롤, PUBLIC |

---

## 출제 포인트

- **DML vs DDL**: DML(INSERT/UPDATE/DELETE/MERGE)은 ROLLBACK 가능, DDL(CREATE/ALTER/DROP/TRUNCATE)은 AUTO COMMIT
- **DELETE vs TRUNCATE**: DELETE는 DML(ROLLBACK 가능·느림), TRUNCATE는 DDL(ROLLBACK 불가·빠름)
- **MERGE 문**: WHEN MATCHED(UPDATE/DELETE), WHEN NOT MATCHED(INSERT) — 조건부 통합 DML
- **SAVEPOINT**: 트랜잭션 중간 저장점 설정 → `ROLLBACK TO SAVEPOINT` 이름으로 부분 롤백
- **Oracle DDL AUTO COMMIT**: DDL 실행 시 이전 미COMMIT DML 자동 COMMIT → 주의 필요
- **ACID**: Atomicity·Consistency·Isolation·Durability — 트랜잭션 4대 특성
- **GRANT WITH GRANT OPTION**: 권한을 받은 사용자가 타인에게 재부여 가능
- **CASCADE CONSTRAINTS**: DROP TABLE 시 다른 테이블의 FK 참조도 함께 삭제
- **CREATE TABLE AS SELECT**: 서브쿼리 결과로 테이블 복사 (WHERE 1=2이면 구조만)
- **뷰 DML 제한**: 조인·집계·DISTINCT 포함 복잡 뷰는 UPDATE/DELETE/INSERT 불가
