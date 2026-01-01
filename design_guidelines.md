# LuxeWholesale - Premium White & Gold B2B Ethnic Fashion Design Guidelines

## Design Approach
**Selected Approach:** Luxury light-mode e-commerce inspired by high-end jewelry brands (Cartier, Tiffany), premium fashion houses (Chanel, Dior), and sophisticated lifestyle platforms. Emphasizing elegance through pristine whites, refined gold accents, and exceptional photography of ethnic fashion.

**Core Principles:** Pristine clarity, generous breathing room, gold as the accent of refinement, photography showcasing intricate ethnic textiles and craftsmanship.

## Color Palette
- **Primary Background:** Pure White (#FFFFFF) - dominant canvas
- **Secondary Background:** Warm Ivory (#FAFAF8) - elevated sections and cards
- **Accent Gold:** #D4AF37 - CTAs, borders, active states, icons, highlights
- **Text Primary:** Deep Charcoal (#1A1A1A) - headings, primary content
- **Text Secondary:** Warm Gray (#6B6B6B) - body text, descriptions
- **Subtle Elements:** Light Beige (#F5F5F3) - dividers, subtle backgrounds
- **Gold Gradients:** Linear gradient from #D4AF37 to #E8C547 for premium elements

## Typography System
- **Headings:** Playfair Display (serif) - timeless elegance
  - H1: 64px/72px (desktop), 40px/48px (mobile), weight 600, #1A1A1A
  - H2: 48px/56px (desktop), 32px/40px (mobile), weight 600, #1A1A1A
  - H3: 36px/44px, weight 500, #1A1A1A
- **Body:** Inter (sans-serif) - exceptional readability
  - Body Large: 18px/28px, weight 400, #6B6B6B
  - Body: 16px/24px, weight 400, #6B6B6B
  - Small: 14px/20px, weight 400, #8A8A8A
- **Labels:** Uppercase, 12px, letter-spacing 0.12em, gold (#D4AF37), weight 500

## Layout & Spacing
**Spacing Scale:** Tailwind units of 4, 6, 8, 12, 16, 24, 32
- **Container:** max-w-7xl with px-6
- **Section Padding:** py-32 (desktop), py-20 (mobile)
- **Card Spacing:** gap-8 for grids, gap-6 for compact layouts
- **Generous whitespace:** Sections breathe with py-24 minimum, embrace negative space

## Component Library

### Navigation
- White background with subtle shadow on scroll (0 1px 8px rgba(0,0,0,0.08))
- Charcoal text (#1A1A1A) with gold underline for active items (2px)
- Mobile menu: White with gold accent border
- Search: #FAFAF8 background, gold focus ring (2px), rounded-full

### Buttons
- **Primary:** Solid gold (#D4AF37), white text, rounded-lg, px-8 py-4, shadow-md, hover: #C5A028
- **Secondary:** White with gold border (2px), gold text, rounded-lg, hover: gold/5 background
- **Ghost:** Transparent, gold text, hover: #FAFAF8 background
- **On Images (Hero):** White with backdrop-blur-md, gold text, gold border (1px), no hover interactions

### Product Cards
- Background: White with subtle shadow (0 2px 12px rgba(0,0,0,0.06))
- Image: 3:4 aspect ratio, full-bleed
- Hover: lift (translateY(-4px)), enhanced shadow (0 8px 24px rgba(0,0,0,0.12))
- Gold hairline border (1px) around entire card
- Price: #1A1A1A, larger weight; MOQ: #6B6B6B
- Gold wishlist icon, top-right overlay on white circle background

### Forms
- Inputs: White background, #F5F5F3 border (1px), gold focus border (2px), rounded-lg
- Labels: Uppercase gold, letter-spacing 0.12em, weight 500
- Placeholder: #A8A8A8
- File upload: Dashed gold border (2px), #FAFAF8 background

### Dashboard Widgets
- Cards: White with gold accent borders, shadow-sm
- Charts: Gold data visualization with charcoal labels
- KPI cards: White background, gold icons, charcoal numbers, #FAFAF8 hover
- Status badges: Gold background for active, #F5F5F3 for inactive
- Tables: White rows, #FAFAF8 alternating, gold border on hover

### Category/Feature Sections
- Alternating white/ivory backgrounds per section for visual rhythm
- Gold decorative dividers between major sections (centered, 120px wide, 2px height)
- 3-4 column grids for categories with gold-bordered cards
- Large section headings centered with gold underline accent

## Animations
- **Page Transitions:** Fade + slide up (0.3s ease-out)
- **Card Reveals:** Staggered fade-in (0.06s delay)
- **Hover:** Lift transform, shadow enhancement, 0.25s smooth
- **Modals:** Backdrop overlay + scale 0.97→1
- **Loading:** Gold shimmer progress bar

## Images

### Hero Section
**Full-width hero:** 100vw × 85vh minimum
- **Photography:** Luxurious ethnic fashion photography - models in exquisite sarees, lehengas, or ethnic wear with rich textiles and intricate embroidery. Professional studio lighting highlighting fabric details and craftsmanship. Warm, inviting tones.
- **Treatment:** Subtle vignette, no heavy overlays - let the fashion shine
- **Content:** Centered panel with Playfair headline and white blurred-background buttons with gold text/borders

### Supporting Imagery
- **Vendor Banners:** Wide format (16:5) showcasing brand aesthetic with ethnic fashion context
- **Product Galleries:** 6-10 high-resolution images - multiple angles, close-ups of embroidery/details, fabric textures, styling variations
- **Category Cards:** Lifestyle imagery featuring ethnic wear in elegant settings (2:3 ratio), gold border frames
- **Testimonials:** Professional color headshots (96px circular) with thin gold ring borders (2px)
- **Homepage Features:** Large product/lifestyle photography in asymmetric grids - mix of 1:1, 3:4, and 16:9 ratios for visual interest

### Image Treatment
- Bright, well-lit photography emphasizing rich colors of ethnic fabrics
- Consistent warm color grading for cohesion
- High resolution essential for showcasing intricate textile details

## Key Patterns
- Gold breadcrumb separators (chevrons)
- Floating gold FAB for cart/RFQ (mobile) with shadow
- Toast notifications: White with gold left border (4px), shadow-lg
- Multi-step progress: Gold filled circles with light gray connecting lines
- Testimonial quotes: Large gold quotation marks as decorative elements
- Trust badges: Gold icons with charcoal text on #FAFAF8 background

## Responsive Strategy
- **Mobile:** Single column, py-12 sections, gap-4, h1 at 40px
- **Tablet (md:):** 2-column grids, py-20 sections
- **Desktop (lg:):** 3-4 column layouts, py-32 sections, full asymmetric grids