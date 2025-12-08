# HFY Website Migration TODO

Migration from static Vue frontend to Nuxt template, following project proposal phases.

---

## Milestone 1: Brand & Foundation Setup

Configure the HFY visual identity and core infrastructure.

### Brand Configuration

- [x] Update `app/config/brand.ts` with HFY colors (iridescent rainbow: pink, turquoise, golden sun, indigo, emerald, pearl white, copper, volcanic gray)
- [x] Configure typography: Playfair Display (headers), Poppins (body), handwritten accent font
- [x] Update `app/assets/css/main.css` with brand CSS variables
- [x] Test light/dark mode palette switching

### Brand Aesthetic Refresh ("Holographic Mystic Maximalism")

Style direction: **Warm Abundant Base + Cosmic Accents**
Reference: `docs/STYLE_GUIDELINE.md`

#### Brand Config Extensions

- [ ] Add `muted` color token (secondary text)
- [ ] Add `gradient` tokens (start/middle/end for holographic effects)
- [ ] Add `glow` token (colored shadows)
- [ ] Update `app/types/brand.ts` with new interface
- [ ] Update `app/assets/css/main.css` with new CSS variables

#### Motion Integration (`motion-v`)

- [ ] Install `motion-v` and add Nuxt module
- [ ] **AppHeader**: AnimatePresence for mobile menu slide
- [ ] **Hero Section**: Staggered text reveal + floating orbs with `useScroll`
- [ ] **Card Grids**: `whileInView` scroll reveal for FeatureCard, EventCard, PostCard
- [ ] **PageSection**: `whileInView` fade-up entrance
- [ ] **BaseButton**: `whileHover`/`whilePress` for primary/contrast variants

#### Component Styling Updates

- [ ] **BaseButton**: Holographic border option, glow shadows, breathing animation
- [ ] **BaseCard**: Glassmorphism + subtle rainbow border on hover
- [ ] **FeatureCard**: Holographic accent, icon glow
- [ ] **EventCard**: Warm gradient accents, hover lift
- [ ] **PostCard**: Soft shadows, prismatic hover state
- [ ] **PageSection**: Aurora gradient dividers (optional)
- [ ] **AppHeader**: Frosted glass navbar, rainbow active indicator
- [ ] **AppFooter**: Subtle gradient accent line

### Database & Auth Setup

- [ ] Configure Supabase connection in `server/env.ts`
- [ ] Create Drizzle schema for core entities (`server/database/schema.ts`):
  - [ ] `posts` table (blog)
  - [ ] `events` table
  - [ ] `appointments` table
  - [ ] `services` table
- [ ] Set up Supabase Auth integration
- [ ] Create auth middleware for protected routes

### Component Foundation

- [x] Migrate/adapt `BaseButton` with HFY styling
- [x] Create `Card` atom (from old frontend)
- [x] Create `Section` molecule (container with eyebrow/title/description)
- [x] Create `Skeleton` loading component
- [x] Create `EmptyState` component

---

## Milestone 2: Public Pages (UI First)

Core marketing pages with HFY visual identity.

### Layout & Navigation

- [x] Update `AppHeader` with HFY branding and nav links (Home, About, Blog, Events, Book)
- [x] Add mobile hamburger menu with slide animation
- [x] Update `AppFooter` with HFY social links and legal
- [x] Configure Nuxt SEO meta defaults

### Home Page (`app/pages/index.vue`)

- [x] Hero section with HFY messaging ("Awaken your potential")
- [x] Features grid (3-column: Personalized Insights, Curated Experiences, Holistic Balance)
- [x] Upcoming events preview section
- [x] Blog preview section
- [x] CTA section with newsletter signup

### About Page (`app/pages/about.vue`)

- [x] About AstraNova content section
- [x] Philosophy/mission section
- [x] Visual elements (parallax, shimmer effects per HFY spec)

---

## Milestone 3: Blog System

Content management for blog posts.

### API Routes

- [ ] `GET /api/posts` - List posts (paginated)
- [ ] `GET /api/posts/[slug]` - Get single post
- [ ] `POST /api/admin/posts` - Create post (protected)
- [ ] `PUT /api/admin/posts/[id]` - Update post (protected)
- [ ] `DELETE /api/admin/posts/[id]` - Delete post (protected)

### Frontend Pages

- [ ] `app/pages/blog/index.vue` - Blog listing with cards
- [ ] `app/pages/blog/[slug].vue` - Single post with markdown rendering
- [ ] Create `PostCard` molecule component
- [ ] Implement category/tag filtering

### Admin UI

- [ ] `app/pages/admin/posts/index.vue` - Posts list with CRUD
- [ ] `app/pages/admin/posts/new.vue` - Create post form
- [ ] `app/pages/admin/posts/[id].vue` - Edit post form
- [ ] Markdown editor integration

---

## Milestone 4: Events System

