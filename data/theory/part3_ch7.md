# 3과목 7장: Lock과 트랜잭션 동시성 제어

## 1. Lock (잠금)

### Lock의 개념

데이터의 **일관성**과 **무결성**을 보장하기 위해 트랜잭션이 데이터에 접근할 때 설정하는 메커니즘.

### Lock의 종류

| Lock 종류 | 획득 조건 | 다른 Lock과 공존 여부 |
|---------|---------|-------------------|
| **Shared Lock (S Lock)** | SELECT (FOR UPDATE 없는) | S Lock끼리 공존 가능 |
| **Exclusive Lock (X Lock)** | INSERT, UPDATE, DELETE, SELECT FOR UPDATE | 다른 모든 Lock과 공존 불가 |

### Oracle의 Row Level Lock

Oracle은 **행 수준 잠금(Row Level Lock)** 을 사용. 특정 행만 잠그므로 동시성이 높다.

```sql
-- 명시적 Lock: SELECT FOR UPDATE
SELECT * FROM emp WHERE empno = 7788 FOR UPDATE;
-- → empno=7788인 행에 X Lock 설정
-- → 다른 세션이 같은 행을 DML 시도하면 대기

-- NOWAIT: Lock 즉시 오류 반환
SELECT * FROM emp WHERE empno = 7788 FOR UPDATE NOWAIT;

-- WAIT: 지정 시간 대기
SELECT * FROM emp WHERE empno = 7788 FOR UPDATE WAIT 5;  -- 5초 대기
```

### Table-Level Lock 종류

Oracle의 테이블 잠금은 **TM Lock**으로 6가지 모드가 있다.

| Lock Mode | 약어 | 획득 조건 | 설명 |
|---------|------|---------|------|
| Row Share | RS | SELECT FOR UPDATE, LOCK TABLE … ROW SHARE | 행 수준 공유 의도 |
| Row Exclusive | RX | INSERT, UPDATE, DELETE | 행 수준 배타 의도 |
| Share | S | LOCK TABLE … SHARE | 전체 읽기 허용, DML 금지 |
| Share Row Exclusive | SRX | LOCK TABLE … SHARE ROW EXCLUSIVE | S + RX 조합 |
| Exclusive | X | LOCK TABLE … EXCLUSIVE | 전체 배타 (다른 모든 Lock 차단) |

```sql
-- 명시적 테이블 Lock
LOCK TABLE emp IN SHARE MODE;          -- 다른 세션 DML 차단
LOCK TABLE emp IN EXCLUSIVE MODE;      -- 모든 액세스 차단
LOCK TABLE emp IN ROW EXCLUSIVE MODE;  -- DML 전 묵시적으로 획득
```

### DDL Lock

DDL(CREATE, ALTER, DROP) 실행 시 대상 객체에 **DDL Lock** 설정.
해당 객체를 사용 중인 DML 트랜잭션이 있으면 DDL은 대기.

### Lock Escalation (Lock 에스컬레이션)

일부 DBMS에서 Row Lock이 많아지면 자동으로 Table Lock으로 상향. **Oracle은 Lock Escalation 없음**.

---

## 2. 트랜잭션 (Transaction)

### 트랜잭션의 특성 (ACID)

| 특성 | 영문 | 설명 |
|------|------|------|
| **원자성** | Atomicity | 모두 성공 또는 모두 실패 |
| **일관성** | Consistency | 트랜잭션 전후 데이터 무결성 유지 |
| **격리성** | Isolation | 동시 실행 트랜잭션이 서로 영향 없음 |
| **지속성** | Durability | COMMIT된 데이터는 영구 저장 |

### TCL (Transaction Control Language)

