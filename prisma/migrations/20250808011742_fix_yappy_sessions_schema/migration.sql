-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REVERSED');

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "number" TEXT,
    "registration_date" TIMESTAMP(3),
    "payment_date" TIMESTAMP(3),
    "cut_off_date" DATE,
    "type" TEXT,
    "category" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "partial_amount" DOUBLE PRECISION,
    "tip" DOUBLE PRECISION,
    "tax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fee_amount" DOUBLE PRECISION,
    "fee_currency" TEXT,
    "description" TEXT,
    "bill_description" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "debitor_alias" TEXT,
    "debitor_complete_name" TEXT,
    "debitor_alias_type" TEXT,
    "debitor_bank_name" TEXT,
    "creditor_alias" TEXT,
    "creditor_complete_name" TEXT,
    "creditor_alias_type" TEXT,
    "creditor_bank_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "qr_code_data" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."yappy_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'OPEN',
    "open_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yappy_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_uuid_key" ON "public"."payments"("uuid");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "public"."payments"("created_at");

-- CreateIndex
CREATE INDEX "payments_uuid_idx" ON "public"."payments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "yappy_sessions_token_key" ON "public"."yappy_sessions"("token");

-- CreateIndex
CREATE INDEX "yappy_sessions_token_idx" ON "public"."yappy_sessions"("token");

-- CreateIndex
CREATE INDEX "yappy_sessions_state_idx" ON "public"."yappy_sessions"("state");

-- CreateIndex
CREATE INDEX "yappy_sessions_code_idx" ON "public"."yappy_sessions"("code");
