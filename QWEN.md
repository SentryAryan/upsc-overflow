# UPSC Overflow - Project Context for Qwen Code

## Project Overview

UPSC Overflow is a full-stack web application built with Next.js 15 and TypeScript, designed specifically for UPSC (Union Public Service Commission) aspirants. The platform serves as a community hub where users can ask questions, share knowledge, and connect with fellow civil service exam preparers. Key features include a question and answer system, rich text editing, search and filtering, responsive design, and dark/light theme support.

## Tech Stack

### Frontend
- **Next.js 15** - React framework for production
- **TypeScript** - Typed superset of JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Framer Motion** - Animation library

### Backend & Authentication
- **Convex** - Backend-as-a-Service
- **Clerk** - Authentication and user management

### AI & External Services
- **AI SDK** - Multiple AI providers (Anthropic, Google, Groq, OpenAI)
- **TinyMCE / Tiptap** - Rich text editors
- **HugeIcons** - Icon library

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **npm-run-all** - Concurrent task execution

## Project Structure

```
app/                    # Next.js app directory
├── api/               # API routes
├── ask-question/      # Ask question page
├── chat/              # Chat functionality
├── community/         # Community features
├── practice/          # Practice section
├── profile/           # User profiles
├── question/          # Individual question pages
├── questions/         # Questions listing
└── ...                # Other pages

components/            # React components
lib/                   # Utility functions and libraries
hooks/                 # Custom React hooks
public/                # Static assets
```

## Development Workflow

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- Convex account
- Clerk account

### Environment Setup
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Convex
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   
   # AI Providers (optional, based on what you plan to use)
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

### Available Scripts
- `npm run dev` - Runs the app in development mode (frontend and backend)
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint to check for code issues
- `npm run format` - Formats code with Prettier

## Code Quality & Conventions

- **Code Style**: Prettier is configured with specific settings in `.prettierrc.json` for consistent code formatting.
- **Linting**: ESLint is used for code linting, extending Next.js core web vitals and TypeScript configurations.
- **Type Safety**: TypeScript is used throughout the project with strict type checking enabled.
- **Component Library**: shadcn/ui components are used for UI elements, following the "new-york" style.
- **Path Aliases**: The project uses path aliases defined in `tsconfig.json` (`@/*` maps to `./`).
- **Image Optimization**: Next.js image optimization is configured for specific remote patterns.

## Authentication & Authorization

- **Authentication**: Clerk is used for user authentication and management. Public routes are defined in `middleware.ts`.
- **Protected Routes**: Routes not marked as public require authentication.

## Data Management

- **Backend**: Convex is used as the backend-as-a-service for data storage and retrieval.
- **State Management**: Redux Toolkit is used for client-side state management.

## AI Integration

- **AI SDK**: The project integrates with multiple AI providers through the AI SDK for various features.