# 10xDevsCourseApp

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
10xDevsCourseApp is a web application designed to enhance learning through the creation of educational flashcards. The system leverages LLMs to generate flashcards from provided text, and it also allows for manual creation, editing, and deletion of flashcards. Additionally, the app integrates a spaced repetition algorithm to optimize learning retention.

## Tech Stack
- **Frontend:**
  - Astro 5
  - React 19
  - TypeScript 5
  - Tailwind 4
  - Shadcn/ui
- **Backend:**
  - Supabase (PostgreSQL, authentication)
- **AI Integration:**
  - Openrouter.ai (support for multiple AI providers)
- **CI/CD & Hosting:**
  - GitHub Actions
  - DigitalOcean

## Getting Started Locally
1. Ensure you have Node.js installed (the project uses the Node version specified in `.nvmrc`: **22.14.0**).
2. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
3. Navigate to the project directory:
   ```bash
   cd 10xdevs-course-app
   nvm use
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Available Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build.
- `npm run astro` - Runs the Astro CLI.
- `npm run lint` - Runs ESLint to analyze code.
- `npm run lint:fix` - Automatically fixes lint errors.
- `npm run format` - Formats the code using Prettier.

## Project Scope
The project focuses on the following key features:
- **AI-Generated Flashcards:** Generate flashcards from user-provided text (between 1000 and 10000 characters) with enforced content length restrictions (front: max 200 characters, back: max 500 characters).
- **Flashcard Review:** Review, edit, or reject AI-generated flashcards before final acceptance.
- **Manual Flashcard Creation:** Create flashcards manually via an intuitive form with built-in validation.
- **Flashcard Management:** Edit and delete flashcards as needed.
- **Spaced Repetition:** Integrate an open-source spaced repetition algorithm to schedule review sessions.
- **User Authentication:** Support secure user registration, login, and account management to ensure personalized data access.
- **Analytics & Logging:** Track flashcard generation and interactions for quality assessment and improvement.

## Project Status
The project is currently in the MVP stage and under active development.

## License
This project is licensed under the MIT License. 