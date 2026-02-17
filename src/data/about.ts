// ── Project About Pages ──────────────────────────────────────────
// Rich "README" content for each project. Rendered as beautiful
// About tabs on project detail pages. Eventually these will live
// in Supabase, but for now they're here.

export interface AboutSection {
  title: string
  content: string          // supports basic markdown-ish: **bold**, line breaks
  style?: 'prose' | 'stats' | 'list' | 'timeline'
}

export interface AboutPage {
  slug: string
  tagline: string
  description: string
  sections: AboutSection[]
}

export const ABOUT_PAGES: Record<string, AboutPage> = {
  jeff: {
    slug: 'jeff',
    tagline: "Dan's personal operating system",
    description: "JEFF is the command center for everything Dan builds, ships, and manages. It started as a simple to-do app and is evolving into a full business intelligence dashboard — project management, cash flow, contacts, learnings, and strategy all in one place.",
    sections: [
      {
        title: 'What JEFF Is',
        style: 'prose',
        content: `JEFF is a Next.js web app deployed on GitHub Pages that serves as the single source of truth for Dan's entire operation. It replaces Notion, scattered markdown files, and unreliable AI memory with structured, beautiful, persistent pages.

The name is just JEFF. No acronym. No meaning. Just a name for the system that runs everything.`,
      },
      {
        title: 'Tech Stack',
        style: 'list',
        content: `Next.js 16 with static export
TypeScript end to end
Tailwind CSS 4 + shadcn/ui components
Zustand for state management
Supabase for persistent data (todos, transactions, settings)
GitHub Pages for hosting
GitHub Actions for auto-deploy on push to main
dnd-kit for drag-and-drop kanban
Geist font family
Dark mode only`,
      },
      {
        title: 'What Exists Today',
        style: 'list',
        content: `Today — daily action list sorted by project weight, cash snapshot
Board — multi-project kanban with drag-and-drop, collapsible sections
Cash Flow — balance tracking, income streams, expenses, 90-day forecast
Calendar — month view with todos mapped to dates
Dreamwatch — real-time Dream Beds video pipeline monitor
Project pages — per-project detail with list and board views
About pages — rich project READMEs (you're looking at one)`,
      },
      {
        title: "What's Being Built",
        style: 'list',
        content: `Drag-and-drop reordering for to-do items
Rich About/README pages for every project
Tango business dashboard (revenue, COGS, margins, channel performance)
Supabase tables for contacts, learnings, intel
The /jeff slash command — conversational daily planning that feeds into the app
Project pipeline visualization across all channels
Pattern detection — noticing what gets pushed, what gets done, what falls through`,
      },
      {
        title: 'The Philosophy',
        style: 'prose',
        content: `JEFF doesn't tell Dan what to do. It shows him the state of everything and lets him pick.

The old system (codename: the scoring engine) tried to rank tasks with Impact × Ease × Control × Urgency formulas. It worked on paper but felt like a spreadsheet pretending to be a brain. Dan makes a new to-do list every day and somehow what's important still bubbles up. The system should mirror that — fluid, not rigid.

The pipeline is simple: To Do → In Progress → Waiting → Done. That applies to almost everything. Color-coded by project so you can scan at a glance.

Priority isn't a formula. It's a story. And the story changes every day. A pallet sitting at a warehouse outranks PPC optimization. An email that's been waiting 3 days outranks a listing update. JEFF surfaces the landscape. Dan reads it and knows.`,
      },
      {
        title: 'The Conversation Layer',
        style: 'prose',
        content: `JEFF isn't just a website. It's also a Claude Code slash command (/jeff) that acts as the conversational interface.

Every morning, Dan runs /jeff. Instead of a scoring algorithm, it just asks: "What's going on?" Dan talks — stream of consciousness, whatever's on his mind. Claude listens, organizes it into the board, asks a few clarifying questions, and presents the current state. Dan picks what to do first.

Over time, Claude notices patterns: what kinds of tasks always get picked first, what always gets pushed, what falls through the cracks. Those observations get mentioned casually, not formalized into rules until Dan says to.

The slash command writes to the same data layer as the web app. One system, two interfaces — visual and conversational.`,
      },
      {
        title: 'Project Colors',
        style: 'list',
        content: `Tango — #DD4444 (red-orange)
FFEEDD — #2A9D8F (teal green)
Madder — #7B2CBF (purple)
Dream Beds — #E07A00 (orange)
JEFF — #3B82F6 (blue)
Life Admin — #666666 (gray)`,
      },
      {
        title: 'Architecture',
        style: 'prose',
        content: `The app lives at /Users/danfrieber/⚡ claudio/assistant/ and deploys to tangochilesauce.github.io/assistant/.

Data flows two ways: Supabase provides persistent storage that the web app reads from and writes to. Claude Code can also read and write the source files directly — updating project data, adding content, pushing to GitHub — which triggers a rebuild and deploy.

The Dreamwatch pipeline has its own sync daemon (Python) that runs on Dan's Mac, polling the local video queue every 5 seconds and upserting state to a Supabase table. The web app subscribes to that table for real-time video pipeline monitoring.

Static export means no server costs, instant loads, and works offline once cached. Dynamic data comes from Supabase client-side queries.`,
      },
      {
        title: 'The Vision',
        style: 'prose',
        content: `JEFF becomes headquarters. Every project gets a beautiful About page — not a markdown dump, not a Notion database, but a designed, scannable, living document. Strategy, contacts, metrics, learnings, pipeline, calendar, everything.

When Dan says "show me Tango Amazon," he gets a page with revenue charts, COGS breakdown, key contacts, active campaigns, and recent learnings. When he says "what's the status of Madder," he sees the release timeline, studio schedule, and distribution status.

The daily /jeff conversation feeds new information into these pages. Learnings get locked in. Contacts get updated. Strategy narratives evolve. Nothing disappears when the chat session ends.

$50,000/month by Q2 2026. JEFF is how we get there.`,
      },
    ],
  },
}

export function getAboutPage(slug: string): AboutPage | undefined {
  return ABOUT_PAGES[slug]
}
