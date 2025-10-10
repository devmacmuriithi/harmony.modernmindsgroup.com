import { db } from './db';
import { 
  personalizationRuns, 
  events, 
  bibleVerses, 
  devotionals,
  videos,
  songs,
  sermons,
  resources,
  flourishingScores
} from '@shared/schema';
import { desc, eq } from 'drizzle-orm';
import { llmClient } from './llm-client';

// Safe JSON parsing with error handling
function safeJsonParse<T>(jsonString: string, context: string): T {
  // Check if response is plain text instead of JSON
  const trimmed = jsonString.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    console.warn(`⚠️ AI returned plain text in ${context}:`, trimmed.substring(0, 200));
    
    // Return empty array for list contexts, empty object otherwise
    if (context.includes('Video') || context.includes('Song') || context.includes('Sermon') || context.includes('Resource')) {
      console.log(`  → Returning empty array for ${context}`);
      return [] as T;
    } else {
      throw new Error(`AI returned plain text instead of JSON in ${context}: ${trimmed.substring(0, 100)}`);
    }
  }
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error(`❌ JSON parse error in ${context}:`, error);
    console.error(`Raw response:`, jsonString.substring(0, 500));
    throw new Error(`Failed to parse AI response in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get events summary for AI with recency weighting
async function getEventsSummary(userId: string): Promise<string> {
  const recentEvents = await db.select()
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy(desc(events.createdAt))
    .limit(50);

  // Format with recency indicators (most recent first)
  return recentEvents.map((e, index) => {
    const recencyLabel = index < 10 ? '[RECENT]' : index < 25 ? '[MODERATE]' : '[OLDER]';
    return `${recencyLabel} ${e.eventType}: ${JSON.stringify(e.eventData)}`;
  }).join('\n');
}

// Bible Verse Engine
export async function runBibleVerseEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'bible_verse',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are a Bible recommendation AI. Based on user's recent spiritual activities, recommend ONE Bible verse.

CRITICAL RULES:
1. Return ONLY valid JSON. NO explanatory text before or after.
2. Use this EXACT structure:
{
  "book": "John",
  "chapter": 3,
  "verse_start": 16,
  "verse_end": 17,
  "translation": "NIV",
  "reason": "Brief explanation of why this verse fits their journey"
}

3. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities)
   - [MODERATE] = Important (activities 11-25)
   - [OLDER] = Context (activities 26-50)
   
   Weight [RECENT] activities HEAVILY in your recommendation.

User's recent activities (50 total, most recent first):
${eventsSummary}

Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a Bible verse recommendation based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 300
    });

    const aiResponse = response.content || '';
    const verse = safeJsonParse<any>(aiResponse, 'Bible Verse Engine');

    // Fetch actual verse content from Bible API
    // bible-api.com only supports: KJV, WEB (default), and a few others
    // Map any translation to a supported one
    const supportedTranslation = 'kjv'; // King James Version is widely supported
    
    const verseRef = verse.verse_end 
      ? `${verse.book}+${verse.chapter}:${verse.verse_start}-${verse.verse_end}`
      : `${verse.book}+${verse.chapter}:${verse.verse_start}`;
    
    let verseContent = '';
    try {
      const bibleResponse = await fetch(`https://bible-api.com/${verseRef}?translation=${supportedTranslation}`);
      
      if (!bibleResponse.ok) {
        throw new Error(`Bible API returned ${bibleResponse.status}`);
      }
      
      const bibleData = await bibleResponse.json();
      verseContent = bibleData.text?.trim() || '';
      
      if (!verseContent) {
        // Fallback if text is missing
        verseContent = `For the verse ${verse.book} ${verse.chapter}:${verse.verse_start}, please open your Bible.`;
      }
    } catch (error) {
      console.error('Failed to fetch verse content:', error);
      verseContent = `For the verse ${verse.book} ${verse.chapter}:${verse.verse_start}, please open your Bible.`;
    }

    await db.update(personalizationRuns)
      .set({ outputData: verse, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const result = await db.insert(bibleVerses).values({
      userId,
      book: verse.book,
      chapter: verse.chapter,
      verseStart: verse.verse_start,
      verseEnd: verse.verse_end,
      translation: 'KJV', // Store the actual translation used
      content: verseContent,
      notes: verse.reason,
      personalizationRunId: runId
    }).returning();

    return { success: true, verse: result[0] };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}

// Devotional Engine
export async function runDevotionalEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'devotional',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are a devotional content creator. Based on user's spiritual journey, create ONE personalized devotional.

CRITICAL RULES:
1. Return ONLY valid JSON. NO explanatory text before or after.
2. Use this EXACT structure:
{
  "title": "Short, inspiring title",
  "content": "2-3 paragraph devotional reflection (max 300 words)",
  "scripture_reference": "Book Chapter:Verse (choose a relevant scripture based on user's activities)"
}

3. IMPORTANT: Choose a scripture reference that matches the devotional theme and user's spiritual journey. Examples: "Romans 8:28", "Philippians 4:6-7", "Psalm 23:1", etc.

4. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities)
   - [MODERATE] = Important (activities 11-25)
   - [OLDER] = Context (activities 26-50)
   
   Focus PRIMARILY on [RECENT] activities when creating the devotional.

