# TypeScript 타입 검사 결과

| 항목 | 내용 |
|:---|:---|
| 검사일 | 2026-06-06 |
| 검사 범위 | components/, pages/, lib/, context/, types/ |
| 검사 파일 수 | 41개 (.ts / .tsx) |
| 총 이슈 수 | 9건 (높음 0 / 중간 0 / 낮음 9) |

---

## 검사 결과 요약

| 코드 | 항목 | 건수 | 판정 |
|:---|:---|:---:|:---:|
| TC-001 | `any` 타입 사용 | **0** | ✅ 통과 |
| TC-002 | 타입 단언(`as`) 과다 | **6** | ⚠️ 낮음 |
| TC-003 | null/undefined 처리 누락 | **0** | ✅ 통과 |
| TC-004 | 함수 반환 타입 미명시 | **0** | ✅ 통과 |
| TC-005 | Props 인터페이스 미정의 | **3** | ⚠️ 낮음 |
| TC-006 | `enum` 사용 (as const 권장) | **0** | ✅ 통과 |
| TC-007 | React 이벤트 타입 미명시 | **0** | ✅ 통과 |

**종합 판정**: ✅ **통과** (높음·중간 이슈 없음, 낮음 9건은 리팩터링 시 개선 권장)

---

## 이슈 목록

| VI-ID | 코드 | 파일 | 라인 | 심각도 | 설명 |
|:---|:---:|:---|:---:|:---:|:---|
| VI-001 | TC-002 | `lib/questions.ts` | 21~26 | 낮음 | Part 1/2 JSON import에 `as Question[]` 타입 단언 사용 — Part 3(28~34줄)은 단언 없음. 불일치 |
| VI-002 | TC-002 | `lib/questions.ts` | 68, 74, 75 | 낮음 | `exam1/exam2 as Question[]` — JSON 임포트 단언. tsconfig `resolveJsonModule` 활용 시 불필요할 수 있음 |
| VI-003 | TC-002 | `lib/questions.ts` | 104 | 낮음 | `practicalData as PracticalQuestion[]` — JSON 스키마가 타입과 일치하므로 `satisfies` 패턴 고려 |
| VI-004 | TC-002 | `lib/progress.ts` | 24 | 낮음 | `JSON.parse(raw) as ProgressStore` — localStorage 파싱 후 타입 단언. 런타임 스키마 검증 없음 |
| VI-005 | TC-002 | `pages/quiz/chapter/[chapterId].tsx` | 78 | 낮음 | `Array.from(new Set(...)) as QuestionType[]` — Set 원소가 이미 QuestionType이므로 단언 대신 타입 좁히기 가능 |
| VI-006 | TC-002 | `lib/usePracticalAnswer.ts` | 49 | 낮음 | `n as 0 \| 7 \| 15` — `if` 가드 후 단언으로 안전하나, 타입 가드 함수(`isValidScore`)로 대체 가능 |
| VI-007 | TC-005 | `components/dashboard/LearningPath.tsx` | 133 | 낮음 | 내부 헬퍼 `NodeBubble`의 Props를 인라인 `{ node: PathNode }`로 정의 — 별도 `interface NodeBubbleProps` 권장 |
| VI-008 | TC-005 | `pages/quiz/practical.tsx` | 12 | 낮음 | 내부 헬퍼 `EmptySection`의 Props를 인라인 `{ label: string }`로 정의 |
| VI-009 | TC-005 | `pages/quiz/result.tsx` | 13 | 낮음 | 내부 헬퍼 `StarIcon`의 Props를 인라인 `{ delay: number }`로 정의 |

---

## 세부 분석

### TC-001: any 타입 — 0건 ✅

`components/`, `pages/`, `lib/`, `context/` 전체에서 `: any`, `as any`, `<any>` 패턴이 발견되지 않았다.

### TC-002: 타입 단언 (`as`) — 6건 ⚠️

**lib/questions.ts (VI-001~003)**

Part 1/2 JSON 임포트는 `as Question[]`로 단언하지만 Part 3 JSON은 단언 없이 사용 중:

