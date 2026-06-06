# RULES — SQLP 시험 준비 사이트 개발 규칙

---

## [필수] 프로세스 규칙

### 플랜 우선 원칙

소스코드(`pages/`, `components/`, `lib/`, `types/`, `context/`) 수정 전 반드시 플랜 파일을 먼저 작성한다. 하네스가 자동으로 강제한다.

```
1. docs/plans/NNN_slug.md 생성 (채번: 마지막 번호 + 1)
   → PostToolUse 훅이 .claude/.active-plan 자동 설정
2. 소스코드 수정 가능
3. 작업 완료 후 플랜의 "배운 점" 섹션 기록
```

### AI-DLC 산출물 저장 규칙

`ai-dlc-*` 스킬로 생성되는 모든 산출물은 반드시 `docs/ai-dlc/` 폴더에 저장한다. 하네스가 자동으로 강제한다.

- 파일명: `{문서유형}_DAP_Master_{YYYYMMDD}.md`
- 스킬 실행 후 `docs/ai-dlc/README.md` 진행 현황 업데이트 필수

---

## 시험 구조 (SQLP 기준)

| 과목 | 제목 | 객관식 | 실기 | 배점 |
|------|------|--------|------|------|
| 1과목 | 데이터 모델링의 이해 | 10 | — | 10점 |
| 2과목 | SQL 기본 및 활용 | 20 | — | 20점 |
| 3과목 | SQL 고급활용 및 튜닝 | 40 | — | 40점 |
| 실기 | SQL튜닝/성능트러블슈팅 | — | 2 | 30점 (15점×2) |
| **합계** | | **70** | **2** | **100점 / 180분** |

합격 기준: 전체 60점 이상 + 과목별 40% 이상

---

## TypeScript 타입 규칙

### 필수 타입 (types/index.ts)

```typescript
// part는 3과목 리터럴 유니온
part: 1 | 2 | 3

// questionType에 실기 포함
questionType?: 'concept' | 'result' | 'completion' | 'error'

// ExamResult에 3과목 점수 필드
interface ExamResult {
  part1Score: number
  part2Score: number
  part3Score: number
  practicalAnswers?: PracticalAnswer[]
}

// 실기 문제 타입
interface PracticalQuestion {
  id: string            // "practical_001"
  type: 'sql-tuning' | 'troubleshooting'
  subType: 1 | 2 | 3   // 유형1/2/3
  content: string       // 지문 (마크다운)
  sampleAnswer: string  // 모범 답안
  scoringGuide: string  // 채점 가이드
}

interface PracticalAnswer {
  questionId: string
  userAnswer: string
  selfScore: 0 | 7 | 15  // 자기채점
}
```

### 타입 변경 순서

1. `types/index.ts` 먼저 수정
2. TypeScript 오류를 따라 연쇄 수정
3. `npx tsc --noEmit` 통과 후 다음 파일 진행

---

## ID 형식 규칙

| 종류 | 패턴 | 예시 |
|:---|:---|:---|
| 챕터 ID | `part[1-3]_ch[1-7]` | `part3_ch3` |
| 객관식 문제 ID | `p[1-3]c[1-7]_\d{3}` | `p3c3_001` |
| 모의고사 문제 ID | `exam[12]_\d{3}` | `exam1_042` |
| 실기 문제 ID | `practical_\d{3}` | `practical_003` |

- 새 챕터(Part 3) 문제 ID는 001부터 순차 채번
- `scripts/validate-questions.ts` 검증 통과 필수

---

## localStorage 규칙

1. **typeof window 가드 필수**: 모든 localStorage 접근 전 반드시 체크
   ```typescript
   if (typeof window === 'undefined') return defaultValue
   ```

2. **키 목록** (이 목록에서만 사용):
   - `sqlp_progress` — 학습 진도 (answers, bookmarks, examHistory)
   - `q-theme` — 다크모드 테마

3. **세션 구분 없음**: 모의고사 세션도 `sqlp_progress.examHistory`에 저장

---

## 데이터 파일 규칙

### 이론 MD 파일 (`data/theory/part{N}_ch{M}.md`)

```markdown
# {N}과목 {M}장: {챕터 제목}

## 1. {주요항목}

### {세부항목}

...

## 출제 포인트
```

- 헤딩 레벨: `#` 챕터 제목, `##` 주요항목, `###` 세부항목
- `TheoryTOC`는 `##` 헤딩만 추출하여 목차 생성
- 마지막 섹션은 `## 출제 포인트` 권장

### 객관식 문제 JSON (`data/questions/part{N}_ch{M}.json`)

```json
[
  {
    "id": "p{N}c{M}_{DDD}",
    "part": N,
    "chapter": "part{N}_ch{M}",
    "content": "문제 내용",
    "options": ["①", "②", "③", "④"],
    "answer": 0,
    "explanation": "해설",
    "tags": ["태그"],
    "difficulty": "하|중|상",
    "questionType": "concept|result|completion|error"
  }
]
```

- `options` 배열: 4개 고정
- `answer`: **1-based index (1~4)**. 1=첫 번째 보기, 4=네 번째 보기 (코드와 데이터 모두 1-based 일관)
- `difficulty`: `하` 20%, `중` 55%, `상` 25% 권장 비율

### 실기 문제 JSON (`data/practical/questions.json`)

```json
[
  {
    "id": "practical_001",
    "type": "sql-tuning",
    "subType": 1,
    "content": "지문 내용 (마크다운)",
    "sampleAnswer": "모범 답안 SQL 및 설명",
    "scoringGuide": "채점 기준"
  }
]
```

- `type`: `"sql-tuning"` (SQL튜닝 3유형) | `"troubleshooting"` (성능트러블슈팅 2유형)
- `subType`: 1/2/3 (유형 번호)
- 자기채점 점수: 0 / 7 / 15점

### 모의고사 JSON (`data/mockexam/exam{N}.json`)

```json
[/* 70문항: 1과목 10 + 2과목 20 + 3과목 40 */]
```

---

## 합격 판정 규칙

```typescript
const TOTAL_PASS = 60           // 전체 60점 이상
const PART_PASS_RATE = 0.4      // 과목별 40% 이상

const PART_MAX: Record<number, number> = {
  1: 10, 2: 20, 3: 40  // 배점 기준
}

function isExamPassed(p1: number, p2: number, p3: number): boolean {
  const total = p1 + p2 + p3
  return (
    total >= TOTAL_PASS &&
    p1 >= PART_MAX[1] * PART_PASS_RATE &&   // ≥ 4점
    p2 >= PART_MAX[2] * PART_PASS_RATE &&   // ≥ 8점
    p3 >= PART_MAX[3] * PART_PASS_RATE      // ≥ 16점
  )
}
```

---

## SSG 제약 규칙

1. `getStaticPaths`는 `CHAPTERS` 배열을 단일 소스로 사용 — 하드코딩 금지
2. 동적 `require()`는 `getStaticProps` 또는 lib 함수 내에서만 — 컴포넌트 렌더 중 사용 금지
3. `fallback: false` — 존재하지 않는 경로는 404

---

## 컴포넌트 규칙

- 새 컴포넌트: `components/` 하위 도메인 폴더에 위치 (예: `components/quiz/`)
- props 타입: 인라인 `interface Props` 또는 `types/index.ts` export
- 다크모드: CSS 변수(`var(--q-bg)`) 사용. Tailwind `dark:` 클래스 병행 가능
- 한국어 텍스트: 하드코딩 허용 (i18n 불필요)
