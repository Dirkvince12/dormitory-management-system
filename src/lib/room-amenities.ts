export const ROOM_CATEGORIES = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number]["value"];

export const ROOM_BED_TYPES = [
  { value: "single_bed", label: "Single Bed", capacity: 1 },
  { value: "two_beds", label: "Two Beds", capacity: 2 },
  { value: "single_double_deck", label: "Single Double-Deck Bed", capacity: 2 },
  { value: "two_double_deck", label: "Two Double-Deck Beds", capacity: 4 },
] as const;

export type RoomBedType = (typeof ROOM_BED_TYPES)[number]["value"];

export const ROOM_AMENITY_OPTIONS = [
  { key: "airConditioner", label: "Air Conditioner" },
  { key: "electricFan", label: "Electric Fan" },
  { key: "refrigerator", label: "Refrigerator" },
  { key: "studyTable", label: "Study Table" },
  { key: "chair", label: "Chair" },
  { key: "cabinet", label: "Cabinet" },
  { key: "privateComfortRoom", label: "Private Comfort Room (CR)" },
] as const;

export type RoomAmenityKey = (typeof ROOM_AMENITY_OPTIONS)[number]["key"];

export type RoomAmenities = Record<RoomAmenityKey, boolean>;

export function emptyRoomAmenities(): RoomAmenities {
  return {
    airConditioner: false,
    electricFan: false,
    refrigerator: false,
    studyTable: false,
    chair: false,
    cabinet: false,
    privateComfortRoom: false,
  };
}

export function getRoomCategoryLabel(category: RoomCategory | null | undefined): string | null {
  if (!category) return null;
  return ROOM_CATEGORIES.find((c) => c.value === category)?.label ?? null;
}

export function getBedTypeLabel(bedType: RoomBedType | null | undefined): string | null {
  if (!bedType) return null;
  return ROOM_BED_TYPES.find((b) => b.value === bedType)?.label ?? null;
}

export function getBedTypeCapacity(bedType: RoomBedType): number {
  return ROOM_BED_TYPES.find((b) => b.value === bedType)?.capacity ?? 1;
}

export function listSelectedAmenities(amenities: RoomAmenities): string[] {
  return ROOM_AMENITY_OPTIONS.filter((a) => amenities[a.key]).map((a) => a.label);
}
