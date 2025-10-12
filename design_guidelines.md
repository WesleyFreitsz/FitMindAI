# FitMind AI - Design Guidelines

## Design Approach

**Hybrid System-Reference Approach**: Combining Material Design principles with inspiration from leading fitness apps (MyFitnessPal, Lose It!) and modern data dashboards (Linear, Notion). The design prioritizes rapid data entry, clear information hierarchy, and motivational visual feedback while maintaining the requested modern, minimalist aesthetic.

**Core Principle**: Efficiency-first design that makes logging food and workouts feel effortless, with intelligent use of space to present complex nutritional data without overwhelming users.

---

## Color Palette

### Dark Mode (Primary)
- **Background Primary**: 15 8% 12% (deep charcoal)
- **Background Secondary**: 15 8% 16% (elevated surfaces)
- **Background Tertiary**: 15 8% 20% (cards, inputs)

- **Primary Brand**: 142 76% 45% (energetic green - represents health/growth)
- **Primary Hover**: 142 76% 38%
- **Text on Primary**: 0 0% 100%

- **Accent Success**: 142 71% 45% (macro goals met)
- **Accent Warning**: 38 92% 50% (approaching limits)
- **Accent Danger**: 0 84% 60% (exceeded limits)

- **Text Primary**: 0 0% 95% (high contrast)
- **Text Secondary**: 0 0% 65% (labels, meta info)
- **Text Tertiary**: 0 0% 45% (placeholders, hints)

- **Border Subtle**: 15 8% 24%
- **Border Default**: 15 8% 30%

### Light Mode (Secondary)
- **Background**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Primary**: 142 76% 35%
- **Text**: 15 8% 15%

---

## Typography

**Font Families** (via Google Fonts):
- **Primary**: 'Inter' - UI elements, body text, data labels
- **Display**: 'Inter' at heavier weights (600-700) - headings, hero numbers
- **Monospace**: 'JetBrains Mono' - calorie counters, macro values

**Scale**:
- **Hero Numbers**: text-5xl/text-6xl font-bold (dashboard calorie count)
- **Headings H1**: text-3xl font-semibold (page titles)
- **Headings H2**: text-xl font-semibold (section titles)
- **Body**: text-base font-normal (descriptions, lists)
- **Labels**: text-sm font-medium (form labels, card headers)
- **Meta**: text-xs font-normal text-secondary (timestamps, units)
- **Data Values**: font-mono font-semibold (nutrition numbers)

---

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- **Micro spacing**: p-2, gap-2 (tight groupings)
- **Component padding**: p-4, p-6 (cards, buttons)
- **Section spacing**: py-8, py-12 (vertical rhythm)
- **Container gaps**: gap-4, gap-6 (grid/flex layouts)

**Grid System**:
- Mobile: Single column, full-width cards with p-4
- Tablet (md:): 2-column grids for macro cards, food logs
- Desktop (lg:): 3-column dashboard layout (sidebar + main + quick-add panel)

**Max Widths**:
- Main container: max-w-7xl mx-auto
- Content cards: Full width within container
- Form inputs: max-w-md for optimal mobile typing
- Dashboard widgets: Flexible within grid

---

## Component Library

### Navigation
- **Bottom Tab Bar (Mobile)**: Sticky bottom navigation with 4-5 icons (Dashboard, Alimentação, Treino, Perfil)
- **Sidebar (Desktop)**: Fixed left sidebar (w-64) with icon + label navigation
- **Top Bar**: App name, daily streak counter, user avatar (right-aligned)

### Data Entry Components
- **Quick Add Input**: Large, prominent text input with microphone icon for voice entry
  - Floating action button (FAB) with "+" on mobile screens
  - Autocomplete dropdown showing food suggestions as user types
  - Background: bg-tertiary, border-2 on focus
  
- **Food Log Card**: 
  - Food name (font-semibold), portion size (text-secondary)
  - Macro pills (protein/carbs/fat) with icon indicators
  - Time badge, delete/edit icons (right-aligned)
  - Swipe-to-delete on mobile

- **Workout Entry**:
  - Exercise type selector (dropdown with icons)
  - Duration slider with minute markers
  - Intensity picker (1-5 scale with visual indicators)
  - Calorie burn estimate (real-time calculation)

### Dashboard Widgets
- **Calorie Ring Chart**: 
  - Circular progress showing consumed vs target
  - Center displays net calories (large mono font)
  - Color gradient: green (deficit) → yellow (maintenance) → red (surplus)
  
- **Macro Bars**:
  - Horizontal progress bars for Protein, Carbs, Fat
  - Current/target values at ends
  - Color-coded: Protein (blue), Carbs (orange), Fat (purple)

