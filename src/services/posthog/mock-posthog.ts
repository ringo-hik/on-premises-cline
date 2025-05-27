// Mock PostHog for on-premises deployment
export class PostHog {
	constructor(apiKey?: string, options?: any) {
		// Do nothing - mock implementation
	}

	capture(...args: any[]): void {
		// Do nothing
	}

	identify(...args: any[]): void {
		// Do nothing
	}

	alias(...args: any[]): void {
		// Do nothing
	}

	getFeatureFlag(...args: any[]): any {
		return undefined
	}

	getFeatureFlagPayload(...args: any[]): any {
		return undefined
	}

	isFeatureEnabled(...args: any[]): boolean {
		return false
	}

	reloadFeatureFlags(...args: any[]): void {
		// Do nothing
	}

	setPersonProperties(...args: any[]): void {
		// Do nothing
	}

	groupIdentify(...args: any[]): void {
		// Do nothing
	}

	optIn(): void {
		// Do nothing
	}

	optOut(): void {
		// Do nothing
	}

	async shutdown(): Promise<void> {
		// Do nothing
	}

	async shutdownAsync(): Promise<void> {
		// Do nothing
	}
}
