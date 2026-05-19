# Image Assets Directory

This directory contains all image assets used throughout the ResolveIt application.

## Current Status

✅ **Structure Complete**: All components now use centralized image imports from `index.js`
⚠️ **Placeholder URLs**: Currently using placeholder URLs - replace with actual images before final submission

## How to Add Images

### Step 1: Add Image Files
Place your image files in this directory (`src/assets/images/`)

### Step 2: Update index.js
Replace the placeholder URLs with actual imports:

**Before (placeholder):**
```javascript
export const heroElectrician = 'https://images.unsplash.com/...'
```

**After (actual image):**
```javascript
import heroElectricianImg from './hero-electrician.jpg'
export const heroElectrician = heroElectricianImg
```

### Step 3: Verify
- Run the app and check all images load correctly
- Ensure images are optimized (compressed, appropriate size)
- Test responsive behavior

## Image Requirements

### Recommended Specifications:
- **Format**: JPG or WebP (WebP preferred for better compression)
- **Hero Images**: 1200x800px, max 300KB
- **Service Cards**: 400x300px, max 100KB
- **Thumbnails**: 200x200px, max 50KB
- **Aspect Ratio**: Maintain 4:3 or 16:9 for consistency

### Optimization Tips:
- Use tools like TinyPNG or Squoosh to compress images
- Convert to WebP format when possible
- Remove EXIF data to reduce file size
- Use appropriate dimensions (don't use 2000px images for 400px displays)

## File Naming Convention

Follow the pattern: `{section}-{purpose}-{specific}.jpg`

Examples:
- `hero-electrician.jpg` - Landing page hero
- `service-plumbing.jpg` - Plumbing service image
- `admin-platform-overview.jpg` - Admin dashboard image

## Image List

See `IMAGE_AUDIT.md` for a complete list of all images used in the application.

## Quick Reference

All images are exported from `index.js`. Import them like this:

```javascript
import { 
  heroElectrician, 
  servicePlumbing, 
  serviceElectrician 
} from '../../assets/images'
```

Then use in JSX:
```jsx
<img src={heroElectrician} alt="Description" />
```

