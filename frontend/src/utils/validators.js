/**
 * Frontend validation is a UX convenience - catching obvious mistakes
 * before a round trip to the server. It is NOT the security boundary;
 * the backend (Phase 2/3 validators) re-validates everything regardless
 * of what passes here.
 */

export function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8;
}

export function isInRange(value, min, max) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= min && num <= max;
}

export function isNonNegativeInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= 0;
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}