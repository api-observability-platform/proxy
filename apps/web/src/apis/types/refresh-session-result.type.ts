import type { User } from "@proxy-server/shared";

type RefreshSessionResultType = { accessToken: string; user: User } | null;

export type { RefreshSessionResultType };
