import { User, getAuth, signInWithCustomToken, signOut } from "firebase/auth"
import { initializeApp } from "firebase/app"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { vscode } from "@/utils/vscode"

// Firebase configuration from extension
const firebaseConfig = {
	apiKey: "AIzaSyDcXAaanNgR2_T0dq2oOl5XyKPksYHppVo",
	authDomain: "cline-bot.firebaseapp.com",
	projectId: "cline-bot",
	storageBucket: "cline-bot.firebasestorage.app",
	messagingSenderId: "364369702101",
	appId: "1:364369702101:web:0013885dcf20b43799c65c",
	measurementId: "G-MDPRELSCD1",
}

interface FirebaseAuthContextType {
	user: User | null
	isInitialized: boolean
	signInWithToken: (token: string) => Promise<void>
	handleSignOut: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined)

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	/* on-premises fallback - firebase disabled */
	const [user, setUser] = useState<User | null>(null)
	const [isInitialized, setIsInitialized] = useState(true) // Set to true immediately for on-premises

	// Disabled for on-premises mode
	// const app = initializeApp(firebaseConfig)
	// const auth = getAuth(app)
	const auth = null as any

	// Handle auth state changes - Disabled for on-premises
	useEffect(() => {
		/* on-premises fallback - firebase disabled */
		// No auth state changes in on-premises mode
	}, [])

	const signInWithToken = useCallback(async (token: string) => {
		/* on-premises fallback - firebase disabled */
		console.log("Firebase sign-in disabled in on-premises mode")
		return Promise.resolve()
	}, [])

	// Listen for auth callback from extension
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "authCallback" && message.customToken) {
				signInWithToken(message.customToken)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [signInWithToken])

	const handleSignOut = useCallback(async () => {
		/* on-premises fallback - firebase disabled */
		console.log("Firebase sign-out disabled in on-premises mode")
		return Promise.resolve()
	}, [])

	return (
		<FirebaseAuthContext.Provider value={{ user, isInitialized, signInWithToken, handleSignOut }}>
			{children}
		</FirebaseAuthContext.Provider>
	)
}

export const useFirebaseAuth = () => {
	const context = useContext(FirebaseAuthContext)
	if (context === undefined) {
		throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider")
	}
	return context
}
