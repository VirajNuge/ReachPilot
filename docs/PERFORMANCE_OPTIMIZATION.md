# ReachPilot Performance Optimization Guide

This document outlines the performance optimizations implemented and how to use them.

## Recent Optimizations (May 16, 2026)

### 1. **Bundle Analysis**
- Installed `@next/bundle-analyzer` for identifying code bloat
- Run the analyzer with:
  ```bash
  ANALYZE=true npm run build
  ```
- Results will be in `.next/analyze/` (interactive HTML treemap)

### 2. **Code Splitting & Lazy Loading**
- Created lazy-loading components for heavy libraries:
  - **`framer-motion`**: Animations now code-split via `LazyAnimatedContainer`
  - **`recharts`**: Charts now code-split via `LazyChart`, `LazyPieChart`, `LazyRadarChart`
- Admin pages and dashboard analytics will benefit from reduced initial JavaScript

**Where to apply lazy loading:**
- Admin pages: `/app/admin/**/*.tsx` (use `LazyAnimatedContainer` instead of direct `motion.*`)
- Dashboard/Analytics: `/app/pages/appPages/components/**/*.tsx` (use chart lazy components)

### 3. **Image & Asset Optimization**
- Enabled AVIF and WebP formats (Next.js auto-serves best format)
- Set 1-year cache TTL for immutable images
- Optimized device breakpoints for responsive images

### 4. **Build Optimizations**
- Disabled source maps in production (reduce bundle by ~5-10%)
- Enabled SWC minification (faster builds)
- Configured chunk hashing for long-term caching (better cache hits)
- On-demand entries: inactive pages unloaded after 1 minute

### 5. **Icon Optimization Recommendations**
- **Current state:** `lucide-react` (~15-20KB) and `react-icons` (~50-100KB) are bundled fully
- **Quick wins:**
  - Use tree-shaking: Ensure only needed icons are imported (already doing this)
  - Consider: Inline SVG for most-used icons (see example below)
  - Consider: Switch to `lucide-react` only (drop `react-icons` if not needed)

## Manual Migration Steps

### Example 1: Convert Admin Caption Templates to Use Lazy Animations

**Before:**
```tsx
import { AnimatePresence, motion } from "framer-motion";

export default function CaptionTemplates() {
  return (
    <AnimatePresence>
      {isOpen && <motion.div {...}>Content</motion.div>}
    </AnimatePresence>
  );
}
```

**After (with lazy loading):**
```tsx
import { LazyAnimatedContainer } from "@/lib/lazy-components";

export default function CaptionTemplates() {
  return <LazyAnimatedContainer isOpen={isOpen}>Content</LazyAnimatedContainer>;
}
```

### Example 2: Optimize Icon Usage

**Option A - Inline SVG (best for small set of icons):**
```tsx
// components/icons/ShieldIcon.tsx
export default function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// In pages: import { ShieldIcon } from "@/components/icons";
```

**Option B - Tree-shake lucide-react (current approach, already optimized):**
```tsx
// ✅ Good - imports only needed icons
import { Shield, Eye, EyeOff } from "lucide-react";

// ❌ Avoid - imports entire library
import * as Icons from "lucide-react";
```

## Metrics to Monitor

Run these commands to track improvements:

```bash
# Bundle size analysis
ANALYZE=true npm run build

# Production build size (check .next/static/)
npm run build

# Check .next/static/chunks/ for individual chunk sizes
ls -lah .next/static/chunks/
```

## Next Steps (Additional Optimizations)

1. **Audit heavy third-party dependencies:**
   - `puppeteer` (~100MB) - consider moving to API-only server-side
   - `fabric.js` (~500KB) - only load when needed (image editor)

2. **Implement compression at CDN level:**
   - Ensure Brotli/gzip is enabled on your hosting (Vercel does this by default)
   - Set cache headers: `Cache-Control: public, max-age=31536000, immutable` for static assets

3. **Consider alternative charting libraries:**
   - `recharts` is large; alternatives like `victory`, `plot.ly`, or lightweight alternatives might be better
   - Only lazy-load charts if they're not critical path

4. **Monitor Core Web Vitals:**
   - Track FCP (First Contentful Paint)
   - Track LCP (Largest Contentful Paint)
   - Use Vercel Analytics or Google Lighthouse

## Testing

After changes, run:

```bash
npm run build   # Check for build warnings
npm run dev     # Test locally with dev server
npm run start   # Test production build locally

# Lighthouse audit (via Chrome DevTools)
# F12 > Lighthouse > Analyze page load
```

---

**Questions?** Check the repository memory `/memories/repo/` for architecture notes.
