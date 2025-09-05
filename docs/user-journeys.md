# EdCoach AI - User Journeys

**Last Updated:** September 4, 2025  
**Document Owner:** Product Manager  
**Reviewers:** UX/UI Designer, System Architect

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](./foundational-documentation.md).*

## The Golden Path: Complete Continuous Growth Loop

### Journey Overview
This documents the ideal user experience across the complete 5-phase continuous growth loop, from initial goal setting through progress monitoring.

---

## Phase 1: Set Goal (PGP Goal-Setting Journey)

### Coach Journey: Setting PGP Goals

#### Entry Point
- **Trigger:** New school year, new teacher onboarding, or mid-year goal revision
- **Starting Location:** Coach Dashboard → Teachers List → Individual Teacher Profile

#### Step-by-Step Journey

**Step 1: Navigate to Goal Setting**
- **User Action:** Coach clicks "[Set PGP Goal]" button on teacher profile
- **System Response:** Opens PGP Goal Setting Wizard
- **UI Elements:** Clean, focused modal with progress indicator
- **Microcopy:** "Let's establish [Teacher Name]'s professional growth focus for this year"

**Step 2: Select Target Indicator**
- **User Action:** Coach searches/filters Louisiana Educator Rubric indicators
- **System Response:** Presents searchable, categorized indicator list
- **UI Elements:** Search bar, domain filters, indicator cards with descriptions
- **Microcopy:** "Which area would you like [Teacher Name] to focus on this year?"
- **Validation:** Must select exactly one indicator

**Step 3: Add Context & Strategy**
- **User Action:** Coach enters specific strategies, focus points, and context
- **System Response:** Rich text editor with helpful prompts
- **UI Elements:** Text area with character count, suggestion prompts
- **Microcopy:** "Add specific strategies and focus areas for this goal"
- **Validation:** Minimum 100 characters required

**Step 4: AI-Assisted Goal Generation**
- **User Action:** Coach clicks "[Draft with AI]" button
- **System Response:** AI generates SMART goal based on indicator + context
- **UI Elements:** Loading state, generated goal in editable format
- **Microcopy:** "Here's a suggested SMART goal. Feel free to edit:"
- **Fallback:** If AI fails, provide template-based goal structure

**Step 5: Review and Finalize**
- **User Action:** Coach reviews, edits, and saves final goal
- **System Response:** Confirms save, updates teacher profile
- **UI Elements:** Final review screen, save confirmation
- **Microcopy:** "Goal saved! This will guide all future coaching interactions."

#### Exit Points & Outcomes
- **Success:** Teacher profile shows complete PGP goal and action plan
- **Alternative:** Coach can save draft and return later
- **Next Step:** Goal is available for all future walkthrough context

---

## Phase 2 & 3: Capture Evidence & Generate Feedback

### Coach Journey: Conducting AI-Enhanced Walkthroughs

#### Entry Point
- **Trigger:** Planned walkthrough, impromptu observation, or dashboard reminder
- **Starting Location:** Dashboard → "[+ New Walkthrough]" or Teacher Profile

#### Step-by-Step Journey

**Step 1: Initiate Walkthrough**
- **User Action:** Coach clicks "[+ New Walkthrough]" button
- **System Response:** Opens walkthrough form
- **UI Elements:** Clean form with teacher selection dropdown
- **Microcopy:** "Capture evidence from your classroom observation"

**Step 2: Select Teacher**
- **User Action:** Coach selects teacher from dropdown
- **System Response:** Loads teacher's PGP goal context, recent walkthroughs
- **UI Elements:** Searchable dropdown, teacher context card
- **Microcopy:** "Teacher's Current Goal: [PGP Goal Summary]"

**Step 3: Choose Indicators**
- **User Action:** Coach selects Reinforcement and Refinement indicators
- **System Response:** Presents indicator selection with rubric language
- **UI Elements:** Two-column layout, indicator cards with descriptions
- **Microcopy:** "What did you see that was working well?" / "What area needs focus?"
- **Validation:** Must select one of each type

**Step 4: Capture Evidence**
- **User Action:** Coach enters observation evidence
- **System Response:** Rich text editor with helpful prompts
- **UI Elements:** Text areas with character counts, voice-to-text option
- **Microcopy:** "Describe specific evidence you observed"
- **Validation:** Minimum character requirements for quality

**Step 5: Generate AI Feedback**
- **User Action:** Coach clicks "[Generate AI Feedback]"
- **System Response:** AI processes evidence + PGP context + rubric language
- **UI Elements:** Loading animation with progress indicators
- **Microcopy:** "Generating personalized feedback based on [Teacher Name]'s goal..."
- **Processing Time:** Target <10 seconds

**Step 6: Review & Edit Feedback**
- **User Action:** Coach reviews AI-generated feedback, makes edits
- **System Response:** Editable feedback in structured format
- **UI Elements:** Side-by-side reinforcement/refinement feedback
- **Microcopy:** "AI Suggestion - Edit as needed before sending"
- **Fallback:** Manual feedback entry if AI generation fails

