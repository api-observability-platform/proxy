import { useQuery } from "@tanstack/react-query";
import { logsApi } from "@/api/client.api";
import { useCanQueryProtectedApi } from "@/contexts/auth.context";

const LOGS_POLL_MS = 10_000;

const logsQueryKeys = {
	byEndpoint: (
		endpointId: string | undefined,
		params?: { limit?: number; offset?: number },
	) => ["logs", "endpoint", endpointId, params] as const,
};

export function useLogsByEndpoint(
	endpointId: string | undefined,
	params?: { limit?: number; offset?: number },
) {
	const canQuery = useCanQueryProtectedApi();
	return useQuery({
		queryKey: logsQueryKeys.byEndpoint(endpointId, params),
		queryFn: () => logsApi.byEndpoint(endpointId!, params),
		enabled: canQuery && Boolean(endpointId),
		staleTime: 5_000,
		refetchOnWindowFocus: true,
		refetchInterval: endpointId ? LOGS_POLL_MS : false,
	});
}
