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
    /**
     * Optional reason recorded for a removed review (legacy REJECTED rows).
     * There is no takedown path any more, so this only ever clears/keeps the
     * stored reason when a review is (re-)published: Omit to leave it
     * untouched; null/empty clears it.
     */
    removalReason: z
      .string()
      .max(500, "Removal reason must be at most 500 characters")
      .nullish(),
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
 *
 * Reviews are auto-published (created APPROVED) and are NEVER taken down:
 * genuine negative feedback stays visible, so APPROVED has no outgoing
 * transition and there is no APPROVED → REJECTED path any more. The only
 * remaining move is re-publishing a legacy REJECTED row (PENDING → APPROVED
 * keeps legacy moderation queues working).
 */
export const REVIEW_TRANSITIONS: Record<ReviewStatus, readonly ReviewStatus[]> = {
  [ReviewStatus.PENDING]:  [ReviewStatus.APPROVED],
  [ReviewStatus.APPROVED]: [],
  [ReviewStatus.REJECTED]: [ReviewStatus.APPROVED],
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
