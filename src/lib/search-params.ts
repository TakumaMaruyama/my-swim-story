export type SearchParamsInput = Promise<Record<string, string | string[] | undefined>> | undefined;

export async function readSearchParams(searchParams: SearchParamsInput) {
  const resolved = (await searchParams) ?? {};

  return {
    get(key: string): string {
      const value = resolved[key];
      if (Array.isArray(value)) {
        return value[0] ?? "";
      }
      return value ?? "";
    },
  };
}
