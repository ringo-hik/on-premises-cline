import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { withRetry } from "../retry"
import { ApiHandler } from "../"
import { ApiHandlerOptions, ModelInfo, napoliDefaultModelId, napoliDefaultModelInfo, NapoliModelId } from "@shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"

export class NapoliHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.client = new OpenAI({
			baseURL: this.options.napoliBaseUrl || "https://napoli-service/v1",
			apiKey: this.options.napoliApiKey || "",
			dangerouslyAllowBrowser: true,
		})
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const model = this.getModel()
		const stream = await this.client.chat.completions.create({
			model: model.id,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			temperature: 0,
			stream: true,
			stream_options: { include_usage: true },
		})

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			if (chunk.usage) {
				// Only last chunk contains usage
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
					totalCost: 0,
				}
			}
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