# Co się dzieje w Polsce? - Complete Product Context

## Executive Summary

"Co się dzieje w Polsce?" (What's Happening in Poland?) is a civic technology platform that makes Polish legislation accessible to ordinary citizens. It automatically fetches legal acts from the Polish Parliament (Sejm), uses AI to generate plain-language summaries, and visualizes parliamentary voting patterns to reveal political dynamics behind each law.

---

## Problem Statement

### The Core Problem
Polish citizens struggle to understand new laws that affect their lives because:
1. **Legal language is impenetrable** - Acts are written in complex legal jargon
2. **Information is scattered** - Official sources are hard to navigate
3. **Political context is hidden** - Who voted for what and why is not easily visible
4. **No centralized simple source** - No single place for "what laws passed this week in plain Polish"

### Who Feels This Pain
- Citizens who want to be informed but don't have legal background
- Journalists covering legislative changes
- NGOs and advocacy groups tracking relevant legislation
- Students studying law or political science
- Small business owners affected by regulatory changes
- Political analysts tracking voting patterns

---

## Solution

### What We Built
A web platform that:
1. **Automatically fetches** new legal acts from Sejm API (Polish Parliament)
2. **Downloads and processes** official PDF documents
3. **Generates AI summaries** in plain Polish using OpenAI
4. **Fetches voting data** showing how each party voted
5. **Visualizes political patterns** - government vs opposition support
6. **Categorizes acts** by topic (economy, health, education, etc.)
7. **Presents everything** in a clean, searchable interface

### The User Experience
- Browse a grid of recent legal acts
- See at a glance: title, date, summary, categories, voting pattern
- Click to see full details including:
  - Complete plain-language explanation
  - Link to original PDF
  - Detailed voting breakdown by political party
  - Charts showing government/opposition split
  - Timeline of act status (announced → in effect → repealed)

---

## Current Features (Implemented)

### For All Users
- **Search**: Full-text search across titles, content, categories
- **Filters**: By act type (Ustawa/Rozporządzenie), category, date, title
- **Sorting**: By date (newest/oldest) or alphabetically
- **Category browsing**: Horizontal carousel of legal categories
- **Dark/Light mode**: Full theme support
- **Mobile responsive**: Works on all device sizes
- **Polish language**: Entire UI in Polish

### For Each Legal Act
- **Simple title**: Cleaned up, readable version
- **AI summary**: "W skrócie" (In brief) section
- **Full explanation**: Detailed plain-language content
- **Original PDF link**: Direct link to official document
- **Status badge**: Current state (Announced/In Effect/Repealed)
- **Categories**: Up to 4 topic tags
- **Dates**: Announcement date, entry into force date

### Voting Analytics (Unique Feature)
- **Pass/Fail indicator**: With margin of votes
- **Total votes**: Yes/No/Abstain counts with percentages
- **Party breakdown**: Bar chart showing each party's vote
- **Coalition analysis**: Government % vs Opposition % support
- **Participation metrics**: Present, absent, attendance rate
- **Visual indicator**: Dot visualization on cards showing government support level

### Access Control (Current Settings)
- **Anonymous users**: 3 acts per day (tracked in browser)
- **Logged-in users**: 5 acts per day
- **Subscribers**: Unlimited access (subscription system ready but disabled)
- **Admins**: Full access + content editing + see low-confidence acts

### Admin Features
- **Inline editing**: Click pencil icon to edit any content
- **Edit fields**: Summary, full content, impact section
- **Soft delete**: Remove acts (with audit trail)
- **Quality control**: See acts flagged as low-confidence by AI
- **Live preview**: See changes before saving

### Backend Pipeline
- **Sejm API integration**: Fetches acts and voting data
- **PDF processing**: Downloads and extracts text
- **OpenAI integration**: Generates summaries and categorizes
- **Confidence scoring**: AI rates its own summary quality (0-100%)
- **Automatic categorization**: Assigns relevant topic categories
- **PostgreSQL storage**: All data persisted with Prisma ORM

---

## Technical Architecture

### Frontend Stack
- Next.js 15 (React 19)
- TypeScript 5
- Tailwind CSS 4
- Shadcn UI components
- Clerk (authentication)
- GSAP (animations)
- Recharts (voting charts)
- SWR (data fetching)

### Backend Stack
- Python 3.13+
- OpenAI SDK
- PostgreSQL (Neon DB)
- Prisma ORM

### Infrastructure
- Vercel (hosting + deployment)
- Clerk (auth provider)
- Stripe (payments - configured but not active)
- Neon (PostgreSQL database)

### Data Flow
```
Sejm API → Python Pipeline → AI Processing → PostgreSQL → Next.js → User
     ↓           ↓              ↓
   Acts      PDF Text      Summaries
   Votes                   Categories
                          Confidence
```

---

## Business Model

### Current Monetization (Ready but Disabled)
- **Free tier**: Limited daily access (3-5 acts)
- **Premium subscription**: Unlimited access
  - Plan Podstawowy: 29 PLN/month (~$7)
  - Plan Premium: 49 PLN/month (~$12)

### Subscription Features (Planned)
| Feature | Free | Podstawowy | Premium |
|---------|------|------------|---------|
| Daily act limit | 3-5 | Unlimited | Unlimited |
| Voting analytics | ✓ | ✓ | ✓ |
| Categories | ✓ | ✓ | ✓ |
| Real-time updates | ✗ | ✗ | ✓ |
| Customer support | ✗ | ✗ | ✓ |
| Mobile access | ✓ | ✓ | ✓ |

### Payment Integration
- Stripe Checkout configured
- Webhook handlers for subscription lifecycle
- Subscription status stored in Clerk user metadata

---

## Market Context

### Polish Market
- Population: ~38 million
- Internet users: ~30 million
- Official language: Polish only
- Currency: PLN (1 USD ≈ 4 PLN)

### Competitive Landscape

| Competitor | Type | Weakness We Address |
|------------|------|---------------------|
| Sejm.gov.pl | Official government portal | Complex, hard to navigate, no summaries |
| ISAP (legal database) | Official legal database | Technical, for professionals only |
| News outlets | Media coverage | Selective, biased, no systematic coverage |
| Lex/Legalis | Professional legal tools | Very expensive, overkill for citizens |

### Our Differentiation
1. **AI-powered simplification** - Not just aggregation
2. **Voting transparency** - Party-by-party breakdown
3. **Visual analytics** - Instant political context
4. **Free tier** - Accessible to everyone
5. **Modern UX** - Clean, fast, mobile-friendly
6. **Automated pipeline** - Comprehensive coverage, not selective

---

## Target Audience Segments

### Primary Segments
1. **Civic-minded citizens** (B2C)
   - Want to stay informed
   - No legal background
   - Value convenience over price
   - Estimated: 500K-1M potential users in Poland

2. **Journalists and media** (B2B)
   - Need quick access to new laws
   - Value voting data for stories
   - Would pay for API/bulk access
   - Estimated: 500-1,000 organizations

3. **NGOs and think tanks** (B2B)
   - Track legislation in their domain
   - Need historical data and analysis
   - Budget for tools
   - Estimated: 200-500 organizations

### Secondary Segments
4. **Law students** - Learning tool
5. **Small business owners** - Regulatory tracking
6. **Political analysts** - Voting pattern research
7. **Government relations professionals** - Monitoring

---

## Current Gaps and Limitations

### Not Yet Implemented
- ❌ Analytics/tracking (no usage data)
- ❌ Email newsletter/notifications
- ❌ Social sharing features
- ❌ Referral/growth mechanisms
- ❌ SEO optimization
- ❌ API for third parties
- ❌ Historical data analysis
- ❌ Personalized recommendations
- ❌ Mobile app
- ❌ Multi-language support
- ❌ Advanced search (date ranges, etc.)
- ❌ Saved/bookmarked acts
- ❌ User preferences/followed categories
- ❌ Commenting/discussion
- ❌ Expert analysis layer
- ❌ Comparison between acts
- ❌ Amendment tracking

### Known Issues
- Pipeline runs manually (not scheduled)
- No unit tests (only E2E)
- Some voting data incomplete (opposition calculations)
- Low-confidence summaries need manual review

---

## Growth Channels (Not Yet Utilized)

### Organic
- SEO (legal keywords in Polish)
- Content marketing (blog, explainers)
- Social media (Twitter/X, LinkedIn, TikTok)
- YouTube (law explainer videos)
- Reddit/Wykop (Polish forums)

### Paid
- Google Ads (legal keywords)
- Facebook/Instagram ads
- LinkedIn ads (B2B)

### Viral
- Shareable voting visualizations
- Controversial law highlights
- "See how your MP voted" features

### Partnership
- Media outlet integrations
- University partnerships
- NGO collaborations
- Political party transparency initiatives

---

## Unique Data Assets

### What We Have That Others Don't
1. **AI-generated summaries** of Polish legal acts
2. **Structured voting data** linked to acts
3. **Category taxonomy** for Polish legislation
4. **Confidence scores** for summary quality
5. **Clean, queryable database** of recent Polish laws

### Potential Data Products
- Voting pattern API
- Legislative trends reports
- Party voting consistency analysis
- Category-specific law digests
- Historical voting database

---

## Key Metrics to Track (Not Yet Implemented)

### Product Metrics
- Daily/Monthly Active Users
- Acts viewed per session
- Search queries
- Time on site
- Bounce rate
- Feature usage (filters, voting charts)

### Business Metrics
- Registered users
- Free to paid conversion rate
- Subscription churn rate
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

### Content Metrics
- Acts processed per day
- Average confidence score
- Manual edits required
- Categories distribution

---

## Technical Capabilities Available

### What the Platform Can Do
- Fetch any data from Sejm API
- Process PDF documents
- Generate AI summaries (OpenAI)
- Store structured data (PostgreSQL)
- Authenticate users (Clerk)
- Process payments (Stripe)
- Send webhooks/notifications (infrastructure exists)
- Scale horizontally (Vercel)

### What Could Be Built Quickly
- Email notifications (Clerk + Resend)
- RSS feeds
- API endpoints
- Webhook integrations
- Export functionality (CSV, PDF)
- Scheduled pipeline runs
- Basic analytics (Vercel Analytics)

---

## Sample User Journeys

### Journey 1: Curious Citizen
1. Sees news about controversial law
2. Googles "ustawa [topic] podsumowanie"
3. Lands on our site
4. Reads summary and voting breakdown
5. Shares visualization on social media
6. Returns next week to check more laws
7. Hits daily limit, considers subscribing

### Journey 2: Journalist
1. Needs quick summary for article deadline
2. Searches our site for specific act
3. Uses voting data in their story
4. Cites us as source
5. Organization subscribes for unlimited access

### Journey 3: NGO Analyst
1. Tracks all laws in their domain (e.g., environment)
2. Uses category filter daily
3. Exports data for reports
4. Needs API access for integration
5. Becomes B2B customer

---

## Questions for Ideation

### Business Model
- What other monetization models could work?
- How to increase conversion from free to paid?
- What B2B products could we build?
- What partnerships would accelerate growth?

### Product
- What features would make this viral?
- How to increase engagement and retention?
- What would make users share this?
- What adjacent problems could we solve?

### Market
- What other countries have similar needs?
- What other government data could we simplify?
- What professional niches would pay premium prices?
- How could we become essential infrastructure?

### Data
- What insights could we generate from our data?
- What data products could we sell?
- How could we use the data for content marketing?
- What predictions could we make?

---

## Contact

- **Product**: Co się dzieje w Polsce?
- **Stage**: MVP (functional, not monetized)
- **Location**: Poland
- **Language**: Polish only (currently)

---

*This document was generated for the purpose of brainstorming business and product ideas. It represents the current state of the platform as of January 2025.*
