# KISJ GPA Calculator

KISJ GPA Calculator is a mobile-first GPA management web app for KISJ students.
It helps students track their current term performance, record cumulative GPA, and quickly simulate semester GPA with a clean, lightweight interface.

## What This Website Does

This app is designed for students who want more than a simple GPA calculator.
It combines day-to-day grade tracking with longer-term GPA planning in one place.

You can use it to:

- Track each course in the current term
- Add formative, summative, and final assessment scores
- See your current percentage and letter grade instantly
- Toggle between weighted and unweighted GPA
- Manage AP weighting
- Set a target grade for each course
- Record previous semesters to monitor cumulative GPA
- Run quick GPA simulations without saving them

## Main Sections

### 1. Current Term

This is the main working area of the app.

- Add courses and organize them in your preferred order
- Open a course to manage detailed assessments
- View the current grade as both a percentage and a letter grade
- Turn Final Exam Mode on or off depending on the course structure
- Set a target grade and check how close you are to reaching it

### 2. Cumulative GPA

This section is for long-term academic tracking.

- Save semester GPA records by grade and semester
- Review your overall cumulative GPA
- Reorder past semesters for clean organization
- Enter GPA directly or calculate it from grade counts

### 3. Quick GPA

This is a fast calculator for rough planning.

- Enter how many A, A-, B+, and other grades you have
- Get an instant GPA result
- Test scenarios before committing anything to your record
- Inputs here are not saved

## GPA and Grade Logic

The app uses a letter-grade scale and converts course performance into GPA values.

- Default weighting:
  - Formative: 20%
  - Summative: 80%
- Final Exam Mode weighting:
  - Formative: 20%
  - Summative: 60%
  - Final: 20%
- If a category has no scores yet, the app redistributes weights across the categories that do have scores
- AP courses can receive extra weighting when weighted GPA mode is enabled

## Why It Fits KISJ

The app is tailored to the KISJ context.

- Common KISJ and AP course names are built in
- Some course aliases help users find classes faster
- Korean courses can be handled with 0.5 credit where needed
- The interface is optimized for quick daily use on phones

## Privacy

This app is privacy-first.

- All data is stored locally in your browser
- No account is required
- No server-side student record storage is built into this app

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion

## Run Locally

### Prerequisites

- Node.js

### Start the project

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`

## Project Goal

The goal of this project is to give KISJ students a GPA tool that feels simple enough for everyday use, but detailed enough to support real academic planning.
