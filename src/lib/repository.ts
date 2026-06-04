import "server-only";

import { verifyPassword, hashPassword } from "@/lib/password";
import { readDatabase, updateDatabase } from "@/lib/storage";
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
import { generateId, getMonday, nowIso, sortByDateDesc, sortByUpdatedAtDesc } from "@/lib/utils";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeNumber(value: number | undefined): number | null {
  if (value === undefined || Number.isNaN(value)) {
    return null;
  }
  return value;
}

function getLatestPublicGoal(publicGoals: PublicGoal[]): PublicGoal | null {
  return sortByUpdatedAtDesc(publicGoals)[0] ?? null;
}

function derivePublicGoalState(goal: PublicGoal, reviews: WeeklyReview[]): PublicGoalCard["state"] {
  const latestReview = sortByDateDesc(reviews)[0];

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

export function toSessionUser(user: User): SessionUser {
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

export async function getUserById(userId: string): Promise<User | null> {
  const database = await readDatabase();
  return database.users.find((user) => user.id === userId) ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const database = await readDatabase();
  return database.users.find((user) => user.email === normalizeEmail(email)) ?? null;
}

export async function authenticateUser(
  email: string,
  password: string,
  role?: User["role"],
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  if (role && user.role !== role) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

export async function registerAthlete(input: {
  name: string;
  nickname: string;
  email: string;
  password: string;
  grade: string;
  birthDate?: string;
}): Promise<User> {
  return updateDatabase((database) => {
    const email = normalizeEmail(input.email);
    const duplicate = database.users.some((user) => user.email === email);
    if (duplicate) {
      throw new Error("このメールアドレスはすでに登録されています。");
    }

    const timestamp = nowIso();
    const userId = generateId();
    const user: User = {
      id: userId,
      name: input.name.trim(),
      nickname: input.nickname.trim(),
      email,
      passwordHash: hashPassword(input.password),
      role: "athlete",
      grade: input.grade.trim(),
      birthDate: input.birthDate?.trim() ? input.birthDate.trim() : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    database.users.push(user);
    database.swimmerProfiles.push({
      id: generateId(),
      userId,
      affiliation: "",
      affiliationVisibility: "private",
      swimmingYears: null,
      mainEvent: "",
      weeklyTrainingCount: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return user;
  });
}

export async function getAthleteDashboardData(userId: string): Promise<AthleteDashboardData | null> {
  const database = await readDatabase();
  const user = database.users.find((item) => item.id === userId && item.role === "athlete");

  if (!user) {
    return null;
  }

  return {
    user: toSessionUser(user),
    profile: database.swimmerProfiles.find((item) => item.userId === userId) ?? null,
    raceRecords: sortByUpdatedAtDesc(database.raceRecords.filter((item) => item.userId === userId)),
    story: database.swimmingStories.find((item) => item.userId === userId) ?? null,
    yearlyGoals: sortByUpdatedAtDesc(database.yearlyGoals.filter((item) => item.userId === userId)),
    monthlyGoals: sortByUpdatedAtDesc(database.monthlyGoals.filter((item) => item.userId === userId)),
    weeklyReviews: sortByDateDesc(database.weeklyReviews.filter((item) => item.userId === userId)),
    publicGoal: getLatestPublicGoal(database.publicGoals.filter((item) => item.userId === userId)),
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
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const user = database.users.find((item) => item.id === userId && item.role === "athlete");
    if (!user) {
      throw new Error("選手が見つかりません。");
    }

    user.name = input.name.trim();
    user.nickname = input.nickname.trim();
    user.grade = input.grade.trim();
    user.birthDate = input.birthDate?.trim() ? input.birthDate.trim() : null;
    user.updatedAt = timestamp;

    const existingProfile = database.swimmerProfiles.find((item) => item.userId === userId);
    if (existingProfile) {
      existingProfile.affiliation = input.affiliation.trim();
      existingProfile.affiliationVisibility = input.affiliationVisibility;
      existingProfile.swimmingYears = normalizeNumber(input.swimmingYears);
      existingProfile.mainEvent = input.mainEvent.trim();
      existingProfile.weeklyTrainingCount = normalizeNumber(input.weeklyTrainingCount);
      existingProfile.updatedAt = timestamp;
      return;
    }

    database.swimmerProfiles.push({
      id: generateId(),
      userId,
      affiliation: input.affiliation.trim(),
      affiliationVisibility: input.affiliationVisibility,
      swimmingYears: normalizeNumber(input.swimmingYears),
      mainEvent: input.mainEvent.trim(),
      weeklyTrainingCount: normalizeNumber(input.weeklyTrainingCount),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function listRaceRecordsByUserId(userId: string): Promise<RaceRecord[]> {
  const database = await readDatabase();
  return sortByUpdatedAtDesc(database.raceRecords.filter((item) => item.userId === userId));
}

export async function getRaceRecordForUser(
  userId: string,
  recordId: string,
): Promise<RaceRecord | null> {
  const database = await readDatabase();
  return database.raceRecords.find((item) => item.id === recordId && item.userId === userId) ?? null;
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
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const record = input.recordId
      ? database.raceRecords.find((item) => item.id === input.recordId && item.userId === userId)
      : null;

    if (record) {
      record.stroke = input.stroke;
      record.distance = input.distance as RaceRecord["distance"];
      record.courseType = input.courseType;
      record.bestTime = input.bestTime.trim();
      record.recordDate = input.recordDate?.trim() ? input.recordDate.trim() : null;
      record.meetName = input.meetName.trim();
      record.updatedAt = timestamp;
      return;
    }

    database.raceRecords.push({
      id: generateId(),
      userId,
      stroke: input.stroke,
      distance: input.distance as RaceRecord["distance"],
      courseType: input.courseType,
      bestTime: input.bestTime.trim(),
      recordDate: input.recordDate?.trim() ? input.recordDate.trim() : null,
      meetName: input.meetName.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function deleteRaceRecord(userId: string, recordId: string): Promise<void> {
  await updateDatabase((database) => {
    database.raceRecords = database.raceRecords.filter(
      (item) => !(item.id === recordId && item.userId === userId),
    );
  });
}

export async function getStoryByUserId(userId: string): Promise<SwimmingStory | null> {
  const database = await readDatabase();
  return database.swimmingStories.find((item) => item.userId === userId) ?? null;
}

export async function saveStory(
  userId: string,
  input: Omit<SwimmingStory, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<void> {
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const existing = database.swimmingStories.find((item) => item.userId === userId);

    if (existing) {
      Object.assign(existing, input, { updatedAt: timestamp });
      return;
    }

    database.swimmingStories.push({
      id: generateId(),
      userId,
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function listYearlyGoalsByUserId(userId: string): Promise<YearlyGoal[]> {
  const database = await readDatabase();
  return sortByUpdatedAtDesc(database.yearlyGoals.filter((item) => item.userId === userId));
}

export async function getYearlyGoalForUser(
  userId: string,
  goalId: string,
): Promise<YearlyGoal | null> {
  const database = await readDatabase();
  return database.yearlyGoals.find((item) => item.id === goalId && item.userId === userId) ?? null;
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
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const existing = input.goalId
      ? database.yearlyGoals.find((item) => item.id === input.goalId && item.userId === userId)
      : null;

    if (existing) {
      existing.year = input.year;
      existing.targetMeet = input.targetMeet.trim();
      existing.targetDate = input.targetDate?.trim() ? input.targetDate.trim() : null;
      existing.targetEvent = input.targetEvent.trim();
      existing.outcomeGoal = input.outcomeGoal.trim();
      existing.targetTime = input.targetTime.trim();
      existing.performanceGoal = input.performanceGoal.trim();
      existing.processGoal = input.processGoal.trim();
      existing.personalGrowthGoal = input.personalGrowthGoal.trim();
      existing.selfScore = normalizeNumber(input.selfScore);
      existing.visibility = input.visibility;
      existing.updatedAt = timestamp;
      return;
    }

    database.yearlyGoals.push({
      id: generateId(),
      userId,
      year: input.year,
      targetMeet: input.targetMeet.trim(),
      targetDate: input.targetDate?.trim() ? input.targetDate.trim() : null,
      targetEvent: input.targetEvent.trim(),
      outcomeGoal: input.outcomeGoal.trim(),
      targetTime: input.targetTime.trim(),
      performanceGoal: input.performanceGoal.trim(),
      processGoal: input.processGoal.trim(),
      personalGrowthGoal: input.personalGrowthGoal.trim(),
      selfScore: normalizeNumber(input.selfScore),
      visibility: input.visibility,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function deleteYearlyGoal(userId: string, goalId: string): Promise<void> {
  await updateDatabase((database) => {
    database.yearlyGoals = database.yearlyGoals.filter(
      (item) => !(item.id === goalId && item.userId === userId),
    );
    database.publicGoals = database.publicGoals.map((goal) =>
      goal.yearlyGoalId === goalId ? { ...goal, yearlyGoalId: null } : goal,
    );
  });
}

export async function listMonthlyGoalsByUserId(userId: string): Promise<MonthlyGoal[]> {
  const database = await readDatabase();
  return sortByUpdatedAtDesc(database.monthlyGoals.filter((item) => item.userId === userId));
}

export async function getMonthlyGoalForUser(
  userId: string,
  goalId: string,
): Promise<MonthlyGoal | null> {
  const database = await readDatabase();
  return database.monthlyGoals.find((item) => item.id === goalId && item.userId === userId) ?? null;
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
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const existing = input.goalId
      ? database.monthlyGoals.find((item) => item.id === input.goalId && item.userId === userId)
      : null;

    if (existing) {
      existing.year = input.year;
      existing.month = input.month;
      existing.monthlyGoal = input.monthlyGoal.trim();
      existing.focusArea = input.focusArea;
      existing.processGoal = input.processGoal.trim();
      existing.personalGrowthGoal = input.personalGrowthGoal.trim();
      existing.selfScore = normalizeNumber(input.selfScore);
      existing.visibility = input.visibility;
      existing.updatedAt = timestamp;
      return;
    }

    database.monthlyGoals.push({
      id: generateId(),
      userId,
      year: input.year,
      month: input.month,
      monthlyGoal: input.monthlyGoal.trim(),
      focusArea: input.focusArea,
      processGoal: input.processGoal.trim(),
      personalGrowthGoal: input.personalGrowthGoal.trim(),
      selfScore: normalizeNumber(input.selfScore),
      visibility: input.visibility,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function deleteMonthlyGoal(userId: string, goalId: string): Promise<void> {
  await updateDatabase((database) => {
    database.monthlyGoals = database.monthlyGoals.filter(
      (item) => !(item.id === goalId && item.userId === userId),
    );
    database.publicGoals = database.publicGoals.map((goal) =>
      goal.monthlyGoalId === goalId ? { ...goal, monthlyGoalId: null } : goal,
    );
  });
}

export async function listWeeklyReviewsByUserId(userId: string): Promise<WeeklyReview[]> {
  const database = await readDatabase();
  return sortByDateDesc(database.weeklyReviews.filter((item) => item.userId === userId));
}

export async function getWeeklyReviewForUser(
  userId: string,
  reviewId: string,
): Promise<WeeklyReview | null> {
  const database = await readDatabase();
  return database.weeklyReviews.find((item) => item.id === reviewId && item.userId === userId) ?? null;
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
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const existing = input.reviewId
      ? database.weeklyReviews.find((item) => item.id === input.reviewId && item.userId === userId)
      : null;

    if (existing) {
      existing.year = input.year;
      existing.weekStartDate = input.weekStartDate;
      existing.achievementLevel = input.achievementLevel;
      existing.score = normalizeNumber(input.score);
      existing.goodPoints = input.goodPoints.trim();
      existing.difficultPoints = input.difficultPoints.trim();
      existing.improvementPoint = input.improvementPoint.trim();
      existing.nextAction = input.nextAction.trim();
      existing.confidenceScore = normalizeNumber(input.confidenceScore);
      existing.visibility = input.visibility;
      existing.updatedAt = timestamp;
      return;
    }

    database.weeklyReviews.push({
      id: generateId(),
      userId,
      year: input.year,
      weekStartDate: input.weekStartDate,
      achievementLevel: input.achievementLevel,
      score: normalizeNumber(input.score),
      goodPoints: input.goodPoints.trim(),
      difficultPoints: input.difficultPoints.trim(),
      improvementPoint: input.improvementPoint.trim(),
      nextAction: input.nextAction.trim(),
      confidenceScore: normalizeNumber(input.confidenceScore),
      visibility: input.visibility,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function deleteWeeklyReview(userId: string, reviewId: string): Promise<void> {
  await updateDatabase((database) => {
    database.weeklyReviews = database.weeklyReviews.filter(
      (item) => !(item.id === reviewId && item.userId === userId),
    );
  });
}

export async function getPublicGoalRequestByUserId(userId: string): Promise<PublicGoal | null> {
  const database = await readDatabase();
  return getLatestPublicGoal(database.publicGoals.filter((item) => item.userId === userId));
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
  await updateDatabase((database) => {
    const timestamp = nowIso();
    const yearlyGoalId =
      input.yearlyGoalId?.trim() &&
      database.yearlyGoals.some((goal) => goal.id === input.yearlyGoalId?.trim() && goal.userId === userId)
        ? input.yearlyGoalId.trim()
        : null;
    const monthlyGoalId =
      input.monthlyGoalId?.trim() &&
      database.monthlyGoals.some((goal) => goal.id === input.monthlyGoalId?.trim() && goal.userId === userId)
        ? input.monthlyGoalId.trim()
        : null;
    const existing = input.requestId
      ? database.publicGoals.find((item) => item.id === input.requestId && item.userId === userId)
      : getLatestPublicGoal(database.publicGoals.filter((item) => item.userId === userId));

    if (existing) {
      existing.yearlyGoalId = yearlyGoalId;
      existing.monthlyGoalId = monthlyGoalId;
      existing.displayNickname = input.displayNickname.trim();
      existing.displayCategory = input.displayCategory;
      existing.publicGoalText = input.publicGoalText.trim();
      existing.publicProcessText = input.publicProcessText.trim();
      existing.status = "pending";
      existing.approvedBy = null;
      existing.approvedAt = null;
      existing.updatedAt = timestamp;
      return;
    }

    database.publicGoals.push({
      id: generateId(),
      userId,
      yearlyGoalId,
      monthlyGoalId,
      displayNickname: input.displayNickname.trim(),
      displayCategory: input.displayCategory,
      publicGoalText: input.publicGoalText.trim(),
      publicProcessText: input.publicProcessText.trim(),
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function updatePublicGoalStatus(
  requestId: string,
  status: PublicGoal["status"],
  adminUserId: string,
): Promise<void> {
  await updateDatabase((database) => {
    const goal = database.publicGoals.find((item) => item.id === requestId);
    if (!goal) {
      throw new Error("公開申請が見つかりません。");
    }

    const timestamp = nowIso();
    goal.status = status;
    goal.updatedAt = timestamp;
    goal.approvedBy = status === "approved" ? adminUserId : null;
    goal.approvedAt = status === "approved" ? timestamp : null;
  });
}

export async function getAdminDashboardStats(): Promise<{
  athleteCount: number;
  weeklyReviewCount: number;
  pendingPublicGoalCount: number;
  approvedPublicGoalCount: number;
}> {
  const database = await readDatabase();
  const monday = getMonday();

  return {
    athleteCount: database.users.filter((user) => user.role === "athlete").length,
    weeklyReviewCount: new Set(
      database.weeklyReviews
        .filter((review) => review.weekStartDate === monday)
        .map((review) => review.userId),
    ).size,
    pendingPublicGoalCount: database.publicGoals.filter((goal) => goal.status === "pending").length,
    approvedPublicGoalCount: database.publicGoals.filter((goal) => goal.status === "approved").length,
  };
}

export async function listAthletes(filter?: {
  search?: string;
  grade?: string;
}): Promise<AdminAthleteListItem[]> {
  const database = await readDatabase();
  const search = filter?.search?.trim().toLowerCase() ?? "";
  const grade = filter?.grade?.trim() ?? "";

  return database.users
    .filter((user) => user.role === "athlete")
    .filter((user) => {
      if (!search) {
        return true;
      }

      return [user.name, user.nickname, user.email]
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .filter((user) => (grade ? user.grade === grade : true))
    .sort((left, right) => left.name.localeCompare(right.name, "ja"))
    .map((user) => {
      const profile = database.swimmerProfiles.find((item) => item.userId === user.id) ?? null;
      const latestWeeklyReview =
        sortByDateDesc(database.weeklyReviews.filter((item) => item.userId === user.id))[0] ?? null;
      const publicGoal = getLatestPublicGoal(
        database.publicGoals.filter((item) => item.userId === user.id),
      );

      return {
        user,
        profile,
        latestWeeklyReview,
        publicGoal,
      };
    });
}

export async function getAdminAthleteDetail(userId: string): Promise<AdminAthleteDetail | null> {
  const database = await readDatabase();
  const user = database.users.find((item) => item.id === userId && item.role === "athlete");
  if (!user) {
    return null;
  }

  return {
    user,
    profile: database.swimmerProfiles.find((item) => item.userId === userId) ?? null,
    raceRecords: sortByUpdatedAtDesc(database.raceRecords.filter((item) => item.userId === userId)),
    story: database.swimmingStories.find((item) => item.userId === userId) ?? null,
    yearlyGoals: sortByUpdatedAtDesc(database.yearlyGoals.filter((item) => item.userId === userId)),
    monthlyGoals: sortByUpdatedAtDesc(database.monthlyGoals.filter((item) => item.userId === userId)),
    weeklyReviews: sortByDateDesc(database.weeklyReviews.filter((item) => item.userId === userId)),
    publicGoal: getLatestPublicGoal(database.publicGoals.filter((item) => item.userId === userId)),
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
  const database = await readDatabase();

  return sortByUpdatedAtDesc(database.publicGoals).map((goal) => {
    const user = database.users.find((item) => item.id === goal.userId);
    if (!user) {
      throw new Error("公開申請に対応する選手が見つかりません。");
    }

    return {
      goal,
      user,
      yearlyGoal: goal.yearlyGoalId
        ? database.yearlyGoals.find((item) => item.id === goal.yearlyGoalId) ?? null
        : null,
      monthlyGoal: goal.monthlyGoalId
        ? database.monthlyGoals.find((item) => item.id === goal.monthlyGoalId) ?? null
        : null,
      latestReview:
        sortByDateDesc(database.weeklyReviews.filter((item) => item.userId === goal.userId))[0] ?? null,
    };
  });
}

export async function listApprovedPublicGoals(): Promise<PublicGoalCard[]> {
  const database = await readDatabase();

  return sortByUpdatedAtDesc(database.publicGoals.filter((goal) => goal.status === "approved")).map(
    (goal) => ({
      id: goal.id,
      nickname: goal.displayNickname,
      category: goal.displayCategory,
      goal: goal.publicGoalText,
      action: goal.publicProcessText,
      state: derivePublicGoalState(
        goal,
        database.weeklyReviews.filter((review) => review.userId === goal.userId),
      ),
      updatedAt: goal.updatedAt,
    }),
  );
}
