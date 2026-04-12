# ViolationIQ — AI-Powered Traffic Violation Review System

A fully functional, self-guided, desktop-first prototype for reviewing AI-flagged traffic violations. Built for supervisors and review officers who need to validate violations quickly, accurately, and with legal defensibility.

---

## Quick Start

```bash
# 1. Navigate to the project
cd traffic-violation-review

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

**Recommended:** Start at the landing page (`/`) and click **"Start Guided Walkthrough"** for a first-time demo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State | React Context + useReducer |
| Data | Local mocked JSON (no API) |
| Deployment | Vercel-ready |

---

## Product Flow

### Core Principle
**AI suggests → Human confirms → System records → Model learns**

### The 4-Step Review Workflow

| Step | Name | What Happens |
|---|---|---|
| 1 | Open Case | Read AI detection summary, rationale, confidence score, exception flags |
| 2 | Validate Evidence | Examine HD camera frames, verify plate, check violation context |
| 3 | Make Decision | Answer 3 checklist questions (violation? plate? exception?) |
| 4 | Record & Submit | Choose Approve / Dismiss / Escalate; add structured reason |

After submission: Decision summary → Audit record → Next case or replay walkthrough.

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Landing page — system overview, 4-step flow diagram, CTAs |
| `/queue` | Review Queue — all 10 mock cases with filtering |
| `/review/[id]` | Main Review Screen — stepper, evidence, checklist, actions |
| `/audit` | Audit Log — legally defensible decision records |
| `/insights` | Metrics — review time, decision split, AI disagreement rate |

---

## Two Modes

### Guided Walkthrough Mode
- Enabled by clicking "Start Guided Walkthrough" or "Replay Walkthrough"
- Walkthrough tooltip card appears at each step explaining what to do and why
- Step progress dots on the tooltip card
- Can be dismissed at any time

### Normal Review Mode
- Enabled by clicking "Go to Review Queue"
- Full access to stepper, evidence, and action panel without guidance overlay
- Faster for experienced reviewers

---

## Mock Data

10 realistic demo cases in `/data/cases.ts`:

| ID | Violation | Confidence | Type |
|---|---|---|---|
| VIO-2024-0841 | Red Light Violation | 97% High | Straightforward approve |
| VIO-2024-0842 | Speeding 52 in 35 mph | 94% High | School zone speeding |
| VIO-2024-0843 | Illegal Left Turn | 71% Medium | Sign obstruction ambiguity |
| VIO-2024-0844 | No Parking Zone | 83% High | Unclear plate (OCR) |
| VIO-2024-0845 | Bus Lane Infringement | 68% Medium | Faded lane markings |
| VIO-2024-0846 | HOV Violation | 61% Low | Tinted windows false positive |
| VIO-2024-0847 | Red Light — Emergency? | 88% High | Emergency vehicle exception |
| VIO-2024-0848 | Speeding — Rain | 58% Low | Weather degraded evidence |
| VIO-2024-0849 | Red Light + OCR Mismatch | 89% High | 8 vs B character confusion |
| VIO-2024-0850 | Illegal U-Turn | 39% Low | Clear false detection |

Each case includes: `id`, `violationType`, `timestamp`, `location`, `cameraId`, `aiConfidence`, `plateText`, `plateConfidence`, `aiRationale`, `evidenceFrames`, `suggestedAction`, `exceptionFlags`, `status`, `reviewHistory`.

---

## Component Architecture

```
components/
├── Navigation.tsx          # Top nav bar — links, mode badge, reviewer identity
├── Stepper.tsx             # 4-step progress bar with labels + instructions
├── MockCameraFrame.tsx     # SVG-based mock camera footage renderer
├── EvidenceViewer.tsx      # Primary frame + thumbnails + frame analysis
├── ReviewChecklist.tsx     # 3-question Yes/No/Skip checklist panel
├── DismissModal.tsx        # Dismiss/Escalate modal with reason chips
├── DecisionSummary.tsx     # Post-decision outcome + audit record + CTAs
├── AuditLog.tsx            # (used inline in /audit page)
├── HelperStrip.tsx         # Persistent bottom bar: Replay / First Case / Restart
├── WalkthroughOverlay.tsx  # Guided tip card that advances with each step
├── CaseCard.tsx            # Queue list item card with metadata + confidence
└── ConfidenceBadge.tsx     # Reusable AI confidence and status badges
```

---

## State Management

All state lives in `context/ReviewContext.tsx` using `useReducer`. No external state library needed.

```typescript
ReviewState {
  cases: ViolationCase[]         // All 10 mock cases, mutated as reviewed
  decisions: ReviewRecord[]      // All submitted decisions this session
  currentCaseId: string | null   // Active case being reviewed
  currentStep: 1 | 2 | 3 | 4    // Step in the review flow
  mode: "guided" | "normal"      // UI mode
  walkthroughActive: boolean     // Whether tip overlay is showing
  checklist: ReviewChecklist     // Current case checklist answers
  sessionStats: SessionStats     // Live metrics for Insights page
  lastDecision: ReviewRecord     // Just-submitted decision (for summary screen)
}
```

---

## Deploy to Vercel

```bash
# Push to GitHub, then connect repo to Vercel
# Or use Vercel CLI:
npx vercel deploy
```

No environment variables needed — all data is local.

---

## Design Decisions

- **Desktop-first layout**: 2-column review screen (evidence + sidebar) optimized for supervisor workstations
- **Progressive disclosure**: Step 1 shows AI summary only; evidence and checklist appear as user advances
- **Structured decisions**: Dismiss/Escalate require a reason chip selection — no freeform-only dismissals
- **Legal defensibility**: Every decision records reviewer ID, checklist state, reason, and timestamp
- **Model feedback loop**: Edge case tagging, disagreement tracking, and per-decision feedback signals are all captured
- **Low cognitive load**: One primary job per screen, minimal color use, clear action hierarchy
