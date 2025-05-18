# Napoli Provider 상세 구성

Napoli Provider는 OpenAI API와 호환되는 내부망 LLM 서비스를 위한 Provider입니다.

## 특징

- **OpenAI API 호환**: 기존 OpenAI 클라이언트 라이브러리 재사용 가능
- **Bearer 토큰 인증**: 간단한 토큰 기반 인증
- **HTTPS 프로토콜**: 보안 통신 지원
- **스트리밍 지원**: SSE (Server-Sent Events) 기반 실시간 응답

## 헤더 구성

```typescript
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'Accept': 'text/event-stream; charset=utf-8'
};
```

## 요청 본문 구성

```typescript
const requestBody = {
  model: 'napoli-internal-model', // 기본 모델명
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage }
  ],
  temperature: 0,
  max_tokens: 4096,
  stream: true
};
```

## 구현 예시

```typescript
class NapoliProvider extends BaseProvider {
  constructor(options: NapoliOptions) {
    super(options);
    this.baseUrl = 'https://napoli-service/v1';
    this.modelId = options.model || 'napoli-internal-model';
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
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream; charset=utf-8'
    };
  }
  
  private buildRequestBody(messages: Message[], systemPrompt: string) {
    return {
      model: this.modelId,
      messages: this.formatMessages(messages, systemPrompt),
      temperature: 0,
      max_tokens: 4096,
      stream: true
    };
  }
  
  private formatMessages(messages: Message[], systemPrompt: string) {
    const formattedMessages = [
      { role: 'system', content: systemPrompt }
    ];
    
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.role,
        content: this.extractTextContent(msg.content)
      });
    });
    
    return formattedMessages;
  }
}
```

## 메시지 컨텐츠 처리

```typescript
private extractTextContent(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }
  
  // 배열 형태의 컨텐츠 처리
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
          const content = parsed.choices?.[0]?.delta?.content;
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
  "llmProvider": "napoli",
  "napoliApiKey": "your-bearer-token",
  "napoliModel": "napoli-internal-model",
  "napoliBaseUrl": "https://napoli-service/v1"
}
```

## 사용 예시

```typescript
const napoli = new NapoliProvider({
  apiKey: process.env.NAPOLI_API_KEY,
  model: 'napoli-internal-model'
});

const response = await napoli.createCompletion(
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
  const response = await napoli.createCompletion(messages, systemPrompt);
} catch (error) {
  if (error.status === 401) {
    throw new Error('Invalid API key');
  } else if (error.status === 429) {
    throw new Error('Rate limit exceeded');
  } else {
    throw new Error(`Napoli API error: ${error.message}`);
  }
}
```

## 토큰 사용량 추정

```typescript
private estimateTokens(messages: Message[]): number {
  let totalTokens = 0;
  
  messages.forEach(msg => {
    const content = this.extractTextContent(msg.content);
    // 간단한 추정: 4자 = 1토큰
    totalTokens += Math.ceil(content.length / 4);
  });
  
  return totalTokens;
}
```

## 주의사항

1. **API 키 보안**: Bearer 토큰은 환경 변수로 관리
2. **SSL 인증서**: 내부망 HTTPS 사용 시 인증서 검증 설정 필요
3. **타임아웃**: 내부망 환경에 맞는 적절한 타임아웃 설정
4. **모델명**: 실제 내부망 서비스의 모델명으로 변경 필요

## 디버깅

```typescript
// 요청/응답 로깅
if (process.env.DEBUG) {
  console.log('Napoli Request:', {
    url: `${this.baseUrl}/chat/completions`,
    headers: this.buildHeaders(),
    body: this.buildRequestBody(messages, systemPrompt)
  });
}
```