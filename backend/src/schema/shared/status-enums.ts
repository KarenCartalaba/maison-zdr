import { z } from "zod";
import { RegistrationStatus, ReviewStatus } from "@/generated/prisma/enums";

/**
 * Zod enums derived from Prisma enums for route-level validation.
 * Keep in sync with `prisma/schema.prisma` enum definitions.
 */

export const registrationStatusEnum = z.nativeEnum(RegistrationStatus);

export const reviewStatusEnum = z.nativeEnum(ReviewStatus);

/** Schema validating PUT /registrations/:id/status */
export const updateRegistrationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid registration ID"),
  }),
  body: z.object({
    status: registrationStatusEnum,
  }),
});

/** Schema validating PUT /reviews/:id/status */
export const updateReviewStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
  body: z.object({
    status: reviewStatusEnum,
  }),
});

// ─── Legal-state-transition maps ────────────────────────────────────────────

/**
 * Allowed transitions for RegistrationStatus.
 * Key = current status, Value = set of legal target statuses.
 *
 * CANCELLED → CONFIRMED is intentionally absent here because that path is
 * capacity-guarded (confirmWithCapacity) and already handled separately.
 */
export const REGISTRATION_TRANSITIONS: Record<RegistrationStatus, readonly RegistrationStatus[]> = {
  [RegistrationStatus.PENDING]:   [RegistrationStatus.CONFIRMED, RegistrationStatus.CANCELLED, RegistrationStatus.WAITLISTED],
  [RegistrationStatus.CONFIRMED]: [RegistrationStatus.CANCELLED],
  [RegistrationStatus.WAITLISTED]: [RegistrationStatus.CONFIRMED, RegistrationStatus.CANCELLED],
  [RegistrationStatus.CANCELLED]: [RegistrationStatus.CONFIRMED], // capacity-guarded restore
} as const;

/**
 * Allowed transitions for ReviewStatus.
 * Key = current status, Value = set of legal target statuses.
 */
export const REVIEW_TRANSITIONS: Record<ReviewStatus, readonly ReviewStatus[]> = {
  [ReviewStatus.PENDING]:  [ReviewStatus.APPROVED, ReviewStatus.REJECTED],
  [ReviewStatus.APPROVED]: [ReviewStatus.PENDING],
  [ReviewStatus.REJECTED]: [ReviewStatus.PENDING],
} as const;

/**
 * Check whether a status transition is allowed.
 * Returns true when the move is legal; false otherwise.
 */
export function isAllowedTransition<T extends string>(
  current: T,
  target: T,
  map: Record<T, readonly T[]>,
): boolean {
  return map[current]?.includes(target) ?? false;
}
