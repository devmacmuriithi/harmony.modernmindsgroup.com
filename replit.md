# Harmony - Faith-Based Desktop Workspace

## Overview

Harmony is a faith-based productivity application designed as a desktop operating system metaphor. It combines spiritual growth tools with modern productivity features, offering users a unique workspace for prayer journaling, Bible reading, mood tracking, and AI-powered spiritual guidance. The interface emulates a desktop environment with window management, a dock navigation system, and tile-based views inspired by macOS, Windows 11, and modern productivity apps like Notion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite as the build tool and development server.

**UI Component System**: Utilizes shadcn/ui components built on Radix UI primitives for accessible, customizable interface elements. The design follows a "New York" style variant with custom theming.

**Styling Approach**: Tailwind CSS with extensive custom configuration supporting:
- Dual theme system (light/dark modes) with warm, faith-inspired color palettes
- Custom color variables using HSL format for dynamic theming
- Stained-glass aesthetic with backdrop blur and translucency effects
- Custom border radius values (9px, 6px, 3px) for consistent visual rhythm
- Dot pattern backgrounds with gradient overlays

**State Management**: React Query (@tanstack/react-query) for server state management with custom query client configuration. Local UI state managed through React hooks.

**Routing**: Wouter for lightweight client-side routing.

**Desktop Paradigm Components**:
- **Window System**: Draggable, resizable windows with title bars and window controls
- **Dock Navigation**: Bottom-docked app launcher with active app indicators
- **Tile View**: Grid-based app launcher inspired by Windows 11 with variable tile sizes
- **Launchpad**: Full-screen app launcher overlay with search functionality
- **Top Menu Bar**: Global search, view mode toggle, notifications, and theme controls

**Typography**: Two-font system using Inter for UI elements and Crimson Text for scripture/devotional content.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API architecture with routes prefixed under `/api`. Currently implements a storage interface pattern for CRUD operations.

**Storage Layer**: Abstract storage interface (`IStorage`) with in-memory implementation (`MemStorage`). Designed to be replaceable with database-backed implementations without changing application logic.

**Development Tooling**:
- Hot Module Replacement (HMR) through Vite in development mode
- Custom logging middleware for API request/response tracking
- Error handling middleware with status code normalization

**Build Process**: 
- Frontend: Vite builds React application to `dist/public`
- Backend: esbuild bundles server code to `dist` directory
- Production server serves static frontend files

### Data Storage Solutions

**Database System**: PostgreSQL via Neon serverless driver with WebSocket support.

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Design** (as defined in attached specifications):
- **Users table**: Authentication and user profiles
- **Events table**: Central tracking table for all user activities (moods, prayers, Bible reading, etc.) using JSONB for flexible event data storage
- **Domain-specific tables**: Moods, prayer journals, Bible reading logs, devotionals, notes, guides (AI personas), videos, songs, sermons, resources, faith circles
- **Faith Circles tables**: faith_circles (circles), faith_circle_members (memberships), faith_circle_posts (discussions)
- **Analytics tables**: Flourishing metrics, personalization runs, AI recommendations

**Migration Strategy**: Drizzle Kit for schema migrations with PostgreSQL dialect.

**Session Management**: Prepared for connect-pg-simple session store (package installed but not yet implemented).

### Authentication & Authorization

**Implementation Status**: ✅ Complete

**Authentication System**:
- Session-based authentication using express-session with PostgreSQL session store
- Bcrypt password hashing for secure credential storage
- Protected API routes with authentication middleware
- Login/Register pages with form validation and error handling
- AuthProvider context for frontend authentication state management

**Session Management**:
- Express-session with connect-pg-simple for persistent sessions
- Session cookies with secure configuration
- Automatic session validation on protected routes

### Design System

