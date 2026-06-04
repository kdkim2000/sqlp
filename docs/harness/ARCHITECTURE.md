# ARCHITECTURE — SQLP 시험 준비 사이트

## 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|---------|
| 프레임워크 | Next.js 14 (Pages Router) | SSG로 정적 빌드, Vercel 최적화 |
| 언어 | TypeScript | 타입 안전성, IDE 자동완성 |
| 스타일링 | Tailwind CSS | 빠른 UI 구성, 반응형 용이 |
| 디자인 시스템 | OPUS-X 퍼플 팔레트 | Quest Mode 게이미피케이션 UI |
| 상태관리 | React Context + localStorage | 서버 없이 진도 저장 |
| 마크다운 | react-markdown + rehype-highlight | 이론 콘텐츠 렌더링 |
| 배포 | Vercel | GitHub push 자동 배포 |

---

## 프로젝트 구조

```
sqlp/
├── pages/
│   ├── index.tsx                   # 대시보드 (3과목 진도율)
│   ├── theory/
│   │   ├── index.tsx               # 이론 목차 (12챕터)
│   │   └── [chapterId].tsx         # 챕터 본문 (SSG, 3열 레이아웃)
│   ├── quiz/
│   │   ├── index.tsx               # 문제풀이 메뉴
│   │   ├── chapter/[chapterId].tsx # 단원별 풀이
│   │   ├── exam.tsx                # 모의고사 (70문항, 180분)
│   │   ├── result.tsx              # 결과 화면 (3과목 점수)
│   │   ├── wrong.tsx               # 오답 재풀이
│   │   ├── bookmarks.tsx           # 북마크 문제
│   │   └── practical.tsx           # 실기 연습 목록 [신규]
│   └── practical/                  # [신규, Phase 4]
│       └── [practiceId].tsx        # 실기 상세 풀이
├── components/
│   ├── layout/
│   │   ├── Layout.tsx              # TopBar + main 구조
│   │   └── TopBar.tsx              # 브랜드 + 네비 + 배지 + 다크모드 토글
│   ├── ui/
│   │   ├── Mascot.tsx              # Querymon SVG 마스코트
│   │   └── Badge.tsx               # 스트릭/보석/하트 배지
│   ├── theory/
│   │   ├── TheoryContent.tsx       # 마크다운 렌더러 (헤딩 id 자동 부여)
│   │   ├── TheoryTOC.tsx           # ## 헤딩 기반 자동 목차 (스크롤 스파이)
│   │   └── RelatedQuestions.tsx    # 챕터 관련 문제 미리보기
│   ├── quiz/
│   │   ├── QuestionCard.tsx        # 문제 카드 (보기 포함)
│   │   ├── AnswerFeedback.tsx      # 정답/오답 피드백 + 해설
│   │   ├── QuizNavigator.tsx       # 문제 번호 네비게이션 (70문항)
│   │   ├── ExamTimer.tsx           # 모의고사 타이머 (180분)
│   │   └── PracticalQuestion.tsx   # 실기 문항 컴포넌트 [신규]
│   └── dashboard/
│       ├── HeroBanner.tsx          # 히어로 배너
│       ├── LearningPath.tsx        # 챕터 버블 경로 (12챕터, 3과목 그룹)
│       ├── MascotCard.tsx          # 마스코트 카드
│       ├── WeeklyXP.tsx            # 주간 XP 막대 차트
│       ├── ProgressChart.tsx       # 3과목 정답률 차트
│       └── WeakChapters.tsx        # 취약 챕터 목록
├── lib/
│   ├── questions.ts                # 문제 데이터 로드·필터 유틸
│   ├── theory.ts                   # 이론 데이터 로드 유틸
│   ├── progress.ts                 # localStorage 읽기/쓰기
│   └── chapters.ts                 # 챕터 메타데이터 (12챕터)
├── context/
│   └── ProgressContext.tsx         # 전역 진도 상태 (Context API)
├── types/
│   └── index.ts                    # 공통 타입 정의
├── data/
│   ├── questions/
│   │   ├── part1_ch1.json          # 1과목 1장 (20문항)
│   │   ├── part1_ch2.json          # 1과목 2장 (15문항)
│   │   ├── part2_ch1.json          # 2과목 1장 (30문항)
│   │   ├── part2_ch2.json          # 2과목 2장 (25문항)
│   │   ├── part2_ch3.json          # 2과목 3장 (10문항)
│   │   ├── part3_ch1.json ~ ch7.json  # 3과목 7챕터 [신규]
│   │   └── backup/
│   ├── theory/
│   │   ├── part1_ch1.md ~ part1_ch2.md
│   │   ├── part2_ch1.md ~ part2_ch3.md
│   │   └── part3_ch1.md ~ part3_ch7.md  # [신규]
│   ├── practical/
│   │   └── questions.json          # 실기 문제 [신규]
│   └── mockexam/
│       ├── exam1.json              # 70문항 (P1:10 + P2:20 + P3:40)
│       └── exam2.json
└── public/
```

