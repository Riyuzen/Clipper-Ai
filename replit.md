# Clipper AI

## Overview

Clipper AI is a video processing application that generates highlight clips from videos using AI-powered transcription and smart detection. Users can submit videos via URL (YouTube, etc.) or file upload, and the system automatically extracts audio, transcribes it using OpenAI Whisper, detects highlight moments based on keyword analysis, and cuts the video into downloadable clips.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, React useState for local state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with React plugin

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- shadcn/ui primitives in `client/src/components/ui/`
- API utilities in `client/src/lib/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **File Handling**: Multer for video uploads (max 500MB)
- **Build**: esbuild for production bundling

The server follows a service-oriented architecture:
- `server/routes.ts` - API endpoint definitions
- `server/storage.ts` - Data storage abstraction (currently in-memory)
- `server/services/` - Processing pipeline modules:
  - `videoDownloader.ts` - Downloads videos via yt-dlp or processes uploads
  - `audioExtractor.ts` - Extracts audio using FFmpeg
  - `transcriber.ts` - Transcribes audio via OpenAI Whisper API
  - `highlightDetector.ts` - Keyword-based highlight scoring algorithm
  - `clipCutter.ts` - Cuts video segments using FFmpeg
  - `clipProcessor.ts` - Orchestrates the full processing pipeline

### Data Storage
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect (`shared/schema.ts`)
- **Current Implementation**: In-memory storage (`MemStorage` class)
- **Database Ready**: Drizzle config points to `DATABASE_URL` environment variable

The schema defines:
- `users` table for authentication
- TypeScript interfaces for `ClipJob`, `Clip`, and `TranscriptSegment`

### Processing Pipeline
1. User submits video URL or file
2. Job created with "pending" status
3. Video downloaded (yt-dlp) or processed from upload
4. Audio extracted (FFmpeg → MP3)
5. Audio transcribed (OpenAI Whisper → timestamped segments)
6. Highlights detected (keyword scoring algorithm)
7. Clips cut from video (FFmpeg → MP4 files)
8. Job marked complete with clip metadata

## External Dependencies

### APIs and Services
- **OpenAI API**: Whisper model for audio transcription (requires `OPENAI_API_KEY`)

### System Tools (Required)
- **yt-dlp**: Video downloading from URLs (YouTube, etc.)
- **FFmpeg**: Audio extraction and video clip cutting

### Database
- **PostgreSQL**: Configured via Drizzle but currently using in-memory storage
- **Environment Variable**: `DATABASE_URL` for database connection

### Key npm Packages
- `openai` - OpenAI API client
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `multer` - Multipart file upload handling
- `fs-extra` - Enhanced file system operations
- `@tanstack/react-query` - Server state management
- `wouter` - Client-side routing
- Full shadcn/ui component set via Radix primitives