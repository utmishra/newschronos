# NewsTracker - Agent Development Guide

## Project Overview

NewsTracker is a real-time news monitoring web application that provides chronological updates for specific topics or events from major news sources. The application features live news scraping, timeline visualization, and Google News-inspired design.

### Core Functionality
- **Real-time News Search**: Users can search for any topic and receive live news articles
- **Timeline View**: Articles are displayed chronologically (newest first) in a Twitter/Google News-style feed
- **Source Filtering**: Filter results by trusted news sources (Guardian, NYT, Verge, Wired, etc.)
- **Live Data**: No mock data - all results are fetched live from the Brave Search API

## Technical Architecture

### Stack Overview
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **API Integration**: Brave Search API for live news data
- **Build System**: Vite for frontend, TSX for backend development
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS with custom news-themed color palette

### Project Structure
```
├── client/src/          # Frontend React application
│   ├── components/      # UI components (header, search, timeline, cards)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, types, query client
│   └── pages/          # Route components
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API endpoints
│   ├── news-api.ts     # Brave Search API integration
│   └── storage.ts      # In-memory storage for search analytics
├── shared/             # Shared TypeScript types and schemas
└── components.json     # shadcn/ui configuration
```

## Development Guidelines

### Code Style and Conventions

#### TypeScript Standards
- Use strict TypeScript throughout the codebase
- Define interfaces for all API responses and data structures
- Use `type` for unions, `interface` for object shapes
- Prefer explicit typing over `any` - use proper type guards when needed

#### React Component Patterns
- Use functional components with hooks exclusively
- Extract component logic into custom hooks when reusable
- Use the `export default` pattern for components
- Props interfaces should be defined inline for smaller components

#### File Organization
- Components should be in `client/src/components/` with descriptive names
- Custom hooks in `client/src/hooks/` prefixed with `use`
- Shared types and utilities in appropriate `lib/` subdirectories
- Backend modules should have single responsibilities

#### Naming Conventions
- Components: PascalCase (e.g., `NewsArticleCard`)
- Files: kebab-case (e.g., `news-article-card.tsx`)
- Variables/functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- API endpoints: RESTful conventions (`/api/news/search`)

### API Integration Standards

#### Brave Search API Usage
- Always check for API key presence before making requests
- Include comprehensive error handling with detailed logging
- Use proper TypeScript interfaces for API responses
- Filter results to trusted news sources only
- Implement reasonable timeouts (15 seconds max)

#### Error Handling
- Log all API errors with timestamps and query details
- Provide meaningful error messages to users
- Implement fallback behaviors for API failures
- Never expose API keys or sensitive data in client-side code

### UI/UX Guidelines

#### Design System
- Follow Google News/Twitter timeline aesthetic
- Use the defined color palette:
  - Primary: `#1A73E8` (news blue)
  - Secondary: `#34A853` (trust green)  
  - Background: `#F8F9FA` (light grey)
  - Text: `#202124` (dark grey)
  - Accent: `#EA4335` (highlight red)

#### Component Patterns
- Use shadcn/ui components as base building blocks
- Implement consistent spacing (16px as base unit)
- Ensure responsive design with mobile-first approach
- Include loading states for all async operations
- Use skeleton loaders during data fetching

#### Accessibility
- Include proper ARIA labels for interactive elements
- Ensure keyboard navigation works throughout the app
- Use semantic HTML elements where appropriate
- Maintain color contrast ratios for readability

### API Endpoint Standards

#### Request/Response Format
- Use JSON for all API communication
- Include proper HTTP status codes
- Validate request parameters using Zod schemas
- Return consistent error response format

#### Performance Guidelines
- Implement request timeouts
- Log API response times for monitoring
- Cache popular search queries when appropriate
- Limit API result counts to reasonable numbers (20 articles max)

### Testing Approach

#### Manual Testing Checklist
- Test search functionality with various queries
- Verify source filtering works correctly
- Check loading states and error handling
- Ensure responsive design on different screen sizes
- Validate that external links open correctly

#### API Testing
- Test with various search terms (AI, politics, tech, etc.)
- Verify error handling for invalid API keys
- Check behavior with network timeouts
- Ensure proper handling of empty results

## Deployment and Environment

### Environment Variables
- `BRAVE_SEARCH_API_KEY`: Required for news search functionality
- `OPENAI_API_KEY`: Required for LLM based timeline summarisation and formatting
- `NODE_ENV`: Set to 'development' or 'production'
- `PORT`: Server port (defaults to 5000)

### Build Process
- Frontend: `npm run build` (Vite builds to `dist/public`)
- Backend: Runs with `tsx` in development, `node` in production
- No database migrations required (uses in-memory storage)

### Performance Considerations
- API calls typically take 1-2 seconds
- Frontend should show loading states during searches
- Backend logs all search queries for analytics
- Images are lazy-loaded and have error fallbacks

## Troubleshooting Common Issues

### API Related
- **Empty search results**: Verify API key is set correctly
- **Timeout errors**: Check network connectivity and API status
- **Rate limiting**: Implement request throttling if needed

### Frontend Issues
- **Loading states not showing**: Check TanStack Query configuration
- **Styling issues**: Verify Tailwind CSS classes and custom CSS variables
- **Routing problems**: Ensure Wouter routes are properly configured

### Backend Issues
- **CORS errors**: Verify Express CORS configuration
- **TypeScript errors**: Check type definitions in shared schemas
- **Port conflicts**: Ensure port 5000 is available

## Feature Development Guidelines

### Adding New Features
1. Define TypeScript interfaces first
2. Implement backend API endpoints with proper validation
3. Create frontend components with loading states
4. Test with real data using Brave Search API
5. Update this documentation if architecture changes

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Loading states are implemented
- [ ] Responsive design is maintained
- [ ] API integration follows established patterns
- [ ] No hardcoded values or mock data
- [ ] Performance impact is considered

## Security Considerations

- Never expose API keys in client-side code
- Validate all user input on the backend
- Use proper CORS settings
- Sanitize HTML content from external sources
- Implement rate limiting for API endpoints

## Monitoring and Analytics

### Logging Standards
- Log all search queries with timestamps
- Track API response times and error rates
- Monitor popular search terms
- Log application errors with stack traces

### Performance Metrics
- API response times (target: <2 seconds)
- Search result relevancy
- User engagement metrics
- Error rates by endpoint

## Future Enhancements

### Potential Features
- User accounts and saved searches
- Push notifications for breaking news
- Advanced filtering (date ranges, sentiment analysis)
- Export functionality (PDF, CSV)
- Dark mode support
- Real-time updates via WebSockets

### Technical Debt
- Implement proper database instead of in-memory storage
- Add comprehensive test suite
- Optimize image loading and caching
- Implement proper pagination for large result sets

---

**Last Updated**: June 13, 2025
**Version**: 1.0.0
**Maintainer**: AI Agent Development Team
