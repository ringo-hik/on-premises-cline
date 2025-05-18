# Cline On-Premises Edition (Air-Gapped)

> 내부 네트워크 환경을 위한 완전히 독립적인 AI 코딩 어시스턴트

## 🌐 Air-Gapped Cline: 프로젝트 배경

이 프로젝트는 외부 인터넷 연결 없이 내부망(온프레미스 환경)에서 완전히 독립적으로 작동하는 Cline 버전을 개발하기 위해 시작되었습니다.

### 개발 동기

**사용자 본인이 사용하고 싶어서 시작했습니다.**

- 사내 온프레미스망 사용자들을 위한 AI 코딩 보조 도구 제공 계획
- 보안상의 이유로 외부 연결이 제한된 환경에서도 Cline의 기능 활용 희망

### 첫 번째 시도: 단순 API 변경의 한계

초기에는 API Provider만 내부망 모델로 변경하여 간단히 해결하려 했습니다. 하지만 다양한 외부 의존성 관련 에러가 발생했습니다:

- PostHog 및 기타 외부 분석 서비스 연동 시도
- MCP(Model Context Protocol) 관련 외부 연결
- Firebase 인증 작동 시도
- CDN을 통한 자원 로딩 시도
- VS Code 마켓플레이스 업데이트 확인

### 데이터 유출 우려로 프로젝트 보류

- 사용자가 실수로 잘못된 버튼을 클릭하여 내부 데이터가 외부로 유출될 위험
- 회사 보안 정책 위반 가능성
- 이러한 보안 우려로 인해 초기 계획을 잠시 보류

### 프로젝트 재개: Air-Gapped Cline 개발

이러한 문제를 근본적으로 해결하기 위해 Air-Gapped Cline 개발을 개인 프로젝트로 재시작했습니다. 모든 외부 의존성을 제거하고 순수하게 내부망에서만 작동하는 버전 개발을 목표로 설정했습니다.

## 🔧 개발 접근 방식

이 프로젝트는 "오류 주도 개발" 방식을 채택하여 진행했습니다:

1. 실제로 인터넷 연결을 차단한 환경에서 Cline을 실행
2. 발생하는 모든 외부 연결 시도 및 오류 기록
3. 각 오류의 원인이 되는 코드 부분 식별 및 수정/제거
4. 수정된 버전에서 다시 테스트하며 반복

### 주요 개발 목표

**모든 외부 의존성 제거**
- API 호출, 텔레메트리, 인증 메커니즘 등 모든 외부 연결 요소 제거
- 필요한 리소스는 모두 로컬에 번들링
- 완전한 Air-Gap 환경에서 작동 가능

## 🚀 주요 특징

### 🔐 세 가지 내부 LLM Provider

#### 1. All-Custom Provider
- **완전한 커스터마이제이션**: 모든 종류의 내부 API와 호환
- **동적 헤더 관리**: Add Header 버튼으로 실시간 헤더 추가/삭제
- **다양한 응답 형식**: JSON, SSE, 텍스트 등 모든 형식 지원
- **자동 서비스 인식**: OpenRouter, 내부 API 등 자동 감지

#### 2. Napoli Provider
- **OpenAI 호환**: 기존 OpenAI 호환 API와 완벽 호환
- **Bearer 토큰 인증**: 간단하고 안전한 인증 방식
- **스트리밍 지원**: 실시간 응답 스트리밍
- **표준 메시지 형식**: OpenAI 표준 메시지 형식 사용

#### 3. Dortmund Provider
- **엔터프라이즈 보안**: X-Dep-Ticket, User-Id, User-Type 다단계 인증
- **메시지 추적**: UUID 기반 각 메시지 추적
- **커스텀 요청 형식**: system_prompt, model_id 등 특화된 구조
- **감사 로그 지원**: 기업 컴플라이언스 요구사항 충족

### 🛡️ Air-Gap 환경을 위한 완전한 최적화

- **외부 연결 완전 차단**: 모든 데이터가 내부 네트워크에서만 처리
- **텔레메트리 완전 제거**: PostHog 등 모든 외부 분석 도구 코드 제거
- **계정 기능 제거**: Cline 계정 로그인 UI 및 백엔드 연동 제거
- **MCP 마켓플레이스 비활성화**: 외부 도구 다운로드 기능 차단
- **Firebase 인증 제거**: 외부 인증 메커니즘 완전 제거

## 📦 설치 가이드

### VS Code 마켓플레이스
```
1. VS Code 확장 프로그램 탭 열기
2. "Cline On-Premises" 검색
3. "Install" 클릭
```

### 수동 설치 (VSIX) - Air-Gap 환경 권장
```bash
# VSIX 파일을 내부망으로 전송 후
code --install-extension cline-on-premises-3.16.1.vsix
```

