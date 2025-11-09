# Figma Translation Plugin 🌍

피그마에서 프레임 내의 모든 텍스트를 자동으로 번역하는 플러그인입니다. Google Gemini API를 사용하여 고품질 번역을 제공합니다.

## 주요 기능

- **간편한 메뉴 방식**: UI 팝업 없이 메뉴에서 바로 언어 선택
- 프레임 내 모든 텍스트 자동 추출 및 번역
- 15개 언어 지원 (한국어, 영어, 일본어, 중국어 등)
- **텍스트 스타일 완벽 보존** (폰트, 크기, 색상 등)
- Google Gemini API를 사용한 고품질 번역
- 개선된 번역 프롬프트로 더 정확한 번역
- 상세한 디버깅 로그

## 지원 언어

- 🇰🇷 한국어 (Korean)
- 🇺🇸 영어 (English)
- 🇯🇵 일본어 (Japanese)
- 🇨🇳 중국어 간체 (Chinese Simplified)
- 🇹🇼 중국어 번체 (Chinese Traditional)
- 🇪🇸 스페인어 (Spanish)
- 🇫🇷 프랑스어 (French)
- 🇩🇪 독일어 (German)
- 🇮🇹 이탈리아어 (Italian)
- 🇵🇹 포르투갈어 (Portuguese)
- 🇷🇺 러시아어 (Russian)
- 🇸🇦 아랍어 (Arabic)
- 🇮🇳 힌디어 (Hindi)
- 🇹🇭 태국어 (Thai)
- 🇻🇳 베트남어 (Vietnamese)

## 빠른 시작

### 1. 의존성 설치 및 빌드

```bash
# 의존성 설치
npm install

# TypeScript 빌드
npm run build
```

### 2. API 키 설정 (2가지 방법 중 선택)

#### 방법 A: config.ts 파일에 설정 (권장)

1. 예제 파일 복사:
   ```bash
   cp config.example.ts config.ts
   ```

2. `config.ts` 파일 열기

3. API 키 입력:
   ```typescript
   export const GEMINI_API_KEY = "여기에_실제_API_키_입력";
   ```

4. 저장 (이 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다)

#### 방법 B: Figma 플러그인 UI에서 설정

1. Figma에서 플러그인 실행 후 `Settings ⚙️` 메뉴 선택
2. API 키 입력 및 저장
3. API 키는 Figma 클라이언트 스토리지에 안전하게 저장됩니다

### 3. Figma에서 플러그인 로드

1. **Figma 데스크톱 앱** 실행 (웹 버전 아님!)
2. 메뉴에서 `Plugins` → `Development` → `Import plugin from manifest...` 선택
3. 이 프로젝트의 `manifest.json` 파일 선택

## Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. **"Create API Key"** 버튼 클릭
4. API 키 복사

## 사용 방법

### 기본 번역 워크플로우

1. **프레임 선택**
   - 피그마 캔버스에서 번역하려는 프레임을 선택합니다
   - 여러 프레임을 동시에 선택할 수도 있습니다
   - 텍스트 레이어만 직접 선택해도 됩니다

2. **플러그인 실행 및 언어 선택**
   - 메뉴에서 `Plugins` → `Translate Text` → 원하는 언어 선택
   - 예: `Plugins` → `Translate Text` → `English`

3. **번역 완료**
   - 선택한 프레임 내의 모든 텍스트가 자동으로 번역됩니다
   - 텍스트 스타일은 그대로 유지됩니다
   - 완료 알림이 표시됩니다

### 메뉴 구조

```
Plugins → Translate Text →
  ├── English
  ├── Korean (한국어)
  ├── Japanese (日本語)
  ├── Chinese Simplified (简体中文)
  ├── Chinese Traditional (繁體中文)
  ├── Spanish (Español)
  ├── French (Français)
  ├── German (Deutsch)
  ├── Italian (Italiano)
  ├── Portuguese (Português)
  ├── Russian (Русский)
  ├── Arabic (العربية)
  ├── Hindi (हिन्दी)
  ├── Thai (ไทย)
  ├── Vietnamese (Tiếng Việt)
  ├── ---
  └── Settings ⚙️
```