---

## 데이터 모델

### 문제 (Question)

```typescript
interface Question {
  id: string            // "p3c3_001" (과목-챕터-번호)
  part: 1 | 2 | 3       // 3과목 체계
  chapter: string       // "part3_ch3"
  content: string       // 문제 본문 (마크다운 가능)
  options: string[]     // 보기 4개
  answer: number        // 정답 인덱스 (0-3)
  explanation: string   // 해설
  tags?: string[]       // 키워드 태그
  difficulty?: '하' | '중' | '상'
  questionType?: 'concept' | 'result' | 'completion' | 'error'
  source?: 'chapter' | 'mockexam1' | 'mockexam2'
}
```

### 실기 문제 (PracticalQuestion) [신규]

```typescript
interface PracticalQuestion {
  id: string                              // "practical_001"
  type: 'sql-tuning' | 'troubleshooting'  // SQL튜닝 | 성능트러블슈팅
  subType: 1 | 2 | 3                      // 유형 번호
  content: string                         // 지문 (마크다운)
  sampleAnswer: string                    // 모범 답안
  scoringGuide: string                    // 채점 가이드
}

interface PracticalAnswer {
  questionId: string
  userAnswer: string
  selfScore: 0 | 7 | 15    // 자기채점
}
```

### 진도 데이터 (localStorage: `sqlp_progress`)

```typescript
interface ProgressStore {
  answers: Record<string, 'correct' | 'wrong' | 'skipped'>
  bookmarks: string[]
  lastVisited: { type: 'theory' | 'quiz'; id: string } | null
  examHistory: ExamResult[]
}

interface ExamResult {
  date: string         // ISO 8601
  score: number        // 전체 점수 (100점 만점)
  part1Score: number
  part2Score: number
  part3Score: number   // [신규]
  totalTime: number    // 초
  answers: Record<string, number>
  practicalAnswers?: PracticalAnswer[]  // [신규]
}
```

---

## 상태 관리

```
ProgressContext (전역)
  ├── answers: Record<questionId, result>
  ├── bookmarks: string[]
  ├── markAnswer(id, result) → localStorage 즉시 저장
  ├── toggleBookmark(id)
  ├── getStats() → 3과목별·챕터별 통계 계산
  ├── getStreak() → number  (examHistory 기반, UI-only)
  ├── getXP() → number      (correct * 10, UI-only)
  ├── getGems() → number    (examHistory.length * 50, UI-only)
  └── getHearts() → number  (고정값 3, UI-only)
```

- **읽기**: 페이지 첫 렌더 시 localStorage에서 초기값 로드 (`useEffect`)
- **쓰기**: `markAnswer` 호출 시 상태 업데이트 + localStorage 동시 저장
- **SSR 주의**: `typeof window !== 'undefined'` 가드 필수