**Step 7: Send Feedback**
- **User Action:** Coach clicks "[Send to Teacher]"
- **System Response:** Saves walkthrough, triggers teacher notification
- **UI Elements:** Confirmation message, next steps suggestions
- **Microcopy:** "Feedback sent! [Teacher Name] will receive an email notification."

#### Exit Points & Outcomes
- **Success:** Teacher receives feedback, coach dashboard updates
- **Alternative:** Coach can save draft for later completion
- **Next Step:** Teacher notification triggers reflection journey

---

## Phase 4: Reflect (Teacher Growth Journal Journey)

### Teacher Journey: Engaging with Feedback

#### Entry Point
- **Trigger:** Email notification about new feedback
- **Starting Location:** Email → Growth Journal page

#### Step-by-Step Journey

**Step 1: Notification & Access**
- **User Action:** Teacher clicks email link or logs in directly
- **System Response:** Redirects to Growth Journal with new feedback highlighted
- **UI Elements:** Clean, focused single-column layout
- **Microcopy:** "You have new feedback from [Coach Name]"

**Step 2: Review Feedback in Context**
- **User Action:** Teacher reads feedback alongside PGP goal
- **System Response:** Displays feedback with goal context and rubric connections
- **UI Elements:** Feedback card with PGP goal reminder above
- **Microcopy:** "This feedback connects to your goal: [PGP Goal]"
- **UI Elements:** Feedback card with PGP goal reminder above. A small lock icon with tooltip text is present.
- **Microcopy:** "This feedback connects to your goal: [PGP Goal]"
- **Tooltip Microcopy:** "Note: Your reflections are private and only visible to you and your instructional coach."

**Step 3: Engage with Reflection Prompts**
- **User Action:** Teacher responds to guided reflection questions
- **System Response:** Presents thoughtful, non-threatening prompts
- **UI Elements:** Text areas with character guidance, save drafts option
- **Microcopy:** "What resonates with this feedback?" / "What questions do you have?"
- **Validation:** Minimum reflection length encouraged, not required

**Step 4: Set Next Steps**
- **User Action:** Teacher identifies specific actions or questions
- **System Response:** Structured next steps format
- **UI Elements:** Action-oriented prompts and templates
- **Microcopy:** "What will you try in your next lesson?"

**Step 5: Submit Reflection**
- **User Action:** Teacher clicks "[Save Reflection]"
- **System Response:** Saves reflection, updates progress indicators
- **UI Elements:** Success confirmation, timeline update
- **Microcopy:** "Reflection saved! Your coach can see your thoughtful response."

#### Exit Points & Outcomes
- **Success:** Reflection closes the feedback loop, updates both dashboards
- **Alternative:** Teacher can save partial reflections and return
- **Next Step:** Progress appears on both coach and teacher dashboards

---

## Phase 5: Monitor Growth (Dashboard Experience)

### Coach Dashboard Journey: "Insightful Command Center"

#### Entry Point
- **Trigger:** Daily login, weekly review, or specific teacher concern
- **Starting Location:** Coach Dashboard homepage

#### Dashboard Layout & Components

**Header Section:**
- Welcome message with current date
- Quick action buttons: "[+ New Walkthrough]", "[Invite Teacher]"
- Notification badges for pending items

**Left Column - Priority Panel:**
- **Teachers Needing Walkthrough:** List with days since last observation
- **New Reflections to Review:** Teachers with unread reflections
- **Goal Setting Reminders:** Teachers without current PGP goals

**Right Column - Activity Feed:**
- Recent walkthrough completions
- Teacher reflection submissions
- System notifications and updates

**Key Performance Indicators:**
- Total active teachers
- This month's walkthroughs completed
- Average reflection response time
- Overall coaching engagement score

#### Coach Journey Flow

**Step 1: Daily Priorities Review**
- **User Action:** Coach scans priority panel for urgent items
- **System Response:** Highlights time-sensitive coaching needs
- **UI Elements:** Color-coded priority indicators, quick action buttons

**Step 2: Teacher Progress Deep Dive**
- **User Action:** Coach clicks on specific teacher for detailed view
- **System Response:** Opens teacher detail page with complete history
- **UI Elements:** Timeline view, progress charts, reflection history

**Step 3: Team Analytics (Coach Pro)**
- **User Action:** Coach accesses team analytics dashboard
- **System Response:** Displays heat maps, trends, and insights
- **UI Elements:** Interactive charts, filtering options, export tools

### Teacher Dashboard Journey: "Personal Growth Journal"

#### Entry Point
- **Trigger:** Regular check-in, new feedback notification, or reflection reminder
- **Starting Location:** Teacher Dashboard homepage

#### Dashboard Layout & Story Flow

**Single-Column Narrative Layout:**

1. **PGP Goal Card** - "Your North Star"
   - Current year's professional growth goal
   - Progress indicators and milestones
   - Connection to recent feedback

2. **Refinement Focus Card** - "Current Growth Area"
   - Most recent refinement indicator
   - Specific strategies and next steps
   - Resources and support links

