import type { SlugType } from "../types/slug.type";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const";

export const slugRegister = registerAs(configKeyConst.slug, (): SlugType => {
	const slugAlphabet = process.env.SLUG_ALPHABET || "";
	const slugLength = Number(process.env.SLUG_LENGTH) || 0;
	const slugMaxAttempts = Number(process.env.SLUG_MAX_ATTEMPTS) || 0;

	return { slugAlphabet, slugLength, slugMaxAttempts };
});
