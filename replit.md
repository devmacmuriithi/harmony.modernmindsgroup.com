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
**Desktop Paradigm Components**: Draggable/resizable windows, dock navigation, tile-based app launcher, full-screen launchpad, and a top menu bar.
**Typography**: Inter for UI, Crimson Text for scripture/devotional content.

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
**AI**: Multi-model LLM system with Gemini (gemini-2.0-flash-exp) as default, OpenAI (gpt-4o-mini) as fallback. Unified via `llm-client.ts` abstraction layer. Configurable via `DEFAULT_MODEL` environment variable. Includes robust JSON sanitization for handling LLM formatting inconsistencies (markdown code fences, comma-separated objects, trailing commas).
**Bible Content**: bible-api.com for Bible verse content (KJV).
**Video/Music Integration**: YouTube integration.

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