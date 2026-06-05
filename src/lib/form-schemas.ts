import { z } from "zod";

import {
  ACHIEVEMENT_LEVELS,
  COURSE_TYPES,
  DISTANCES,
  FOCUS_AREAS,
  PUBLIC_DISPLAY_CATEGORIES,
  STROKES,
  VISIBILITY_OPTIONS,
} from "@/lib/constants";

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(min).max(max).optional(),
  );

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(50),
  nickname: z.string().trim().min(1).max(30),
  grade: z.string().trim().min(1).max(30),
  birthDate: z.string().trim().optional(),
  affiliation: z.string().trim().max(60),
  affiliationVisibility: z.enum(VISIBILITY_OPTIONS),
  swimmingYears: optionalNumber(0, 50),
  mainEvent: z.string().trim().max(50),
  weeklyTrainingCount: optionalNumber(0, 14),
});

export const raceRecordSchema = z.object({
  recordId: z.string().trim().optional(),
  stroke: z.enum(STROKES),
  distance: z.coerce.number().refine((value) => DISTANCES.includes(value as (typeof DISTANCES)[number])),
  courseType: z.enum(COURSE_TYPES),
  bestTime: z.string().trim().min(1).max(20),
  recordDate: z.string().trim().optional(),
  meetName: z.string().trim().max(80),
});

export const storySchema = z.object({
  oldestMemory: z.string().trim().min(1).max(1000),
  reasonStarted: z.string().trim().min(1).max(1000),
  firstRaceMemory: z.string().trim().min(1).max(1000),
  memorableEvent: z.string().trim().min(1).max(1000),
  reasonContinuing: z.string().trim().min(1).max(1000),
  growthMoment: z.string().trim().min(1).max(1000),
  meaningOfSwimming: z.string().trim().min(1).max(1000),
  continueUntilAge: z.string().trim().min(1).max(100),
  lastScene: z.string().trim().min(1).max(1000),
  whoToShow: z.string().trim().min(1).max(1000),
  visibility: z.enum(VISIBILITY_OPTIONS),
});

export const yearlyGoalSchema = z.object({
  goalId: z.string().trim().optional(),
  year: z.coerce.number().min(2000).max(2100),
  targetMeet: z.string().trim().max(80),
  targetDate: z.string().trim().optional(),
  targetEvent: z.string().trim().max(80),
  outcomeGoal: z.string().trim().min(1).max(1000),
  targetTime: z.string().trim().max(20),
  performanceGoal: z.string().trim().min(1).max(1000),
  processGoal: z.string().trim().min(1).max(1000),
  personalGrowthGoal: z.string().trim().min(1).max(1000),
  selfScore: optionalNumber(0, 100),
  visibility: z.enum(VISIBILITY_OPTIONS),
});

export const monthlyGoalSchema = z.object({
  goalId: z.string().trim().optional(),
  year: z.coerce.number().min(2000).max(2100),
  month: z.coerce.number().min(1).max(12),
  monthlyGoal: z.string().trim().min(1).max(1000),
  focusArea: z.enum(FOCUS_AREAS),
  processGoal: z.string().trim().min(1).max(1000),
  personalGrowthGoal: z.string().trim().min(1).max(1000),
  selfScore: optionalNumber(0, 100),
  visibility: z.enum(VISIBILITY_OPTIONS),
});

export const weeklyReviewSchema = z.object({
  reviewId: z.string().trim().optional(),
  year: z.coerce.number().min(2000).max(2100),
  weekStartDate: z.string().trim().min(1),
  achievementLevel: z.enum(ACHIEVEMENT_LEVELS),
  score: optionalNumber(0, 100),
  goodPoints: z.string().trim().min(1).max(1000),
  difficultPoints: z.string().trim().min(1).max(1000),
  improvementPoint: z.string().trim().min(1).max(1000),
  nextAction: z.string().trim().min(1).max(1000),
  confidenceScore: optionalNumber(0, 10),
  visibility: z.enum(VISIBILITY_OPTIONS),
});

export const publicGoalSchema = z.object({
  requestId: z.string().trim().optional(),
  yearlyGoalId: z.string().trim().optional(),
  monthlyGoalId: z.string().trim().optional(),
  displayNickname: z.string().trim().min(1).max(30),
  displayCategory: z.enum(PUBLIC_DISPLAY_CATEGORIES),
  publicGoalText: z.string().trim().min(1).max(300),
  publicProcessText: z.string().trim().min(1).max(300),
});

export const idSchema = z.object({
  id: z.string().trim().min(1),
});
