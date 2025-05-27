# Cline 온프레미스 버전 빌드 가이드

## 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- VS Code Extension 개발 도구 (vsce)

## 빌드 단계

### 1. 소스코드 준비

```bash
# 저장소 클론
git clone https://github.com/cline/cline.git
cd cline

# 브랜치 체크아웃 (필요시)
git checkout main
```

### 2. 의존성 설치

```bash
# 메인 프로젝트 의존성 설치
npm install

# webview-ui 의존성 설치
cd webview-ui
npm install
cd ..

# 또는 한 번에 설치
npm run install:all
```

### 3. vsce 설치 (VS Code Extension 패키징 도구)

```bash
# 전역 설치
npm install -g @vscode/vsce

# 또는 로컬 설치 후 npx 사용
npm install --save-dev @vscode/vsce
```

### 4. 빌드 실행

```bash
# 개발 빌드
npm run build:webview
npm run compile

# 프로덕션 빌드 및 패키징
npx vsce package
```

### 5. 오프라인 모드 설정 (선택사항)

```bash
# 환경 변수 설정
export CLINE_OFFLINE_MODE=true

# 또는 .env 파일에 추가
echo "CLINE_OFFLINE_MODE=true" >> .env
```

## 빌드 스크립트 설명

### package.json 주요 스크립트

- `npm run compile`: TypeScript 컴파일
- `npm run build:webview`: React 웹뷰 빌드
- `npm run package`: 프로덕션 빌드 (타입 체크, 웹뷰 빌드, 린트)
- `npm run protos`: Protocol Buffer 파일 생성
- `npm run lint`: 코드 스타일 검사
- `npm run check-types`: TypeScript 타입 검사

### 전체 빌드 프로세스

```bash
# 1. 클린 빌드 (기존 빌드 파일 제거)
rm -rf dist webview-ui/build

# 2. Protocol Buffer 생성
npm run protos

# 3. TypeScript 타입 체크
npm run check-types

# 4. 웹뷰 빌드
npm run build:webview

# 5. 메인 익스텐션 빌드
npm run compile

# 6. VSIX 패키지 생성
npx vsce package
```

## 커스터마이징

### package.json 수정 (패키지명 변경)

```json
{
  "name": "on-premises-cline",  // 기본값: "claude-dev"
  "displayName": "Cline",
  "version": "3.17.5"
}
```

### API 기본값 변경

`webview-ui/src/components/settings/ApiOptions.tsx` 파일에서:

```typescript
// OpenAI Compatible 기본값
value={apiConfiguration?.openAiBaseUrl || "http://your-server.com"}
value={apiConfiguration?.openAiModelId || "your-model-id"}
```

## 문제 해결

### 빌드 오류 발생 시

1. Node.js 버전 확인:
   ```bash
   node --version  # 18.x 이상
   ```

2. 의존성 재설치:
   ```bash
   rm -rf node_modules package-lock.json
   rm -rf webview-ui/node_modules webview-ui/package-lock.json
   npm run install:all
   ```

3. TypeScript 오류:
   ```bash
   npm run check-types
   ```

### VSIX 파일 위치

빌드 완료 후 프로젝트 루트에 생성됨:
- `on-premises-cline-3.17.5.vsix`

## 개발 모드

### 웹뷰 개발 서버 실행

```bash
# 별도 터미널에서 실행
npm run dev:webview
```

### VS Code에서 디버깅

1. VS Code에서 프로젝트 열기
2. F5 키를 눌러 Extension Development Host 실행
3. 새 VS Code 창에서 확장 프로그램 테스트

## 배포

### 내부 배포

1. VSIX 파일을 내부 파일 서버에 업로드
2. 사용자에게 다운로드 링크 제공
3. VS Code에서 "Install from VSIX..." 옵션으로 설치

### 자동화 스크립트 예시

```bash
#!/bin/bash
# build-and-deploy.sh

# 빌드
npm run install:all
npx vsce package

# 파일명 변경 (선택사항)
mv *.vsix on-premises-cline-$(date +%Y%m%d).vsix

# 내부 서버로 복사
scp on-premises-cline-*.vsix user@internal-server:/path/to/extensions/

echo "빌드 완료!"
```

## 주의사항

- 빌드 시 인터넷 연결이 필요합니다 (npm 패키지 다운로드)
- 첫 빌드는 시간이 오래 걸릴 수 있습니다 (약 5-10분)
- Windows에서는 Git Bash 또는 WSL 사용을 권장합니다