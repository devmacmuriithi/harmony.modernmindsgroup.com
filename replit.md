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
- **Domain-specific tables**: Moods, prayer journals, Bible reading logs, devotionals, notes, guides (AI personas), videos, songs, sermons, resources
- **Analytics tables**: Flourishing metrics, personalization runs, AI recommendations

**Migration Strategy**: Drizzle Kit for schema migrations with PostgreSQL dialect.

**Session Management**: Prepared for connect-pg-simple session store (package installed but not yet implemented).

### Authentication & Authorization

**Current State**: Basic user schema defined with username/password fields. Authentication middleware and session management not yet fully implemented.

**Planned Approach**: Session-based authentication with PostgreSQL session storage, password hashing for security.

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