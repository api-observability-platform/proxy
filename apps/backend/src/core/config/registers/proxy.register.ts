import type { ProxyType } from "../types/proxy.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const proxyRegister = registerAs(ConfigKey.Proxy, (): ProxyType => {
	const baseDomain = process.env.PROXY_BASE_DOMAIN || "";

	return {
		baseDomain,
	};
});
