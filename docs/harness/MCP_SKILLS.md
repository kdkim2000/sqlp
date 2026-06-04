# MCP & Skills 정의서 — SQLP 사이트

---

## [필수] 플랜 우선 원칙

소스코드 수정 전 `docs/plans/` 에 플랜 파일을 반드시 작성한다. 하네스가 자동 강제한다.

```
1. docs/plans/NNN_slug.md 생성 (NNN = 마지막 번호 + 1)
   → PostToolUse 훅이 .claude/.active-plan 자동 설정
2. pages/, components/, lib/, types/, context/ 수정 가능
3. 작업 완료 후 플랜의 "배운 점" 섹션 기록
```

**현재 플랜 파일 목록 확인:**
```powershell
Get-ChildItem docs\plans -Filter "*.md" | Sort-Object Name
```

---

## [필수] AI-DLC 산출물 저장 규칙

`ai-dlc-*` 스킬 산출물은 반드시 `docs/ai-dlc/` 에 저장한다. 하네스가 자동 강제한다.

- 파일명: `{문서유형}_DAP_Master_{YYYYMMDD}.md`
- 스킬 실행 후 `docs/ai-dlc/README.md` 진행 현황 업데이트 필수
- 전체 스킬 계획 및 현황: `docs/ai-dlc/README.md` 참조

---

## 1. MCP 서버

### 1-1. IDE MCP — `mcp__ide` (기본 내장)

| 도구 | 용도 | 사용 시점 |
|------|------|---------|
| `mcp__ide__getDiagnostics` | TypeScript 타입 오류, ESLint 경고 실시간 확인 | Foundation Builder 타입 정의 검증 |
| `mcp__ide__executeCode` | TypeScript 코드 즉시 실행 | lib 유틸 함수 단위 테스트 |

### 1-2. Playwright MCP (설치 필요, 선택사항)

```bash
npm install -D @playwright/mcp playwright
npx playwright install chromium
```

**사용 시나리오:**
- Quiz Builder: QuestionCard 보기 선택 → 정답 피드백 흐름 확인
- QA: 모바일 뷰포트(375px) 반응형 레이아웃 스크린샷
- QA: `/quiz/exam` 70문항 + 180분 타이머 동작 확인

### 1-3. mcp-server-cloud (활성)

Vercel 배포 및 사용량 통계 확인 시 활용.

---

## 2. 슬래시 명령

| 명령어 | 설명 |
|--------|------|
| `/status` | 현재 Phase·진도 확인, 다음 액션 제시 |
| `/run-agent [번호]` | 특정 에이전트 역할로 작업 시작 |
| `/build-check` | tsc → lint → build 3단계 파이프라인 |
| `/validate-data` | 전체 questions JSON 스키마 검증 (Part 1~3) |
| `/add-question [챕터]` | 대화형 문제 추가 (예: `part3_ch3`) |
| `/add-theory [챕터]` | 이론 마크다운 섹션 추가 |
| `/log [내용]` | 개발 과정 저널 기록 |
| `/retrospect` | 전체 회고 → LESSONS.md 합성 |

### /add-question 지원 챕터 목록

```
Part 1: part1_ch1, part1_ch2
Part 2: part2_ch1, part2_ch2, part2_ch3
Part 3: part3_ch1, part3_ch2, part3_ch3, part3_ch4,
        part3_ch5, part3_ch6, part3_ch7
```

### /validate-data 검증 범위

- `data/questions/part1_ch*.json` ~ `data/questions/part3_ch*.json` (12파일)
- `data/mockexam/exam1.json`, `exam2.json`
- ID 형식: `p[1-3]c[1-7]_\d{3}`
- 필수 필드: `id`, `part`, `chapter`, `content`, `options`, `answer`, `explanation`

---

## 3. ai-dlc 스킬 참고

스킬별 상세 사용법 및 SQLP Phase 매핑: `docs/harness/SKILLS.md` 참조.

전체 스킬 실행 현황: `docs/ai-dlc/README.md` 참조.
