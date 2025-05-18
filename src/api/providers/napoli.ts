import { Anthropic } from "@anthropic-ai/sdk"
import { withRetry } from "../retry"
import { ApiHandler } from "../"
import { ApiHandlerOptions, ModelInfo, napoliDefaultModelId, napoliDefaultModelInfo, NapoliModelId } from "@shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"

export class NapoliHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private apiKey: string
	private baseUrl: string

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.apiKey = this.options.napoliApiKey || ""
		this.baseUrl = this.options.napoliBaseUrl || "https://napoli-endpoint/v1/chat/completions"

		if (!this.baseUrl) {
			throw new Error("Base URL is required for Napoli provider")
		}
	}

	async *createMessage(systemPrompt: string, messageInput: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.getModel()
		const requestOptions = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: model.id,
				messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messageInput)],
				temperature: 0,
				max_tokens: 4096,
				stream: true,
			}),
		}

		const response = await fetch(`${this.baseUrl}`, requestOptions)

		if (!response.ok) {
			throw new Error(`Napoli API error: ${response.status} ${response.statusText}`)
		}

		yield* this.handleStreamResponse(response, messageInput, systemPrompt)
	}

	private async *handleStreamResponse(
		response: Response,
		messagesInput: Anthropic.Messages.MessageParam[],
		systemPromptInput: string,
	): ApiStream {
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
		const totalLength = messagesInput.reduce((acc: number, msg: any) => {
			const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
			return acc + content.length
		}, systemPromptInput?.length || 0)

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