Event management and display.

### API Routes

- [ ] `GET /api/events` - List events (paginated, with date filtering)
- [ ] `GET /api/events/[id]` - Get single event
- [ ] `POST /api/admin/events` - Create event (protected)
- [ ] `PUT /api/admin/events/[id]` - Update event (protected)
- [ ] `DELETE /api/admin/events/[id]` - Delete event (protected)

### Frontend Pages

- [x] `app/pages/events/index.vue` - Events listing with date grouping
- [x] `app/pages/events/[id].vue` - Single event detail page
- [x] Create `EventCard` molecule component
- [x] Upcoming vs past events filtering

---

## Milestone 5: Admin Dashboard

Admin interface for content management.

### Auth & Protection

- [ ] Admin login page (`app/pages/admin/login.vue`)
- [ ] Auth guard middleware for `/admin/*` routes
- [ ] Session management with Supabase

### Dashboard

- [ ] `app/pages/admin/index.vue` - Dashboard overview
- [ ] Stats cards (active bookings, upcoming events, pending posts)
- [ ] Quick actions (new post, new event)

### Admin Layout

- [ ] Create `AdminLayout` with sidebar navigation
- [ ] Sidebar links: Dashboard, Posts, Events, Appointments (Phase 1.5)

---

## Milestone 6: Booking System (Phase 1 completion)

Appointment booking with calendar integration.

### Database

- [ ] Services table (name, description, duration, price)
- [ ] Appointments table (service_id, client info, datetime, status)
- [ ] Available slots configuration

### API Routes

- [ ] `GET /api/services` - List available services
- [ ] `GET /api/availability` - Get available time slots
- [ ] `POST /api/appointments` - Create appointment
- [ ] `GET /api/admin/appointments` - List appointments (protected)
- [ ] `PUT /api/admin/appointments/[id]` - Update appointment status

### Frontend Pages

- [ ] `app/pages/book/index.vue` - Service selection
- [ ] `app/pages/book/[service].vue` - Calendar/time slot picker
- [ ] `app/pages/book/confirm.vue` - Booking confirmation form
- [ ] `app/pages/book/success.vue` - Success page
- [ ] `app/pages/book/cancel.vue` - Cancellation page

### Components

- [ ] `ServiceCard` molecule
- [ ] `CalendarPicker` organism
- [ ] `TimeSlotGrid` molecule

---

## Milestone 7: Payments (Stripe)

Payment processing for bookings.

### Configuration

- Webhook URL: `https://hfy.world/api/webhooks/stripe`
- Events to listen for:
  - `checkout.session.completed` (required) - Payment succeeded
  - `checkout.session.expired` (optional) - Session timed out
  - `payment_intent.payment_failed` (optional) - Track failures

### Backend

- [ ] Stripe SDK integration
- [ ] `POST /api/checkout/create` - Create Stripe checkout session
- [ ] `POST /api/webhooks/stripe` - Handle Stripe webhooks (`server/api/webhooks/stripe.post.ts`)
- [ ] Payment status tracking in appointments table

### Frontend

- [ ] Integrate Stripe Checkout redirect flow
- [ ] Payment confirmation handling
- [ ] Receipt/invoice display

### Database

- [ ] Payments table (appointment_id, stripe_session_id, amount, status)

---

## Milestone 8: Polish & Performance

Security, performance, and launch readiness.

### Security

- [ ] SSL configuration (Vercel handles this)
- [ ] GDPR cookie consent banner
- [ ] Input validation on all forms
- [ ] Rate limiting on API routes

### Performance

- [ ] Lighthouse audit and optimizations (target <2.5s mobile)
- [ ] Image optimization with Nuxt Image
- [ ] Bundle analysis and code splitting

### SEO

- [ ] Meta tags configuration per page
- [ ] Sitemap generation
- [ ] robots.txt configuration
- [ ] Schema.org markup for events

### Analytics

- [ ] Google Analytics integration
- [ ] Event tracking for key actions (book, payment, signup)

---

## Future Milestones (Phase 2+)

### Phase 2: Courses & Memberships

- [ ] Course framework (video, downloads, access control)
- [ ] Membership portal with tiered access (Basic/VIP/Admin)
- [ ] Zoom API integration for live sessions
- [ ] Member dashboard UI

### Phase 3: Automation & CRM

- [ ] Email service integration (Postmark/ConvertKit)
- [ ] Automation workflows (post-booking/payment emails)
- [ ] Ecommerce for digital/physical goods
- [ ] Advanced analytics dashboard

---

## Notes

- **Stack**: Nuxt 3, Tailwind (pure, no DaisyUI), Drizzle ORM, Supabase Auth
- **Design**: HFY Rainbow Diamond Light theme with Playfair Display + Poppins
- **Deployment**: Vercel
- **Reference**: See `~/docs/` for project proposal and creative brief
