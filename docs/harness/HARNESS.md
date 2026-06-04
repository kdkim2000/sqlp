# HARNESS — Claude Code 하네스 엔지니어링

## 개요

하네스(Harness)는 Claude Code가 이 프로젝트에서 **자율적으로 작동하는 방식**을 정의한다.  
필수 프로세스 규칙(플랜 우선·AI-DLC 산출물), 에이전트 정의, 훅(자동화), 커스텀 슬래시 명령, MCP 서버 설정으로 구성된다.

---

## 파일 구조

```
.claude/
├── settings.json          ← 프로젝트 공유 훅 (git 추적)
├── settings.local.json    ← 로컬 전용 권한 설정 (git 제외)
├── .active-plan           ← 현재 활성 플랜 경로 (자동 관리)
├── agents/                ← 서브에이전트 정의
│   ├── scaffold.md
│   ├── pdf-extractor.md
│   ├── content-writer.md
│   ├── foundation-builder.md
│   ├── layout-builder.md
│   ├── quiz-builder.md
│   ├── theory-builder.md
│   ├── dashboard-builder.md
│   ├── qa.md
│   └── chronicle.md
└── commands/              ← 커스텀 슬래시 명령
    ├── build-check.md
    ├── validate-data.md
    ├── add-question.md
    ├── add-theory.md
    ├── run-agent.md
    ├── status.md
    ├── log.md
    └── retrospect.md

.mcp.json                  ← MCP 서버 설정
docs/
├── plans/                 ← 플랜 파일 아카이브 (NNN_slug.md)
├── ai-dlc/                ← AI-DLC 산출물 아카이브
└── harness/               ← 이 문서들
scripts/
└── validate-questions.ts  ← QA 검증 스크립트
```

---

## 레이어 0: 플랜 우선 원칙 (`docs/plans/`)

**소스코드 수정 전 반드시 플랜 파일을 먼저 작성해야 한다.** 하네스가 자동으로 강제한다.

### 채번 규칙

| 항목 | 규칙 |
|------|------|
| **파일명** | `NNN_소문자-영문-슬러그.md` (예: `003_part3-content.md`) |
| **번호** | 3자리 0패딩, 마지막 번호 +1 |
| **상태** | `DRAFT` → `IN PROGRESS` → `DONE` |
| **필수 섹션** | 배경/목적, 변경 범위, 검증 방법, 배운 점 |

### 플랜 작업 흐름

```
1. Plan 모드에서 계획 수립 → ExitPlanMode 승인
2. docs/plans/NNN_slug.md 생성
   → PostToolUse 훅이 .claude/.active-plan 자동 설정
3. 소스코드 수정 가능 (PreToolUse 가드 통과)
4. 작업 완료 후 플랜의 "배운 점" 섹션 기록
   → Stop 훅이 미완료 시 리마인드
```

---

## 레이어 0-B: AI-DLC 산출물 저장 규칙 (`docs/ai-dlc/`)

**`ai-dlc-*` 스킬 산출물은 반드시 `docs/ai-dlc/` 폴더에만 저장해야 한다.** 하네스가 자동으로 강제한다.

- 파일명: `{문서유형}_DAP_Master_{YYYYMMDD}.md`
- 스킬 실행 후 `docs/ai-dlc/README.md` 진행 현황 업데이트 필수
- 전체 스킬 계획: `docs/ai-dlc/README.md` 참조

---

## 레이어 1: PreToolUse 훅 (차단형)

소스코드·산출물 저장 전 경로·플랜 유효성을 **미리 검사**한다. 위반 시 `exit 2`로 차단한다.

| 훅 | 감지 조건 | 동작 |
|----|---------|------|
| **AI-DLC 경로 강제** | Write 중 `*_DAP_*` 파일명 + `docs/ai-dlc/` 이외 경로 | exit 2 차단 + 올바른 경로 안내 |
| **플랜 파일 검사** | Write/Edit 중 `pages/`, `components/`, `lib/`, `types/`, `context/` | `.active-plan` 없으면 exit 2 차단 |

### 차단 메시지 예시

```
============================================================
[AI-DLC RULE] ai-dlc 산출물은 반드시 docs/ai-dlc/ 에 저장!
  현재 경로: E:/apps/sqlp/요구사항정의서_DAP_Master_20260604.md
  올바른 위치: docs/ai-dlc/{문서유형}_DAP_Master_YYYYMMDD.md
============================================================

============================================================
[PLAN REQUIRED] 소스코드 수정 전 플랜 파일 작성 필수!
  1. docs/plans/NNN_slug.md 에 작업 계획 작성
  2. 파일 저장 시 .claude/.active-plan 자동 설정됨
============================================================
```

---

## 레이어 2: PostToolUse 훅 (검증형)

도구 실행 **후** 부가 작업을 자동으로 수행한다.

| 이벤트 | 조건 | 동작 |
|--------|------|------|
| Write | `docs/plans/**` (README 제외) | `.active-plan` 자동 설정 + JOURNAL.md 기록 |
| Write | `data/questions/**` | JSON 스키마 검증 + 문항 수 출력 |
| Write | `data/theory/**` | 줄 수·섹션 수 출력 |
| Write/Edit | `context/ProgressContext.tsx` | Foundation 마일스톤 JOURNAL 기록 |
| Write/Edit | `components/layout/Layout.tsx` | Layout 마일스톤 JOURNAL 기록 |
| Write/Edit | `pages/quiz/exam.tsx` | Quiz 마일스톤 JOURNAL 기록 |
| Write/Edit | `pages/theory/[chapterId].tsx` | Theory 마일스톤 JOURNAL 기록 |
| Write/Edit | `pages/index.tsx` | Dashboard 마일스톤 JOURNAL 기록 |

