import { db } from './db';
import { events } from '@shared/schema';

export type EventType = 
  | 'mood' 
  | 'prayer' 
  | 'bible_read' 
  | 'bible_verse_saved'
  | 'devotional_read' 
  | 'note_created' 
  | 'guide_chat' 
  | 'video_watched' 
  | 'song_listened' 
  | 'resource_read'
  | 'circle_joined'
  | 'circle_post';

// Track pending flourishing calculations per user to avoid duplicate calls
const pendingCalculations = new Map<string, NodeJS.Timeout>();

// Auto-trigger flourishing calculation after event
async function autoCalculateFlourishing(userId: string) {
  // Clear any existing pending calculation for this user
  const existing = pendingCalculations.get(userId);
  if (existing) {
    clearTimeout(existing);
  }

  // Debounce: wait 5 seconds before calculating to batch multiple events
  const timeout = setTimeout(async () => {
    try {
      const { runFlourishingEngine } = await import('./personalization');
      await runFlourishingEngine(userId);
      console.log(`✨ Auto-calculated flourishing scores for user ${userId}`);
    } catch (error) {
      console.error('Failed to auto-calculate flourishing:', error);
    } finally {
      pendingCalculations.delete(userId);
    }
  }, 5000); // 5 second debounce

  pendingCalculations.set(userId, timeout);
}

// Auto-trigger personalization engines based on event type
async function autoGeneratePersonalizations(userId: string, eventType: EventType) {
  try {
    const { 
      runBibleVerseEngine, runDevotionalEngine, runVideoEngine,
      runSongEngine, runSermonEngine, runResourceEngine
    } = await import('./personalization');

    // Events that trigger spiritual content personalization
    const spiritualEvents: EventType[] = ['mood', 'prayer', 'note_created', 'guide_chat'];
    
    // Events that refine existing recommendations
    const engagementEvents: EventType[] = ['video_watched', 'song_listened', 'resource_read', 'bible_verse_saved'];
    
    // Community events trigger broader personalization
    const communityEvents: EventType[] = ['circle_joined', 'circle_post'];

    if (spiritualEvents.includes(eventType)) {
      // Generate ALL personalized content for spiritual events
      console.log(`🎯 Triggering real-time personalization for ${eventType}...`);
      
      await Promise.allSettled([
        runBibleVerseEngine(userId),
        runDevotionalEngine(userId),
        runVideoEngine(userId),
        runSongEngine(userId),
        runSermonEngine(userId),
        runResourceEngine(userId)
      ]);
      
      console.log(`✨ Real-time personalization complete for user ${userId}`);
    } else if (engagementEvents.includes(eventType)) {
      // Refine recommendations based on engagement
      console.log(`🔄 Refining recommendations based on ${eventType}...`);
      
      if (eventType === 'video_watched') {
        await runVideoEngine(userId);
      } else if (eventType === 'song_listened') {
        await runSongEngine(userId);
      } else if (eventType === 'resource_read') {
        await runResourceEngine(userId);
      } else if (eventType === 'bible_verse_saved') {
        await runBibleVerseEngine(userId);
      }
    } else if (communityEvents.includes(eventType)) {
      // Community engagement triggers devotional and resource updates
      await Promise.allSettled([
        runDevotionalEngine(userId),
        runResourceEngine(userId)
      ]);
      console.log(`👥 Updated community-based recommendations for user ${userId}`);
    }
  } catch (error) {
    console.error('Failed to auto-generate personalizations:', error);
  }
}

export async function createEvent(
  userId: string,
  eventType: EventType,
  eventData: Record<string, any>,
  immediate: boolean = false
): Promise<void> {
  try {
    await db.insert(events).values({
      userId,
      eventType,
      eventData
    });

    // Fire-and-forget: trigger personalization engines in background without blocking
    autoGeneratePersonalizations(userId, eventType).catch(err => 
      console.error('Background personalization failed:', err)
    );

    // Fire-and-forget: trigger flourishing calculation in background
    if (immediate) {
      // Immediate calculation for user-triggered actions (no debounce, but still non-blocking)
      (async () => {
        try {
          const { runFlourishingEngine } = await import('./personalization');
          await runFlourishingEngine(userId);
          console.log(`✨ Immediately calculated flourishing scores for user ${userId}`);
        } catch (err) {
          console.error('Immediate flourishing calculation failed:', err);
        }
      })();
    } else {
      // Debounced calculation for background events (also fire-and-forget)
      autoCalculateFlourishing(userId).catch(err =>
        console.error('Background flourishing calculation failed:', err)
      );
    }
  } catch (error) {
    console.error('Failed to create event:', error);
  }
}

export async function getRecentEvents(userId: string, limit: number = 20) {
  const { eq: eqOp } = await import('drizzle-orm');
  return db.select()
    .from(events)
    .where(eqOp(events.userId, userId))
    .orderBy(events.createdAt)
    .limit(limit);
}
