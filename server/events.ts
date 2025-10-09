import { db } from './db';
import { events } from '@shared/schema';

export type EventType = 
  | 'mood' 
  | 'prayer' 
  | 'bible_read' 
  | 'devotional_read' 
  | 'note_created' 
  | 'guide_chat' 
  | 'video_watched' 
  | 'song_listened' 
  | 'resource_read';

export async function createEvent(
  userId: string,
  eventType: EventType,
  eventData: Record<string, any>
): Promise<void> {
  try {
    await db.insert(events).values({
      userId,
      eventType,
      eventData
    });
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
