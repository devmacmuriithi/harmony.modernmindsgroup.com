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

// Auto-trigger Bible verse generation for note_created events
async function autoGenerateBibleVerses(userId: string) {
  try {
    const { runBibleVerseEngine } = await import('./personalization');
    await runBibleVerseEngine(userId);
    console.log(`📖 Auto-generated Bible verse recommendation for user ${userId}`);
  } catch (error) {
    console.error('Failed to auto-generate Bible verses:', error);
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

    // Auto-trigger Bible verse generation for note_created events
    if (eventType === 'note_created') {
      await autoGenerateBibleVerses(userId);
    }

    // Auto-trigger flourishing calculation after event
    if (immediate) {
      // Immediate calculation for user-triggered actions (no debounce)
      const { runFlourishingEngine } = await import('./personalization');
      await runFlourishingEngine(userId);
      console.log(`✨ Immediately calculated flourishing scores for user ${userId}`);
    } else {
      // Debounced calculation for background events
      await autoCalculateFlourishing(userId);
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
