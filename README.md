# SQLP 합격길잡이 🎓

SQLP(SQL 전문가) 자격증 시험 준비를 위한 **웹 기반 학습 플랫폼**입니다.  
이론 학습 + 예상문제 풀이 + 모의고사 + 실기 연습을 한 곳에서 제공합니다.

**🔗 라이브 데모:** (배포 대기 중)

---

## 📖 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **용도** | SQLP 시험 준비 |
| **학습 범위** | 1과목(데이터모델링) + 2과목(SQL기본·활용) + 3과목(SQL고급·튜닝) |
| **총 문항** | 70문항 객관식 + 실기 2문항 |
| **시험 시간** | 180분 |
| **주요 기능** | 이론 학습, 단원별 풀이, 모의고사(180분), 실기 연습, 오답 재풀이, 북마크 |
| **진도 추적** | localStorage 기반 (로그인 불필요) |
| **배포 환경** | Vercel |

---

## 🚀 빠른 시작

### 설치
```bash
# 저장소 클론
git clone https://github.com/kdkim2000/sqlp.git
cd sqlp

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 접속
```
http://localhost:3000
```

### 빌드 & 배포
```bash
# 타입 검사 + ESLint + 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

---

## 🎯 주요 기능

### 📚 이론 학습
- **12개 챕터** — 데이터모델링 + SQL기본·활용 + SQL고급·튜닝
- **마크다운 기반** — 표, SQL 코드블록, 예시 포함
- **진도 추적** — 각 챕터 학습 이력 기록

```
1과목 데이터 모델링의 이해
├─ 1장: 데이터 모델링의 이해
└─ 2장: 데이터 모델과 SQL

2과목 SQL 기본 및 활용
├─ 1장: SQL 기본
├─ 2장: SQL 활용
└─ 3장: 관리 구문 (DML·TCL·DDL·DCL)

3과목 SQL 고급활용 및 튜닝
├─ 1장: SQL 수행 구조
├─ 2장: SQL 분석 도구
├─ 3장: 인덱스 튜닝
├─ 4장: 조인 튜닝
├─ 5장: SQL 옵티마이저
├─ 6장: 고급 SQL 튜닝
└─ 7장: Lock과 트랜잭션 동시성 제어
```

### 🎯 문제 풀이
- **단원별 풀기** — 각 챕터별로 순차 풀이
- **모의고사** — 70문항 + 180분 타이머 (실제 시험과 동일)
- **오답 재풀이** — 틀린 문제만 모아서 학습
- **북마크** — 중요 문제 따로 정리

**채점 기준 (SQLP):**
```
합격 조건:
- 총점 60점 이상 (100점 만점)
- 1과목 4점 이상 (10점 만점 × 40%)
- 2과목 8점 이상 (20점 만점 × 40%)
- 3과목 16점 이상 (40점 만점 × 40%)
```

### ✍️ 실기 연습 (신규)
- **SQL 튜닝** — 유형1(성능 저하 SQL 개선), 유형2(실행계획 기반), 유형3(데이터 모델 기반)
- **성능 트러블슈팅** — 유형1(애플리케이션 성능), 유형2(성능 이슈 분석)
- **자기채점** — 0점(오답) / 7점(부분) / 15점(만점)
- **모범 답안 비교** — 제출 후 모범 답안 공개

### 📊 학습 대시보드
- **3과목 진도율** — 과목별 정답률 차트
- **챕터 버블** — 12챕터 학습 상태 시각화
- **취약 단원** — 정답률 낮은 챕터 강조

---

## 🛠 기술 스택

### 프론트엔드
- **Next.js 14** (Pages Router, SSG)
- **TypeScript** — 타입 안전성
- **Tailwind CSS** — 반응형 스타일링
- **React Context** — 전역 상태 관리

### 콘텐츠
- **Markdown** — 이론 콘텐츠 (12챕터)
- **JSON** — 문제 데이터 (객관식 + 실기)
- **react-markdown + rehype-highlight** — SQL 코드 하이라이팅

### 저장소
- **localStorage** — 진도 추적 (키: `sqlp_progress`)
- **SSG** — 정적 페이지 사전 생성

### 배포
- **Vercel** — Next.js 최적화 호스팅

---

## 📁 프로젝트 구조

