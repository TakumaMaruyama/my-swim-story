function parseCsv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);
}

export function getAdminEmails(): string[] {
  return parseCsv(process.env.ADMIN_EMAILS);
}

export function getClerkPublishableKey(): string | undefined {
  return process.env.CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export function isClerkConfigured(): boolean {
  return Boolean(getClerkPublishableKey() && process.env.CLERK_SECRET_KEY);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
