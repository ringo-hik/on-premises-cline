import { Anthropic } from "@anthropic-ai/sdk"
import { withRetry } from "../retry"
import { ApiHandler } from "../"
import { ApiHandlerOptions, ModelInfo, allCustomDefaultModelId, allCustomDefaultModelInfo, AllCustomModelId } from "@shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"

export class AllCustomHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private endpoint: string
	private customHeaders: Record<string, string>

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.endpoint = this.options.allCustomEndpoint || "https://api.openai.com/v1/chat/completions"
		this.customHeaders = this.options.allCustomHeaders || {}

		if (!this.endpoint) {
			throw new Error("Endpoint is required for All-Custom provider")
		}
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.getModel()
		const headers = this.buildHeaders()
		const body = this.buildRequestBody(messages, systemPrompt, model.id)

		const response = await fetch(this.endpoint, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		})

		if (!response.ok) {
			throw new Error(`Custom API error: ${response.status} ${response.statusText}`)
		}

		yield* this.handleStreamResponse(response)
	}

	private buildHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			Accept: "text/event-stream; charset=utf-8",
		}

		// API Key 설정
		if (this.options.allCustomApiKey) {
			headers["Authorization"] = `Bearer ${this.options.allCustomApiKey}`
		}

		// 사용자 정의 헤더 병합
		Object.assign(headers, this.customHeaders)

		return headers
	}

	private buildRequestBody(messages: Anthropic.Messages.MessageParam[], systemPrompt: string, modelId: string) {
		const body: any = {
			model: modelId,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			temperature: 0,
			max_tokens: 4096,
			stream: true,
		}

		// 특정 서비스 최적화
		this.optimizeForSpecificServices(body)

		return body
	}

	private optimizeForSpecificServices(body: any) {
		if (this.endpoint.includes("openrouter.ai")) {
			body.http_referer = "https://vscode.dev"
			body.transforms = ["middle-out"]
		}

		// 다른 서비스들의 특별 처리 추가 가능
		if (this.endpoint.includes("custom-service")) {
			body.custom_field = "custom_value"
		}
	}

	private async *handleStreamResponse(response: Response): ApiStream {
		const reader = response.body?.getReader()
		const decoder = new TextDecoder()

		while (true) {
			const { done, value } = await reader!.read()
			if (done) {
				break
			}

			const chunk = decoder.decode(value)
			const lines = chunk.split("\n")

			for (const line of lines) {
				if (line.startsWith("data: ")) {
					const data = line.slice(6)
					if (data === "[DONE]") {
						continue
					}

					try {
						const parsed = JSON.parse(data)
						// 다양한 응답 형식 지원
						const content =
							parsed.choices?.[0]?.delta?.content || parsed.delta?.content || parsed.content || parsed.text

						if (content) {
							yield {
								type: "text",
								text: content,
							}
						}
					} catch (e) {
						console.error("Failed to parse SSE data:", e)
					}
				}
			}
		}

		// 토큰 사용량 추정
		const totalLength = messages.reduce((acc, msg) => {
			const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
			return acc + content.length
		}, systemPrompt.length)

		yield {
			type: "usage",
			inputTokens: Math.ceil(totalLength / 4),
			outputTokens: 0,
			totalCost: 0,
		}
	}

	getModel(): { id: AllCustomModelId; info: ModelInfo } {
		const modelId = this.options.allCustomModelId || allCustomDefaultModelId
		const modelInfo = this.options.allCustomModelInfo || allCustomDefaultModelInfo

		return {
			id: modelId,
			info: modelInfo,
		}
	}
}
