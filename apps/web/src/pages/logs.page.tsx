import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { endpointsApi, logsApi } from "../api/client.api";

type EndpointRow = Awaited<ReturnType<typeof endpointsApi.list>>[number];
type LogsEnvelope = Awaited<ReturnType<typeof logsApi.byEndpoint>>;

export const LogsPage = () => {
	const { endpointId } = useParams<{ endpointId?: string }>();
	const [endpoints, setEndpoints] = useState<EndpointRow[]>([]);
	const [data, setData] = useState<LogsEnvelope | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		endpointsApi.list().then((list) => {
			if (!cancelled) setEndpoints(list);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!endpointId) {
			setData(null);
			setIsLoading(false);
			return;
		}
		let cancelled = false;
		setIsLoading(true);
		logsApi
			.byEndpoint(endpointId, { limit: 50 })
			.then((res) => {
				if (!cancelled) setData(res);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [endpointId]);

	if (!endpointId) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-medium">Request logs</h1>
				<p className="text-white/60">Select an endpoint:</p>
				<ul className="space-y-2">
					{endpoints.map((ep) => (
						<li key={ep.id}>
							<Link
								to={`/logs/${ep.id}`}
								className="underline hover:no-underline"
							>
								{ep.name} ({ep.slug})
							</Link>
						</li>
					))}
				</ul>
				{endpoints.length === 0 && (
					<p className="text-white/60">No endpoints yet.</p>
				)}
			</div>
		);
	}

	if (isLoading) {
		return <p className="text-white/60">Loading logs...</p>;
	}

	const logs = data?.logs ?? [];
	const total = data?.total ?? 0;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-medium">Request logs</h1>
			<p className="text-white/60">{total} total requests</p>
			<div className="overflow-hidden border border-white/20">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/20">
							<th className="px-4 py-3 text-left text-sm font-medium text-white/60">
								Time
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-white/60">
								Method
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-white/60">
								Path
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-white/60">
								Status
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium text-white/60">
								Duration
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/10">
						{logs.map((log: Record<string, unknown>) => (
							<tr key={String(log.id)} className="hover:bg-white/5">
								<td className="px-4 py-3 text-sm text-white/80">
									{log.createdAt
										? new Date(String(log.createdAt)).toLocaleString()
										: "—"}
								</td>
								<td className="px-4 py-3 font-mono text-sm text-white/80">
									{String(log.method)}
								</td>
								<td className="px-4 py-3 font-mono text-sm text-white/60 truncate max-w-[300px]">
									{String(log.path)}
								</td>
								<td className="px-4 py-3 text-sm text-white/80">
									{String(log.responseStatus ?? "—")}
								</td>
								<td className="px-4 py-3 text-sm text-white/60">
									{log.durationMs != null ? `${log.durationMs}ms` : "—"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
