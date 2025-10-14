# FitMind AI - Fitness Tracking Application

## Overview

FitMind AI is an intelligent fitness and nutrition tracking application that helps users monitor their food intake, exercise routines, and weight goals. The application leverages AI (Google Gemini) to parse natural language food entries, provide nutritional insights, and offer personalized recommendations. Users can track calories, macronutrients, set fitness goals, and visualize their progress through an intuitive dashboard with charts and projections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of React Router
- TailwindCSS for utility-first styling with a custom design system

**UI Component Library**
- Shadcn/ui component library built on Radix UI primitives
- Custom theme system supporting light/dark modes with CSS variables
- Responsive design with mobile-first approach

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and synchronization
- Custom AuthContext for authentication state
- Optimistic updates and automatic cache invalidation

**Key Design Patterns**
- Component composition with shadcn/ui patterns
- Custom hooks for data fetching (useFoodLogs, useExercises, useUser, etc.)
- Centralized API request handling through queryClient
- Toast notifications for user feedback

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- Session-based authentication using express-session with in-memory storage (MemoryStore)
- Passport.js with LocalStrategy for user authentication
- RESTful API design pattern

**Database & ORM**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database operations
- Schema-first approach with shared types between client and server
- Migration management through drizzle-kit

**Authentication & Security**
- Bcrypt for password hashing (10 salt rounds)
- Session-based authentication with HTTP-only cookies
- Guest user support for demo/trial usage without registration
- CORS and credential handling for API requests

**AI Integration**
- Google Gemini 2.0 Flash model for natural language processing
- JSON-structured responses for parsing food entries
- AI-powered chat interface for nutrition questions
- Calorie and macro estimation from text descriptions

**Data Models**
- Users: Profile information, physical stats, goals, and activity levels
- Foods: Nutritional database with calories, protein, carbs, fat per serving
- Food Logs: Daily meal tracking linked to users and foods
- Exercises: Workout tracking with duration, intensity, and calorie burn
- Alarms: Reminder system for meals and workouts

### External Dependencies

**AI Services**
- Google Generative AI (Gemini API) - Natural language food parsing, nutritional advice, and conversational AI
- Configuration via GEMINI_API_KEY or GOOGLE_API_KEY environment variable
- Safety settings to block harmful content

**Database**
- Neon Database (PostgreSQL) - Serverless Postgres via @neondatabase/serverless
- Connection via DATABASE_URL environment variable
- Session storage using connect-pg-simple

**Authentication**
- Passport.js with passport-local strategy
- Bcrypt for password hashing
- Express-session for session management

**UI Libraries**
- Radix UI - Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- Recharts - Data visualization for calorie rings, weight projections, progress charts
- Lucide React - Icon library
- date-fns - Date manipulation and formatting with Portuguese locale support

**Development Tools**
- Replit-specific plugins for development (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)
- ESBuild for production server bundling
- TypeScript for type safety across the stack

**Key Environment Variables**
- DATABASE_URL - PostgreSQL connection string
- GEMINI_API_KEY / GOOGLE_API_KEY - Google AI API key
- SESSION_SECRET - Session encryption key
- NODE_ENV - Environment flag (development/production)