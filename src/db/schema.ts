import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["athlete", "admin"]);
export const visibilityEnum = pgEnum("visibility", ["private", "admin"]);
export const affiliationVisibilityEnum = pgEnum("affiliation_visibility", ["private", "admin"]);
export const strokeEnum = pgEnum("stroke", [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "individual_medley",
]);
export const courseTypeEnum = pgEnum("course_type", ["short_course", "long_course"]);
export const focusAreaEnum = pgEnum("focus_area", [
  "start",
  "underwater",
  "breakout",
  "stroke",
  "kick",
  "turn",
  "finish",
  "pace",
  "endurance",
  "sprint",
  "mental",
  "other",
]);
export const achievementLevelEnum = pgEnum("achievement_level", [
  "done",
  "mostly_done",
  "partly_done",
  "not_done",
]);
export const publicGoalStatusEnum = pgEnum("public_goal_status", [
  "pending",
  "approved",
  "rejected",
  "hidden",
]);
export const publicDisplayCategoryEnum = pgEnum("public_display_category", [
  "elementary",
  "junior_high",
  "high_school",
  "other",
]);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    nickname: text("nickname"),
    email: text("email").notNull(),
    role: roleEnum("role").notNull().default("athlete"),
    grade: text("grade"),
    birthDate: date("birth_date", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role),
  ],
);

export const swimmerProfiles = pgTable(
  "swimmer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    affiliation: text("affiliation").notNull().default(""),
    affiliationVisibility: affiliationVisibilityEnum("affiliation_visibility")
      .notNull()
      .default("private"),
    swimmingYears: integer("swimming_years"),
    mainEvent: text("main_event").notNull().default(""),
    weeklyTrainingCount: integer("weekly_training_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("swimmer_profiles_user_unique").on(table.userId),
    index("swimmer_profiles_main_event_idx").on(table.mainEvent),
  ],
);

export const raceRecords = pgTable(
  "race_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stroke: strokeEnum("stroke").notNull(),
    distance: integer("distance").notNull(),
    courseType: courseTypeEnum("course_type").notNull(),
    bestTime: text("best_time").notNull(),
    recordDate: date("record_date", { mode: "string" }),
    meetName: text("meet_name").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("race_records_user_idx").on(table.userId),
    index("race_records_course_idx").on(table.courseType),
  ],
);

export const swimmingStories = pgTable(
  "swimming_stories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    oldestMemory: text("oldest_memory").notNull(),
    reasonStarted: text("reason_started").notNull(),
    firstRaceMemory: text("first_race_memory").notNull(),
    memorableEvent: text("memorable_event").notNull(),
    reasonContinuing: text("reason_continuing").notNull(),
    growthMoment: text("growth_moment").notNull(),
    meaningOfSwimming: text("meaning_of_swimming").notNull(),
    continueUntilAge: text("continue_until_age").notNull(),
    lastScene: text("last_scene").notNull(),
    whoToShow: text("who_to_show").notNull(),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("swimming_stories_user_unique").on(table.userId)],
);

export const yearlyGoals = pgTable(
  "yearly_goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    targetMeet: text("target_meet").notNull().default(""),
    targetDate: date("target_date", { mode: "string" }),
    targetEvent: text("target_event").notNull().default(""),
    outcomeGoal: text("outcome_goal").notNull(),
    targetTime: text("target_time").notNull().default(""),
    performanceGoal: text("performance_goal").notNull(),
    processGoal: text("process_goal").notNull(),
    personalGrowthGoal: text("personal_growth_goal").notNull(),
    selfScore: integer("self_score"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("yearly_goals_user_year_idx").on(table.userId, table.year)],
);

export const monthlyGoals = pgTable(
  "monthly_goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    monthlyGoal: text("monthly_goal").notNull(),
    focusArea: focusAreaEnum("focus_area").notNull(),
    processGoal: text("process_goal").notNull(),
    personalGrowthGoal: text("personal_growth_goal").notNull(),
    selfScore: integer("self_score"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("monthly_goals_user_year_month_idx").on(table.userId, table.year, table.month)],
);

export const weeklyReviews = pgTable(
  "weekly_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    weekStartDate: date("week_start_date", { mode: "string" }).notNull(),
    achievementLevel: achievementLevelEnum("achievement_level").notNull(),
    score: integer("score"),
    goodPoints: text("good_points").notNull(),
    difficultPoints: text("difficult_points").notNull(),
    improvementPoint: text("improvement_point").notNull(),
    nextAction: text("next_action").notNull(),
    confidenceScore: integer("confidence_score"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("weekly_reviews_user_week_idx").on(table.userId, table.weekStartDate)],
);

export const publicGoals = pgTable(
  "public_goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    yearlyGoalId: uuid("yearly_goal_id").references(() => yearlyGoals.id, {
      onDelete: "set null",
    }),
    monthlyGoalId: uuid("monthly_goal_id").references(() => monthlyGoals.id, {
      onDelete: "set null",
    }),
    displayNickname: text("display_nickname").notNull(),
    displayCategory: publicDisplayCategoryEnum("display_category").notNull(),
    publicGoalText: text("public_goal_text").notNull(),
    publicProcessText: text("public_process_text").notNull(),
    status: publicGoalStatusEnum("status").notNull().default("pending"),
    approvedBy: text("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("public_goals_user_idx").on(table.userId),
    index("public_goals_status_idx").on(table.status),
  ],
);

export type RoleEnum = (typeof roleEnum.enumValues)[number];
export type VisibilityEnum = (typeof visibilityEnum.enumValues)[number];
