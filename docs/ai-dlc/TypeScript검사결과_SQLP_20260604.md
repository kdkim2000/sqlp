# TypeScript 타입 검사 결과

| 항목 | 내용 |
|:---|:---|
| 검사일 | 2026-06-04 |
| 검사 범위 | `types/`, `lib/`, `context/`, `components/`, `pages/` (43개 파일) |
| 기준 | ai-dlc-fe-ts-check TC-001~007 |

---

## 검사 결과 요약

| 코드 | 항목 | 이슈 수 | 판정 |
|:---|:---|:---:|:---:|
| TC-001 | any 타입 사용 | 0 | ✅ 통과 |
| TC-002 | 타입 단언(`as`) 과다 사용 | 4 | ⚠️ 조건부 |
| TC-003 | null/undefined 처리 누락 | 0 | ✅ 통과 |
| TC-004 | 함수 반환 타입 미명시 | 0 | ✅ 통과 |
| TC-005 | Props 인터페이스 미정의 | 2 | 🔵 참고 |
| TC-006 | enum 사용 | 0 | ✅ 통과 |
| TC-007 | React 이벤트 타입 미명시 | 0 | ✅ 통과 |

**종합 판정**: ⚠️ **조건부 통과** — 타입 오류(any)는 없으나, Phase A 구현 전 반드시 수정할 업무 로직 연계 타입 이슈 2건 존재.

---

## 이슈 목록

### 높음 (Phase A 구현 전 수정 필요)

| VI-ID | 코드 | 파일 | 라인 | 설명 | 권장 조치 |
|:---|:---|:---|:---:|:---|:---|
| VI-001 | TC-002 | `lib/progress.ts` | 4 | `STORAGE_KEY = 'sqld_progress'` — SQLP 전환 필수 사항이지만 아직 `sqld_progress`로 남아있음. 업무 로직 연동 이슈 | `'sqlp_progress'`로 변경 (클래스 설계서 CLS-010 기준) |
| VI-002 | TC-002 | `pages/quiz/exam.tsx` | 12, 349 | `EXAM_DURATION = 90 * 60` — SQLD 90분이 그대로. 또한 line 349에서 `s > 0 → 'skipped'` 타입 단언 로직이 의미상 반전됨. `s === 0`(미선택)이 건너뜀이어야 함 | `180 * 60`으로 변경. 단언 로직을 `s === 0 ? null : 'skipped'`로 재검토 |

### 중간 (개선 권장)

| VI-ID | 코드 | 파일 | 라인 | 설명 | 권장 조치 |
|:---|:---|:---|:---:|:---|:---|
| VI-003 | TC-002 | `lib/questions.ts` | 12~16, 47, 53~54 | JSON import를 `as Question[]`로 캐스팅 (7건). TypeScript resolveJsonModule로 JSON 형태 추론 가능하나 Question 타입과 불일치 시 런타임 오류 가능성 | 현재 허용 범주이나, Part 3 JSON 추가 시 동일 패턴 사용 필수 |
| VI-004 | TC-002 | `pages/quiz/chapter/[chapterId].tsx` | 78 | `Array.from(new Set(...)) as QuestionType[]` — 집합 변환 결과를 강제 캐스팅. 타입 좁히기 함수로 대체 가능 | `filter((t): t is QuestionType => t !== undefined)` 패턴 권장 |

### 참고 (낮음, 현재 패턴 허용)

| VI-ID | 코드 | 파일 | 라인 | 설명 |
|:---|:---|:---|:---:|:---|
| VI-005 | TC-005 | `pages/quiz/result.tsx` | 13 | `StarIcon` 내부 컴포넌트의 Props를 인라인 정의 `{ delay: number }` — 파일 내부 단순 컴포넌트로 허용 범위 |
| VI-006 | TC-005 | `context/ProgressContext.tsx` | 28 | `ProgressProvider({ children }: { children: React.ReactNode })` — 인라인 Props. `React.FC<{ children: React.ReactNode }>` 또는 인터페이스 분리 권장 |

---

## 긍정적 발견 (잘 구현된 패턴)

| 항목 | 내용 |
|:---|:---|
| any 타입 완전 배제 | 전체 43개 파일에서 `: any`, `as any` 패턴 0건 |
| Props 인터페이스 일관성 | 21개 컴포넌트 모두 별도 Props 인터페이스 정의 |
| 이벤트 타입 명시 | 모든 이벤트 핸들러에 React 이벤트 타입 명시 |
| null 처리 | `??` 연산자와 Optional Chaining 일관 사용 |
| SSR 가드 | `lib/progress.ts`에 `typeof window !== 'undefined'` 적용 |
| 반환 타입 명시 | 주요 lib 함수 모두 반환 타입 명시 |
| enum 미사용 | 모든 열거형을 `as const` + union type으로 구현 |

---

## Phase A 구현 시 주의사항

Phase A(Foundation Builder)에서 `types/index.ts`, `lib/progress.ts`, `lib/questions.ts` 등을 수정할 때 아래를 반드시 반영:

```typescript
// VI-001: lib/progress.ts 수정 필수
const STORAGE_KEY = 'sqlp_progress'  // 'sqld_progress' → 변경

// VI-002: pages/quiz/exam.tsx 수정 필수
const EXAM_DURATION = 180 * 60  // 90 → 180분

// lib/questions.ts: Part 3 추가 시 동일 패턴 사용
const CHAPTER_DATA: Record<string, Question[]> = {
  part1_ch1: part1ch1 as Question[],
  // ... 기존
  part3_ch1: part3ch1 as Question[],  // 신규 추가 시
  // ...
}
```

---

## 문서 버전 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|:---|:---|:---|:---|
| v0.1 | 2026-06-04 | 초안 작성 | ai-dlc-fe-ts-check 스킬로 최초 생성. 43개 파일 검사. VI-001~006 도출 |
