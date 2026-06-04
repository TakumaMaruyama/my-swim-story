import "server-only";

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { hashPassword } from "@/lib/password";
import type { AppDatabase } from "@/lib/types";
import { generateId, nowIso } from "@/lib/utils";

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_PATH = path.join(DATA_DIR, "app-db.json");

let initializedPromise: Promise<void> | null = null;

function createSeedDatabase(): AppDatabase {
  const createdAt = nowIso();
  const adminId = generateId();
  const athleteId = generateId();
  const profileId = generateId();
  const storyId = generateId();
  const yearlyGoalId = generateId();
  const monthlyGoalId = generateId();
  const weeklyReviewId = generateId();
  const publicGoalId = generateId();

  return {
    meta: {
      version: 1,
      createdAt,
      updatedAt: createdAt,
    },
    users: [
      {
        id: adminId,
        name: "管理者",
        nickname: "Coach",
        email: "admin@example.com",
        passwordHash: hashPassword("password"),
        role: "admin",
        grade: "その他",
        birthDate: null,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: athleteId,
        name: "山田 太郎",
        nickname: "たろう",
        email: "athlete@example.com",
        passwordHash: hashPassword("password"),
        role: "athlete",
        grade: "高校2年",
        birthDate: "2008-06-01",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    swimmerProfiles: [
      {
        id: profileId,
        userId: athleteId,
        affiliation: "サンプル高校水泳部",
        affiliationVisibility: "admin",
        swimmingYears: 10,
        mainEvent: "200m自由形",
        weeklyTrainingCount: 6,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    raceRecords: [
      {
        id: generateId(),
        userId: athleteId,
        stroke: "freestyle",
        distance: 100,
        courseType: "short_course",
        bestTime: "00:54.82",
        recordDate: "2026-05-10",
        meetName: "県高校総体",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: generateId(),
        userId: athleteId,
        stroke: "freestyle",
        distance: 200,
        courseType: "long_course",
        bestTime: "02:00.45",
        recordDate: "2026-04-21",
        meetName: "春季記録会",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    swimmingStories: [
      {
        id: storyId,
        userId: athleteId,
        oldestMemory: "幼稚園のころ、浮き輪でプールに入ったときの冷たさを覚えています。",
        reasonStarted: "兄が泳いでいて、自分もやってみたいと思ったからです。",
        firstRaceMemory: "スタート台が高くてこわかったけれど、ゴールしたときにほっとしました。",
        memorableEvent: "中学1年でリレーのアンカーを任され、仲間の期待を強く感じました。",
        reasonContinuing: "うまくいかない日も、少しずつ前に進める感じが好きだからです。",
        growthMoment: "練習で苦しい場面でも、自分から声を出せたときに心の成長を感じます。",
        meaningOfSwimming: "競泳は、自分の弱さとも強さとも向き合える場所です。",
        continueUntilAge: "22歳",
        lastScene: "大学の最後のレースで、仲間と笑って終われる景色です。",
        whoToShow: "家族と支えてくれたコーチ、そして後輩たちに見てほしいです。",
        visibility: "admin",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    yearlyGoals: [
      {
        id: yearlyGoalId,
        userId: athleteId,
        year: 2026,
        targetMeet: "インターハイ予選",
        targetDate: "2026-07-18",
        targetEvent: "200m自由形",
        outcomeGoal: "決勝に残って自己ベストを更新する",
        targetTime: "01:59.90",
        performanceGoal: "後半50mでもストロークの長さを落とさない",
        processGoal: "週3回はレースペース練習のメモを残す",
        personalGrowthGoal: "苦しい練習でも前向きな声を出す",
        selfScore: 78,
        visibility: "admin",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    monthlyGoals: [
      {
        id: monthlyGoalId,
        userId: athleteId,
        year: 2026,
        month: 6,
        monthlyGoal: "後半で落ちない泳ぎを作る",
        focusArea: "pace",
        processGoal: "メイン練習で100mごとの入りをそろえる",
        personalGrowthGoal: "練習前の準備を自分から早めに始める",
        selfScore: 72,
        visibility: "admin",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    weeklyReviews: [
      {
        id: weeklyReviewId,
        userId: athleteId,
        year: 2026,
        weekStartDate: "2026-06-01",
        achievementLevel: "mostly_done",
        score: 74,
        goodPoints: "タイムを意識して入りをまとめられた",
        difficultPoints: "最後の1本で姿勢が崩れやすかった",
        improvementPoint: "疲れたときこそ頭の位置を下げすぎない",
        nextAction: "水曜のメインから後半の呼吸数を一定にする",
        confidenceScore: 7,
        visibility: "admin",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    publicGoals: [
      {
        id: publicGoalId,
        userId: athleteId,
        yearlyGoalId,
        monthlyGoalId,
        displayNickname: "たろう",
        displayCategory: "high_school",
        publicGoalText: "インターハイ予選で自己ベストを更新する",
        publicProcessText: "後半で落ちないペース配分を毎週のメインで練習する",
        status: "pending",
        approvedBy: null,
        approvedAt: null,
        createdAt,
        updatedAt: createdAt,
      },
    ],
  };
}

async function ensureDatabaseFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await access(DATABASE_PATH);
  } catch {
    const seeded = createSeedDatabase();
    await writeFile(DATABASE_PATH, JSON.stringify(seeded, null, 2), "utf8");
  }
}

export async function ensureDatabase(): Promise<void> {
  initializedPromise ??= ensureDatabaseFile();
  await initializedPromise;
}

export async function readDatabase(): Promise<AppDatabase> {
  await ensureDatabase();
  const raw = await readFile(DATABASE_PATH, "utf8");
  return JSON.parse(raw) as AppDatabase;
}

export async function writeDatabase(database: AppDatabase): Promise<void> {
  await ensureDatabase();
  database.meta.updatedAt = nowIso();
  await writeFile(DATABASE_PATH, JSON.stringify(database, null, 2), "utf8");
}

export async function updateDatabase<T>(
  updater: (database: AppDatabase) => T | Promise<T>,
): Promise<T> {
  const database = await readDatabase();
  const result = await updater(database);
  await writeDatabase(database);
  return result;
}

export function getDatabasePath(): string {
  return DATABASE_PATH;
}
