# 온프레미스 Cline 업데이트 사항

## 버전: 3.17.7 (온프레미스 최적화)

### 주요 변경사항

#### 1. 외부 연결 차단
- **환경 변수 기반 오프라인 모드**: `CLINE_OFFLINE_MODE=true` 설정 시 모든 외부 API 호출 차단
- **MCP 마켓플레이스 차단**: 외부 서버에서 MCP 패키지 다운로드 기능 비활성화
- **텔레메트리 완전 차단**: PostHog 텔레메트리 수집 기능 제거 (지속 확인)
- **신규 API 프로바이더 추가**: qwen, doubao, deepseek, nebius, xai 프로바이더가 추가되었으며, `CLINE_OFFLINE_MODE` 활성화 시 외부 호출이 차단됩니다.

#### 2. API 설정 간소화
- **OpenAI Compatible API 기본값 설정**:
  - Base URL: `http://temporary-url.com` (수정 가능)
  - Model ID: `temporary-model` (수정 가능)
  - API Key만 입력하면 바로 사용 가능
- **Authorization 헤더 자동 처리**: API Key는 자동으로 `Bearer` 토큰으로 변환

#### 3. 패키지 이름 변경
- 기존: `claude-dev-3.17.x.vsix` (또는 이전 온프레미스 버전)
- 변경: `on-premises-cline-3.17.7.vsix`

### 설치 방법

1. VS Code에서 확장 프로그램 관리자 열기 (Ctrl+Shift+X)
2. 우측 상단의 `...` 메뉴 클릭
3. `Install from VSIX...` 선택
4. `on-premises-cline-3.17.7.vsix` 파일 선택

### 사용 방법

1. **오프라인 모드 활성화** (선택사항):
   ```bash
   export CLINE_OFFLINE_MODE=true
   ```

2. **API 설정**:
   - Settings에서 API Provider로 "OpenAI Compatible" 선택
   - API Key 입력
   - 필요시 Base URL과 Model ID 수정

### 기술적 세부사항

- **MCP 마켓플레이스**: `fetchMcpMarketplaceFromApi` 함수에서 오프라인 모드 체크 추가
- **환경 변수 체크**: `process.env.CLINE_OFFLINE_MODE === 'true'`로 오프라인 모드 감지
- **빌드 시스템**: package.json의 name 필드 변경으로 VSIX 파일명 자동 변경

### 주의사항

- 오프라인 모드에서는 MCP 마켓플레이스 기능을 사용할 수 없습니다
- 외부 API 연동이 필요한 일부 기능이 제한될 수 있습니다
- 온프레미스 환경에서는 반드시 내부 API 서버를 사용하세요
- 신규 추가된 API 프로바이더(qwen, doubao, deepseek, nebius, xai)는 `CLINE_OFFLINE_MODE=true` 설정 시 자동으로 비활성화됩니다.