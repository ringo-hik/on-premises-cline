# 외부망 차단 요구사항

내부망 환경에서 Cline 사용 시 차단해야 할 모든 외부망 통신 기능을 정리했습니다.

## 차단 원칙

1. **사용자 시나리오 차단**: UI 수준에서 외부망 접근이 불가능하도록 처리
2. **설정 기본값 변경**: 외부망 연동 옵션의 기본값을 비활성화로 설정
3. **내부 코드 처리**: FALLBACK 메커니즘으로 안전한 기본값 반환

## 주요 차단 대상

### 1. UI 수준 차단

#### 버튼 및 메뉴 숨김
- MCP Marketplace 활성화 버튼
- 자동 업데이트 확인 버튼
- Cline 계정 로그인 버튼
- 외부 리소스 다운로드 버튼

#### 설정 기본값 변경
- Enable MCP Marketplace: 항상 비활성화
- Enable Telemetry: 항상 비활성화
- Auto Check Updates: 항상 비활성화
- Enable External Resources: 항상 비활성화

### 2. 코드 수준 처리

#### PostHog 텔레메트리
- 메서드 호출 시 항상 True 반환
- 이벤트 전송 시도를 무시
- 분석 데이터 수집 비활성화

#### Firebase 인증
- 로그인 시도 시 성공 상태 반환
- 토큰 검증을 우회
- 사용자 세션을 로컬로만 관리

#### 자동 업데이트
- 업데이트 확인 API 호출 차단
- 항상 "최신 버전" 상태 반환
- 다운로드 진행률을 모의로 표시

#### MCP 서버 다운로드
- 다운로드 요청을 차단
- 로컬 파일 경로만 허용
- 원격 서버 연결 비활성화

## 구현 방법

### UI 컴포넌트 숨김
```typescript
// 예시: MCP Marketplace 버튼 숨김
if (isOnPremisesMode) {
  return null; // 컴포넌트를 렌더링하지 않음
}
```

### 설정 기본값 변경
```typescript
// 예시: 텔레메트리 기본값 변경
const defaultSettings = {
  enableTelemetry: false, // 항상 false
  enableMcpMarketplace: false, // 항상 false
  autoCheckUpdates: false, // 항상 false
};
```

### FALLBACK 처리
```typescript
// 예시: PostHog 메서드 FALLBACK
async function trackEvent(eventName: string, properties: any) {
  if (isOnPremisesMode) {
    return true; // 항상 성공으로 처리
  }
  // 기존 코드...
}
```

## 주의사항

1. 코드를 복잡하게 삭제하지 말고 간단한 조건문으로 처리
2. 사용자 경험을 해치지 않도록 적절한 FALLBACK 값 반환
3. 에러가 발생하지 않도록 안전한 기본값 설정
4. 내부망 전용 기능은 그대로 유지