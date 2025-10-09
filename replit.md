# Harmony - Faith-Based Desktop Workspace

## Overview

Harmony is a faith-based productivity application designed as a desktop operating system metaphor. It integrates spiritual growth tools with modern productivity features, offering users a unique workspace for prayer journaling, Bible reading, mood tracking, and AI-powered spiritual guidance. The interface emulates a desktop environment with window management, a dock navigation system, and tile-based views.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite.
**UI Component System**: shadcn/ui components built on Radix UI, following a "New York" style variant with custom theming.
**Styling Approach**: Tailwind CSS with custom configuration for a dual-theme (light/dark) system with warm, faith-inspired color palettes, a stained-glass aesthetic, and custom border radii.
**State Management**: React Query for server state; React hooks for local UI state.
**Routing**: Wouter for client-side routing.
**Desktop Paradigm Components**: Draggable/resizable windows, dock navigation, tile-based app launcher, full-screen launchpad, top menu bar, and right sidebar widget panel (in traditional OS-mode).
**Typography**: Inter for UI, Crimson Text for scripture/devotional content.
**Search System**: Multi-entity autocomplete search in top menu bar. Searches across 10 content types (Bible verses, prayers, devotionals, notes, spiritual guides, videos, songs, sermons, resources, faith circles) with grouped results by entity type, sticky section headers showing icons and counts, and click-outside-to-close functionality.
**Right Sidebar Widgets** (Traditional OS-Mode): Contextual widget panel displaying verse of the day, journey stats (Flourishing Index, active prayers, saved verses), devotional preview, calendar, and daily spiritual reminders. Only visible in icon/traditional desktop view.

### Backend Architecture

**Server Framework**: Express.js with TypeScript on Node.js.
**API Design**: RESTful API with an abstract storage interface (`IStorage`) currently using an in-memory implementation (`MemStorage`), designed for future database integration.
**Development Tooling**: Vite HMR, custom logging, and error handling middleware.
**Build Process**: Vite for frontend, esbuild for backend.

### Data Storage Solutions

**Database System**: PostgreSQL via Neon serverless driver.
**ORM**: Drizzle ORM for type-safe queries and schema management.
**Schema Design**: Includes tables for users, events (using JSONB for flexible data), moods, prayer journals, Bible reading logs, devotionals, notes, AI guides, media (videos, songs, sermons), resources, and Faith Circles.
**Migration Strategy**: Drizzle Kit.
**Session Management**: Prepared for `connect-pg-simple`.

### Authentication & Authorization

**Authentication System**: Session-based using `express-session` with a PostgreSQL session store, Bcrypt password hashing, protected API routes, and frontend AuthProvider context.
**Session Management**: Persistent sessions with secure session cookies.

### Design System

**Color Philosophy**: Warm beige/deep brown bases with amber/gold accents. Stained glass effect with translucent overlays, backdrop blur, and color saturation.
**Interaction Patterns**: CSS-based elevation system, consistent hover states, custom scrollbar styling.

## External Dependencies

### Third-Party Services & APIs

**Database**: Neon Postgres serverless database (`@neondatabase/serverless`).
**AI**: Multi-model LLM system with Gemini (gemini-2.0-flash-exp) as default, OpenAI (gpt-4o-mini) as automatic fallback. Unified via `llm-client.ts` abstraction layer with automatic quota-aware fallback (switches to OpenAI when Gemini quota exceeded). Configurable via `DEFAULT_MODEL` environment variable. Includes robust JSON sanitization for handling LLM formatting inconsistencies (markdown code fences, comma-separated objects, trailing commas).
**Bible Content**: bible-api.com for Bible verse content (KJV).
**Video/Music Integration**: YouTube integration.

### Personalization System

**Real-Time Event-Driven Personalization**: Comprehensive event tracking system (`server/events.ts`) that captures detailed user activity and triggers intelligent AI personalization engines based on event type.

**Event Categories**:
- **Spiritual Events** (mood, prayer, note_created, guide_chat): Trigger all 6 personalization engines (Bible verses, devotionals, videos, songs, sermons, resources) in parallel using fire-and-forget pattern
- **Engagement Events** (video_watched, song_listened, resource_read, bible_verse_saved): Refine specific recommendation engine
- **Community Events** (circle_joined, circle_post): Update devotionals and resources with community context

**Event Data Captured**: Full content for prayers, notes, moods; metadata for media interactions; community engagement details for circles

**Performance**: Non-blocking architecture using fire-and-forget promises - API responses return immediately while personalization runs in background. Uses `Promise.allSettled` for parallel engine execution.

### UI Component Libraries

**Radix UI**: Unstyled, accessible UI primitives.
**shadcn/ui**: Pre-built components using Radix UI with Tailwind styling.

### Utility Libraries

**Form Handling**: React Hook Form with Zod resolver and Drizzle-Zod.
**Date Handling**: `date-fns`.
**Styling Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA).
**Icons**: Lucide React.

### Build & Development Tools

**Package Management**: npm.
**Build Tools**: Vite (frontend), esbuild (backend), PostCSS with Tailwind CSS and Autoprefixer.
**Development Environment**: Configured for Replit with custom Vite plugins.