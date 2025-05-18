import { type ReactNode } from "react"
import { PostHogProvider } from "posthog-js/react"
import posthog from "posthog-js"
/* on-premises fallback - posthog disabled */

// Create dummy posthog object for on-premises versions
const dummyPosthog = {
	init: () => {},
	opt_in_capturing: () => {},
	opt_out_capturing: () => {},
	identify: () => {},
	capture: () => {},
	register: () => {},
	isFeatureEnabled: () => false,
	getFeatureFlag: () => null,
} as unknown as typeof posthog

export function CustomPostHogProvider({ children }: { children: ReactNode }) {
	// No initialization needed for on-premises version
	return <PostHogProvider client={dummyPosthog}>{children}</PostHogProvider>
}