3. **Reflection Prompt Card** - "Your Voice Matters"
   - Pending feedback requiring reflection
   - Quick reflection entry
   - Encouragement and growth mindset messaging

4. **Walkthrough Timeline** - "Your Growth Story"
   - Chronological view of all feedback
   - Reflection responses and coach replies
   - Visual progress indicators

#### Teacher Journey Flow

**Step 1: Goal Connection**
- **User Action:** Teacher reviews current PGP goal
- **System Response:** Shows goal with recent progress updates
- **UI Elements:** Progress visualization, milestone celebrations

**Step 2: Current Focus Review**
- **User Action:** Teacher examines current refinement area
- **System Response:** Displays targeted resources and strategies
- **UI Elements:** Resource links, strategy reminders, success tips

**Step 3: Reflection Engagement**
- **User Action:** Teacher responds to pending feedback
- **System Response:** Guides through reflection process
- **UI Elements:** Supportive prompts, draft saving, submission confirmation

**Step 4: Progress Celebration**
- **User Action:** Teacher reviews growth timeline
- **System Response:** Highlights improvements and patterns
- **UI Elements:** Visual progress indicators, achievement badges

---

## Edge Cases & Error Scenarios

### Technical Failures
- **AI Generation Failure:** Graceful fallback to manual feedback entry
- **Network Connectivity:** Offline draft saving with sync when reconnected
- **Authentication Issues:** Clear error messages with support contact

### User Experience Edge Cases
- **Empty States:** Helpful onboarding guidance for new users
- **Data Migration:** Smooth transition from existing systems
- **Mobile Limitations:** Responsive design with touch-friendly interactions

### Workflow Interruptions
- **Incomplete Walkthroughs:** Auto-save drafts with easy resume
- **Missing PGP Goals:** Guided prompts to complete goal setting
- **Low Engagement:** Gentle reminders and motivation strategies

## Success Metrics by Journey Phase

### Goal Setting Success
- **Completion Rate:** >95% of teachers have active PGP goals
- **Time to Complete:** <10 minutes average goal setting time
- **Quality Score:** Coach satisfaction with AI-generated goals >4.0/5

### Walkthrough Success  
- **Efficiency:** <5 minutes average walkthrough completion
- **AI Reliability:** <2% AI generation failure rate
- **Feedback Quality:** Coach approval rate >90%

### Reflection Success
- **Engagement Rate:** >80% teacher reflection completion
- **Response Time:** <48 hours average reflection submission
- **Quality Indicators:** Meaningful reflection length and depth

### Dashboard Success
- **Daily Usage:** >60% coaches check dashboard daily
- **Teacher Engagement:** >70% teachers visit growth journal weekly
- **Action Completion:** >85% priority items addressed within 7 days

---

## Coach Pro Journey: Analyzing Team-Wide Trends

### Journey Overview
This documents the user experience for a "Coach Pro" user accessing the advanced analytics dashboard to identify team-wide instructional trends.

#### Entry Point
- **Trigger:** Weekly or monthly review of team performance.
- **Starting Location:** Coach Dashboard → "Team Analytics" tab.

#### Step-by-Step Journey

**Step 1: Access Analytics Dashboard**
- **User Action:** Coach clicks on the "[Team Analytics]" navigation item.
- **System Response:** Loads the analytics dashboard, defaulting to an all-teachers view for the current month.
- **UI Elements:** Interactive charts, date range filters, indicator filters, export button.
- **Microcopy:** "Team-Wide Instructional Trends"

**Step 2: Filter and Analyze Data**
- **User Action:** Coach uses filters to select a specific date range, a rubric indicator, or a group of teachers.
- **System Response:** Dashboard charts and data visualizations update in real-time.
- **UI Elements:** Heat maps showing frequently tagged indicators, trend lines showing progress against specific indicators over time.
- **Microcopy:** "Showing trends for [Indicator Name] between [Start Date] and [End Date]."

**Step 3: Identify a Trend**
- **User Action:** Coach identifies a pattern (e.g., a specific "refinement" indicator is appearing frequently across multiple teachers).
- **System Response:** Hovering over data points reveals more detailed information and contributing walkthroughs.
- **UI Elements:** Tooltips with specific data, links to individual teacher profiles.
- **Microcopy:** "[Indicator Name] was marked as a refinement area in 7 out of 10 walkthroughs this month."

**Step 4: Formulate a Coaching Strategy**
- **User Action:** Based on the identified trend, the coach decides on a strategy (e.g., plan a group professional development session).
- **System Response:** The system provides an option to export the chart or data as a PDF/CSV to share with stakeholders.
- **UI Elements:** "[Export to PDF]" button.
- **Microcopy:** "Export this view to share with your team."

#### Exit Points & Outcomes
- **Success:** The coach gains actionable insight into team-wide strengths and areas for growth, enabling more strategic coaching.
- **Next Step:** The coach uses these insights to inform their coaching plan for the upcoming week or month.

## Version History
- **v1.0** (September 2025) - Initial user journey documentation
- **Next Review:** November 2025 (after user testing validation)
