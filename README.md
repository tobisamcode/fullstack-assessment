# Consultant Assessment App

A lightweight Next.js & TypeScript full-stack application that helps clients evaluate consultants based on a job description. Built with [shadcn/ui](https://ui.shadcn.com/) for styling and Tailwind CSS, and using Next.js API routes to serve mock consultant data and perform AI-powered evaluations.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Approach & Architecture](#approach--architecture)

---

## Features

- **Job Description Input**
  Paste or type a job description to fetch the top 10 matching consultant profiles.
- **Consultant Filtering**
  Filter consultants by location, years of experience, or keyword.
- **AI-Powered Evaluation**
  For each displayed consultant, call an LLM inference API (OpenAI) to generate:

  - A fit score (0–100)
  - A short summary of fit or mismatch
  - Key pros & cons
  - Suggested interview questions

- **Typing-Style Rendering**
  Display AI evaluation results with a “typewriter” effect for a more engaging user experience.
- **Skeleton Loaders**
  Show shadcn/ui skeleton cards while waiting for AI evaluations to complete.
- **Responsive UI**
  Built with Tailwind CSS and shadcn/ui components for a clean, mobile-friendly interface.

---

## Tech Stack

- **Frontend**

  - Next.js (15.x) with TypeScript
  - Tailwind CSS & shadcn/ui for UI components
  - React Hooks & context for state management

- **Backend**

  - Next.js API Routes (in `/app/api/consultants` and `/app/api/evaluate`)
  - Mock data stored in `/app/data.ts`
  - OpenAI Node.js SDK for AI inference

- **Utilities**

  - Axios for HTTP requests
  - Sonner.js for toast notifications
  - Custom “TypingText” component for animated text rendering

---

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/consultant-assessment-app.git
   cd consultant-assessment-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create environment file**
   In the project root, create a file named `.env.local` with:

   ```dotenv
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

   - Replace `your_openai_api_key_here` with a valid OpenAI API key.
   - The frontend uses `NEXT_PUBLIC_OPENAI_API_KEY` to call the `/api/evaluate` route.

4. **Run in development mode**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   - Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build and start for production**

   ```bash
   npm run build
   npm run start
   # or
   yarn build
   yarn start
   ```

   - The app will run on port 3000 by default.

---

## Environment Variables

- `NEXT_PUBLIC_OPENAI_API_KEY`

  - Your OpenAI API key (with at least `chat.completions` permission).

No other variables are required for the mock consultant data routes.

---

## Running the App

- **Search Consultants**

  1. Type or paste a job description and click “Search Consultants.”
  2. The app calls `/api/consultants?jobDescription=<your text>`, which returns up to 10 matching consultants from the mock dataset.
  3. Profiles are displayed as cards, showing name, role, location, years of experience, skills, and a short bio.

- **Filter Results**

  - Use the filter panel (location, experience range, keyword) to narrow down the list.

- **Evaluate All**

  1. Click “Evaluate All.”
  2. Each card shows a shadcn/ui skeleton loader while waiting.
  3. In parallel, the frontend POSTs to `/api/evaluate` for each consultant (passing `jobDescription` + `consultantId`).
  4. The Next.js API route calls OpenAI’s `chat.completions.create` with a prompt that includes the job description and consultant profile.
  5. The raw JSON response is parsed and returned to the client.
  6. Each field (fit score, summary, pros, cons, questions) appears with a typewriter animation using the custom `TypingText` component.

---

## Approach & Architecture

1. **Next.js + TypeScript**

   - Entire app lives under `/app` (Next.js App Router).
   - API routes are in `/app/api/consultants/route.ts` and `/app/api/evaluate/route.ts`.

2. **Data Layer**

   - `consultants` are hard-coded in `/app/data.ts` as an array of objects (mock profiles).
   - `GET /api/consultants?jobDescription=...` filters the array (matching role, skills, or bio keywords).
   - If fewer than 10 matches, additional profiles are appended to reach 10.

3. **Evaluation Layer**

   - `POST /api/evaluate` receives `{ jobDescription, consultantId }`.
   - Builds a structured prompt containing:

     - Raw job description
     - Consultant’s name, role, location, years of experience, skills, and bio

   - Calls OpenAI’s GPT-3.5-Turbo with `response_format: { type: "json_object" }` to ensure strictly valid JSON.
   - Parses JSON into an `Evaluation` type (`fitScore`, `summary`, `pros`, `cons`, `questions`) and returns it.

4. **Frontend UI**

   - **State management** via React Hooks:

     - `consultants` array
     - `evaluations` map (keyed by consultant ID)
     - `isLoadingList` / `isLoadingEval` booleans

   - **Search & Fetch Flow**

     1. User clicks “Search Consultants” → `fetchConsultants()` → GET `/api/consultants` → update `consultants` state.
     2. Cards render instantly with consultant info.

   - **Filter Panel**

     - Controlled component updates a `filters` object:

       - `selectedLocation`
       - `selectedExperience`
       - `keyword`

     - Filters are applied client-side against the loaded `consultants` array.

   - **Evaluate All Flow**

     1. User clicks “Evaluate All.”
     2. `isLoadingEval = true` → show skeleton loaders for each card.
     3. Loop through `consultants`, POST to `/api/evaluate`.
     4. Receive JSON evaluation → populate `evaluations[consultant.id]`.
     5. `isLoadingEval = false` → render each card’s `ConsultantCard` component with its evaluation.

   - **ConsultantCard**

     - Displays name, role, location, years of experience, skills, bio.
     - If `evaluation` is undefined, shows “Yet to be evaluated.”
     - If `evaluation` is present:

       - Shows “Fit Score” (e.g. 75/100)
       - Uses a custom `TypingText` component (a `<span>` that gradually reveals text at \~25 ms/character) to animate:

         - Summary
         - Each “pro”/“con” as a list item
         - Each “question” as a list item

5. **UI/UX Considerations**

   - **shadcn/ui Skeleton**

     - While waiting for AI responses, each card displays a pulsing skeleton placeholder (mimicking the actual card layout).

   - **Typewriter Effect**

     - Improves readability and engagement as the AI response “types out.”

   - **Responsive & Modular**

     - Tailwind utility classes and shadcn/UI components ensure a consistent look and feel.
     - Components (e.g., `FilterPanel`, `ConsultantCard`, `TypingText`) are modular and reusable.

---

#### Folder Structure (excerpt)

```
.
├─ app/
│  ├─ api/
│  │   ├─ consultants/
│  │   │   └─ route.ts       # GET /api/consultants
│  │   └─ evaluate/
│  │       └─ route.ts       # POST /api/evaluate
│  ├─ components/
│  │   ├─ FilterPanel.tsx
│  │   ├─ ConsultantCard.tsx
│  │   ├─ TypingText.tsx
│  │   └─ … (other shared UI components)
│  ├─ data.ts                # Mock consultant profiles
│  ├─ page.tsx               # HomePage component
│  └─ type.ts                # Consultant, JobDescription, Evaluation types
├─ public/
│  └─ … (static assets)
├─ styles/
│  └─ globals.css            # Tailwind base & shadcn/ui imports
├─ .env.local                # NEXT_PUBLIC_OPENAI_API_KEY
├─ next.config.js
├─ package.json
└─ tsconfig.json
```

---

### That’s it!

With these setup steps and the high-level architecture, you should be able to run the app locally, see mock consultant data, filter/search, and generate AI-powered evaluations in a clean, responsive interface.
