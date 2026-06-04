# SKILLS — ai-dlc 스킬 활용 가이드

---

## 설계 우선(Design-First) 원칙

**코드 작성 전 반드시 ai-dlc 설계 스킬을 먼저 실행한다.**

```
① ai-dlc-*-design 스킬 실행
   → docs/ai-dlc/ 에 산출물 저장 (하네스 강제)

② docs/plans/NNN_slug.md 플랜 파일 생성
   → .claude/.active-plan 자동 설정

③ 코드 구현
   → ai-dlc-nxt-page-gen / ai-dlc-fe-component-gen 등

④ 검토·수정
   → ai-dlc-nxt-code-review → ai-dlc-nxt-code-revise
```

---

## SQLP 개편 5 Phase (`docs/ai-dlc/README.md` 기준)

### 완료된 스킬 (분석·설계 단계 ✅)

| 순서 | 스킬 | 산출물 |
|:---:|:---|:---|
| ① | `ai-dlc-requirements` | 요구사항정의서 |
| ② | `ai-dlc-screen-list` | 화면목록 |
| ③ | `ai-dlc-biz-rules-create` | 비즈니스규칙 |
| ④ | `ai-dlc-usecase-create` | 유즈케이스 |
| ⑤ | `ai-dlc-class-design` | 클래스설계서 |
| ⑥ | `ai-dlc-nxt-impl-plan` | 구현계획서 |
| ⑦ | `ai-dlc-data-design` | 데이터설계서 + 이론MD·문제JSON·실기JSON |
| ⑧ | `ai-dlc-screen-spec` | 화면명세서 (SCR-012·013 실기 화면) |

---

### Phase 1 — 타입 & 코어 인프라

| 작업 | 스킬 | 설명 |
|:---|:---|:---|
| TypeScript 타입 오류 수정 | `ai-dlc-class-revise` | types/index.ts 수정 후 연쇄 오류 정리 |
| TypeScript 검사 | `ai-dlc-fe-ts-check` | `npx tsc --noEmit` 0건 확인 |

**담당 에이전트**: Foundation Builder (3)

---

### Phase 2 — 콘텐츠 데이터 생성

| 작업 | 스킬 | 설명 |
|:---|:---|:---|
| Part 3 이론 MD 생성 | `ai-dlc-data-design` | part3_ch1~ch7.md 초안 |
| 이론 MD 보완 | `ai-dlc-data-revise` | 내용 심화·보완 |
| 문제 JSON 검증 | `ai-dlc-data-validate` | ID 형식·필드 검증 |

**담당 에이전트**: Content Writer (2) / PDF Extractor (9)

```
# 스킬 호출 예시
/ai-dlc-data-design Part 3 SQL 수행 구조 이론 마크다운 생성
/ai-dlc-data-validate data/questions/part3_ch1.json
```

---

### Phase 3 — UI 페이지 업그레이드

| 작업 | 스킬 | 설명 |
|:---|:---|:---|
| 기존 페이지 수정 | `ai-dlc-nxt-page-gen` | exam.tsx, result.tsx, theory/index.tsx |
| 코드 리뷰 | `ai-dlc-nxt-code-review` | 수정 페이지 품질 검토 |
| 수정 (필요시) | `ai-dlc-nxt-code-revise` | 리뷰 지적사항 반영 |

**담당 에이전트**: Quiz Builder (5), Theory Builder (6)

---

### Phase 4 — 실기 섹션 신규 구현

| 작업 | 스킬 | 설명 |
|:---|:---|:---|
| 실기 페이지 생성 | `ai-dlc-nxt-page-gen` | pages/quiz/practical.tsx, practical/[practiceId].tsx |
| 실기 컴포넌트 생성 | `ai-dlc-fe-component-gen` | PracticalQuestion.tsx, ScenarioPanel, AnswerTextEditor, ScoringGuide |
| 상태 관리 | `ai-dlc-fe-state-guide` | localStorage 실기 답안 저장·복원 패턴 |

**담당 에이전트**: Quiz Builder (5)

---

### Phase 5 — 통합 검증 & 납품

| 작업 | 스킬 | 산출물 |
|:---|:---|:---|
| TypeScript 검사 | `ai-dlc-fe-ts-check` | 타입 검사 보고 |
| ESLint 검사 | `ai-dlc-fe-lint-check` | 린트 보고 |
| 코드 품질 리뷰 | `ai-dlc-nxt-code-review` | 코드리뷰보고서_DAP_Master_YYYYMMDD.md |
| 요구사항 추적 | `ai-dlc-code-traceability` | 추적성보고서_DAP_Master_YYYYMMDD.md |
| 납품 체크리스트 | `ai-dlc-delivery-checklist` | 납품체크리스트_DAP_Master_YYYYMMDD.md |

**담당 에이전트**: QA (8)

---

## 스킬 선택 가이드

| 상황 | 선택 스킬 |
|:---|:---|
| TypeScript 인터페이스·타입 설계 | `ai-dlc-class-design` |
| TypeScript 오류 수정 | `ai-dlc-class-revise` |
| Next.js 페이지 신규 생성·수정 | `ai-dlc-nxt-page-gen` |
| React 컴포넌트 신규 생성 | `ai-dlc-fe-component-gen` |
| JSON 데이터 구조 설계 | `ai-dlc-data-design` |
| localStorage 상태 관리 패턴 | `ai-dlc-fe-state-guide` |
| 빌드 에러·타입 오류 수정 | `ai-dlc-nxt-code-revise` |
| 이론 콘텐츠 마크다운 생성 | `ai-dlc-data-design` |
| 구현 순서·의존성 정리 | `ai-dlc-nxt-impl-plan` |

---

## 스킬 입력 컨텍스트 전달 템플릿

스킬 호출 시 아래 컨텍스트를 함께 전달하면 품질이 높아진다.

```
@CLAUDE.md                        # 프로젝트 전체 구조
@docs/harness/ARCHITECTURE.md     # 설계 결정사항
@docs/harness/RULES.md            # 규칙·컨벤션
@docs/ai-dlc/[관련 산출물].md    # 설계 산출물
@[대상 파일]                      # 수정할 파일
```
