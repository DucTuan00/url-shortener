-- CreateTable
CREATE TABLE "urls" (
    "id" BIGSERIAL NOT NULL,
    "short_code" VARCHAR(10) NOT NULL,
    "original_url" TEXT NOT NULL,
    "custom_alias" VARCHAR(50),
    "user_id" BIGINT,
    "click_count" BIGINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" BIGSERIAL NOT NULL,
    "url_id" BIGINT NOT NULL,
    "clicked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "referer" TEXT,
    "country" VARCHAR(2),
    "city" VARCHAR(100),
    "device_type" VARCHAR(20),
    "browser" VARCHAR(50),
    "os" VARCHAR(50),

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_short_code_key" ON "urls"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "urls_custom_alias_key" ON "urls"("custom_alias");

-- CreateIndex
CREATE INDEX "urls_short_code_idx" ON "urls"("short_code");

-- CreateIndex
CREATE INDEX "urls_user_id_idx" ON "urls"("user_id");

-- CreateIndex
CREATE INDEX "urls_expires_at_idx" ON "urls"("expires_at");

-- CreateIndex
CREATE INDEX "clicks_url_id_idx" ON "clicks"("url_id");

-- CreateIndex
CREATE INDEX "clicks_clicked_at_idx" ON "clicks"("clicked_at");

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
