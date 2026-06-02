You are a senior full-stack engineer, AI product architect, SEO/data research engineer, and production deployment specialist.

I am providing an implementation plan file for an app called:

AI Market Signal Research Assistant

Your job is to implement this app end-to-end as a production-level research-only application.

Important:
This app should NOT build websites automatically.
This app should NOT deploy generated business ideas.
This app should only research market signals, trends, low-competition opportunities, high-reward opportunities, validate facts from APIs/data sources, score the opportunities, and present investor-style reports so I can decide whether to build the idea later.

Read the attached implementation plan fully before coding.

Use all useful installed plugins/tools available in this environment whenever they help the project. From my environment, I may have access to tools/plugins such as:

- GitHub
- Vercel
- Cloudflare
- Supabase
- Sentry
- Linear
- Notion
- CodeRabbit
- CircleCI
- Figma
- Product Design
- Canva
- Render
- Build Web Apps
- Build Web Data Visualization
- Apollo
- Calendly
- HeyGen
- HyperFrames by HeyGen
- Remotion

Use them intelligently where useful.

Primary useful plugin/tool usage:

1. GitHub
Use GitHub for:
- Creating or updating the repository
- Creating branches
- Committing implementation milestones
- Creating issues for tasks
- Creating pull requests if supported
- Keeping implementation clean and reviewable

2. Supabase
Use Supabase if available for:
- PostgreSQL database
- Auth if needed
- Database migrations
- Research run storage
- Opportunity report storage
- API usage logs
- Investor dashboard data

3. Vercel
Use Vercel if available for:
- Production deployment of the Next.js app
- Preview deployments
- Environment setup if supported
- Build verification

4. Cloudflare
Use Cloudflare if useful for:
- DNS/deployment support
- Workers/Pages if better suited
- Future cron/scheduled research jobs
- Caching public/static resources

5. Sentry
Use Sentry for:
- Error tracking
- Frontend and backend error monitoring
- API failure monitoring
- Research pipeline failures
- Unexpected AI output parsing errors

6. CodeRabbit
Use CodeRabbit if available for:
- Code review
- PR review
- Quality checks
- Refactoring suggestions
- Security and maintainability feedback

7. Linear
Use Linear if available for:
- Creating implementation epics/tasks
- Tracking MVP phases
- Breaking work into engineering tickets

8. Notion
Use Notion if available for:
- Creating product documentation
- Research methodology documentation
- Data source documentation
- Scoring logic documentation
- Investor report format documentation

9. Figma / Product Design / Canva
Use these only if useful for:
- UI/UX planning
- Dashboard layout
- Investor-report-style visual design
- Wireframes
- Visual polish

10. CircleCI
Use CircleCI only if useful for:
- CI pipeline
- Linting
- Testing
- Build checks

11. Render
Use Render only if Vercel/Cloudflare are not suitable or if backend deployment needs it.

12. Build Web Apps / Build Web Data Visualization
Use these if available and useful for:
- App scaffolding
- Dashboard building
- Charts
- Investor-style data visualization

13. Apollo, Calendly, HeyGen, Remotion, HyperFrames
Do not use these unless there is a clear requirement later.
This app does not need sales outreach, booking flows, video generation, or animation in the MVP.

Your first job:
Inspect the workspace and available tools.
Then read the implementation plan file.
Then create a proper implementation strategy.
Then implement in phases.

The application must be research-only and investor-focused.

Core Product Requirements:

1. Automatic Market Signal Generation

The system should automatically generate signals based on market trends and search behavior.

A signal means a detected opportunity pattern such as:

- Rising search demand
- Low competition keyword cluster
- High CPC with weak SERP results
- Many forum/Reddit/Quora pages ranking
- Poor localized content
- Missing calculators/tools/templates
- High buyer intent
- Weak existing competitors
- Fast-growing niche
- Underserved Indian market variant
- Content gap in a commercially valuable topic