- **Weight Projection Card**:
  - Line chart showing 7-day weight trend
  - Projected weight in 1 week (based on calorie balance)
  - Small sparkline visualization

- **AI Suggestions Panel**:
  - Chat-style cards with AI avatar icon
  - Light background (bg-secondary) with left border accent
  - Actionable suggestions with quick-tap responses

### Forms & Inputs
- **Text Inputs**: 
  - Rounded-lg, bg-tertiary, border on focus
  - Label above (text-sm font-medium)
  - Helper text below (text-xs text-tertiary)
  
- **Select Dropdowns**: Custom styled with chevron icon, matches input style
- **Toggle Switches**: Material Design style for settings (objetivo, nível atividade)
- **Number Steppers**: +/- buttons for portions, weights (large tap targets on mobile)

### Cards & Surfaces
- **Standard Card**: rounded-xl bg-secondary p-6 shadow-sm
- **Interactive Card**: Add hover:bg-tertiary transition on desktop
- **Elevated Card**: shadow-lg for important metrics (daily summary)

### Buttons
- **Primary CTA**: bg-primary text-white px-6 py-3 rounded-lg font-semibold
- **Secondary**: border-2 border-primary text-primary bg-transparent (no blur needed in this dark UI)
- **Icon Buttons**: p-3 rounded-full hover:bg-tertiary (quick actions)
- **FAB (Mobile)**: Fixed bottom-right, w-14 h-14 rounded-full bg-primary shadow-lg

### Data Visualization
- **Progress Rings**: Use Chart.js or Recharts for donut charts
- **Bar Charts**: Horizontal bars for macros, vertical for weekly trends
- **Line Charts**: Weight progression over time
- **Color Coding**: Consistent across all charts (green=good, yellow=warning, red=exceeded)

---

## Page Layouts

### Dashboard (Home)
- **Hero Section**: Today's calorie summary with large ring chart (h-auto, not forced 100vh)
- **Quick Stats Grid**: 2x2 grid (md:) showing macros, exercise, water, weight
- **Recent Activity Feed**: Scrollable list of today's food logs
- **AI Insight Card**: Latest suggestion or achievement badge
- Spacing: py-6 between major sections

### Alimentação (Food Log)
- **Search Bar**: Sticky top position with voice input icon
- **Today's Log**: Grouped by meal time (Café, Almoço, Jantar, Lanches)
- **Meal Cards**: Stacked vertically, swipe interactions on mobile
- **Bottom Sheet**: Food database search results with nutrition info

### Treino (Workout)
- **Exercise Type Selector**: Icon grid (cardio, strength, sports)
- **Active Workout Card**: Timer, exercise name, calorie counter
- **History Timeline**: Vertical list of past workouts with date headers

### Perfil (Profile)
- **User Info Section**: Avatar, name, goals (stacked layout)
- **Metrics Form**: Weight, height, age, sex (2-column grid on tablet+)
- **Goals & Preferences**: Toggle switches and dropdowns
- **BMR/TDEE Display**: Prominent cards showing calculations

---

## Animations

**Minimal, Purposeful Motion**:
- **Transitions**: 200ms ease-in-out for hover states, 300ms for page transitions
- **Loading States**: Shimmer effect on cards while data loads
- **Success Feedback**: Subtle scale animation (scale-105) when logging food/workout
- **Ring Chart**: Animated fill on page load (1s ease-out)
- **Number Counters**: Animate to final value on dashboard load
- Avoid: Excessive scroll animations, parallax, continuous spinning

---

## Accessibility & Responsive Behavior

- **Touch Targets**: Minimum 44x44px on all interactive elements
- **Form Inputs**: Dark mode optimized with sufficient contrast (text-primary on bg-tertiary)
- **Focus States**: Clear ring-2 ring-primary outline on all interactive elements
- **Voice Input**: Large microphone button with visual feedback when recording
- **Responsive Breakpoints**:
  - Mobile-first: Stack all elements vertically with full-width cards
  - md: (768px+): 2-column grids, side-by-side macro bars
  - lg: (1024px+): 3-column dashboard, persistent sidebar
  
---

## Images

**Strategic Image Usage**:
- **Hero Section**: No large hero image - replaced with prominent calorie ring chart and data visualization
- **Empty States**: Illustration showing person logging food (friendly, minimal line art style)
- **Achievement Badges**: Small celebratory icons when goals are met (confetti effect)
- **Food Thumbnails**: Optional small circular images (48x48px) next to food log entries if available from database
- **Profile Avatar**: User uploaded or default icon (96x96px on profile, 32x32px in top bar)

**Image Style**: Prefer illustrations over photos for consistency, use subtle gradients, maintain brand green accent in imagery.