export type Role = "athlete" | "admin";
export type Visibility = "private" | "admin";
export type AffiliationVisibility = Visibility;

export type Stroke =
  | "freestyle"
  | "backstroke"
  | "breaststroke"
  | "butterfly"
  | "individual_medley";

export type Distance = 50 | 100 | 200 | 400 | 800 | 1500;
export type CourseType = "short_course" | "long_course";

export type FocusArea =
  | "start"
  | "underwater"
  | "breakout"
  | "stroke"
  | "kick"
  | "turn"
  | "finish"
  | "pace"
  | "endurance"
  | "sprint"
  | "mental"
  | "other";

export type AchievementLevel = "done" | "mostly_done" | "partly_done" | "not_done";
export type PublicGoalStatus = "pending" | "approved" | "rejected" | "hidden";
export type PublicDisplayCategory = "elementary" | "junior_high" | "high_school" | "other";
export type PublicDisplayState = "challenge" | "achieved" | "updating";

export interface User {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string;
  role: Role;
  grade: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SwimmerProfile {
  id: string;
  userId: string;
  affiliation: string;
  affiliationVisibility: AffiliationVisibility;
  swimmingYears: number | null;
  mainEvent: string;
  weeklyTrainingCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaceRecord {
  id: string;
  userId: string;
  stroke: Stroke;
  distance: Distance;
  courseType: CourseType;
  bestTime: string;
  recordDate: string | null;
  meetName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwimmingStory {
  id: string;
  userId: string;
  oldestMemory: string;
  reasonStarted: string;
  firstRaceMemory: string;
  memorableEvent: string;
  reasonContinuing: string;
  growthMoment: string;
  meaningOfSwimming: string;
  continueUntilAge: string;
  lastScene: string;
  whoToShow: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface YearlyGoal {
  id: string;
  userId: string;
  year: number;
  targetMeet: string;
  targetDate: string | null;
  targetEvent: string;
  outcomeGoal: string;
  targetTime: string;
  performanceGoal: string;
  processGoal: string;
  personalGrowthGoal: string;
  selfScore: number | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyGoal {
  id: string;
  userId: string;
  year: number;
  month: number;
  monthlyGoal: string;
  focusArea: FocusArea;
  processGoal: string;
  personalGrowthGoal: string;
  selfScore: number | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  year: number;
  weekStartDate: string;
  achievementLevel: AchievementLevel;
  score: number | null;
  goodPoints: string;
  difficultPoints: string;
  improvementPoint: string;
  nextAction: string;
  confidenceScore: number | null;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

export interface PublicGoal {
  id: string;
  userId: string;
  yearlyGoalId: string | null;
  monthlyGoalId: string | null;
  displayNickname: string;
  displayCategory: PublicDisplayCategory;
  publicGoalText: string;
  publicProcessText: string;
  status: PublicGoalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string | null;
  nickname: string | null;
  email: string;
  role: Role;
  grade: string | null;
  birthDate: string | null;
}

export interface AthleteDashboardData {
  user: SessionUser;
  profile: SwimmerProfile | null;
  raceRecords: RaceRecord[];
  story: SwimmingStory | null;
  yearlyGoals: YearlyGoal[];
  monthlyGoals: MonthlyGoal[];
  weeklyReviews: WeeklyReview[];
  publicGoal: PublicGoal | null;
}

export interface AdminAthleteListItem {
  user: User;
  profile: SwimmerProfile | null;
  latestWeeklyReview: WeeklyReview | null;
  publicGoal: PublicGoal | null;
}

export interface AdminAthleteDetail {
  user: User;
  profile: SwimmerProfile | null;
  raceRecords: RaceRecord[];
  story: SwimmingStory | null;
  yearlyGoals: YearlyGoal[];
  monthlyGoals: MonthlyGoal[];
  weeklyReviews: WeeklyReview[];
  publicGoal: PublicGoal | null;
}

export interface PublicGoalCard {
  id: string;
  nickname: string;
  category: PublicDisplayCategory;
  goal: string;
  action: string;
  state: PublicDisplayState;
  updatedAt: string;
}
