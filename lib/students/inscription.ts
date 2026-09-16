/**
 * Helpers for the paper "Fiche d'inscription" fields
 * (Groupe Scolaire La Richarde and other DRC schools).
 */

export type InscriptionAddressParts = {
  address_number?: string | null;
  address_avenue?: string | null;
  address_quartier?: string | null;
  address_commune?: string | null;
};

/** Compose the structured address line used on the paper form. */
export function composeInscriptionAddress(
  parts: InscriptionAddressParts
): string {
  const bits: string[] = [];
  const number = parts.address_number?.trim();
  const avenue = parts.address_avenue?.trim();
  const quartier = parts.address_quartier?.trim();
  const commune = parts.address_commune?.trim();
  if (number) bits.push(`n° ${number}`);
  if (avenue) bits.push(`Av. ${avenue}`);
  if (quartier) bits.push(`Q/ ${quartier}`);
  if (commune) bits.push(`C/ ${commune}`);
  return bits.join(", ");
}

export function formatYesNo(
  value: boolean | null | undefined,
  labels: { yes: string; no: string; empty: string }
): string {
  if (value === true) return labels.yes;
  if (value === false) return labels.no;
  return labels.empty;
}

export type InscriptionStudentFields = {
  school_year?: number | null;
  place_of_birth?: string | null;
  previous_school?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  responsible_profession?: string | null;
  contact_phone?: string | null;
  address_number?: string | null;
  address_avenue?: string | null;
  address_quartier?: string | null;
  address_commune?: string | null;
  chronic_illness?: boolean | null;
  visual_problem?: boolean | null;
  physical_problem?: boolean | null;
  allergies?: string | null;
  difficulties?: string | null;
  home_address?: string | null;
  notes?: string | null;
};

/** Normalize optional text columns before insert/update. */
export function normalizeInscriptionFields(
  data: InscriptionStudentFields
): Record<string, string | number | boolean | null> {
  const composed =
    composeInscriptionAddress(data) || data.home_address?.trim() || null;

  return {
    school_year: data.school_year ?? null,
    place_of_birth: data.place_of_birth?.trim() || null,
    previous_school: data.previous_school?.trim() || null,
    father_name: data.father_name?.trim() || null,
    mother_name: data.mother_name?.trim() || null,
    responsible_profession: data.responsible_profession?.trim() || null,
    contact_phone: data.contact_phone?.trim() || null,
    address_number: data.address_number?.trim() || null,
    address_avenue: data.address_avenue?.trim() || null,
    address_quartier: data.address_quartier?.trim() || null,
    address_commune: data.address_commune?.trim() || null,
    chronic_illness:
      data.chronic_illness === undefined ? null : data.chronic_illness,
    visual_problem:
      data.visual_problem === undefined ? null : data.visual_problem,
    physical_problem:
      data.physical_problem === undefined ? null : data.physical_problem,
    allergies: data.allergies?.trim() || null,
    difficulties: data.difficulties?.trim() || null,
    home_address: composed,
    notes: data.notes?.trim() || null,
  };
}

/**
 * Like normalizeInscriptionFields, but only includes keys present on `data`
 * so partial updates do not wipe existing columns.
 */
export function pickNormalizedInscriptionFields(
  data: InscriptionStudentFields
): Record<string, string | number | boolean | null> {
  const full = normalizeInscriptionFields(data);
  const out: Record<string, string | number | boolean | null> = {};
  const keys = Object.keys(full) as (keyof typeof full)[];
  for (const key of keys) {
    if (key === "home_address") {
      const hasStructured =
        data.address_number !== undefined ||
        data.address_avenue !== undefined ||
        data.address_quartier !== undefined ||
        data.address_commune !== undefined;
      if (hasStructured || data.home_address !== undefined) {
        out.home_address = full.home_address;
      }
      continue;
    }
    if ((data as Record<string, unknown>)[key] !== undefined) {
      out[key] = full[key];
    }
  }
  return out;
}
