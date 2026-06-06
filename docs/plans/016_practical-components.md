# 016 — 실기 핵심 컴포넌트 분리 (ai-dlc-fe-component-gen)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | Quiz Builder (Agent 5) |

## 배경 및 목적

PracticalQuestion.tsx에 인라인된 서브 컴포넌트를 화면명세서 기준으로 분리.
재사용성·가독성 향상 및 단일 책임 원칙 적용.

## 생성/수정 파일

- 신규: `components/practical/ScenarioPanel.tsx`
- 신규: `components/practical/AnswerTextEditor.tsx`
- 신규: `components/practical/ScoringGuide.tsx`
- 신규: `components/quiz/PracticalCard.tsx`
- 수정: `components/quiz/PracticalQuestion.tsx`
- 수정: `pages/quiz/practical.tsx`

## 검증 기준

- [x] PracticalQuestion.tsx ~100줄로 감소 (서브 컴포넌트 import)
- [x] components/practical/ 디렉터리 신규 생성 (ScenarioPanel, AnswerTextEditor, ScoringGuide)
- [x] components/quiz/PracticalCard.tsx 독립 파일 생성
- [x] pages/quiz/practical.tsx PracticalCard import 교체

## 배운 점

- 서브 컴포넌트를 별도 파일로 분리하면 PracticalQuestion.tsx가 순수 상태 머신 역할만 담당하게 됨
- ScenarioPanel은 `'use client'` 불필요 (이벤트 핸들러 없음) — RSC로 사용 가능
- ScoringGuide는 disabled 상태 관리가 핵심 — props로 외부에서 제어
- AnswerTextEditor의 readOnly prop이 State 2 전환의 핵심 시각 피드백