User's recent activities (50 total, most recent first):
${eventsSummary}

Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a devotional based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 500
    });

    const aiResponse = response.content || '';
    const devotional = safeJsonParse<any>(aiResponse, 'Devotional Engine');

    await db.update(personalizationRuns)
      .set({ outputData: devotional, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const result = await db.insert(devotionals).values({
      userId,
      title: devotional.title,
      content: devotional.content,
      scriptureReference: devotional.scripture_reference,
      personalizationRunId: runId
    }).returning();

    return { success: true, devotional: result[0] };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}

// Video Engine
export async function runVideoEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'video',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are a Christian content curator. Based on user's interests, recommend 3-5 relevant YouTube videos.

CRITICAL RULES:
1. Return ONLY valid JSON array. NO explanatory text before or after.
2. Use this EXACT structure:
[
  {
    "youtube_id": "dQw4w9WgXcQ",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Video title",
    "description": "Brief description of content and relevance",
    "channel_name": "Channel name",
    "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
]

IMPORTANT: 
- Provide REAL YouTube video IDs that you know exist
- Use the format: https://www.youtube.com/watch?v={VIDEO_ID}
- Thumbnail URL format: https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg
- Only recommend videos you are confident exist on YouTube

3. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities)
   - [MODERATE] = Important (activities 11-25)
   - [OLDER] = Context (activities 26-50)
   
   Match videos PRIMARILY to [RECENT] activities and current spiritual state.

User's recent activities (50 total, most recent first):
${eventsSummary}

Recommend videos about sermons, teachings, worship, testimonies, or Christian living. Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate video recommendations based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 1500
    });

    const aiResponse = response.content || '';
    const videoList = safeJsonParse<any[]>(aiResponse, 'Video Engine');

    await db.update(personalizationRuns)
      .set({ outputData: videoList, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const results = [];
    for (const video of videoList) {
      const result = await db.insert(videos).values({
        userId,
        youtubeId: video.youtube_id,
        youtubeUrl: video.youtube_url,
        title: video.title,
        description: video.description,
        channelName: video.channel_name,
        thumbnailUrl: video.thumbnail_url,
        personalizationRunId: runId
      }).returning();
      results.push(result[0]);
    }

    return { success: true, videos: results };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}

// Song Engine
export async function runSongEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'song',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are a worship music curator. Based on user's mood and spiritual state, recommend 3-5 worship songs.

CRITICAL RULES:
1. Return ONLY valid JSON array. NO explanatory text before or after.
2. Use this EXACT structure:
[
  {
    "youtube_id": "dQw4w9WgXcQ",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Song title",
    "artist": "Artist name",
    "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
]

3. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities)
   - [MODERATE] = Important (activities 11-25)
   - [OLDER] = Context (activities 26-50)
   
   Choose songs that match the user's CURRENT mood/state from [RECENT] activities.

User's recent activities (50 total, most recent first):
${eventsSummary}

Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate song recommendations based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });

    const aiResponse = response.content || '';
    const songList = safeJsonParse<any[]>(aiResponse, 'Song Engine');

    await db.update(personalizationRuns)
      .set({ outputData: songList, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const results = [];
    for (const song of songList) {
      const result = await db.insert(songs).values({
        userId,
        youtubeId: song.youtube_id,
        youtubeUrl: song.youtube_url,
        title: song.title,
        artist: song.artist,
        thumbnailUrl: song.thumbnail_url,
        personalizationRunId: runId
      }).returning();
      results.push(result[0]);
    }

    return { success: true, songs: results };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}

// Sermon Engine
export async function runSermonEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'sermon',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are an AI sermon curator. Based on user's spiritual needs, recommend 3 relevant sermon topics.

CRITICAL RULES:
1. Return ONLY valid JSON array. NO explanatory text before or after.
2. Use this EXACT structure:
[
  {
    "youtube_id": "dQw4w9WgXcQ",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Sermon title",
    "church_name": "Church name",
    "duration": "45:30",
    "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  }
]

3. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities)
   - [MODERATE] = Important (activities 11-25)
   - [OLDER] = Context (activities 26-50)
   
   Address the user's CURRENT spiritual needs from [RECENT] activities.

User's recent activities (50 total, most recent first):
${eventsSummary}

Generate AI-powered sermon recommendations that will encourage spiritual growth. Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate sermon recommendations based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 1500
    });

    const aiResponse = response.content || '';
    const sermonList = safeJsonParse<any[]>(aiResponse, 'Sermon Engine');

    await db.update(personalizationRuns)
      .set({ outputData: sermonList, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const results = [];
    for (const sermon of sermonList) {
      const result = await db.insert(sermons).values({
        userId,
        youtubeId: sermon.youtube_id,
        youtubeUrl: sermon.youtube_url,
        title: sermon.title,
        churchName: sermon.church_name,
        duration: sermon.duration,
        thumbnailUrl: sermon.thumbnail_url,
        personalizationRunId: runId
      }).returning();
      results.push(result[0]);
    }

    return { success: true, sermons: results };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}

// Resource Engine
export async function runResourceEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'resource',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are a Christian resource curator. Based on user's spiritual journey and interests, recommend 5-8 diverse resources for spiritual growth.

CRITICAL RULES:
1. Return ONLY valid JSON array. NO explanatory text before or after.
2. Use this EXACT structure:
[
  {
    "title": "Resource title",
    "description": "Brief description of content and why it's relevant (max 100 words)",
    "url": "https://example.com/resource",
    "resource_type": "article",
    "author": "Author name (if applicable)",
    "tags": ["theology", "prayer", "discipleship"]
  }
]

Resource types: article, blog, website, pdf, book, podcast, study

3. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities)
   - [MODERATE] = Important (activities 11-25)
   - [OLDER] = Context (activities 26-50)
   
   Recommend resources that address topics from [RECENT] activities first.

