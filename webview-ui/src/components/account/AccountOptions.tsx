import { memo } from "react"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"

const AccountOptions = () => {
	/* on-premises fallback - account login disabled */
	return null // This component doesn't render anything

	// Original code disabled for on-premises
	const handleAccountClick = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	// Call handleAccountClick immediately when component mounts
	handleAccountClick()

	return null // This component doesn't render anything
}

export default memo(AccountOptions)
