import { type Express } from "express";
import { createServer, type Server } from "http";
import { db } from './db';
import { 
  users, moods, prayerJournals, devotionals, bibleVerses, syncNotes,
  spiritualGuides, conversations, messages, prayerChains, prayerChainComments,
  videos, songs, sermons, resources, flourishingScores
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
      });
      res.json(result);
    } catch (error) {
      console.error('Bible verse generation error:', error);
      res.status(500).json({ success: false, error: { code: 'PERSONALIZATION_FAILED', message: 'Failed to generate verse' } });
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

      await createEvent(req.user!.id, 'note_created', { tags });
      
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

  const httpServer = createServer(app);
  return httpServer;
}
