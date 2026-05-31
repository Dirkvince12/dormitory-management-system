export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

export function getGenderLabel(gender: Gender | null | undefined): string | null {
  if (!gender) return null;
  return GENDER_OPTIONS.find((g) => g.value === gender)?.label ?? null;
}
