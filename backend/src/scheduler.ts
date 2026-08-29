import cron from "node-cron";
import { sendEventReminders } from "@/services/email/event-reminder-service";

let isRunning = false;

export function startReminderScheduler(): void {
  console.log("⏰ Event reminder scheduler initialized");

  // Run every hour at the top of the hour
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

  console.log("⏰ Cron job scheduled: every hour (0 * * * *)");
}
