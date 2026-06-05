import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db, ensureDatabaseSchema } from "@/db/client";
import {
  monthlyGoals,
  publicGoals,
  raceRecords,
  swimmerProfiles,
  swimmingStories,
  users,
  weeklyReviews,
  yearlyGoals,
} from "@/db/schema";
import { getAdminEmails } from "@/lib/env";
import type {
  AdminAthleteDetail,
  AdminAthleteListItem,
  AthleteDashboardData,
  MonthlyGoal,
  PublicGoal,
  PublicGoalCard,
  RaceRecord,
  SessionUser,
  SwimmingStory,
  User,
  WeeklyReview,
  YearlyGoal,
} from "@/lib/types";
import { getMonday } from "@/lib/utils";

function getNow(): Date {
  return new Date();
}

async function requireDb() {
  if (!db) {
    throw new Error("DATABASE_URL が設定されていません。Replit Database を有効化してください。");
  }

  await ensureDatabaseSchema();
  return db;
}

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    email: row.email,
    role: row.role,
    grade: row.grade,
    birthDate: row.birthDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    grade: user.grade,
    birthDate: user.birthDate,
  };
}

function toSwimmerProfile(row: typeof swimmerProfiles.$inferSelect) {
  return {
    id: row.id,
    userId: row.userId,
    affiliation: row.affiliation,
    affiliationVisibility: row.affiliationVisibility,
    swimmingYears: row.swimmingYears,
    mainEvent: row.mainEvent,
    weeklyTrainingCount: row.weeklyTrainingCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toRaceRecord(row: typeof raceRecords.$inferSelect): RaceRecord {
  return {
    id: row.id,
    userId: row.userId,
    stroke: row.stroke,
    distance: row.distance as RaceRecord["distance"],
    courseType: row.courseType,
    bestTime: row.bestTime,
    recordDate: row.recordDate,
    meetName: row.meetName,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSwimmingStory(row: typeof swimmingStories.$inferSelect): SwimmingStory {
  return {
    id: row.id,
    userId: row.userId,
    oldestMemory: row.oldestMemory,
    reasonStarted: row.reasonStarted,
    firstRaceMemory: row.firstRaceMemory,
    memorableEvent: row.memorableEvent,
    reasonContinuing: row.reasonContinuing,
    growthMoment: row.growthMoment,
    meaningOfSwimming: row.meaningOfSwimming,
    continueUntilAge: row.continueUntilAge,
    lastScene: row.lastScene,
    whoToShow: row.whoToShow,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toYearlyGoal(row: typeof yearlyGoals.$inferSelect): YearlyGoal {
  return {
    id: row.id,
    userId: row.userId,
    year: row.year,
    targetMeet: row.targetMeet,
    targetDate: row.targetDate,
    targetEvent: row.targetEvent,
    outcomeGoal: row.outcomeGoal,
    targetTime: row.targetTime,
    performanceGoal: row.performanceGoal,
    processGoal: row.processGoal,
    personalGrowthGoal: row.personalGrowthGoal,
    selfScore: row.selfScore,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toMonthlyGoal(row: typeof monthlyGoals.$inferSelect): MonthlyGoal {
  return {
    id: row.id,
    userId: row.userId,
    year: row.year,
    month: row.month,
    monthlyGoal: row.monthlyGoal,
    focusArea: row.focusArea,
    processGoal: row.processGoal,
    personalGrowthGoal: row.personalGrowthGoal,
    selfScore: row.selfScore,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toWeeklyReview(row: typeof weeklyReviews.$inferSelect): WeeklyReview {
  return {
    id: row.id,
    userId: row.userId,
    year: row.year,
    weekStartDate: row.weekStartDate,
    achievementLevel: row.achievementLevel,
    score: row.score,
    goodPoints: row.goodPoints,
    difficultPoints: row.difficultPoints,
    improvementPoint: row.improvementPoint,
    nextAction: row.nextAction,
    confidenceScore: row.confidenceScore,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPublicGoal(row: typeof publicGoals.$inferSelect): PublicGoal {
  return {
    id: row.id,
    userId: row.userId,
    yearlyGoalId: row.yearlyGoalId,
    monthlyGoalId: row.monthlyGoalId,
    displayNickname: row.displayNickname,
    displayCategory: row.displayCategory,
    publicGoalText: row.publicGoalText,
    publicProcessText: row.publicProcessText,
    status: row.status,
    approvedBy: row.approvedBy,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function deriveRole(email: string): User["role"] {
  return getAdminEmails().includes(email.trim().toLowerCase()) ? "admin" : "athlete";
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function displayName(user: SessionUser | User): string {
  return user.nickname ?? user.name ?? user.email;
}

function hasAthleteProfileCompleted(user: SessionUser | User): boolean {
  return Boolean(user.nickname?.trim() && user.grade?.trim());
}

function derivePublicGoalState(goal: PublicGoal, reviews: WeeklyReview[]): PublicGoalCard["state"] {
  const latestReview = reviews[0];

  if (latestReview?.achievementLevel === "done") {
    return "achieved";
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(goal.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceUpdate <= 21) {
    return "challenge";
  }

  return "updating";
}

async function ensureSwimmerProfile(userId: string) {
  const database = await requireDb();
  const existing = await database
    .select({ id: swimmerProfiles.id })
    .from(swimmerProfiles)
    .where(eq(swimmerProfiles.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await database.insert(swimmerProfiles).values({
      userId,
      affiliation: "",
      affiliationVisibility: "private",
      swimmingYears: null,
      mainEvent: "",
      weeklyTrainingCount: null,
    });
  }
}

async function getLatestPublicGoalByUserId(userId: string): Promise<PublicGoal | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(publicGoals)
    .where(eq(publicGoals.userId, userId))
    .orderBy(desc(publicGoals.updatedAt))
    .limit(1);

  return rows[0] ? toPublicGoal(rows[0]) : null;
}

export { displayName, hasAthleteProfileCompleted, toSessionUser };

export async function upsertUserFromClerk(input: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<User | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const now = getNow();
  const role = deriveRole(input.email);
  const name = normalizeText(input.name);

  await database
    .insert(users)
    .values({
      id: input.userId,
      email: input.email.trim().toLowerCase(),
      role,
      name,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: input.email.trim().toLowerCase(),
        role,
        updatedAt: now,
      },
    });

  await ensureSwimmerProfile(input.userId);

  const row = await database.select().from(users).where(eq(users.id, input.userId)).limit(1);
  return row[0] ? toUser(row[0]) : null;
}

export async function getUserById(userId: string): Promise<User | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  return rows[0] ? toUser(rows[0]) : null;
}

export async function getAthleteDashboardData(userId: string): Promise<AthleteDashboardData | null> {
  if (!db) {
    return null;
  }

  const user = await getUserById(userId);
  if (!user || user.role !== "athlete") {
    return null;
  }

  const database = await requireDb();
  const [profileRows, raceRecordRows, storyRows, yearlyGoalRows, monthlyGoalRows, weeklyReviewRows] =
    await Promise.all([
      database.select().from(swimmerProfiles).where(eq(swimmerProfiles.userId, userId)).limit(1),
      database
        .select()
        .from(raceRecords)
        .where(eq(raceRecords.userId, userId))
        .orderBy(desc(raceRecords.updatedAt)),
      database.select().from(swimmingStories).where(eq(swimmingStories.userId, userId)).limit(1),
      database
        .select()
        .from(yearlyGoals)
        .where(eq(yearlyGoals.userId, userId))
        .orderBy(desc(yearlyGoals.updatedAt)),
      database
        .select()
        .from(monthlyGoals)
        .where(eq(monthlyGoals.userId, userId))
        .orderBy(desc(monthlyGoals.updatedAt)),
      database
        .select()
        .from(weeklyReviews)
        .where(eq(weeklyReviews.userId, userId))
        .orderBy(desc(weeklyReviews.weekStartDate), desc(weeklyReviews.updatedAt)),
    ]);

  return {
    user: toSessionUser(user),
    profile: profileRows[0] ? toSwimmerProfile(profileRows[0]) : null,
    raceRecords: raceRecordRows.map(toRaceRecord),
    story: storyRows[0] ? toSwimmingStory(storyRows[0]) : null,
    yearlyGoals: yearlyGoalRows.map(toYearlyGoal),
    monthlyGoals: monthlyGoalRows.map(toMonthlyGoal),
    weeklyReviews: weeklyReviewRows.map(toWeeklyReview),
    publicGoal: await getLatestPublicGoalByUserId(userId),
  };
}

export async function saveProfile(
  userId: string,
  input: {
    name: string;
    nickname: string;
    grade: string;
    birthDate?: string;
    affiliation: string;
    affiliationVisibility: "private" | "admin";
    swimmingYears?: number;
    mainEvent: string;
    weeklyTrainingCount?: number;
  },
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  await database
    .update(users)
    .set({
      name: input.name.trim(),
      nickname: input.nickname.trim(),
      grade: input.grade.trim(),
      birthDate: normalizeText(input.birthDate) ?? null,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  await database
    .insert(swimmerProfiles)
    .values({
      userId,
      affiliation: input.affiliation.trim(),
      affiliationVisibility: input.affiliationVisibility,
      swimmingYears: input.swimmingYears ?? null,
      mainEvent: input.mainEvent.trim(),
      weeklyTrainingCount: input.weeklyTrainingCount ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: swimmerProfiles.userId,
      set: {
        affiliation: input.affiliation.trim(),
        affiliationVisibility: input.affiliationVisibility,
        swimmingYears: input.swimmingYears ?? null,
        mainEvent: input.mainEvent.trim(),
        weeklyTrainingCount: input.weeklyTrainingCount ?? null,
        updatedAt: now,
      },
    });
}

export async function listRaceRecordsByUserId(userId: string): Promise<RaceRecord[]> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(raceRecords)
    .where(eq(raceRecords.userId, userId))
    .orderBy(desc(raceRecords.updatedAt));

  return rows.map(toRaceRecord);
}

export async function getRaceRecordForUser(userId: string, recordId: string): Promise<RaceRecord | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(raceRecords)
    .where(and(eq(raceRecords.id, recordId), eq(raceRecords.userId, userId)))
    .limit(1);

  return rows[0] ? toRaceRecord(rows[0]) : null;
}

export async function saveRaceRecord(
  userId: string,
  input: {
    recordId?: string;
    stroke: RaceRecord["stroke"];
    distance: number;
    courseType: RaceRecord["courseType"];
    bestTime: string;
    recordDate?: string;
    meetName: string;
  },
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  if (input.recordId) {
    await database
      .update(raceRecords)
      .set({
        stroke: input.stroke,
        distance: input.distance,
        courseType: input.courseType,
        bestTime: input.bestTime.trim(),
        recordDate: normalizeText(input.recordDate) ?? null,
        meetName: input.meetName.trim(),
        updatedAt: now,
      })
      .where(and(eq(raceRecords.id, input.recordId), eq(raceRecords.userId, userId)));
    return;
  }

  await database.insert(raceRecords).values({
    userId,
    stroke: input.stroke,
    distance: input.distance,
    courseType: input.courseType,
    bestTime: input.bestTime.trim(),
    recordDate: normalizeText(input.recordDate) ?? null,
    meetName: input.meetName.trim(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteRaceRecord(userId: string, recordId: string): Promise<void> {
  const database = await requireDb();
  await database.delete(raceRecords).where(and(eq(raceRecords.id, recordId), eq(raceRecords.userId, userId)));
}

export async function getStoryByUserId(userId: string): Promise<SwimmingStory | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(swimmingStories)
    .where(eq(swimmingStories.userId, userId))
    .limit(1);

  return rows[0] ? toSwimmingStory(rows[0]) : null;
}

export async function saveStory(
  userId: string,
  input: Omit<SwimmingStory, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  await database
    .insert(swimmingStories)
    .values({
      userId,
      oldestMemory: input.oldestMemory.trim(),
      reasonStarted: input.reasonStarted.trim(),
      firstRaceMemory: input.firstRaceMemory.trim(),
      memorableEvent: input.memorableEvent.trim(),
      reasonContinuing: input.reasonContinuing.trim(),
      growthMoment: input.growthMoment.trim(),
      meaningOfSwimming: input.meaningOfSwimming.trim(),
      continueUntilAge: input.continueUntilAge.trim(),
      lastScene: input.lastScene.trim(),
      whoToShow: input.whoToShow.trim(),
      visibility: input.visibility,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: swimmingStories.userId,
      set: {
        oldestMemory: input.oldestMemory.trim(),
        reasonStarted: input.reasonStarted.trim(),
        firstRaceMemory: input.firstRaceMemory.trim(),
        memorableEvent: input.memorableEvent.trim(),
        reasonContinuing: input.reasonContinuing.trim(),
        growthMoment: input.growthMoment.trim(),
        meaningOfSwimming: input.meaningOfSwimming.trim(),
        continueUntilAge: input.continueUntilAge.trim(),
        lastScene: input.lastScene.trim(),
        whoToShow: input.whoToShow.trim(),
        visibility: input.visibility,
        updatedAt: now,
      },
    });
}

export async function listYearlyGoalsByUserId(userId: string): Promise<YearlyGoal[]> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(yearlyGoals)
    .where(eq(yearlyGoals.userId, userId))
    .orderBy(desc(yearlyGoals.updatedAt));

  return rows.map(toYearlyGoal);
}

export async function getYearlyGoalForUser(userId: string, goalId: string): Promise<YearlyGoal | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(yearlyGoals)
    .where(and(eq(yearlyGoals.id, goalId), eq(yearlyGoals.userId, userId)))
    .limit(1);

  return rows[0] ? toYearlyGoal(rows[0]) : null;
}

export async function saveYearlyGoal(
  userId: string,
  input: {
    goalId?: string;
    year: number;
    targetMeet: string;
    targetDate?: string;
    targetEvent: string;
    outcomeGoal: string;
    targetTime: string;
    performanceGoal: string;
    processGoal: string;
    personalGrowthGoal: string;
    selfScore?: number;
    visibility: YearlyGoal["visibility"];
  },
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  if (input.goalId) {
    await database
      .update(yearlyGoals)
      .set({
        year: input.year,
        targetMeet: input.targetMeet.trim(),
        targetDate: normalizeText(input.targetDate) ?? null,
        targetEvent: input.targetEvent.trim(),
        outcomeGoal: input.outcomeGoal.trim(),
        targetTime: input.targetTime.trim(),
        performanceGoal: input.performanceGoal.trim(),
        processGoal: input.processGoal.trim(),
        personalGrowthGoal: input.personalGrowthGoal.trim(),
        selfScore: input.selfScore ?? null,
        visibility: input.visibility,
        updatedAt: now,
      })
      .where(and(eq(yearlyGoals.id, input.goalId), eq(yearlyGoals.userId, userId)));
    return;
  }

  await database.insert(yearlyGoals).values({
    userId,
    year: input.year,
    targetMeet: input.targetMeet.trim(),
    targetDate: normalizeText(input.targetDate) ?? null,
    targetEvent: input.targetEvent.trim(),
    outcomeGoal: input.outcomeGoal.trim(),
    targetTime: input.targetTime.trim(),
    performanceGoal: input.performanceGoal.trim(),
    processGoal: input.processGoal.trim(),
    personalGrowthGoal: input.personalGrowthGoal.trim(),
    selfScore: input.selfScore ?? null,
    visibility: input.visibility,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteYearlyGoal(userId: string, goalId: string): Promise<void> {
  const database = await requireDb();
  await database.delete(yearlyGoals).where(and(eq(yearlyGoals.id, goalId), eq(yearlyGoals.userId, userId)));
}

export async function listMonthlyGoalsByUserId(userId: string): Promise<MonthlyGoal[]> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(monthlyGoals)
    .where(eq(monthlyGoals.userId, userId))
    .orderBy(desc(monthlyGoals.updatedAt));

  return rows.map(toMonthlyGoal);
}

export async function getMonthlyGoalForUser(userId: string, goalId: string): Promise<MonthlyGoal | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(monthlyGoals)
    .where(and(eq(monthlyGoals.id, goalId), eq(monthlyGoals.userId, userId)))
    .limit(1);

  return rows[0] ? toMonthlyGoal(rows[0]) : null;
}

export async function saveMonthlyGoal(
  userId: string,
  input: {
    goalId?: string;
    year: number;
    month: number;
    monthlyGoal: string;
    focusArea: MonthlyGoal["focusArea"];
    processGoal: string;
    personalGrowthGoal: string;
    selfScore?: number;
    visibility: MonthlyGoal["visibility"];
  },
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  if (input.goalId) {
    await database
      .update(monthlyGoals)
      .set({
        year: input.year,
        month: input.month,
        monthlyGoal: input.monthlyGoal.trim(),
        focusArea: input.focusArea,
        processGoal: input.processGoal.trim(),
        personalGrowthGoal: input.personalGrowthGoal.trim(),
        selfScore: input.selfScore ?? null,
        visibility: input.visibility,
        updatedAt: now,
      })
      .where(and(eq(monthlyGoals.id, input.goalId), eq(monthlyGoals.userId, userId)));
    return;
  }

  await database.insert(monthlyGoals).values({
    userId,
    year: input.year,
    month: input.month,
    monthlyGoal: input.monthlyGoal.trim(),
    focusArea: input.focusArea,
    processGoal: input.processGoal.trim(),
    personalGrowthGoal: input.personalGrowthGoal.trim(),
    selfScore: input.selfScore ?? null,
    visibility: input.visibility,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteMonthlyGoal(userId: string, goalId: string): Promise<void> {
  const database = await requireDb();
  await database.delete(monthlyGoals).where(and(eq(monthlyGoals.id, goalId), eq(monthlyGoals.userId, userId)));
}

export async function listWeeklyReviewsByUserId(userId: string): Promise<WeeklyReview[]> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.userId, userId))
    .orderBy(desc(weeklyReviews.weekStartDate), desc(weeklyReviews.updatedAt));

  return rows.map(toWeeklyReview);
}

export async function getWeeklyReviewForUser(userId: string, reviewId: string): Promise<WeeklyReview | null> {
  if (!db) {
    return null;
  }

  const database = await requireDb();
  const rows = await database
    .select()
    .from(weeklyReviews)
    .where(and(eq(weeklyReviews.id, reviewId), eq(weeklyReviews.userId, userId)))
    .limit(1);

  return rows[0] ? toWeeklyReview(rows[0]) : null;
}

export async function saveWeeklyReview(
  userId: string,
  input: {
    reviewId?: string;
    year: number;
    weekStartDate: string;
    achievementLevel: WeeklyReview["achievementLevel"];
    score?: number;
    goodPoints: string;
    difficultPoints: string;
    improvementPoint: string;
    nextAction: string;
    confidenceScore?: number;
    visibility: WeeklyReview["visibility"];
  },
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  if (input.reviewId) {
    await database
      .update(weeklyReviews)
      .set({
        year: input.year,
        weekStartDate: input.weekStartDate,
        achievementLevel: input.achievementLevel,
        score: input.score ?? null,
        goodPoints: input.goodPoints.trim(),
        difficultPoints: input.difficultPoints.trim(),
        improvementPoint: input.improvementPoint.trim(),
        nextAction: input.nextAction.trim(),
        confidenceScore: input.confidenceScore ?? null,
        visibility: input.visibility,
        updatedAt: now,
      })
      .where(and(eq(weeklyReviews.id, input.reviewId), eq(weeklyReviews.userId, userId)));
    return;
  }

  await database.insert(weeklyReviews).values({
    userId,
    year: input.year,
    weekStartDate: input.weekStartDate,
    achievementLevel: input.achievementLevel,
    score: input.score ?? null,
    goodPoints: input.goodPoints.trim(),
    difficultPoints: input.difficultPoints.trim(),
    improvementPoint: input.improvementPoint.trim(),
    nextAction: input.nextAction.trim(),
    confidenceScore: input.confidenceScore ?? null,
    visibility: input.visibility,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteWeeklyReview(userId: string, reviewId: string): Promise<void> {
  const database = await requireDb();
  await database.delete(weeklyReviews).where(and(eq(weeklyReviews.id, reviewId), eq(weeklyReviews.userId, userId)));
}

export async function getPublicGoalRequestByUserId(userId: string): Promise<PublicGoal | null> {
  return getLatestPublicGoalByUserId(userId);
}

export async function savePublicGoalRequest(
  userId: string,
  input: {
    requestId?: string;
    yearlyGoalId?: string;
    monthlyGoalId?: string;
    displayNickname: string;
    displayCategory: PublicGoal["displayCategory"];
    publicGoalText: string;
    publicProcessText: string;
  },
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  const validYearlyGoalId =
    input.yearlyGoalId &&
    (await database
      .select({ id: yearlyGoals.id })
      .from(yearlyGoals)
      .where(and(eq(yearlyGoals.id, input.yearlyGoalId), eq(yearlyGoals.userId, userId)))
      .limit(1))[0]?.id;

  const validMonthlyGoalId =
    input.monthlyGoalId &&
    (await database
      .select({ id: monthlyGoals.id })
      .from(monthlyGoals)
      .where(and(eq(monthlyGoals.id, input.monthlyGoalId), eq(monthlyGoals.userId, userId)))
      .limit(1))[0]?.id;

  const targetId =
    input.requestId ??
    (
      await database
        .select({ id: publicGoals.id })
        .from(publicGoals)
        .where(eq(publicGoals.userId, userId))
        .orderBy(desc(publicGoals.updatedAt))
        .limit(1)
    )[0]?.id;

  if (targetId) {
    await database
      .update(publicGoals)
      .set({
        yearlyGoalId: validYearlyGoalId ?? null,
        monthlyGoalId: validMonthlyGoalId ?? null,
        displayNickname: input.displayNickname.trim(),
        displayCategory: input.displayCategory,
        publicGoalText: input.publicGoalText.trim(),
        publicProcessText: input.publicProcessText.trim(),
        status: "pending",
        approvedBy: null,
        approvedAt: null,
        updatedAt: now,
      })
      .where(and(eq(publicGoals.id, targetId), eq(publicGoals.userId, userId)));
    return;
  }

  await database.insert(publicGoals).values({
    userId,
    yearlyGoalId: validYearlyGoalId ?? null,
    monthlyGoalId: validMonthlyGoalId ?? null,
    displayNickname: input.displayNickname.trim(),
    displayCategory: input.displayCategory,
    publicGoalText: input.publicGoalText.trim(),
    publicProcessText: input.publicProcessText.trim(),
    status: "pending",
    approvedBy: null,
    approvedAt: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updatePublicGoalStatus(
  requestId: string,
  status: PublicGoal["status"],
  adminUserId: string,
): Promise<void> {
  const database = await requireDb();
  const now = getNow();

  await database
    .update(publicGoals)
    .set({
      status,
      approvedBy: status === "approved" ? adminUserId : null,
      approvedAt: status === "approved" ? now : null,
      updatedAt: now,
    })
    .where(eq(publicGoals.id, requestId));
}

export async function getAdminDashboardStats(): Promise<{
  athleteCount: number;
  weeklyReviewCount: number;
  pendingPublicGoalCount: number;
  approvedPublicGoalCount: number;
}> {
  if (!db) {
    return {
      athleteCount: 0,
      weeklyReviewCount: 0,
      pendingPublicGoalCount: 0,
      approvedPublicGoalCount: 0,
    };
  }

  const database = await requireDb();
  const monday = getMonday();

  const [athletes, weekly, pending, approved] = await Promise.all([
    database.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "athlete")),
    database
      .select({ userId: weeklyReviews.userId })
      .from(weeklyReviews)
      .where(eq(weeklyReviews.weekStartDate, monday)),
    database
      .select({ count: sql<number>`count(*)::int` })
      .from(publicGoals)
      .where(eq(publicGoals.status, "pending")),
    database
      .select({ count: sql<number>`count(*)::int` })
      .from(publicGoals)
      .where(eq(publicGoals.status, "approved")),
  ]);

  return {
    athleteCount: athletes[0]?.count ?? 0,
    weeklyReviewCount: new Set(weekly.map((item) => item.userId)).size,
    pendingPublicGoalCount: pending[0]?.count ?? 0,
    approvedPublicGoalCount: approved[0]?.count ?? 0,
  };
}

export async function listAthletes(filter?: { search?: string; grade?: string }): Promise<AdminAthleteListItem[]> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const allUsers = await database
    .select()
    .from(users)
    .where(eq(users.role, "athlete"))
    .orderBy(users.email);

  const search = filter?.search?.trim().toLowerCase() ?? "";
  const grade = filter?.grade?.trim() ?? "";

  const filteredUsers = allUsers
    .map(toUser)
    .filter((user) => {
      if (grade && user.grade !== grade) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [user.name, user.nickname, user.email]
        .map((value) => value ?? "")
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

  if (filteredUsers.length === 0) {
    return [];
  }

  const userIds = filteredUsers.map((user) => user.id);
  const [profileRows, weeklyRows, publicGoalRows] = await Promise.all([
    database.select().from(swimmerProfiles).where(inArray(swimmerProfiles.userId, userIds)),
    database
      .select()
      .from(weeklyReviews)
      .where(inArray(weeklyReviews.userId, userIds))
      .orderBy(desc(weeklyReviews.weekStartDate), desc(weeklyReviews.updatedAt)),
    database
      .select()
      .from(publicGoals)
      .where(inArray(publicGoals.userId, userIds))
      .orderBy(desc(publicGoals.updatedAt)),
  ]);

  return filteredUsers.map((user) => {
    const profile = profileRows.find((row) => row.userId === user.id);
    const latestWeekly = weeklyRows.find((row) => row.userId === user.id);
    const publicGoal = publicGoalRows.find((row) => row.userId === user.id);

    return {
      user,
      profile: profile ? toSwimmerProfile(profile) : null,
      latestWeeklyReview: latestWeekly ? toWeeklyReview(latestWeekly) : null,
      publicGoal: publicGoal ? toPublicGoal(publicGoal) : null,
    };
  });
}

export async function getAdminAthleteDetail(userId: string): Promise<AdminAthleteDetail | null> {
  if (!db) {
    return null;
  }

  const user = await getUserById(userId);
  if (!user || user.role !== "athlete") {
    return null;
  }

  const dashboard = await getAthleteDashboardData(userId);
  if (!dashboard) {
    return null;
  }

  return {
    user,
    profile: dashboard.profile,
    raceRecords: dashboard.raceRecords,
    story: dashboard.story,
    yearlyGoals: dashboard.yearlyGoals,
    monthlyGoals: dashboard.monthlyGoals,
    weeklyReviews: dashboard.weeklyReviews,
    publicGoal: dashboard.publicGoal,
  };
}

export async function listPublicGoalRequestsForAdmin(): Promise<
  Array<{
    goal: PublicGoal;
    user: User;
    yearlyGoal: YearlyGoal | null;
    monthlyGoal: MonthlyGoal | null;
    latestReview: WeeklyReview | null;
  }>
> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const goals = await database.select().from(publicGoals).orderBy(desc(publicGoals.updatedAt));

  const userIds = Array.from(new Set(goals.map((goal) => goal.userId)));
  const usersRows =
    userIds.length > 0
      ? await database.select().from(users).where(inArray(users.id, userIds))
      : [];

  return Promise.all(
    goals.map(async (goalRow) => {
      const userRow = usersRows.find((row) => row.id === goalRow.userId);
      if (!userRow) {
        throw new Error("公開申請に対応する選手が見つかりません。");
      }

      const [yearlyRow, monthlyRow, weeklyRow] = await Promise.all([
        goalRow.yearlyGoalId
          ? database.select().from(yearlyGoals).where(eq(yearlyGoals.id, goalRow.yearlyGoalId)).limit(1)
          : Promise.resolve([]),
        goalRow.monthlyGoalId
          ? database.select().from(monthlyGoals).where(eq(monthlyGoals.id, goalRow.monthlyGoalId)).limit(1)
          : Promise.resolve([]),
        database
          .select()
          .from(weeklyReviews)
          .where(eq(weeklyReviews.userId, goalRow.userId))
          .orderBy(desc(weeklyReviews.weekStartDate), desc(weeklyReviews.updatedAt))
          .limit(1),
      ]);

      return {
        goal: toPublicGoal(goalRow),
        user: toUser(userRow),
        yearlyGoal: yearlyRow[0] ? toYearlyGoal(yearlyRow[0]) : null,
        monthlyGoal: monthlyRow[0] ? toMonthlyGoal(monthlyRow[0]) : null,
        latestReview: weeklyRow[0] ? toWeeklyReview(weeklyRow[0]) : null,
      };
    }),
  );
}

export async function listApprovedPublicGoals(): Promise<PublicGoalCard[]> {
  if (!db) {
    return [];
  }

  const database = await requireDb();
  const goalRows = await database
    .select()
    .from(publicGoals)
    .where(eq(publicGoals.status, "approved"))
    .orderBy(desc(publicGoals.updatedAt));

  if (goalRows.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(goalRows.map((goal) => goal.userId)));
  const reviewRows = await database
    .select()
    .from(weeklyReviews)
    .where(inArray(weeklyReviews.userId, userIds))
    .orderBy(desc(weeklyReviews.weekStartDate), desc(weeklyReviews.updatedAt));

  return goalRows.map((goalRow) => {
    const goal = toPublicGoal(goalRow);
    const reviews = reviewRows
      .filter((review) => review.userId === goalRow.userId)
      .map(toWeeklyReview);

    return {
      id: goal.id,
      nickname: goal.displayNickname,
      category: goal.displayCategory,
      goal: goal.publicGoalText,
      action: goal.publicProcessText,
      state: derivePublicGoalState(goal, reviews),
      updatedAt: goal.updatedAt,
    };
  });
}
