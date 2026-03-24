# BLIH UI/UX Design Specifications

**Version:** 1.0  
**Last Updated:** February 2026  
**For:** Designers, Frontend Developers, Product Managers

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System](#2-design-system)
3. [Component Library](#3-component-library)
4. [Layout & Grid System](#4-layout--grid-system)
5. [Navigation Patterns](#5-navigation-patterns)
6. [Form Design](#6-form-design)
7. [Data Visualization](#7-data-visualization)
8. [Accessibility](#8-accessibility)
9. [Responsive Design](#9-responsive-design)
10. [Animation & Micro-interactions](#10-animation--micro-interactions)

---

## 1. Design Philosophy

### 1.1 Core Principles

```
┌────────────────────────────────────────────────┐
│  CLARITY                                       │
│  Information should be easy to understand      │
│  Visual hierarchy guides the eye               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  CONSISTENCY                                   │
│  Predictable patterns across all modules       │
│  Familiar interactions reduce cognitive load   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  EFFICIENCY                                    │
│  Minimize clicks to complete tasks             │
│  Smart defaults and auto-fill                  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  ACCESSIBILITY                                 │
│  Usable by everyone, regardless of ability     │
│  WCAG 2.1 AA compliance minimum                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  DELIGHT                                       │
│  Subtle animations enhance experience          │
│  Pleasant to use daily                         │
└────────────────────────────────────────────────┘
```

### 1.2 Design Values

| Value                      | Description             | Implementation                    |
| -------------------------- | ----------------------- | --------------------------------- |
| **Progressive Disclosure** | Show only what's needed | Collapsible sections, wizards     |
| **Immediate Feedback**     | Confirm user actions    | Success toasts, loading states    |
| **Forgiveness**            | Allow undo/cancel       | Confirmation dialogs, draft saves |
| **Contextual Help**        | Help when needed        | Tooltips, inline hints            |
| **Data-Driven**            | Surface insights        | Dashboards, analytics widgets     |

---

## 2. Design System

### 2.1 Color Palette

#### Primary Colors

```css
/* Primary - Blue (Trust, Professionalism) */
--color-primary-50: #eff6ff; /* Lightest */
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6; /* Base */
--color-primary-600: #2563eb; /* Hover */
--color-primary-700: #1d4ed8; /* Active */
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a; /* Darkest */

/* Secondary - Indigo (Sophistication) */
--color-secondary-500: #6366f1;
--color-secondary-600: #4f46e5;
--color-secondary-700: #4338ca;
```

#### Semantic Colors

```css
/* Success - Green */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-600: #16a34a; /* Preferred */
--color-success-700: #15803d;

/* Warning - Amber */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706; /* Preferred */
--color-warning-700: #b45309;

/* Error - Red */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626; /* Preferred */
--color-error-700: #b91c1c;

/* Info - Sky */
--color-info-50: #f0f9ff;
--color-info-500: #0ea5e9;
--color-info-600: #0284c7; /* Preferred */
--color-info-700: #0369a1;
```

#### Neutral Colors

```css
/* Grayscale */
--color-gray-50: #f9fafb; /* Background */
--color-gray-100: #f3f4f6; /* Hover background */
--color-gray-200: #e5e7eb; /* Borders */
--color-gray-300: #d1d5db; /* Disabled */
--color-gray-400: #9ca3af; /* Placeholders */
--color-gray-500: #6b7280; /* Secondary text */
--color-gray-600: #4b5563; /* Body text */
--color-gray-700: #374151; /* Headings */
--color-gray-800: #1f2937; /* Dark headings */
--color-gray-900: #111827; /* Rich black */

/* Special */
--color-white: #ffffff;
--color-black: #000000;
```

#### Usage Guidelines

| Color         | Use For                               | Don't Use For     |
| ------------- | ------------------------------------- | ----------------- |
| **Primary**   | CTA buttons, links, active states     | Large backgrounds |
| **Secondary** | Secondary actions, accents            | Primary buttons   |
| **Success**   | Success messages, positive indicators | Error states      |
| **Warning**   | Warnings, cautionary alerts           | Success messages  |
| **Error**     | Errors, destructive actions           | Informational     |
| **Gray**      | Text, borders, backgrounds            | Call-to-actions   |

### 2.2 Typography

#### Font Families

```css
/* Sans-serif - Primary */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Code */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* Ethiopic - Optional */
--font-ethiopic: 'Noto Sans Ethiopic', sans-serif;
```

#### Type Scale

```css
/* Display */
--text-display-2xl: 4.5rem; /* 72px - Hero */
--text-display-xl: 3.75rem; /* 60px - Page titles */
--text-display-lg: 3rem; /* 48px - Section titles */

/* Headings */
--text-h1: 2.25rem; /* 36px */
--text-h2: 1.875rem; /* 30px */
--text-h3: 1.5rem; /* 24px */
--text-h4: 1.25rem; /* 20px */
--text-h5: 1.125rem; /* 18px */
--text-h6: 1rem; /* 16px */

/* Body */
--text-xl: 1.25rem; /* 20px - Lead paragraph */
--text-lg: 1.125rem; /* 18px - Large body */
--text-base: 1rem; /* 16px - Default body */
--text-sm: 0.875rem; /* 14px - Small text */
--text-xs: 0.75rem; /* 12px - Captions */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Typography Usage

```css
/* Page Title */
.page-title {
  font-size: var(--text-display-lg);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--color-gray-900);
  margin-bottom: 1rem;
}

/* Section Heading */
.section-heading {
  font-size: var(--text-h2);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--color-gray-800);
  margin-bottom: 0.75rem;
}

/* Body Text */
.body-text {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--color-gray-600);
}

/* Label */
.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--color-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 2.3 Spacing System

#### 8pt Grid System

```css
/* Based on 0.25rem (4px) increments */
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px - Base unit */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
--space-32: 8rem; /* 128px */

/* Common spacing patterns */
--padding-input: 0.5rem 0.75rem; /* Inputs */
--padding-button: 0.625rem 1.25rem; /* Buttons */
--padding-card: 1.5rem; /* Cards */
--padding-page: 2rem; /* Page containers */
--gap-form: 1rem; /* Between form fields */
--gap-section: 3rem; /* Between sections */
```

### 2.4 Shadows & Elevation

```css
/* Shadows - Material Design inspired */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md:
  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg:
  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl:
  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Elevation mapping */
--elevation-0: none; /* Flat */
--elevation-1: var(--shadow-sm); /* Cards */
--elevation-2: var(--shadow-md); /* Raised cards */
--elevation-3: var(--shadow-lg); /* Modals */
--elevation-4: var(--shadow-xl); /* Dropdowns */
--elevation-5: var(--shadow-2xl); /* Popovers */
```

### 2.5 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px - Small elements */
--radius-md: 0.375rem; /* 6px - Inputs, buttons */
--radius-lg: 0.5rem; /* 8px - Cards */
--radius-xl: 0.75rem; /* 12px - Large cards */
--radius-2xl: 1rem; /* 16px - Modals */
--radius-full: 9999px; /* Circular */
```

---

## 3. Component Library

### 3.1 Buttons

#### Primary Button

```tsx
// Specifications
Height: 40px (md), 36px (sm), 44px (lg)
Padding: 10px 20px (md)
Border Radius: 6px
Font: 14px, medium (500)
Shadow: sm (resting), md (hover)
Transition: all 150ms ease

// States
Default:  bg-primary-600, text-white
Hover:    bg-primary-700, shadow-md
Active:   bg-primary-800
Disabled: bg-gray-300, text-gray-500, cursor-not-allowed
Loading:  bg-primary-600, spinning icon

// Code Example
<button className="btn btn-primary">
  Save Changes
</button>

// CSS
.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-sm);
  transition: all 150ms ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  background-color: var(--color-gray-300);
  color: var(--color-gray-500);
  cursor: not-allowed;
}
```

#### Button Variants

| Variant       | Use Case            | Visual                   |
| ------------- | ------------------- | ------------------------ |
| **Primary**   | Main action on page | Solid primary color      |
| **Secondary** | Alternative actions | Outlined, primary border |
| **Tertiary**  | Minor actions       | Text only, no background |
| **Danger**    | Destructive actions | Solid red color          |
| **Ghost**     | Low emphasis        | Transparent, hover bg    |

### 3.2 Form Inputs

#### Text Input

```tsx
// Specifications
Height: 40px (md), 36px (sm), 44px (lg)
Padding: 10px 12px
Border: 1px solid gray-300
Border Radius: 6px
Font: 14px, regular (400)

// States
Default:  border-gray-300
Focus:    border-primary-500, ring-2 ring-primary-100
Error:    border-error-500, ring-2 ring-error-100
Disabled: bg-gray-100, cursor-not-allowed

// Code Example
<div className="form-group">
  <label htmlFor="email" className="form-label">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="form-input"
    placeholder="john@example.com"
  />
  <p className="form-hint">We'll never share your email</p>
</div>
```

#### Form Field Anatomy

```
┌─────────────────────────────────────┐
│ Label *                             │  ← Label (required indicator)
├─────────────────────────────────────┤
│ [Input field]              📋       │  ← Input + icon (optional)
├─────────────────────────────────────┤
│ Hint text or error message          │  ← Helper/error text
└─────────────────────────────────────┘
```

### 3.3 Cards

```css
/* Card Specifications */
.card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  transition: box-shadow 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Card Header */
.card-header {
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-900);
}

/* Card Content */
.card-content {
  color: var(--color-gray-600);
  line-height: var(--leading-relaxed);
}
```

### 3.4 Tables

```tsx
// Table Design Specs
Row Height: 48px (comfortable), 40px (compact)
Padding: 12px 16px
Borders: 1px solid gray-200 (horizontal)
Header: bg-gray-50, font-medium, uppercase text-xs
Hover: bg-gray-50
Striped: Even rows bg-gray-50 (optional)

// Example Structure
<table className="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td><Badge variant="success">Active</Badge></td>
      <td>
        <IconButton icon="edit" />
        <IconButton icon="delete" />
      </td>
    </tr>
  </tbody>
</table>
```

### 3.5 Modals

```
┌────────────────────────────────────────┐
│  Modal Title                      ✕    │  ← Header with close
├────────────────────────────────────────┤
│                                        │
│  Modal content goes here...            │  ← Content area
│                                        │
│                                        │
├────────────────────────────────────────┤
│  [Cancel]              [Save Changes]  │  ← Footer with actions
└────────────────────────────────────────┘

// Specifications
Max Width: 600px (sm), 800px (md), 1000px (lg)
Padding: 24px
Backdrop: rgba(0, 0, 0, 0.5) blur(4px)
Shadow: 2xl
Border Radius: xl (12px)
Animation: fade-in + scale (200ms)
```

### 3.6 Badges & Tags

```css
/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-success {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-warning {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.badge-error {
  background: var(--color-error-100);
  color: var(--color-error-700);
}
```

---

## 4. Layout & Grid System

### 4.1 Responsive Breakpoints

```css
/* Mobile-first approach */
--breakpoint-sm: 640px; /* Small devices (tablets) */
--breakpoint-md: 768px; /* Medium devices (landscape tablets) */
--breakpoint-lg: 1024px; /* Large devices (laptops) */
--breakpoint-xl: 1280px; /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px; /* Ultra wide screens */
```

### 4.2 Grid System

```css
/* 12-column grid */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: var(--space-6);
}

/* Column templates */
.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
.grid-cols-12 {
  grid-template-columns: repeat(12, 1fr);
}

/* Responsive */
@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 4.3 Page Layout

```
┌────────────────────────────────────────────────────┐
│  Header (64px)                                     │
│  Logo | Navigation | Search | Profile              │
├────┬───────────────────────────────────────────────┤
│ S  │  Main Content Area                            │
│ i  │  ┌──────────────────────────────────────────┐ │
│ d  │  │  Page Header                             │ │
│ e  │  │  Title + Actions                         │ │
│ b  │  ├──────────────────────────────────────────┤ │
│ a  │  │                                          │ │
│ r  │  │  Content (Cards, Tables, Forms)          │ │
│    │  │                                          │ │
│ 2  │  │                                          │ │
│ 5  │  └──────────────────────────────────────────┘ │
│ 6  │                                               │
│ p  │                                               │
│ x  │                                               │
└────┴───────────────────────────────────────────────┘
```

---

## 5. Navigation Patterns

### 5.1 Top Navigation Bar

```tsx
// Specifications
Height: 64px
Background: white
Border Bottom: 1px solid gray-200
Shadow: sm
Sticky: Yes (position: sticky, top: 0)

// Structure
<nav className="navbar">
  <div className="navbar-brand">
    <Logo />
  </div>

  <div className="navbar-menu">
    <NavItem href="/dashboard" icon="home">Dashboard</NavItem>
    <NavItem href="/hr" icon="users">HR</NavItem>
    <NavItem href="/crm" icon="briefcase">CRM</NavItem>
    {/* ... */}
  </div>

  <div className="navbar-actions">
    <SearchBar />
    <NotificationBell />
    <UserMenu />
  </div>
</nav>
```

### 5.2 Sidebar Navigation

```tsx
// Specifications
Width: 256px (expanded), 64px (collapsed)
Background: gray-50
Border Right: 1px solid gray-200

// Module Navigation
<aside className="sidebar">
  <div className="sidebar-header">
    <h2>HR Module</h2>
  </div>

  <nav className="sidebar-nav">
    <NavGroup title="Recruitment">
      <NavLink href="/hr/jobs">Job Postings</NavLink>
      <NavLink href="/hr/candidates">Candidates</NavLink>
      <NavLink href="/hr/interviews">Interviews</NavLink>
    </NavGroup>

    <NavGroup title="Employee Management">
      <NavLink href="/hr/employees">All Employees</NavLink>
      <NavLink href="/hr/onboarding">Onboarding</NavLink>
      <NavLink href="/hr/attendance">Attendance</NavLink>
    </NavGroup>
  </nav>
</aside>
```

### 5.3 Breadcrumbs

```tsx
// Usage: Show user's location in hierarchy
<nav className="breadcrumbs">
  <Link href="/">Home</Link>
  <span>/</span>
  <Link href="/hr">HR</Link>
  <span>/</span>
  <Link href="/hr/employees">Employees</Link>
  <span>/</span>
  <span className="current">John Doe</span>
</nav>
```

---

## 6. Form Design

### 6.1 Form Layout Principles

```
✅ DO:
- Single column for simple forms
- Group related fields
- Use clear, descriptive labels
- Show inline validation
- Provide helpful error messages
- Auto-save drafts when possible

❌ DON'T:
- Use placeholder as label
- Ask for unnecessary information
- Hide validation until submit
- Use generic error messages
```

### 6.2 Multi-Step Forms (Wizards)

```
Step Indicator:
━━━━● ──── ──── ────
1. Basic  2. Details  3. Review  4. Complete

// Design
- Show progress clearly
- Allow going back
- Save progress automatically
- Validate per step
- Show summary before submit
```

### 6.3 Form Validation

```tsx
// Real-time validation
<input
  type="email"
  onChange={(e) => validateEmail(e.target.value)}
  className={errors.email ? 'form-input error' : 'form-input'}
/>
{errors.email && (
  <p className="form-error">
    <Icon name="alert-circle" />
    {errors.email}
  </p>
)}

// Error message guidelines
✅ "Email must be in format: user@example.com"
❌ "Invalid email"

✅ "Password must be at least 8 characters"
❌ "Password too short"
```

---

## 7. Data Visualization

### 7.1 Chart Color Palette

```css
/* Sequential (for gradients, heatmaps) */
--chart-blue-1: #eff6ff;
--chart-blue-2: #dbeafe;
--chart-blue-3: #bfdbfe;
--chart-blue-4: #93c5fd;
--chart-blue-5: #60a5fa;
--chart-blue-6: #3b82f6;
--chart-blue-7: #2563eb;

/* Categorical (for distinct data series) */
--chart-color-1: #3b82f6; /* Blue */
--chart-color-2: #8b5cf6; /* Purple */
--chart-color-3: #ec4899; /* Pink */
--chart-color-4: #f59e0b; /* Amber */
--chart-color-5: #10b981; /* Green */
--chart-color-6: #06b6d4; /* Cyan */
```

### 7.2 Dashboard Design

```
┌──────────────────────┬──────────────────────┐
│  KPI Card 1          │  KPI Card 2          │
│  Revenue: $125,000   │  Employees: 247      │
└──────────────────────┴──────────────────────┘

┌──────────────────────────────────────────────┐
│  Line Chart: Revenue Trend (Last 6 months)   │
│                                              │
│  [Chart visualization]                       │
└──────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┐
│  Bar Chart           │  Pie Chart           │
│  Dept Distribution   │  Status Breakdown    │
└──────────────────────┴──────────────────────┘

// Guidelines
- Use consistent chart types
- Show data labels when space allows
- Include legends for multi-series
- Responsive: stack on mobile
```

---

## 8. Accessibility

### 8.1 WCAG 2.1 AA Compliance

| Requirement               | Implementation                                  |
| ------------------------- | ----------------------------------------------- |
| **Color Contrast**        | 4.5:1 for normal text, 3:1 for large text       |
| **Focus Indicators**      | Visible 2px outline on all interactive elements |
| **Keyboard Navigation**   | All actions accessible via keyboard             |
| **Screen Reader Support** | Proper ARIA labels and roles                    |
| **Responsive Text**       | Zoomable to 200% without loss of functionality  |

### 8.2 Focus States

```css
/* Focus ring */
*:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Skip to main content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary-600);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 8.3 ARIA Best Practices

```tsx
// Buttons
<button aria-label="Close modal">
  <Icon name="x" aria-hidden="true" />
</button>

// Form fields
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email}
  </span>
)}

// Loading states
<div aria-live="polite" aria-busy="true">
  Loading data...
</div>
```

---

## 9. Responsive Design

### 9.1 Mobile-First Approach

```css
/* Mobile styles (default) */
.card {
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card {
    padding: 2rem;
  }
}
```

### 9.2 Component Adaptations

| Component      | Mobile                | Desktop             |
| -------------- | --------------------- | ------------------- |
| **Navigation** | Hamburger menu        | Horizontal menu bar |
| **Tables**     | Card layout (stacked) | Classic table       |
| **Forms**      | Single column         | Multi-column        |
| **Modals**     | Full screen           | Centered overlay    |
| **Sidebar**    | Drawer (overlay)      | Fixed sidebar       |

---

## 10. Animation & Micro-interactions

### 10.1 Animation Principles

```
1. Purpose: Animations should have meaning
2. Duration: 150-300ms for UI, 300-500ms for page transitions
3. Easing: ease-out for enter, ease-in for exit
4. Reduce motion: Respect prefers-reduced-motion
```

### 10.2 Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Usage */
.modal {
  animation: scaleIn 200ms ease-out;
}

.toast {
  animation: slideUp 300ms ease-out;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 10.3 Hover Effects

```css
/* Button hover */
.btn {
  transition: all 150ms ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:active {
  transform: translateY(0);
}

/* Card hover */
.card {
  transition: box-shadow 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

---

## Design Tokens (JSON)

```json
{
  "color": {
    "primary": {
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8"
    },
    "success": { "600": "#16a34a" },
    "warning": { "600": "#d97706" },
    "error": { "600": "#dc2626" }
  },
  "spacing": {
    "1": "0.25rem",
    "2": "0.5rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem"
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, sans-serif"
    },
    "fontSize": {
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem"
    }
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem"
  },
  "shadow": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
  }
}
```

---

## Quick Reference

### Component Checklist

- [ ] Follows design system colors
- [ ] Uses spacing tokens (8pt grid)
- [ ] Includes all interactive states (hover, active, disabled)
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Responsive (mobile to desktop)
- [ ] Respects prefers-reduced-motion
- [ ] Has focus indicator

### Design Resources

- **Figma Library**: [Link to Figma]
- **Storybook**: http://localhost:6006
- **Design Tokens**: `/styles/tokens.json`

---

**Last Updated:** February 2026  
**Maintained by:** Design Team  
**Questions?** Contact: design@yourcompany.com
