import cron from "node-cron";
import { sendEventReminders } from "@/services/email";
import { AuthRepository } from "@/repositories/auth.repository";

const authRepo = new AuthRepository();

let isRunning = false;

export function startReminderScheduler(): void {
  console.log("⏰ Event reminder scheduler initialized");

  // Run every hour at the top of the hour — event reminders
  cron.schedule("0 * * * *", async () => {
    if (isRunning) {
      console.log("[Scheduler] Previous run still in progress, skipping...");
      return;
    }

    isRunning = true;
    console.log(`[Scheduler] Running event reminders at ${new Date().toISOString()}`);

    try {
      const result = await sendEventReminders();
      console.log(
        `[Scheduler] Finished: ${result.sentCount} sent, ${result.failedCount} failed, ${result.skippedCount} skipped`
      );
    } catch (error) {
      console.error("[Scheduler] Unhandled error during reminder run:", error);
    } finally {
      isRunning = false;
    }
  });

  // Run every hour at :05 — prune expired tokens (offset from reminder to
  // reduce contention on the same minute boundary).
  cron.schedule("5 * * * *", async () => {
    try {
      const deleted = await authRepo.deleteExpiredTokens();
      console.log(`[Scheduler] Token pruning: deleted ${deleted} expired token(s)`);
    } catch (error) {
      console.error("[Scheduler] Token pruning failed:", error);
    }
  });

  console.log("⏰ Cron jobs scheduled: reminders (0 * * * *) + token pruning (5 * * * *)");
}
