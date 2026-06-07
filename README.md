# KISJ Academic Optimizer (GPA Calculator & Simulator) 📊📈

A mobile-first academic performance management and GPA simulation web app customized for students at the **Korea International School Jeju (KISJ)**. 

Built to help students treat their academic trajectories as systems-optimization problems—allowing them to track daily assessment weights, model future semesters, and run sandbox GPA scenarios.

---

## 💡 The Core Problem & Academic Logic

KISJ's assessment model uses a weighted grading scale combining Formative and Summative categories, compounded by AP (Advanced Placement) weight boosts and custom final exam percentages. Keeping track of actual standing and cumulative trajectories using spreadsheets is slow and error-prone.

This optimizer implements the exact mathematical logic of KISJ's academic system:

### 1. Dynamic Term Weighting
- **Standard Mode:** Formative Assessments (20%) + Summative Assessments (80%).
- **Final Exam Mode:** Formative (20%) + Summative (60%) + Final Exam (20%).
- **Weight Redistribution:** If an assessment category (e.g., formative) contains no scores yet, the engine dynamically redistributes the remaining weight across active categories to prevent skewed grade reporting.

### 2. Weighted vs. Unweighted Scales
- Converts percentage grades into standard letter grades and GPA points using KISJ's specific conversions:
  - `A+/A` = 4.0, `A-` = 3.667, `B+` = 3.333, `B` = 3.0, etc.
- **AP Weight Boost:** Instantly toggles a `+1.0` GPA boost for Advanced Placement courses when Weighted mode is active.
- **Credit Balancing:** Handles specialized 0.5-credit courses (such as Korean language classes) alongside standard 1.0-credit courses for exact GPA scaling.

### 3. Predictive "Sandbox" Mode
- Run real-time GPA simulations without saving them.
- Predict target scores needed on upcoming summative assessments to achieve or maintain target letter grades.

---

## ⚡ Technical Highlights & Design System

- **Cupertino Design System:** Overhauled the styling to align with Apple's clean design language. Features HSL color tokens, thin borders, flat segmented controller elements, centered pop-up modals, and a custom circular SVG GPA progress ring.
- **Dynamic Validation UX:** Implements responsive error-shake animations when score inputs violate range thresholds, alongside AP/Honors course badge indicators. Caps unweighted GPA calculations strictly at `4.0` while maintaining the `4.5` limit for weighted GPAs.
- **Robust Local-First Privacy:** All student grades, optional course titles, and semester histories are stored client-side in browser `localStorage`. No data is ever transmitted to external servers, ensuring absolute privacy and zero network dependence.
- **UI Responsiveness:** Custom lightweight transitions designed for quick, lag-free entry on mobile devices, utilizing optimized layout properties (like `flex-1 min-w-0`) to prevent text collisions.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Optimized for mobile-first forms)
- **Animations:** Motion (Framer Motion React adapter)

---

## 🚀 Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/angdulu/kisjgpa.git
   cd kisjgpa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Compile production build:**
   ```bash
   npm run build
   ```

---
*Developed by Andrew Kim.*
