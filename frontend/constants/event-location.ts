/**
 * Canonical Maison ZDR venue address — the single source of truth.
 *
 * Every admin event form opens pre-filled with it, every "empty venue" fallback
 * resolves to it, and the contact/footer/legal pages render the very same
 * string, so the address can never drift between screens.
 */
export const DEFAULT_EVENT_LOCATION =
  "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes, France";

/**
 * The same address pre-split for two-line layouts (footer "Visit Us" list).
 * Derived by hand from DEFAULT_EVENT_LOCATION — keep in sync with it.
 */
export const DEFAULT_EVENT_LOCATION_LINES = [
  "9 Rue du Commerce, 35140",
  "Saint-Hilaire-des-Landes",
] as const;
