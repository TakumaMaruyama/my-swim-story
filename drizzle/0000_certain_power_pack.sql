CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."achievement_level" AS ENUM('done', 'mostly_done', 'partly_done', 'not_done');--> statement-breakpoint
CREATE TYPE "public"."affiliation_visibility" AS ENUM('private', 'admin');--> statement-breakpoint
CREATE TYPE "public"."course_type" AS ENUM('short_course', 'long_course');--> statement-breakpoint
CREATE TYPE "public"."focus_area" AS ENUM('start', 'underwater', 'breakout', 'stroke', 'kick', 'turn', 'finish', 'pace', 'endurance', 'sprint', 'mental', 'other');--> statement-breakpoint
CREATE TYPE "public"."public_display_category" AS ENUM('elementary', 'junior_high', 'high_school', 'other');--> statement-breakpoint
CREATE TYPE "public"."public_goal_status" AS ENUM('pending', 'approved', 'rejected', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('athlete', 'admin');--> statement-breakpoint
CREATE TYPE "public"."stroke" AS ENUM('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individual_medley');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'admin');--> statement-breakpoint
CREATE TABLE "monthly_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "public_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"yearly_goal_id" uuid,
	"monthly_goal_id" uuid,
	"display_nickname" text NOT NULL,
	"display_category" "public_display_category" NOT NULL,
	"public_goal_text" text NOT NULL,
	"public_process_text" text NOT NULL,
	"status" "public_goal_status" DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stroke" "stroke" NOT NULL,
	"distance" integer NOT NULL,
	"course_type" "course_type" NOT NULL,
	"best_time" text NOT NULL,
	"record_date" date,
	"meet_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swimmer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"affiliation" text DEFAULT '' NOT NULL,
	"affiliation_visibility" "affiliation_visibility" DEFAULT 'private' NOT NULL,
	"swimming_years" integer,
	"main_event" text DEFAULT '' NOT NULL,
	"weekly_training_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swimming_stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "users" (
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
--> statement-breakpoint
CREATE TABLE "weekly_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "yearly_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
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
--> statement-breakpoint
ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_goals" ADD CONSTRAINT "public_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_goals" ADD CONSTRAINT "public_goals_yearly_goal_id_yearly_goals_id_fk" FOREIGN KEY ("yearly_goal_id") REFERENCES "public"."yearly_goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_goals" ADD CONSTRAINT "public_goals_monthly_goal_id_monthly_goals_id_fk" FOREIGN KEY ("monthly_goal_id") REFERENCES "public"."monthly_goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_goals" ADD CONSTRAINT "public_goals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_records" ADD CONSTRAINT "race_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swimmer_profiles" ADD CONSTRAINT "swimmer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swimming_stories" ADD CONSTRAINT "swimming_stories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reviews" ADD CONSTRAINT "weekly_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yearly_goals" ADD CONSTRAINT "yearly_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "monthly_goals_user_year_month_idx" ON "monthly_goals" USING btree ("user_id","year","month");--> statement-breakpoint
CREATE INDEX "public_goals_user_idx" ON "public_goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "public_goals_status_idx" ON "public_goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "race_records_user_idx" ON "race_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "race_records_course_idx" ON "race_records" USING btree ("course_type");--> statement-breakpoint
CREATE UNIQUE INDEX "swimmer_profiles_user_unique" ON "swimmer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "swimmer_profiles_main_event_idx" ON "swimmer_profiles" USING btree ("main_event");--> statement-breakpoint
CREATE UNIQUE INDEX "swimming_stories_user_unique" ON "swimming_stories" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "weekly_reviews_user_week_idx" ON "weekly_reviews" USING btree ("user_id","week_start_date");--> statement-breakpoint
CREATE INDEX "yearly_goals_user_year_idx" ON "yearly_goals" USING btree ("user_id","year");
