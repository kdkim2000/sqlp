# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## [필수 규칙] AI-DLC 산출물 저장 경로

> **`ai-dlc-*` 스킬로 생성되는 모든 산출물은 반드시 `docs/ai-dlc/` 폴더에 저장해야 한다.**  
> 이 규칙은 하네스(`.claude/settings.json`)에 의해 강제된다. 다른 경로에 저장하면 차단된다.

- 파일명 패턴: `{문서유형}_{사업명}_{YYYYMMDD}.md` (예: `요구사항정의서_DAP_Master_20260604.md`)
- 같은 날 재작성 시: `{문서유형}_{사업명}_{YYYYMMDD}_v2.md`
- 스킬 실행 후 **`docs/ai-dlc/README.md` 의 진행 현황 업데이트 필수**
- 전체 스킬 계획 및 현황: `docs/ai-dlc/README.md` 참조

---

## [필수 규칙] 플랜 우선 원칙

> **소스코드 수정 전 반드시 `docs/plans/` 에 플랜 파일을 먼저 작성해야 한다.**  
> 이 규칙은 하네스(`.claude/settings.json`)에 의해 강제된다. 플랜 없이 `pages/`, `components/`, `lib/`, `types/`, `context/` 에 쓰려 하면 차단된다.

### 플랜 작업 흐름

```
1. Plan 모드 → 설계 → ExitPlanMode 승인
2. docs/plans/NNN_slug.md 생성  ← 이 시점에 .claude/.active-plan 자동 설정
3. 소스코드 수정 가능 (PreToolUse 통과)
4. 작업 완료 후 플랜의 "배운 점" 섹션 기록  ← Stop 훅이 리마인드
```

### 채번 규칙

- `docs/plans/` 의 마지막 번호 확인 후 +1
- 형식: `NNN_소문자-영문-슬러그.md` (예: `003_part3-content-generation.md`)
- 상태: `DRAFT` → `IN PROGRESS` → `DONE`

---

## 처음 시작하기

**`docs/WORKPLAN.md` 부터 읽으세요.** 단일 진입점입니다.

전체 구축 흐름·검증 게이트·트러블슈팅이 정리되어 있습니다.
빠른 상태 확인은 `/status` 명령으로.

---

## 프로젝트 개요

SQLP(SQL 전문가) 자격증 시험 준비용 웹 사이트. 이론 학습 + 예상문제 풀이 + 실기 연습.

| 영역 | 문서 |
|------|------|
| 무엇을 만드는가 | `docs/PRD.md` |
| 어떻게 만드는가 | `docs/ARCHITECTURE.md` |
| 누가 만드는가 | `docs/AGENTS.md` |
| 어떻게 자동화하는가 | `docs/HARNESS.md`, `docs/MCP_SKILLS.md` |
| 단계별 실행 | `docs/WORKPLAN.md` ← **시작점** |
| 개발 기록 | `docs/journal/JOURNAL.md`, `docs/journal/LESSONS.md` |

## 기술 스택

- **Next.js 14** (Pages Router, TypeScript)
- **Tailwind CSS** — 스타일링
- **React Context + localStorage** — 학습 진도 관리 (서버/DB 없음)
- **react-markdown + rehype-highlight** — 이론 콘텐츠 렌더링
- **Vercel** — 배포

## 핵심 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # SSG 빌드
npm run lint     # ESLint
npx tsc --noEmit # 타입 검사
npm run test     # Vitest 단위 테스트
```

## 시험 구조 (SQLP 기준)

| 과목 | 객관식 | 실기 | 배점 | 시간 |
|------|--------|------|------|------|
| 1과목: 데이터 모델링의 이해 | 10문항 | — | 10점 | — |
| 2과목: SQL 기본 및 활용 | 20문항 | — | 20점 | — |
| 3과목: SQL 고급활용 및 튜닝 | 40문항 | — | 40점 | — |
| 실기 (SQL튜닝/성능트러블슈팅) | — | 2문항 | 30점 (15점×2) | — |
| **합계** | **70문항** | **2문항** | **100점** | **180분** |

합격 기준: 과목별 40% 이상 + 전체 60점 이상

## 챕터 목록

```
과목1 (Part 1):
  part1_ch1 — 데이터 모델링의 이해 (엔터티·속성·관계·식별자)
  part1_ch2 — 데이터 모델과 SQL (정규화·조인이해·NULL·식별자)

