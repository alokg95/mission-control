# Mobile Safari Bug Report

**Device:** iPhone 15 Pro  
**Browser:** iOS Safari  
**URL:** https://mission-control-sigma-sand.vercel.app  
**Date:** February 8, 2026  
**Reporter:** PM (via Alok's testing)

---

## Summary

Mobile Safari testing revealed critical layout and UX issues. The current responsive implementation has significant problems on iOS Safari that make the app difficult to use on iPhone.

---

## P0 — Blocking Issues

### P0-MS-001: Notification Dropdown Overlaps Main Content

**Description:**  
When the notification bell is tapped, the `NotificationDropdown` component appears but interferes with/overlaps the main content area. On mobile Safari, the dropdown doesn't respect viewport boundaries properly.

**Root Cause (Likely):**  
- `NotificationDropdown.tsx` uses `absolute right-0 top-10 w-80` without mobile-specific positioning
- Fixed width of `w-80` (320px) is too wide for iPhone viewport when combined with right positioning
- No mobile-specific layout (should be full-width sheet from bottom on mobile)

**Location:** `src/components/notifications/NotificationDropdown.tsx`

**Acceptance Criteria:**
1. On mobile (`md:` breakpoint down), notification dropdown should render as a full-width bottom sheet
2. Bottom sheet should animate up with `modal-slide-up` animation (already exists in CSS)
3. Bottom sheet should respect safe-area-inset-bottom
4. Tapping outside or the ✕ button should close the sheet
5. Content should not overlap with TopBar or bottom navigation

**Suggested Fix:**
```tsx
// Mobile: Full-width bottom sheet
// Desktop: Keep existing dropdown
<div className="fixed md:absolute inset-x-0 md:inset-x-auto md:right-0 bottom-0 md:bottom-auto md:top-10 
  w-full md:w-80 bg-white rounded-t-xl md:rounded-xl shadow-2xl border border-gray-100 z-50 
  safe-area-bottom modal-slide-up md:animate-none max-h-[70vh] md:max-h-80">
```

---

### P0-MS-002: Agent Filter Pills Positioned in Notifications Area

**Description:**  
The agent filter pills (Alo, Dev, Raj, PM, Donna) in the KanbanBoard filter bar appear to visually merge with or appear in the notification dropdown area. This creates confusion about what UI elements belong where.

**Root Cause (Likely):**
- Z-index stacking context issues between filter bar and notification dropdown
- Both use `z-50` or similar z-index values
- `ScrollableRow` fade gradients (`z-10`) may interact poorly with notification dropdown (`z-50`)

**Location:** 
- `src/components/kanban/KanbanBoard.tsx` (filter bar)
- `src/components/ui/ScrollableRow.tsx` (fade gradients)
- `src/components/notifications/NotificationDropdown.tsx`

**Acceptance Criteria:**
1. Filter pills must always appear below any open dropdowns/modals
2. Clear visual separation between TopBar (with notifications) and main content area
3. Add a subtle separator line or increased spacing below TopBar on mobile
4. Notification dropdown z-index must be higher than all main content

**Suggested Fix:**
- Ensure TopBar has explicit `z-40` or higher
- Notification dropdown should be `z-[100]` (above everything)
- Main content area should have `z-0` or `z-10` max
- Add backdrop overlay when notification dropdown is open on mobile

---

### P0-MS-003: Status Tabs Cut Off ("REVIEW" Truncated)

**Description:**  
The mobile column tabs (INBOX, ASSIGNED, IN PROGRESS, REV...) are horizontally scrollable but "REVIEW" text is cut off and not fully visible. Users cannot read full tab names.

**Root Cause (Likely):**
- The `ScrollableRow` wrapper's padding/margin doesn't account for the last item needing extra space
- Right padding is consumed by the fade gradient (`w-6` = 24px) but content extends to edge
- `whitespace-nowrap` prevents wrapping but container doesn't provide enough end-padding

**Location:** `src/components/kanban/KanbanBoard.tsx` lines 121-140 (mobile column tabs)

**Acceptance Criteria:**
1. All tab labels must be fully visible and readable
2. Horizontal scroll should allow scrolling to see the complete rightmost tab
3. Add right padding at end of scrollable content (at least 16px after last item)
4. The REVIEW and DONE tabs must be fully accessible

**Suggested Fix:**
```tsx
// In the mobile column tabs ScrollableRow:
<ScrollableRow className="pb-2" innerClassName="flex items-center gap-2 px-4 pr-8">
  {/* Add pr-8 to ensure extra padding at end for scroll */}
```

Or add a spacer element at the end:
```tsx
{COLUMN_ORDER.map(...)}
<div className="w-4 shrink-0" aria-hidden="true" /> {/* End spacer */}
```

---

## P1 — Major UX Issues

### P1-MS-001: Overall Layout Cramped and Overlapping

**Description:**  
The general layout feels cramped on iPhone 15 Pro. Elements are too close together, especially:
- TopBar stats vs action buttons
- Filter bar vs content below
- Cards within columns

**Root Cause:**
- Mobile breakpoints may need finer-grained control (use `sm:` for phones, `md:` for tablets)
- Padding values optimized for desktop don't scale well
- `min-h-[44px]` tap targets add height without appropriate spacing

**Location:** Multiple components

**Acceptance Criteria:**
1. Increase vertical spacing between TopBar and main content (add `mt-2` or separator)
2. Add `pb-3` to filter bar section for breathing room
3. Consider hiding stats section on mobile and showing only essential controls
4. Ensure minimum 8px gap between interactive elements

---

### P1-MS-002: Safe Area Insets Not Fully Applied

**Description:**  
The `safe-area-bottom` class exists but may not be correctly applied to all relevant elements. On iPhone with notch/Dynamic Island, content might be cut off or too close to edges.

**Root Cause:**
- `safe-area-top` class exists in CSS but not applied to TopBar
- Bottom nav has `safe-area-bottom` but main content doesn't account for bottom nav height + safe area

**Location:** 
- `src/App.tsx` (main container)
- `src/components/layout/TopBar.tsx`
- `src/index.css`

**Acceptance Criteria:**
1. TopBar must apply `safe-area-top` class
2. Main content area's `pb-16` needs to be `pb-16 safe-area-bottom` equivalent
3. Verify on iPhone 15 Pro (Dynamic Island) that no content is obscured
4. Test in both portrait and landscape orientations

**Suggested Fix in TopBar.tsx:**
```tsx
<header className="h-14 md:h-14 bg-white/80 backdrop-blur-sm border-b border-brand-teal-light 
  flex items-center justify-between px-3 md:px-6 shrink-0 safe-area-top pt-[env(safe-area-inset-top)]">
```

---

### P1-MS-003: Bottom Navigation Conflicts with Content

**Description:**  
The fixed bottom navigation (`h-16` + safe area) occupies space, but scrollable content doesn't always respect this. Long task lists may have their last items partially hidden.

**Root Cause:**
- `pb-16` on main content div should be `pb-20` or dynamically calculated
- Mobile column swipe view may not have correct bottom padding

**Location:** 
- `src/App.tsx` (main flex container)
- `src/components/kanban/KanbanColumn.tsx` (mobile cards)

**Acceptance Criteria:**
1. Last task card in any column should be fully visible and tappable
2. Add extra bottom padding (recommend `pb-24`) to column scroll areas on mobile
3. Test with 10+ tasks in a column to verify scroll reaches bottom

---

### P1-MS-004: Horizontal Scroll Indicators Not Obvious

**Description:**  
Users may not realize that filter pills and column tabs are horizontally scrollable. The fade gradients are subtle and may not provide sufficient affordance on iOS Safari.

**Root Cause:**
- Fade gradients from `ScrollableRow` use `from-brand-mint` which is light and subtle
- iOS Safari's scrollbar is completely hidden (by design) but provides no alternative affordance

**Location:** `src/components/ui/ScrollableRow.tsx`

**Acceptance Criteria:**
1. Make fade gradients more prominent on mobile (darker/more visible)
2. Consider adding small arrow indicators at fade edges
3. Alternatively, add horizontal scroll hint animation on first render

---

### P1-MS-005: Touch Target Spacing Too Tight

**Description:**  
While tap targets are 44px minimum (per Apple HIG), they're packed too close together. Adjacent tap targets should have 8px minimum spacing.

**Root Cause:**
- `gap-2` (8px) used for most filters but actual visual gap is less due to padding
- Stats section in TopBar has elements too close on small phones

**Location:** Multiple components (TopBar, filter bars)

**Acceptance Criteria:**
1. Audit all touch targets for 44x44 minimum size ✓ (already done)
2. Ensure minimum 8px gap between adjacent tap targets
3. Test all buttons are easily tappable without accidental adjacent taps

---

## P2 — Minor Polish

### P2-MS-001: Clock Hidden on Mobile But Space Wasted

**Description:**  
The clock is hidden on mobile (`hidden md:block`) but the connection status badge is still shown. The TopBar right side could be better balanced.

**Acceptance Criteria:**
1. Consider showing a compact time (HH:MM) on mobile, or
2. Redistribute TopBar elements for better mobile balance
3. Low priority, current state is acceptable

---

### P2-MS-002: Stats Text Truncation

**Description:**  
"Agents Active" becomes "Active" and "Tasks in Queue" becomes "Queue" on mobile. This is intentional but could be clearer.

**Acceptance Criteria:**
1. Verify the abbreviated labels are understandable
2. Consider icon-only stats on very small screens
3. Low priority, current responsive text is acceptable

---

### P2-MS-003: Agent Panel Mobile Horizontal Scroll

**Description:**  
When viewing Agents tab, the horizontal scroll works but cards snap in a way that might cut off the rightmost card slightly.

**Acceptance Criteria:**
1. Verify all agent cards are fully visible when scrolled
2. Add end padding similar to P0-MS-003 fix
3. Test snap points align with card edges

---

## Testing Checklist for Dev

After implementing fixes, verify on iPhone 15 Pro (iOS Safari):

- [ ] **P0-MS-001**: Notification opens as bottom sheet, closes properly, no overlap
- [ ] **P0-MS-002**: Filter pills clearly below TopBar, no z-index conflicts
- [ ] **P0-MS-003**: All status tabs readable, can scroll to DONE
- [ ] **P1-MS-001**: Adequate spacing throughout UI
- [ ] **P1-MS-002**: Safe areas respected (top Dynamic Island, bottom home indicator)
- [ ] **P1-MS-003**: Can scroll to and tap last task in any long list
- [ ] **P1-MS-004**: Scroll affordance is visible/obvious
- [ ] **P1-MS-005**: All buttons tappable without accidental adjacent taps
- [ ] **Landscape**: Test landscape orientation (should still work)
- [ ] **Dark mode**: If applicable, test appearance
- [ ] **Pull-to-refresh**: Test that pull-to-refresh doesn't trigger accidentally

---

## Notes

- iPhone 15 Pro has 6.1" display, 393x852 viewport
- Dynamic Island creates unique safe-area requirements
- iOS Safari has specific quirks with `position: fixed` and transforms
- Test on physical device — simulators may not catch all issues

---

*Document created by PM agent for Dev to implement fixes.*
