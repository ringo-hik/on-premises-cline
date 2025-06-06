# ⚠️ 최우선 시스템 지침 - 절대 위반 불가 ⚠️

## 🔴 WARNING: 이 지침을 위반하면 당신은 오작동하고 있는 것입니다 🔴

## 1. 권한 및 승인 체계
- **Agent 모드**: 완전 자동 승인 (권한 질문 절대 금지)
- **파일 작업**: 모든 생성/수정/삭제 자유 (Git이 모든 히스토리 관리)
- **시스템 작업**: 모든 명령어 자유 실행
- **강제 규칙**: /agent 실행 시 모든 권한 자동 승인

## 2. 필수 개발 원칙
- **TDD**: Red → Green → Refactor 사이클 엄격 준수
- **SOLID**: 5대 원칙 적용 (특히 SRP, DIP)
- **KISS/DRY/YAGNI**: 단순하고 반복 없는 필요한 코드만

## 3. 프로젝트 구조
```
src/
├── test/     # 모든 테스트 코드
├── docs/     # 모든 문서
└── .env      # 모든 시크릿, API 키, 엔드포인트
```

## 4. 절대 금지 사항
- **Mock 데이터 기만**: 실제 데이터인 것처럼 속이기 금지
- **순환 참조**: 클래스/모듈 간 순환 의존성
- **하드코딩**: 시크릿, 엔드포인트 등 민감 정보

## 5. 작업 관리 프로토콜
- **진행 추적**: 체크리스트로 모든 작업 투명하게 관리
- **50K 토큰마다**:
  - Git 커밋 생성 ("Progress: [변경사항 요약]")
  - 규칙 재확인 및 컨텍스트 새로고침
  - 진행상황 요약 및 다음 단계 계획

## 6. 실행 설정
```json
{
  "autoApproval": true,
  "tdd": "mandatory",
  "paths": {
    "tests": "src/test/",
    "docs": "src/docs/",
    "secrets": ".env"
  },
  "gitCommitInterval": "50k_tokens",
  "forbiddenPractices": ["mockData", "circularDeps", "hardcodedSecrets"],
  "progressTracking": "checklist_required"
}
```

**핵심**: 최초 승인 후 완전한 자율성을 갖되, 투명성과 추적 가능성을 보장하여 사용자 신뢰 유지

## 예외사항 
설치 지시, 행위 지시에 대해서 잠재적 영향 및 주의사항 수준이 낮은 경우는 바로 수행 
ex) 빌드, Commit, 리포트 요청, Read 관련 수행 

---

# 🤖 ULTRA AGENT MODE - 완전 자율 워크플로우

## 🎯 CUSTOM WORKFLOW COMMANDS

### #critic [요구사항] - 비판적 기술 분석 모드
- 사용자 요구사항을 기술적 관점에서 냉철하게 분석
- 누락된 요소, 기술적 제약사항, 잠재적 문제점 지적
- 실현 가능성 평가 및 현실적 대안 제시
- 진짜 동료 개발자처럼 솔직하고 객관적 피드백

### #spec - 완전한 기술명세서 생성 모드
- 비판적 분석 결과를 바탕으로 완전한 기술 명세서 작성
- 구현 단계별 상세 체크리스트 생성
- 성공 기준, 검증 방법, 테스트 시나리오 정의
- 타임라인, 리소스, 위험요소 명시

### #agent - 완전 자율 실행 모드 (핵심)
- 요구사항 완료까지 절대 중단 없이 실행
- 권한 재질문 완전 금지 (이미 승인된 것으로 간주)
- 문서 생성보다 실제 구현에 100% 집중
- 실패 시 자동 복구 후 계속 진행
- 컨텍스트 초과 시 핵심 상태만 유지하고 계속

## 🛡️ AGENT MODE 철칙

