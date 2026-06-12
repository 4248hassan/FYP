# ResolveIt - Critical Issues Quick Reference

## 🔴 CRITICAL BUGS (Fix Immediately)

### 1. Booking Creation Will Fail
**File**: [backend/src/controllers/bookingController.js](backend/src/controllers/bookingController.js#L8)
**Error**: References `service.price` but model has `basePrice`
```javascript
// ❌ WRONG (Line 8):
const escrowAmount = service.price;

// ✅ FIX:
const escrowAmount = service.basePrice;
```
**Impact**: All booking attempts will crash
**Status**: MUST FIX TODAY

---

### 2. Vendor Job List Endpoints Don't Exist
**Frontend calling**: `GET /vendor/jobs` 
**Backend providing**: `GET /vendor/requests`
**Affected Files**:
- [JobList.jsx:21](frontend/src/pages/vendor/JobList.jsx#L21)
- [JobDetail.jsx:27](frontend/src/pages/vendor/JobDetail.jsx#L27)  
- [Dashboard.jsx:17](frontend/src/pages/vendor/Dashboard.jsx#L17)
- [Profile.jsx:22](frontend/src/pages/vendor/Profile.jsx#L22)

**Fix Options**:
```
Option A: Rename backend endpoint /vendor/requests → /vendor/jobs (easier)
Option B: Update 4 frontend files to use /vendor/requests (better long-term)
```
**Status**: MUST FIX (Vendor dashboard broken)

---

### 3. Job Acceptance & Proof Upload Endpoints Missing
**Frontend calls**:
- `POST /vendor/jobs/{id}/accept` → ❌ Doesn't exist
- `POST /vendor/jobs/{id}/proof` → ❌ Doesn't exist (requires ProofOfWork model)

**Files**:
- [JobDetail.jsx:55](frontend/src/pages/vendor/JobDetail.jsx#L55) - accept job
- [JobDetail.jsx:78](frontend/src/pages/vendor/JobDetail.jsx#L78) - submit proof

**What Backend Actually Provides**:
- `POST /vendor/requests/{id}/respond { action: 'accept'|'reject' }`
- `POST /vendor/work/{id}/status { status: 'in_progress'|'completed' }`

**Missing**: Proof submission endpoint (no ProofOfWork model)
**Status**: MUST IMPLEMENT (Job completion workflow broken)

---

### 4. Escrow Release Not Implemented
**File**: [backend/src/routes/admin.js](backend/src/routes/admin.js#L15)
**Route exists**: `POST /admin/escrows/:id/release`
**Controller method**: ❌ MISSING from [adminController.js](backend/src/controllers/adminController.js)

**Impact**: Admin cannot release escrow payments
**Status**: IMPLEMENT ASAP

---

## 🟡 HIGH PRIORITY ISSUES

### 5. Chat System Completely Hardcoded
**File**: [frontend/src/pages/customer/Chat.jsx](frontend/src/pages/customer/Chat.jsx)
**Status**: HARDCODED - No backend integration
```javascript
// Lines 3-12: Hardcoded messages
const MESSAGES = [
  { id: 1, from: 'customer', text: 'Hi, I submitted a complaint...', time: '09:15' },
  { id: 2, from: 'vendor', text: 'Hi! I saw your complaint...', time: '09:18' },
  { id: 3, from: 'customer', text: 'That works for me, thank you.', time: '09:20' },
]
```
**Required Backend**: 
- Chat model
- Chat routes
- Chat controller
**Status**: NOT IMPLEMENTED

---

### 6. ProofOfWork Model Missing
**Why it matters**: Vendors cannot submit proof of work
**Frontend**: [JobDetail.jsx:78](frontend/src/pages/vendor/JobDetail.jsx#L78) attempts to call it
**Backend**: No model, route, or controller

**What's Needed**:
```
✅ Model: Create backend/src/models/ProofOfWork.js
✅ Route: Add POST /vendor/jobs/{id}/proof
✅ Controller: Create submitProof() method
```
**Status**: MISSING - Essential for vendor workflow

---

### 7. Complaint Model Has Duplicate Fields
**File**: [backend/src/models/Complaint.js](backend/src/models/Complaint.js)
**Issue**: Both `user` and `userId` reference User - redundant
```javascript
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
```
**Controller confusion**: Uses both in queries
**Fix**: Remove `userId`, keep only `user`
**Status**: SHOULD CLEAN UP

---

## 🟠 MEDIUM PRIORITY ISSUES

### 8. No Payment Model
**Current**: Only EscrowPayment exists (booking-specific)
**Missing**: General Payment model for all transactions
**Status**: NICE TO HAVE

---

### 9. Chat Integration Status
| Component | Status |
|-----------|--------|
| Chat Model | ❌ Missing |
| Chat Routes | ❌ Missing |
| Chat Controller | ❌ Missing |
| Chat Frontend | ❌ Hardcoded |
| Real-time Messaging | ❌ No WebSocket |

---

## 📊 API Endpoint Status Summary

### ✅ WORKING (19 calls)
- Auth (login, register)
- Users (profile, password)
- Services (list, create, get)
- Orders (create, list, update, get)
- Admin stats, users, vendors, complaints
- Bookings list
- Complaints (create, list, get)

### ❌ BROKEN (15 calls)
- Vendor jobs listing (4 files call this)
- Vendor job acceptance
- Vendor job proof submission
- Chat endpoints (completely hardcoded)

---

## 🛠️ Quick Fix Checklist

### TODAY (1-2 hours)
- [ ] Fix `service.price` → `service.basePrice`
- [ ] Implement `releaseEscrow()` method
- [ ] Map `/vendor/jobs` endpoint (or update frontend calls)

### THIS WEEK (4-6 hours)
- [ ] Create ProofOfWork model
- [ ] Add proof submission endpoints
- [ ] Fix vendor job acceptance flow
- [ ] Clean up Complaint duplicate fields

### NEXT WEEK (8-12 hours)
- [ ] Implement Chat model + routes + controller
- [ ] Remove hardcoded Chat messages
- [ ] Integrate real-time messaging
- [ ] Add Payment model

---

## 📁 Files That Need Changes

### Backend Changes Required
1. [backend/src/controllers/bookingController.js](backend/src/controllers/bookingController.js) - Fix line 8
2. [backend/src/controllers/adminController.js](backend/src/controllers/adminController.js) - Add releaseEscrow()
3. [backend/src/controllers/vendorController.js](backend/src/controllers/vendorController.js) - Add acceptJob()
4. [backend/src/models/Complaint.js](backend/src/models/Complaint.js) - Remove userId field
5. **NEW**: [backend/src/models/ProofOfWork.js](backend/src/models/ProofOfWork.js)
6. **NEW**: [backend/src/models/Chat.js](backend/src/models/Chat.js)

### Frontend Changes Required
1. [frontend/src/pages/vendor/JobList.jsx](frontend/src/pages/vendor/JobList.jsx) - Update endpoint
2. [frontend/src/pages/vendor/JobDetail.jsx](frontend/src/pages/vendor/JobDetail.jsx) - Update endpoints
3. [frontend/src/pages/vendor/Dashboard.jsx](frontend/src/pages/vendor/Dashboard.jsx) - Update endpoint
4. [frontend/src/pages/vendor/Profile.jsx](frontend/src/pages/vendor/Profile.jsx) - Update endpoint
5. [frontend/src/pages/customer/Chat.jsx](frontend/src/pages/customer/Chat.jsx) - Replace hardcoded data

---

## 🎯 Impact Assessment

| Issue | Severity | Users Affected | Workaround |
|-------|----------|---|---|
| service.price bug | 🔴 CRITICAL | ALL booking customers | None - breaks feature |
| Missing /vendor/jobs | 🔴 CRITICAL | ALL vendors | None - breaks dashboard |
| Missing proof endpoint | 🔴 CRITICAL | Vendors submitting work | Cannot complete jobs |
| Missing escrow release | 🔴 CRITICAL | Admins releasing payments | Cannot release funds |
| Hardcoded chat | 🟡 HIGH | Customer support | Not functional |
| Missing ProofOfWork | 🔴 CRITICAL | Vendor verification | Job completion blocked |

---

## ✅ Testing Checklist After Fixes

After implementing fixes, test:
1. [ ] Create booking (uses service.basePrice)
2. [ ] Vendor can accept job
3. [ ] Vendor can submit proof
4. [ ] Admin can release escrow
5. [ ] Chat shows real messages
6. [ ] All vendor endpoints return data
7. [ ] No console errors

---

**Last Updated**: June 3, 2026
**Status**: Active Issues
**Priority**: IMMEDIATE ACTION REQUIRED
