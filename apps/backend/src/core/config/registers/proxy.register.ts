import type { ProxyType } from "../types/proxy.type";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const";

export const proxyRegister = registerAs(configKeyConst.proxy, (): ProxyType => {
	const baseDomain = process.env.PROXY_BASE_DOMAIN || "";

	return {
		baseDomain,
	};
});
