-- CreateEnum
CREATE TYPE "EndpointProtocol" AS ENUM ('HTTP', 'WEBSOCKET', 'GRAPHQL', 'GRPC', 'SSE', 'TCP');

-- AlterTable
ALTER TABLE "endpoints" ADD COLUMN "protocol" "EndpointProtocol" NOT NULL DEFAULT 'HTTP';
ALTER TABLE "endpoints" ADD COLUMN "rate_limit_config" JSONB;
ALTER TABLE "endpoints" ADD COLUMN "transform_rules" JSONB;
ALTER TABLE "endpoints" ADD COLUMN "tcp_proxy_port" INTEGER;

-- AlterTable
ALTER TABLE "request_logs" ADD COLUMN "protocol" TEXT NOT NULL DEFAULT 'HTTP';
ALTER TABLE "request_logs" ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "report_schedules" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_integration_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_integration_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_integration_links_user_id_provider_key" ON "user_integration_links"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "notification_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_integration_links" ADD CONSTRAINT "user_integration_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