User's recent activities (50 total, most recent first):
${eventsSummary}

Provide diverse resource types. Include reputable Christian publishers, ministries, and authors. Ensure URLs are real and accessible. Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate resource recommendations based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 2000
    });

    const aiResponse = response.content || '';
    const resourceList = safeJsonParse<any[]>(aiResponse, 'Resource Engine');

    await db.update(personalizationRuns)
      .set({ outputData: resourceList, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const results = [];
    for (const resource of resourceList) {
      const result = await db.insert(resources).values({
        userId,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        resourceType: resource.resource_type,
        author: resource.author,
        tags: resource.tags,
        personalizationRunId: runId
      }).returning();
      results.push(result[0]);
    }

    return { success: true, resources: results };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}

// Flourishing Score Engine
export async function runFlourishingEngine(userId: string) {
  const eventsSummary = await getEventsSummary(userId);
  
  const run = await db.insert(personalizationRuns).values({
    userId,
    engineType: 'flourishing',
    inputData: { events_count: 50 },
    status: 'pending'
  }).returning();
  
  const runId = run[0].id;

  try {
    const systemPrompt = `You are a human flourishing analyst. Based on user's recent activities, assign scores (0-100) for each flourishing dimension and provide an actionable AI insight.

CRITICAL RULES:
1. Return ONLY valid JSON. NO explanatory text before or after.
2. Use this EXACT structure:
{
  "health_score": 85,
  "relationships_score": 72,
  "finances_score": 68,
  "meaning_score": 82,
  "happiness_score": 76,
  "character_score": 79,
  "faith_score": 84,
  "overall_index": 78,
  "ai_insight": "Your 'Faith' score is slightly lower this week. Consider spending more time in the Prayer Journal or reading Scripture."
}

Scoring guidelines:
- 80-100: Thriving
- 60-79: Stable
- 40-59: Struggling
- 0-39: Crisis

AI Insight guidelines:
- Make it personal and actionable
- Reference specific scores that need attention
- Suggest ONLY these valid Harmony apps: Prayer Journal, Bible, Devotional, Spiritual Guides, Mood Tracker, SyncNote (notes), Videos, Songs, Sermons, Library (resources), Faith Circles
- NEVER suggest apps not in the list above
- Keep it under 120 characters for tile display

3. PRIORITIZATION: Activities are labeled by recency:
   - [RECENT] = Most important (last 10 activities) - WEIGHT HEAVILY in scoring
   - [MODERATE] = Important (activities 11-25) - Consider for trends
   - [OLDER] = Context (activities 26-50) - Background only
   
   Score based PRIMARILY on [RECENT] activities to reflect current state.

User's recent activities (50 total, most recent first):
${eventsSummary}

Respond with JSON only.`;

    const response = await llmClient.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Calculate my flourishing scores based on my recent activities.' }
      ],
      temperature: 0.7,
      maxTokens: 500
    });

    const aiResponse = response.content || '';
    const scores = safeJsonParse<any>(aiResponse, 'Flourishing Engine');

    await db.update(personalizationRuns)
      .set({ outputData: scores, status: 'completed' })
      .where(eq(personalizationRuns.id, runId));

    const result = await db.insert(flourishingScores).values({
      userId,
      healthScore: scores.health_score,
      relationshipsScore: scores.relationships_score,
      financesScore: scores.finances_score,
      meaningScore: scores.meaning_score,
      happinessScore: scores.happiness_score,
      characterScore: scores.character_score,
      faithScore: scores.faith_score,
      overallIndex: scores.overall_index,
      aiInsight: scores.ai_insight,
      personalizationRunId: runId
    }).returning();

    return { success: true, scores: result[0] };
  } catch (error) {
    await db.update(personalizationRuns)
      .set({ status: 'failed' })
      .where(eq(personalizationRuns.id, runId));
    throw error;
  }
}
