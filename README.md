# UPSC Overflow

A community platform for UPSC aspirants to ask questions, share knowledge, and connect with fellow civil service exam preparers.

## Live Demo

[Live Demo Link](https://upsc-overflow.vercel.app) <!-- Replace with actual deployed URL -->

## Project Overview

UPSC Overflow is a full-stack web application designed specifically for UPSC (Union Public Service Commission) aspirants. The platform allows users to:

- Ask questions related to UPSC preparation
- Answer questions from other aspirants
- Search through existing questions and answers
- Filter questions by subjects and sorting options
- Practice with community-generated content

The platform aims to create a supportive community where UPSC aspirants can help each other with their preparation journey.

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

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn
- Convex account
- Clerk account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd upsc-overflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
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

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

- `npm run dev` - Runs the app in development mode (frontend and backend)
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint to check for code issues
- `npm run format` - Formats code with Prettier

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

## Features

- User authentication with Clerk
- Question and answer system
- Rich text editor for creating content
- Search and filtering functionality
- Responsive design for all devices
- Dark/light theme support
- AI-powered features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
