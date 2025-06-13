# NewsTracker - Real-time News Monitoring Application

## Overview

NewsTracker is a full-stack web application that provides real-time news monitoring and search capabilities. Built with a modern tech stack, it offers users the ability to search through news articles from various trusted sources, filter by different criteria, and view trending topics in an intuitive timeline interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

### Database Schema
The application uses two main tables:
- **news_articles**: Stores article metadata including title, content, source, author, publication date, tags, and engagement metrics
- **search_queries**: Tracks user search patterns for analytics and popular search suggestions

## Key Components

### Data Layer
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect
- **Schema Definition**: Centralized schema in `shared/schema.ts` with Zod validation
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

### API Layer
- **RESTful Endpoints**: 
  - `/api/news/search` - Search articles with filtering options
  - `/api/news/topic/:topic` - Get articles by topic
  - `/api/searches/popular` - Retrieve popular search queries
- **Request Validation**: Zod schemas for input validation
- **Error Handling**: Centralized error handling middleware

### Frontend Components
- **Header**: Navigation and branding
- **SearchSection**: Main search interface with filters
- **NewsTimeline**: Article display with infinite scroll
- **FilterBar**: Dynamic filtering controls
- **NewsArticleCard**: Individual article presentation

## Data Flow

1. **User Interaction**: User enters search query or applies filters
2. **API Request**: Frontend sends request to Express backend
3. **Database Query**: Drizzle ORM queries PostgreSQL database
4. **Response Processing**: Backend formats and returns article data
5. **State Management**: TanStack Query caches and manages response data
6. **UI Update**: React components re-render with new data

## External Dependencies

### UI Framework
- **shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI components
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit's cloud development environment
- **Hot Reload**: Vite HMR for instant development feedback
- **Development Server**: Express server with Vite middleware integration

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: PostgreSQL with connection pooling via Neon Database

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Port Configuration**: Configurable port (default 5000) with external port mapping
- **Static Asset Serving**: Express serves built frontend assets in production

## Changelog

Recent Changes:
- June 13, 2025: Implemented real-time news scraping using Brave Search API
- June 13, 2025: Added live data fetching from trusted news sources (BBC, Guardian, NYT, Bloomberg, etc.)
- June 13, 2025: Enhanced loading states with scraping progress indicators
- June 13, 2025: Configured flexible search matching for better results
- June 13, 2025: Integrated comprehensive error handling for API failures
- June 13, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.