과목2 (Part 2):
  part2_ch1 — SQL 기본 (SELECT·함수·WHERE·GROUP BY·JOIN·표준조인)
  part2_ch2 — SQL 활용 (서브쿼리·집합연산자·그룹함수·윈도우함수·Top N·계층형·PIVOT·정규표현식)
  part2_ch3 — 관리 구문 (DML·TCL·DDL·DCL)

과목3 (Part 3):
  part3_ch1 — SQL 수행 구조 (DB 아키텍처·SQL 처리 과정·I/O 메커니즘)
  part3_ch2 — SQL 분석 도구 (예상 실행계획·SQL 트레이스·응답시간 분석)
  part3_ch3 — 인덱스 튜닝 (기본원리·테이블 액세스 최소화·스캔 효율화·인덱스 설계)
  part3_ch4 — 조인 튜닝 (NL 조인·소트머지조인·해시조인·스칼라서브쿼리·고급조인)
  part3_ch5 — SQL 옵티마이저 (옵티마이징 원리·SQL 공유/재사용·쿼리 변환)
  part3_ch6 — 고급 SQL 튜닝 (소트튜닝·DML튜닝·DB Call 최소화·파티셔닝·배치·고급SQL활용)
  part3_ch7 — Lock과 트랜잭션 동시성 제어
```

## 핵심 구조

```
pages/           → 라우팅
components/      → layout/, theory/, quiz/, dashboard/
lib/             → questions, theory, progress, chapters 유틸
context/         → ProgressContext (전역 진도)
types/           → 공통 TypeScript 인터페이스
data/
  questions/     → 챕터별 문제 JSON (part1_ch*.json ~ part3_ch*.json)
  theory/        → 챕터별 이론 마크다운
  practical/     → 실기 문제 JSON (questions.json)
  mockexam/      → 모의고사 JSON (70문항 구성)
docs/journal/    → 바이브 코딩 기록
```

## 핵심 데이터 패턴

- 이론·문제 페이지는 `getStaticPaths` + `getStaticProps`로 SSG
- `localStorage` 접근 전 반드시 `typeof window !== 'undefined'` 가드
- localStorage 키: `'sqlp_progress'`
- 문제 ID 형식: `p{과목}c{챕터}_{3자리번호}` (예: `p3c3_001`)
- `Question.part`: `1 | 2 | 3` (3과목 체계)
- 모의고사 구성: 과목1 10문항 + 과목2 20문항 + 과목3 40문항 = 70문항
- 실기 문항: `PracticalQuestion` 인터페이스 (`data/practical/questions.json`)

## 슬래시 명령 목록

| 명령 | 용도 |
|------|------|
| `/status` | 현재 Phase·진도 확인, 다음 액션 제시 |
| `/run-agent [N]` | N번 에이전트 역할로 작업 시작 (`docs/AGENTS.md` 참조) |
| `/build-check` | tsc + lint + build 통합 검증 |
| `/validate-data` | 문제 JSON 스키마 검증 |
| `/add-question [챕터]` | 대화형 문제 추가 (예: `part3_ch3`) |
| `/add-theory [챕터]` | 이론 섹션 추가 |
| `/log [내용]` | 개발 과정 저널 기록 |
| `/retrospect` | 전체 회고 → `LESSONS.md` 합성 |

## 자동 훅 (`.claude/settings.json`)

- **questions JSON 저장** → 스키마 검증
- **theory MD 저장** → 섹션 수 확인
- **핵심 파일 완성** → `JOURNAL.md` 마일스톤 자동 기록 (멱등성 보장)
- **응답 종료** → TypeScript 오류 수 표시

## 에이전트 (요약)

| 번호 | 이름 | 담당 영역 |
|------|------|---------|
| 1 | scaffold | 프로젝트 초기화 |
| **9** | **pdf-extractor** | **`data/` (PDF 원본 기반) — PDF 있을 때 Agent 2 대신 사용** |
| 2 | content-writer | `data/` (JSON·MD, 수동/AI 생성) |
| 3 | foundation-builder | `types/`, `lib/`, `context/` |
| 4 | layout-builder | `components/layout/`, `_app.tsx` |
| 5 | quiz-builder | `components/quiz/`, `pages/quiz/` |
| 6 | theory-builder | `components/theory/`, `pages/theory/` |
| 7 | dashboard-builder | `components/dashboard/`, `pages/index.tsx` |
| 8 | qa | 전체 검증·버그 수정 |
| chronicle | (특수) | 저널 기록·회고 합성 |

> 상세 명세는 `docs/AGENTS.md`, 시스템 프롬프트는 `.claude/agents/*.md` 참조.
