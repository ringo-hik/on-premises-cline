# 수행항목 비활성화 가이드

내부망 환경에서 Cline 사용을 위해 비활성화해야 할 주요 기능들의 구체적인 처리 방법입니다.

## 1. Firebase 인증 비활성화

### 목적
- 외부 Firebase 서버와의 통신 차단
- 로컬 인증으로 대체

### 구현 방법
```typescript
// Firebase 초기화 우회
if (isOnPremisesMode) {
  // Firebase 초기화 건너뛰기
  return {
    auth: createMockAuth(),
    initialized: true
  };
}

// Mock Auth 구현
function createMockAuth() {
  return {
    signInWithPopup: async () => ({ user: createMockUser() }),
    signOut: async () => true,
    onAuthStateChanged: (callback) => {
      callback(createMockUser());
      return () => {}; // unsubscribe function
    }
  };
}
```

## 2. PostHog 텔레메트리 비활성화

### 목적
- 사용 통계 수집 차단
- 외부 분석 서버 통신 방지

### 구현 방법
```typescript
// PostHog 초기화 우회
if (isOnPremisesMode) {
  return {
    capture: () => {},
    identify: () => {},
    reset: () => {},
    featureFlags: {
      isFeatureEnabled: () => true // 모든 기능 활성화
    }
  };
}

// 이벤트 추적 메서드
async function trackEvent(event: string, properties?: any) {
  if (isOnPremisesMode) {
    console.log(`[Local] Event tracked: ${event}`);
    return true;
  }
  // 기존 PostHog 코드...
}
```

## 3. Cline 계정 서비스 비활성화

### 목적
- 외부 계정 서버 접근 차단
- 로컬 사용자 관리

### 구현 방법
```typescript
// 계정 서비스 Mock
class MockAccountService {
  async login() {
    return {
      success: true,
      user: {
        id: 'local-user',
        email: 'user@local.domain',
        credits: Infinity
      }
    };
  }
  
  async logout() {
    return { success: true };
  }
  
  async checkCredits() {
    return { credits: Infinity };
  }
}

// 서비스 주입
if (isOnPremisesMode) {
  accountService = new MockAccountService();
}
```

## 4. 자동 업데이트 기능 비활성화

### 목적
- 외부 업데이트 서버 접근 차단
- 버전 관리를 내부망에서 수행

### 구현 방법
```typescript
// 업데이트 확인 우회
async function checkForUpdates() {
  if (isOnPremisesMode) {
    return {
      updateAvailable: false,
      currentVersion: getCurrentVersion(),
      latestVersion: getCurrentVersion()
    };
  }
  // 기존 업데이트 코드...
}

// UI에서 업데이트 버튼 숨김
if (isOnPremisesMode) {
  hideUpdateButton();
}
```

## 5. MCP 서버 다운로드 비활성화

### 목적
- 외부 MCP 마켓플레이스 접근 차단
- 로컬 MCP 서버만 사용

### 구현 방법
```typescript
// MCP 다운로드 차단
async function downloadMcpServer(serverId: string) {
  if (isOnPremisesMode) {
    throw new Error('MCP server downloads are disabled in on-premises mode');
  }
  // 기존 다운로드 코드...
}

// 마켓플레이스 UI 숨김
function McpMarketplace() {
  if (isOnPremisesMode) {
    return <div>MCP Marketplace is not available in on-premises mode</div>;
  }
  // 기존 마켓플레이스 UI...
}

// 로컬 서버만 허용
function validateMcpServer(server: MCPServer) {
  if (isOnPremisesMode && server.type === 'remote') {
    throw new Error('Remote MCP servers are not allowed');
  }
}
```

## 6. 설정 기본값 변경

### 전역 설정
```typescript
const defaultSettings = {
  enableFirebase: false,
  enablePostHog: false,
  enableClineAccount: false,
  enableAutoUpdate: false,
  enableMcpMarketplace: false,
  onPremisesMode: true
};

// 설정 로드 시 강제 적용
function loadSettings() {
  const settings = getStoredSettings();
  if (isOnPremisesMode) {
    return { ...settings, ...defaultSettings };
  }
  return settings;
}
```

## 구현 우선순위

1. **높음**: PostHog, Firebase - 즉시 외부 통신 발생
2. **중간**: Cline 계정, MCP 다운로드 - 사용자 액션 필요
3. **낮음**: 자동 업데이트 - 주기적 체크

## 테스트 체크리스트

- [ ] 네트워크 탭에서 외부 요청이 없는지 확인
- [ ] 콘솔에 외부 API 에러가 없는지 확인
- [ ] 모든 기능이 오프라인에서 작동하는지 확인
- [ ] UI에 비활성화된 기능이 표시되지 않는지 확인