```sql
-- 트랜잭션 시작 (Oracle: 첫 번째 DML 시 자동 시작)
INSERT INTO emp (empno, ename) VALUES (9999, 'TEST');

-- COMMIT: 변경 영구 반영 + Lock 해제
COMMIT;

-- ROLLBACK: 변경 취소 + Lock 해제
ROLLBACK;

-- SAVEPOINT: 부분 롤백 지점 설정
SAVEPOINT sp1;
UPDATE emp SET sal = 5000 WHERE empno = 7788;
SAVEPOINT sp2;
UPDATE emp SET sal = 6000 WHERE empno = 7369;
ROLLBACK TO SAVEPOINT sp2;  -- sp2 이후만 롤백 (7369 UPDATE 취소)
COMMIT;  -- sp1~sp2 사이 변경(7788 UPDATE)은 유지
```

### Undo (롤백 세그먼트)

- DML 실행 시 변경 전 데이터를 **Undo 세그먼트**에 저장
- ROLLBACK 시 Undo 데이터로 원상 복구
- **읽기 일관성(Read Consistency)**: 쿼리 시작 시점의 데이터를 보장

```
세션A: UPDATE emp SET sal = 9000 WHERE empno = 7788;
세션B: SELECT * FROM emp WHERE empno = 7788;
  → 세션A가 COMMIT 전이면 세션B는 Undo에서 변경 전 값(원래 sal)을 읽음
```

---

## 3. 동시성 제어

### 동시성 문제

| 문제 | 설명 | 예시 |
|------|------|------|
| **Dirty Read** | Commit 전 데이터 읽기 | 세션A 미확정 변경을 세션B가 읽음 |
| **Non-Repeatable Read** | 같은 쿼리가 다른 결과 반환 | 조회 사이에 다른 세션이 UPDATE |
| **Phantom Read** | 같은 범위 쿼리에 새 행 나타남 | 조회 사이에 다른 세션이 INSERT |

### 트랜잭션 격리 수준 (Isolation Level)

| 격리 수준 | Dirty Read | Non-Repeatable Read | Phantom Read |
|---------|-----------|--------------------|----|
| **READ UNCOMMITTED** | 발생 | 발생 | 발생 |
| **READ COMMITTED** | 방지 | 발생 | 발생 |
| **REPEATABLE READ** | 방지 | 방지 | 발생 |
| **SERIALIZABLE** | 방지 | 방지 | 방지 |

> **Oracle 기본**: READ COMMITTED. MVCC로 Dirty Read 방지 + 높은 동시성 유지

```sql
-- 격리 수준 변경 (세션 레벨)
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### MVCC (Multi-Version Concurrency Control)

Oracle이 사용하는 동시성 제어 메커니즘.

```
읽기 → Lock 없음 (Undo를 통해 SCN 기준 데이터 조회)
쓰기 → Row Level X Lock
→ 읽기와 쓰기가 서로 방해하지 않음 → 높은 동시성
```

- **SCN (System Change Number)**: 데이터 변경 시마다 증가하는 일련번호
- **CR Block (Consistent Read Block)**: 쿼리 시작 SCN 기준의 블록 복사본

---

## 4. 교착 상태 (Deadlock)

### 교착 상태 발생 원리

```
세션A: UPDATE emp SET sal = 1000 WHERE empno = 7788;  → 7788 행 X Lock 획득
세션B: UPDATE emp SET sal = 2000 WHERE empno = 7369;  → 7369 행 X Lock 획득
세션A: UPDATE emp SET sal = 2000 WHERE empno = 7369;  → 7369 행 대기 (세션B가 보유)
세션B: UPDATE emp SET sal = 3000 WHERE empno = 7788;  → 7788 행 대기 (세션A가 보유)
→ 교착 상태 발생!
```

### 교착 상태 해결

- Oracle은 **자동으로 교착 상태 감지** → 한 세션에 ORA-00060 오류 발생 후 롤백
- 예방: **접근 순서 일관성** 유지 (항상 7369 먼저, 7788 나중에 접근)

---

## 4-1. ITL (Interested Transaction List)

블록 헤더의 **트랜잭션 슬롯**. 해당 블록을 변경 중인 트랜잭션 정보 저장.

```
[블록 헤더]
  - ITL 슬롯 1: TXN-ID: 77, SCN: 12345, UBA: ...  ← 트랜잭션 중
  - ITL 슬롯 2: TXN-ID: 78, SCN: 12367, UBA: ...  ← 트랜잭션 중
  - ITL 슬롯 3: 빈 슬롯 (다음 트랜잭션 사용 가능)