```typescript
// Part 1/2 — as 단언 사용
part1_ch1: part1ch1 as Question[],   // line 21
part2_ch1: part2ch1 as Question[],   // line 24

// Part 3 — 단언 없이 직접 사용 (line 28~34)
part3_ch1: part3ch1,
```

**권고**: Part 3와 동일하게 일관성 유지하거나, 전체를 `satisfies Question[]` 패턴으로 통일.

**lib/progress.ts (VI-004)**

```typescript
const parsed = JSON.parse(raw) as ProgressStore  // line 24
```

런타임에 localStorage 내용이 ProgressStore 구조와 다를 경우 조용히 오류가 발생할 수 있다. 현재는 `{ ...defaultProgress(), ...parsed }` 병합으로 방어하고 있어 실질적 위험은 낮다.

**lib/usePracticalAnswer.ts (VI-006)**

```typescript
// 현재
if (n === 0 || n === 7 || n === 15) setSelfScore(n as 0 | 7 | 15)

// 개선안 — 타입 가드 함수
function isValidScore(n: number): n is 0 | 7 | 15 {
  return n === 0 || n === 7 || n === 15
}
if (isValidScore(n)) setSelfScore(n)  // as 단언 불필요
```

### TC-003: null/undefined 처리 — 0건 ✅

- `optional chaining (?.)` 적절히 사용
- localStorage 접근 전 `typeof window !== 'undefined'` 가드 준수
- 배열 접근 시 `?? []`, `?? 0` 기본값 처리 일관성 유지
- `getStaticProps` 반환 객체에서 undefined 처리 올바름

### TC-004: 함수 반환 타입 — 0건 ✅

lib/ 전체 exported 함수에 명시적 반환 타입이 정의되어 있다:

```typescript
export function loadProgress(): ProgressStore { ... }
export function getStats(): Stats { ... }
export function getMockExamQuestions(examNum: 1 | 2): Question[] { ... }
export function usePracticalAnswer(practiceId: string): UsePracticalAnswerReturn { ... }
```

### TC-005: Props 인터페이스 미정의 — 3건 ⚠️

3건 모두 **파일 내부 헬퍼 컴포넌트**로 외부에 export되지 않는다. 복잡도가 낮고 재사용되지 않으므로 실질적 위험은 없다. 코드 일관성 관점에서 개선 권장:

```typescript
// 현재
function NodeBubble({ node }: { node: PathNode }) { ... }

// 권장
interface NodeBubbleProps { node: PathNode }
function NodeBubble({ node }: NodeBubbleProps) { ... }
```

### TC-006: enum 사용 — 0건 ✅

`types/index.ts`에서 `enum` 대신 TypeScript 유니온 타입(`type QuestionType = 'concept' | 'result' | ...`)을 사용 중. 트리쉐이킹 및 번들 크기 최적화에 적합한 패턴이다.

### TC-007: React 이벤트 타입 — 0건 ✅

이벤트 핸들러 타입 명시 현황:

```typescript
// AnswerTextEditor.tsx
onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void   // ✅ 명시

// usePracticalAnswer.ts
handleAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void  // ✅ 명시
```

모든 `onChange`, `onClick` 핸들러에서 암시적 타입 없음.

---

## 종합 의견

전반적으로 타입 안전성이 높은 코드베이스이다. `any` 타입 제로(TC-001), 이벤트 핸들러 완전 타입 명시(TC-007), 전체 lib 함수의 반환 타입 명시(TC-004)가 특히 우수하다.

발견된 9건은 모두 **낮음** 심각도이며, 주로 JSON 임포트 타입 단언과 내부 헬퍼 컴포넌트의 인라인 Props이다. 즉각 수정이 필요한 항목은 없으나, 다음 리팩터링 시 아래 2가지를 함께 처리하면 코드 품질이 향상된다:

1. **VI-001**: `lib/questions.ts`의 JSON import 단언 방식 통일 (Part 1/2/3 일관성)
2. **VI-006**: `n as 0 | 7 | 15` → 타입 가드 함수로 교체

---

## 버전 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|:---|:---|:---|:---|
| v1.0 | 2026-06-06 | AI-DLC | 최초 작성 (SQLP 사이트, 3과목 체계 반영) |
