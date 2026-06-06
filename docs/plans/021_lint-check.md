# 021 — ESLint 전체 검사 (ai-dlc-fe-lint-check)

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-06-05 |
| 상태 | DONE |
| 담당 | QA (Agent 8) |

## 검사 범위

전체 소스 파일 (`npm run lint`)

## 검증 기준

- [x] lint 오류 0건 (`✔ No ESLint warnings or errors`)
- [x] console.log 잔존 0건

## 배운 점

- next lint는 Next.js 최적화 규칙을 포함하므로 `eslint . --ext ts,tsx`보다 더 적합한 검사 도구
- Phase D 신규 파일들은 처음부터 lint 규칙을 준수하여 추가 수정 불필요
- `eslint-disable-next-line` 주석은 의도적 규칙 제외를 명시적으로 표시하여 코드 리뷰 시 이유를 알 수 있게 함
