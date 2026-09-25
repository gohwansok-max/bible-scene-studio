# 변경 이력

## v2.0.1 — 2026-09-25

- **Claude Pro 구독 연동 불가 수정**: Claude Code 호출에서 `--bare`를 제거했습니다. `--bare`는 OAuth(Claude Pro 로그인)를 읽지 않고 `ANTHROPIC_API_KEY`만 인증에 사용하므로, API Key를 제거하는 구독 모드에서는 항상 인증 실패했습니다. 프롬프트는 stdin으로만 전달합니다.
- **Windows 실행 수정**: npm으로 설치된 `codex.cmd` 등을 인식하지 못해 "설치 안 됨"으로 표시되던 문제를 수정했습니다(고정 인자 + stdin 전달 구조 유지). 작업 취소·시간 초과 시 하위 프로세스까지 종료합니다.
- **Codex 실행 수정**: ZIP으로 내려받아 Git 저장소가 아닌 폴더에서도 실행되도록 `--skip-git-repo-check`를 추가했습니다(`--sandbox read-only` 유지).
- CLI가 입력 수신 전에 종료되면 브리지가 비정상 종료되던 문제(EPIPE)를 수정했습니다.
- 구독 계정 로그인 도우미 `local-bridge/login_subscriptions.bat`를 추가했습니다.
- 통합 테스트: `--bare` 미사용·Codex 인자 검증 추가, 정적 페이지 확인 포트 오류 수정.

## v2.0 — 2026-09-25

- 기본 파이프라인에서 **Gemini를 제거**하고 OpenAI Codex + Claude Code 2개 Provider 구조로 변경했습니다.
- `127.0.0.1:43127`에만 바인딩하는 **Local Subscription Bridge**를 추가했습니다.
- ChatGPT 계정으로 로그인한 Codex CLI 및 Claude Pro 계정으로 로그인한 Claude Code의 공식 CLI 경로를 구독 모드에 사용합니다.
- 구독 모드에서 API Key·브라우저 쿠키·웹 세션을 사용하지 않으며, API 결제 경로 환경변수를 제거합니다.
- **API fallback 기본값 OFF**를 고정했습니다. 구독 한도 초과·인증 실패 시 작업을 중지하고 이전 결과를 보존합니다.
- `구독 모드`, `API 모드`, `수동 모드`를 분리하고 현재 비용 상태 배지를 표시합니다.
- Codex와 Claude Code의 설치 상태 및 짧은 연결 테스트 UI를 추가했습니다.
- 기본 호출을 3단계(조사/구조화 → 메인 집필 → 최종 편집·Visual Director)로 줄이고, 선택적 Claude 문체 미세 보정은 기본 OFF로 두었습니다.
- Bible Evidence Pack, 8챕터 대본, Character/Location/Costume/Prop Bible, 24 Story Beat, Nano Banana 프롬프트, YouTube 메타데이터, Notion용 JSON 출력을 보존·강화했습니다.
- Local Bridge 보안 통합 테스트를 추가했습니다.

## v1.0

- 초기 정적 성경 이야기 제작 웹앱.