### 훅 동작 흐름

```
개발자: "part3_ch3.json 에 문제 추가해줘"
Claude: Write(data/questions/part3_ch3.json)
  └→ [PostToolUse] "[JSON 검증] part3_ch3.json — 40문항 유효"
Claude 응답 완료
  └→ [Stop Hook] "[타입 검사] 통과 — 오류 없음"
               "[LESSONS] 작업 완료 후 플랜에 배운점을 기록하세요 → 002_sqlp..."
```

---

## 레이어 3: Stop 훅

| 동작 | 내용 |
|------|------|
| TypeScript 타입 검사 | `npx tsc --noEmit` 실행, 오류 수 출력 |
| 세션 로그 | `docs/journal/.sessions` 에 종료 시각 기록 (async) |
| LESSONS 리마인드 | `.active-plan` 있으면 플랜 파일에 배운 점 기록 안내 |

---

## 레이어 4: 에이전트 (`.claude/agents/`)

| 에이전트 | 허용 도구 | 소유 파일 영역 |
|---------|---------|-------------|
| `scaffold` | Bash, Write, Read, Edit, Glob | 설정 파일, pages/_app.tsx |
| `pdf-extractor` | Read, Write, Edit, Glob | data/ (PDF 원본 기반) |
| `content-writer` | Write, Read, Edit, Glob | data/ (JSON·MD 수동/AI 생성) |
| `foundation-builder` | Write, Read, Edit, Bash, Grep, Glob | types/, lib/, context/ |
| `layout-builder` | Write, Read, Edit, Grep, Glob | components/layout/, _app.tsx |
| `quiz-builder` | Write, Read, Edit, Grep, Glob | components/quiz/, pages/quiz/ |
| `theory-builder` | Write, Read, Edit, Grep, Glob | components/theory/, pages/theory/ |
| `dashboard-builder` | Write, Read, Edit, Grep, Glob | components/dashboard/, pages/index.tsx |
| `qa` | Read, Edit, Bash, Grep, Glob | 전체 버그 수정 (기능 추가 제외) |
| `chronicle` | Read, Write, Edit, Glob, Grep | docs/journal/ |

---

## 레이어 5: 슬래시 명령 (`.claude/commands/`)

| 명령어 | 설명 |
|--------|------|
| `/status` | 현재 Phase·진도 확인, 다음 액션 제시 |
| `/run-agent [N]` | N번 에이전트 역할로 작업 시작 |
| `/build-check` | tsc → lint → build 3단계 파이프라인 |
| `/validate-data` | 전체 questions JSON 스키마 검증 (Part 1~3) |
| `/add-question [챕터]` | 대화형 문제 추가 (예: `part3_ch3`) |
| `/add-theory [챕터]` | 이론 마크다운 섹션 추가 |
| `/log [내용]` | 개발 과정 저널 기록 |
| `/retrospect` | 전체 회고 → LESSONS.md 합성 |

---

## 레이어 6: MCP 서버 (`.mcp.json`)

| 서버 | 상태 | 용도 |
|------|------|------|
| `ide` (내장) | 활성 | TypeScript 진단, 코드 실행 |
| `mcp-server-cloud` | 활성 | 사용량 통계, 리포트 |
| `playwright` | 비활성 | UI 자동화 테스트 (필요 시 활성화) |

---

## 레이어 7: 검증 스크립트

| 스크립트 | 실행 방법 | 용도 |
|---------|---------|------|
| `validate-questions.ts` | `npx ts-node scripts/validate-questions.ts` | JSON 스키마·ID 형식 검증 |

---

## 전체 개발 흐름 (ai-dlc 스킬 기반)

```
설계 완료 (ai-dlc 스킬 8개)
  → docs/ai-dlc/README.md Phase 1~5 순서대로 실행

Phase A — 타입·코어 인프라
  플랜 생성 → /run-agent 3 (Foundation Builder)
  → types/index.ts, lib/chapters.ts, lib/progress.ts 수정

Phase B — 콘텐츠 데이터 (ai-dlc-data-design)
  플랜 생성 → /run-agent 2 (Content Writer)
  → data/theory/part3_ch*.md, data/questions/part3_ch*.json 생성

Phase C — UI 페이지 업그레이드 (ai-dlc-nxt-page-gen)
  플랜 생성 → /run-agent 5 (Quiz Builder)
  → ExamTimer(180분), QuizNavigator(70문항), exam.tsx, result.tsx 수정

Phase D — 실기 섹션 (ai-dlc-fe-component-gen)
  플랜 생성 → /run-agent 5 (Quiz Builder)
  → PracticalQuestion.tsx, pages/quiz/practical.tsx 신규

Phase E — 통합 검증 (ai-dlc-fe-ts-check ~ delivery-checklist)
  플랜 생성 → /run-agent 8 (QA)
  → /build-check → /validate-data → 배포
```
