"use server";

import { redirect } from "next/navigation";

import { requireAdmin, requireAthlete } from "@/lib/auth";
import {
  deleteMonthlyGoal,
  deleteRaceRecord,
  deleteWeeklyReview,
  deleteYearlyGoal,
  saveMonthlyGoal,
  saveProfile,
  savePublicGoalRequest,
  saveRaceRecord,
  saveStory,
  saveWeeklyReview,
  saveYearlyGoal,
  updatePublicGoalStatus,
} from "@/lib/repository";
import {
  monthlyGoalSchema,
  profileSchema,
  publicGoalSchema,
  raceRecordSchema,
  storySchema,
  weeklyReviewSchema,
  yearlyGoalSchema,
} from "@/lib/form-schemas";

function toMessagePath(path: string, key: "message" | "error", value: string): string {
  return `${path}?${key}=${encodeURIComponent(value)}`;
}

export async function saveProfileAction(formData: FormData) {
  const currentUser = await requireAthlete({ allowIncompleteProfile: true });
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    grade: formData.get("grade"),
    birthDate: formData.get("birthDate"),
    affiliation: formData.get("affiliation"),
    affiliationVisibility: formData.get("affiliationVisibility"),
    swimmingYears: formData.get("swimmingYears"),
    mainEvent: formData.get("mainEvent"),
    weeklyTrainingCount: formData.get("weeklyTrainingCount"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/profile",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await saveProfile(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage", "message", "プロフィールを保存しました。"));
}

export async function saveRaceRecordAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const parsed = raceRecordSchema.safeParse({
    recordId: formData.get("recordId"),
    stroke: formData.get("stroke"),
    distance: formData.get("distance"),
    courseType: formData.get("courseType"),
    bestTime: formData.get("bestTime"),
    recordDate: formData.get("recordDate"),
    meetName: formData.get("meetName"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/records",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await saveRaceRecord(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage/records", "message", "ベストタイムを保存しました。"));
}

export async function deleteRaceRecordAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const recordId = String(formData.get("recordId") ?? "");

  if (!recordId) {
    redirect(toMessagePath("/mypage/records", "error", "削除する記録が見つかりません。"));
  }

  await deleteRaceRecord(currentUser.id, recordId);
  redirect(toMessagePath("/mypage/records", "message", "記録を削除しました。"));
}

export async function saveStoryAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const parsed = storySchema.safeParse({
    oldestMemory: formData.get("oldestMemory"),
    reasonStarted: formData.get("reasonStarted"),
    firstRaceMemory: formData.get("firstRaceMemory"),
    memorableEvent: formData.get("memorableEvent"),
    reasonContinuing: formData.get("reasonContinuing"),
    growthMoment: formData.get("growthMoment"),
    meaningOfSwimming: formData.get("meaningOfSwimming"),
    continueUntilAge: formData.get("continueUntilAge"),
    lastScene: formData.get("lastScene"),
    whoToShow: formData.get("whoToShow"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/story",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await saveStory(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage/story", "message", "競泳物語を保存しました。"));
}

export async function saveYearlyGoalAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const parsed = yearlyGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    year: formData.get("year"),
    targetMeet: formData.get("targetMeet"),
    targetDate: formData.get("targetDate"),
    targetEvent: formData.get("targetEvent"),
    outcomeGoal: formData.get("outcomeGoal"),
    targetTime: formData.get("targetTime"),
    performanceGoal: formData.get("performanceGoal"),
    processGoal: formData.get("processGoal"),
    personalGrowthGoal: formData.get("personalGrowthGoal"),
    selfScore: formData.get("selfScore"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/yearly-goals",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await saveYearlyGoal(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage/yearly-goals", "message", "年間目標を保存しました。"));
}

export async function deleteYearlyGoalAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const goalId = String(formData.get("goalId") ?? "");

  if (!goalId) {
    redirect(toMessagePath("/mypage/yearly-goals", "error", "削除する目標が見つかりません。"));
  }

  await deleteYearlyGoal(currentUser.id, goalId);
  redirect(toMessagePath("/mypage/yearly-goals", "message", "年間目標を削除しました。"));
}

export async function saveMonthlyGoalAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const parsed = monthlyGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    year: formData.get("year"),
    month: formData.get("month"),
    monthlyGoal: formData.get("monthlyGoal"),
    focusArea: formData.get("focusArea"),
    processGoal: formData.get("processGoal"),
    personalGrowthGoal: formData.get("personalGrowthGoal"),
    selfScore: formData.get("selfScore"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/monthly-goals",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await saveMonthlyGoal(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage/monthly-goals", "message", "月間目標を保存しました。"));
}

export async function deleteMonthlyGoalAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const goalId = String(formData.get("goalId") ?? "");

  if (!goalId) {
    redirect(toMessagePath("/mypage/monthly-goals", "error", "削除する目標が見つかりません。"));
  }

  await deleteMonthlyGoal(currentUser.id, goalId);
  redirect(toMessagePath("/mypage/monthly-goals", "message", "月間目標を削除しました。"));
}

export async function saveWeeklyReviewAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const parsed = weeklyReviewSchema.safeParse({
    reviewId: formData.get("reviewId"),
    year: formData.get("year"),
    weekStartDate: formData.get("weekStartDate"),
    achievementLevel: formData.get("achievementLevel"),
    score: formData.get("score"),
    goodPoints: formData.get("goodPoints"),
    difficultPoints: formData.get("difficultPoints"),
    improvementPoint: formData.get("improvementPoint"),
    nextAction: formData.get("nextAction"),
    confidenceScore: formData.get("confidenceScore"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/weekly-reviews",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await saveWeeklyReview(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage/weekly-reviews", "message", "週次振り返りを保存しました。"));
}

export async function deleteWeeklyReviewAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const reviewId = String(formData.get("reviewId") ?? "");

  if (!reviewId) {
    redirect(toMessagePath("/mypage/weekly-reviews", "error", "削除する振り返りが見つかりません。"));
  }

  await deleteWeeklyReview(currentUser.id, reviewId);
  redirect(toMessagePath("/mypage/weekly-reviews", "message", "週次振り返りを削除しました。"));
}

export async function savePublicGoalAction(formData: FormData) {
  const currentUser = await requireAthlete();
  const parsed = publicGoalSchema.safeParse({
    requestId: formData.get("requestId"),
    yearlyGoalId: formData.get("yearlyGoalId"),
    monthlyGoalId: formData.get("monthlyGoalId"),
    displayNickname: formData.get("displayNickname"),
    displayCategory: formData.get("displayCategory"),
    publicGoalText: formData.get("publicGoalText"),
    publicProcessText: formData.get("publicProcessText"),
  });

  if (!parsed.success) {
    redirect(
      toMessagePath(
        "/mypage/public-goals",
        "error",
        parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
      ),
    );
  }

  await savePublicGoalRequest(currentUser.id, parsed.data);
  redirect(toMessagePath("/mypage/public-goals", "message", "公開申請を送信しました。"));
}

export async function updatePublicGoalStatusAction(formData: FormData) {
  const adminUser = await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!requestId || !["approved", "rejected", "hidden"].includes(status)) {
    redirect(toMessagePath("/admin/public-goals", "error", "更新内容を確認してください。"));
  }

  await updatePublicGoalStatus(
    requestId,
    status as "approved" | "rejected" | "hidden",
    adminUser.id,
  );

  redirect(toMessagePath("/admin/public-goals", "message", "公開設定を更新しました。"));
}
