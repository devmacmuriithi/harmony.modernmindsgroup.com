import { type Express } from "express";
import { createServer, type Server } from "http";
import { db } from './db';
import { 
  users, moods, prayerJournals, devotionals, bibleVerses, syncNotes,
  spiritualGuides, conversations, messages, prayerChains, prayerChainComments,
  videos, songs, sermons, resources, flourishingScores,
  faithCircles, faithCircleMembers, faithCirclePosts,
  insertFaithCircleSchema, insertFaithCirclePostSchema
} from '@shared/schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import './auth'; // Import session type declarations
import { hashPassword, verifyPassword, requireAuth } from './auth';
import { createEvent } from './events';
import { 
  runBibleVerseEngine, runDevotionalEngine, runVideoEngine,
  runSongEngine, runSermonEngine, runResourceEngine, runFlourishingEngine
} from './personalization';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ AUTHENTICATION ============
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Email and password required' }
        });
      }

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'Email already registered' }
        });
      }

      const hashedPassword = await hashPassword(password);
      const user = await db.insert(users).values({
        email,
        password: hashedPassword,
        name: name || null
      }).returning();

      req.session.userId = user[0].id;
      
      res.json({
        success: true,
        data: { id: user[0].id, email: user[0].email, name: user[0].name }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Registration failed' }
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
      }

      const valid = await verifyPassword(password, user[0].password);
      if (!valid) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        });
      }

      req.session.userId = user[0].id;
      
      res.json({
        success: true,
        data: { id: user[0].id, email: user[0].email, name: user[0].name }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Login failed' }
      });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  });

  // ============ MOODS ============
  
  app.get('/api/moods', requireAuth, async (req, res) => {
    try {
      const userMoods = await db.select().from(moods)
        .where(eq(moods.userId, req.user!.id))
        .orderBy(desc(moods.createdAt));
      
      res.json({ success: true, data: userMoods });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch moods' } });
    }
  });

  app.post('/api/moods', requireAuth, async (req, res) => {
    try {
      const { moodType, notes } = req.body;
      
      const mood = await db.insert(moods).values({
        userId: req.user!.id,
        moodType,
        notes
      }).returning();

      await createEvent(req.user!.id, 'mood', { mood_type: moodType, notes });
      
      res.json({ success: true, data: mood[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create mood' } });
    }
  });

  // ============ PRAYER JOURNALS ============
  
  app.get('/api/prayers', requireAuth, async (req, res) => {
    try {
      const prayers = await db.select().from(prayerJournals)
        .where(eq(prayerJournals.userId, req.user!.id))
        .orderBy(desc(prayerJournals.createdAt));
      
      res.json({ success: true, data: prayers });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch prayers' } });
    }
  });

  app.post('/api/prayers', requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      
      const prayer = await db.insert(prayerJournals).values({
        userId: req.user!.id,
        content
      }).returning();

      await createEvent(req.user!.id, 'prayer', { content, is_answered: false });
      
      res.json({ success: true, data: prayer[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create prayer' } });
    }
  });

  app.patch('/api/prayers/:id/answer', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAnswered } = req.body;
      
      const prayer = await db.update(prayerJournals)
        .set({ 
          isAnswered,
          answeredAt: isAnswered ? new Date() : null
        })
        .where(and(
          eq(prayerJournals.id, id),
          eq(prayerJournals.userId, req.user!.id)
        ))
        .returning();
      
      // Track prayer answered event with details
      if (isAnswered && prayer[0]) {
        await createEvent(req.user!.id, 'prayer', { 
          content: prayer[0].content,
          is_answered: true,
          action: 'answered'
        });
      }
      
      res.json({ success: true, data: prayer[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to update prayer' } });
    }
  });

  app.delete('/api/prayers/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(prayerJournals).where(and(
        eq(prayerJournals.id, req.params.id),
        eq(prayerJournals.userId, req.user!.id)
      ));
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to delete prayer' } });
    }
  });

  // ============ BIBLE VERSES ============
  
  app.get('/api/bible-verses', requireAuth, async (req, res) => {
    try {
      const verses = await db.select().from(bibleVerses)
        .where(eq(bibleVerses.userId, req.user!.id))
        .orderBy(desc(bibleVerses.createdAt))
        .limit(10);
      
      res.json({ success: true, data: verses });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch verses' } });
    }
  });

  app.post('/api/bible-verses/generate', requireAuth, async (req, res) => {
    try {
      const result = await runBibleVerseEngine(req.user!.id);
      await createEvent(req.user!.id, 'bible_read', { 
        book: result.verse.book, 
        chapter: result.verse.chapter, 
        verses: `${result.verse.verseStart}-${result.verse.verseEnd}` 
      }, true); // immediate = true for user-triggered actions
      res.json(result);
    } catch (error) {
      console.error('Bible verse generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate verse' } });
    }
  });

  app.get('/api/bible-verses/search', requireAuth, async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY', message: 'Query parameter required' } });
      }

      // Use LLM to fetch the verse text
      const { llmClient } = await import('./llm-client');
      
      const prompt = `Return the Bible verse for: ${query}

IMPORTANT: Return ONLY a JSON object with this exact structure:
{
  "reference": "Book Chapter:Verse",
  "text": "The actual verse text",
  "translation": "Translation version"
}

Example response for "John 3:16 NIV":
{
  "reference": "John 3:16",
  "text": "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  "translation": "NIV"
}

Return the verse in the requested translation. If no translation specified, use NIV.`;

      const llmResponse = await llmClient.chatCompletion({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 800
      });
      
      // Robust JSON parsing with validation
      let verseData;
      try {
        verseData = JSON.parse(llmResponse.content);
        
        // Validate required fields
        if (!verseData || typeof verseData !== 'object') {
          throw new Error('Invalid response structure');
        }
        
        if (!verseData.reference || typeof verseData.reference !== 'string') {
          throw new Error('Missing or invalid reference');
        }
        
        if (!verseData.text || typeof verseData.text !== 'string') {
          throw new Error('Missing or invalid verse text');
        }
        
      } catch (parseError) {
        console.error('LLM response parsing failed:', parseError);
        console.error('Raw LLM response:', llmResponse.content);
        return res.status(404).json({ 
          success: false, 
          error: { 
            code: 'VERSE_NOT_FOUND', 
            message: 'Could not retrieve verse. Please try a different reference.' 
          } 
        });
      }
      
      res.json({ 
        success: true, 
        data: {
          reference: verseData.reference.trim(),
          text: verseData.text.trim(),
          translation: verseData.translation?.trim() || 'NIV'
        }
      });
    } catch (error) {
      console.error('Bible verse search error:', error);
      res.status(500).json({ success: false, error: { code: 'SEARCH_FAILED', message: 'Failed to search verse' } });
    }
  });

  app.post('/api/bible-verses/save', requireAuth, async (req, res) => {
    try {
      const { reference, text, translation, book, chapter, verseStart, verseEnd } = req.body;
      
      if (!reference || !text) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_DATA', message: 'Reference and text required' } });
      }

      // Parse Bible reference properly (handles multi-word books like "1 Corinthians")
      // Reference format: "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
      let parsedBook = book;
      let parsedChapter = chapter;
      let parsedVerseStart = verseStart;
      let parsedVerseEnd = verseEnd;

      if (!parsedBook || !parsedChapter || !parsedVerseStart) {
        // Split reference into book and verses
        const colonIndex = reference.lastIndexOf(':');
        if (colonIndex === -1) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_REFERENCE', message: 'Invalid verse reference format' } });
        }

        const bookAndChapter = reference.substring(0, colonIndex).trim();
        const verses = reference.substring(colonIndex + 1).trim();

        // Extract chapter (last number before colon)
        const parts = bookAndChapter.split(' ');
        parsedChapter = parseInt(parts[parts.length - 1]);
        parsedBook = parts.slice(0, -1).join(' ');

        // Extract verse start and end
        if (verses.includes('-')) {
          const [start, end] = verses.split('-');
          parsedVerseStart = parseInt(start);
          parsedVerseEnd = parseInt(end);
        } else {
          parsedVerseStart = parseInt(verses);
          parsedVerseEnd = null;
        }
      }

      // Save to bible_verses table with the correct translation
      const result = await db.insert(bibleVerses).values({
        userId: req.user!.id,
        book: parsedBook,
        chapter: parsedChapter,
        verseStart: parsedVerseStart,
        verseEnd: parsedVerseEnd,
        translation: translation || 'NIV',
        content: text,
        notes: null
      }).returning();

      // Create event for verse saved (with immediate flourishing calculation)
      await createEvent(req.user!.id, 'bible_verse_saved', { 
        reference,
        book: result[0].book,
        chapter: result[0].chapter 
      }, true); // immediate = true for user-triggered saves

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Bible verse save error:', error);
      res.status(500).json({ success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save verse' } });
    }
  });

  // ============ DEVOTIONALS ============
  
  app.get('/api/devotionals', requireAuth, async (req, res) => {
    try {
      const devos = await db.select().from(devotionals)
        .where(eq(devotionals.userId, req.user!.id))
        .orderBy(desc(devotionals.createdAt))
        .limit(10);
      
      res.json({ success: true, data: devos });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch devotionals' } });
    }
  });

  app.post('/api/devotionals/generate', requireAuth, async (req, res) => {
    try {
      const result = await runDevotionalEngine(req.user!.id);
      await createEvent(req.user!.id, 'devotional_read', { title: result.devotional.title, was_personalized: true });
      res.json(result);
    } catch (error) {
      console.error('Devotional generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate devotional' } });
    }
  });

  // ============ SYNC NOTES ============
  
  app.get('/api/notes', requireAuth, async (req, res) => {
    try {
      const notes = await db.select().from(syncNotes)
        .where(eq(syncNotes.userId, req.user!.id))
        .orderBy(desc(syncNotes.updatedAt));
      
      res.json({ success: true, data: notes });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch notes' } });
    }
  });

  app.post('/api/notes', requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      
      // Use AI to generate tags
      const tagResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'Extract 2-4 relevant spiritual/faith tags from this note. Return ONLY a JSON array of strings. Example: ["prayer", "faith", "trust"]'
        }, {
          role: 'user',
          content
        }],
        temperature: 0.5,
        max_tokens: 100
      });

      const tags = JSON.parse(tagResponse.choices[0].message.content || '[]');
      
      const note = await db.insert(syncNotes).values({
        userId: req.user!.id,
        content,
        aiTags: tags
      }).returning();

      await createEvent(req.user!.id, 'note_created', { tags, content });
      
      res.json({ success: true, data: note[0] });
    } catch (error) {
      console.error('Note creation error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create note' } });
    }
  });

  app.patch('/api/notes/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const note = await db.update(syncNotes)
        .set({ content, updatedAt: new Date() })
        .where(and(
          eq(syncNotes.id, id),
          eq(syncNotes.userId, req.user!.id)
        ))
        .returning();
      
      // Track note update event with content
      if (note[0]) {
        await createEvent(req.user!.id, 'note_created', { 
          tags: note[0].aiTags || [],
          content: note[0].content,
          action: 'updated'
        });
      }
      
      res.json({ success: true, data: note[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to update note' } });
    }
  });

  app.delete('/api/notes/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(syncNotes).where(and(
        eq(syncNotes.id, req.params.id),
        eq(syncNotes.userId, req.user!.id)
      ));
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to delete note' } });
    }
  });

  // ============ SPIRITUAL GUIDES ============
  
  app.get('/api/guides', async (req, res) => {
    try {
      const guides = await db.select().from(spiritualGuides);
      res.json({ success: true, data: guides });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch guides' } });
    }
  });

  app.get('/api/conversations', requireAuth, async (req, res) => {
    try {
      const convos = await db.select().from(conversations)
        .where(eq(conversations.userId, req.user!.id))
        .orderBy(desc(conversations.updatedAt));
      
      res.json({ success: true, data: convos });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch conversations' } });
    }
  });

  app.post('/api/conversations', requireAuth, async (req, res) => {
    try {
      const { guideId, title } = req.body;
      
      const conversation = await db.insert(conversations).values({
        userId: req.user!.id,
        guideId,
        title: title || 'New Conversation'
      }).returning();
      
      res.json({ success: true, data: conversation[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create conversation' } });
    }
  });

  app.get('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
      const msgs = await db.select().from(messages)
        .where(eq(messages.conversationId, req.params.id))
        .orderBy(messages.createdAt);
      
      res.json({ success: true, data: msgs });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch messages' } });
    }
  });

  app.post('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      const conversationId = req.params.id;
      
      // Save user message
      const userMsg = await db.insert(messages).values({
        conversationId,
        role: 'user',
        content
      }).returning();

      // Get conversation and guide details
      const convo = await db.select().from(conversations)
        .where(eq(conversations.id, conversationId)).limit(1);
      
      const guide = await db.select().from(spiritualGuides)
        .where(eq(spiritualGuides.id, convo[0].guideId)).limit(1);

      // Get conversation history
      const history = await db.select().from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt)
        .limit(10);

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: guide[0].systemPrompt },
          ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const aiContent = response.choices[0].message.content || '';

      // Save AI response
      const aiMsg = await db.insert(messages).values({
        conversationId,
        role: 'assistant',
        content: aiContent
      }).returning();

      await createEvent(req.user!.id, 'guide_chat', { 
        guide_name: guide[0].name, 
        message_preview: content.substring(0, 50) 
      });

      res.json({ 
        success: true, 
        data: { userMessage: userMsg[0], aiMessage: aiMsg[0] }
      });
    } catch (error) {
      console.error('Message creation error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create message' } });
    }
  });

  // ============ PRAYER CHAINS ============
  
  app.get('/api/prayer-chains', requireAuth, async (req, res) => {
    try {
      const chains = await db.select().from(prayerChains)
        .orderBy(desc(prayerChains.createdAt))
        .limit(50);
      
      res.json({ success: true, data: chains });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch prayer chains' } });
    }
  });

  app.post('/api/prayer-chains', requireAuth, async (req, res) => {
    try {
      const { title, content } = req.body;
      
      const chain = await db.insert(prayerChains).values({
        userId: req.user!.id,
        title,
        content
      }).returning();
      
      res.json({ success: true, data: chain[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create prayer chain' } });
    }
  });

  app.get('/api/prayer-chains/:id/comments', async (req, res) => {
    try {
      const comments = await db.select().from(prayerChainComments)
        .where(eq(prayerChainComments.prayerChainId, req.params.id))
        .orderBy(prayerChainComments.createdAt);
      
      res.json({ success: true, data: comments });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch comments' } });
    }
  });

  app.post('/api/prayer-chains/:id/comments', requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      
      const comment = await db.insert(prayerChainComments).values({
        prayerChainId: req.params.id,
        userId: req.user!.id,
        content
      }).returning();
      
      res.json({ success: true, data: comment[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create comment' } });
    }
  });

  // ============ VIDEOS ============
  
  app.get('/api/videos', requireAuth, async (req, res) => {
    try {
      const userVideos = await db.select().from(videos)
        .where(eq(videos.userId, req.user!.id))
        .orderBy(desc(videos.createdAt))
        .limit(20);
      
      res.json({ success: true, data: userVideos });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch videos' } });
    }
  });

  app.post('/api/videos/generate', requireAuth, async (req, res) => {
    try {
      const result = await runVideoEngine(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Video generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate videos' } });
    }
  });

  app.post('/api/videos/:id/watch', requireAuth, async (req, res) => {
    try {
      const video = await db.select().from(videos)
        .where(eq(videos.id, req.params.id)).limit(1);
      
      if (video.length > 0) {
        await createEvent(req.user!.id, 'video_watched', { 
          title: video[0].title, 
          youtube_id: video[0].youtubeId 
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to track video' } });
    }
  });

  // ============ SONGS ============
  
  app.get('/api/songs', requireAuth, async (req, res) => {
    try {
      const userSongs = await db.select().from(songs)
        .where(eq(songs.userId, req.user!.id))
        .orderBy(desc(songs.createdAt))
        .limit(20);
      
      res.json({ success: true, data: userSongs });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch songs' } });
    }
  });

  app.post('/api/songs/generate', requireAuth, async (req, res) => {
    try {
      const result = await runSongEngine(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Song generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate songs' } });
    }
  });

  app.post('/api/songs/:id/listen', requireAuth, async (req, res) => {
    try {
      const song = await db.select().from(songs)
        .where(eq(songs.id, req.params.id)).limit(1);
      
      if (song.length > 0) {
        await createEvent(req.user!.id, 'song_listened', { 
          title: song[0].title, 
          artist: song[0].artist,
          youtube_id: song[0].youtubeId 
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to track song' } });
    }
  });

  // ============ SERMONS ============
  
  app.get('/api/sermons', requireAuth, async (req, res) => {
    try {
      const userSermons = await db.select().from(sermons)
        .where(eq(sermons.userId, req.user!.id))
        .orderBy(desc(sermons.createdAt))
        .limit(20);
      
      res.json({ success: true, data: userSermons });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch sermons' } });
    }
  });

  app.post('/api/sermons/generate', requireAuth, async (req, res) => {
    try {
      const result = await runSermonEngine(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Sermon generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate sermons' } });
    }
  });

  // ============ RESOURCES (LIBRARY) ============
  
  app.get('/api/resources', requireAuth, async (req, res) => {
    try {
      const { type, search } = req.query;
      
      const conditions = [eq(resources.userId, req.user!.id)];

      if (type) {
        conditions.push(eq(resources.resourceType, type as string));
      }

      if (search) {
        conditions.push(
          or(
            ilike(resources.title, `%${search}%`),
            ilike(resources.description, `%${search}%`)
          )!
        );
      }

      const userResources = await db.select().from(resources)
        .where(and(...conditions))
        .orderBy(desc(resources.createdAt))
        .limit(50);
      
      res.json({ success: true, data: userResources });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch resources' } });
    }
  });

  app.post('/api/resources/generate', requireAuth, async (req, res) => {
    try {
      const result = await runResourceEngine(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Resource generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate resources' } });
    }
  });

  app.post('/api/resources/:id/read', requireAuth, async (req, res) => {
    try {
      const resource = await db.select().from(resources)
        .where(eq(resources.id, req.params.id)).limit(1);
      
      if (resource.length > 0) {
        await createEvent(req.user!.id, 'resource_read', { 
          title: resource[0].title, 
          resource_type: resource[0].resourceType,
          url: resource[0].url
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to track resource' } });
    }
  });

  // ============ FLOURISHING INDEX ============
  
  app.get('/api/flourishing', requireAuth, async (req, res) => {
    try {
      const scores = await db.select().from(flourishingScores)
        .where(eq(flourishingScores.userId, req.user!.id))
        .orderBy(desc(flourishingScores.createdAt))
        .limit(1);
      
      res.json({ success: true, data: scores[0] || null });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch flourishing scores' } });
    }
  });

  app.post('/api/flourishing/generate', requireAuth, async (req, res) => {
    try {
      const result = await runFlourishingEngine(req.user!.id);
      res.json(result);
    } catch (error) {
      console.error('Flourishing generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to calculate flourishing scores' } });
    }
  });

  // ============ FAITH CIRCLES ============
  
  // Get all faith circles
  app.get('/api/faith-circles', requireAuth, async (req, res) => {
    try {
      const { category, search } = req.query;
      
      const conditions = [];
      if (category && category !== 'all') {
        conditions.push(eq(faithCircles.category, category as string));
      }
      if (search) {
        conditions.push(
          or(
            ilike(faithCircles.title, `%${search}%`),
            ilike(faithCircles.description, `%${search}%`)
          )
        );
      }
      
      const circles = await db.select({
        id: faithCircles.id,
        creatorId: faithCircles.creatorId,
        title: faithCircles.title,
        description: faithCircles.description,
        category: faithCircles.category,
        memberCount: faithCircles.memberCount,
        isPublic: faithCircles.isPublic,
        createdAt: faithCircles.createdAt,
        updatedAt: faithCircles.updatedAt,
        creatorName: users.name,
      })
      .from(faithCircles)
      .leftJoin(users, eq(faithCircles.creatorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(faithCircles.updatedAt));
      
      // Check which circles the user has joined
      const userMemberships = await db.select()
        .from(faithCircleMembers)
        .where(eq(faithCircleMembers.userId, req.user!.id));
      
      const membershipMap = new Map(userMemberships.map(m => [m.circleId, true]));
      
      const circlesWithMembership = circles.map(circle => ({
        ...circle,
        isMember: membershipMap.has(circle.id)
      }));
      
      res.json({ success: true, data: circlesWithMembership });
    } catch (error) {
      console.error('Faith circles fetch error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch faith circles' } });
    }
  });

  // Create new faith circle
  app.post('/api/faith-circles', requireAuth, async (req, res) => {
    try {
      const validated = insertFaithCircleSchema.parse({
        ...req.body,
        creatorId: req.user!.id
      });
      
      const circle = await db.insert(faithCircles).values(validated).returning();
      
      // Automatically join the creator as a member
      await db.insert(faithCircleMembers).values({
        circleId: circle[0].id,
        userId: req.user!.id
      });
      
      // Update member count
      await db.update(faithCircles)
        .set({ memberCount: 1 })
        .where(eq(faithCircles.id, circle[0].id));
      
      res.json({ success: true, data: circle[0] });
    } catch (error) {
      console.error('Create circle error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create circle' } });
    }
  });

  // Get circle details
  app.get('/api/faith-circles/:id', requireAuth, async (req, res) => {
    try {
      const circle = await db.select({
        id: faithCircles.id,
        creatorId: faithCircles.creatorId,
        title: faithCircles.title,
        description: faithCircles.description,
        category: faithCircles.category,
        memberCount: faithCircles.memberCount,
        isPublic: faithCircles.isPublic,
        createdAt: faithCircles.createdAt,
        updatedAt: faithCircles.updatedAt,
        creatorName: users.name,
      })
      .from(faithCircles)
      .leftJoin(users, eq(faithCircles.creatorId, users.id))
      .where(eq(faithCircles.id, req.params.id))
      .limit(1);
      
      if (circle.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Circle not found' } });
      }
      
      // Check if user is a member
      const membership = await db.select()
        .from(faithCircleMembers)
        .where(and(
          eq(faithCircleMembers.circleId, req.params.id),
          eq(faithCircleMembers.userId, req.user!.id)
        ))
        .limit(1);
      
      res.json({ 
        success: true, 
        data: {
          ...circle[0],
          isMember: membership.length > 0
        }
      });
    } catch (error) {
      console.error('Circle details error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch circle details' } });
    }
  });

  // Join circle
  app.post('/api/faith-circles/:id/join', requireAuth, async (req, res) => {
    try {
      // Check if already a member
      const existing = await db.select()
        .from(faithCircleMembers)
        .where(and(
          eq(faithCircleMembers.circleId, req.params.id),
          eq(faithCircleMembers.userId, req.user!.id)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: { code: 'ALREADY_MEMBER', message: 'Already a member of this circle' } });
      }
      
      // Add member
      await db.insert(faithCircleMembers).values({
        circleId: req.params.id,
        userId: req.user!.id
      });
      
      // Increment member count
      await db.update(faithCircles)
        .set({ memberCount: sql`${faithCircles.memberCount} + 1` })
        .where(eq(faithCircles.id, req.params.id));
      
      // Get circle info for event
      const circle = await db.select().from(faithCircles)
        .where(eq(faithCircles.id, req.params.id))
        .limit(1);
      
      if (circle.length > 0) {
        await createEvent(req.user!.id, 'circle_joined', {
          circle_id: req.params.id,
          circle_title: circle[0].title
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Join circle error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to join circle' } });
    }
  });

  // Leave circle
  app.post('/api/faith-circles/:id/leave', requireAuth, async (req, res) => {
    try {
      // Remove member
      await db.delete(faithCircleMembers)
        .where(and(
          eq(faithCircleMembers.circleId, req.params.id),
          eq(faithCircleMembers.userId, req.user!.id)
        ));
      
      // Decrement member count
      await db.update(faithCircles)
        .set({ memberCount: sql`${faithCircles.memberCount} - 1` })
        .where(eq(faithCircles.id, req.params.id));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Leave circle error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to leave circle' } });
    }
  });

  // Get circle posts
  app.get('/api/faith-circles/:id/posts', requireAuth, async (req, res) => {
    try {
      const posts = await db.select({
        id: faithCirclePosts.id,
        circleId: faithCirclePosts.circleId,
        userId: faithCirclePosts.userId,
        content: faithCirclePosts.content,
        createdAt: faithCirclePosts.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(faithCirclePosts)
      .leftJoin(users, eq(faithCirclePosts.userId, users.id))
      .where(eq(faithCirclePosts.circleId, req.params.id))
      .orderBy(desc(faithCirclePosts.createdAt))
      .limit(50);
      
      res.json({ success: true, data: posts });
    } catch (error) {
      console.error('Fetch posts error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch posts' } });
    }
  });

  // Create post in circle
  app.post('/api/faith-circles/:id/posts', requireAuth, async (req, res) => {
    try {
      // Check if user is a member
      const membership = await db.select()
        .from(faithCircleMembers)
        .where(and(
          eq(faithCircleMembers.circleId, req.params.id),
          eq(faithCircleMembers.userId, req.user!.id)
        ))
        .limit(1);
      
      if (membership.length === 0) {
        return res.status(403).json({ success: false, error: { code: 'NOT_MEMBER', message: 'Must be a member to post' } });
      }
      
      const validated = insertFaithCirclePostSchema.parse({
        circleId: req.params.id,
        userId: req.user!.id,
        content: req.body.content
      });
      
      const post = await db.insert(faithCirclePosts).values(validated).returning();
      
      // Update circle's updated_at
      await db.update(faithCircles)
        .set({ updatedAt: new Date() })
        .where(eq(faithCircles.id, req.params.id));
      
      // Get circle info for event
      const circle = await db.select().from(faithCircles)
        .where(eq(faithCircles.id, req.params.id))
        .limit(1);
      
      if (circle.length > 0) {
        await createEvent(req.user!.id, 'circle_post', {
          circle_id: req.params.id,
          circle_title: circle[0].title,
          post_preview: validated.content.substring(0, 100)
        });
      }
      
      // Return post with user info
      const postWithUser = await db.select({
        id: faithCirclePosts.id,
        circleId: faithCirclePosts.circleId,
        userId: faithCirclePosts.userId,
        content: faithCirclePosts.content,
        createdAt: faithCirclePosts.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(faithCirclePosts)
      .leftJoin(users, eq(faithCirclePosts.userId, users.id))
      .where(eq(faithCirclePosts.id, post[0].id))
      .limit(1);
      
      res.json({ success: true, data: postWithUser[0] });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create post' } });
    }
  });

  // ============ GLOBAL SEARCH ============
  
  app.get('/api/search', requireAuth, async (req, res) => {
    try {
      const query = (req.query.q as string)?.trim();
      
      if (!query || query.length < 2) {
        return res.json({ success: true, data: { results: [] } });
      }

      const searchTerm = `%${query}%`;
      const limit = 5; // Top 5 results per category

      // Search across all entities in parallel
      const [
        bibleResults,
        prayerResults,
        devotionalResults,
        noteResults,
        guideResults,
        videoResults,
        songResults,
        sermonResults,
        resourceResults,
        circleResults
      ] = await Promise.all([
        // Bible verses
        db.select({
          id: bibleVerses.id,
          type: sql<string>`'bible'`,
          title: sql<string>`${bibleVerses.book} || ' ' || ${bibleVerses.chapter} || ':' || ${bibleVerses.verseStart}`,
          subtitle: bibleVerses.translation,
          content: bibleVerses.content
        })
        .from(bibleVerses)
        .where(and(
          eq(bibleVerses.userId, req.user!.id),
          or(
            ilike(bibleVerses.book, searchTerm),
            ilike(bibleVerses.content, searchTerm)
          )
        ))
        .limit(limit),

        // Prayers
        db.select({
          id: prayerJournals.id,
          type: sql<string>`'prayer'`,
          title: sql<string>`SUBSTRING(${prayerJournals.content}, 1, 50)`,
          subtitle: sql<string>`CASE WHEN ${prayerJournals.isAnswered} THEN 'Answered' ELSE 'Ongoing' END`,
          content: prayerJournals.content
        })
        .from(prayerJournals)
        .where(and(
          eq(prayerJournals.userId, req.user!.id),
          ilike(prayerJournals.content, searchTerm)
        ))
        .limit(limit),

        // Devotionals
        db.select({
          id: devotionals.id,
          type: sql<string>`'devotional'`,
          title: devotionals.title,
          subtitle: devotionals.scriptureReference,
          content: devotionals.content
        })
        .from(devotionals)
        .where(and(
          eq(devotionals.userId, req.user!.id),
          or(
            ilike(devotionals.title, searchTerm),
            ilike(devotionals.content, searchTerm)
          )
        ))
        .limit(limit),

        // Notes
        db.select({
          id: syncNotes.id,
          type: sql<string>`'note'`,
          title: sql<string>`SUBSTRING(${syncNotes.content}, 1, 50)`,
          subtitle: sql<string>`ARRAY_TO_STRING(${syncNotes.aiTags}, ', ')`,
          content: syncNotes.content
        })
        .from(syncNotes)
        .where(and(
          eq(syncNotes.userId, req.user!.id),
          ilike(syncNotes.content, searchTerm)
        ))
        .limit(limit),

        // Spiritual Guides
        db.select({
          id: spiritualGuides.id,
          type: sql<string>`'guide'`,
          title: spiritualGuides.name,
          subtitle: sql<string>`'AI Spiritual Guide'`,
          content: sql<string>`NULL`
        })
        .from(spiritualGuides)
        .where(
          ilike(spiritualGuides.name, searchTerm)
        )
        .limit(limit),

        // Videos
        db.select({
          id: videos.id,
          type: sql<string>`'video'`,
          title: videos.title,
          subtitle: videos.channelName,
          content: sql<string>`NULL`
        })
        .from(videos)
        .where(and(
          eq(videos.userId, req.user!.id),
          or(
            ilike(videos.title, searchTerm),
            ilike(videos.channelName, searchTerm)
          )
        ))
        .limit(limit),

        // Songs
        db.select({
          id: songs.id,
          type: sql<string>`'song'`,
          title: songs.title,
          subtitle: songs.artist,
          content: sql<string>`NULL`
        })
        .from(songs)
        .where(and(
          eq(songs.userId, req.user!.id),
          or(
            ilike(songs.title, searchTerm),
            ilike(songs.artist, searchTerm)
          )
        ))
        .limit(limit),

        // Sermons
        db.select({
          id: sermons.id,
          type: sql<string>`'sermon'`,
          title: sermons.title,
          subtitle: sermons.churchName,
          content: sql<string>`NULL`
        })
        .from(sermons)
        .where(and(
          eq(sermons.userId, req.user!.id),
          or(
            ilike(sermons.title, searchTerm),
            ilike(sermons.churchName, searchTerm)
          )
        ))
        .limit(limit),

        // Resources
        db.select({
          id: resources.id,
          type: sql<string>`'resource'`,
          title: resources.title,
          subtitle: resources.author,
          content: resources.description
        })
        .from(resources)
        .where(and(
          eq(resources.userId, req.user!.id),
          or(
            ilike(resources.title, searchTerm),
            ilike(resources.description, searchTerm),
            ilike(resources.author, searchTerm)
          )
        ))
        .limit(limit),

        // Faith Circles
        db.select({
          id: faithCircles.id,
          type: sql<string>`'circle'`,
          title: faithCircles.title,
          subtitle: sql<string>`${faithCircles.memberCount} || ' members'`,
          content: faithCircles.description
        })
        .from(faithCircles)
        .where(
          or(
            ilike(faithCircles.title, searchTerm),
            ilike(faithCircles.description, searchTerm)
          )
        )
        .limit(limit)
      ]);

      // Combine and structure results
      const allResults = [
        ...bibleResults,
        ...prayerResults,
        ...devotionalResults,
        ...noteResults,
        ...guideResults,
        ...videoResults,
        ...songResults,
        ...sermonResults,
        ...resourceResults,
        ...circleResults
      ];

      res.json({ success: true, data: { results: allResults, query } });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ success: false, error: { code: 'SEARCH_ERROR', message: 'Failed to perform search' } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