## 작동 원리

1. **텍스트 추출**: 선택한 프레임 내의 모든 텍스트 노드를 재귀적으로 검색
2. **번역 요청**: 각 텍스트를 Gemini API로 전송하여 번역
   - 개선된 프롬프트로 UI 요소와 컨텍스트를 고려한 번역
   - Temperature 0.2로 일관성 있는 번역 제공
3. **스타일 보존**: 원본 텍스트의 폰트, 크기, 색상 등 모든 스타일을 유지
4. **텍스트 교체**: 번역된 텍스트로 원본을 교체

## 프로젝트 구조

```
figma_translation/
├── manifest.json          # 플러그인 설정 (메뉴 정의)
├── package.json           # NPM 패키지 설정
├── tsconfig.json          # TypeScript 설정
├── config.example.ts      # API 키 설정 예제
├── config.ts             # API 키 설정 (git ignored)
├── code.ts               # 메인 플러그인 로직
├── code.js               # 빌드된 JavaScript (생성됨)
├── ui.html               # Settings UI
├── .gitignore            # Git 제외 설정
└── README.md             # 이 파일
```

## 개발

### TypeScript 컴파일

```bash
# 한 번만 빌드
npm run build

# 파일 변경 감지 및 자동 빌드
npm run watch
```

### 디버깅

Figma 데스크톱 앱에서:
- `Plugins` → `Development` → `Open Console`
  - 플러그인 로그 확인 (번역 과정, API 응답 등)
- `View` → `Developer` → `Show/Hide Console`
  - UI 로그 확인

로그 예시:
```
[Command] translate-en
[Start] Translation to English
[API Key] Using key from config.ts
[Found] 3 text nodes
[Translation] Translating to English: "안녕하세요..."
[API Response] {...}
[Translation Success] Result: "Hello"
[Text Replaced] "Hello"
[Complete] 3 translated, 0 failed
```

## 문제 해결

### 번역이 작동하지 않을 때

1. **API 키 확인**
   - `config.ts` 파일에 올바른 API 키가 입력되어 있는지 확인
   - 또는 Settings에서 API 키를 다시 입력해보세요

2. **콘솔 로그 확인**
   - Figma에서 `Plugins` → `Development` → `Open Console` 실행
   - 에러 메시지 확인
   - API 응답 확인

3. **API 호출 제한**
   - Gemini API 무료 사용량 제한을 초과했을 수 있습니다
   - [API 사용량 확인](https://makersuite.google.com/)

4. **네트워크 접근**
   - Figma 데스크톱 앱에서만 작동합니다 (웹 버전 X)
   - 방화벽이 `generativelanguage.googleapis.com` 차단하지 않는지 확인

### 빌드 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 폰트 로딩 에러

- 텍스트에 사용된 폰트가 시스템에 설치되어 있어야 합니다
- 콘솔에서 어떤 폰트가 문제인지 확인 후 설치

## API 사용량 및 비용

- Gemini API 무료 티어: 분당 60회 요청
- 텍스트 노드가 많은 경우 번역에 시간이 걸릴 수 있습니다
- 각 텍스트마다 0.5초 딜레이가 있어 Rate Limit을 피합니다

## 주의사항

- ⚠️ API 키는 안전하게 보관하고 공유하지 마세요
- ⚠️ `config.ts` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- 💡 번역 품질은 원본 텍스트의 명확성에 따라 달라질 수 있습니다
- 💡 UI 컨텍스트를 고려한 번역을 제공합니다 (버튼, 레이블 등)

## 업데이트 내용

### v2.0.0
- ✨ 메뉴 기반 언어 선택 (UI 팝업 없이 바로 번역)
- ✨ `config.ts` 파일에서 API 키 설정 가능
- ✨ 개선된 번역 프롬프트 (더 정확한 번역)
- ✨ 상세한 디버깅 로그
- ✨ 에러 카운트 및 성공률 표시
- 🐛 Temperature를 0.2로 낮춰 더 일관성 있는 번역
- 🐛 API 응답에서 자동으로 따옴표 제거

## 라이선스

MIT

## 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.
