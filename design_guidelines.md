# Premium Dark Luxury B2B Multi-Vendor Ecommerce Design Guidelines

## Design Approach
**Selected Approach:** High-end luxury dark-mode e-commerce inspired by luxury watch brands (Rolex, Omega), premium automotive sites (Porsche, Tesla), and sophisticated fashion platforms, emphasizing drama through contrast and refined elegance.

**Core Principles:** Maximum contrast, breathing room through negative space, photography as hero element, restrained gold accents for hierarchy.

## Color Palette
- **Primary Background:** Rich Black (#0A0A0A) - dominant canvas
- **Secondary Background:** Deep Charcoal (#1A1A1A) - elevated cards and panels
- **Accent:** Champagne Gold (#D4AF37) - CTAs, borders, active states, highlights
- **Text Primary:** Pure White (#FFFFFF) - headings, primary content
- **Text Secondary:** Light Gray (#B8B8B8) - body text, descriptions
- **Subtle Accents:** Dark Gray (#2A2A2A) - dividers, subtle borders

## Typography System
- **Headings:** Playfair Display (serif) - timeless luxury
  - H1: 64px/72px (desktop), 40px/48px (mobile), weight 600, white
  - H2: 48px/56px (desktop), 32px/40px (mobile), weight 600, white
  - H3: 36px/44px, weight 500, white
- **Body:** Inter (sans-serif) - exceptional readability on dark
  - Body Large: 18px/28px, weight 400, #B8B8B8
  - Body: 16px/24px, weight 400, #B8B8B8
  - Small: 14px/20px, weight 400, #9A9A9A
- **Labels:** Uppercase, 12px, letter-spacing 0.1em, gold (#D4AF37)

## Layout & Spacing
**Spacing Scale:** Tailwind units of 4, 6, 8, 12, 16, 24, 32
- **Container:** max-w-7xl with px-6
- **Section Padding:** py-32 (desktop), py-20 (mobile)
- **Card Spacing:** gap-8 for grids, gap-6 for compact layouts
- **Generous whitespace:** Embrace negative space - sections breathe with py-24 minimum

## Dark Glassmorphism & Elevation
- **Glass Cards:** 
  - Background: rgba(26, 26, 26, 0.6)
  - Backdrop blur: backdrop-blur-xl
  - Border: 1px solid rgba(212, 175, 55, 0.2)
  - Shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
  
- **Elevated Panels:**
  - Background: #1A1A1A
  - Shadow: 0 4px 24px rgba(0, 0, 0, 0.5)
  - Gold accent border (1px) on hover/active
  - Rounded corners: rounded-2xl

## Component Library

### Navigation
- Black background (#0A0A0A) with gold bottom border on scroll
- White text with gold underline for active items
- Glassmorphism mobile menu: dark glass with backdrop blur
- Search: #1A1A1A background, gold focus ring (2px)

### Buttons
- **Primary:** Solid gold (#D4AF37), black text, rounded-lg, px-8 py-4, shadow-lg
- **Secondary:** Transparent with gold border (2px), white text, rounded-lg
- **Ghost:** Transparent, gold text, hover: gold/10 background
- **On Images (Hero):** Glassmorphism - rgba(10,10,10,0.3), backdrop-blur-md, white text, gold border (1px), no hover blur

### Product Cards
- Background: #1A1A1A
- Image aspect ratio: 3:4, full-bleed
- Hover: lift (translateY(-6px)), enhanced shadow
- Gold hairline divider between image and details
- Price: white, larger weight; MOQ: #B8B8B8
- Gold wishlist icon, top-right overlay

### Forms
- Inputs: #1A1A1A background, gold focus border (2px)
- Labels: Uppercase gold, letter-spacing 0.1em
- Placeholder: #5A5A5A
- File upload: Dashed gold border, dark glassmorphism

### Dashboard Widgets
- Charts: Gold data visualization with white labels
- KPI cards: #1A1A1A background, gold accent icons, white numbers
- Status badges: Gold (active), #2A2A2A (inactive)
- Tables: Alternating rows #0A0A0A / #1A1A1A, gold hover state

## Animations
- **Page Transitions:** Fade + slide up (0.4s ease-out)
- **Card Reveals:** Staggered fade-in-up (0.08s delay)
- **Hover:** Scale 1.03, brightness increase, 0.3s smooth
- **Modals:** Backdrop blur + scale 0.96→1
- **Loading:** Gold shimmer effect overlay

## Images

### Hero Section
**Full-width hero:** 100vw × 90vh
- **Photography:** Dramatic fashion/luxury product photography - low-key lighting, high contrast, professional models in elegant poses, or premium products on black backgrounds
- **Overlay:** Subtle vignette, gradient from transparent to black/40 at edges
- **Content:** Centered glassmorphism panel with headline and CTA buttons (dark glass with blur)

### Supporting Imagery
- **Vendor Profiles:** Monochromatic brand photography, 16:7 ratio banners
- **Product Galleries:** 6-8 images per product - multiple angles, detail shots, lifestyle contexts
- **Category Cards:** Lifestyle photography with dramatic lighting (2:3 ratio)
- **Testimonials:** Professional B&W headshots (96px circular) with gold ring borders
- **Homepage Features:** Large-scale atmospheric product photography spanning 50vw sections

### Image Treatment
- Slight desaturation for cohesion with dark theme
- Subtle gold color grade overlay (5% opacity)
- Sharp, high-resolution imagery essential

## Responsive Strategy
- **Mobile:** Single column, py-12 sections, gap-4, condensed type scale
- **Tablet (md:):** 2-column grids, py-20 sections
- **Desktop (lg:):** 3-4 column product grids, full dashboard layouts, py-32 sections

## Key Patterns
- Gold breadcrumb separators on black
- Floating gold FAB for cart/RFQ (mobile)
- Toast notifications: Dark glass with gold accent border
- Skeleton loaders: #1A1A1A with gold shimmer animation
- Multi-step progress: Gold filled circles with white connecting lines