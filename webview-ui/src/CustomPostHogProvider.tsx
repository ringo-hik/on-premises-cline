import { type ReactNode } from "react"

// PostHog completely disabled for on-premises deployment
export function CustomPostHogProvider({ children }: { children: ReactNode }) {
	// Simply pass through children without any PostHog functionality
	return <>{children}</>
}