**Color Philosophy**:
- Light mode: Warm beige base (#f5f1e8) with amber/gold accents (#c9a961)
- Dark mode: Deep brown base (#1a1410) with same gold accents for consistency
- Stained glass effect: Translucent overlays with backdrop blur (16px) and color saturation (150%)

**Interaction Patterns**:
- Elevation system using CSS classes: `hover-elevate`, `active-elevate-2`
- Consistent hover states with slight upward translation (-1px to -2px)
- Border styles using CSS variables for dynamic theming
- Custom scrollbar styling with amber/gold thumbs

## External Dependencies

### Third-Party Services & APIs

**Database**: Neon Postgres serverless database (via `@neondatabase/serverless` package with WebSocket support).

**Development Tools**:
- Replit integration packages for development environment (`@replit/vite-plugin-*`)
- Vite plugins for React, runtime error overlay, and development tooling

### UI Component Libraries

**Radix UI**: Comprehensive set of unstyled, accessible UI primitives including:
- Dialogs, dropdowns, popovers, tooltips
- Form controls (checkbox, radio, select, slider, switch)
- Navigation components (accordion, tabs, menubar)
- Feedback components (toast, alert-dialog, progress)

**shadcn/ui**: Pre-built component patterns using Radix UI with Tailwind styling.

### Utility Libraries

**Form Handling**: React Hook Form with Zod resolver for validation and Drizzle-Zod for schema-based validation.

**Date Handling**: date-fns for date manipulation and formatting.

**Styling Utilities**: 
- clsx and tailwind-merge for conditional class name management
- class-variance-authority (CVA) for component variant management

**Icons**: Lucide React for consistent iconography.

### Build & Development Tools

**Package Management**: npm with lockfile version 3.

**Build Tools**:
- Vite for frontend bundling and development server
- esbuild for backend bundling
- PostCSS with Tailwind CSS and Autoprefixer
- TypeScript compiler for type checking

**Development Environment**: Configured for Replit with custom Vite plugins for enhanced development experience.

## Recent Changes

### AI Insights & Auto-Refresh (Latest - October 2025)

**Flourishing Index AI Insights**: ✅ Complete
- Added `aiInsight` TEXT field to flourishing_scores table
- Enhanced Flourishing Engine to generate personalized, actionable AI insights
- AI insights analyze user's scores and suggest specific Harmony apps for improvement
- Insights displayed prominently on Flourishing tile with "💡 AI Insight" header
- Example insight: "Your 'Faith' score is slightly lower this week. Consider spending more time in the Prayer Journal or reading Scripture."
- Insight guidelines: Personal, actionable, under 120 characters, app-specific recommendations
- AI only suggests valid Harmony apps (never hallucinated apps like "Budget Tracker")

**Flourishing Auto-Refresh**: ✅ Complete
- Flourishing Index now updates IMMEDIATELY after user actions
- Synchronous architecture: Post mood/prayer/bible → Trigger flourishing generation → Invalidate caches → Auto-refresh UI
- No manual refresh needed - tile and window update automatically
- Implemented in: MoodWindow (post mood), PrayerWindow (create/answer/delete), BibleWindow (generate verse)
- Test-verified: Flourishing score updates from initial value to new score instantly after any activity

**Sermon Personalization Updates**: ✅ Complete
- Removed `pastor` field from sermons schema (sermons are fully AI-generated)
- Updated Sermon Engine prompt to reflect AI-generated sermon recommendations
- Enhanced UI to display church name and duration instead of pastor information
- Sermon items now clickable links to watch on YouTube
- Search functionality updated to filter by title and church name

### Backend Integration Completion

**Authentication & Backend Infrastructure**: ✅ Complete
- Implemented full authentication flow with bcrypt password hashing
- Set up PostgreSQL session management with express-session
- Created protected API route middleware
- Built AuthProvider context for frontend authentication state

**Event Tracking System**: ✅ Complete
- Centralized event tracking middleware for all user actions
- JSONB-based flexible event data storage
- Automatic event logging for prayers, moods, Bible readings, devotionals

**AI Personalization Engines**: ✅ Implemented (7 engines)
1. **Flourishing Index Engine**: Generates AI-powered spiritual, emotional, relational scores with insights
   - **Auto-calculation**: Triggers after every user event (5-second debounce)
   - **Scheduled updates**: Recalculates every 30 minutes for all users
   - Event-driven architecture ensures scores stay current
2. **Bible Verse Engine**: Personalized verse recommendations based on user patterns
3. **Devotional Engine**: AI-generated devotional content with scripture references
4. **Prayer Insights Engine**: Analyzes prayer patterns for spiritual growth
5. **Mood Analysis Engine**: Tracks emotional patterns for well-being insights
6. **Video Recommendations Engine**: Suggests faith-based content
7. **Resource Recommendations Engine**: Personalized spiritual growth resources

**Backend-Connected Applications**: ✅ 12 apps fully integrated and tested
1. **Flourishing Index** (`/api/flourishing`)
   - Displays AI-generated spiritual wellness scores
   - **AI Insight feature**: Personalized, actionable tips displayed on tile and in window
   - Refresh button to regenerate personalized insights
   - Shows spiritual, emotional, relational metrics

2. **Bible App** (`/api/bible-verses`)
   - AI-personalized verse recommendations
   - Generates verses based on mood, prayers, and spiritual journey
   - Note-taking capability with backend persistence
   - Refresh to get new personalized verses

3. **Prayer Journal** (`/api/prayers`)
   - Full CRUD operations (Create, Read, Update, Delete)
   - Mark prayers as answered with date tracking
   - Delete prayers with confirmation
   - All data persisted to PostgreSQL

4. **Mood Tracker** (`/api/moods`)
   - 6 mood options with gradient buttons
   - Notes field for detailed mood context
   - Displays recent mood history
   - Loading states and error handling

5. **Devotional** (`/api/devotionals`)
   - AI-generated daily devotionals
   - Personalized content based on user's spiritual journey
   - Scripture references included
   - Refresh button for new devotional content

6. **Spiritual Guides** (`/api/guides`, `/api/conversations`)
   - AI chat companions with conversation history
   - Conversation count displayed on guide cards
   - History sidebar to access past conversations
   - Real-time AI responses from OpenAI
   - Multiple guides with different spiritual perspectives

7. **Notes (SyncNote)** (`/api/notes`)
   - Full CRUD operations for personal notes
   - AI-powered automatic tagging
   - Edit and delete functionality

8. **Videos** (`/api/videos`)
   - AI-generated faith-based video recommendations
   - YouTube integration with watch tracking
   - Personalized content suggestions

9. **Songs** (`/api/songs`)
   - Worship music recommendations
   - YouTube music integration
   - Listen tracking functionality

10. **Sermons** (`/api/sermons`)
    - AI-powered sermon recommendations
    - Preacher and date information
    - Notes capability for sermon reflections

11. **Library** (`/api/resources`)
    - Books, podcasts, and articles management
    - AI-based personalized recommendations
    - Resource type categorization (book/podcast/article)

12. **Faith Circles** (`/api/faith-circles`)
    - Community forum for group discussions
    - Create/join/leave circles with categories (Bible Study, Prayer, Fellowship, Youth, Marriage, General)
    - Member-only posting with real-time discussion threads
    - Search and category filtering for discovering circles
    - Optimistic UI updates for immediate feedback
    - Event tracking for circle_joined and circle_post events
    - Member count and join status displayed on each circle

**TileView Live Data**: ✅ Complete
- All desktop tiles display real-time backend data
- Flourishing Index shows actual spiritual/emotional/relational scores
- Prayer count reflects active prayer requests
- Latest Bible verses, devotionals, and notes displayed
- Empty states guide users to generate AI content

**Testing & Validation**: ✅ Complete
- End-to-end tests passing for all 12 backend-connected apps
- Authentication flow verified (register → login → desktop access)
- All CRUD operations tested and working
- API endpoints returning proper data structures
- Loading states and error handling verified
- Faith Circles: Circle creation, join/leave, member-only posting, search/filtering verified

**Technical Implementation Details**:
- All apps use React Query (useQuery/useMutation) for data fetching
- Proper loading states with Loader2 spinners
- Toast notifications for user feedback
- Type-safe API calls with TypeScript
- Session-based authentication protecting all routes
- OpenAI integration for AI personalization (gpt-4o-mini model)