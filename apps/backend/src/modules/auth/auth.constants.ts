export const authConstants = {
	crypto: {
		codeTtlMs: 15 * 60 * 1_000,
		saltRounds: 10,
	},
	throttle: {
		signIn: { limit: 10, ttlMs: 60_000 },
		signUp: { limit: 5, ttlMs: 60_000 },
		verifyEmail: { limit: 20, ttlMs: 60_000 },
		resendVerification: { limit: 3, ttlMs: 60_000 },
		forgotPassword: { limit: 3, ttlMs: 60_000 },
		resetPassword: { limit: 10, ttlMs: 60_000 },
	},
	verification: {
		sixDigitCodeMinInclusive: 100_000,
		sixDigitCodeMaxInclusive: 1_000_000,
	},
	refresh: {
		cookieName: "refresh-token",
		tokenNanoidLength: 64,
	},
};
