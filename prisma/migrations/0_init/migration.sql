-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "labor_category_enum" AS ENUM ('unspecialized', 'specialized', 'family_assistant');

-- CreateEnum
CREATE TYPE "ledger_type" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "line_type_enum" AS ENUM ('first_line', 'second_line');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('unread', 'read');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('pending', 'processing', 'received');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'successful', 'failed');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('reviewed', 'pending');

-- CreateEnum
CREATE TYPE "user_privilege" AS ENUM ('none', 'admin', 'super_admin');

-- CreateTable
CREATE TABLE "account_history" (
    "id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "account_ledger_id" BIGINT NOT NULL,
    "balance_before" DECIMAL(14,2) NOT NULL,
    "balance_after" DECIMAL(14,2) NOT NULL,
    "narrative" VARCHAR(150) NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_30914_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_ledgers" (
    "id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'UGX',
    "type" "ledger_type" NOT NULL,
    "description" VARCHAR(255),
    "payment_ref" VARCHAR(255),
    "status" SMALLINT NOT NULL DEFAULT 0,
    "is_charge" INTEGER,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "account_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_withdraw_requests" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "account_ledger_id" BIGINT NOT NULL,
    "recipient_number" VARCHAR(255) NOT NULL,
    "otp" VARCHAR(255) NOT NULL,
    "otp_expiry" TIMESTAMPTZ(6),
    "status" SMALLINT NOT NULL DEFAULT 0,
    "checks" INTEGER NOT NULL DEFAULT 0,
    "account_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_30929_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "account_type" VARCHAR(40) DEFAULT 'DEFAULT',
    "account_number" VARCHAR(20),
    "catid" BIGINT,
    "bizid" BIGINT,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'UGX',
    "withdraw_pin" VARCHAR(100),
    "start_date" DATE,
    "maturity_date" DATE,
    "duration_months" INTEGER,
    "early_withdrawal_allowed" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_30938_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_offered" (
    "id" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(255),
    "about" TEXT,
    "features" TEXT,
    "benefits" TEXT,
    "qualify" TEXT,
    "requirements" TEXT,
    "percentage" VARCHAR(255),
    "createdon" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "idx_30881_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "ip_address" VARCHAR(255),
    "action" VARCHAR(255),
    "method" VARCHAR(255),
    "path" VARCHAR(255),
    "description" TEXT,
    "platform" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_30947_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat1" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255),
    "price" VARCHAR(255) NOT NULL,
    "size" VARCHAR(255),
    "colors" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255),
    "instock" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "date_created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255),

    CONSTRAINT "idx_30954_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat2" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "price" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "ram" VARCHAR(255) NOT NULL,
    "memory" VARCHAR(255) NOT NULL,
    "camera" VARCHAR(255) NOT NULL,
    "color" VARCHAR(255) NOT NULL,
    "instock" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255),

    CONSTRAINT "idx_30960_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat3" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "price" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "year" VARCHAR(255) NOT NULL,
    "transmission_type" VARCHAR(255),
    "m_condition" VARCHAR(255),
    "no_of_cylinders" VARCHAR(255) NOT NULL,
    "colors" VARCHAR(255) NOT NULL,
    "instock" VARCHAR(255) NOT NULL,
    "horse_power" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255),

    CONSTRAINT "idx_30966_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat4" (
    "id" SERIAL NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "buying" VARCHAR(255) NOT NULL,
    "selling" VARCHAR(255) NOT NULL,
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255),

    CONSTRAINT "idx_30972_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat5" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "product_price" VARCHAR(255) NOT NULL,
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255),

    CONSTRAINT "idx_30978_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat6" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "price" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "no_of_rooms" VARCHAR(255) NOT NULL,
    "posted_on" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER,

    CONSTRAINT "idx_30984_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "add_items_cat7" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "price" VARCHAR(255) NOT NULL,
    "length" VARCHAR(255) NOT NULL,
    "width" VARCHAR(255) NOT NULL,
    "posted_on" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER,

    CONSTRAINT "idx_30990_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advert_clicks" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "advert_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "catid" VARCHAR(255),
    "bizid" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_30997_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advert_prices" (
    "id" BIGSERIAL NOT NULL,
    "ad_type" VARCHAR(255) NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(17,2) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31004_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advert_views" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "advert_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "catid" VARCHAR(255),
    "bizid" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31011_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adverts" (
    "id" SERIAL NOT NULL,
    "payment_id" BIGINT,
    "payment_ref" VARCHAR(255),
    "businessname" VARCHAR(255) NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "status" INTEGER NOT NULL DEFAULT 1,
    "latitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "longitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "ad_type" VARCHAR(255),
    "price" DECIMAL(17,2),
    "end_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31017_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank" (
    "id" INTEGER NOT NULL,
    "category_id" VARCHAR(255),
    "bank_name" VARCHAR(255),
    "profile_image" VARCHAR(255),
    "products" VARCHAR(255),
    "loan_packages" VARCHAR(255),
    "loan_interest_rates" VARCHAR(255),
    "special_offers" VARCHAR(255),
    "location_coverage" VARCHAR(255),
    "latitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "longitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "user_id" VARCHAR(255) NOT NULL,
    "contacts" VARCHAR(255),
    "emails" VARCHAR(255),
    "country" VARCHAR(255) DEFAULT 'UG',
    "website" VARCHAR(255),
    "open_account_link" VARCHAR(255),
    "status" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31026_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_branch_photos" (
    "id" BIGSERIAL NOT NULL,
    "bank_branch_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31038_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_branches" (
    "id" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "catid" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "officeline" VARCHAR(255) NOT NULL,
    "mon_fri_from" TIME(6) NOT NULL,
    "mon_fri_to" TIME(6) NOT NULL,
    "sat_from" TIME(6) NOT NULL,
    "sat_to" TIME(6) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdon" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector,

    CONSTRAINT "idx_30888_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "best_performers" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "combination" VARCHAR(255),
    "level" VARCHAR(255) NOT NULL,
    "aggregate" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31043_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_blog_comments" (
    "id" BIGSERIAL NOT NULL,
    "blocker_id" BIGINT NOT NULL,
    "blog_comment_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31050_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_blog_posts" (
    "id" BIGSERIAL NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "blocker_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31055_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_comments" (
    "id" BIGSERIAL NOT NULL,
    "blocker_id" BIGINT NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31060_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "parent_id" BIGINT,
    "comment" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31065_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_images" (
    "id" BIGSERIAL NOT NULL,
    "blog_post_id" BIGINT,
    "image" VARCHAR(255),
    "blog_comment_id" INTEGER,
    "image_url" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "image_hash" TEXT,

    CONSTRAINT "idx_31073_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_likes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "blog_post_id" BIGINT,
    "comment_id" BIGINT,
    "status" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31080_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "body" TEXT NOT NULL,
    "bizid" VARCHAR(255) NOT NULL,
    "catid" VARCHAR(255) NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "forex_items" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "location" geography,

    CONSTRAINT "idx_31085_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_shares" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31096_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_videos" (
    "id" BIGSERIAL NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "video" VARCHAR(255) NOT NULL,
    "bizid" VARCHAR(255),
    "catid" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31102_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_views" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31109_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boda_accidents" (
    "id" BIGSERIAL NOT NULL,
    "boda_id" BIGINT NOT NULL,
    "boda_association_id" BIGINT NOT NULL,
    "accident_cause" VARCHAR(255) NOT NULL,
    "accident_severity" VARCHAR(255) NOT NULL,
    "injuries" INTEGER NOT NULL DEFAULT 0,
    "details" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31114_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boda_associations" (
    "id" BIGSERIAL NOT NULL,
    "logo" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "contact1" VARCHAR(255) NOT NULL,
    "contact2" VARCHAR(255) NOT NULL,
    "latitude" VARCHAR(255),
    "longitude" VARCHAR(255),
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31122_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boda_external_members" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "boda_association_id" BIGINT NOT NULL,
    "profile" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "pay_number" VARCHAR(15) NOT NULL,
    "phone_number" VARCHAR(100) NOT NULL,
    "alt_phone_number" VARCHAR(100),
    "district" VARCHAR(100) NOT NULL,
    "sub_county" VARCHAR(100),
    "parish" VARCHAR(100),
    "village" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31130_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boda_interactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "boda_id" BIGINT NOT NULL,
    "interaction_type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31137_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boda_stage_leaders" (
    "id" BIGSERIAL NOT NULL,
    "boda_association_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "stage" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31142_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boda_thefts" (
    "id" BIGSERIAL NOT NULL,
    "boda_id" BIGINT NOT NULL,
    "boda_association_id" BIGINT NOT NULL,
    "mode_of_theft" VARCHAR(255) NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31149_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bodaboda" (
    "id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "town_of_service" VARCHAR(255),
    "stage_center" VARCHAR(255),
    "names" VARCHAR(255),
    "mot_no" VARCHAR(255),
    "tel" VARCHAR(255),
    "email" VARCHAR(255),
    "image_of_driver" VARCHAR(255),
    "sex" VARCHAR(10),
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "district" VARCHAR(255),
    "sub_county" VARCHAR(255),
    "village" VARCHAR(255),
    "national_id" VARCHAR(255),
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "status" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" VARCHAR(255) NOT NULL,
    "pay_number" VARCHAR(255),
    "merchant_code" VARCHAR(255),
    "user_id" BIGINT,
    "boda_association_id" BIGINT,
    "boda_stage_leader_id" BIGINT,
    "boda_number" VARCHAR(50),
    "next_of_kin_name" VARCHAR(100),
    "next_of_kin_contact" VARCHAR(100),
    "membership_fee" DECIMAL(10,2),
    "membership_expiry" DATE,
    "has_expired" BOOLEAN NOT NULL DEFAULT true,
    "details" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "idx_31155_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT,
    "payment_id" BIGINT,
    "payment_ref" VARCHAR(255),
    "payment_no" VARCHAR(255),
    "customer_id" VARCHAR(255),
    "amount" VARCHAR(255),
    "route_id" VARCHAR(255),
    "bus_id" BIGINT,
    "seatnumber" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 0,
    "user_verified" BOOLEAN NOT NULL DEFAULT false,
    "date_on_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tdate" DATE NOT NULL,
    "depature" VARCHAR(255),
    "weight" VARCHAR(11),
    "external_reference" VARCHAR(255),

    CONSTRAINT "idx_31168_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus" (
    "id" INTEGER NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "category_id" VARCHAR(255) NOT NULL,
    "contact_numbers" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "latitude" VARCHAR(255) DEFAULT '0',
    "longitude" VARCHAR(255) DEFAULT '0',
    "profile_image" VARCHAR(255),
    "about_bus" TEXT,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "status" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "date_on_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector,

    CONSTRAINT "idx_31176_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus_stops" (
    "id" BIGSERIAL NOT NULL,
    "bus_id" BIGINT NOT NULL,
    "route_id" BIGINT NOT NULL,
    "bus_stop" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31188_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "cache_locks" (
    "key" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "car_hire" (
    "id" INTEGER NOT NULL,
    "categorie_id" INTEGER,
    "town_of_service" VARCHAR(255),
    "stage_center" VARCHAR(255),
    "driver_names" VARCHAR(255),
    "vehicle_no" VARCHAR(255),
    "sex" VARCHAR(255),
    "images" TEXT,
    "district" VARCHAR(255),
    "sub_county" VARCHAR(255),
    "village" VARCHAR(255),
    "national_id" VARCHAR(255),
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telephone" VARCHAR(255),
    "email" VARCHAR(255),
    "owner_id" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "status" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "subcat" VARCHAR(255) NOT NULL DEFAULT 'Cars',
    "pay_number" VARCHAR(255),
    "merchant_code" VARCHAR(255),
    "details" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "idx_31192_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casual_labor" (
    "id" INTEGER NOT NULL,
    "user_id" BIGINT NOT NULL,
    "categorie_id" INTEGER NOT NULL,
    "home_town" VARCHAR(255) NOT NULL,
    "names" VARCHAR(255) NOT NULL,
    "sex" VARCHAR(255) NOT NULL,
    "age" INTEGER,
    "birth_date" DATE,
    "pictures" TEXT,
    "education_level" VARCHAR(255) NOT NULL,
    "village" VARCHAR(255) NOT NULL,
    "parish" VARCHAR(255) NOT NULL,
    "sub_county" VARCHAR(255) NOT NULL,
    "national_id" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "profession" VARCHAR(255),
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tel" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "category" "labor_category_enum",

    CONSTRAINT "idx_31205_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255),
    "french" VARCHAR(255),
    "position" INTEGER NOT NULL DEFAULT 1,
    "url" VARCHAR(255),
    "description" TEXT,
    "dcfa" INTEGER NOT NULL DEFAULT 8370,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_on" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "posted_by" VARCHAR(255),
    "modified_by" VARCHAR(255),
    "status" INTEGER,

    CONSTRAINT "idx_31216_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatid" (
    "id" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,

    CONSTRAINT "idx_31225_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_photos" (
    "id" BIGSERIAL NOT NULL,
    "classroom_id" BIGINT NOT NULL,
    "photo" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31229_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "classrooms" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31234_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_images" (
    "id" BIGSERIAL NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31239_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31244_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" BIGSERIAL NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "comment" TEXT NOT NULL,
    "createdon" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "idx_30898_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" VARCHAR(255) NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31250_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "catid" INTEGER,
    "bizid" INTEGER,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31258_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees_structures" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "class" VARCHAR(255) NOT NULL,
    "admission" DECIMAL(18,2),
    "day" DECIMAL(18,2),
    "boarding" DECIMAL(18,2),
    "currency" VARCHAR(255) NOT NULL DEFAULT 'UGX',
    "fees" VARCHAR(255) DEFAULT '0.00',
    "other" VARCHAR(255) DEFAULT '0.00',
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31263_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "follower_id" BIGINT,
    "catid" INTEGER,
    "bizid" INTEGER,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "hidden" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31273_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galarry" (
    "id" INTEGER NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "bizid" VARCHAR(255) NOT NULL,
    "catid" VARCHAR(255) NOT NULL,
    "item_id" INTEGER,
    "product_id" BIGINT,
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "idx_31278_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_business" (
    "id" SERIAL NOT NULL,
    "categorie_id" INTEGER,
    "owner_id" VARCHAR(255),
    "company_name" VARCHAR(255),
    "district" VARCHAR(255),
    "physical_address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "imageurl" VARCHAR(255),
    "details" TEXT,
    "tel" VARCHAR(255),
    "email" VARCHAR(255),
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "website" VARCHAR(255),
    "status" INTEGER NOT NULL DEFAULT 1,
    "verified" SMALLINT NOT NULL DEFAULT 0,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subcat" VARCHAR(255),

    CONSTRAINT "idx_31285_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gest_users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "password_hash" VARCHAR(255),
    "date_of_birth" DATE,
    "phone" VARCHAR(20),
    "address" TEXT,
    "city" VARCHAR(50),
    "country" VARCHAR(50),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gest_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gov_leaders" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "img_url" VARCHAR(255) NOT NULL,
    "post" VARCHAR(255) NOT NULL,
    "year_from" VARCHAR(255) NOT NULL,
    "year_to" VARCHAR(255) NOT NULL,
    "p_party" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "proffession" VARCHAR(255) NOT NULL,
    "marital_status" VARCHAR(255) NOT NULL,
    "religion" VARCHAR(255) NOT NULL,
    "dob" DATE NOT NULL,
    "contact" VARCHAR(255) NOT NULL,
    "biography" TEXT NOT NULL,
    "status" INTEGER DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "subcat" VARCHAR(255),
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',

    CONSTRAINT "idx_31296_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduate" (
    "id" INTEGER NOT NULL,
    "categorie_id" INTEGER NOT NULL,
    "names" VARCHAR(255) NOT NULL,
    "profile_pic" VARCHAR(255) NOT NULL,
    "sex" VARCHAR(255) NOT NULL,
    "home_town" VARCHAR(255) NOT NULL,
    "proffession" VARCHAR(255) NOT NULL,
    "details" TEXT NOT NULL,
    "tel" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "owner_id" VARCHAR(255) NOT NULL,
    "subcat" VARCHAR(255) NOT NULL DEFAULT 'Accounting & Finance',
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "search_vector" tsvector GENERATED ALWAYS AS (
  (setweight(to_tsvector('english'::regconfig, (COALESCE(names, ''::character varying))::text), 'A'::"char") || 
   setweight(to_tsvector('english'::regconfig, (COALESCE(proffession, ''::character varying))::text), 'B'::"char") || 
   setweight(to_tsvector('english'::regconfig, COALESCE(details, ''::text)), 'C'::"char") || 
   setweight(to_tsvector('english'::regconfig, (COALESCE(tel, ''::character varying))::text), 'D'::"char"))
) STORED,

    CONSTRAINT "idx_31305_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_bookings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "room_id" BIGINT NOT NULL,
    "catid" BIGINT NOT NULL,
    "bizid" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "arrival" DATE NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "room_price" DECIMAL(17,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "children" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31318_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_room_images" (
    "id" BIGSERIAL NOT NULL,
    "hotel_room_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31326_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_rooms" (
    "id" BIGSERIAL NOT NULL,
    "catid" BIGINT NOT NULL,
    "bizid" BIGINT NOT NULL,
    "room_type" VARCHAR(255) NOT NULL,
    "price" DECIMAL(17,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31331_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_maintenance" (
    "id" BIGSERIAL NOT NULL,
    "investment_id" BIGINT NOT NULL,
    "investment_unit_id" BIGINT NOT NULL,
    "renter_id" BIGINT NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Pending',
    "reported_date" DATE NOT NULL,
    "acknowledged_date" DATE,
    "started_date" DATE,
    "completed_date" DATE,
    "estimated_cost" DECIMAL(13,2),
    "actual_cost" DECIMAL(13,2),
    "before_images" JSONB,
    "after_images" JSONB,
    "updates" JSONB,
    "owner_notes" TEXT,
    "completion_notes" TEXT,
    "renter_rating" INTEGER,
    "renter_feedback" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "investment_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_payments" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "investment_id" BIGINT NOT NULL,
    "investment_unit_id" BIGINT NOT NULL,
    "investment_renter_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "interval_period" SMALLINT NOT NULL,
    "interval_start_date" DATE NOT NULL,
    "interval_end_date" DATE NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "investment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_renters" (
    "id" BIGSERIAL NOT NULL,
    "investment_id" BIGINT NOT NULL,
    "investment_unit_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "next_of_kin_name" VARCHAR(100),
    "next_of_kin_phone" VARCHAR(15),
    "nationality" VARCHAR(50),
    "address" VARCHAR(100),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "rent_due_date" DATE,
    "status" VARCHAR(20) DEFAULT 'Active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "investment_renters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_units" (
    "id" BIGSERIAL NOT NULL,
    "investment_id" BIGINT NOT NULL,
    "unit_name" VARCHAR(255),
    "rent_amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Available',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "investment_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(255),
    "payment_interval" VARCHAR(50) DEFAULT 'Monthly',
    "location" VARCHAR(255),
    "number_of_units" INTEGER DEFAULT 1,
    "make_model" VARCHAR(255),
    "registration_number" VARCHAR(100),
    "color" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_adverts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "poster_name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(255) NOT NULL,
    "pay" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "pay_interval" VARCHAR(255) NOT NULL,
    "workplace" VARCHAR(255) NOT NULL,
    "deadline" DATE NOT NULL,
    "job_brief" TEXT NOT NULL,
    "job_responsibilities" TEXT NOT NULL,
    "job_requirements" TEXT NOT NULL,
    "employment_type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "status" "job_status" DEFAULT 'open',

    CONSTRAINT "idx_31336_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "job_advert_id" BIGINT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "home_location" VARCHAR(255) NOT NULL,
    "availability" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(255) NOT NULL,
    "alt_phone_number" VARCHAR(255),
    "about_applicant" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31344_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_education" (
    "id" BIGSERIAL NOT NULL,
    "job_application_id" BIGINT NOT NULL,
    "institution_name" VARCHAR(255) NOT NULL,
    "qualification" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31351_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_experiences" (
    "id" BIGSERIAL NOT NULL,
    "job_application_id" BIGINT NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "job_description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31358_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_languages" (
    "id" BIGSERIAL NOT NULL,
    "job_application_id" BIGINT NOT NULL,
    "language" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31365_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_referees" (
    "id" BIGSERIAL NOT NULL,
    "job_application_id" BIGINT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone_number" VARCHAR(255) NOT NULL,
    "alt_phone_number" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31371_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" BIGSERIAL NOT NULL,
    "queue" VARCHAR(255) NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" SMALLINT NOT NULL,
    "reserved_at" BIGINT,
    "available_at" BIGINT NOT NULL,
    "created_at" BIGINT NOT NULL,

    CONSTRAINT "idx_31378_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "bizid" INTEGER NOT NULL,
    "userid" VARCHAR(255) NOT NULL,
    "catid" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_on" DATE,

    CONSTRAINT "idx_31384_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_product" (
    "id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "loanproduct_name" VARCHAR(255) NOT NULL,
    "about_loan" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "status" INTEGER,
    "date_created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31389_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_item_images" (
    "id" BIGSERIAL NOT NULL,
    "lost_item_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31396_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_items" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "item_image" VARCHAR(255) NOT NULL,
    "item_name" VARCHAR(255) NOT NULL,
    "item_description" TEXT NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "contact_info" VARCHAR(255) NOT NULL,
    "date_found" DATE NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_found" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "search_vector" tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, (((COALESCE(item_name, ''::character varying))::text || ' '::text) || COALESCE(item_description, ''::text)))) STORED,

    CONSTRAINT "idx_31401_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maid" (
    "id" INTEGER NOT NULL,
    "categorie_id" INTEGER NOT NULL,
    "home_town" VARCHAR(255) NOT NULL,
    "names" VARCHAR(255) NOT NULL,
    "sex" VARCHAR(255) NOT NULL,
    "age" INTEGER NOT NULL,
    "mother_name" VARCHAR(255) NOT NULL,
    "father_name" VARCHAR(255) NOT NULL,
    "pictures" TEXT NOT NULL,
    "education_level" VARCHAR(255) NOT NULL,
    "village" VARCHAR(255) NOT NULL,
    "parish" VARCHAR(255) NOT NULL,
    "sub_county" VARCHAR(255) NOT NULL,
    "national_id" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tel" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',

    CONSTRAINT "idx_31410_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" BIGSERIAL NOT NULL,
    "migration" VARCHAR(255) NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "idx_31419_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "status" "notification_status" NOT NULL DEFAULT 'unread',

    CONSTRAINT "idx_31424_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_fees_structures" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "fee_name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'UGX',
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31432_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "id" BIGINT NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "payment_ref" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(17,2) NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "is_verified" INTEGER NOT NULL DEFAULT 0,
    "narrative" TEXT NOT NULL,
    "phone" VARCHAR(15),
    "table" VARCHAR(255),
    "ip_address" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(20) DEFAULT 'mobile_money',
    "status_check_count" SMALLINT DEFAULT 0,

    CONSTRAINT "idx_31445_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "catid" BIGINT NOT NULL,
    "bizid" BIGINT NOT NULL,
    "permission" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31454_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" BIGSERIAL NOT NULL,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31462_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pro_drivers" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL DEFAULT 84,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "dob" DATE NOT NULL,
    "dl_class" VARCHAR(255) NOT NULL,
    "years_in_driving" VARCHAR(255) NOT NULL,
    "home_town" VARCHAR(255) NOT NULL,
    "village" VARCHAR(255) NOT NULL,
    "education" VARCHAR(255) NOT NULL,
    "contact" VARCHAR(255) NOT NULL,
    "pay_number" VARCHAR(255),
    "merchant_code" VARCHAR(255),
    "details" TEXT,
    "country" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31469_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_adverts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "payment_id" BIGINT,
    "payment_ref" VARCHAR(255),
    "catid" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "ad_type" VARCHAR(255) NOT NULL,
    "price" DECIMAL(17,2) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31482_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_cart" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31489_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_orders" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "catid" BIGINT NOT NULL,
    "bizid" BIGINT NOT NULL,
    "price" DECIMAL(17,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "contact" VARCHAR(255) NOT NULL,
    "delivered_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "status" "order_status" NOT NULL DEFAULT 'pending',

    CONSTRAINT "idx_31494_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_review_images" (
    "id" BIGSERIAL NOT NULL,
    "product_review_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31502_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_review_likes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_review_id" BIGINT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31507_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "parent_id" BIGINT,
    "comment" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31513_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "catid" BIGINT NOT NULL,
    "bizid" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(17,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(255) NOT NULL DEFAULT 'UGX',
    "description" TEXT NOT NULL,
    "subcat" VARCHAR(255),
    "size" VARCHAR(255),
    "latitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "longitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "line_type" "line_type_enum" NOT NULL DEFAULT 'first_line',

    CONSTRAINT "idx_31521_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notifications" (
    "id" BIGSERIAL NOT NULL,
    "from_id" BIGINT NOT NULL,
    "to_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "image" VARCHAR(255),
    "url" VARCHAR(255),
    "status" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "clicked_in_app" BOOLEAN NOT NULL DEFAULT false,
    "bell_view" BOOLEAN NOT NULL DEFAULT false,
    "silent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31533_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "r_e_houses" (
    "id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "square_footage" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "utilities_included" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31546_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "r_e_land" (
    "id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "size" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31555_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "r_e_properties" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "latitude" VARCHAR(255),
    "longitude" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31561_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "r_e_property_images" (
    "id" BIGSERIAL NOT NULL,
    "property_id" BIGINT NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31569_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "bizid" INTEGER NOT NULL,
    "catid" VARCHAR(255) NOT NULL,
    "rating" DECIMAL(1,0) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31574_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_appeals" (
    "id" BIGSERIAL NOT NULL,
    "report_submission_id" BIGINT NOT NULL,
    "context" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31581_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_submissions" (
    "id" BIGSERIAL NOT NULL,
    "reporter_id" BIGINT NOT NULL,
    "reported_user_id" BIGINT,
    "report_type_id" BIGINT NOT NULL,
    "table" VARCHAR(255) NOT NULL,
    "content_id" VARCHAR(255) NOT NULL,
    "other_reasons" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "status" "report_status" NOT NULL DEFAULT 'pending',

    CONSTRAINT "idx_31589_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_types" (
    "id" BIGSERIAL NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31597_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolve_items" (
    "id" SERIAL NOT NULL,
    "itemid" INTEGER NOT NULL,
    "catid" INTEGER NOT NULL,
    "bizid" INTEGER,
    "table_name" VARCHAR(255) NOT NULL,
    "ownerid" VARCHAR(255) NOT NULL,
    "status" VARCHAR(100) NOT NULL DEFAULT '1',
    "creation_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31603_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolver" (
    "id" SERIAL NOT NULL,
    "bizid" INTEGER NOT NULL,
    "category" INTEGER NOT NULL,
    "table1" VARCHAR(255) NOT NULL,
    "owner_id" VARCHAR(255) NOT NULL,
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "idx_31610_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" INTEGER NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "via" VARCHAR(255),
    "price" INTEGER NOT NULL,
    "commission" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "depature" VARCHAR(255) NOT NULL,
    "arrival" VARCHAR(255) NOT NULL,
    "company_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "date_on_creation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31617_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample" (
    "id" INTEGER NOT NULL,
    "amount" VARCHAR(255),
    "narrative" VARCHAR(255),
    "external_ref" VARCHAR(255),
    "network_ref" VARCHAR(255),
    "date_time" VARCHAR(255),
    "msisdn" VARCHAR(255),

    CONSTRAINT "idx_31625_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_performances" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "year" BIGINT NOT NULL,
    "candidates" BIGINT NOT NULL,
    "division_one" BIGINT NOT NULL,
    "division_two" BIGINT NOT NULL,
    "division_three" BIGINT NOT NULL,
    "division_four" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31631_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" BIGINT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "payload" TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_offers" (
    "id" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "about" TEXT,
    "features" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "qualify" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "percentage" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdon" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_30906_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" INTEGER NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31635_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "stagename" VARCHAR(255) NOT NULL,
    "contacts" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "date_created_on" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31642_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrolment" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "year" INTEGER NOT NULL,
    "boys" INTEGER NOT NULL,
    "girls" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31650_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tel" VARCHAR(255) NOT NULL,
    "profile" VARCHAR(255),
    "device_id" VARCHAR(255),
    "pin" VARCHAR(255) NOT NULL,
    "sessionkey" VARCHAR(255),
    "status" INTEGER NOT NULL DEFAULT 0,
    "ispaid" INTEGER NOT NULL DEFAULT 0,
    "createdon" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idx_31654_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" INTEGER NOT NULL,
    "sid" VARCHAR(255),
    "sdate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "samount" INTEGER,
    "edate" DATE,
    "status" INTEGER NOT NULL DEFAULT 1,
    "response" VARCHAR(255),
    "stype" VARCHAR(255),

    CONSTRAINT "idx_31662_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sv_locations" (
    "id" INTEGER NOT NULL,
    "categoryid" INTEGER NOT NULL,
    "office" VARCHAR(255) NOT NULL,
    "img_url" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "physical_location" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "website" TEXT NOT NULL,
    "tel" VARCHAR(255) NOT NULL,
    "service_details" TEXT NOT NULL,
    "owner_id" VARCHAR(255) NOT NULL DEFAULT '0',
    "latitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "longitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "status" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "date_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" VARCHAR(255) NOT NULL DEFAULT 'UG',
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31669_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_errors" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31681_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "male" INTEGER NOT NULL,
    "female" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31688_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toilet_photos" (
    "id" BIGSERIAL NOT NULL,
    "toilet_id" BIGINT NOT NULL,
    "photo" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31693_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toilets" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "male" INTEGER NOT NULL,
    "female" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31698_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31703_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "track_category_id" BIGINT NOT NULL,
    "sub_category" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "artist" VARCHAR(255) NOT NULL,
    "album" VARCHAR(255),
    "genre" VARCHAR(255),
    "description" TEXT,
    "artwork" VARCHAR(255) NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31710_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_courses" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "faculty_id" BIGINT,
    "course" VARCHAR(255) NOT NULL,
    "course_description" TEXT,
    "years" INTEGER NOT NULL,
    "tuition" DECIMAL(17,2) NOT NULL,
    "tuition_currency" VARCHAR(255) NOT NULL DEFAULT 'UGX',
    "tuition_int" DECIMAL(17,2),
    "tuition_int_currency" VARCHAR(255) NOT NULL DEFAULT 'USD',
    "other_fees" DECIMAL(17,2),
    "other_fees_int" DECIMAL(17,2),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31717_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_faculties" (
    "id" BIGSERIAL NOT NULL,
    "bizid" BIGINT NOT NULL,
    "faculty" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31726_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_third_parties" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "added_by" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "idx_31731_primary" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "views" (
    "id" INTEGER NOT NULL,
    "bizid" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "catid" INTEGER NOT NULL,
    "creation_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_on" DATE NOT NULL,
    "ip_address" VARCHAR(255) NOT NULL,

    CONSTRAINT "idx_31743_primary" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_30947_activity_logs_user_id_index" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_bank_contacts_trgm" ON "bank" USING GIN ("contacts" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bank_cov_trgm" ON "bank" USING GIN ("location_coverage" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bank_covering" ON "bank"("id", "bank_name", "profile_image", "verified");

-- CreateIndex
CREATE INDEX "idx_bank_emails_trgm" ON "bank" USING GIN ("emails" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bank_id" ON "bank"("id");

-- CreateIndex
CREATE INDEX "idx_bank_name_trgm" ON "bank" USING GIN ("bank_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bank_branches_bizid_status" ON "bank_branches"("bizid", "status");

-- CreateIndex
CREATE INDEX "idx_bank_branches_search" ON "bank_branches" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "idx_bank_branches_status" ON "bank_branches"("status");

-- CreateIndex
CREATE INDEX "idx_blocked_blog_posts_blocker_blog" ON "blocked_blog_posts"("blocker_id", "blog_post_id");

-- CreateIndex
CREATE INDEX "idx_blog_comments_post_status" ON "blog_comments"("blog_post_id", "status");

-- CreateIndex
CREATE INDEX "idx_blog_images_image" ON "blog_images"("image");

-- CreateIndex
CREATE INDEX "idx_blog_images_image_hash" ON "blog_images"("image_hash");

-- CreateIndex
CREATE INDEX "idx_images_blog_post_id" ON "blog_images"("blog_post_id");

-- CreateIndex
CREATE INDEX "idx_blog_likes_post_status" ON "blog_likes"("blog_post_id", "status");

-- CreateIndex
CREATE INDEX "idx_blog_posts_location" ON "blog_posts" USING GIST ("location");

-- CreateIndex
CREATE INDEX "idx_blogposts_bizid" ON "blog_posts"("bizid");

-- CreateIndex
CREATE INDEX "idx_blogposts_catid" ON "blog_posts"("catid");

-- CreateIndex
CREATE INDEX "idx_blogposts_created_at" ON "blog_posts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_blogposts_userid_status" ON "blog_posts"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_blog_shares_post_status" ON "blog_shares"("blog_post_id", "status");

-- CreateIndex
CREATE INDEX "idx_videos_blog_post_id" ON "blog_videos"("blog_post_id");

-- CreateIndex
CREATE INDEX "idx_views_blog_post_id" ON "blog_views"("blog_post_id");

-- CreateIndex
CREATE INDEX "idx_31114_boda_accidents_boda_association_id_index" ON "boda_accidents"("boda_association_id");

-- CreateIndex
CREATE INDEX "idx_31114_boda_accidents_boda_id_index" ON "boda_accidents"("boda_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31122_boda_associations_email_unique" ON "boda_associations"("email");

-- CreateIndex
CREATE INDEX "idx_31137_boda_interactions_boda_id_index" ON "boda_interactions"("boda_id");

-- CreateIndex
CREATE INDEX "idx_31137_boda_interactions_user_id_index" ON "boda_interactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_31142_boda_stage_leaders_boda_association_id_foreign" ON "boda_stage_leaders"("boda_association_id");

-- CreateIndex
CREATE INDEX "idx_31149_boda_thefts_boda_association_id_index" ON "boda_thefts"("boda_association_id");

-- CreateIndex
CREATE INDEX "idx_31149_boda_thefts_boda_id_index" ON "boda_thefts"("boda_id");

-- CreateIndex
CREATE INDEX "idx_31155_bodaboda_boda_association_id_index" ON "bodaboda"("boda_association_id");

-- CreateIndex
CREATE INDEX "idx_31155_bodaboda_boda_number_index" ON "bodaboda"("boda_number");

-- CreateIndex
CREATE INDEX "idx_31155_bodaboda_boda_stage_leader_id_index" ON "bodaboda"("boda_stage_leader_id");

-- CreateIndex
CREATE INDEX "idx_31155_bodaboda_user_id_index" ON "bodaboda"("user_id");

-- CreateIndex
CREATE INDEX "idx_bodaboda_covering" ON "bodaboda"("id", "names", "image_of_driver", "verified");

-- CreateIndex
CREATE INDEX "idx_bodaboda_status_available" ON "bodaboda"("status", "available");

-- CreateIndex
CREATE INDEX "idx_bookings_route_date_seat" ON "booking"("route_id", "tdate", "seatnumber");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31176_email" ON "bus"("email");

-- CreateIndex
CREATE INDEX "bus_search_idx" ON "bus" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "idx_bus_about_trgm" ON "bus" USING GIN ("about_bus" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bus_address_trgm" ON "bus" USING GIN ("address" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bus_company_trgm" ON "bus" USING GIN ("company_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bus_contact_trgm" ON "bus" USING GIN ("contact_numbers" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bus_covering" ON "bus"("id", "company_name", "profile_image", "verified");

-- CreateIndex
CREATE INDEX "idx_bus_id" ON "bus"("id");

-- CreateIndex
CREATE INDEX "idx_bus_status" ON "bus"("status");

-- CreateIndex
CREATE INDEX "idx_car_hire_covering" ON "car_hire"("id", "driver_names", "images", "verified");

-- CreateIndex
CREATE INDEX "idx_car_hire_id" ON "car_hire"("id");

-- CreateIndex
CREATE INDEX "idx_car_hire_status_subcat_availailable" ON "car_hire"("status", "subcat", "available");

-- CreateIndex
CREATE INDEX "idx_31205_casual_labor_user_id_index" ON "casual_labor"("user_id");

-- CreateIndex
CREATE INDEX "idx_casual_labor_category_status" ON "casual_labor"("category", "status");

-- CreateIndex
CREATE INDEX "idx_casual_labor_covering" ON "casual_labor"("id", "names", "pictures", "verified");

-- CreateIndex
CREATE INDEX "idx_casual_labor_id" ON "casual_labor"("id");

-- CreateIndex
CREATE INDEX "idx_31229_classroom_photos_classroom_id_foreign" ON "classroom_photos"("classroom_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31250_failed_jobs_uuid_unique" ON "failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "idx_favorite_owner_id" ON "favorites"("owner_id");

-- CreateIndex
CREATE INDEX "idx_follower" ON "followers"("catid", "bizid", "status", "hidden");

-- CreateIndex
CREATE INDEX "idx_followers_user_follower" ON "followers"("user_id", "follower_id");

-- CreateIndex
CREATE INDEX "idx_category_id_subcat_status" ON "general_business"("categorie_id", "subcat", "status");

-- CreateIndex
CREATE INDEX "idx_gb_search_trgm" ON "general_business" USING GIN ("company_name" gin_trgm_ops, "district" gin_trgm_ops, "physical_address" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_general_business_covering" ON "general_business"("id", "company_name", "imageurl", "status");

-- CreateIndex
CREATE INDEX "idx_general_business_id" ON "general_business"("id");

-- CreateIndex
CREATE INDEX "idx_leader_contact_trgm" ON "gov_leaders" USING GIN ("contact" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_leader_district_trgm" ON "gov_leaders" USING GIN ("district" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_leader_name_trgm" ON "gov_leaders" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_leader_post_trgm" ON "gov_leaders" USING GIN ("post" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_leader_prof_trgm" ON "gov_leaders" USING GIN ("proffession" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_grad_details_trgm" ON "graduate" USING GIN ("details" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_grad_names_trgm" ON "graduate" USING GIN ("names" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_grad_prof_trgm" ON "graduate" USING GIN ("proffession" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_grad_tel_trgm" ON "graduate" USING GIN ("tel" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_graduate_covering" ON "graduate"("id", "names", "profile_pic", "verified");

-- CreateIndex
CREATE INDEX "idx_graduate_id" ON "graduate"("id");

-- CreateIndex
CREATE INDEX "idx_graduate_subcat" ON "graduate"("subcat");

-- CreateIndex
CREATE INDEX "idx_graduates_search_vector" ON "graduate" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "idx_subcat_status" ON "graduate"("subcat", "status");

-- CreateIndex
CREATE INDEX "idx_31326_hotel_room_images_hotel_room_id_foreign" ON "hotel_room_images"("hotel_room_id");

-- CreateIndex
CREATE INDEX "idx_job_adverts_deadline" ON "job_adverts"("deadline");

-- CreateIndex
CREATE INDEX "idx_job_adverts_id_deadline" ON "job_adverts"("id" DESC, "deadline");

-- CreateIndex
CREATE INDEX "idx_job_adverts_status_deadline" ON "job_adverts"("status", "deadline");

-- CreateIndex
CREATE INDEX "idx_applications_job_advert_id" ON "job_applications"("job_advert_id");

-- CreateIndex
CREATE INDEX "idx_31378_jobs_queue_index" ON "jobs"("queue");

-- CreateIndex
CREATE INDEX "idx_lost_item_id" ON "lost_item_images"("lost_item_id");

-- CreateIndex
CREATE INDEX "idx_is_found" ON "lost_items"("is_found");

-- CreateIndex
CREATE INDEX "idx_lost_item_user_id" ON "lost_items"("user_id");

-- CreateIndex
CREATE INDEX "idx_lost_items_search_vector" ON "lost_items" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "idx_31439_password_resets_email_index" ON "password_resets"("email");

-- CreateIndex
CREATE INDEX "payments_is_verified_id_idx" ON "payments"("is_verified", "id");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31462_personal_access_tokens_token_unique" ON "personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_31462_personal_access_tokens_tokenable_type_tokenable_id_in" ON "personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE INDEX "idx_driver_status_availailable" ON "pro_drivers"("status", "available");

-- CreateIndex
CREATE INDEX "idx_pro_drivers_covering" ON "pro_drivers"("id", "name", "image", "verified");

-- CreateIndex
CREATE INDEX "idx_pro_drivers_id" ON "pro_drivers"("id");

-- CreateIndex
CREATE INDEX "idx_prod_desc_trgm" ON "products" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_prod_name_trgm" ON "products" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_prod_subcat_trgm" ON "products" USING GIN ("subcat" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_bizid" ON "ratings"("bizid");

-- CreateIndex
CREATE INDEX "idx_owner_id" ON "resolver"("owner_id");

-- CreateIndex
CREATE INDEX "resolver_category_idx" ON "resolver"("category");

-- CreateIndex
CREATE INDEX "resolver_date_created_idx" ON "resolver"("date_created");

-- CreateIndex
CREATE INDEX "resolver_owner_id_idx" ON "resolver"("owner_id");

-- CreateIndex
CREATE INDEX "sessions_last_activity_index" ON "sessions"("last_activity");

-- CreateIndex
CREATE INDEX "sessions_user_id_index" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31635_email" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idx_31654_tel" ON "subscribers"("tel");

-- CreateIndex
CREATE INDEX "idx_loc_details_trgm" ON "sv_locations" USING GIN ("service_details" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_loc_district_trgm" ON "sv_locations" USING GIN ("district" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_loc_office_trgm" ON "sv_locations" USING GIN ("office" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_loc_phys_trgm" ON "sv_locations" USING GIN ("physical_location" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_31693_toilet_photos_toilet_id_foreign" ON "toilet_photos"("toilet_id");

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

-- AddForeignKey
ALTER TABLE "boda_stage_leaders" ADD CONSTRAINT "boda_stage_leaders_boda_association_id_foreign" FOREIGN KEY ("boda_association_id") REFERENCES "boda_associations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "classroom_photos" ADD CONSTRAINT "classroom_photos_classroom_id_foreign" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hotel_room_images" ADD CONSTRAINT "hotel_room_images_hotel_room_id_foreign" FOREIGN KEY ("hotel_room_id") REFERENCES "hotel_rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_maintenance" ADD CONSTRAINT "investment_maintenance_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_maintenance" ADD CONSTRAINT "investment_maintenance_investment_unit_id_fkey" FOREIGN KEY ("investment_unit_id") REFERENCES "investment_units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_payments" ADD CONSTRAINT "investment_payments_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_payments" ADD CONSTRAINT "investment_payments_investment_renter_id_fkey" FOREIGN KEY ("investment_renter_id") REFERENCES "investment_renters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_payments" ADD CONSTRAINT "investment_payments_investment_unit_id_fkey" FOREIGN KEY ("investment_unit_id") REFERENCES "investment_units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_renters" ADD CONSTRAINT "investment_renters_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_renters" ADD CONSTRAINT "investment_renters_investment_unit_id_fkey" FOREIGN KEY ("investment_unit_id") REFERENCES "investment_units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "investment_units" ADD CONSTRAINT "investment_units_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "toilet_photos" ADD CONSTRAINT "toilet_photos_toilet_id_foreign" FOREIGN KEY ("toilet_id") REFERENCES "toilets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