Each signal should include:

- Signal title
- Signal type
- Source data
- Evidence
- Confidence score
- Risk score
- Opportunity score
- Data freshness
- Why this signal matters
- What decision it supports

2. Research-Only Scope

The app should only do:

- Research
- Signal discovery
- Trend analysis
- Keyword analysis
- SERP competition analysis
- Opportunity scoring
- Evidence collection
- Investor-style reporting
- Approval/rejection/status tracking

The app should not:

- Build the selected business automatically
- Generate and deploy full websites from selected ideas
- Make unsupported claims
- Invent metrics
- Show unverified numbers as facts

3. Fact-First Data Policy

The system must separate:

- Measured data
- Estimated data
- AI interpretation
- Assumptions
- Unknowns
- Missing data

Never allow GPT to invent search volume, CPC, keyword difficulty, traffic, revenue, or competition metrics.

Any AI-generated recommendation must be grounded in collected data.

If data is missing, the app must clearly say:

“Data unavailable”
“Needs validation”
“Low confidence”
“Estimated, not measured”

4. Data Sources

Use available integrations for:

- Keyword metrics
- SERP analysis
- Trend signals
- Competitive pages
- Related searches
- People Also Ask
- CPC
- Keyword difficulty
- Search volume
- Ranking competitor analysis

Expected API/data sources:

- DataForSEO
- SerpAPI
- OpenAI/GPT
- Optional additional sources if available later

Create provider abstraction so new sources can be added later.

5. Main App Pages

Build these pages:

- Dashboard
- Start Research
- Auto Signal Discovery
- Research Runs
- Market Signals
- Signal Detail
- Opportunity Reports
- Opportunity Detail
- Approved / Watchlisted Ideas
- Settings
- Data Source Health
- API Usage / Cost Estimate

6. Dashboard Requirements

Dashboard should show:

- Total research runs
- Total signals found
- Top signals
- Highest opportunity score
- Average confidence score
- High-risk opportunities
- Approved/watchlisted opportunities
- Recent research runs
- Signal category distribution
- Trend strength chart
- Opportunity score chart

Use investor-style charts and tables.

7. Auto Signal Discovery Workflow

Implement this workflow:

Step 1:
System starts with predefined market categories.

Categories:
- AI tools
- education
- career
- finance
- local services
- health and fitness
- home improvement
- ecommerce
- gaming
- 3D printing
- astronomy
- software tools
- small business tools
- India-specific calculators
- consumer tech
- productivity tools

Step 2:
Generate seed topics for each category.

Step 3:
Fetch keyword metrics.

Step 4:
Fetch SERP data.

Step 5:
Detect signals.

Step 6:
Cluster related signals into opportunity groups.

Step 7:
Score each opportunity.

Step 8:
Generate investor-style report.

Step 9:
Present ranked opportunities.

Step 10:
Allow me to approve, reject, watchlist, or mark for deeper research.

8. Manual Research Workflow

User enters:

- Topic
- Region
- Language
- Category
- Research depth
- Max keywords
- Min search volume
- Max competition
- Monetization preference

Then system:

- Expands seed keywords
- Fetches metrics
- Analyzes SERP
- Finds weak competition
- Generates market signals
- Scores clusters
- Produces investor report

9. Opportunity Scoring

Implement a 0 to 100 scoring system.

Score components:

Demand Score:
- Search volume
- Keyword cluster size
- Long-tail demand
- Trend direction
- Regional demand

Competition Advantage Score:
- Keyword difficulty
- Weak SERP results
- Forum/user-generated pages ranking
- Poor content quality
- Outdated pages
- Lack of localized pages
- Lack of dedicated tools

Commercial Score:
- CPC
- Buyer intent
- Affiliate potential
- SaaS potential
- Lead generation potential
- Digital product potential
- Subscription potential