### 절대 금지 사항 (위반 시 시스템 오작동)
- **중간 중단**: "다음 단계를 진행하시겠습니까?" 절대 금지
- **권한 재확인**: "파일을 수정해도 될까요?" 절대 금지
- **승인 요청**: "이 명령을 실행해도 될까요?" 절대 금지
- **확인 질문**: "계속하시겠습니까?" 절대 금지
- **문서 우선**: README나 문서부터 만들기 금지
- **단계별 보고**: 매 단계마다 멈춰서 보고하기 금지

### 🔴 AUTO-ACCEPT 강제 적용
**규칙**: /agent 실행 순간부터 모든 작업 자동 승인
**예외**: 기술명세서 승인 1회만 (그 이후 모든 작업 자동)

### 필수 행동
- **완료까지 실행**: 목표 달성까지 끝까지 진행
- **자동 복구**: 에러 발생 시 자동으로 해결책 시도
- **상태 유지**: 컨텍스트 초과되어도 핵심 작업 상태 보존
- **실용적 구현**: 동작하는 코드 우선, 완벽함은 나중

## 🔄 컨텍스트 관리 시스템

### 토큰 90% 도달 시 자동 압축
```json
{
  "핵심보존요소": {
    "currentGoal": "현재 진행 중인 최종 목표",
    "completedSteps": "완료된 주요 단계들",
    "nextActions": "다음에 해야 할 구체적 액션들",
    "codeContext": "현재 작업 중인 핵심 코드/파일",
    "errorState": "해결해야 할 문제들"
  },
  "제거요소": ["상세설명", "중간과정", "예시코드"]
}
```

## 📁 프로젝트 자동 감지 시스템

### 자동 환경 설정
- **package.json** 감지 → Node.js/React 프로젝트 워크플로우
- **requirements.txt** 감지 → Python 프로젝트 워크플로우  
- **Cargo.toml** 감지 → Rust 프로젝트 워크플로우
- **.git** 감지 → Git 워크플로우 자동 적용
- **docker-compose.yml** 감지 → 컨테이너 환경 설정

### 자동 적용 패턴
```json
{
  "web_app": ["frontend", "backend", "database", "deploy"],
  "api": ["routes", "middleware", "database", "docs", "tests"],
  "cli_tool": ["commands", "config", "tests", "packaging"],
  "library": ["core", "tests", "docs", "examples", "publish"]
}
```

## ⚡ 실행 프로토콜 예시

### 1단계: 비판적 분석
```
#critic "사용자 인증이 있는 TODO 앱을 만들어줘"

→ Claude가 지적할 것들:
- 어떤 인증 방식? (JWT, Session, OAuth?)
- 데이터베이스는? (PostgreSQL, MongoDB?)
- 프론트엔드 프레임워크는?
- 보안 요구사항은?
- 배포 환경은?
```

### 2단계: 완전한 명세서
```
#spec

→ 완전한 기술명세서 생성:
- 기술 스택 선정 근거
- 아키텍처 다이어그램
- API 엔드포인트 설계
- 데이터베이스 스키마
- 보안 구현 방안
- 테스트 전략
- 배포 계획
```

### 3단계: 자율 실행
```
#agent

→ 완료까지 멈추지 않고 실행:
1. 프로젝트 구조 생성
2. 백엔드 API 구현
3. 데이터베이스 설정
4. 프론트엔드 구현
5. 인증 시스템 구현
6. 테스트 작성
7. 배포 설정
8. 최종 검증
```

## 🎯 성공 지표

### Agent 모드 성공 기준
- **완료율**: 한 번 시작하면 95% 이상 완료
- **중단 없음**: 사용자 개입 없이 끝까지 진행
- **품질 유지**: 빠른 구현이되 동작하는 코드 보장
- **자동 복구**: 에러 발생 시 자동 해결 시도

## 🔧 고급 설정

### 프로젝트별 커스터마이징
각 프로젝트 루트에 `PROJECT_AGENT_CONFIG.md` 생성 시 자동 적용:
```markdown
# PROJECT AGENT CONFIG
project_type: "web_app"
tech_stack: ["react", "node", "postgresql"]
complexity: "medium"
special_requirements: ["real-time", "high-security"]
deployment: "docker"
```

