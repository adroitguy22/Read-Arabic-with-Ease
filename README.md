# Awwal Arabic Hub

**Awwal Arabic Hub** is a full-featured educational app — a gentle doorway into the language of the Qur'an. It guides learners from their first encounter with Arabic letters to confident, expert-level Qur'anic reading.

The learning journey is structured as a **progressive, mastery-focused curriculum** with a calm, beautiful UI suitable for both mobile and web.

## Learning stages

- **Huruf Identification** — All 28 letters from Alif to Yaa, with clear visuals, correct articulation tips, and beginner-friendly explanations.
- **Huruf Positions** — How each letter appears at the beginning, middle, and end of words, with side-by-side comparisons.
- **Arakat (Harakat) Mastery** — Fatha, Kasra, Damma, Sukūn, Tanwīn (Fathatayn, Kasratayn, Dammatayn), Shadda, and Maddah.
- **Sound Application** — How each haraka changes the sound of every letter, with repeat-after-me style practice.
- **Letter Combination** — Two-letter combinations through to longer word constructions, carefully scaffolded.
- **Practice & Reinforcement** — Quizzes, recognition exercises, reading drills, progress tracking, and weak-area focus.

## Features

- **Structured curriculum** — Levels and lessons with objectives, practice words, and interactive exercises.
- **Letter and haraka demos** — Letter cards with articulation tips; position comparison; haraka explanations with examples.
- **Audio integration** — Playback controls and optional repeat/slower modes for letters, syllables, and words (add your own MP3s under `public/audio`).
- **Progress tracking** — Completed lessons and streak counter stored in `localStorage`.
- **Mark as complete** — Finish a lesson and record progress; completed lessons show a checkmark in the sidebar.

## Tech stack

- **React + TypeScript** — UI and app logic.
- **Vite** — Dev server and production build.
- **Tailwind CSS** — Styling; Noto Naskh Arabic for Qur'anic-style text.

## Getting started

```bash
npm install
npm run dev
```

Open the dev URL (e.g. `http://localhost:5173`).

## Project structure

- `src/data/` — Curriculum, letters (Alif–Ya), and harakat definitions.
- `src/components/` — Reusable UI: `LetterCard`, `PositionComparison`, `HarakatDemo`, `AudioPlayer`.
- `src/context/` — Progress context (streak, completed lessons).
- `src/types/` — Progress and spaced-repetition types.

To extend the app, add or edit lessons in `src/data/curriculum.ts`, and add letter/haraka content in `src/data/letters.ts` and `src/data/harakat.ts`.

## Adding audio

Place MP3 files under `public/audio/`, for example:

- `public/audio/huruf/alif.mp3`, `baa.mp3`, …
- `public/audio/harakat/fatha.mp3`, `kasra.mp3`, …
- `public/audio/positions/<letterId>-forms.mp3`
- `public/audio/combination/` and `public/audio/words/` for syllables and words

Reference them in the curriculum or components via `audioUrl: '/audio/...'`. The **AudioPlayer** component supports Play, Repeat, and Slower modes.
