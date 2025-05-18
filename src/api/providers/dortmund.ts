import { Anthropic } from "@anthropic-ai/sdk"
import { withRetry } from "../retry"
import { ApiHandler } from "../"
import { ApiHandlerOptions, ModelInfo, dortmundDefaultModelId, dortmundDefaultModelInfo, DortmundModelId } from "@shared/api"
import { ApiStream } from "../transform/stream"

export class DortmundHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private baseUrl: string
	private userId: string
	private userType: string

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.baseUrl = this.options.dortmundBaseUrl || "http://dortmund-service/v1"
		this.userId = this.options.dortmundUserId || ""
		this.userType = this.options.dortmundUserType || ""
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.getModel()
		const headers = this.buildHeaders()
		const body = this.buildRequestBody(messages, systemPrompt, model.id)

		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		})

		if (!response.ok) {
			throw new Error(`Dortmund API error: ${response.status} ${response.statusText}`)
		}

		yield* this.handleStreamResponse(response)
	}

	private buildHeaders(): Record<string, string> {
		return {
			"X-Dep-Ticket": this.options.dortmundApiKey || "",
			"User-Id": this.userId,
			"User-Type": this.userType,
			"Send-System-Name": this.options.dortmundSystemName || "M",
			"Prompt-Msg-Id": this.generateUUID(),
			"Completion-Msg-Id": this.generateUUID(),
			"Content-Type": "application/json",
			Accept: "text/event-stream; charset=utf-8",
		}
	}

	private buildRequestBody(messages: Anthropic.Messages.MessageParam[], systemPrompt: string, modelId: string) {
		return {
			model_id: modelId,
			system_prompt: systemPrompt,
			messages: this.formatMessages(messages),
			user_id: this.userId,
			user_type: this.userType,
			temperature: 0,
			max_tokens: 4096,
			stream_mode: true,
		}
	}

	private formatMessages(messages: Anthropic.Messages.MessageParam[]) {
		return messages.map((msg) => ({
			role: msg.role,
			content: this.extractTextContent(msg.content),
		}))
	}

	private extractTextContent(content: Anthropic.Messages.MessageParam["content"]): string {
		if (typeof content === "string") {
			return content
		}

		if (Array.isArray(content)) {
			return content
				.filter((item) => item.type === "text")
				.map((item) => (item as any).text)
				.join("\n")
		}

		return ""
	}

	private generateUUID(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0
			const v = c === "x" ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
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
						// Dortmund의 커스텀 응답 형식 처리
						const content = parsed.choices?.[0]?.delta?.content || parsed.delta?.content
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
			const content = this.extractTextContent(msg.content)
			return acc + content.length
		}, systemPrompt.length)

		yield {
			type: "usage",
			inputTokens: Math.ceil(totalLength / 4),
			outputTokens: 0,
			totalCost: 0,
		}
	}

	getModel(): { id: DortmundModelId; info: ModelInfo } {
		const modelId = this.options.dortmundModelId || dortmundDefaultModelId
		const modelInfo = this.options.dortmundModelInfo || dortmundDefaultModelInfo

		return {
			id: modelId,
			info: modelInfo,
		}
	}
}
