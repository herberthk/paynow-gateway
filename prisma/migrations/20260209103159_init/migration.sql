-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- CreateEnum
CREATE TYPE "user_privilege" AS ENUM ('none', 'admin', 'super_admin');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "tel" VARCHAR(255),
    "password" VARCHAR(255),
    "profile" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "ispaid" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMPTZ(6),
    "push_token" VARCHAR(255),
    "push_token_error" TEXT,
    "app_version" VARCHAR(255),
    "os" VARCHAR(255),
    "device" VARCHAR(255),
    "remember_token" VARCHAR(100),
    "otp" VARCHAR(255),
    "otp_expiry" TIMESTAMPTZ(6),
    "apple_user" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "privilege" "user_privilege" DEFAULT 'none',
    "is_ghost_user" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "idx_31735_primary" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_31735_users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31735_tel" ON "users"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31735_apple_user" ON "users"("apple_user");

-- CreateIndex
CREATE INDEX "idx_user_preveledge" ON "users"("privilege");

-- CreateIndex
CREATE INDEX "idx_users_covering" ON "users"("id", "name", "profile");

-- CreateIndex
CREATE INDEX "idx_users_id" ON "users"("id");

-- CreateIndex
CREATE INDEX "idx_users_name" ON "users"("name");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_name_trgm_idx" ON "users" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "users_os_status_idx" ON "users"("os", "status");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");
