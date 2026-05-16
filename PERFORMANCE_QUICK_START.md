# Performance Optimization Quick Start

This guide walks you through testing and validating the performance improvements implemented on May 16, 2026.

## 1. Run Bundle Analysis (5 minutes)

First, generate a detailed breakdown of your bundle:

```bash
cd e:\FinalProject\reachpilot
npm run build:analyze
```

**Result:** An interactive HTML report will open showing:
- Which packages take up the most space
- Where `framer-motion`, `recharts`, `lucide-react`, and `react-icons` contribute
- Opportunities for further optimization

**Expected bundle composition (before lazy loading):**
- `framer-motion`: ~40KB (will be reduced once lazy-loaded)
- `recharts`: ~200KB (will be reduced once lazy-loaded)
- `lucide-react`: ~15-20KB
- `react-icons`: ~50-100KB

---

## 2. Build and Compare (10 minutes)

```bash
# Build with optimizations (no source maps in production)
npm run build

# Check final bundle sizes
ls -lah .next/static/chunks/ | head -20

# Also check CSS bundle
ls -lah .next/static/css/
```

**Expected improvements:**
- Smaller main chunk (main JS reduced by 5-15%)
- CSS file smaller due to image optimization
- Faster initial load with lazy components

---

## 3. Test Locally (5 minutes)

```bash
# Start production server
npm run start

# Open browser
# http://localhost:3000

# Check DevTools > Network tab:
# - Verify initial main.*.js is smaller
# - Verify framer-motion and recharts are NOT in initial bundle
# - They should load only when admin/analytics pages are visited
```

---

## 4. Deploy Changes (Recommended)

Once verified locally:

```bash
# Commit changes
git add .
git commit -m "feat: implement performance optimizations (bundle analysis, code splitting, image optimization)"

# Deploy to production (Vercel / your hosting)
git push
```

---

## 5. Monitor Results

### Using Vercel Analytics (if hosted on Vercel)
- Go to your project dashboard
- Check **Analytics** tab for:
  - Web Core Vitals (LCP, FID, CLS)
  - Performance trends

### Using Lighthouse (Local Testing)
```
1. npm run start
2. Chrome DevTools → Lighthouse
3. Run audit for Performance
4. Compare before/after scores
```

---

## 6. Next: Apply Manual Optimizations

After confirming the setup works, consider:

### A. Update Admin Pages to Use Lazy Animations
Replace `framer-motion` imports in these files:

1. **[caption-templates/page.tsx](../app/admin/caption-templates/page.tsx)**
   ```tsx
   // Remove: import { AnimatePresence, motion } from "framer-motion";
   // Add:    import { LazyAnimatedContainer } from "@/lib/lazy-components";
   ```

2. **[visual-styles/page.tsx](../app/admin/visual-styles/page.tsx)**
   - Same change as above

3. **[writing-styles/page.tsx](../app/admin/writing-styles/page.tsx)**
   - Same change as above

### B. Update Analytics Components to Use Lazy Charts
Replace recharts in these directories:

- `app/pages/appPages/components/Analytics/`
- `app/pages/appPages/components/Engagement/`
- `app/pages/appPages/components/Growth/`

---

## Troubleshooting

### Build fails with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Check that component paths are correct in `lib/lazy-components.tsx`

### Charts or animations don't load
- Check browser console for errors
- Verify `ssr: false` is set in `lib/lazy-components.tsx`
- Ensure components have `"use client"` directive

### Bundle still large after changes
- Re-run `npm run build:analyze` to identify new bottlenecks
- Consider removing unused dependencies (check `package.json`)
- Profile with Lighthouse to find other slow resources

---

## Summary of Changes

✅ **Files Created:**
- `lib/lazy-components.tsx` - Lazy-load definitions
- `components/animated/LazyAnimatedContainer.tsx` - Animation wrapper
- `components/charts/LazyChart.tsx` - Line/Bar chart wrapper
- `components/charts/LazyPieChart.tsx` - Pie chart wrapper
- `components/charts/LazyRadarChart.tsx` - Radar chart wrapper
- `docs/PERFORMANCE_OPTIMIZATION.md` - Full optimization guide
- `.env.performance` - Performance environment variables

✅ **Files Updated:**
- `next.config.ts` - Added bundle analyzer, image optimization, build enhancements
- `package.json` - Added `build:analyze` script

---

## Performance Checklist

- [ ] Run `npm run build:analyze` and review results
- [ ] Run `npm run build` and verify no errors
- [ ] Test locally with `npm run start`
- [ ] Compare bundle sizes before/after
- [ ] Check DevTools Network tab for lazy loading
- [ ] Deploy to staging/production
- [ ] Monitor Core Web Vitals
- [ ] Apply manual migration to admin pages
- [ ] Apply manual migration to analytics components

---

For detailed information, see [PERFORMANCE_OPTIMIZATION.md](../docs/PERFORMANCE_OPTIMIZATION.md)