```
sqlp/
├── pages/
│   ├── index.tsx                    ← 대시보드 홈 (3과목 진도율)
│   ├── theory/
│   │   ├── index.tsx                ← 이론 목차 (12챕터)
│   │   └── [chapterId].tsx          ← 이론 본문 (SSG)
│   ├── quiz/
│   │   ├── index.tsx                ← 문제풀기 허브
│   │   ├── chapter/[chapterId].tsx  ← 단원별 풀이 (SSG)
│   │   ├── exam.tsx                 ← 모의고사 (70문항·180분)
│   │   ├── result.tsx               ← 챕터 결과
│   │   ├── wrong.tsx                ← 오답 재풀이
│   │   ├── bookmarks.tsx            ← 북마크 문제
│   │   └── practical.tsx            ← 실기 문제 목록
│   └── practical/
│       └── [practiceId].tsx         ← 실기 상세 풀이
│
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx               ← GNB (이론·문제풀기·실기 연습)
│   │   └── Layout.tsx
│   ├── theory/
│   │   ├── TheoryContent.tsx        ← 마크다운 렌더링
│   │   ├── TheoryTOC.tsx            ← 자동 목차 + 스크롤 스파이
│   │   └── RelatedQuestions.tsx
│   ├── quiz/
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerFeedback.tsx
│   │   ├── QuizNavigator.tsx        ← 70문항 그리드
│   │   ├── ExamTimer.tsx            ← 180분 타이머
│   │   ├── PracticalQuestion.tsx    ← 실기 풀이 컨테이너
│   │   └── PracticalCard.tsx
│   ├── practical/
│   │   ├── ScenarioPanel.tsx        ← 지문 렌더링
│   │   ├── AnswerTextEditor.tsx     ← SQL 작성 textarea
│   │   ├── SampleAnswerToggle.tsx   ← 모범 답안 토글
│   │   └── ScoringGuide.tsx        ← 자기채점 (0/7/15점)
│   └── dashboard/
│       ├── ProgressChart.tsx        ← 3과목 정답률 차트
│       ├── LearningPath.tsx         ← 12챕터 버블 경로
│       └── WeakChapters.tsx
│
├── lib/
│   ├── questions.ts                 ← 문제 로드 (Part 1~3 + 실기)
│   ├── theory.ts                    ← 이론 콘텐츠 로드
│   ├── progress.ts                  ← localStorage 진도 관리
│   ├── chapters.ts                  ← 12챕터 메타데이터
│   └── usePracticalAnswer.ts        ← 실기 답안 상태 훅
│
├── context/
│   └── ProgressContext.tsx          ← useProgress 훅
│
├── types/
│   └── index.ts                     ← TypeScript 인터페이스
│
└── data/
    ├── questions/                   ← Part 1~3 JSON (12파일)
    ├── theory/                      ← 이론 마크다운 (12파일)
    ├── practical/                   ← 실기 문제 JSON
    └── mockexam/                    ← 모의고사 JSON (70문항)
```

---

## 🔄 데이터 흐름

### 학습 진도 추적
```
사용자 선택지 선택
    ↓
QuestionCard → markAnswer 호출
    ↓
ProgressContext.markAnswer()
    ↓
lib/progress.ts → localStorage('sqlp_progress') 저장
    ↓
getStats() 계산 (3과목별 정답률·진도)
    ↓
Dashboard에 반영
```

### 모의고사 플로우
```
시험 준비 화면 (180분 타이머 설정)
    ↓
문제 풀이 (70문항: 1과목10 + 2과목20 + 3과목40)
    ↓
제출 버튼
    ↓
채점 (3과목별 점수 계산)
    ↓
합격 판정 (전체 60점 + 과목별 40%)
```

---

## 🧪 개발 명령어

```bash
# 개발 서버 (hot reload)
npm run dev

# 타입 검사
npx tsc --noEmit

# ESLint 검사
npm run lint

# 전체 빌드
npm run build

# 단위 테스트
npm run test
```

---

## 🔐 데이터 보안

### localStorage 사용
- **장점**: 로그인 불필요, 즉시 시작
- **키**: `sqlp_progress` (answers·bookmarks·examHistory·practicalAnswers)

---

## 📄 라이선스

MIT License — 자유로운 사용, 수정, 배포 가능

---

**마지막 업데이트**: 2026-06-05  
**버전**: 2.0.0 (SQLD → SQLP 전환)  
**상태**: 🔄 콘텐츠 데이터 생성 중
