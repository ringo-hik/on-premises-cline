/* on-premises fallback - feature flags disabled */

// In on-premises mode, all feature flags are disabled
export const useFeatureFlag = (flagName: string): boolean => {
	return false
}
