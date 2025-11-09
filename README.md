# Figma Translation Plugin 🌍

피그마에서 프레임 내의 모든 텍스트를 자동으로 번역하는 플러그인입니다. Google Gemini API를 사용하여 고품질 번역을 제공합니다.

## 주요 기능

- 프레임 내 모든 텍스트 자동 추출 및 번역
- 15개 언어 지원 (한국어, 영어, 일본어, 중국어 등)
- 텍스트 스타일 완벽 보존 (폰트, 크기, 색상 등)
- Google Gemini API를 사용한 고품질 번역

## 지원 언어

- 한국어 (Korean)
- 영어 (English)
- 일본어 (Japanese)
- 중국어 간체 (Chinese Simplified)
- 중국어 번체 (Chinese Traditional)
- 스페인어 (Spanish)
- 프랑스어 (French)
- 독일어 (German)
- 이탈리아어 (Italian)
- 포르투갈어 (Portuguese)
- 러시아어 (Russian)
- 아랍어 (Arabic)
- 힌디어 (Hindi)
- 태국어 (Thai)
- 베트남어 (Vietnamese)

## 설치 및 빌드

### 1. 의존성 설치

```bash
npm install
```

### 2. TypeScript 빌드

```bash
npm run build
```

또는 개발 중 자동 빌드:

```bash
npm run watch
```

### 3. Figma에서 플러그인 로드

1. Figma 데스크톱 앱 실행
2. 메뉴에서 `Plugins` → `Development` → `Import plugin from manifest...` 선택
3. 이 프로젝트의 `manifest.json` 파일 선택

## Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. "Create API Key" 버튼 클릭
4. API 키 복사

## 사용 방법

1. **Gemini API 키 입력**
   - 플러그인 UI에서 발급받은 API 키를 입력합니다
   - API 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다

2. **번역할 언어 선택**
   - 드롭다운 메뉴에서 번역할 대상 언어를 선택합니다

3. **프레임 선택**
   - 피그마 캔버스에서 번역하려는 프레임을 선택합니다
   - 여러 프레임을 동시에 선택할 수도 있습니다

4. **번역 실행**
   - "번역하기" 버튼을 클릭합니다
   - 선택한 프레임 내의 모든 텍스트가 자동으로 번역됩니다

## 작동 원리

1. **텍스트 추출**: 선택한 프레임 내의 모든 텍스트 노드를 재귀적으로 검색
2. **번역 요청**: 각 텍스트를 Gemini API로 전송하여 번역
3. **스타일 보존**: 원본 텍스트의 폰트, 크기, 색상 등 모든 스타일을 유지
4. **텍스트 교체**: 번역된 텍스트로 원본을 교체

## 프로젝트 구조

```
figma_translation/
├── manifest.json       # 플러그인 설정
├── package.json        # NPM 패키지 설정
├── tsconfig.json       # TypeScript 설정
├── code.ts            # 메인 플러그인 로직
├── code.js            # 빌드된 JavaScript (생성됨)
├── ui.html            # 플러그인 UI
└── README.md          # 이 파일
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
- `Plugins` → `Development` → `Open Console` (플러그인 로그 확인)
- `View` → `Developer` → `Show/Hide Console` (UI 로그 확인)

## 주의사항

- Gemini API는 무료 사용량 제한이 있습니다
- 대량의 텍스트를 번역할 경우 API 요청 제한에 도달할 수 있습니다
- API 키는 안전하게 보관하고 공유하지 마세요
- 번역 품질은 원본 텍스트의 명확성에 따라 달라질 수 있습니다

## 라이선스

MIT

## 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.
