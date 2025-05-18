# All-Custom (Json) Provider 상세 구성

All-Custom Provider는 가장 유연한 설정이 가능한 Provider로, 다양한 내부망 LLM 서비스와 통합할 수 있습니다.

## 특징

- **완전 사용자 정의 가능**: 헤더, 엔드포인트, 인증 방식 모두 설정 가능
- **JSON 기반 헤더 설정**: 복잡한 헤더 구조도 JSON으로 간단히 정의
- **OpenAI API 호환**: 기본 형식은 OpenAI와 호환
- **자동 서비스 감지**: OpenRouter 등 특정 서비스 자동 최적화

## 헤더 구성

```typescript
// 기본 헤더
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'text/event-stream; charset=utf-8'
};

// Bearer 토큰 추가 (선택적)
if (apiKey) {
  headers['Authorization'] = `Bearer ${apiKey}`;
}

// 사용자 정의 헤더 병합
if (customHeaders) {
  const parsedHeaders = JSON.parse(customHeaders);
  Object.assign(headers, parsedHeaders);
}
```

## 사용자 정의 헤더 예시

```json
{
  "X-API-Key": "custom-api-key",
  "X-Department": "Engineering",
  "X-Project": "Internal-LLM",
  "X-Auth-Method": "custom-auth"
}
```

## 요청 본문 구성

```typescript
const requestBody = {
  model: modelName,
  messages: messages,
  temperature: 0,
  max_tokens: 4096,
  stream: true
};

// 특정 서비스 감지 및 추가 설정
if (endpoint.includes('openrouter.ai')) {
  requestBody.http_referer = "https://vscode.dev";
  requestBody.transforms = ["middle-out"];
}
```

## 구현 예시

```typescript
class AllCustomProvider extends BaseProvider {
  private endpoint: string;
  private customHeaders: Record<string, string>;
  
  constructor(options: AllCustomOptions) {
    super(options);
    this.endpoint = options.endpoint;
    this.customHeaders = this.parseHeaders(options.customHeaders);
    
    if (!this.endpoint) {
      throw new Error('Endpoint is required for All-Custom provider');
    }
  }

  async createCompletion(messages: Message[], systemPrompt: string) {
    const headers = this.buildHeaders();
    const body = this.buildRequestBody(messages, systemPrompt);
    
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    return this.handleStreamResponse(response);
  }
  
  private parseHeaders(headersJson?: string): Record<string, string> {
    if (!headersJson) return {};
    
    try {
      return JSON.parse(headersJson);
    } catch (e) {
      throw new Error(`Invalid JSON for custom headers: ${e.message}`);
    }
  }
  
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream; charset=utf-8'
    };
    
    // API Key 설정
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    // 사용자 정의 헤더 병합
    Object.assign(headers, this.customHeaders);
    
    return headers;
  }
  
  private buildRequestBody(messages: Message[], systemPrompt: string) {
    const body: any = {
      model: this.modelId,
      messages: this.formatMessages(messages, systemPrompt),
      temperature: 0,
      max_tokens: 4096,
      stream: true
    };
    
    // 특정 서비스 최적화
    this.optimizeForSpecificServices(body);
    
    return body;
  }
  
  private optimizeForSpecificServices(body: any) {
    if (this.endpoint.includes('openrouter.ai')) {
      body.http_referer = "https://vscode.dev";
      body.transforms = ["middle-out"];
    }
    
    // 다른 서비스들의 특별 처리 추가 가능
    if (this.endpoint.includes('custom-service')) {
      body.custom_field = "custom_value";
    }
  }
}
```

## 설정 예시

### 1. OpenAI 호환 서비스

```json
{
  "llmProvider": "all-custom",
  "customApiKey": "your-api-key",
  "customEndpoint": "https://internal-llm.company.com/v1/chat/completions",
  "customModel": "internal-gpt-4",
  "customHeaders": "{}"
}
```

### 2. 커스텀 인증 서비스

```json
{
  "llmProvider": "all-custom",
  "customEndpoint": "https://llm.internal/api/generate",
  "customModel": "custom-model",
  "customHeaders": "{\"X-API-Key\": \"secret-key\", \"X-User-ID\": \"john.doe\"}"
}
```

### 3. 복잡한 헤더 구조

```json
{
  "llmProvider": "all-custom",
  "customApiKey": "bearer-token",
  "customEndpoint": "https://ml-platform.corp/v2/inference",
  "customModel": "corp-llm-v2",
  "customHeaders": "{\"X-Tenant-ID\": \"tenant-123\", \"X-Resource-Pool\": \"gpu-cluster-1\", \"X-Priority\": \"high\"}"
}
```

## 에러 처리

```typescript
try {
  const response = await custom.createCompletion(messages, systemPrompt);
} catch (error) {
  if (error.message.includes('Invalid JSON')) {
    throw new Error('Custom headers must be valid JSON');
  } else if (error.status === 401) {
    throw new Error('Authentication failed - check API key and headers');
  } else if (error.status === 404) {
    throw new Error('Invalid endpoint URL');
  } else {
    throw new Error(`Custom API error: ${error.message}`);
  }
}
```

## 스트리밍 응답 처리

```typescript
private async handleStreamResponse(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          // 다양한 응답 형식 지원
          const content = 
            parsed.choices?.[0]?.delta?.content ||
            parsed.delta?.content ||
            parsed.content ||
            parsed.text;
            
          if (content) {
            yield content;
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }
}
```

## 고급 설정

### 프록시 설정

```typescript
// 내부 프록시를 통한 연결
const proxyConfig = {
  host: 'proxy.internal.com',
  port: 8080,
  auth: {
    username: 'proxy-user',
    password: 'proxy-pass'
  }
};

// fetch에 프록시 설정 적용
const agent = new HttpsProxyAgent(proxyConfig);
const response = await fetch(this.endpoint, {
  agent,
  ...fetchOptions
});
```

### 재시도 로직

```typescript
private async retryableRequest(requestFn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const backoff = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
}
```

## 디버깅

```typescript
// 상세 로깅
if (process.env.DEBUG) {
  console.log('All-Custom Request:', {
    endpoint: this.endpoint,
    headers: this.buildHeaders(),
    body: this.buildRequestBody(messages, systemPrompt),
    customHeaders: this.customHeaders
  });
}

// 응답 검증
private validateResponse(response: any) {
  if (!response.ok) {
    console.error('Response error:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers)
    });
  }
}
```

## 보안 고려사항

1. **헤더 검증**: JSON 파싱 전 검증
2. **엔드포인트 화이트리스트**: 허용된 내부망 URL만 사용
3. **민감 정보 보호**: 로그에 API 키 노출 방지
4. **SSL 검증**: 내부 인증서 처리

```typescript
// 엔드포인트 검증
private validateEndpoint(endpoint: string) {
  const allowedDomains = [
    'internal.company.com',
    'llm.corp.local',
    'ml-platform.internal'
  ];
  
  const url = new URL(endpoint);
  if (!allowedDomains.some(domain => url.hostname.endsWith(domain))) {
    throw new Error('Endpoint not in allowed domains');
  }
}
```

## 성능 최적화

```typescript
// 연결 재사용
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 10
});

// 타임아웃 설정
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(this.endpoint, {
    signal: controller.signal,
    agent: keepAliveAgent,
    ...options
  });
} finally {
  clearTimeout(timeout);
}
```