# TaskFlow - Project Guide

## Overview
TaskFlow is a full-stack productivity dashboard built for freelancers and students. It features task management, AI-powered suggestions, analytics, and a modern responsive UI.

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **AI**: Lovable AI (Google Gemini)
- **Charts**: Recharts
- **Routing**: React Router v6

## Architecture

### Database Schema
- **tasks table**: Stores all user tasks with RLS policies
  - Fields: id, user_id, title, description, category, due_date, status, priority
  - Statuses: pending, in_progress, completed, overdue
  - Priorities: low, medium, high

### Authentication
- Email/password authentication via Lovable Cloud
- Auto-confirm email enabled for testing
- Protected routes with auth checks

### AI Integration
- Edge function: `suggest-tasks` 
- Uses Lovable AI (google/gemini-2.5-flash)
- Analyzes pending tasks and provides 3-5 actionable suggestions

## Key Features Implemented
1. ✅ Email/password authentication (signup + login)
2. ✅ Dashboard with task statistics and recent tasks
3. ✅ Full CRUD operations for tasks
4. ✅ Task filtering by status (tabs)
5. ✅ AI-powered task suggestions
6. ✅ Analytics page with charts (status, priority, category)
7. ✅ Settings page with dark/light mode toggle
8. ✅ Responsive sidebar navigation
9. ✅ Professional blue design system

## Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── AppSidebar.tsx   # Navigation sidebar
│   ├── Layout.tsx       # Main layout wrapper
│   ├── TaskCard.tsx     # Task display card
│   └── TaskDialog.tsx   # Add/Edit task modal
├── pages/
│   ├── Auth.tsx         # Login/Signup
│   ├── Dashboard.tsx    # Home page with stats
│   ├── Tasks.tsx        # Task management
│   ├── Analytics.tsx    # Charts and insights
│   └── Settings.tsx     # User settings
supabase/functions/
└── suggest-tasks/       # AI suggestions endpoint
```

## How to Run
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Visit: `http://localhost:8080`

## Next Improvements
1. **Task Features**
   - Subtasks and checklists
   - Task tags and custom categories
   - Drag-and-drop reordering
   - Bulk operations (multi-select)
   - Task templates

2. **AI Enhancements**
   - Task auto-categorization
   - Smart due date suggestions
   - Voice input for tasks
   - Natural language task creation

3. **Collaboration**
   - Share tasks with team members
   - Comments and mentions
   - Activity feed

4. **Integrations**
   - Calendar sync (Google/Outlook)
   - Email notifications
   - Slack/Discord webhooks
   - Export to CSV/PDF

5. **Analytics**
   - Time tracking per task
   - Productivity trends over time
   - Category-based insights
   - Custom reports

6. **Mobile**
   - Progressive Web App (PWA)
   - Mobile-optimized views
   - Offline support

## Design System
- Primary color: Blue (#3B82F6)
- Success: Green
- Warning: Orange
- Destructive: Red
- All colors use HSL semantic tokens
- Supports light/dark mode

## Known Issues
None currently

---
Last updated: Initial version