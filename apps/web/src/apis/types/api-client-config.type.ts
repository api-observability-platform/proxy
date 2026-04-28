import type { User } from "@proxy-server/shared";

type ApiClientConfigType = {
	getAccessToken: () => string | null;
	setSession: (accessToken: string | null, user: User | null) => void;
	onSessionExpired: () => void;
};

export type { ApiClientConfigType };
