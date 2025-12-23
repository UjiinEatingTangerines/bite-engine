# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BiteEngine** is an AI-powered team dinner voting platform for internal company use. The platform enables employees to:
- Receive AI-based restaurant recommendations based on personal preferences and team history
- Vote on restaurant options in real-time
- Filter restaurants by dietary requirements
- View live voting activity and team engagement
- Finalize dinner plans with automated booking confirmation

## Tech Stack

- **Framework**: Next.js 16 (App Router with React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui (New York style) + Radix UI primitives
- **Animations**: Framer Motion for transitions and layout animations
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React useState/useMemo (no external state library)
- **Package Manager**: pnpm

## Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Project Structure

```
/app
  layout.tsx          # Root layout with dark theme enforcement
  page.tsx            # Main voting page with all business logic
  globals.css         # Design tokens and custom animations

/components
  header.tsx          # Top navigation with branding and user actions
  smart-match-hero.tsx    # AI recommendation hero section
  restaurant-card.tsx     # Individual restaurant voting card
  live-feed.tsx          # Real-time activity sidebar
  preference-matrix.tsx   # Team preference visualization
  vote-counter.tsx       # Total votes display
  dietary-filter.tsx     # Dietary requirement filters
  mini-map.tsx          # Top 3 restaurants map preview
  confetti.tsx          # Celebration animation component
  /ui                   # shadcn/ui components (56 components)

/lib
  mock-data.ts       # Data types and mock content
  utils.ts           # cn() utility for className merging

/hooks                # Custom React hooks (if needed)
```

## Design System

### Color Palette (Dark Theme)
- **Background**: Midnight blue/gray (`oklch(0.13 0.02 260)`)
- **Primary**: Neon indigo (`oklch(0.65 0.25 280)`)
- **Accent**: Neon emerald (`oklch(0.7 0.2 160)`)
- **Chart colors**: 5 distinct colors for data visualization

### Component Styling Patterns
1. **Card borders**: Primary cards use `border-primary/50`, others use `border-border`
2. **Gradients**: Subtle gradients with primary/accent overlays (e.g., `from-primary/20 via-card to-accent/10`)
3. **Backdrop blur**: `backdrop-blur-sm` for header and overlays
4. **Rounded corners**: `rounded-2xl` for cards, `rounded-xl` for nested elements
5. **Spacing**: Consistent 6-unit gap in main grid layouts

### Animation Patterns
- **Layout animations**: Use `<LayoutGroup>` + `motion.div layout` for reordering
- **Entry animations**: `initial={{ opacity: 0, scale: 0.9 }}` → `animate={{ opacity: 1, scale: 1 }}`
- **Hover effects**: `whileHover={{ y: -4 }}` for cards
- **Custom keyframes**: `shimmer`, `pulse-glow`, `flip-in` (defined in globals.css)

### State Management Patterns
```typescript
// Main page manages all state
const [restaurants, setRestaurants] = useState<Restaurant[]>()
const [activities, setActivities] = useState<VoteActivity[]>()
const [activeFilters, setActiveFilters] = useState<string[]>([])
const [votedRestaurant, setVotedRestaurant] = useState<string | null>(null)

// Computed values with useMemo
const sortedRestaurants = useMemo(() => {
  // Filter + sort logic
}, [restaurants, activeFilters])
```

## Key Features & Implementation

### 1. Real-time Voting System
- Single vote per user (changing vote decrements previous, increments new)
- Vote changes trigger activity feed updates
- Progress bars animate using Framer Motion width transitions
- Vote percentages calculated as `(votes / totalVoters) * 100`

### 2. AI Recommendation Hero
- Displays personalized restaurant based on user preferences
- Shows user's past dining history and taste profile
- Prominent CTA to vote on recommended restaurant
- Gradient background with blur effects for visual hierarchy

### 3. Live Activity Feed
- Displays last 10 voting activities (newest first)
- Shows user avatars and action descriptions
- Sticky positioned in sidebar (`sticky top-24`)
- Updates instantly when votes change

### 4. Dietary Filtering
- Multiple filters can be active simultaneously
- Filters modify restaurant list using `array.filter()` + `array.some()`
- Active filters persist in component state
- Empty state shown when no restaurants match filters

### 5. Vote Finalization
- "투표 마감하기" button triggers confetti + winner announcement
- Winner determined by highest vote count (`sortedRestaurants[0]`)
- Animated winner card with gradient border and trophy icon
- Shows booking confirmation message

### 6. Restaurant Cards
- Top 3 ranked cards show position badges with distinct colors
- Active viewers displayed with stacked avatars (max 3 shown)
- Multiple badge types: "AI 추천", "가성비 최고", "사무실 근처", "백엔드팀 인기"
- Vote button changes to "투표 완료" state when voted

## Component Architecture

### Data Flow
```
page.tsx (state owner)
  ├─ Header (stateless)
  ├─ SmartMatchHero (receives onVote callback)
  ├─ PreferenceMatrix (receives teamScores data)
  ├─ VoteCounter (receives totalVotes computed value)
  ├─ MiniMap (receives top 3 restaurants)
  ├─ DietaryFilter (receives filters + activeFilters + onToggle)
  ├─ RestaurantCard[] (receives restaurant + onVote + hasVoted + rank)
  └─ LiveFeed (receives activities + leadingRestaurant)
```

### Props Pattern
- All event handlers are callbacks (e.g., `onVote`, `onToggle`)
- No prop drilling beyond 2 levels
- Use TypeScript interfaces for all component props
- Import types from `@/lib/mock-data` when needed

## Styling Guidelines

### className Patterns
```typescript
// Use cn() for conditional classes
className={cn(
  "base-classes",
  condition && "conditional-classes",
  rank === 1 ? "primary-style" : "default-style"
)}

// Responsive layouts
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Text hierarchy
- Headings: text-xl/2xl/3xl font-bold text-foreground
- Body: text-sm/base text-muted-foreground
- Labels: text-xs text-muted-foreground
```

### Icon Usage
- Icon size: `w-4 h-4` (small), `w-5 h-5` (medium), `w-8 h-8` (large)
- Always pair icons with text for clarity
- Use `fill-current` for filled icon states (e.g., voted thumbs up)

## Path Aliases
```typescript
"@/*"           // Root directory
"@/components"  // UI components
"@/lib/utils"   // Utility functions
"@/hooks"       // Custom hooks
```

## Type Safety

### Core Types
```typescript
Restaurant: {
  id, name, cuisine, image, votes, totalVoters,
  priceRange, rating, distance, badges,
  activeViewers, dietary
}

VoteActivity: {
  id, user, avatar, action, restaurant, timestamp
}
```

### TypeScript Configuration
- Strict mode enabled
- Target: ES6
- JSX: preserve (handled by Next.js)
- Path aliases configured for `@/*`
- Build errors ignored in config (for rapid prototyping)

## Animation Guidelines

### Framer Motion Best Practices
1. Wrap reorderable lists in `<LayoutGroup>`
2. Use `layout` prop for automatic layout animations
3. Use `AnimatePresence` for exit animations with `mode="popLayout"`
4. Keep animation durations consistent (0.3s for most transitions)
5. Use `ease-out` for entry animations, `ease-in-out` for loops

### Custom Animations (globals.css)
- `shimmer`: Progress bar shine effect (1.5s infinite)
- `pulse-glow`: Live indicator pulsing (2s ease-in-out infinite)
- `flip-in`: Vote counter number flip (0.3s ease-out)

## Korean Localization
- All UI text is in Korean
- Number formatting uses Korean conventions
- Time/distance displayed in Korean units (km, 분)
- Restaurant names and cuisine types in Korean

## Image Assets
Images referenced from `/public` directory:
- Professional headshots for team members
- Restaurant interior/food photos
- Icons for light/dark mode favicons

## Development Notes

### When Adding New Features
1. Keep all state in `page.tsx` - no prop drilling or context needed for this size
2. New components go in `/components` (feature) or `/components/ui` (reusable)
3. Follow existing animation patterns for consistency
4. Use existing shadcn/ui components before creating custom ones
5. Maintain dark theme consistency (don't add light mode variants)

### Component Creation Pattern
```typescript
"use client" // Required for interactive components

import { motion } from "framer-motion"
import { Icon } from "lucide-react"
import { ComponentName } from "@/components/ui/component"
import { cn } from "@/lib/utils"

interface Props {
  // Type all props
}

export function ComponentName({ prop }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("base-classes")}
    >
      {/* Component content */}
    </motion.div>
  )
}
```

## Design Philosophy
- **Dark-first**: All designs optimized for dark theme (midnight blue palette)
- **Neon accents**: Use indigo (primary) and emerald (accent) sparingly for emphasis
- **Subtle animations**: Enhance UX without distraction
- **Real-time feel**: Show live updates, active viewers, voting changes immediately
- **AI transparency**: Clearly label AI recommendations and explain reasoning
- **Team-focused**: Emphasize collaboration (team preferences, live feed, viewer presence)
