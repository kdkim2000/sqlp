# MCP — SQLP 사이트 MCP 설정

---

## 현재 MCP 구성

SQLP 사이트는 **서버리스 정적 사이트**로, 외부 MCP 연동이 최소화되어 있다.

| 서버 | 상태 | 용도 |
|:---|:---|:---|
| `mcp__ide__*` | 활성 | IDE 진단·코드 실행 |
| `mcp__claude_ai_Vercel__*` | 활성 | Vercel 배포 |
| `mcp__mcp-server-cloud__*` | 활성 | 사용량 통계 |
| `playwright` | 비활성 | UI 자동화 테스트 (선택) |

ai-dlc 스킬 워크플로우: `docs/ai-dlc/README.md` 참조.

---

## 개발 중 유용한 MCP 활용

### IDE 진단 (mcp__ide__getDiagnostics)

Phase A 타입 확장 후 TypeScript 오류를 즉시 확인:

```
mcp__ide__getDiagnostics → TypeScript 오류 목록 반환
→ types/index.ts 수정 후 연쇄 오류 추적
```

### Vercel 배포 (Phase E)

```
mcp__claude_ai_Vercel__authenticate → OAuth 인증
→ npm run build 후 Vercel 배포
→ 도메인 설정·최종 URL 확인
```

---

## MCP 없이 동작하는 작업 (대부분)

아래 작업은 Claude Code 기본 도구(Read/Edit/Write/Bash)만으로 충분:

- 파일 읽기·수정·생성
- TypeScript 컴파일 (`npx tsc --noEmit`)
- 테스트 실행 (`npm run test`)
- 빌드 (`npm run build`)
- 문제 JSON 검증 (`ts-node scripts/validate-questions.ts`)

---

## 향후 MCP 추가 검토

| MCP | 용도 | 조건 |
|:---|:---|:---|
| GitHub MCP | PR·이슈 관리 | Git 저장소 연결 시 |
| Playwright MCP | UI 자동화 테스트 | QA Phase 시 |
