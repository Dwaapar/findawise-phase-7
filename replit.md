# Findawise Empire - Central Config + Dynamic Page Generator

## Overview

The Central Config + Dynamic Page Generator is a framework-independent, modular system that serves as the core of the Findawise Empire. It dynamically generates web pages from a central configuration file, featuring emotion-based theming, interactive modules, and SEO optimization. Built with React and TypeScript, the system is designed to be easily exportable and reusable across different frameworks.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 18, 2025 - Complete Lead Magnet & Email Capture System
✓ Built comprehensive lead magnet database schema with forms, magnets, and captures
✓ Created advanced LeadCaptureForm component with A/B testing and variant support
✓ Implemented LeadCaptureRenderer for multi-position form placement (header, inline, sidebar, footer, popup)
✓ Added anti-spam protection with validation, honeypot fields, and rate limiting
✓ Built full-featured LeadsDashboard with real-time analytics and CSV export
✓ Integrated lead capture system with existing personalization and session management
✓ Added automated email delivery configuration and trigger sequences
✓ Created comprehensive API routes for lead management and form assignments
✓ Populated system with sample data and integrated with DynamicPageGenerator
✓ Added lead management dashboard to main navigation with complete admin interface

### January 18, 2025 - Complete Replit Migration & Affiliate Analytics System
✓ Successfully migrated project from Replit Agent to standard Replit environment
✓ Set up PostgreSQL database with complete affiliate management schema
✓ Installed all required dependencies and configured environment variables
✓ Created comprehensive analytics API endpoints for affiliate tracking
✓ Built advanced AnalyticsDashboard with charts, tables, and performance metrics
✓ Added real-time click tracking and conversion monitoring
✓ Implemented complete affiliate redirect engine with cookie tracking
✓ Created sample affiliate networks and offers for testing
✓ Added recharts library for data visualization and analytics charts
✓ Documented complete affiliate management system in README.md
✓ Upgraded Dashboard with analytics navigation and detailed insights

### January 18, 2025 - Blog Content Auto-Generation System
✓ Implemented BlogContentRenderer with markdown support and emotion-based styling
✓ Created BlogManager for content editing, generation, and export/import
✓ Built CLI content generation tool with comprehensive templates
✓ Added react-markdown with syntax highlighting and custom styling
✓ Integrated blog content into dynamic page generator
✓ Generated sample content for all pages (2000+ words each)
✓ Enhanced README with complete blog system documentation
✓ Added framework export/import capabilities and migration guides

### January 18, 2025 - README Documentation Enhancement
✓ Added comprehensive examples for adding new pages (3 methods)
✓ Created step-by-step guide for adding new emotions with code examples
✓ Documented complete process for adding new interactive modules
✓ Added system architecture diagram and component explanations
✓ Included troubleshooting section and file structure overview
✓ Added export/import instructions for framework portability
✓ Created tables for available modules and emotions with use cases

### January 18, 2025 - Complete A/B Testing & Experimentation Framework
✓ Built comprehensive A/B testing database schema with experiments, variants, and tracking tables
✓ Implemented experiment assignment logic with session persistence and device fingerprinting
✓ Created tracking system for impressions, clicks, conversions, and custom events
✓ Built admin experiments dashboard with real-time analytics and performance metrics
✓ Integrated A/B testing with existing personalization and session management systems
✓ Added client-side React hooks for seamless experiment integration
✓ Created API endpoints for experiment management, variant assignment, and event tracking
✓ Implemented automatic traffic allocation and consistent user experience
✓ Added comprehensive admin interface for experiment creation and monitoring
✓ Updated README.md with complete A/B testing documentation and handoff guide

### January 18, 2025 - Complete User Personalization & Session Engine Integration
✓ Integrated session management into DynamicPageGenerator with real-time personalization
✓ Enhanced AffiliateOfferRenderer with user segmentation and personalized offer prioritization
✓ Updated BlogContentRenderer to support personalized content recommendations
✓ Created comprehensive User Insights Dashboard with behavioral analytics and conversion flows
✓ Added complete API routes for session management, behavior tracking, and user insights
✓ Implemented PostgreSQL storage methods for all personalization features
✓ Built admin dashboard with heatmaps, segment analysis, and conversion tracking
✓ Added personalized CTA buttons, emotion theming, and content adaptation
✓ Created full routing structure for /admin/user-insights page
✓ Completed billion-dollar level personalization engine with real-time recommendations

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom emotion-based theming system
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Analytics**: Recharts for data visualization and performance charts

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Connect-pg-simple for session storage
- **Development**: Hot module replacement with Vite integration
- **Affiliate System**: Complete click tracking and analytics engine

