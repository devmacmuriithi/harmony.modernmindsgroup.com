import { db } from './db';
import { users } from '@shared/schema';
import { runFlourishingEngine } from './personalization';

// Background job: Recalculate flourishing scores every 30 minutes for all users
export function startBackgroundJobs() {
  console.log('🔄 Starting background jobs...');

  // Run flourishing calculation every 30 minutes
  const THIRTY_MINUTES = 30 * 60 * 1000;
  
  setInterval(async () => {
    try {
      console.log('🔄 Running scheduled flourishing calculation...');
      
      // Get all users
      const allUsers = await db.select({ id: users.id }).from(users);
      
      // Calculate for each user
      for (const user of allUsers) {
        try {
          await runFlourishingEngine(user.id);
          console.log(`✨ Calculated flourishing for user ${user.id}`);
        } catch (error) {
          console.error(`Failed to calculate flourishing for user ${user.id}:`, error);
        }
      }
      
      console.log(`✅ Completed flourishing calculation for ${allUsers.length} users`);
    } catch (error) {
      console.error('Background job error:', error);
    }
  }, THIRTY_MINUTES);

  console.log(`✅ Background jobs started (flourishing recalculation every 30 minutes)`);
}
