// Feature flags disabled for on-premises deployment
export const useFeatureFlag = (flagName: string): boolean => {
	// Always return false for all feature flags in offline mode
	return false
}