### Affiliate Management Features
- **Multi-Network Support**: ClickBank, Amazon Associates, ShareASale integration
- **Click Tracking**: Real-time affiliate link monitoring with metadata
- **Analytics Dashboard**: Comprehensive performance metrics and visualizations
- **Cookie Attribution**: Advanced tracking for conversion attribution
- **Revenue Tracking**: Commission calculation and performance monitoring

### Key Components

#### 1. Configuration System
- **Central Config**: `pages.json` file containing all page definitions
- **Page Schema**: Structured configuration for each page including slug, title, description, niche, emotion, interactive modules, and content pointers
- **Type Safety**: TypeScript interfaces for configuration validation

#### 2. Dynamic Page Generator
- **Route Handler**: `[slug].tsx` dynamically renders pages based on configuration
- **Content Loading**: Dynamically loads markdown content from specified file paths
- **Meta Tags**: Automatically generates SEO-optimized meta tags and structured data
- **Theme Application**: Applies emotion-based styling based on page configuration

#### 3. Emotion-Based Theming
- **Five Emotions**: Trust (green), Excitement (yellow), Relief (purple), Confidence (red), Calm (blue)
- **CSS Variables**: Dynamic theming using CSS custom properties
- **Theme Mapping**: Centralized emotion-to-color mapping system
- **Responsive Design**: Mobile-first approach with consistent theming

#### 4. Interactive Modules
- **Pluggable Architecture**: Modular components that can be dynamically loaded
- **Module Types**: Quiz, Calculator, Comparison, Timer modules
- **Emotion Integration**: Modules adapt styling based on page emotion
- **Reusable Components**: Each module is self-contained and reusable

#### 5. Content Management
- **Markdown Support**: External markdown files for content injection
- **File Structure**: Organized content directory with topic-based files
- **Dynamic Loading**: Content loaded asynchronously based on configuration
- **SEO Optimization**: Structured content with proper heading hierarchy

## Data Flow

1. **Configuration Loading**: System loads `pages.json` on application start
2. **Route Resolution**: URL slug matches against configuration entries
3. **Page Generation**: Dynamic page component renders based on matched configuration
4. **Content Loading**: Markdown content loaded from specified file path
5. **Module Initialization**: Interactive module loaded and configured
6. **Theme Application**: Emotion-based styling applied to all components
7. **SEO Enhancement**: Meta tags and structured data injected into document head

## External Dependencies

### Production Dependencies
- **UI Framework**: React ecosystem (React, React DOM, React Router alternative)
- **State Management**: TanStack Query for efficient data fetching
- **Styling**: Tailwind CSS with PostCSS processing
- **UI Components**: Radix UI primitives for accessibility
- **Database**: Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)
- **Utilities**: Class variance authority, clsx, date-fns

### Development Dependencies
- **Build Tools**: Vite, ESBuild, TypeScript
- **Development Experience**: Runtime error overlay, hot module replacement
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Build Process
1. **Client Build**: Vite compiles React application to static assets
2. **Server Build**: ESBuild bundles Express server for production
3. **Asset Optimization**: Automatic code splitting and asset optimization
4. **Type Checking**: TypeScript compilation and type checking

### Production Architecture
- **Static Assets**: Client-side assets served from `dist/public`
- **Server Process**: Node.js server handling API routes and SSR
- **Database**: PostgreSQL database with connection pooling
- **Environment**: Production-optimized build with proper error handling

### Configuration Management
- **Environment Variables**: Database URLs and sensitive configuration
- **Static Configuration**: Page configuration in JSON format
- **Content Files**: Markdown files for dynamic content loading
- **Asset Management**: Organized asset structure with proper routing

The system is designed to be easily deployable on platforms like Replit, Vercel, or traditional hosting providers, with automatic database provisioning and migration support through Drizzle ORM.