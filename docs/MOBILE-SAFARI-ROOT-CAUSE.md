# Mobile Safari Root Cause Analysis

**Date:** February 8, 2026  
**Device Tested:** iPhone 15 Pro (iOS Safari)  
**URL:** https://mission-control-sigma-sand.vercel.app  
**Analyst:** Raj (QA)

---

## Executive Summary

After analyzing the codebase, I've identified **5 critical bugs** causing the reported iOS Safari issues. These stem from:
1. Missing iOS Safari viewport configuration
2. Incorrect z-index stacking contexts
3. Viewport unit issues (`100vh` vs `100dvh`)
4. Notification dropdown overflow on narrow screens
5. ScrollableRow z-index conflicts with interactive elements

---

## Bug #1: Notifications Panel Overlapping Main UI

### Symptoms
- NOTIFICATIONS dropdown appears over main content
- May overlap with agent pills and other elements
- z-index battles causing visual chaos

### Root Cause

**File:** `src/components/notifications/NotificationDropdown.tsx` (line 45)

```tsx
// CURRENT (BROKEN):
<div
  ref={ref}
  className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
>
```

**Problems:**
1. `w-80` = 320px fixed width on a 393px (iPhone 15 Pro) screen
2. `right-0` positions from the parent's right edge, but the parent is only a button
3. The dropdown can overflow the left edge of the viewport
4. No mobile-specific positioning or max-width constraint

**File:** `src/components/layout/TopBar.tsx` (line 105-121)

```tsx
// CURRENT: Parent container has no position constraints
<div className="relative">
  <button ...>🔔</button>
  {showNotifications && <NotificationDropdown ... />}
</div>
```

### Fix Required

```tsx
// NotificationDropdown.tsx line 45 - ADD mobile constraints:
<div
  ref={ref}
  className="absolute right-0 md:right-0 top-12 md:top-10 w-[calc(100vw-1rem)] md:w-80 max-w-80 -right-2 md:-right-0 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
>

// OR use fixed positioning on mobile:
className={`
  fixed md:absolute 
  inset-x-2 md:inset-x-auto md:right-0 
  top-16 md:top-10 
  md:w-80 
  bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden
`}
```

---

## Bug #2: Agent Pills in Wrong Location / z-index Issues

### Symptoms
- Agent cards appear visually misaligned
- Kebab menus may appear behind other elements
- Horizontal scroll feels "off"

### Root Cause

**File:** `src/components/agents/AgentPanel.tsx` (lines 31-47)

```tsx
// CURRENT (BROKEN):
<div className="flex-1 overflow-hidden">
  {/* Mobile: Horizontal scroll carousel */}
  <div className="md:hidden overflow-x-auto overflow-y-hidden h-full p-3 -mx-1">
    <div className="flex gap-3 h-full min-w-max px-1 snap-x snap-mandatory">
```

**Problems:**
1. `-mx-1` with `px-1` creates visual offset that can cause misalignment
2. `overflow-hidden` on parent clips absolutely positioned children (like kebab menus)
3. No `position: relative` establishing stacking context

**File:** `src/components/agents/AgentCard.tsx` (line 134)

```tsx
// CURRENT: Kebab menu uses z-50 but parent has no stacking context
<div className="absolute right-0 top-9 md:top-7 w-48 md:w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
```

### Fix Required

```tsx
// AgentPanel.tsx - Remove the broken margin hack and add isolation:
<div className="flex-1 overflow-hidden relative isolate">
  <div className="md:hidden overflow-x-auto overflow-y-hidden h-full p-3">
    <div className="flex gap-3 h-full min-w-max snap-x snap-mandatory overflow-visible">

// AgentCard.tsx - Change from absolute to fixed for mobile kebab menu:
<div className={`${showMenu ? 'fixed inset-0 z-40' : ''}`} onClick={() => setShowMenu(false)}>
  <div className="absolute right-0 top-9 md:top-7 w-48 md:w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1">
```

---

## Bug #3: Status Tabs Cut Off (Can't See Full Tab Names)

### Symptoms
- Mobile column tabs are truncated
- Can't see full status names
- Scroll indicators (fade gradients) may cover tab edges

### Root Cause

**File:** `src/components/ui/ScrollableRow.tsx` (lines 57-88)

```tsx
// CURRENT: Fade gradients have z-10, can overlay interactive content
<div 
  className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r ${fadeColor} to-transparent pointer-events-none z-10 ...`}
