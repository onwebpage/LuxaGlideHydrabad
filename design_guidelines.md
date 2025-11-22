# Premium Luxury B2B Multi-Vendor Ecommerce Design Guidelines

## Design Approach
**Selected Approach:** High-end luxury fashion e-commerce inspired by Net-a-Porter, Farfetch, and luxury brand websites, combined with the clean UI patterns of modern B2B platforms.

## Color Palette
- **Primary:** White (#FFFFFF) - dominant background
- **Secondary:** Warm Beige (#F5F1ED, #E8E3DC) - accent sections
- **Accent:** Champagne Gold (#D4AF37, #C9A961) - CTAs, highlights, borders
- **Neutral:** Charcoal Black (#1A1A1A) - typography, headers
- **Supporting:** Soft Gray (#F8F8F8) - cards, subtle backgrounds

## Typography System
- **Headings:** Playfair Display (serif) - elegant, luxury feel
  - H1: 56px/64px (desktop), 36px/44px (mobile), weight 600
  - H2: 40px/48px (desktop), 28px/36px (mobile), weight 600
  - H3: 32px/40px, weight 500
- **Body:** Inter (sans-serif) - clean, modern readability
  - Body Large: 18px/28px, weight 400
  - Body: 16px/24px, weight 400
  - Small: 14px/20px, weight 400
- **Accents:** Letter-spacing of 0.05em for uppercase labels and category tags

## Layout & Spacing
**Spacing Scale:** Tailwind units of 4, 6, 8, 12, 16, 24, 32 (p-4, p-6, p-8, etc.)
- **Container:** max-w-7xl with px-6 for content sections
- **Section Padding:** py-24 (desktop), py-16 (mobile)
- **Card Spacing:** gap-8 for grids, gap-6 for dense layouts
- **Consistent vertical rhythm** using multiples of 8px

## Glassmorphism & Elevation
- **Glass Cards:** 
  - Background: rgba(255, 255, 255, 0.7)
  - Backdrop blur: blur-xl (backdrop-blur-xl)
  - Border: 1px solid rgba(255, 255, 255, 0.3)
  - Shadow: 0 8px 32px rgba(0, 0, 0, 0.08)
  
- **Elevated Cards:**
  - Shadow levels: shadow-sm (default), shadow-lg (hover), shadow-2xl (modals)
  - All cards use rounded-2xl corners
  
- **Dashboard Panels:**
  - White background with subtle beige tints
  - Gold accent borders (1px) for active states
  - Soft shadow: 0 4px 16px rgba(0, 0, 0, 0.04)

## Component Library

### Navigation
- Sticky header with white background, shadow-sm on scroll
- Gold underline animation for active nav items
- Glassmorphism mobile menu with backdrop blur
- Search bar with subtle beige background, gold focus ring

### Buttons
- **Primary CTA:** Solid gold background (#D4AF37), black text, rounded-lg, px-8 py-4
- **Secondary:** White with gold border (2px), gold text, rounded-lg
- **Ghost:** Transparent with gold text, subtle hover background
- **On Images:** Glassmorphism effect - white/10 background, backdrop-blur-md, white text, no additional hover blur

### Product Cards
- Aspect ratio 3:4 for product images
- White card with hover lift (translateY(-4px))
- Gold divider line between image and details
- Price shown in larger weight, MOQ in smaller muted text
- Wishlist heart icon in gold on top-right corner

### Forms
- Input fields: Beige background (#F5F1ED), gold focus border (2px)
- Labels: Uppercase, small text, letter-spacing 0.05em
- Error states: Subtle red with gold accent
- File upload areas: Dashed gold border with glassmorphism background

### Dashboard Widgets
- Analytics charts with gold data lines/bars
- KPI cards with gold accent icons
- Status badges: Gold for active, beige for pending, gray for inactive
- Data tables with alternating row backgrounds (white/beige)

## Animations (Framer Motion)
- **Page Transitions:** Subtle fade + slide up (duration: 0.4s)
- **Card Reveals:** Stagger children with fade-in-up (delay: 0.1s between items)
- **Hover Effects:** Scale 1.02 on product cards, smooth 0.3s transition
- **Loading States:** Shimmer effect with gold gradient overlay
- **Modals:** Backdrop blur with scale animation from 0.95 to 1

## Images

### Hero Section
**Large hero image** spanning full viewport width (100vw), height 85vh
- Image: Sophisticated fashion photography - elegant women's clothing on minimalist mannequins or lifestyle shots in luxury boutique setting
- Overlay: Subtle gradient from transparent to black/20 at bottom
- Centered content with glassmorphism panel containing headline and CTAs

### Homepage Imagery
- **Featured Vendors:** Circular vendor logo/brand images (150px diameter) with gold rings
- **Category Cards:** Lifestyle product photography with soft shadows
- **Testimonials:** Professional headshots (80px circular) with gold borders

### Product Pages
- **Gallery:** 4-6 high-quality product images showing different angles, details, and styling
- **360 View:** Interactive rotation imagery (if available)
- **Vendor Profile:** Brand banner image (16:5 ratio) with logo overlay

### Dashboard
- **Empty States:** Elegant illustrations in gold/beige tones
- **Profile Uploads:** Document icons for KYC verification

## Responsive Breakpoints
- Mobile: Single column, condensed spacing (py-8, gap-4)
- Tablet (md:): 2-column grids, increased spacing
- Desktop (lg:): 3-4 column grids for products, full dashboard layouts

## Key UX Patterns
- Breadcrumb navigation with gold separators
- Floating action buttons (gold) for cart/RFQ on mobile
- Toast notifications with glassmorphism styling
- Skeleton loaders matching component shapes in beige tones
- Progress indicators for multi-step flows (KYC, checkout) using gold accents