Content Gap Score:
- Missing calculators
- Missing templates
- Missing comparisons
- Missing localized content
- Poor UX competitors
- Lack of structured answers

Execution Feasibility Score:
- Time to validate
- Build complexity
- Content complexity
- Data availability
- Maintenance effort

Risk Score:
- Legal risk
- Medical/financial sensitivity
- Data confidence
- Brand-dominated SERP
- Seasonality
- High execution cost
- Dependency risk

Final score formula:

Opportunity Score =
Demand Score * 0.25
+ Competition Advantage Score * 0.25
+ Commercial Score * 0.20
+ Content Gap Score * 0.20
+ Execution Feasibility Score * 0.10
- Risk Penalty

Make scoring weights configurable in settings.

10. Signal Model

Create a MarketSignal model with fields like:

- id
- researchRunId
- signalType
- title
- description
- category
- region
- language
- source
- evidenceJson
- measuredDataJson
- estimatedDataJson
- assumptionsJson
- confidenceScore
- riskScore
- signalStrength
- dataFreshness
- createdAt
- updatedAt

Signal types should include:

- rising_demand
- low_competition
- high_cpc
- weak_serp
- content_gap
- tool_gap
- local_gap
- forum_ranking
- long_tail_cluster
- commercial_intent
- underserved_audience
- seasonal_spike
- competitor_weakness

11. Investor-Style Opportunity Report

Each opportunity report should include:

- Executive summary
- Market signal summary
- Why this opportunity exists
- Target market
- Target audience
- Search demand evidence
- SERP competition evidence
- CPC/commercial evidence
- Content gap evidence
- Competitor weakness
- Opportunity score
- Confidence score
- Risk score
- Data quality score
- Estimated market attractiveness
- Monetization options
- Validation steps
- What data supports this
- What data is missing
- Key risks
- Final recommendation:
  - Strong Watch
  - Worth Testing
  - Needs More Data
  - Avoid

Important:
Reports must feel like investor research, not startup hype.

12. Required Database Models

Create models for:

- User, if auth is implemented
- ResearchRun
- SeedKeyword
- KeywordMetric
- SerpResult
- MarketSignal
- OpportunityCluster
- OpportunityReport
- Competitor
- ContentGap
- WatchlistedOpportunity
- ApiUsageLog
- DataSourceHealth
- ScoringSettings

13. API Routes

Create routes:

POST /api/research/start
POST /api/research/auto-discover
GET /api/research/runs
GET /api/research/runs/:id

GET /api/signals
GET /api/signals/:id
POST /api/signals/:id/watchlist
POST /api/signals/:id/reject

GET /api/opportunities
GET /api/opportunities/:id
POST /api/opportunities/:id/watchlist
POST /api/opportunities/:id/deeper-research
POST /api/opportunities/:id/reject

GET /api/settings
POST /api/settings
GET /api/data-sources/health
GET /api/usage

14. AI/GPT Usage

Use GPT only for:

- Seed expansion
- Keyword clustering
- SERP interpretation
- Content gap analysis
- Opportunity narrative
- Investor-style report writing
- Risk explanation

Do not use GPT as the source of numeric facts.

Every GPT output must be validated.

Use JSON schema validation.

Retry on invalid JSON.

Store raw AI output and validated output separately if useful.

15. Anti-Hallucination Rules

Implement these strict rules:

- GPT cannot create numeric metrics not present in source data.
- GPT cannot claim market size unless measured or clearly estimated.
- GPT cannot say “high demand” without supporting search data.
- GPT cannot say “low competition” without SERP/keyword difficulty evidence.
- GPT cannot say “high monetization” without CPC, buyer intent, or clear monetization evidence.
- Every opportunity report must show evidence.
- Every report must show confidence score.
- Every report must show missing data.
- Every unsupported field should be marked unknown/null.

16. UI Requirements

Use a clean investor dashboard style.

Important UI elements:

