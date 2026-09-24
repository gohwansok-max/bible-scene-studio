# 구독 모드 실행 안내

> **Bible Scene Studio v2.0 · Subscription Bridge**
>
> **SUBSCRIPTION · API 과금 OFF** 모드는 이미 로그인한 공식 CLI의 구독 사용량만 사용합니다. 이 모드는 API Key를 요구하거나 자동 사용하지 않습니다.

## 작동 구조

```text
로컬 브라우저 화면 (http://127.0.0.1:43127)
  └─ Bible Scene Local Bridge (127.0.0.1만 바인딩)
       ├─ codex exec → ChatGPT 계정 로그인 → ChatGPT 플랜 사용량
       └─ claude -p → Claude Pro 계정 로그인 → Claude Pro 플랜 사용량
```

GitHub Pages 주소는 기획·세션 보기·수동 모드·명시적으로 선택한 API 모드에 사용할 수 있습니다. **구독 모드 실행은 로컬 브리지를 실행한 PC에서만 활성화됩니다.** 브라우저 쿠키, 웹 세션, OAuth 토큰은 수집·저장·전달하지 않습니다.

## 최초 1회 준비

1. **Node.js 20 이상**을 설치합니다. [공식 Node.js 다운로드](https://nodejs.org/)
2. **Codex CLI**를 설치하고 터미널에서 ChatGPT 구독 계정으로 로그인합니다. [OpenAI Codex CLI 공식 문서](https://learn.chatgpt.com/docs/codex/cli)
3. **Claude Code**를 설치하고 터미널에서 Claude Pro 구독 계정으로 로그인합니다. [Claude Code 공식 설치 문서](https://code.claude.com/docs/en/overview)
4. 이 저장소의 `local-bridge/start_subscription_mode.bat`를 더블클릭합니다. PowerShell 사용 시 `start_subscription_mode.ps1`를 실행합니다.
5. 열린 화면의 **연결 상태**에서 두 Provider의 `연결 테스트`를 실행합니다.
6. 상단 배지가 **`SUBSCRIPTION · API 과금 OFF`**인지 확인한 뒤 주제를 입력하고 전체 자동 실행을 시작합니다.

API Key는 위 과정에 필요하지 않습니다. Codex와 Claude Code의 사용량 한도는 각각의 구독 플랜 정책을 따릅니다.

## 3단계 제작 흐름

| 단계 | 담당 | 생성 결과 |
|---|---|---|
| 1. 조사·구조화 | Codex | Bible Evidence Pack, 사건 순서, 8챕터 Story Architecture |
| 2. 메인 집필 | Claude Code | 7~10분 내레이션 초안, 감정선, 8챕터 연결 |
| 3. 최종 편집·비주얼 | Codex | 사실 검수, 최종 대본, 24 Story Beat, Visual Bible, 이미지 프롬프트, YouTube 메타데이터 |

각 단계의 결과는 브라우저 세션에 보존됩니다. 실패한 단계만 다시 실행할 수 있으며, 실패 시 앞 단계 결과를 삭제하지 않습니다.

## 비용 안전 원칙

- 브리지는 `OPENAI_API_KEY`, `CODEX_API_KEY`, `ANTHROPIC_API_KEY` 등 API 결제 경로 환경변수를 제거한 환경에서 CLI를 실행합니다.
- 구독 한도 또는 인증 오류가 나면 작업을 멈춥니다. **API 모드로 자동 전환하지 않습니다.**
- 브라우저가 임의 shell 명령·실행 파일 경로·로그인 토큰을 보낼 수 없습니다.
- 브리지는 외부 네트워크에 열리지 않도록 `127.0.0.1:43127`만 사용합니다.
- API 모드는 사용자가 화면에서 명시적으로 선택하고 확인한 경우에만 동작합니다.

## 오류 대응

| 화면 메시지 | 조치 |
|---|---|
| Codex CLI가 설치되어 있지 않습니다 | Codex CLI 설치 후 ChatGPT 계정으로 로그인 |
| Claude Code가 설치되어 있지 않습니다 | Claude Code 설치 후 Claude Pro 계정으로 로그인 |
| 공식 CLI의 구독 계정 로그인이 필요합니다 | 각 터미널에서 공식 로그인 절차 수행 |
| 구독 사용 한도에 도달했습니다 | 한도 초기화 후 재실행. API 전환은 사용자가 별도 선택 |
| 이전 단계 결과는 보존되었습니다 | 실패한 단계만 다시 실행 |

## 공식 근거

- OpenAI: [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan), [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- Anthropic: [Using Claude Code with Pro or Max plan](https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan), [Claude Code headless mode](https://code.claude.com/docs/en/headless)
