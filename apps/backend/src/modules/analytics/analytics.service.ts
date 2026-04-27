import type {
	AnalyticsBreakdown,
	AnalyticsSummary,
	AnalyticsTimeseriesPoint,
} from "@proxy-server/shared";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { analyticsConstants } from "./analytics.constants";

@Injectable()
export class AnalyticsService {
	constructor(
		@Inject(PrismaService) private readonly prismaService: PrismaService,
	) {}

	private async ensureEndpointAccess(
		endpointId: string,
		userId: string,
	): Promise<{ id: string }> {
		const endpoint = await this.prismaService.endpoint.findFirst({
			where: { id: endpointId, userId },
		});
		if (!endpoint) {
			throw new ForbiddenException("Access denied");
		}
		return endpoint;
	}

	public async getSummary(
		endpointId: string,
		userId: string,
	): Promise<AnalyticsSummary> {
		await this.ensureEndpointAccess(endpointId, userId);
		const now = new Date();
		const last24h = new Date(now.getTime() - analyticsConstants.last_24HMs);
		const [total, last24hCount, avgLatency, errorCount, successCount] =
			await Promise.all([
				this.prismaService.requestLog.count({ where: { endpointId } }),
				this.prismaService.requestLog.count({
					where: { endpointId, createdAt: { gte: last24h } },
				}),
				this.prismaService.requestLog.aggregate({
					where: { endpointId, durationMs: { not: null } },
					_avg: { durationMs: true },
				}),
				this.prismaService.requestLog.count({
					where: {
						endpointId,
						OR: [
							{
								responseStatus: {
									gte: analyticsConstants.httpStatusServerErrorThreshold,
								},
							},
							{ responseStatus: null },
						],
					},
				}),
				this.prismaService.requestLog.count({
					where: {
						endpointId,
						responseStatus: {
							gte: analyticsConstants.httpStatusSuccessMin,
							lt: analyticsConstants.httpStatusSuccessMax,
						},
					},
				}),
			]);
		const totalForUptime = total || analyticsConstants.uptimeDivisorFallback;
		const uptimePercent = ((successCount / totalForUptime) * 100).toFixed(2);
		const errorRate = ((errorCount / totalForUptime) * 100).toFixed(2);
		return {
			totalRequests: total,
			requestsLast24h: last24hCount,
			avgLatencyMs: Math.round(avgLatency._avg.durationMs ?? 0),
			uptimePercent: parseFloat(uptimePercent),
			errorRate: parseFloat(errorRate),
		};
	}

	public async getTimeseries(
		endpointId: string,
		userId: string,
		options: { bucket: "hour" | "day"; limit?: number },
	): Promise<AnalyticsTimeseriesPoint[]> {
		await this.ensureEndpointAccess(endpointId, userId);
		const limit = Math.min(
			options.limit ?? analyticsConstants.defaultTimeseriesLimit,
			analyticsConstants.maxTimeseriesLimit,
		);
		const bucket = options.bucket ?? "hour";
		const truncUnit = bucket === "hour" ? "hour" : "day";
		type Row = {
			bucket: Date;
			requests: bigint;
			avgLatencyMs: bigint | null;
		};
		const rows = await this.prismaService.$queryRawUnsafe<Row[]>(
			`SELECT * FROM (
				SELECT date_trunc($1::text, "created_at") AS bucket,
					COUNT(*)::bigint AS requests,
					COALESCE(ROUND(AVG("duration_ms"))::bigint, 0) AS "avgLatencyMs"
				FROM "request_logs"
				WHERE "endpoint_id" = $2
				GROUP BY 1
				ORDER BY 1 DESC
				LIMIT $3
			) sub ORDER BY 1 ASC`,
			truncUnit,
			endpointId,
			limit,
		);
		const prefixLen =
			bucket === "hour"
				? analyticsConstants.isoHourBucketPrefixLength
				: analyticsConstants.isoDayBucketPrefixLength;
		return rows.map((r) => ({
			bucket: r.bucket.toISOString().slice(0, prefixLen),
			requests: Number(r.requests),
			avgLatencyMs: Number(r.avgLatencyMs ?? 0),
		}));
	}

	public async getBreakdown(
		endpointId: string,
		userId: string,
	): Promise<AnalyticsBreakdown> {
		await this.ensureEndpointAccess(endpointId, userId);
		const [byMethod, byStatus] = await Promise.all([
			this.prismaService.requestLog.groupBy({
				by: ["method"],
				where: { endpointId },
				_count: { id: true },
			}),
			this.prismaService.requestLog.groupBy({
				by: ["responseStatus"],
				where: { endpointId },
				_count: { id: true },
			}),
		]);
		return {
			byMethod: byMethod.map((m) => ({
				method: m.method,
				count: m._count.id,
			})),
			byStatus: byStatus
				.filter((s) => s.responseStatus != null)
				.map((s) => ({
					status: s.responseStatus as number,
					count: s._count.id,
				})),
		};
	}
}
