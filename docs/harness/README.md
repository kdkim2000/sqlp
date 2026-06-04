# SQLP 사이트 — 프로젝트 하네스

SQLP 개편 작업 전 이 문서들을 읽고 시작하라.

## 필독 순서

```
1. RULES.md        → 시험 구조·타입·ID 형식·프로세스 규칙 (모든 작업 전)
2. HARNESS.md      → 훅 구조·플랜 원칙·AI-DLC 규칙
3. AGENTS.md       → Phase별 에이전트 역할·병렬 실행
4. PRD.md          → 제품 요구사항·기능 범위
5. ARCHITECTURE.md → 설계 결정·데이터 모델·컴포넌트 구조
6. SKILLS.md       → ai-dlc 스킬 매핑·Phase별 사용법
7. MCP_SKILLS.md   → 슬래시 명령·MCP 서버 가이드
```

## 문서 목록

| 문서 | 상태 | 목적 |
|:---|:---:|:---|
| [RULES.md](RULES.md) | ✅ | 시험 구조, 타입 규칙, ID 형식, 프로세스 규칙 |
| [HARNESS.md](HARNESS.md) | ✅ | 훅 구조, 플랜 우선 원칙, AI-DLC 규칙 |
| [AGENTS.md](AGENTS.md) | ✅ | Phase A-E 에이전트 역할, 소유 파일 |
| [PRD.md](PRD.md) | ✅ | SQLP 3과목 요구사항, 기능 범위, 페이지 구조 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | ✅ | 기술 스택, 데이터 모델, 컴포넌트 구조 |
| [SKILLS.md](SKILLS.md) | ✅ | ai-dlc 스킬 Phase 매핑, 선택 가이드 |
| [MCP_SKILLS.md](MCP_SKILLS.md) | ✅ | 슬래시 명령, MCP 서버, ai-dlc 산출물 규칙 |
| [MCP.md](MCP.md) | ✅ | MCP 서버 설정, Vercel 배포 |
| [PROJECT_JOURNEY.md](PROJECT_JOURNEY.md) | ✅ | v1.0 SQLD 완료 + v2.0 SQLP 로드맵 |

## [필수] 2가지 프로세스 규칙

### 1. 플랜 우선 원칙

소스코드 수정 전 반드시 `docs/plans/NNN_slug.md` 를 먼저 작성한다. 하네스 강제.

```
docs/plans/NNN_slug.md 생성 → .active-plan 자동 설정 → 코드 수정 가능
```

### 2. AI-DLC 산출물 저장 규칙

`ai-dlc-*` 스킬 산출물은 반드시 `docs/ai-dlc/` 에만 저장한다. 하네스 강제.

```
파일명: {문서유형}_DAP_Master_{YYYYMMDD}.md
저장 위치: docs/ai-dlc/
```

## 연관 디렉토리

| 경로 | 역할 |
|------|------|
| `docs/plans/` | 플랜 파일 아카이브 (NNN_slug.md) |
| `docs/ai-dlc/` | ai-dlc 스킬 산출물 아카이브 |
| `docs/journal/` | 개발 저널·교훈 기록 |
| `.claude/` | 하네스 설정 (agents/, commands/, settings.json) |

## 원천 문서

- 분석·설계 산출물: `docs/ai-dlc/README.md` (스킬 계획 및 현황)
- 프로젝트 가이드: `CLAUDE.md` (프로젝트 루트)
- SQLP 시험 기준: KDATA 공식 — 72문항(객관식 70+실기 2), 100점, 180분
