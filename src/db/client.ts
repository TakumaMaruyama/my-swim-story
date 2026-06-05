import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { isDatabaseConfigured } from "@/lib/env";
import * as schema from "@/db/schema";

declare global {
  var __pool: Pool | undefined;
  var __schemaReady: Promise<void> | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

const pool =
  isDatabaseConfigured() && databaseUrl
    ? global.__pool ?? new Pool({ connectionString: databaseUrl })
    : null;

if (process.env.NODE_ENV !== "production" && pool) {
  global.__pool = pool;
}

export const db = pool ? drizzle(pool, { schema }) : null;

const bootstrapSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE "public"."achievement_level" AS ENUM ('done', 'mostly_done', 'partly_done', 'not_done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."affiliation_visibility" AS ENUM ('private', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."course_type" AS ENUM ('short_course', 'long_course');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."focus_area" AS ENUM ('start', 'underwater', 'breakout', 'stroke', 'kick', 'turn', 'finish', 'pace', 'endurance', 'sprint', 'mental', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."public_display_category" AS ENUM ('elementary', 'junior_high', 'high_school', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."public_goal_status" AS ENUM ('pending', 'approved', 'rejected', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."role" AS ENUM ('athlete', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."stroke" AS ENUM ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individual_medley');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "public"."visibility" AS ENUM ('private', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "nickname" text,
  "email" text NOT NULL,
  "role" "role" DEFAULT 'athlete' NOT NULL,
  "grade" text,
  "birth_date" date,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "swimmer_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "affiliation" text DEFAULT '' NOT NULL,
  "affiliation_visibility" "affiliation_visibility" DEFAULT 'private' NOT NULL,
  "swimming_years" integer,
  "main_event" text DEFAULT '' NOT NULL,
  "weekly_training_count" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "race_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "stroke" "stroke" NOT NULL,
  "distance" integer NOT NULL,
  "course_type" "course_type" NOT NULL,
  "best_time" text NOT NULL,
  "record_date" date,
  "meet_name" text DEFAULT '' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "swimming_stories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "oldest_memory" text NOT NULL,
  "reason_started" text NOT NULL,
  "first_race_memory" text NOT NULL,
  "memorable_event" text NOT NULL,
  "reason_continuing" text NOT NULL,
  "growth_moment" text NOT NULL,
  "meaning_of_swimming" text NOT NULL,
  "continue_until_age" text NOT NULL,
  "last_scene" text NOT NULL,
  "who_to_show" text NOT NULL,
  "visibility" "visibility" DEFAULT 'private' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "yearly_goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "year" integer NOT NULL,
  "target_meet" text DEFAULT '' NOT NULL,
  "target_date" date,
  "target_event" text DEFAULT '' NOT NULL,
  "outcome_goal" text NOT NULL,
  "target_time" text DEFAULT '' NOT NULL,
  "performance_goal" text NOT NULL,
  "process_goal" text NOT NULL,
  "personal_growth_goal" text NOT NULL,
  "self_score" integer,
  "visibility" "visibility" DEFAULT 'private' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "monthly_goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "year" integer NOT NULL,
  "month" integer NOT NULL,
  "monthly_goal" text NOT NULL,
  "focus_area" "focus_area" NOT NULL,
  "process_goal" text NOT NULL,
  "personal_growth_goal" text NOT NULL,
  "self_score" integer,
  "visibility" "visibility" DEFAULT 'private' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "weekly_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "year" integer NOT NULL,
  "week_start_date" date NOT NULL,
  "achievement_level" "achievement_level" NOT NULL,
  "score" integer,
  "good_points" text NOT NULL,
  "difficult_points" text NOT NULL,
  "improvement_point" text NOT NULL,
  "next_action" text NOT NULL,
  "confidence_score" integer,
  "visibility" "visibility" DEFAULT 'private' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public_goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "yearly_goal_id" uuid REFERENCES "yearly_goals"("id") ON DELETE SET NULL,
  "monthly_goal_id" uuid REFERENCES "monthly_goals"("id") ON DELETE SET NULL,
  "display_nickname" text NOT NULL,
  "display_category" "public_display_category" NOT NULL,
  "public_goal_text" text NOT NULL,
  "public_process_text" text NOT NULL,
  "status" "public_goal_status" DEFAULT 'pending' NOT NULL,
  "approved_by" text REFERENCES "users"("id") ON DELETE SET NULL,
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");
CREATE UNIQUE INDEX IF NOT EXISTS "swimmer_profiles_user_unique" ON "swimmer_profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "swimmer_profiles_main_event_idx" ON "swimmer_profiles" ("main_event");
CREATE INDEX IF NOT EXISTS "race_records_user_idx" ON "race_records" ("user_id");
CREATE INDEX IF NOT EXISTS "race_records_course_idx" ON "race_records" ("course_type");
CREATE UNIQUE INDEX IF NOT EXISTS "swimming_stories_user_unique" ON "swimming_stories" ("user_id");
CREATE INDEX IF NOT EXISTS "yearly_goals_user_year_idx" ON "yearly_goals" ("user_id", "year");
CREATE INDEX IF NOT EXISTS "monthly_goals_user_year_month_idx" ON "monthly_goals" ("user_id", "year", "month");
CREATE INDEX IF NOT EXISTS "weekly_reviews_user_week_idx" ON "weekly_reviews" ("user_id", "week_start_date");
CREATE INDEX IF NOT EXISTS "public_goals_user_idx" ON "public_goals" ("user_id");
CREATE INDEX IF NOT EXISTS "public_goals_status_idx" ON "public_goals" ("status");
`;

export async function ensureDatabaseSchema(): Promise<void> {
  if (!pool) {
    return;
  }

  if (!global.__schemaReady) {
    global.__schemaReady = pool.query(bootstrapSql).then(() => undefined).catch((error) => {
      global.__schemaReady = undefined;
      throw error;
    });
  }

  await global.__schemaReady;
}
