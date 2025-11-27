# LuxeWholesale - Premium B2B Multi-Vendor Ecommerce Platform

## Overview

LuxeWholesale is a premium B2B wholesale marketplace for women's fashion, connecting retail buyers with verified wholesale vendors across India. The platform features a luxury-inspired design aesthetic with separate dashboards for buyers, vendors, and administrators. Key features include bulk pricing tiers, KYC verification workflows, product catalog management, order tracking, wishlist functionality, and request-for-quote (RFQ) capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with role-based dashboard redirection

**State Management**: TanStack Query (React Query) for server state with custom query client configuration. Authentication state is managed through React Context (`AuthProvider`) with localStorage persistence.

**UI Component Library**: Radix UI primitives with custom shadcn/ui components styled using Tailwind CSS. The design system follows a luxury B2B aesthetic with:
- Custom color palette (champagne gold accents, warm beige, charcoal black)
- Typography system using Playfair Display (serif) for headings and Inter (sans-serif) for body text
- Glassmorphism effects and elevation shadows for visual hierarchy
- Comprehensive component library including forms, dialogs, tables, charts, and navigation elements

**Animation**: Framer Motion for scroll-based parallax effects, page transitions, and micro-interactions

**Directory Structure**:
- `/client/src/pages` - Page-level components (Home, Products, Login, Register, Dashboards, AdminSiteSettings)
- `/client/src/components` - Reusable components (Header, Footer)
- `/client/src/components/ui` - shadcn/ui component library
- `/client/src/hooks` - Custom React hooks for data fetching (products, vendors, categories, CMS settings)
- `/client/src/lib` - Utilities (auth context, query client, cn utility)

**CMS System**:
- Admin-managed content via `/dashboard/admin/site-settings` with tabbed interface
- Sections: Branding & SEO, Hero, Featured Collections, Testimonials, Promotions, Footer
- Public consumption via `useCmsSettings()` hook
- Admin updates via `useUpdateSiteMeta()`, `useUpdateHero()`, etc. with automatic cache invalidation

### Backend Architecture

**Runtime**: Node.js with Express.js server

**Development vs Production**:
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves pre-built static files from `/dist/public`

**API Structure**: RESTful endpoints under `/api/*` namespace:
- `/api/auth/*` - Authentication (register, login, logout)
- `/api/products/*` - Product CRUD operations with filtering
- `/api/vendors/*` - Vendor management and KYC workflows
- `/api/orders/*` - Order management and tracking
- `/api/dashboard/*` - Role-specific dashboard statistics
- `/api/admin/cms/*` - Admin CMS endpoints for site customization (protected)
- `/api/cms/public` - Public endpoint for consuming CMS settings

**File Upload**: Multer middleware for handling multipart/form-data with local file storage in `/uploads` directory (5MB file size limit). Images are saved with unique timestamps.

**Authentication**: 
- Password hashing using bcrypt (10 salt rounds)
- Session-based authentication with user data stored in localStorage on client
- Role-based access control (buyer, vendor, admin)

**Storage Layer**: Abstracted through `storage.ts` interface that provides typed methods for all database operations. Uses Drizzle ORM for type-safe database queries.

### Database Architecture

**ORM**: Drizzle ORM with Neon serverless PostgreSQL adapter

**Connection**: WebSocket-based connection using `@neondatabase/serverless` with connection pooling

**Schema Design** (`shared/schema.ts`):

**Core Tables**:
- `users` - Base user authentication (email, password hash, role, full name, phone)
- `vendors` - Vendor profiles with KYC status, business details, ratings, total sales
- `buyers` - Buyer profiles with business information and KYC documents
- `addresses` - Multi-address support for users (shipping/billing)
- `categories` - Hierarchical product categories with parent-child relationships
- `products` - Product listings with images, pricing, MOQ, stock, variations (colors/sizes), bulk pricing tiers
- `reviews` - Product reviews with ratings
- `wishlist` - User product wishlists
- `cart` - Shopping cart with quantity tracking
- `orders` - Order headers with status, payment tracking, shipping details
- `order_items` - Order line items with product snapshots
- `rfqs` - Request for quotes with vendor responses
- `newsletter` - Email subscription management
- `cms_settings` - Dynamic CMS configuration

**Enums**:
- User roles: buyer, vendor, admin
- KYC status: pending, approved, rejected
- Order status: pending, confirmed, processing, shipped, delivered, cancelled
- Payment status: pending, paid, failed, refunded
- RFQ status: pending, quoted, accepted, rejected

**Relationships**: Drizzle relations define one-to-many and many-to-one connections (users→vendors, vendors→products, products→reviews, etc.)

**Validation**: Zod schemas generated from Drizzle schema for runtime validation

### Design System

**Color Tokens**: CSS custom properties defined in `index.css` for light/dark mode support:
- Primary: Champagne gold (#D4AF37) for CTAs and highlights
- Secondary: Warm beige backgrounds
- Accent: Gold borders and active states
- Cards: Elevated white/beige with subtle shadows

**Typography Scale**: Responsive font sizes with mobile-first approach

**Spacing System**: Tailwind's 4px-based spacing scale (p-4, p-6, p-8, etc.)

**Component Variants**: Class Variance Authority (CVA) for button, badge, and alert variants

**Shadows**: Multi-level shadow system (shadow-xs, shadow-sm, shadow-lg, shadow-2xl)

### Type Safety

**Shared Types**: `/shared/schema.ts` exports TypeScript types used by both client and server

**Path Aliases**:
- `@/*` → `/client/src/*`
- `@shared/*` → `/shared/*`
- `@assets/*` → `/attached_assets/*`

**Strict Mode**: TypeScript strict mode enabled with ESNext modules

## External Dependencies

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL database (DATABASE_URL environment variable required)
- **Drizzle ORM** - Type-safe database toolkit with migrations in `/migrations`

### UI Libraries
- **Radix UI** - Headless accessible components (24+ primitive packages)
- **Tailwind CSS** - Utility-first CSS framework with custom configuration
- **Framer Motion** - Animation library for scroll effects and transitions
- **Lucide React** - Icon library

### Data Fetching
- **TanStack Query** - Server state management with automatic caching and refetching

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod resolver for React Hook Form

### Charts
- **Recharts** - Chart library for admin/vendor dashboards (bar charts, pie charts, line charts)

### Authentication & Security
- **bcrypt** - Password hashing (version 6.0.0)
- Session-based auth (no external auth provider currently integrated)

### Planned Integrations (Not Yet Implemented)
- **Clerk** - Email authentication (mentioned in requirements but not in current codebase)
- **Cloudinary** - Image CDN and upload service (mentioned in requirements)
- **Razorpay** - Payment gateway for order processing (mentioned in requirements)

### Build Tools
- **Vite** - Frontend build tool with React plugin
- **esbuild** - Server-side bundler for production
- **tsx** - TypeScript execution for development server
- **PostCSS** - CSS processing with Autoprefixer

### Development Tools
- **@replit/vite-plugin-runtime-error-modal** - Error overlay for Replit environment
- **@replit/vite-plugin-cartographer** - Replit integration
- **ws** - WebSocket library for Neon database connection