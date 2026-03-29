import { ENDPOINT_PROTOCOLS } from "@proxy-server/shared";
import { type FormEvent, useState } from "react";
import { EndpointsTableComponent } from "@/components/endpoints-table.component";
import { ButtonComponent } from "@/components/ui/button.component";
import { CardComponent } from "@/components/ui/card.component";
import { InputComponent } from "@/components/ui/input.component";
import { LoadingSkeletonComponent } from "@/components/ui/loading-skeleton.component";
import { useCreateEndpoint, useEndpointsList } from "@/hooks/endpoints.hooks";

export const EndpointsPage = () => {
	const [name, setName] = useState("");
	const [targetUrl, setTargetUrl] = useState("");
	const [protocol, setProtocol] =
		useState<(typeof ENDPOINT_PROTOCOLS)[number]>("HTTP");
	const [rateMax, setRateMax] = useState("");
	const [rateWindowSec, setRateWindowSec] = useState("");
	const [transformJson, setTransformJson] = useState("");
	const [tcpPort, setTcpPort] = useState("");
	const [error, setError] = useState("");
	const {
		data: listData,
		isLoading,
		isError,
		error: listError,
	} = useEndpointsList();
	const endpoints = listData?.items ?? [];
	const createMutation = useCreateEndpoint();
	const createFormErrorId = "create-endpoint-form-error";

	const handleNameChange = (value: string) => {
		setName(value);
	};

	const handleTargetUrlChange = (value: string) => {
		setTargetUrl(value);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		let transformRules: unknown;
		if (transformJson.trim()) {
			try {
				transformRules = JSON.parse(transformJson) as unknown;
				if (!Array.isArray(transformRules)) {
					setError("Transform rules must be a JSON array");
					return;
				}
			} catch {
				setError("Invalid JSON for transform rules");
				return;
			}
		}
		const rateLimitConfig =
			rateMax.trim() && rateWindowSec.trim()
				? {
						maxRequests: Number.parseInt(rateMax, 10),
						windowSeconds: Number.parseInt(rateWindowSec, 10),
					}
				: undefined;
		if (
			rateLimitConfig &&
			(!Number.isFinite(rateLimitConfig.maxRequests) ||
				!Number.isFinite(rateLimitConfig.windowSeconds) ||
				rateLimitConfig.maxRequests < 1 ||
				rateLimitConfig.windowSeconds < 1)
		) {
			setError("Invalid rate limit numbers");
			return;
		}
		const tcpProxyPortParsed = tcpPort.trim()
			? Number.parseInt(tcpPort, 10)
			: undefined;
		if (
			tcpProxyPortParsed !== undefined &&
			!Number.isFinite(tcpProxyPortParsed)
		) {
			setError("Invalid TCP port");
			return;
		}
		try {
			await createMutation.mutateAsync({
				name,
				targetUrl,
				protocol,
				...(rateLimitConfig ? { rateLimitConfig } : {}),
				...(transformRules ? { transformRules: transformRules as never } : {}),
				...(protocol === "TCP" && tcpProxyPortParsed
					? { tcpProxyPort: tcpProxyPortParsed }
					: {}),
			});
			setName("");
			setTargetUrl("");
			setProtocol("HTTP");
			setRateMax("");
			setRateWindowSec("");
			setTransformJson("");
			setTcpPort("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create");
		}
	};

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-medium">Endpoints</h1>

			<CardComponent>
				<h2 className="mb-4 text-lg font-medium">Create endpoint</h2>
				<form onSubmit={handleSubmit} className="space-y-4" noValidate>
					{error ? (
						<div
							id={createFormErrorId}
							className="border border-white/40 p-3 text-white/80"
							role="alert"
						>
							{error}
						</div>
					) : null}
					<InputComponent
						label="Name"
						type="text"
						name="name"
						value={name}
						onChange={(e) => handleNameChange(e.target.value)}
						placeholder="e.g. Stripe Webhook"
						required
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? createFormErrorId : undefined}
					/>
					<InputComponent
						label="Target URL"
						type="url"
						name="targetUrl"
						value={targetUrl}
						onChange={(e) => handleTargetUrlChange(e.target.value)}
						placeholder="https://api.example.com/webhook"
						required
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? createFormErrorId : undefined}
					/>
					<div className="space-y-2">
						<label htmlFor="protocol" className="block text-sm text-white/80">
							Protocol
						</label>
						<select
							id="protocol"
							name="protocol"
							value={protocol}
							onChange={(e) =>
								setProtocol(
									e.target.value as (typeof ENDPOINT_PROTOCOLS)[number],
								)
							}
							className="w-full border border-white/30 bg-black px-3 py-2 text-white"
						>
							{ENDPOINT_PROTOCOLS.map((p) => (
								<option key={p} value={p}>
									{p}
								</option>
							))}
						</select>
					</div>
					{protocol === "TCP" ? (
						<InputComponent
							label="TCP listen port"
							type="number"
							name="tcpPort"
							value={tcpPort}
							onChange={(e) => setTcpPort(e.target.value)}
							placeholder="19000"
						/>
					) : null}
					<div className="grid gap-4 md:grid-cols-2">
						<InputComponent
							label="Rate limit max requests (optional)"
							type="number"
							name="rateMax"
							value={rateMax}
							onChange={(e) => setRateMax(e.target.value)}
							placeholder="100"
						/>
						<InputComponent
							label="Rate limit window seconds (optional)"
							type="number"
							name="rateWindow"
							value={rateWindowSec}
							onChange={(e) => setRateWindowSec(e.target.value)}
							placeholder="60"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="transformRules" className="text-sm text-white/80">
							Transform rules JSON (optional array)
						</label>
						<textarea
							id="transformRules"
							name="transformRules"
							value={transformJson}
							onChange={(e) => setTransformJson(e.target.value)}
							rows={4}
							placeholder='[{"type":"ADD_HEADER","phase":"request","name":"X-Test","value":"1"}]'
							className="w-full border border-white/30 bg-black px-3 py-2 font-mono text-sm text-white"
						/>
					</div>
					<ButtonComponent type="submit" disabled={createMutation.isPending}>
						{createMutation.isPending ? "Creating..." : "Create"}
					</ButtonComponent>
				</form>
			</CardComponent>

			<section aria-labelledby="ep-list-heading">
				<h2 id="ep-list-heading" className="mb-4 text-lg font-medium">
					Your endpoints ({listData?.total ?? endpoints.length})
				</h2>
				{isError ? (
					<p className="text-red-400/90" role="alert">
						{listError instanceof Error
							? listError.message
							: "Failed to load endpoints"}
					</p>
				) : isLoading ? (
					<LoadingSkeletonComponent rows={5} className="max-w-3xl" />
				) : endpoints.length === 0 ? (
					<p className="text-white/60">No endpoints yet.</p>
				) : (
					<EndpointsTableComponent
						endpoints={endpoints}
						proxyUrlColumn="slug-only"
					/>
				)}
			</section>
		</div>
	);
};
