import { randomUUID } from "node:crypto";

import type { WeeklyReview } from "@/lib/types";

export function nowIso(): string {
  return new Date().toISOString();
}

export function generateId(): string {
  return randomUUID();
}

export function safeNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function optionalString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function nullableString(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

export function sortByUpdatedAtDesc<T extends { updatedAt: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function sortByDateDesc<T extends { weekStartDate: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.weekStartDate.localeCompare(left.weekStartDate));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) {
    return "未設定";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) {
    return "未設定";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

export function formatMonth(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getMonday(date = new Date()): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

export function hasReviewedThisWeek(reviews: WeeklyReview[]): boolean {
  const monday = getMonday();
  return reviews.some((review) => review.weekStartDate === monday);
}

export function toCategoryFromGrade(grade: string): "elementary" | "junior_high" | "high_school" | "other" {
  if (grade.startsWith("小学")) {
    return "elementary";
  }
  if (grade.startsWith("中学")) {
    return "junior_high";
  }
  if (grade.startsWith("高校")) {
    return "high_school";
  }
  return "other";
}
