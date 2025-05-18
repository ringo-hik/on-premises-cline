import { PostHog } from "posthog-node"
import { posthogConfig } from "@/shared/services/config/posthog-config"

class PostHogClientProvider {
	private static instance: PostHogClientProvider
	private client: PostHog
	/* on-premises fallback - posthog disabled */
	private isOnPremises = true

	private constructor() {
		// Create a dummy client that doesn't send events
		if (this.isOnPremises) {
			this.client = {
				capture: () => Promise.resolve(),
				identify: () => Promise.resolve(),
				alias: () => Promise.resolve(),
				groupIdentify: () => Promise.resolve(),
				isFeatureEnabled: () => false,
				getFeatureFlag: () => null,
				getAllFeatureFlags: () => ({}),
				reloadFeatureFlags: () => Promise.resolve(),
				shutdown: () => Promise.resolve(),
				debug: () => Promise.resolve(),
				optIn: () => Promise.resolve(),
				optOut: () => Promise.resolve(),
				isOptedIn: () => false,
			} as unknown as PostHog
		} else {
			this.client = new PostHog(posthogConfig.apiKey, {
				host: posthogConfig.host,
				enableExceptionAutocapture: false,
				defaultOptIn: false,
			})
		}
	}

	public static getInstance(): PostHogClientProvider {
		if (!PostHogClientProvider.instance) {
			PostHogClientProvider.instance = new PostHogClientProvider()
		}
		return PostHogClientProvider.instance
	}

	public getClient(): PostHog {
		return this.client
	}

	public async shutdown(): Promise<void> {
		await this.client.shutdown()
	}
}

export const posthogClientProvider = PostHogClientProvider.getInstance()
