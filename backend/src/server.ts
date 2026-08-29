import app from '@/app';
import { ENV } from '@/config/env';
import { startReminderScheduler } from '@/scheduler';

const startServer = () => {
  try {
    // Start the reminder scheduler (non-blocking — failures won't crash the server)
    try {
      startReminderScheduler();
    } catch (schedulerError) {
      console.error('⚠️ Reminder scheduler failed to start (server will continue):', schedulerError);
    }

    app.listen(ENV.PORT, () => {
      console.log('--------------------------------------------------');
      console.log(`🚀 ${ENV.APP_NAME} started successfully!`);
      console.log(`📡 URL: ${ENV.BACKEND_URL}`);
      console.log(`🌍 MODE: ${ENV.NODE_ENV}`);
      console.log('--------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ CRITICAL: Could not start the server:', error);
    process.exit(1);
  }
};

startServer();
