# Dortmund Provider 상세 구성

Dortmund Provider는 User-ID 기반의 커스텀 인증을 사용하는 내부망 LLM 서비스를 위한 Provider입니다.

## 특징

- **커스텀 헤더 인증**: X-Dep-Ticket, User-ID, User-Type 사용
- **메시지 추적**: 각 요청에 고유 UUID 할당
- **HTTP 프로토콜**: 내부망에서 주로 사용
- **커스텀 요청 형식**: model_id, system_prompt 등 독자 형식

## 헤더 구성

```typescript
const headers = {
  'X-Dep-Ticket': apiKey, // 인증 토큰
  'User-Id': userId || '',
  'User-Type': userType || '',
  'Send-System-Name': 'M', // 기본값
  'Prompt-Msg-Id': generateUUID(),
  'Completion-Msg-Id': generateUUID(),
  'Content-Type': 'application/json',
  'Accept': 'text/event-stream; charset=utf-8'
};
```

## 요청 본문 구성

```typescript
const requestBody = {
  model_id: 'dortmund-internal-model', // 커스텀 형식
  system_prompt: systemPrompt,         // 별도 필드
  messages: messages,
  user_id: userId || '',
  user_type: userType || '',
  temperature: 0,
  max_tokens: 4096,
  stream_mode: true                    // stream 대신 stream_mode
};
```

## 구현 예시

```typescript
class DortmundProvider extends BaseProvider {
  private userId: string;
  private userType: string;
  
  constructor(options: DortmundOptions) {
    super(options);
    this.baseUrl = 'http://dortmund-service/v1';
    this.modelId = options.model || 'dortmund-internal-model';
    this.userId = options.userId || '';
    this.userType = options.userType || '';
  }

  async createCompletion(messages: Message[], systemPrompt: string) {
    const headers = this.buildHeaders();
    const body = this.buildRequestBody(messages, systemPrompt);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    return this.handleStreamResponse(response);
  }
  
  private buildHeaders(): Record<string, string> {
    return {
      'X-Dep-Ticket': this.apiKey,
      'User-Id': this.userId,
      'User-Type': this.userType,
      'Send-System-Name': 'M',
      'Prompt-Msg-Id': this.generateUUID(),
      'Completion-Msg-Id': this.generateUUID(),
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream; charset=utf-8'
    };
  }
  
  private buildRequestBody(messages: Message[], systemPrompt: string) {
    return {
      model_id: this.modelId,
      system_prompt: systemPrompt,
      messages: this.formatMessages(messages),
      user_id: this.userId,
      user_type: this.userType,
      temperature: 0,
      max_tokens: 4096,
      stream_mode: true
    };
  }
  
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
```

## 메시지 형식 변환

```typescript
private formatMessages(messages: Message[]): DortmundMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: this.extractTextContent(msg.content)
  }));
}

private extractTextContent(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }
  
  return '';
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
          // Dortmund의 커스텀 응답 형식 처리
          const content = parsed.choices?.[0]?.delta?.content || 
                         parsed.delta?.content;
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

## 환경 설정

```json
{
  "llmProvider": "dortmund",
  "dortmundApiKey": "your-dep-ticket",
  "dortmundUserId": "user@company.com",
  "dortmundUserType": "employee",
  "dortmundModel": "dortmund-internal-model",
  "dortmundBaseUrl": "http://dortmund-service/v1"
}
```

## 사용 예시

```typescript
const dortmund = new DortmundProvider({
  apiKey: process.env.DORTMUND_API_KEY,
  userId: process.env.DORTMUND_USER_ID,
  userType: process.env.DORTMUND_USER_TYPE,
  model: 'dortmund-internal-model'
});

const response = await dortmund.createCompletion(
  messages,
  "You are a helpful coding assistant."
);

for await (const chunk of response) {
  console.log(chunk);
}
```

## 에러 처리

```typescript
try {
  const response = await dortmund.createCompletion(messages, systemPrompt);
} catch (error) {
  if (error.status === 401) {
    throw new Error('Invalid Dep-Ticket or User credentials');
  } else if (error.status === 403) {
    throw new Error('User not authorized');
  } else if (error.status === 429) {
    throw new Error('Rate limit exceeded');
  } else {
    throw new Error(`Dortmund API error: ${error.message}`);
  }
}
```

## 메시지 추적

```typescript
// 요청 추적을 위한 UUID 로깅
const promptMsgId = this.generateUUID();
const completionMsgId = this.generateUUID();

console.log('Request tracking:', {
  promptMsgId,
  completionMsgId,
  userId: this.userId,
  timestamp: new Date().toISOString()
});
```

## 토큰 사용량 추정

```typescript
private estimateTokens(messages: Message[]): number {
  let totalTokens = 0;
  
  // 시스템 프롬프트 토큰
  totalTokens += Math.ceil(this.systemPrompt.length / 4);
  
  // 메시지 토큰
  messages.forEach(msg => {
    const content = this.extractTextContent(msg.content);
    totalTokens += Math.ceil(content.length / 4);
  });
  
  return totalTokens;
}
```

## 주의사항

1. **사용자 정보 보안**: User-ID와 User-Type은 민감 정보로 취급
2. **HTTP 통신**: 내부망에서만 사용, 외부망 노출 금지
3. **UUID 생성**: 각 요청마다 고유한 UUID 생성 필수
4. **인증 정보**: X-Dep-Ticket은 환경 변수로 안전하게 관리

## 디버깅

```typescript
// 상세 요청 로깅
if (process.env.DEBUG) {
  console.log('Dortmund Request:', {
    url: `${this.baseUrl}/chat/completions`,
    headers: this.buildHeaders(),
    body: this.buildRequestBody(messages, systemPrompt),
    tracking: {
      promptMsgId: headers['Prompt-Msg-Id'],
      completionMsgId: headers['Completion-Msg-Id']
    }
  });
}
```

## 커스터마이징

```typescript
// 부서별 설정 예시
class DepartmentDortmundProvider extends DortmundProvider {
  constructor(options: DortmundOptions) {
    super(options);
    this.userType = options.department || 'IT';
    this.headers['X-Department'] = this.userType;
  }
}
```