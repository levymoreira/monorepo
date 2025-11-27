# Authentication & Authorization System Fix Plan
## AutomaPost Security & UX Improvements

### Overview
This document outlines the tasks needed to fix critical authentication issues in AutomaPost, including the onboarding infinite redirect loop and session validation gaps in the /api/me endpoint.

## IMPLEMENTATION STATUS: ✅ COMPLETED (Phase 1 & 2)

### Changes Implemented (2025-09-03)

#### ✅ Task 1: Fixed Onboarding Infinite Redirect Loop
- **File**: `app/[locale]/onboarding/onboarding-wrapper.tsx`
- Added `searchParams` to OnboardingWrapper props
- Implemented `force` parameter to bypass auto-redirects
- Fixed the conditional logic to prevent same-step redirects

#### ✅ Task 2: Added Database Session Validation to /api/me
- **File**: `lib/auth/session.ts`
- Created `validateSessionInDb()` function for secure session validation
- **File**: `app/api/auth/me/route.ts`  
- Added session ID header check
- Implemented database session validation before returning user data
- Returns 401 when session is expired or revoked

#### ✅ Task 3: Enhanced Middleware Session Validation
- **File**: `middleware.ts`
- Added database session validation for all protected routes
- Validates both JWT signature AND database session existence
- Proper error messages for expired sessions

#### ✅ Task 4: Implemented Session Activity Updates
- **File**: `lib/auth/session.ts`
- Added throttled activity updates (max once per minute)
- **File**: `middleware.ts`
- Enabled activity tracking in session validation calls

#### ✅ Task 5: Fixed OAuth State Validation
- **File**: `app/api/auth/[provider]/callback/route.ts`
- Removed development bypasses for state validation
- Implemented strict CSRF protection
- Added security event logging for state mismatches

#### ✅ Task 6: Consolidated Authentication State
- **File**: `app/api/onboarding/complete/route.ts`
- Removed legacy `user_id` cookie fallback
- **File**: `app/[locale]/onboarding/onboarding-wrapper.tsx`
- Removed legacy cookie authentication
- Standardized on JWT + session validation

---

## 🔴 CRITICAL ISSUES (Priority 1 - Immediate)

### Task 1: Fix Onboarding Infinite Redirect Loop
**Issue**: Users with LinkedIn connected get stuck in infinite redirect on onboarding  
**Location**: `app/[locale]/onboarding/onboarding-wrapper.tsx`

#### Subtasks:
- [ ] 1.1 Add current step context check before redirecting
- [ ] 1.2 Implement guard clause to prevent same-step redirects
- [ ] 1.3 Add `force` parameter support to override auto-redirects
- [ ] 1.4 Test all onboarding flows (new user, returning user, LinkedIn connected)

**Fix Implementation**:
```typescript
// Before redirect logic, check current step
const currentStep = searchParams.get('step') || '1'
if (currentStep === '1' && hasLinkedIn && !searchParams.get('force')) {
  redirect(`/${locale}/onboarding?step=2`)
}
```

### Task 2: Add Database Session Validation to /api/me
**Issue**: API doesn't validate if session exists in database, only JWT validity  
**Location**: `app/api/auth/me/route.ts` and `middleware.ts`

#### Subtasks:
- [ ] 2.1 Create `validateSessionInDb` utility function
- [ ] 2.2 Modify middleware to check session existence
- [ ] 2.3 Update /api/me to return 401 when session invalid
- [ ] 2.4 Add proper error handling and logging
- [ ] 2.5 Test session revocation scenarios

**Implementation Points**:
- Check session exists in database
- Verify session not expired
- Validate session not revoked
- Return appropriate HTTP status codes

---

## 🟡 MEDIUM PRIORITY (Priority 2 - This Week)

### Task 3: Enhance Middleware Session Validation
**Issue**: Middleware only validates JWT signature, not database session  
**Location**: `middleware.ts`

#### Subtasks:
- [ ] 3.1 Add database session check after JWT validation
- [ ] 3.3 Add session activity tracking
- [ ] 3.4 Handle edge cases (expired token, revoked session)
- [ ] 3.5 Add performance monitoring

### Task 4: Consolidate Authentication State
**Issue**: Multiple auth systems running in parallel causing inconsistencies  
**Locations**: Multiple files using different auth methods

#### Subtasks:
- [ ] 4.1 Audit all authentication checks in codebase
- [ ] 4.2 Remove legacy `user_id` cookie dependencies
- [ ] 4.3 Standardize on JWT + session validation
- [ ] 4.4 Update all API endpoints to use consistent auth
- [ ] 4.5 Migrate existing sessions if needed

### Task 5: Fix OAuth State Validation
**Issue**: CSRF protection bypassed in development  
**Location**: `app/api/auth/[provider]/callback/route.ts`

#### Subtasks:
- [ ] 5.1 Remove development bypass for state validation
- [ ] 5.2 Implement proper state parameter generation
- [ ] 5.3 Add state expiration (5-10 minutes)
- [ ] 5.4 Log security events for monitoring
- [ ] 5.5 Test OAuth flows thoroughly

### Task 6: Implement Session Activity Updates
**Issue**: `lastActivityAt` not updated on every request  
**Location**: `lib/auth/session.ts`

#### Subtasks:
- [ ] 6.1 Update session activity in middleware


## Implementation Order

### Phase 1 (Immediate - Day 1)
1. **Task 1**: Fix onboarding redirect loop ⏱️ 2 hours
2. **Task 2**: Add session validation to /api/me ⏱️ 3 hours

### Phase 2 (This Week - Days 2-3)
3. **Task 3**: Enhance middleware validation ⏱️ 4 hours
4. **Task 6**: Implement session activity updates ⏱️ 2 hours
5. **Task 5**: Fix OAuth state validation ⏱️ 3 hours

### Phase 3 (Next Week - Days 4-7)
6. **Task 4**: Consolidate authentication state ⏱️ 6 hours


---

## Testing Checklist

### Authentication Flows
- [ ] New user registration
- [ ] LinkedIn OAuth login
- [ ] Token refresh flow
- [ ] Session expiration
- [ ] Logout (single device)
- [ ] Logout (all devices)

### Edge Cases
- [ ] Expired JWT with valid session
- [ ] Valid JWT with expired session
- [ ] Revoked session access attempt
- [ ] Concurrent login attempts
- [ ] Max sessions reached
- [ ] OAuth state mismatch

### Security Tests
- [ ] CSRF attack simulation
- [ ] Session fixation test
- [ ] Token replay attack
- [ ] Brute force protection
- [ ] SQL injection attempts

---

---

## Notes

### Dependencies
- Database access for session validation