/>
```

**Problem:** The `z-10` gradients overlay the tabs. While `pointer-events-none` prevents blocking clicks, the visual overlay can obscure text at the edges.

**File:** `src/components/kanban/KanbanBoard.tsx` (lines 228-248)

```tsx
// CURRENT: Tabs using ScrollableRow but padding/width may be insufficient
<ScrollableRow className="pb-2" innerClassName="flex items-center gap-2 px-4">
  {COLUMN_ORDER.map((status, index) => (
    <button
      ...
      className="... whitespace-nowrap min-h-[44px] ..."
    >
      {COLUMN_LABELS[status]}  // <-- These labels might not have enough width
```

**Problems:**
1. `px-4` padding is eaten by the fade gradient width (`w-6` = 24px)
2. First and last tabs appear partially under the fade overlay
3. On iOS Safari, `scroll-snap-type` combined with `overflow-x-auto` can have quirky behavior

### Fix Required

```tsx
// ScrollableRow.tsx - Reduce gradient width and lower z-index:
<div 
  className={`absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r ${fadeColor} to-transparent pointer-events-none z-[1] ...`}
/>

// KanbanBoard.tsx - Add more padding to account for fade:
<ScrollableRow className="pb-2" innerClassName="flex items-center gap-2 px-6">

// Also add scroll-padding for snap positioning:
// In ScrollableRow.tsx, add to scrollable div:
style={{ 
  WebkitOverflowScrolling: 'touch',
  touchAction: 'pan-x',
  scrollPaddingInline: '1.5rem',  // ADD THIS
}}
```

---

## Bug #4: iOS Safari Viewport Issues (100vh Problem)

### Symptoms
- Content cut off at bottom
- Bottom nav overlaps content
- Layout shifts when address bar shows/hides

### Root Cause

**File:** `index.html` (line 4)

```html
<!-- CURRENT (BROKEN): Missing viewport-fit=cover -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**File:** `src/index.css` (lines 24-26)

```css
/* CURRENT: Uses 100vh which is BROKEN on iOS Safari */
body {
  min-height: 100vh;
}
```

**File:** `src/App.tsx` (line 29)

```tsx
// CURRENT: h-screen = 100vh, broken on iOS Safari
<div className="h-screen flex flex-col overflow-hidden">
```

**The Problem:** On iOS Safari, `100vh` equals the **maximum** viewport height (when address bar is hidden), not the **current** visible height. This causes:
1. Content extending behind the address bar
2. Bottom elements being cut off when address bar is visible
3. Layout jumps as address bar animates

### Fix Required

**index.html:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**src/index.css - Add at top:**
```css
/* iOS Safari viewport fix */
:root {
  --app-height: 100vh;
  --app-height: 100dvh; /* Dynamic viewport height - Safari 15.4+ */
}

@supports not (height: 100dvh) {
  :root {
    --app-height: calc(100vh - env(safe-area-inset-bottom));
  }
}

body {
  min-height: var(--app-height);
}
```

**src/App.tsx line 29:**
```tsx
// Change from h-screen to explicit height variable
<div className="h-[100dvh] flex flex-col overflow-hidden" 
     style={{ height: 'var(--app-height, 100dvh)' }}>
```

---

## Bug #5: Missing iOS Safari CSS Prefixes

### Symptoms
- Smooth scrolling feels janky
- Touch interactions feel unnatural
- Momentum scrolling doesn't work

### Root Cause

**File:** `src/index.css` - Several places missing `-webkit-` prefixes

```css
/* CURRENT: Some prefixes exist but not consistently applied */
.hide-scrollbar {
  -webkit-transform: translateZ(0);  /* Good */
  transform: translateZ(0);
}

/* MISSING: For overscroll-behavior */
.overscroll-contain {
  overscroll-behavior: contain;
  /* MISSING: -webkit-overflow-scrolling: touch; in all scroll containers */
}
```

**File:** `src/components/kanban/KanbanBoard.tsx` (line 279)

```tsx
// CURRENT: Missing webkit prefix for scroll snapping
className="md:hidden flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
```

### Fix Required

**src/index.css - Add Safari-specific scroll fixes:**

```css
/* Add after line 66 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  -webkit-scroll-behavior: smooth;
}

/* Add for snap scrolling */
.snap-x {
  scroll-snap-type: x mandatory;
  -webkit-scroll-snap-type: x mandatory;
}

/* Prevent rubber-banding on horizontal scroll */
.overscroll-x-contain {
  overscroll-behavior-x: contain;
  -ms-scroll-chaining: none;
}
```

---

## Summary: Files to Modify

| File | Line(s) | Issue |
|------|---------|-------|
| `index.html` | 4 | Add `viewport-fit=cover` |
| `src/index.css` | 24-26 | Use `100dvh` instead of `100vh` |
| `src/index.css` | 57-70 | Add webkit prefixes for scrolling |
| `src/App.tsx` | 29 | Use dynamic viewport height |
| `src/components/notifications/NotificationDropdown.tsx` | 45 | Fix mobile positioning/overflow |
| `src/components/agents/AgentPanel.tsx` | 31-47 | Remove margin hack, add isolation |
| `src/components/agents/AgentCard.tsx` | 134 | Fix kebab menu z-index/positioning |
| `src/components/ui/ScrollableRow.tsx` | 57-88 | Reduce fade width, add scroll-padding |
| `src/components/kanban/KanbanBoard.tsx` | 228-248 | Increase padding for tabs |

---

## Testing Checklist

After fixes, verify on iPhone 15 Pro (iOS Safari):

- [ ] Notification dropdown doesn't overflow screen edges
- [ ] Agent pills scroll smoothly, no visual offset
- [ ] Kebab menus appear above all other content
- [ ] All status tab names fully visible
- [ ] Swiping between columns works smoothly
- [ ] No content cut off at bottom
- [ ] Address bar show/hide doesn't break layout
- [ ] Bottom nav has proper safe area spacing
- [ ] No z-index conflicts between dropdowns/modals

---

## Priority Order

1. **P0 (Critical):** Bugs #1 and #4 - Notifications and viewport (most visible, breaks usability)
2. **P1 (High):** Bug #3 - Status tabs (impacts navigation)
3. **P2 (Medium):** Bug #2 - Agent pills (visual issue)
4. **P3 (Low):** Bug #5 - Webkit prefixes (polish/feel)
