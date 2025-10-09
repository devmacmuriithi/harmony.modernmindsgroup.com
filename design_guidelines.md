# Harmony - Faith-Based Desktop Workspace Design Guidelines

## Design Approach
**Reference-Based Approach**: This is a unique desktop operating system metaphor for a faith-based productivity app. Draw inspiration from:
- **macOS/Windows Desktop Paradigms**: Window management, dock navigation, desktop icons
- **Microsoft Windows 11 Tiles**: Grid-based tile view with varied sizes
- **Notion/Linear**: Clean, modern productivity interfaces with warm aesthetics
- **Faith-Based Aesthetic**: Warm, reverent, stained-glass inspired translucency

## Core Design Philosophy
A **desktop workspace environment** for spiritual productivity combining traditional window management with modern tile views. The interface should feel sacred yet functional, with warm, welcoming tones that encourage daily spiritual practice.

## Color Palette

### Light Mode
- **Background Base**: 245 17% 91% (warm beige #f5f1e8)
- **Background Gradient**: Linear gradient to 44 35% 84% (#e8dcc4)
- **Dot Pattern**: 40 31% 73% (#d4c5a9)
- **Primary (Gold)**: 42 43% 58% (#c9a961)
- **Accent (Sky)**: 197 71% 73% (#87ceeb)
- **Text Dark**: 24 45% 18% (#3d2817)
- **Border**: Amber-900 at 20% opacity

### Dark Mode
- **Background Base**: 30 20% 8% (#1a1410)
- **Background Gradient**: Linear gradient to 36 22% 14% (#2d2419)
- **Dot Pattern**: 36 20% 19% (#3d3427)
- **Primary (Gold)**: 42 43% 58% (same #c9a961)
- **Text Light**: 40 17% 91% (#f5f1e8)
- **Border**: Amber-200 at 20% opacity

### Stained Glass Effect
- **Light**: rgba(245, 241, 232, 0.7) with backdrop-blur(16px) saturate(150%)
- **Dark**: rgba(26, 20, 16, 0.7) with backdrop-blur(16px) saturate(150%)
- **Border**: 1px solid gold at 25% opacity (light) or 20% opacity (dark)

## Typography
- **Primary Font**: Inter (400, 500, 600, 700) - All UI elements
- **Scripture Font**: Crimson Text (400, 600) - Bible verses, devotionals
- **Header Bar**: 18px bold for "Harmony" logo
- **Search Placeholder**: 14px regular
- **Window Titles**: 14px medium
- **Body Text**: 14-16px regular
- **Tile Names**: 18px semibold

## Layout System

### Spacing Units
Tailwind units: **2, 3, 4, 6, 8, 12, 16, 20, 24** for consistent rhythm
- Icon spacing: p-2, p-3, p-4
- Section padding: p-4, p-6, p-8
- Gap between elements: gap-2, gap-3, gap-4, gap-6

### Desktop Layout Structure
1. **Top Menu Bar**: Fixed height 56px (h-14), backdrop-blur, 3-column grid
   - Left: Logo + "Harmony" text
   - Center: Search bar (max-width 2xl)
   - Right: View toggle + notifications + theme + profile
2. **Desktop Area**: Full viewport minus header (pt-14) and dock (pb-24)
3. **Bottom Dock**: Fixed height 80px, centered icons with hover effects

### Window System
- **Minimum Size**: 320px × 200px
- **Default Sizes**: 500px × 550px (varies by app)
- **Stained Glass Windows**: Rounded-2xl, translucent with backdrop blur
- **Window Header**: 44px height, draggable, amber background 80% opacity
- **Window Controls**: Minimize (gold), maximize (sky), close (red) - 12px circles
- **Resize Handle**: 20px × 20px bottom-right corner

### Tile View Grid
- **Mobile**: 2 columns, 150px rows
- **Tablet (768px+)**: Auto-fill minmax(150px, 1fr)
- **Desktop (1280px+)**: 6-column grid
- **Tile Sizes**:
  - Small: 1 column × 1 row
  - Wide: 2 columns × 1 row
  - Tall: 1 column × 2 rows
  - Large: 2 columns × 2 rows
- **Gap**: 1.5rem between tiles
- **Container**: Max-width 1400px, centered, 2rem padding

## Component Library

### Navigation
- **Top Bar**: Translucent white/dark with backdrop blur, subtle border
- **Search**: Rounded-full with amber tones, left icon, focus ring
- **Dock**: Centered horizontal row, 64px icon size, translateY hover

### Desktop Icons (Traditional View)
- **Size**: 96px wide containers
- **Icon**: 48px emoji/svg
- **Label**: 13px medium, text-shadow for legibility
- **Hover**: Amber background 15% opacity, translateY(-2px)
- **Grid**: Flow-col, auto-cols-max, 5 rows

### Tiles (Modern View)
- **Background**: Vibrant gradients per app category
- **Content**: Icon (40px) + name + preview content
- **Hover**: TranslateY(-4px) + enhanced shadow
- **Colors**: 
  - Bible: Purple/indigo gradient
  - Prayer: Blue gradient
  - Devotional: Green gradient
  - Guides: Amber/orange gradient
  - Community: Pink/rose gradient

### Windows (All 14 Apps)
- **Bible, Prayer, Devotional, Mood, Notes**: Standard 500×550px
- **Spiritual Guides**: Chat interface, message bubbles
- **Prayer Chains**: Feed layout with cards
- **Flourishing**: Dashboard with score cards
- **Media (Videos, Songs, Sermons)**: Grid thumbnails
- **Library**: Resource cards with tags

### Buttons & Controls
- **Primary**: Gold background, white text, rounded-lg
- **Secondary**: Transparent with gold border
- **Icon Buttons**: Rounded-full, hover background
- **Toggle Switch**: 50px × 28px, gold when active

### Forms & Inputs
- **Text Fields**: Amber-50 background (light), slate-800 (dark), rounded borders
- **Textareas**: Same styling, scrollbar styled gold
- **Scrollbars**: 6px width, gold thumb, transparent track

## Background Pattern
**Dotted Grid**: Radial-gradient dots, 1px circles, 24px spacing
- Light: #d4c5a9 dots on beige gradient
- Dark: #3d3427 dots on dark brown gradient

## Interaction States
- **Hover**: Subtle translateY, scale, or background color change
- **Active Windows**: Higher z-index, slightly enhanced shadow
- **Focus**: Gold ring (ring-2 ring-amber-500)
- **Disabled**: 50% opacity, no pointer events

## Animations
**Minimal & Purposeful**:
- Window open: fadeIn 0.2s (scale 0.95→1, opacity 0→1)
- Tile hover: transform 0.2s ease
- Dock icon hover: translateY(-8px) scale(1.1)
- Toggle switch: 0.4s ease transitions

## Dark Mode Implementation
- Toggle via theme-toggle button in header
- Apply `.dark` class to root element
- All colors transition smoothly (0.3s ease)
- Maintain same layout and spacing in both modes

## Accessibility
- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Keyboard navigation for window focus
- High contrast in both light/dark modes
- Focus indicators on all interactive elements

## Images
**None required** - This is an icon-based desktop interface using emojis and SVG icons. The visual richness comes from the stained-glass translucency, warm color palette, and dotted background pattern.