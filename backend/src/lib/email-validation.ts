import { z } from "zod";

/**
 * Shared email validation for every schema that accepts an email address.
 *
 * WHY AN OFFLINE TLD ALLOWLIST (instead of DNS/MX lookup)?
 * A DNS/MX lookup would catch more nonexistent domains, but it would add
 * network round-trips to every login/signup/forgot-password request (latency),
 * and it would fail or flake on transient DNS outages — locking users out of
 * their account because a resolver hiccuped. We therefore validate the address
 * shape plus its top-level domain offline, synchronously, and deterministically:
 * a 2-letter country code (/^[a-z]{2}$/i) or a member of the allowlist of real
 * gTLDs below. Typos such as `gmail.comm` fail because `comm` is neither a
 * country code nor a real gTLD (and the allowlist deliberately contains no
 * invented near-misses like `comm`, `commm`, `con`, `cmo`).
 */

/** Human-friendly error surfaced by every email field. */
export const EMAIL_INVALID_MESSAGE =
  "Enter a valid email address, for example name@gmail.com";

/**
 * Generous allowlist of real generic TLDs (IANA + very common new gTLDs),
 * plus country-code-style gTLDs that are commonly seen in the wild.
 * Keep this list free of typo-shaped strings (`comm`, `con`, `cmo`, ...).
 */
const ALLOWED_GTLD = new Set<string>([
  // classic gTLDs
  "com", "net", "org", "edu", "gov", "mil", "int", "info", "biz",
  // popular new gTLDs
  "io", "co", "ai", "app", "dev", "me", "xyz", "online", "site", "tech",
  "cloud", "email", "shop", "store", "blog", "news", "media", "design",
  "studio", "agency", "company", "group", "center", "space", "live",
  "life", "world", "today", "pro",
  // common 3+ letter country gTLDs (beyond the 2-letter rule below)
  "aus", "can", "deu", "esp", "fra", "ita", "jpn", "nld", "rus", "ukr",
  "usa", "uk",
]);

/** Final label is either a 2-letter ISO country code or an allowlisted gTLD. */
const COUNTRY_CODE_TLD = /^[a-z]{2}$/i;

/**
 * Dot-separated local part: no leading dot, no trailing dot, no double dot,
 * one segment per label. Characters follow RFC 5322's atext subset.
 */
const LOCAL_PART_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

/** DNS label: 1-63 chars, alphanumeric + inner hyphens, no edge hyphens. */
const DOMAIN_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

/** True when `tld` is a 2-letter country code or an allowlisted real gTLD. */
export function isAllowedTld(tld: string): boolean {
  if (COUNTRY_CODE_TLD.test(tld)) return true;
  return ALLOWED_GTLD.has(tld.toLowerCase());
}

/**
 * Returns true when `value` is a syntactically valid email address whose
 * final label is a 2-letter country code or an allowlisted real gTLD.
 * Non-string input is rejected.
 */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // RFC 5321: 254 chars max for the whole address.
  if (value.length === 0 || value.length > 254) return false;
  if (/\s/.test(value)) return false;

  // Exactly one "@", with non-empty sides (rejects "@gmail.com", "a@@b.com").
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!LOCAL_PART_RE.test(local)) return false;

  if (domain.length > 253) return false;
  const labels = domain.split(".");
  // Needs at least one dot ("example@gmail" has no TLD at all).
  if (labels.length < 2) return false;
  // Rejects empty labels: leading/trailing dot ("a@gmail.com.") and
  // double dots ("a..b@gmail.com"), plus malformed/hyphen-edge labels.
  for (const label of labels) {
    if (!DOMAIN_LABEL_RE.test(label)) return false;
  }

  return isAllowedTld(labels[labels.length - 1]);
}

/**
 * Reusable zod email field — drop-in replacement for `z.string().email(...)`:
 * correct shape AND an allowlisted/country-code TLD, with a friendly message.
 */
export const emailSchema = z
  .string()
  .max(254, EMAIL_INVALID_MESSAGE)
  .refine(isValidEmail, { message: EMAIL_INVALID_MESSAGE });

export type EmailValue = z.infer<typeof emailSchema>;
