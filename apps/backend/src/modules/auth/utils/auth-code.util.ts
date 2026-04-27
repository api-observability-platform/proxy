import { randomInt } from "node:crypto";
import { authConstants } from "../auth.constants";

export const generateSixDigitCode = (): string => {
	return String(
		randomInt(
			authConstants.verification.sixDigitCodeMinInclusive,
			authConstants.verification.sixDigitCodeMaxInclusive,
		),
	);
};