```

| 파라미터 | 설명 | 기본값 |
|---------|------|--------|
| **INITRANS** | 초기 ITL 슬롯 수 | 테이블: 1, 인덱스: 2 |
| **MAXTRANS** | 최대 ITL 슬롯 수 | 255 |

```sql
-- ITL 부족으로 인한 경합 방지
ALTER TABLE emp INITRANS 4;  -- ITL 슬롯 수 증가
-- 동시 DML이 많은 핫 블록에서 buffer busy waits 감소 효과
```

> **ITL Wait**: 모든 ITL 슬롯이 사용 중이면 새 트랜잭션은 대기 → buffer busy waits 발생. INITRANS 증가로 해소.

## 4-2. CR (Consistent Read) Block

읽기 일관성 보장을 위해 Undo를 사용하여 **과거 시점의 블록 복사본** 생성.

```
세션A: UPDATE emp SET sal = 9000 (미COMMIT)
세션B: SELECT sal FROM emp (쿼리 시작 SCN = 100)

시스템:
1. 현재 블록에서 해당 행의 SCN > 100 확인 (세션A가 변경함)
2. Undo Segment에서 SCN=100 이전의 값 복원
3. CR Block 생성: 변경 전 값(sal = 기존값) 포함
4. 세션B는 CR Block에서 읽기 → 세션A의 변경 보지 못함
```

> **핵심**: Oracle MVCC의 핵심 메커니즘. 읽기(SELECT)는 쓰기(DML)를 차단하지 않음.

---

## 5. Latch와 Lock의 차이

| 구분 | Latch | Lock |
|------|-------|------|
| 대상 | 메모리 구조 (SGA) | 테이블, 행 등 데이터 객체 |
| 대기 방식 | Spin (CPU 사용 대기) | Sleep (대기열 등록) |
| 선점 | 불가 | 선점 구조 없음 |
| 종류 | library cache latch, cache buffers chains | TM Lock, TX Lock |

```sql
-- Latch 경합 확인
SELECT name, gets, misses, spin_gets
FROM   V$LATCH
WHERE  name LIKE 'library cache%';

-- Lock 대기 확인
SELECT l.sid, l.type, l.id1, l.id2, l.lmode, l.request
FROM   V$LOCK l
WHERE  l.request > 0;  -- 대기 중인 Lock
```

---

## 출제 포인트

- **ACID**: 원자성, 일관성, 격리성, 지속성
- **Shared Lock vs Exclusive Lock**: SELECT vs DML
- **SELECT FOR UPDATE**: 명시적 X Lock, NOWAIT/WAIT 옵션
- **Oracle Lock Escalation 없음**: Row Level Lock만 사용 (다른 DBMS와 차이)
- **TM Lock 6가지 모드**: RS, RX, S, SRX, X — DML 시 묵시적으로 RX 획득
- **ITL (Interested Transaction List)**: 블록 헤더 트랜잭션 슬롯, INITRANS로 확장
- **ITL Wait**: 슬롯 부족 시 buffer busy waits 발생 → INITRANS 증가
- **CR Block**: Undo로 과거 시점 블록 복원, MVCC의 핵심
- **MVCC**: 읽기는 Lock 없음, 쓰기는 Row Lock → 높은 동시성
- **격리 수준**: READ COMMITTED(Oracle 기본), Dirty Read/Non-Repeatable Read/Phantom Read 구분
- **Undo**: 롤백 데이터 저장, CR Block 생성으로 읽기 일관성 보장
- **교착 상태**: 상호 대기 → Oracle이 자동 감지, ORA-00060 오류 후 해소
- **Latch vs Lock**: 메모리 구조(Latch, Spin 대기) vs 데이터 객체(Lock, Sleep 대기)
- **SAVEPOINT**: 부분 롤백 지점 설정
