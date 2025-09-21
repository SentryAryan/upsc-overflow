# Gemini Project Context: UPSC Overflow

This document provides context for the "UPSC Overflow" project, a full-stack web application.

## 1. Project Overview

UPSC Overflow is a community platform for UPSC (Union Public Service Commission) aspirants in India. It allows users to ask and answer questions, share knowledge, and connect with fellow exam preparers. The goal is to create a supportive community for the civil service exam preparation journey.

The application is built with a modern tech stack:

*   **Frontend**: Next.js (React), TypeScript, Tailwind CSS, and shadcn/ui for components.
*   **Backend**: [Convex](https://www.convex.dev/), a backend-as-a-service platform that provides a real-time database, serverless functions, and file storage.
*   **Authentication**: [Clerk](https://clerk.com/) is used for user management and authentication.
*   **State Management**: Redux Toolkit is used for global state management.
*   **Forms**: React Hook Form with Zod for validation.
*   **AI Integration**: The project uses the Vercel AI SDK to integrate with various AI providers like OpenAI, Google, and Anthropic, likely for features like AI-assisted answers or content generation.

## 2. How to Build and Run the Project

The `package.json` file contains the necessary scripts to run, build, and test the application.

*   **To run the development server (frontend and backend):**
    ```bash
    npm run dev
    ```
    This command concurrently starts the Next.js frontend (`next dev --turbopack`) and the Convex backend (`convex dev`).

*   **To build the project for production:**
    ```bash
    npm run build
    ```

*   **To start the production server:**
    ```bash
    npm run start
    ```

*   **To lint the code:**
    ```bash
    npm run lint
    ```

*   **To format the code:**
    ```bash
    npm run format
    ```

**Note:** The project is configured in `next.config.ts` to ignore TypeScript and ESLint errors during the build process (`ignoreBuildErrors: true`).

## 3. Development Conventions

*   **Code Style**: The project uses Prettier for automated code formatting and ESLint for linting to maintain a consistent codebase. The configurations can be found in `.prettierrc.json` and `eslint.config.mjs`.
*   **Component-Based Architecture**: The project follows a component-based architecture, with reusable UI components located in the `components/` directory. It makes heavy use of `shadcn/ui`.
*   **File Structure**: The main application logic is within the `app/` directory, following the Next.js App Router paradigm. API routes, pages, and layouts are organized here.
*   **Backend Schema**: The Convex database schema is defined in `convex/schema.ts`. It currently includes tables for `messages` and `reactions`, suggesting a real-time chat or commenting system is a key feature.
*   **Authentication**: Route protection is handled by the Clerk middleware in `middleware.ts`. It specifies which routes are public and which require authentication.
*   **Environment Variables**: The project requires a `.env.local` file with keys for Clerk, Convex, and various AI providers as specified in the `README.md`.
