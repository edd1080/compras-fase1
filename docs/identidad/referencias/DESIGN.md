---
title: BIA Compras Enterprise Design System (fuente)
status: review
authority: reference
owner: Intelia (design)
last_reviewed: 2026-08-13
---

---
version: alpha
name: BIA Compras Enterprise Design System
description: A procurement management platform focusing on requisition tracking, vendor comparison, and AI-assisted decision making with distinct user roles.
colors:
  primary: "#FD6703"
  accent: "#0EA5E9"
  surface: "#F8F9FA"
  dark: "#0F172A"
  success: "#10B981"
  warning: "#F59E0B"
  error: "#EF4444"
  glass: "rgba(255, 255, 255, 0.7)"
typography:
  family: "'Inter', sans-serif"
  mono: "'JetBrains Mono', monospace"
  sizes:
    h1: "24px"
    h2: "18px"
    body-md: "14px"
    body-sm: "12px"
    label: "11px"
  weights:
    regular: 400
    medium: 500
    bold: 600
spacing:
  base: "4px"
  container-p: "32px"
  grid-gap: "20px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
components:
  button-primary: "bg-slate-900 text-white rounded-full"
  input: "bg-slate-50 border-slate-200 rounded-xl"
  card: "bg-white rounded-2xl border-white shadow-sm backdrop-blur-3xl"
---

## Overview
BIA Compras is an enterprise-grade procurement platform characterized by a clean, high-density interface that balances utility with a sophisticated "glassmorphism" aesthetic. The system uses a restricted palette (primarily grayscale with strategic use of orange and sky blue) and subtle ambient motion via fluid background blobs to reduce the friction of complex administrative tasks.

## Colors
- **Primary Brand**: Orange (#FD6703) used for main calls to action and active states in the requisition flow.
- **Secondary Brand**: Sky Blue (#0EA5E9) used specifically for Coordinator and Admin roles to distinguish their workspace from the requester's.
- **Neutral Palette**: Extensive use of Slate 50 (Surfaces), Slate 200 (Borders), and Slate 900 (Typography/Primary Buttons).
- **Functional**: Emerald/Green for successes, Amber for "waiting" states or draft warnings, and Rose for urgent alerts.

## Typography
- **Main Interface**: Inter is the workhorse font, used with medium (500) and semibold (600) weights to establish hierarchy without increasing font size excessively.
- **Technical Data**: JetBrains Mono is used for unique reference numbers (e.g., RFQ-2026-014) and timestamps to emphasize accuracy.
- **Hierarchy**: Headlines favor tight letter spacing and medium weights. Labels are often uppercase with tracked-out spacing (tracking-wider).

## Layout
- **Shell**: A centered main container with a maximum width (1024px for requesters, 1180px for admins/coordinators) set against an ambient background.
- **Sidebar**: Fixed-width sidebars (280px-320px) provide progress tracking or navigation. Requesters see a vertical progress stepper; Admins see a navigational link list.
- **Density**: High information density utilizing small font sizes (11px-13px) and 12px-20px grid spacing to keep data visible without excessive scrolling.

## Elevation & Depth
- **Glassmorphism**: Components utilize `backdrop-blur-3xl` and semi-transparent white backgrounds (`bg-white/70`) to create a layered, modern feel.
- **Shadows**: Soft, low-diffusion shadows (e.g., `shadow-[0_8px_40px_rgb(0,0,0,0.06)]`) provide depth without visual clutter.
- **Borders**: Thin white or light gray borders define container edges on top of the blurred backgrounds.

## Shapes
- **Containers**: Large radii for primary containers (rounded-3xl to 2.5rem).
- **Interactive Elements**: Buttons are generally pill-shaped (rounded-full). Input fields and secondary cards use a soft rounded-xl (12px-16px) radius.
- **Status Indicators**: Circular dots for progress and small, rounded badges for status labels.

## Components
- **Progress Tracker**: A vertical line with state-aware nodes (active, completed, upcoming) used in the sidebar.
- **Stat Cards**: Grid-based cards featuring a large numeric value, a label, and a sub-textual trend or secondary metric.
- **Data Table**: Clean, bordered tables with `bg-slate-50` headers and row-hover transitions.
- **AI Suggestion Box**: Gradient-bordered containers with a specific "Magic Stick" icon to identify machine-generated insights.
- **File Upload Zone**: Dashed-border boxes that transition to solid green borders upon successful file attachment.

## Page Sections

### New Request Flow (index.html)
- **Sidebar**: Brand logo at top, followed by a dynamic progress tracker. Bottom section features a status badge showing "Borrador" or "Iniciando".
- **Input Area**: Multi-step form container. Step 1 focuses on user identification (Email, Name, Area). Step 2 captures requisition details (Title, Type, Date, Description). Step 3 is an AI-classification selection (RFI/RFQ/RFP).
- **Step 4 (Technical Details)**: Features a loading state with a spinner, followed by conditional inputs like "Branding Toggle" and a file upload zone.
- **Step 5 (Review)**: A document-style card summarizing all inputs before final submission.

### Admin/Coordinator Dashboard (admin.html, coordinadores.html)
- **Navigation**: Persistent left sidebar with icons and user profile at the bottom.
- **Header**: Contains page title, subtitle, and a "Logout" button.
- **Stats Bar**: Four-column grid showing Acceptance Rates, Average Time, Active Processes, and Alerts.
- **Process Table**: A comprehensive list of requests with filters (All, Today, Week, Month) and a search bar. Rows feature status badges (Waiting, Active, Closed).
- **Detail View**: Split-screen layout. Left side contains a detailed timeline (Trazabilidad) using a vertical node structure. Right side provides solicitor context.
- **Comparison Tool**: Found in the Coordinator detail view; a side-by-side table comparing vendor Net Value, Taxes, Totals, and Delivery Times.

## Motion & Interaction
- **Fluid Blobs**: Large background circles use `animate-fluid-blob` (a combination of spin and morphing radius) to provide ambient life.
- **Transitions**: Step-based navigation uses `fade-in-up` animations for entrance (0.4s duration).
- **State Changes**: Buttons and cards use subtle background color shifts (`transition-colors`) and scale effects on hover.
- **Feedback**: A floating toast message appears from the bottom to confirm auto-saving of drafts.

## Do's and Don'ts
- **Do**: Use JetBrains Mono for all alphanumeric IDs and reference codes.
- **Do**: Maintain high contrast between primary text (Slate 900) and metadata (Slate 500).
- **Don't**: Use sharp corners; almost every element must have a minimum 8px radius.
- **Don't**: Overload the requester view with administrative metrics; keep the request flow focused and linear.

## Accessibility
- **Contrast**: High-contrast text on solid or high-opacity blurred backgrounds.
- **Focus**: Inputs utilize a specific focus ring (Orange for requesters, Blue for admins).
- **Semantics**: Button types and ARIA labels for password toggles are present in the implementation.

## Assets
1. `script`: https://cdn.tailwindcss.com
2. `script`: https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js
3. `font`: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap
4. `svg`: http://www.w3.org/2000/svg
