// PostHog imports removed for on-premises deployment
import { PostHog } from "./mock-posthog"

class PostHogClientProvider {
	private static instance: PostHogClientProvider
	private client: any

	private constructor() {
		// Always create a mock client for on-premises deployment
		this.client = new PostHog("dummy-key", {})
	}

	public static getInstance(): PostHogClientProvider {
		if (!PostHogClientProvider.instance) {
			PostHogClientProvider.instance = new PostHogClientProvider()
		}
		return PostHogClientProvider.instance
	}

	public getClient(): any {
		return this.client
	}

	public async shutdown(): Promise<void> {
		await this.client.shutdown()
	}
}

export const posthogClientProvider = PostHogClientProvider.getInstance()
