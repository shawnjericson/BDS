/*
 Navicat Premium Data Transfer

 Source Server         : postgree_flashpanel
 Source Server Type    : PostgreSQL
 Source Server Version : 160006 (160006)
 Source Host           : 103.97.126.78:5432
 Source Catalog        : mrquy_db
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160006 (160006)
 File Encoding         : 65001

 Date: 12/09/2025 23:06:26
*/


-- ----------------------------
-- Sequence structure for app_users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "app_users_id_seq";
CREATE SEQUENCE "app_users_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for bookings_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "bookings_id_seq";
CREATE SEQUENCE "bookings_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "products_id_seq";
CREATE SEQUENCE "products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for rank_shares_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "rank_shares_id_seq";
CREATE SEQUENCE "rank_shares_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ranks_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "ranks_id_seq";
CREATE SEQUENCE "ranks_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for revenue_ledger_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "revenue_ledger_id_seq";
CREATE SEQUENCE "revenue_ledger_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for app_users
-- ----------------------------
DROP TABLE IF EXISTS "app_users";
CREATE TABLE "app_users" (
  "id" int4 NOT NULL DEFAULT nextval('app_users_id_seq'::regclass),
  "full_name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of app_users
-- ----------------------------
BEGIN;
INSERT INTO "app_users" ("id", "full_name") VALUES (1, 'Provider A'), (2, 'Seller B'), (3, 'Referrer C'), (4, 'Manager D'), (5, 'Admin (App)');
COMMIT;

-- ----------------------------
-- Table structure for bookings
-- ----------------------------
DROP TABLE IF EXISTS "bookings";
CREATE TABLE "bookings" (
  "id" int4 NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
  "product_id" int4,
  "seller_user_id" int4,
  "referrer_user_id" int4,
  "manager_user_id" int4,
  "price" numeric(18,2) NOT NULL,
  "status" text COLLATE "pg_catalog"."default" DEFAULT 'PENDING'::text,
  "closed_at" timestamp(6)
)
;

-- ----------------------------
-- Records of bookings
-- ----------------------------
BEGIN;
INSERT INTO "bookings" ("id", "product_id", "seller_user_id", "referrer_user_id", "manager_user_id", "price", "status", "closed_at") VALUES (7, 1, 2, 3, 4, 1000000000.00, 'CLOSED', '2025-09-05 06:02:26.220428'), (8, 1, 2, 3, 4, 1000000000.00, 'CLOSED', '2025-09-05 07:33:22.874704'), (9, 1, 2, 3, 4, 5000000000.00, 'CLOSED', '2025-09-05 07:46:47.552367'), (10, 2, 2, 3, 4, 5000000000.00, 'CLOSED', '2025-09-05 07:51:49.129935'), (11, 2, 2, 3, 4, 5000000000.00, 'CLOSED', '2025-09-05 07:53:56.615894');
COMMIT;

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "products";
CREATE TABLE "products" (
  "id" int4 NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  "owner_user_id" int4,
  "name" text COLLATE "pg_catalog"."default",
  "commission_pct" numeric(5,4) NOT NULL,
  "provider_desired_pct" numeric(5,4) NOT NULL
)
;

-- ----------------------------
-- Records of products
-- ----------------------------
BEGIN;
INSERT INTO "products" ("id", "owner_user_id", "name", "commission_pct", "provider_desired_pct") VALUES (1, 1, 'Sản phẩm A', 0.0500, 0.0100), (2, 1, 'Sản phẩm B', 0.0010, 0.0005);
COMMIT;

-- ----------------------------
-- Table structure for rank_shares
-- ----------------------------
DROP TABLE IF EXISTS "rank_shares";
CREATE TABLE "rank_shares" (
  "id" int4 NOT NULL DEFAULT nextval('rank_shares_id_seq'::regclass),
  "role" text COLLATE "pg_catalog"."default",
  "rank_id" int4,
  "pct" numeric(5,4) NOT NULL
)
;

-- ----------------------------
-- Records of rank_shares
-- ----------------------------
BEGIN;
INSERT INTO "rank_shares" ("id", "role", "rank_id", "pct") VALUES (16, 'SELLER', 1, 0.8500), (17, 'SELLER', 2, 0.8000), (18, 'SELLER', 3, 0.7500), (19, 'SELLER', 4, 0.7000), (20, 'SELLER', 5, 0.6500), (21, 'REFERRER', 1, 0.1000), (22, 'REFERRER', 2, 0.0900), (23, 'REFERRER', 3, 0.0800), (24, 'REFERRER', 4, 0.0700), (25, 'REFERRER', 5, 0.0600), (11, 'MANAGER', 1, 0.0500), (12, 'MANAGER', 2, 0.0400), (13, 'MANAGER', 3, 0.0030), (14, 'MANAGER', 4, 0.0200), (15, 'MANAGER', 5, 0.0100);
COMMIT;

-- ----------------------------
-- Table structure for ranks
-- ----------------------------
DROP TABLE IF EXISTS "ranks";
CREATE TABLE "ranks" (
  "id" int4 NOT NULL DEFAULT nextval('ranks_id_seq'::regclass),
  "name" text COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of ranks
-- ----------------------------
BEGIN;
INSERT INTO "ranks" ("id", "name") VALUES (1, 'Hạng 1'), (2, 'Hạng 2'), (3, 'Hạng 3'), (4, 'Hạng 4'), (5, 'Hạng 5');
COMMIT;

-- ----------------------------
-- Table structure for revenue_ledger
-- ----------------------------
DROP TABLE IF EXISTS "revenue_ledger";
CREATE TABLE "revenue_ledger" (
  "id" int4 NOT NULL DEFAULT nextval('revenue_ledger_id_seq'::regclass),
  "booking_id" int4,
  "role" text COLLATE "pg_catalog"."default",
  "beneficiary_user_id" int4,
  "pct" numeric(5,4),
  "amount" numeric(18,2),
  "created_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of revenue_ledger
-- ----------------------------
BEGIN;
INSERT INTO "revenue_ledger" ("id", "booking_id", "role", "beneficiary_user_id", "pct", "amount", "created_at") VALUES (36, 7, 'PROVIDER', 1, 0.2000, 10000000.00, '2025-09-05 06:02:26.220428'), (37, 7, 'SELLER', 2, 0.8000, 32000000.00, '2025-09-05 06:02:26.220428'), (38, 7, 'REFERRER', 3, 0.7000, 28000000.00, '2025-09-05 06:02:26.220428'), (39, 7, 'MANAGER', 4, 0.0000, 0.00, '2025-09-05 06:02:26.220428'), (40, 7, 'APP', NULL, -0.4000, -20000000.00, '2025-09-05 06:02:26.220428'), (41, 8, 'PROVIDER', 1, 0.2000, 10000000.00, '2025-09-05 07:33:22.874704'), (42, 8, 'SELLER', 2, 0.8000, 32000000.00, '2025-09-05 07:33:22.874704'), (43, 8, 'REFERRER', 3, 0.0800, 3200000.00, '2025-09-05 07:33:22.874704'), (44, 8, 'MANAGER', 4, 0.0500, 2000000.00, '2025-09-05 07:33:22.874704'), (45, 8, 'APP', NULL, 0.0560, 2800000.00, '2025-09-05 07:33:22.874704'), (46, 9, 'PROVIDER', 1, 0.2000, 50000000.00, '2025-09-05 07:46:47.552367'), (47, 9, 'SELLER', 2, 0.8000, 160000000.00, '2025-09-05 07:46:47.552367'), (48, 9, 'REFERRER', 3, 0.0800, 16000000.00, '2025-09-05 07:46:47.552367'), (49, 9, 'MANAGER', 4, 0.0500, 10000000.00, '2025-09-05 07:46:47.552367'), (50, 9, 'APP', NULL, 0.0560, 14000000.00, '2025-09-05 07:46:47.552367'), (56, 11, 'PROVIDER', 1, 0.5000, 2500000.00, '2025-09-05 07:53:56.615894'), (57, 11, 'SELLER', 2, 0.8000, 2000000.00, '2025-09-05 07:53:56.615894'), (58, 11, 'REFERRER', 3, 0.0800, 200000.00, '2025-09-05 07:53:56.615894'), (59, 11, 'MANAGER', 4, 0.0500, 125000.00, '2025-09-05 07:53:56.615894'), (60, 11, 'APP', NULL, 0.0350, 175000.00, '2025-09-05 07:53:56.615894');
COMMIT;

-- ----------------------------
-- Table structure for user_ranks
-- ----------------------------
DROP TABLE IF EXISTS "user_ranks";
CREATE TABLE "user_ranks" (
  "user_id" int4 NOT NULL,
  "rank_id" int4 NOT NULL,
  "effective_from" timestamp(6) NOT NULL DEFAULT now(),
  "effective_to" timestamp(6)
)
;

-- ----------------------------
-- Records of user_ranks
-- ----------------------------
BEGIN;
INSERT INTO "user_ranks" ("user_id", "rank_id", "effective_from", "effective_to") VALUES (3, 3, '2025-09-05 05:36:28.019348', NULL), (4, 1, '2025-09-05 05:36:28.025358', NULL), (1, 3, '2025-09-05 05:36:28.007397', NULL), (2, 2, '2025-09-05 05:36:28.014442', NULL);
COMMIT;

-- ----------------------------
-- Function structure for fn_distribute_revenue
-- ----------------------------
DROP FUNCTION IF EXISTS "fn_distribute_revenue"("p_booking_id" int4);
CREATE OR REPLACE FUNCTION "fn_distribute_revenue"("p_booking_id" int4)
  RETURNS "pg_catalog"."void" AS $BODY$
DECLARE
    v_price NUMERIC;
    v_comm NUMERIC;
    v_prov NUMERIC;
    v_pool NUMERIC;
    v_remaining NUMERIC;
    v_prov_share NUMERIC;
    v_seller_pct NUMERIC := 0;
    v_ref_pct NUMERIC := 0;
    v_mgr_pct NUMERIC := 0;
    v_seller_amt NUMERIC := 0;
    v_ref_amt NUMERIC := 0;
    v_mgr_amt NUMERIC := 0;
    v_app_amt NUMERIC := 0;
    v_seller INT;
    v_ref INT;
    v_mgr INT;
    v_owner INT;
    v_seller_rank INT;
    v_ref_rank INT;
    v_mgr_rank INT;
BEGIN
    -- Lấy booking + product
    SELECT b.price, p.commission_pct, p.provider_desired_pct,
           b.seller_user_id, b.referrer_user_id, b.manager_user_id, p.owner_user_id
    INTO v_price, v_comm, v_prov, v_seller, v_ref, v_mgr, v_owner
    FROM bookings b
    JOIN products p ON b.product_id = p.id
    WHERE b.id = p_booking_id;

    v_pool := v_price * v_comm;

    -- Provider_share = Pool * (C_provider / C_total)
    v_prov_share := v_pool * (v_prov / v_comm);
    v_remaining := v_pool - v_prov_share;

    -- Rank hiện tại
    SELECT rank_id INTO v_seller_rank
    FROM user_ranks WHERE user_id = v_seller ORDER BY effective_from DESC LIMIT 1;

    SELECT rank_id INTO v_ref_rank
    FROM user_ranks WHERE user_id = v_ref ORDER BY effective_from DESC LIMIT 1;

    SELECT rank_id INTO v_mgr_rank
    FROM user_ranks WHERE user_id = v_mgr ORDER BY effective_from DESC LIMIT 1;

    -- Lấy % theo rank
    IF v_seller_rank IS NOT NULL THEN
      SELECT pct INTO v_seller_pct FROM rank_shares WHERE role='SELLER' AND rank_id=v_seller_rank;
    END IF;

    IF v_ref_rank IS NOT NULL THEN
      SELECT pct INTO v_ref_pct FROM rank_shares WHERE role='REFERRER' AND rank_id=v_ref_rank;
    END IF;

    IF v_mgr_rank IS NOT NULL THEN
      SELECT pct INTO v_mgr_pct FROM rank_shares WHERE role='MANAGER' AND rank_id=v_mgr_rank;
    END IF;

    -- Tính toán
    v_seller_amt := v_remaining * COALESCE(v_seller_pct,0);
    v_ref_amt    := v_remaining * COALESCE(v_ref_pct,0);
    v_mgr_amt    := v_remaining * COALESCE(v_mgr_pct,0);
    v_app_amt    := v_remaining - (v_seller_amt + v_ref_amt + v_mgr_amt);

    -- Ghi ledger
    INSERT INTO revenue_ledger(booking_id, role, beneficiary_user_id, pct, amount)
    VALUES (p_booking_id, 'PROVIDER', v_owner, v_prov/v_comm, v_prov_share);

    IF v_seller IS NOT NULL THEN
      INSERT INTO revenue_ledger(booking_id, role, beneficiary_user_id, pct, amount)
      VALUES (p_booking_id, 'SELLER', v_seller, v_seller_pct, v_seller_amt);
    END IF;

    IF v_ref IS NOT NULL THEN
      INSERT INTO revenue_ledger(booking_id, role, beneficiary_user_id, pct, amount)
      VALUES (p_booking_id, 'REFERRER', v_ref, v_ref_pct, v_ref_amt);
    END IF;

    IF v_mgr IS NOT NULL THEN
      INSERT INTO revenue_ledger(booking_id, role, beneficiary_user_id, pct, amount)
      VALUES (p_booking_id, 'MANAGER', v_mgr, v_mgr_pct, v_mgr_amt);
    END IF;

  INSERT INTO revenue_ledger(booking_id, role, beneficiary_user_id, pct, amount)
VALUES (p_booking_id, 'APP', NULL, v_app_amt/v_pool, v_app_amt);

    -- Update booking
    UPDATE bookings SET status='CLOSED', closed_at=now() WHERE id=p_booking_id;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for fn_revert_revenue
-- ----------------------------
DROP FUNCTION IF EXISTS "fn_revert_revenue"("p_booking_id" int4);
CREATE OR REPLACE FUNCTION "fn_revert_revenue"("p_booking_id" int4)
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
    -- Ghi bản ghi âm cho tất cả dòng dương đã tồn tại của booking
    INSERT INTO revenue_ledger (booking_id, role, beneficiary_user_id, pct, amount, created_at)
    SELECT booking_id, role, beneficiary_user_id, pct, amount * -1, now()
    FROM revenue_ledger
    WHERE booking_id = p_booking_id
      AND amount > 0;  -- chỉ đảo các dòng dương
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for trg_after_booking_insert
-- ----------------------------
DROP FUNCTION IF EXISTS "trg_after_booking_insert"();
CREATE OR REPLACE FUNCTION "trg_after_booking_insert"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    PERFORM fn_distribute_revenue(NEW.id);
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Function structure for trg_after_booking_update
-- ----------------------------
DROP FUNCTION IF EXISTS "trg_after_booking_update"();
CREATE OR REPLACE FUNCTION "trg_after_booking_update"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    IF NEW.status = 'CANCEL' AND OLD.status <> 'CANCEL' THEN
        PERFORM fn_revert_revenue(NEW.id);
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- View structure for vw_revenue_summary
-- ----------------------------
DROP VIEW IF EXISTS "vw_revenue_summary";
CREATE VIEW "vw_revenue_summary" AS  SELECT rl.beneficiary_user_id,
    u.full_name,
    rl.role,
    sum(rl.amount) AS total_revenue,
    count(DISTINCT rl.booking_id) AS total_bookings
   FROM revenue_ledger rl
     LEFT JOIN app_users u ON rl.beneficiary_user_id = u.id
  GROUP BY rl.beneficiary_user_id, u.full_name, rl.role;

-- ----------------------------
-- View structure for vw_booking_revenue_detail
-- ----------------------------
DROP VIEW IF EXISTS "vw_booking_revenue_detail";
CREATE VIEW "vw_booking_revenue_detail" AS  WITH base AS (
         SELECT b_1.id AS booking_id,
            b_1.price,
            b_1.price * p_1.commission_pct AS pool_amount
           FROM bookings b_1
             JOIN products p_1 ON p_1.id = b_1.product_id
        )
 SELECT rl.id AS revenue_id,
    rl.booking_id,
    b.price,
    to_char(base.pool_amount, 'FM999G999G999G999'::text) AS pool_amount,
    rl.role,
    rl.beneficiary_user_id,
    u.full_name,
    to_char(round(rl.amount / NULLIF(base.pool_amount, 0::numeric) * 100::numeric, 2), 'FM999G990D00'::text) || ' %'::text AS pct_percent,
    to_char(rl.amount, 'FM999G999G999G999'::text) AS revenue_amount
   FROM revenue_ledger rl
     JOIN bookings b ON b.id = rl.booking_id
     JOIN products p ON p.id = b.product_id
     JOIN base ON base.booking_id = b.id
     LEFT JOIN app_users u ON u.id = rl.beneficiary_user_id
  ORDER BY rl.booking_id, rl.role;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "app_users_id_seq"
OWNED BY "app_users"."id";
SELECT setval('"app_users_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "bookings_id_seq"
OWNED BY "bookings"."id";
SELECT setval('"bookings_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "products_id_seq"
OWNED BY "products"."id";
SELECT setval('"products_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "rank_shares_id_seq"
OWNED BY "rank_shares"."id";
SELECT setval('"rank_shares_id_seq"', 25, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "ranks_id_seq"
OWNED BY "ranks"."id";
SELECT setval('"ranks_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "revenue_ledger_id_seq"
OWNED BY "revenue_ledger"."id";
SELECT setval('"revenue_ledger_id_seq"', 60, true);

-- ----------------------------
-- Primary Key structure for table app_users
-- ----------------------------
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table bookings
-- ----------------------------
CREATE TRIGGER "booking_after_insert" AFTER INSERT ON "bookings"
FOR EACH ROW
EXECUTE PROCEDURE "public"."trg_after_booking_insert"();
CREATE TRIGGER "booking_after_update" AFTER UPDATE ON "bookings"
FOR EACH ROW
EXECUTE PROCEDURE "public"."trg_after_booking_update"();

-- ----------------------------
-- Checks structure for table bookings
-- ----------------------------
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_status_check" CHECK (status = ANY (ARRAY['PENDING'::text, 'CLOSED'::text]));

-- ----------------------------
-- Primary Key structure for table bookings
-- ----------------------------
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table products
-- ----------------------------
ALTER TABLE "products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Checks structure for table rank_shares
-- ----------------------------
ALTER TABLE "rank_shares" ADD CONSTRAINT "rank_shares_role_check" CHECK (role = ANY (ARRAY['SELLER'::text, 'REFERRER'::text, 'MANAGER'::text]));

-- ----------------------------
-- Primary Key structure for table rank_shares
-- ----------------------------
ALTER TABLE "rank_shares" ADD CONSTRAINT "rank_shares_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ranks
-- ----------------------------
ALTER TABLE "ranks" ADD CONSTRAINT "ranks_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Checks structure for table revenue_ledger
-- ----------------------------
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_role_check" CHECK (role = ANY (ARRAY['PROVIDER'::text, 'SELLER'::text, 'REFERRER'::text, 'MANAGER'::text, 'APP'::text]));

-- ----------------------------
-- Primary Key structure for table revenue_ledger
-- ----------------------------
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table user_ranks
-- ----------------------------
ALTER TABLE "user_ranks" ADD CONSTRAINT "user_ranks_pkey" PRIMARY KEY ("user_id", "rank_id", "effective_from");

-- ----------------------------
-- Foreign Keys structure for table bookings
-- ----------------------------
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_manager_user_id_fkey" FOREIGN KEY ("manager_user_id") REFERENCES "app_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "app_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_seller_user_id_fkey" FOREIGN KEY ("seller_user_id") REFERENCES "app_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table products
-- ----------------------------
ALTER TABLE "products" ADD CONSTRAINT "products_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "app_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table rank_shares
-- ----------------------------
ALTER TABLE "rank_shares" ADD CONSTRAINT "rank_shares_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranks" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table revenue_ledger
-- ----------------------------
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_beneficiary_user_id_fkey" FOREIGN KEY ("beneficiary_user_id") REFERENCES "app_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table user_ranks
-- ----------------------------
ALTER TABLE "user_ranks" ADD CONSTRAINT "user_ranks_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranks" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "user_ranks" ADD CONSTRAINT "user_ranks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
