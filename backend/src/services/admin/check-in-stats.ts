/**
 * Pure check-in statistics for an event roster — no I/O, no Prisma import,
 * so the math can be reviewed (and exercised) in isolation.
 *
 * Definitions:
 *  - ACTIVE registration: `status !== "CANCELLED"` — cancelled rows are
 *    excluded from every statistic below.
 *  - headcount(registration) = 1 (the registrant) + `guestCount` (plus-ones).
 *  - expected guests  = Σ headcount over ACTIVE registrations ("who should
 *    show up", including their plus-ones).
 *  - checked-in guests = Σ headcount over ACTIVE registrations with
 *    `checkedIn === true` ("who actually showed up", plus-ones included).
 */

/** The registration fields these statistics are derived from. */
export type CheckInStatRow = {
  status: string;
  checkedIn: boolean;
  guestCount?: number | null;
};

/** Headcount of a single registration: the registrant plus their plus-ones. */
export function registrationHeadcount(row: CheckInStatRow): number {
  const guests = row.guestCount ?? 0;
  return 1 + (guests > 0 ? guests : 0);
}

/** Compute check-in statistics from a roster, skipping cancelled rows. */
export function computeCheckInStats(rows: readonly CheckInStatRow[]) {
  let expectedGuests = 0;
  let checkedInGuests = 0;
  let expectedRegistrations = 0;
  let checkedInRegistrations = 0;
  let cancelledRegistrations = 0;

  for (const row of rows) {
    if (row.status === "CANCELLED") {
      cancelledRegistrations++;
      continue;
    }

    const headcount = registrationHeadcount(row);
    expectedRegistrations++;
    expectedGuests += headcount;

    if (row.checkedIn) {
      checkedInRegistrations++;
      checkedInGuests += headcount;
    }
  }

  return {
    /** Registrants + plus-ones expected, cancelled excluded. */
    expectedGuests,
    /** Registrants + plus-ones checked in, cancelled excluded. */
    checkedInGuests,
    expectedRegistrations,
    checkedInRegistrations,
    /** Rows present in the roster but excluded from the statistics. */
    cancelledRegistrations,
  };
}
