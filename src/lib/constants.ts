import type {
  AchievementLevel,
  CourseType,
  FocusArea,
  PublicDisplayCategory,
  PublicDisplayState,
  PublicGoalStatus,
  Stroke,
  Visibility,
} from "@/lib/types";

export const VISIBILITY_OPTIONS = ["private", "admin"] as const satisfies readonly Visibility[];
export const STROKES = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "individual_medley",
] as const satisfies readonly Stroke[];
export const DISTANCES = [50, 100, 200, 400, 800, 1500] as const;
export const COURSE_TYPES = [
  "short_course",
  "long_course",
] as const satisfies readonly CourseType[];
export const FOCUS_AREAS = [
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
] as const satisfies readonly FocusArea[];
export const ACHIEVEMENT_LEVELS = [
  "done",
  "mostly_done",
  "partly_done",
  "not_done",
] as const satisfies readonly AchievementLevel[];
export const PUBLIC_GOAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "hidden",
] as const satisfies readonly PublicGoalStatus[];
export const PUBLIC_DISPLAY_CATEGORIES = [
  "elementary",
  "junior_high",
  "high_school",
  "other",
] as const satisfies readonly PublicDisplayCategory[];
export const PUBLIC_DISPLAY_STATES = [
  "challenge",
  "achieved",
  "updating",
] as const satisfies readonly PublicDisplayState[];

export const STROKE_LABELS: Record<Stroke, string> = {
  freestyle: "自由形",
  backstroke: "背泳ぎ",
  breaststroke: "平泳ぎ",
  butterfly: "バタフライ",
  individual_medley: "個人メドレー",
};

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  short_course: "短水路",
  long_course: "長水路",
};

export const FOCUS_AREA_LABELS: Record<FocusArea, string> = {
  start: "スタート",
  underwater: "浮き上がりまで",
  breakout: "ブレイクアウト",
  stroke: "ストローク",
  kick: "キック",
  turn: "ターン",
  finish: "フィニッシュ",
  pace: "ペース",
  endurance: "持久力",
  sprint: "スピード",
  mental: "気持ち",
  other: "その他",
};

export const ACHIEVEMENT_LEVEL_LABELS: Record<AchievementLevel, string> = {
  done: "できた",
  mostly_done: "ほぼできた",
  partly_done: "少しできた",
  not_done: "できなかった",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  private: "本人のみ",
  admin: "管理者に見せる",
};

export const PUBLIC_DISPLAY_CATEGORY_LABELS: Record<PublicDisplayCategory, string> = {
  elementary: "小学生",
  junior_high: "中学生",
  high_school: "高校生",
  other: "その他",
};

export const PUBLIC_GOAL_STATUS_LABELS: Record<PublicGoalStatus, string> = {
  pending: "申請中",
  approved: "公開中",
  rejected: "非承認",
  hidden: "非公開",
};

export const PUBLIC_DISPLAY_STATE_LABELS: Record<PublicDisplayState, string> = {
  challenge: "挑戦中",
  achieved: "達成",
  updating: "更新中",
};

export const GRADE_OPTIONS = [
  "小学1年",
  "小学2年",
  "小学3年",
  "小学4年",
  "小学5年",
  "小学6年",
  "中学1年",
  "中学2年",
  "中学3年",
  "高校1年",
  "高校2年",
  "高校3年",
  "その他",
] as const;
