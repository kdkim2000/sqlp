# 002 — SQLP 전면 개편 (SQLD → SQLP)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-04 |
| 상태 | IN PROGRESS |
| 담당 에이전트 | foundation-builder(3) → content-writer(2/9) → quiz-builder(5) → theory-builder(6) → dashboard-builder(7) → qa(8) |

## 배경 및 목적

기존 SQLD(SQL Developer) 학습 사이트를 SQLP(SQL 전문가) 학습 사이트로 전면 개편한다.

**핵심 차이점:**

| 항목 | SQLD | SQLP |
|------|------|------|
| 과목 수 | 2과목 | 3과목 |
| 객관식 | 50문항 | 70문항 |
| 실기 | 없음 | 2문항 (15점×2) |
| 시험 시간 | 90분 | 180분 |
| 챕터 수 | 5장 | 12장 |
| 합격 기준 | 과목별 40% + 전체 60점 | 동일 |

## 변경 범위

### Phase A — 기반 타입 및 유틸 (foundation-builder)

**변경 파일:**
- `types/index.ts` — `Question.part: 1|2|3`, `PracticalQuestion` 인터페이스 신규, `ExamResult.part3Score` 추가
- `lib/chapters.ts` — Part 3 챕터 7개 추가, `part: 1|2|3` 타입
- `lib/progress.ts` — localStorage 키 `'sqld_progress'` → `'sqlp_progress'`, 70문항 샘플링
- `lib/questions.ts` — Part 3 파일 로딩, 모의고사 구성 변경 (P1:10 + P2:20 + P3:40)

### Phase B — 콘텐츠 생성 (content-writer / pdf-extractor)

**신규 파일:**
```
data/theory/part3_ch1.md  — SQL 수행 구조
data/theory/part3_ch2.md  — SQL 분석 도구
data/theory/part3_ch3.md  — 인덱스 튜닝
data/theory/part3_ch4.md  — 조인 튜닝
data/theory/part3_ch5.md  — SQL 옵티마이저
data/theory/part3_ch6.md  — 고급 SQL 튜닝
data/theory/part3_ch7.md  — Lock과 트랜잭션 동시성 제어

data/questions/part3_ch1.json  (목표 30문항)
data/questions/part3_ch2.json  (목표 20문항)
data/questions/part3_ch3.json  (목표 40문항)
data/questions/part3_ch4.json  (목표 40문항)
data/questions/part3_ch5.json  (목표 30문항)
data/questions/part3_ch6.json  (목표 40문항)
data/questions/part3_ch7.json  (목표 20문항)

data/practical/questions.json  — 실기 문제 (SQL튜닝 3유형 + 트러블슈팅 2유형)
data/mockexam/exam1.json       — 70문항 재구성
data/mockexam/exam2.json       — 70문항 재구성
```

### Phase C — UI 수정 (quiz-builder)

**수정 파일:**
- `components/quiz/ExamTimer.tsx` — 90분 → 180분, 경고 임계 10분 → 20분
- `components/quiz/QuizNavigator.tsx` — 50문항 → 70문항 그리드
- `pages/quiz/exam.tsx` — 70문항 구성, 과목별 섹션 표시
- `pages/quiz/result.tsx` — 3과목 점수 분리 표시

**신규 파일:**
- `components/quiz/PracticalQuestion.tsx` — 실기 문항 컴포넌트 (지문 + SQL 작성 + 자기채점)
- `pages/quiz/practical.tsx` — 실기 연습 페이지

### Phase D — 대시보드 수정 (dashboard-builder)

- `components/dashboard/LearningPath.tsx` — 5챕터 → 12챕터 (3과목 그룹핑)
- `components/dashboard/ProgressChart.tsx` — 3과목 차트
- `pages/index.tsx` — 과목3 진도율 섹션

### Phase E — QA (qa)

```bash
npx tsc --noEmit    # 타입 오류 0
npm run lint        # ESLint 오류 0
npm run build       # SSG 빌드 성공 (12챕터 경로 생성 확인)
/validate-data      # Part 3 JSON 스키마 검증
npm run dev         # 브라우저 확인: /, /theory, /quiz/exam, /quiz/practical
```

## 검증 기준

- [ ] `npm run build` 성공 — 12개 이론 챕터 경로 생성
- [ ] `/quiz/exam` — 180분 타이머, 70문항 정상 동작
- [ ] `/quiz/practical` — 실기 문제 표시 및 자기채점
- [ ] 대시보드 — 3과목 진도율 표시
- [ ] localStorage 키 `sqlp_progress` 정상 저장

## 배운 점

- `docs/harness/` 전체 10개 문서를 SQLD → SQLP 기준으로 전면 재작성 완료 (2026-06-04)
- 구 DAP 6과목 기준(RULES.md의 part:1|2|3|4|5|6)을 SQLP 3과목(1|2|3)으로 통일
- PreToolUse 훅의 regex 에스케이핑: JSON 내 `\d` → `\\d` 이어야 하나, PowerShell `-like` 와일드카드로 우회하여 해결
- PROJECT_JOURNEY.md 가 docs/harness/ 에 없었음 → 신규 생성
- `_DAP_Master_` 파일명 패턴이 ai-dlc 산출물 검출의 핵심 — 프로젝트명이 파일명에 포함되도록 규칙화된 이유
