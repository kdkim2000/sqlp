# docs/plans — 플랜 아카이브

소스코드 수정 전 반드시 이 폴더에 플랜 파일을 작성해야 한다.  
이 규칙은 `.claude/settings.json` PreToolUse 훅으로 강제된다.

## 작업 흐름

```
1. 플랜 파일 생성 (NNN_slug.md)
   → PostToolUse 훅이 .claude/.active-plan 자동 설정
2. 소스코드 수정 가능 (PreToolUse 가드 통과)
3. 작업 완료 후 "배운 점" 섹션 기록
   → Stop 훅이 미완료 시 리마인드
```

## 파일 목록

| 파일 | 상태 | 내용 |
|:---|:---:|:---|
| [001_dap_phase2_type_upgrade.md](001_dap_phase2_type_upgrade.md) | DRAFT | types·chapters·questions·progress 6과목 확장 |
| [002_sqlp_full_overhaul.md](002_sqlp_full_overhaul.md) | IN PROGRESS | SQLD→SQLP 전면 개편 (3과목·72문항·180분·실기) |

## 채번 규칙

- `001_` 부터 시작, 3자리 0패딩
- slug는 소문자 영문 + 하이픈
- 새 플랜 생성 전 반드시 마지막 번호 확인:
  ```powershell
  Get-ChildItem docs\plans -Filter "*.md" | Sort-Object Name | Select-Object Name
  ```

## 플랜 파일 표준 구조

```markdown
# NNN — 작업 제목

| 항목 | 내용 |
|------|------|
| 작성일 | YYYY-MM-DD |
| 상태 | DRAFT / IN PROGRESS / DONE |
| 담당 에이전트 | ... |

## 배경 및 목적
## 변경 범위
## 검증 기준
## 배운 점   ← 작업 완료 후 필수 기록
```
