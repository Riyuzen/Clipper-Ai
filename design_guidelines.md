# Clipper AI Design Guidelines

## Design Approach
**System-Based Approach** using Material Design principles - optimized for utility-focused applications with strong visual feedback, data displays, and processing workflows.

## Design Principles
1. **Clarity in Process**: Users must always understand processing status
2. **Efficient Workflow**: Minimize steps from input to downloadable clips
3. **Content Priority**: Generated clips are the hero, not decorative elements
4. **Trustworthy Feedback**: Clear, honest progress indicators throughout

---

## Typography

**Font Family**: Inter via Google Fonts CDN
- Primary: Inter (400, 500, 600, 700)

**Hierarchy**:
- Page Title: text-4xl font-bold (Clipper AI branding)
- Section Headers: text-2xl font-semibold
- Clip Titles/Timestamps: text-base font-medium
- Body/Helper Text: text-sm font-normal
- Status Messages: text-sm font-medium
- Buttons: text-base font-semibold

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4, m-6 (component padding)
- Section spacing: py-8, py-12 (between major sections)
- Container padding: px-6, px-8

**Container Structure**:
- Max width: max-w-6xl mx-auto
- Page padding: px-6 lg:px-8
- Vertical rhythm: py-12 between major sections

---

## Core Layout Sections

### 1. Header
- Fixed top navigation bar
- Logo/branding left-aligned
- Optional account/settings icon right-aligned
- Height: h-16
- Bottom border for definition

### 2. Main Input Section
**Two-tab interface**: URL Input | File Upload

**URL Tab**:
- Large text input field with placeholder "Paste YouTube URL or video link..."
- Input height: h-12
- Full width with responsive constraints (max-w-2xl)
- "Generate Clips" primary button below (h-12, px-8)

**File Upload Tab**:
- Drag-and-drop zone (min-h-48)
- Dashed border with upload icon (use Heroicons)
- "Click to browse" text with file type hints (.mp4, .mov, .avi)
- Selected file preview with name, size, remove option
- "Generate Clips" button below when file selected

**Layout**: Centered, max-w-3xl, generous padding (py-16)

### 3. Processing Status Section
Appears after submission, replaces input section:

**Progress Indicator**:
- Large circular progress or linear progress bar
- Current step display with icons:
  - Downloading video
  - Extracting audio
  - Transcribing with AI
  - Detecting highlights
  - Generating clips
- Estimated time remaining
- Current step emphasized with different weight/size

**Layout**: Centered card, max-w-2xl, p-8

### 4. Results Grid Section
**Header**: 
- "Generated Clips" title (text-2xl)
- Clip count badge
- Bulk download all option (secondary button)

**Grid Layout**:
- Desktop: grid-cols-2 lg:grid-cols-3
- Tablet: grid-cols-2
- Mobile: grid-cols-1
- Gap: gap-6

**Clip Card Structure**:
Each card contains:
- Video player (aspect-video, w-full)
  - Native HTML5 controls
  - Poster frame from first frame
- Timestamp range badge (absolute top-right on video)
- Clip duration below video
- Download button (full width, h-10)

**Card Styling**:
- Rounded corners
- Border
- Padding: p-4
- Hover state with subtle shadow elevation

### 5. Empty/Error States
- Centered messaging with icon
- Clear action buttons to retry
- Helper text for common issues

---

## Component Library

### Buttons
**Primary**: 
- Height: h-12
- Padding: px-6
- Rounded: rounded-lg
- Font: font-semibold
- Full width on mobile, auto on desktop

**Secondary**:
- Same dimensions
- Outlined variant with border-2

**Icon Buttons**:
- Size: w-10 h-10
- Rounded: rounded-full
- Icon only, no text

### Input Fields
- Height: h-12
- Padding: px-4
- Rounded: rounded-lg
- Border: border-2
- Focus state with border emphasis

### Cards
- Padding: p-6
- Rounded: rounded-xl
- Border: border
- Shadow on hover: hover:shadow-lg transition

### Progress Indicators
- Linear: h-2, rounded-full
- Circular: w-16 h-16 for main loader
- Percentage text displayed

### Tabs
- Height: h-12
- Horizontal layout with border-bottom
- Active tab: border-b-4 with emphasis

---

## Icons
**Library**: Heroicons via CDN (outline style)
- Upload: cloud-arrow-up
- Download: arrow-down-tray
- Video: film
- Check: check-circle
- Error: exclamation-circle
- Loading: Use animated spinner component

---

## Responsive Behavior

**Mobile (< 768px)**:
- Single column layouts
- Full-width buttons
- Stacked input sections
- Single column clip grid

**Tablet (768px - 1024px)**:
- Two-column clip grid
- Maintained input constraints

**Desktop (> 1024px)**:
- Three-column clip grid
- Max-width containers prevent excessive spreading

---

## Animations
**Minimal, Purposeful Only**:
- Button hover: subtle scale (scale-105)
- Card hover: shadow transition
- Progress bar: smooth width transitions
- Tab switching: no animation, instant
- Loading spinner: rotate animation only

---

## Images
**No hero image required** - this is a utility-focused application.

**Image Usage**:
- Video thumbnails generated from first frame of clips
- Placeholder for empty states (illustration of upload concept)
- Error state illustrations (simple, flat style)

All images should be secondary to functionality - no decorative imagery.