# FitTrack AI

Welcome to **FitTrack AI**, a modern, AI-powered fitness tracking application designed and built from the ground up to revolutionize your workout routines! This app leverages advanced pose detection to count your reps, track your progress, and gamify your fitness journey.

## 🚀 Features

- **🤖 AI Exercise Detection & Rep Counting:** Using cutting-edge pose detection technology, FitTrack AI automatically recognizes your movements and counts your reps.
- **📊 Progress Tracking:** Detailed analytics and visualizations to help you understand your performance over time.
- **🏆 Gamification & Leaderboards:** Earn XP for every rep you complete, level up your profile, and compete with friends on the leaderboard.
- **📹 AI-Guided Tutorials:** Learn the proper form for every exercise with our built-in video tutorials.
- **🎨 Premium Modern UI:** A beautiful, responsive, and intuitive user interface with full dark mode support.

## 🛠️ Technology Stack

We built this project using a modern and robust tech stack:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI & shadcn/ui
- **Authentication:** Clerk
- **Database:** Neon (Serverless Postgres) + Drizzle ORM
- **Forms & Validation:** React Hook Form + Zod
- **AI Models:** TensorFlow.js Pose Detection

## 💻 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harisharen222/FitTrack-AI.git
   cd fitness-tracker
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   You will need:
   - `DATABASE_URL` from your Neon database setup.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from your Clerk dashboard.

4. **Initialize the database:**
   Push the schema to your Neon database using Drizzle:
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action!

## 📂 Project Structure

- `app/` - The core Next.js application routes (Dashboard, Leaderboard, Workout, etc.)
- `components/` - Reusable React components and UI elements.
- `lib/` - Utility functions and helpers.
- `public/` - Static assets and images.
- `styles/` - Global stylesheets and Tailwind configuration.

## 👨‍💻 Author

**harisharen222**

## 📄 License

This project is licensed under the MIT License.