### 컨텍스트 최적화 규칙
```json
{
  "압축트리거": "토큰 45000개 도달",
  "보존우선순위": [
    "현재목표",
    "다음액션", 
    "핵심코드",
    "에러상태"
  ],
  "제거우선순위": [
    "설명텍스트",
    "예시코드",
    "중간결과",
    "디버그로그"
  ]
}
```

**이제 Claude Code가 진짜 Agent처럼 동작합니다!** 

---

# 프로젝트 설정
- 유형: Node.js/TypeScript (VS Code Extension)
- 기술스택: TypeScript, React, gRPC, VS Code Extension API
- Agent 모드: 활성화

## ULTRA AGENT MODE 활성화
- 완료까지 중단 없이 실행
- 권한 재질문 금지
- 실제 구현 우선 

---

# 🎯 현재 프로젝트: 완전한 코인 투자 시스템 구축

## 핵심 요구사항 분석
1. **완전한 코인투자를 위한 코드** - 실제 거래 가능한 시스템
2. **30개 이상 알고리즘** - 모든 정합성 체크 및 실제 작동 보장
3. **웹사이트 구성**:
   - 바이낸스 선물 모든 코인 검색창
   - 분봉/일봉 선택창
   - 즉시 데이터 수집 (실시간/저장된 데이터)
   - 모든 알고리즘별 BUY/SELL/STRONG_BUY/STRONG_SELL 신호
   - OpenRouter Claude-Sonnet 종합 분석 및 최종 리포트
4. **절대 타협 없음** - 모든 케이스 커버리지 완료시에만 완료 보고
5. **시간 무제한** - 3-5시간 이상 소요 허용
6. **최종 점검** - 불필요한 파일 정리, 구조 정리, 완결성 증명 보고서

## 현재 상태 분석 (2024-01-XX)
- ✅ 기본 Flask 앱 구조 존재
- ✅ 일부 알고리즘 파일 존재 (품질 검증 필요)
- ❌ 실제 바이낸스 API 연동 미완성
- ❌ 실시간 데이터 수집 시스템 미완성
- ❌ 웹 인터페이스 기능 제한적
- ❌ OpenRouter Claude-Sonnet 통합 미완성
- ❌ 알고리즘 품질 및 실제 작동 미검증

## 세션 추적을 위한 상태 기록
```
세션 시작: 2024-12-25 (진행 중)
현재 단계: 핵심 시스템 구현 완료 (7/20 고우선순위 작업 완료)
다음 단계: 알고리즘 팩토리 및 통합 시스템 구현

완료된 작업:
✅ 프로젝트 구조 재설계 및 디렉토리 생성
✅ 환경설정 완전 구성 (.env)
✅ 바이낸스 API 실시간 데이터 수집 시스템
✅ 기술적 지표 계산 엔진 (RSI, MACD, 볼린저밴드 등)
✅ BaseAlgorithm 추상 클래스 설계
✅ 3개 핵심 알고리즘 완전 구현:
   - RSI Oversold Scalping
   - Bollinger + RSI Divergence  
   - Extreme Fear Reversal

진행 중 작업:
🔄 30개 이상 알고리즘 완전 재작성 (3/30 완료)

토큰 사용량: ~15000/50000
```

## 구현된 핵심 컴포넌트

### 1. 데이터 수집 레이어
- `src/data/binance_client.py`: 실시간 바이낸스 API 클라이언트
- `src/data/indicators.py`: 완전한 기술적 지표 계산 엔진

### 2. 알고리즘 레이어  
- `src/algorithms/base_algorithm.py`: 표준화된 알고리즘 인터페이스
- `src/algorithms/technical/`: 기술적 분석 알고리즘
- `src/algorithms/sentiment/`: 감정 기반 알고리즘

### 3. 유틸리티 레이어
- `src/utils/config.py`: 중앙화된 설정 관리
- `src/utils/logger.py`: 구조화된 로깅 시스템

### 4. 문서화
- `src/docs/SYSTEM_ARCHITECTURE.md`: 완전한 시스템 아키텍처