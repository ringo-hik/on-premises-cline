import { Anthropic } from "@anthropic-ai/sdk"
import { withRetry } from "../retry"
import { ApiHandler } from "../"
import { ApiHandlerOptions, ModelInfo, napoliDefaultModelId, napoliDefaultModelInfo, NapoliModelId } from "@shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"

export class NapoliHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private baseUrl: string

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.baseUrl = this.options.napoliBaseUrl || "https://napoli-service/v1"
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
			throw new Error(`Napoli API error: ${response.status} ${response.statusText}`)
		}

		yield* this.handleStreamResponse(response)
	}

	private buildHeaders(): Record<string, string> {
		return {
			Authorization: `Bearer ${this.options.napoliApiKey || ""}`,
			"Content-Type": "application/json",
			Accept: "text/event-stream; charset=utf-8",
		}
	}

	private buildRequestBody(messages: Anthropic.Messages.MessageParam[], systemPrompt: string, modelId: string) {
		return {
			model: modelId,
			messages: this.formatMessages(messages, systemPrompt),
			temperature: 0,
			max_tokens: 4096,
			stream: true,
		}
	}

	private formatMessages(messages: Anthropic.Messages.MessageParam[], systemPrompt: string) {
		const formattedMessages = [{ role: "system", content: systemPrompt }]

		messages.forEach((msg) => {
			formattedMessages.push({
				role: msg.role,
				content: this.extractTextContent(msg.content),
			})
		})

		return formattedMessages
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
						const content = parsed.choices?.[0]?.delta?.content
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

	getModel(): { id: NapoliModelId; info: ModelInfo } {
		const modelId = this.options.napoliModelId || napoliDefaultModelId
		const modelInfo = this.options.napoliModelInfo || napoliDefaultModelInfo

		return {
			id: modelId,
			info: modelInfo,
		}
	}
}
