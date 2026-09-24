# 성경 한 장면 스튜디오

> **Bible Scene Studio v2.0 · Subscription Bridge**
>
> 성경 한 장면에서 시작하는 7~10분 분량의 듣는 역사 드라마 제작 도구입니다. 성경 초보 성인과 초등 고학년 이상 시청자를 위해, 본문 사실과 역사·문화 배경, 해석, 사용 금지 정보를 분리하여 대본·비주얼·업로드 자료를 만듭니다.

## 접속 방식

| 방식 | 주소 또는 실행 | 용도 | 비용 안전 원칙 |
|---|---|---|---|
| PC 구독 모드 | `local-bridge/start_subscription_mode.bat` | Codex + Claude Code 공식 CLI로 전체 제작 | **API Key를 사용하지 않음**, 자동 API 전환 없음 |
| 일반 웹 모드 | [GitHub Pages](https://gohwansok-max.github.io/bible-scene-studio/) | 기획, 세션 보기, 수동 프롬프트 생성, 명시적 API 모드 | 로컬 브리지 없이는 구독 실행 비활성 |
| 수동 모드 | 앱의 `현재 단계 프롬프트 복사` | ChatGPT/Claude 공식 UI에서 직접 실행 | AI 자동 호출 없음 |

## v2.0 핵심 변경

기본 AI 흐름에서 Gemini를 제거했습니다. 구독 모드는 Codex CLI에 로그인된 ChatGPT 구독 계정과 Claude Code에 로그인된 Claude Pro 계정을 사용하며, 브라우저가 서비스 웹 쿠키나 로그인 토큰을 다루지 않습니다. `Local Subscription Bridge`는 `127.0.0.1:43127`에만 열리고, 고정된 공식 CLI 명령만 실행합니다.

`구독 모드`에서는 API Key·API Base URL·Bedrock/Vertex 설정 등 API 결제 경로 환경변수를 제거한 프로세스로 CLI를 실행합니다. 구독 한도에 도달하거나 로그인에 실패하면 작업을 중지하고 앞 단계 결과를 보존합니다. **API 모드로 자동 전환하지 않습니다.**

## 3단계 제작 흐름

| 단계 | 실행 Provider | 주요 산출물 |
|---|---|---|
| 1. 조사·구조화 | OpenAI Codex | Bible Evidence Pack, 본문 근거, 사건 순서, 인물 관계, 8챕터 Story Architecture |
| 2. 메인 집필 | Claude Code | 7~10분 분량의 8챕터 내레이션 초안, 감정선, 핵심 교훈·엔딩 여운 |
| 3. 최종 편집·비주얼 | OpenAI Codex | 성경 사실 검수, 최종 대본, YouTube 패키지, Visual Bible, 24 Story Beat, Nano Banana 프롬프트, Notion용 JSON |
| 선택. 문체 보정 | Claude Code | 사실관계를 바꾸지 않는 리듬·TTS 호흡·감정선 미세 조정. 기본 OFF |

각 단계 결과는 브라우저 세션에 저장됩니다. 실패 시 앞 단계를 다시 실행하지 않고, 실패한 단계만 재실행할 수 있습니다. `시놉시스 검토 후 자동 정지`를 선택하면 2단계 후 사용자의 검토를 기다립니다.

## 구독 모드 설치 및 실행

상세 절차는 [구독 모드 실행 안내](local-bridge/README_SUBSCRIPTION_MODE.md)를 따르세요.

1. Node.js 20 이상을 설치합니다.
2. [Codex CLI 공식 문서](https://learn.chatgpt.com/docs/codex/cli)에 따라 Codex CLI를 설치하고 ChatGPT 구독 계정으로 로그인합니다.
3. [Claude Code 공식 문서](https://code.claude.com/docs/en/overview)에 따라 Claude Code를 설치하고 Claude Pro 구독 계정으로 로그인합니다.
4. Windows에서 `local-bridge/start_subscription_mode.bat`를 실행합니다. PowerShell 사용자는 `local-bridge/start_subscription_mode.ps1`를 실행합니다.
5. `http://127.0.0.1:43127/`가 열리면 Codex와 Claude Code의 `연결 테스트`를 각각 실행합니다.
6. 상단 배지 **`SUBSCRIPTION · API 과금 OFF`**를 확인한 뒤 주제를 넣고 전체 자동 실행을 선택합니다.

설치·로그인 과정에서 앱은 비밀번호를 입력받지 않으며, API Key는 필요하지 않습니다. 구독 플랜별 사용량 한도는 각 서비스 정책을 따릅니다.

## 실행 모드

| 모드 | 실행 조건 | 동작 | 전환 규칙 |
|---|---|---|---|
| 구독 모드 | 로컬 브리지 + 공식 CLI 설치·로그인 | Codex/Claude Code 구독 사용량을 사용 | 기본값. API Key 자동 사용 금지 |
| API 모드 | 사용자의 명시적 선택과 확인 | OpenAI/Anthropic API를 직접 호출 | 비용 발생 가능성을 확인한 뒤만 실행 |
| 수동 모드 | 별도 설치 불필요 | 단계별 프롬프트를 복사하여 공식 웹 UI에서 실행 | AI 자동 호출 없음 |

API 모드는 정적 브라우저 앱의 제약상 Key를 서버 비밀처럼 보호할 수 없습니다. 공용 PC에는 저장하지 말고, 구독 모드와 혼동하지 마세요.

## 성경·콘텐츠 품질 기준

| 분류 | 처리 원칙 |
|---|---|
| A. 본문 직접 사실 | 관련 성경 권·장·절을 기록하고 핵심 근거로 사용 |
| B. 역사·문화 배경 | 성경 본문과 구분해 설명하고 신뢰도를 표시 |
| C. 해석·합리적 추론 | 확정하지 않고 완화 표현 사용 |
| D. 불확실 정보 | 대본에서 제외 |

성경에 없는 대사·감정·동기·외모를 사실처럼 만들지 않고, 특정 교단의 해석을 유일한 답으로 단정하지 않습니다. 모든 대본의 마지막은 `실제 마지막 장면 → 핵심 교훈 또는 감동 포인트 1개 → 시청자 여운 질문` 흐름을 따릅니다. 비주얼은 고대 근동의 역사적 개연성, Character/Location/Costume/Prop Bible, 24 Shot 다양성, Nano Banana 워터마크 안전 영역을 유지합니다. 자세한 기준은 [v2 제작 기준](docs/PRODUCTION_GUIDELINES_v2.md)을 확인하세요.

## 보안 설계

| 통제 | 적용 내용 |
|---|---|
| 로컬 바인딩 | 브리지는 `127.0.0.1:43127`만 사용하고 LAN에 공개하지 않음 |
| 요청 제한 | Provider, 단계, 프롬프트, 플랜 기본 모델, 실행 시간만 허용 |
| 명령 고정 | 브라우저에서 raw shell command·실행 경로·파일 경로를 전달할 수 없음 |
| 환경 격리 | OpenAI/Anthropic API Key 및 Bedrock·Vertex 관련 환경변수 제거 |
| 인증 분리 | 브라우저 쿠키·OAuth 토큰·로그인 세션을 읽거나 저장하지 않음 |
| 기록 최소화 | 감사 로그에는 작업 상태·Provider·단계·시간만 저장하며 Key·토큰·프롬프트 원문을 기록하지 않음 |
| 실패 처리 | 구독 한도·인증 실패 시 API 전환 없이 중단, 이전 결과 보존 |

## 저장소 구조

```text
bible-scene-studio/
├── index.html                              # GitHub Pages와 로컬 브리지가 공통 제공하는 v2 UI
├── README.md
├── CHANGELOG.md
├── docs/
│   └── PRODUCTION_GUIDELINES_v2.md
└── local-bridge/
    ├── bridge-server.js                    # 127.0.0.1 HTTP + 정적 파일 서버
    ├── provider-openai.js                  # 고정된 codex exec 실행 경로
    ├── provider-claude.js                  # 고정된 claude -p 실행 경로
    ├── security.js                          # origin/body/env/입력 검증
    ├── logger.js                            # 비밀정보 제외 감사 로그
    ├── start_subscription_mode.bat
    ├── start_subscription_mode.ps1
    ├── README_SUBSCRIPTION_MODE.md
    └── test/bridge.integration.test.js
```

## 검증

Node.js가 설치된 환경에서 아래 명령으로 Local Bridge의 보안·동작 통합 테스트를 실행합니다.

```bash
node local-bridge/test/bridge.integration.test.js
```

테스트는 가짜 Codex/Claude 명령을 사용해 `127.0.0.1` 바인딩, 정적 페이지 제공, 허용되지 않은 Origin 거부, 고정된 Provider 실행, API Key 환경변수 제거를 검증합니다. 실제 ChatGPT Plus·Claude Pro 연결 테스트와 성경 콘텐츠 생성은 사용자의 PC에서 각 공식 CLI에 구독 계정으로 로그인한 뒤 실행해야 합니다.

## 공식 문서

- OpenAI: [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan), [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- Anthropic: [Using Claude Code with Pro or Max plan](https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan), [Claude Code headless mode](https://code.claude.com/docs/en/headless)

## 현재 버전

**v2.0 · Subscription Bridge**
