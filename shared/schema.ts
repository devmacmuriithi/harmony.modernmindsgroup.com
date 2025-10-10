import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events Table (Central tracking)
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userCreatedIdx: index("idx_events_user_created").on(table.userId, table.createdAt),
}));

// Moods Table
export const moods = pgTable("moods", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  moodType: varchar("mood_type", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer Journals Table
export const prayerJournals = pgTable("prayer_journals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isAnswered: boolean("is_answered").default(false),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
  answeredAt: timestamp("answered_at"),
});

// Devotionals Table
export const devotionals = pgTable("devotionals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  scriptureReference: varchar("scripture_reference", { length: 100 }),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bible Verses Table
export const bibleVerses = pgTable("bible_verses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  book: varchar("book", { length: 50 }).notNull(),
  chapter: integer("chapter").notNull(),
  verseStart: integer("verse_start").notNull(),
  verseEnd: integer("verse_end"),
  translation: varchar("translation", { length: 10 }).default("NIV"),
  content: text("content"), // The actual verse text
  notes: text("notes"),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sync Notes Table
export const syncNotes = pgTable("sync_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  aiTags: text("ai_tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spiritual Guides Table
export const spiritualGuides = pgTable("spiritual_guides", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  avatarEmoji: varchar("avatar_emoji", { length: 10 }).default("🕊️"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations Table
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  guideId: uuid("guide_id").references(() => spiritualGuides.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages Table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer Chains Table
export const prayerChains = pgTable("prayer_chains", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isAnswered: boolean("is_answered").default(false),
  followerCount: integer("follower_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer Chain Comments Table
export const prayerChainComments = pgTable("prayer_chain_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  prayerChainId: uuid("prayer_chain_id").references(() => prayerChains.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos Table
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  youtubeId: varchar("youtube_id", { length: 50 }).notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  channelName: varchar("channel_name", { length: 255 }),
  thumbnailUrl: text("thumbnail_url"),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Songs Table
export const songs = pgTable("songs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  youtubeId: varchar("youtube_id", { length: 50 }).notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }),
  thumbnailUrl: text("thumbnail_url"),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sermons Table
export const sermons = pgTable("sermons", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  youtubeId: varchar("youtube_id", { length: 50 }).notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  churchName: varchar("church_name", { length: 255 }),
  duration: varchar("duration", { length: 20 }),
  thumbnailUrl: text("thumbnail_url"),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resources Table
export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: text("url").notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  author: varchar("author", { length: 255 }),
  tags: text("tags").array(),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  typeIdx: index("idx_resources_type").on(table.userId, table.resourceType),
}));

// Flourishing Scores Table
export const flourishingScores = pgTable("flourishing_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  healthScore: integer("health_score"),
  relationshipsScore: integer("relationships_score"),
  financesScore: integer("finances_score"),
  meaningScore: integer("meaning_score"),
  happinessScore: integer("happiness_score"),
  characterScore: integer("character_score"),
  faithScore: integer("faith_score"),
  overallIndex: integer("overall_index"),
  aiInsight: text("ai_insight"),
  personalizationRunId: uuid("personalization_run_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personalization Runs Table
export const personalizationRuns = pgTable("personalization_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  engineType: varchar("engine_type", { length: 50 }).notNull(),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Faith Circles Table (Community discussion groups/forums)
export const faithCircles = pgTable("faith_circles", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  memberCount: integer("member_count").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_faith_circles_category").on(table.category),
}));

// Faith Circle Members Table (Track who joined which circles)
export const faithCircleMembers = pgTable("faith_circle_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => faithCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  circleMembersIdx: index("idx_circle_members").on(table.circleId, table.userId),
}));

// Faith Circle Posts Table (Forum-style discussions)
export const faithCirclePosts = pgTable("faith_circle_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => faithCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  circlePostsIdx: index("idx_circle_posts").on(table.circleId, table.createdAt),
}));

// Financial Tables
// Transactions Table (All financial activities)
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // tithe, generosity, debt_payment, income, expense
  amount: varchar("amount", { length: 20 }).notNull(), // Stored as string to avoid decimal precision issues
  category: varchar("category", { length: 100 }), // groceries, rent, mission, offering
  spiritualTag: varchar("spiritual_tag", { length: 100 }), // mission, blessing, stewardship
  purpose: text("purpose"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userTypeIdx: index("idx_transactions_user_type").on(table.userId, table.transactionType),
}));

// Generosity Commitments Table
export const generosityCommitments = pgTable("generosity_commitments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  goal: text("goal").notNull(), // Description of the commitment
  targetAmount: varchar("target_amount", { length: 20 }), // Optional financial target
  currentAmount: varchar("current_amount", { length: 20 }).default("0"),
  frequency: varchar("frequency", { length: 50 }), // weekly, monthly, one-time
  status: varchar("status", { length: 20 }).default("active"), // active, completed, cancelled
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Goals Table
export const financialGoals = pgTable("financial_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // debt_free, emergency_fund, tithing_increase, sabbath_margin
  description: text("description"),
  targetAmount: varchar("target_amount", { length: 20 }),
  currentProgress: integer("current_progress").default(0), // Percentage 0-100
  spiritualPurpose: text("spiritual_purpose"), // Why this matters for faith
  deadline: timestamp("deadline"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stewardship Reflections Table (Prayer/journaling about finances)
export const stewardshipReflections = pgTable("stewardship_reflections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  reflectionType: varchar("reflection_type", { length: 50 }).notNull(), // gratitude, concern, discernment, commitment
  relatedTransactionId: uuid("related_transaction_id").references(() => financialTransactions.id, { onDelete: "set null" }),
  aiInsight: text("ai_insight"), // AI-generated spiritual guidance
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget Categories Table
export const budgetCategories = pgTable("budget_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  plannedAmount: varchar("planned_amount", { length: 20 }).notNull(),
  categoryType: varchar("category_type", { length: 50 }).notNull(), // income, tithe, expense, savings
  spiritualAlignment: text("spiritual_alignment"), // How this aligns with faith values
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertMoodSchema = createInsertSchema(moods).omit({ id: true, createdAt: true });
export const insertPrayerJournalSchema = createInsertSchema(prayerJournals).omit({ id: true, createdAt: true, answeredAt: true });
export const insertDevotionalSchema = createInsertSchema(devotionals).omit({ id: true, createdAt: true });
export const insertBibleVerseSchema = createInsertSchema(bibleVerses).omit({ id: true, createdAt: true });
export const insertSyncNoteSchema = createInsertSchema(syncNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertPrayerChainSchema = createInsertSchema(prayerChains).omit({ id: true, createdAt: true });
export const insertPrayerChainCommentSchema = createInsertSchema(prayerChainComments).omit({ id: true, createdAt: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, createdAt: true });
export const insertSongSchema = createInsertSchema(songs).omit({ id: true, createdAt: true });
export const insertSermonSchema = createInsertSchema(sermons).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export const insertFlourishingScoreSchema = createInsertSchema(flourishingScores).omit({ id: true, createdAt: true });
export const insertPersonalizationRunSchema = createInsertSchema(personalizationRuns).omit({ id: true, createdAt: true });
export const insertFaithCircleSchema = createInsertSchema(faithCircles).omit({ id: true, createdAt: true, updatedAt: true, memberCount: true });
export const insertFaithCircleMemberSchema = createInsertSchema(faithCircleMembers).omit({ id: true, joinedAt: true });
export const insertFaithCirclePostSchema = createInsertSchema(faithCirclePosts).omit({ id: true, createdAt: true });
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true });
export const insertGenerosityCommitmentSchema = createInsertSchema(generosityCommitments).omit({ id: true, createdAt: true, completedAt: true });
export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({ id: true, createdAt: true, completedAt: true });
export const insertStewardshipReflectionSchema = createInsertSchema(stewardshipReflections).omit({ id: true, createdAt: true });
export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moods.$inferSelect;

export type InsertPrayerJournal = z.infer<typeof insertPrayerJournalSchema>;
export type PrayerJournal = typeof prayerJournals.$inferSelect;

export type InsertDevotional = z.infer<typeof insertDevotionalSchema>;
export type Devotional = typeof devotionals.$inferSelect;

export type InsertBibleVerse = z.infer<typeof insertBibleVerseSchema>;
export type BibleVerse = typeof bibleVerses.$inferSelect;

export type InsertSyncNote = z.infer<typeof insertSyncNoteSchema>;
export type SyncNote = typeof syncNotes.$inferSelect;

export type SpiritualGuide = typeof spiritualGuides.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertPrayerChain = z.infer<typeof insertPrayerChainSchema>;
export type PrayerChain = typeof prayerChains.$inferSelect;

export type InsertPrayerChainComment = z.infer<typeof insertPrayerChainCommentSchema>;
export type PrayerChainComment = typeof prayerChainComments.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertSermon = z.infer<typeof insertSermonSchema>;
export type Sermon = typeof sermons.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertFlourishingScore = z.infer<typeof insertFlourishingScoreSchema>;
export type FlourishingScore = typeof flourishingScores.$inferSelect;

export type InsertPersonalizationRun = z.infer<typeof insertPersonalizationRunSchema>;
export type PersonalizationRun = typeof personalizationRuns.$inferSelect;

export type InsertFaithCircle = z.infer<typeof insertFaithCircleSchema>;
export type FaithCircle = typeof faithCircles.$inferSelect;

export type InsertFaithCircleMember = z.infer<typeof insertFaithCircleMemberSchema>;
export type FaithCircleMember = typeof faithCircleMembers.$inferSelect;

export type InsertFaithCirclePost = z.infer<typeof insertFaithCirclePostSchema>;
export type FaithCirclePost = typeof faithCirclePosts.$inferSelect;

export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

export type InsertGenerosityCommitment = z.infer<typeof insertGenerosityCommitmentSchema>;
export type GenerosityCommitment = typeof generosityCommitments.$inferSelect;

export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type FinancialGoal = typeof financialGoals.$inferSelect;

export type InsertStewardshipReflection = z.infer<typeof insertStewardshipReflectionSchema>;
export type StewardshipReflection = typeof stewardshipReflections.$inferSelect;

export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
