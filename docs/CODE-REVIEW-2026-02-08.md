# Code Review: Mission Control
**Date:** 2026-02-08  
**Reviewer:** Dev  
**Framework:** Planning Playbook 4-Part Review

---

## Executive Summary

Applied the 4-part review framework (Architecture, Code Quality, Tests, Performance) to Mission Control. Found **8 issues** across categories, all fixed in this commit.

### Issues Fixed:
1. ✅ ConvexReactClient created inside render (memory leak risk)
2. ✅ DRY: Level variants map duplicated (2 files)
3. ✅ DRY: Focus trap logic duplicated (3 modals)
4. ✅ DRY: Status color styling duplicated (2 files)
5. ✅ Zero test coverage
6. ✅ HTTP activity endpoint fetches all agents (N+1)
7. ✅ Activities query fetches all then filters client-side
8. ✅ Missing agent lookup index for name search

---

## 1. Architecture Review

### Issue #1: ConvexReactClient Created in Render Function
**File:** `src/main.tsx:14-17`  
**Severity:** Medium

The `ConvexReactClient` is created inside the `Root()` component, meaning a new client is created on every render.

**Fix:** Move client creation outside the component.

### Issue #2: Overall Architecture Assessment
**Status:** ✅ Good

- Clean separation between Convex backend and React frontend
- Dual-mode store pattern (mock/Convex) is well-implemented
- Component boundaries are appropriate (panels, modals, cards)
- Data flow is unidirectional via Convex reactivity

---

## 2. Code Quality Review

### Issue #3: DRY Violation - Level Variants Map
**Files:** `AgentCard.tsx:17-21`, `AgentDetailPanel.tsx:16-20`  
**Severity:** Low

Identical `levelVariants` map defined in two places.

**Fix:** Extract to `src/types.ts`.

### Issue #4: DRY Violation - Focus Trap Logic
**Files:** `TaskDetailModal.tsx:33-52`, `CreateTaskModal.tsx:24-43`, `BlockedReasonModal.tsx:18-23`  
**Severity:** Medium

Focus trap and Escape-to-close logic repeated in all 3 modals.

**Fix:** Extract to `src/lib/use-modal-keyboard.ts` hook.

### Issue #5: DRY Violation - Status Color Styling
**Files:** `AgentCard.tsx:79-84`, `AgentDetailPanel.tsx:59-65`  
**Severity:** Low

Inline status color logic duplicated.

**Fix:** Add `getStatusColor()` helper to `src/types.ts`.

---

## 3. Test Review

### Issue #6: Zero Test Coverage
**Severity:** High

No test files exist in the project. Critical areas needing tests:
- Task state machine transitions
- Mention parsing
- Utility functions (timeAgo, etc.)
- Store mutations

**Fix:** Add comprehensive test suite covering:
- `task-state-machine.test.ts`
- `mention-parser.test.ts`
- `utils.test.ts`

---

## 4. Performance Review

### Issue #7: HTTP Activity Endpoint N+1
**File:** `convex/http.ts:63-66`  
**Severity:** Medium

Fetches ALL agents to find one by name. With many agents, this is wasteful.

**Fix:** Add index on agent name in schema, use indexed query.

### Issue #8: Client-Side Activity Filtering
**File:** `convex/activities.ts:8-15`  
**Severity:** Low

Fetches all activities, then filters client-side. For large datasets this is inefficient.

**Fix:** Add index on `type` field, filter in query.

---

## Implementation Summary

| File | Change |
|------|--------|
| `src/main.tsx` | Move ConvexReactClient outside component |
| `src/types.ts` | Add `LEVEL_VARIANTS`, `getStatusColor()` |
| `src/lib/use-modal-keyboard.ts` | New hook for focus trap/escape |
| `src/lib/task-state-machine.test.ts` | New test file |
| `src/lib/mention-parser.test.ts` | New test file |
| `src/lib/utils.test.ts` | New test file |
| `convex/schema.ts` | Add `by_name` index on agents, `by_type` on activities |
| `convex/agents.ts` | Add `getByName` query |
| `convex/activities.ts` | Use index for filtering |
| `convex/http.ts` | Use indexed agent lookup |
| Modal components | Use new keyboard hook |
| Agent components | Use extracted constants |

---

## Testing Notes

After fixes, run:
```bash
npm test
```

All new tests should pass. Manual testing recommended for:
- Drag-drop task transitions
- Modal keyboard navigation
- Activity feed filtering