- Scorecards
- Ranked tables
- Evidence panels
- Charts
- Signal badges
- Confidence indicators
- Risk indicators
- Data freshness labels
- Source labels
- Expandable raw evidence
- Filters by category, score, confidence, risk, source, region

Charts:

- Opportunity score distribution
- Signal type distribution
- Keyword volume chart
- CPC comparison chart
- Difficulty comparison chart
- Competition weakness chart
- Confidence vs opportunity score scatter plot

17. Testing Requirements

Add tests for:

- Scoring engine
- Risk penalty calculation
- Signal detection logic
- Keyword clustering
- Data normalization
- Missing data behavior
- GPT invalid JSON handling
- API provider failures
- Report generation without hallucinated numbers
- UI rendering of unknown/missing data

18. Error Handling

The app must handle:

- API timeout
- API rate limit
- Empty keyword data
- SERP unavailable
- GPT invalid JSON
- Missing metrics
- Partial research failure
- No opportunity found
- Low confidence result

Do not crash research runs.
Store partial results and show data quality status.

19. Production Quality

Ensure:

- TypeScript
- Modular services
- Clean architecture
- Database migrations
- Reusable UI components
- Background job-ready architecture
- Good loading states
- Good empty states
- Good error states
- README
- Setup instructions
- Test commands
- Deployment notes

20. Suggested Architecture

Use this structure:

/app
  /dashboard
  /research
  /signals
  /opportunities
  /settings
  /usage

/components
  /charts
  /tables
  /cards
  /forms
  /layout

/lib
  /providers
    /dataforseo
    /serpapi
    /openai
  /scoring
  /signals
  /clustering
  /reports
  /validation
  /db
  /jobs

/prisma
  schema.prisma

/tests
  scoring.test.ts
  signals.test.ts
  providers.test.ts
  reports.test.ts

21. Implementation Phases

Phase 1:
- Inspect repo
- Read implementation plan
- Create technical design
- Create task list
- Set up Next.js app
- Set up database models
- Set up base dashboard UI

Phase 2:
- Implement provider abstractions
- Implement DataForSEO integration
- Implement SerpAPI integration
- Implement normalized data models
- Store keyword and SERP data

Phase 3:
- Implement market signal detection engine
- Implement scoring engine
- Implement opportunity clustering
- Implement data quality scoring

Phase 4:
- Implement GPT report generation
- Implement strict JSON validation
- Implement anti-hallucination checks
- Implement investor-style opportunity report pages

Phase 5:
- Implement auto-discovery mode
- Implement watchlist/reject/deeper research workflow
- Implement settings
- Implement API usage tracking
- Implement data source health page

Phase 6:
- Add tests
- Add Sentry
- Add deployment configuration
- Add GitHub/Linear/Notion tasks if plugins are available
- Add production README
- Run full validation

22. Acceptance Criteria

The implementation is complete only when:

- The app runs locally
- User can start manual research
- User can run auto signal discovery
- Keyword metrics are collected and stored
- SERP data is collected and stored
- Market signals are generated automatically
- Opportunities are clustered
- Opportunities are scored
- Investor-style reports are generated
- Facts and assumptions are clearly separated
- Missing data is shown honestly
- No fake metrics are generated
- User can watchlist/reject opportunities
- Dashboard shows charts and evidence
- Tests pass
- App can be deployed
- README is complete

23. Important Behavior

When implementing, do not create placeholders pretending to work.

If an external API cannot be called in local tests, create a mock provider but keep the real provider implemented.

If a plugin/tool is available and useful, use it.

If a plugin/tool is not available, continue without it and document what was skipped.

Do not ask me every small thing.
Make reasonable production-grade decisions.

Before coding each phase:
- Explain the phase goal.
- Implement it.
- Run tests.
- Fix errors.
- Commit or prepare changes if GitHub is available.
- Summarize what changed.

Start now by reading the provided implementation plan file and inspecting the current repository.