---

## 페이지별 데이터 흐름

### 이론 페이지 (`/theory/[chapterId]`)
```
getStaticPaths  →  lib/chapters.ts 의 CHAPTERS 배열 (12챕터) → 12개 경로
getStaticProps  →  data/theory/{chapterId}.md 읽어 markdown string으로 전달
컴포넌트        →  3열: TheoryTOC(좌) + TheoryContent(중) + RelatedQuestions(우)
```

### 모의고사 (`/quiz/exam`)
```
클라이언트 사이드  →  전체 JSON에서 비율 샘플링 (1과목 10 + 2과목 20 + 3과목 40 = 70문항)
ExamTimer         →  180분 카운트다운, 종료 시 자동 제출
결과 저장         →  ExamResult → localStorage.examHistory
결과 화면         →  /quiz/result (3과목 점수 분리 표시)
```

### 실기 연습 (`/quiz/practical`) [신규]
```
컴포넌트         →  data/practical/questions.json 로드
                    → PracticalQuestion 컴포넌트 (지문 + SQL 작성 + 모범답안 토글 + 자기채점)
자기채점         →  0 / 7 / 15점 선택 → practicalAnswers에 저장
```

---

## SSG 경로 생성

```typescript
// lib/chapters.ts
export const CHAPTERS: ChapterMeta[] = [
  // Part 1: 데이터 모델링의 이해
  { id: 'part1_ch1', part: 1, chapter: 1, title: '데이터 모델링의 이해', ... },
  { id: 'part1_ch2', part: 1, chapter: 2, title: '데이터 모델과 SQL', ... },
  // Part 2: SQL 기본 및 활용
  { id: 'part2_ch1', part: 2, chapter: 1, title: 'SQL 기본', ... },
  { id: 'part2_ch2', part: 2, chapter: 2, title: 'SQL 활용', ... },
  { id: 'part2_ch3', part: 2, chapter: 3, title: '관리 구문', ... },
  // Part 3: SQL 고급활용 및 튜닝 [신규 7챕터]
  { id: 'part3_ch1', part: 3, chapter: 1, title: 'SQL 수행 구조', ... },
  { id: 'part3_ch2', part: 3, chapter: 2, title: 'SQL 분석 도구', ... },
  { id: 'part3_ch3', part: 3, chapter: 3, title: '인덱스 튜닝', ... },
  { id: 'part3_ch4', part: 3, chapter: 4, title: '조인 튜닝', ... },
  { id: 'part3_ch5', part: 3, chapter: 5, title: 'SQL 옵티마이저', ... },
  { id: 'part3_ch6', part: 3, chapter: 6, title: '고급 SQL 튜닝', ... },
  { id: 'part3_ch7', part: 3, chapter: 7, title: 'Lock과 트랜잭션 동시성 제어', ... },
]
// → getStaticPaths가 이 배열로 12개 경로 생성 (theory + quiz)
```

---

## 빌드 및 배포

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 정적 빌드 (SSG, 12챕터 경로 생성)
npm run lint     # ESLint
npx tsc --noEmit # 타입 검사
npm run test     # Vitest 단위 테스트
```

**Vercel 배포**: `git push` → 자동 빌드 → CDN 배포

---

## 주요 설계 결정

| 결정 | 근거 |
|------|------|
| Pages Router (App Router 아님) | SSG 패턴이 Pages Router에서 더 직관적 |
| JSON 파일로 문제 관리 | DB 없이 Git으로 버전 관리, PR로 추가/수정 |
| localStorage (서버 없이) | 회원가입 없이 즉시 사용, 개인정보 불필요 |
| 마크다운으로 이론 저장 | 코드 블록·표 표현 용이, 수정 편의 |
| SSG | 정적 데이터 → CDN 서빙 최적 |
| 실기 자기채점 | 자동 채점 불가한 서술형 특성상 0/7/15점 자기평가 |
