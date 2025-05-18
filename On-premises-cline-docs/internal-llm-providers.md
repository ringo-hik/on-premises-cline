# 내부망 LLM Provider 구성

내부망 환경에서 사용할 수 있는 3가지 LLM Provider의 개요 및 비교입니다.

## 개요

내부망 LLM 지원을 위해 다음 3가지 Provider를 추가합니다:

1. **Napoli**: Bearer 토큰 인증 방식의 OpenAI 호환 Provider
2. **Dortmund**: User-ID 기반 커스텀 인증 방식 Provider
3. **All-Custom (Json)**: 완전 사용자 정의 가능한 Provider

## Provider 비교

| 특성 | Napoli | Dortmund | All-Custom |
|------|---------|-----------|-----------|
| 인증 방식 | Bearer Token | X-Dep-Ticket + User-ID | 사용자 정의 |
| API 형식 | OpenAI 호환 | 커스텀 형식 | OpenAI 호환 (기본) |
| 헤더 설정 | 고정 | 다중 커스텀 헤더 | JSON으로 완전 정의 |
| URL | 고정 (HTTPS) | 고정 (HTTP) | 사용자 입력 |
| 유연성 | 낮음 | 중간 | 높음 |

## 1. Napoli Provider

### 특징
- OpenAI API와 완전 호환
- Bearer 토큰으로 간단한 인증
- HTTPS 프로토콜 사용

### 주요 설정
```json
{
  "provider": "napoli",
  "apiKey": "your-bearer-token",
  "baseUrl": "https://napoli-service/v1",
  "model": "napoli-internal-model"
}
```

### 적합한 사용 사례
- OpenAI 호환 API를 내부망에 구축한 경우
- 간단한 Bearer 토큰 인증이 필요한 경우

## 2. Dortmund Provider

### 특징
- 커스텀 헤더 및 요청 형식
- User-ID, User-Type 기반 인증
- 메시지별 UUID 추적
- HTTP 프로토콜 사용

### 주요 설정
```json
{
  "provider": "dortmund",
  "apiKey": "dep-ticket-value",
  "userId": "user-id",
  "userType": "user-type",
  "model": "dortmund-internal-model"
}
```

### 적합한 사용 사례
- 기업 내부 인증 체계가 복잡한 경우
- 사용자별 추적이 필요한 경우
- 메시지 감사가 필요한 경우

## 3. All-Custom Provider

### 특징
- 완전 사용자 정의 가능
- JSON으로 헤더 구성
- 다양한 API 엔드포인트 지원
- OpenAI, OpenRouter 등 자동 감지

### 주요 설정
```json
{
  "provider": "all-custom",
  "apiKey": "optional-api-key",
  "endpoint": "https://your-custom-llm.company.com/v1/chat/completions",
  "customHeaders": {
    "X-Custom-Auth": "custom-value",
    "X-Department": "Engineering"
  }
}
```

### 적합한 사용 사례
- 기존 API 형식과 다른 커스텀 API
- 특수한 헤더 요구사항
- 다양한 내부 LLM 서비스 통합

## 구현 우선순위

1. **All-Custom**: 가장 유연하여 대부분의 내부망 환경 지원
2. **Napoli**: OpenAI 호환 API가 많아 구현 용이
3. **Dortmund**: 특수한 요구사항에 대응

## 공통 기능

모든 Provider는 다음 기능을 공유합니다:

- SSE (Server-Sent Events) 스트리밍 지원
- 토큰 사용량 추정
- 에러 핸들링 및 재시도
- 컨텍스트 길이 관리

## 다음 단계

각 Provider의 상세 구현은 다음 문서를 참조하세요:

- [Napoli Provider 상세](./napoli-provider.md)
- [Dortmund Provider 상세](./dortmund-provider.md)
- [All-Custom Provider 상세](./all-custom-provider.md)