## ⚙️ 설정 방법

### All-Custom Provider 설정

1. **기본 설정**
   ```
   Settings → Cline → API Provider → All-Custom 선택
   ```

2. **엔드포인트 설정**
   ```
   Endpoint URL: https://your-internal-llm.company.com/v1/chat/completions
   ```

3. **헤더 추가**
   - "Add Header" 버튼 클릭
   - Key: `X-Department`, Value: `Engineering`
   - 필요한 만큼 헤더 추가 가능

### Napoli Provider 설정

1. **기본 설정**
   ```
   Settings → Cline → API Provider → Napoli 선택
   ```

2. **연결 정보**
   ```
   Base URL: https://napoli.internal.company.com/v1
   Bearer Token: your-napoli-access-token
   ```

### Dortmund Provider 설정

1. **기본 설정**
   ```
   Settings → Cline → API Provider → Dortmund 선택
   ```

2. **인증 정보**
   ```
   Base URL: http://dortmund.internal.company.com/v1
   X-Dep-Ticket: your-department-ticket
   User-Id: your-employee-id
   User-Type: developer
   ```

## 💡 사용 예시

### 코드 생성
```
"React Native로 로그인 화면 만들어줘"
"FastAPI로 JWT 인증 서버 구현해줘"
"PostgreSQL 테이블 스키마 작성해줘"
```

### 코드 리팩토링
```
"이 코드를 함수형 프로그래밍으로 변경해줘"
"TypeScript로 마이그레이션 해줘"
"디자인 패턴 적용해서 리팩토링해줘"
```

### 버그 수정
```
"이 오류 메시지 해결해줘"
"메모리 누수 찾아서 수정해줘"
"성능 최적화 해줘"
```

### 테스트 작성
```
"Jest로 단위 테스트 작성해줘"
"Cypress로 E2E 테스트 추가해줘"
"테스트 커버리지 90%로 올려줘"
```

## 🔧 고급 설정

### 프록시 설정
내부 프록시를 통한 연결이 필요한 경우:
```json
{
  "http.proxy": "http://proxy.company.com:8080",
  "https.proxy": "http://proxy.company.com:8080",
  "http.proxyStrictSSL": false
}
```

### 타임아웃 설정
느린 내부 네트워크 환경을 위한 설정:
```json
{
  "cline.apiTimeout": 120000,
  "cline.retryAttempts": 5
}
```

### SSL 인증서 설정
자체 서명 인증서 사용 시:
```json
{
  "http.systemCertificates": false,
  "http.experimental.systemCertificatesV2": false
}
```

## 📊 업데이트 기록

### v3.16.1-onpremises.1
- All-Custom, Napoli, Dortmund Provider 구현
- Add Header 버튼 방식으로 동적 헤더 관리
- 외부 서비스 연결 완전 차단
- PostHog 텔레메트리 비활성화
- Cline 계정 로그인 UI 제거
- MCP 마켓플레이스 비활성화
- Firebase 인증 메커니즘 제거

### 기반 버전: Cline v3.16.1
- 원본 Cline의 모든 코어 기능 포함
- 파일 편집, 터미널 실행, 브라우저 조작 등

## 🛠️ 개발 정보

이 프로젝트는 개인 프로젝트로 시작되었으며, 기업 내부망 환경에서 AI 코딩 어시스턴트를 안전하게 활용하고자 하는 필요에서 개발되었습니다.

### Air-Gap 개발의 특징
- 완전한 오프라인 환경에서 작동
- 외부 의존성 없는 독립적인 시스템
- 보안이 최우선인 환경을 위한 설계

### 업데이트 주기
개인 프로젝트의 특성상 정기적인 업데이트는 어려울 수 있으나, 주요 버그 수정과 보안 패치는 가능한 한 빠르게 대응하도록 노력하겠습니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 GitHub Issues를 통해 알려주세요.

### 기여 방법
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 보안 고려사항

- 모든 API 키와 토큰은 VS Code 설정에 안전하게 저장됩니다
- 내부 네트워크에서만 작동하도록 설계되었습니다
- 외부로의 데이터 전송은 완전히 차단되어 있습니다
- 기업 보안 정책을 준수합니다
- Air-Gap 환경에서 완벽하게 작동합니다

## 📧 문의

- 버그 리포트: [GitHub Issues](https://github.com/cline/cline/issues)
- 이메일: khm@your-company.com

## 📄 라이센스

[Apache 2.0](LICENSE)

---

> **면책 조항**: 이 프로젝트는 개인 프로젝트로 개발되었으며, 원본 Cline 프로젝트의 공식 버전이 아닙니다. 사용에 대한 책임은 사용자에게 있습니다.