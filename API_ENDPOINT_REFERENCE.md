# ResolveIt - API Endpoint Reference Guide

## Status Legend
- ✅ **Working**: Endpoint exists, frontend calls it, will work
- ⚠️ **Partial**: Endpoint exists but incomplete implementation
- ❌ **Broken**: Frontend calls it but endpoint doesn't exist
- ⏸️ **Not Used**: Endpoint exists but frontend doesn't use it

---

## Authentication Routes

| Endpoint | Method | Frontend Usage | Backend | Status |
|----------|--------|---|--------|--------|
| `/auth/register` | POST | [AuthContext.jsx:85](frontend/src/context/AuthContext.jsx#L85) | [auth.js](backend/src/routes/auth.js) | ✅ |
| `/auth/login` | POST | [AuthContext.jsx:71](frontend/src/context/AuthContext.jsx#L71) | [auth.js](backend/src/routes/auth.js) | ✅ |

---

## User Profile Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/users/profile` | GET | [AuthContext.jsx:49](frontend/src/context/AuthContext.jsx#L49) | [users.js](backend/src/routes/users.js) | ✅ | Protected |
| `/users/profile` | PUT | [AuthContext.jsx:92](frontend/src/context/AuthContext.jsx#L92) | [users.js](backend/src/routes/users.js) | ✅ | Protected |
| `/users/change-password` | PUT | [AuthContext.jsx:99](frontend/src/context/AuthContext.jsx#L99) | [users.js](backend/src/routes/users.js) | ✅ | Protected |
| `/users/upload-profile-pic` | POST | [AuthContext.jsx:115](frontend/src/context/AuthContext.jsx#L115) | [users.js](backend/src/routes/users.js) | ✅ | Protected, Multer |

---

## Services Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/services` | GET | [BookService.jsx:33](frontend/src/pages/customer/BookService.jsx#L33) | [services.js](backend/src/routes/services.js) | ✅ | Public |
| `/services/:id` | GET | Not directly used in audit | [services.js](backend/src/routes/services.js) | ⏸️ | Public |
| `/services` | POST | Not directly used in audit | [services.js](backend/src/routes/services.js) | ⏸️ | Protected, Admin/Vendor |

---

## Orders Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/orders` | POST | [BookService.jsx:70](frontend/src/pages/customer/BookService.jsx#L70) | [orders.js](backend/src/routes/orders.js) | ✅ | Protected |
| `/orders/user` | GET | [Bookings.jsx:22](frontend/src/pages/customer/Bookings.jsx#L22), [Dashboard.jsx:24](frontend/src/pages/customer/Dashboard.jsx#L24), [Payments.jsx:17](frontend/src/pages/customer/Payments.jsx#L17) | [orders.js](backend/src/routes/orders.js) | ✅ | Protected |
| `/orders/:id` | GET | Not directly used in audit | [orders.js](backend/src/routes/orders.js) | ⏸️ | Protected |
| `/orders/:id/status` | PUT | Not directly used in audit | [orders.js](backend/src/routes/orders.js) | ⏸️ | Protected, Vendor/Admin |

---

## Bookings Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/bookings` | POST | Not directly used in audit | [bookings.js](backend/src/routes/bookings.js) | 🔴 **BUG** | Uses service.price instead of basePrice |
| `/bookings/me` | GET | Not directly used in audit | [bookings.js](backend/src/routes/bookings.js) | ⏸️ | Protected, Customer |
| `/bookings/:id` | GET | Not directly used in audit | [bookings.js](backend/src/routes/bookings.js) | ⏸️ | Protected |

---

## Vendor Routes ⚠️ CRITICAL MISMATCH

### Backend Provides:
| Endpoint | Method | Controller | Status |
|----------|--------|-----------|--------|
| `/vendor/requests` | GET | getPendingRequests | ✅ |
| `/vendor/requests/:id/respond` | POST | respondToBooking | ✅ |
| `/vendor/work/:id/status` | POST | updateWorkStatus | ✅ |
| `/vendor/earnings` | GET | getEarnings | ✅ |

### Frontend Expects:
| Endpoint | Method | Frontend Usage | Status |
|----------|--------|---|--------|
| `/vendor/jobs` | GET | [JobList.jsx:21](frontend/src/pages/vendor/JobList.jsx#L21), [JobDetail.jsx:27](frontend/src/pages/vendor/JobDetail.jsx#L27), [Dashboard.jsx:17](frontend/src/pages/vendor/Dashboard.jsx#L17), [Profile.jsx:22](frontend/src/pages/vendor/Profile.jsx#L22) | ❌ BROKEN |
| `/vendor/jobs/:id/accept` | POST | [JobDetail.jsx:55](frontend/src/pages/vendor/JobDetail.jsx#L55) | ❌ BROKEN |
| `/vendor/jobs/:id/proof` | POST | [JobDetail.jsx:78](frontend/src/pages/vendor/JobDetail.jsx#L78) | ❌ BROKEN |

**ISSUE**: 
- Frontend calls `/vendor/jobs` but backend provides `/vendor/requests`
- Frontend expects `/accept` and `/proof` endpoints that don't exist
- Backend's `/respond` endpoint exists but frontend doesn't use it

**FIX NEEDED**: Either:
1. Rename backend `/vendor/requests` → `/vendor/jobs` 
2. OR update 4 frontend files to use `/vendor/requests`

---

## Admin Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/admin/stats` | GET | [Dashboard.jsx:24](frontend/src/pages/admin/Dashboard.jsx#L24), [Profile.jsx:18](frontend/src/pages/admin/Profile.jsx#L18) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/users` | GET | [Users.jsx:25](frontend/src/pages/admin/Users.jsx#L25) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/users/:id/:action` | PATCH | [Users.jsx:50](frontend/src/pages/admin/Users.jsx#L50) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/vendors` | GET | [Vendors.jsx:24](frontend/src/pages/admin/Vendors.jsx#L24) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/vendors/:id/:action` | POST | [Vendors.jsx:51](frontend/src/pages/admin/Vendors.jsx#L51) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/vendors/:id/block` | POST | [Vendors.jsx:68](frontend/src/pages/admin/Vendors.jsx#L68) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/bookings` | GET | [Bookings.jsx:23](frontend/src/pages/admin/Bookings.jsx#L23) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/complaints` | GET | [Complaints.jsx:36](frontend/src/pages/admin/Complaints.jsx#L36) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/complaints/:id` | GET | [Complaints.jsx](frontend/src/pages/admin/Complaints.jsx) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/complaints/:id/status` | PUT | [Complaints.jsx:63](frontend/src/pages/admin/Complaints.jsx#L63) | [admin.js](backend/src/routes/admin.js) | ✅ | Protected, Admin |
| `/admin/escrows` | GET | Not used in audit | [admin.js](backend/src/routes/admin.js) | ⏸️ | Protected, Admin |
| `/admin/escrows/:id/release` | POST | Not used in audit | [admin.js](backend/src/routes/admin.js) | ⚠️ **BUG** | Route exists, controller method missing |
| `/admin/dashboard` | GET | Not used in audit | [admin.js](backend/src/routes/admin.js) | ⏸️ | Protected, Admin |

---

## Escrow Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/escrow/booking/:bookingId` | GET | Not directly used in audit | [escrow.js](backend/src/routes/escrow.js) | ⏸️ | Protected |

---

## Complaints Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/complaints` | POST | [CreateComplaint.jsx:45](frontend/src/pages/customer/CreateComplaint.jsx#L45) | [complaints.js](backend/src/routes/complaints.js) | ✅ | Protected |
| `/complaints/my` | GET | [Profile.jsx:22](frontend/src/pages/customer/Profile.jsx#L22) | [complaints.js](backend/src/routes/complaints.js) | ✅ | Protected |
| `/complaints` | GET | Not directly used in audit | [complaints.js](backend/src/routes/complaints.js) | ⏸️ | Protected |
| `/complaints/:id` | GET | [ComplaintDetail.jsx:24](frontend/src/pages/customer/ComplaintDetail.jsx#L24) | [complaints.js](backend/src/routes/complaints.js) | ✅ | Protected |

---

## Uploads Routes

| Endpoint | Method | Frontend Usage | Backend | Status | Notes |
|----------|--------|---|--------|--------|-------|
| `/uploads/image` | POST | Not directly used in audit | [uploads.js](backend/src/routes/uploads.js) | ⏸️ | Cloudinary integration |
| `/uploads/image/:publicId` | DELETE | Not directly used in audit | [uploads.js](backend/src/routes/uploads.js) | ⏸️ | Cloudinary integration |

---

## Missing Endpoints (Called by Frontend but Don't Exist)

| Endpoint | Expected By | Files | Severity |
|----------|------------|-------|----------|
| `/vendor/jobs` | GET job list | 4 files | 🔴 CRITICAL |
| `/vendor/jobs/:id/accept` | Accept job | [JobDetail.jsx:55](frontend/src/pages/vendor/JobDetail.jsx#L55) | 🔴 CRITICAL |
| `/vendor/jobs/:id/proof` | Submit proof | [JobDetail.jsx:78](frontend/src/pages/vendor/JobDetail.jsx#L78) | 🔴 CRITICAL |
| `/chat/*` | Chat messages | [Chat.jsx](frontend/src/pages/customer/Chat.jsx) | 🟡 HIGH (hardcoded) |

---

## Status Summary

### ✅ FULLY WORKING (25 endpoints)
All authentication, user, service, order, admin, and complaint endpoints working as expected.

### ⚠️ PARTIALLY WORKING (3 endpoints)
- `/admin/escrows/:id/release` - Route exists, controller method missing
- `/bookings` POST - Uses wrong field name (`service.price` vs `service.basePrice`)
- `/vendor/jobs` GET - Frontend expects this, backend provides `/vendor/requests`

### ❌ BROKEN (3 endpoints)
- `/vendor/jobs/:id/accept` - Doesn't exist
- `/vendor/jobs/:id/proof` - Doesn't exist (ProofOfWork model missing)
- `/chat/*` - No endpoints, frontend uses hardcoded data

### ⏸️ NOT USED BY FRONTEND (8 endpoints)
These exist but frontend doesn't call them in the audit scope.

---

## Controller Implementation Status

| Controller | Implemented Methods | Missing Methods | Status |
|-----------|-------------------|-----------------|--------|
| authController | 2/2 | - | ✅ |
| userController | 4/4 | - | ✅ |
| serviceController | 3/3 | - | ✅ |
| bookingController | 3/3 | - | 🔴 BUG in line 8 |
| orderController | 4/4 | - | ✅ |
| vendorController | 4/4 | acceptJob, submitProof | ❌ Missing critical |
| adminController | 10/11 | releaseEscrow | ⚠️ Missing 1 |
| complaintController | 5/5 | - | ✅ |
| escrowController | 1/3 | releaseEscrow, refundEscrow | ⚠️ Incomplete |
| analyticsController | 1/1 | - | ✅ |
| chatController | - | ALL | ❌ Doesn't exist |

---

## Quick Reference: Frontend API Calls by Component

### Customer Dashboard
```javascript
GET /orders/user                    ✅ Works
```

### Vendor Dashboard
```javascript
GET /vendor/requests               ✅ Works (frontend calls /vendor/jobs - broken naming)
GET /vendor/earnings               ✅ Works
POST /vendor/requests/:id/respond  ✅ Works
POST /vendor/work/:id/status       ✅ Works
```

### Admin Dashboard
```javascript
GET /admin/stats                   ✅ Works
GET /admin/users                   ✅ Works
GET /admin/vendors                 ✅ Works
GET /admin/bookings                ✅ Works
GET /admin/complaints              ✅ Works
PUT /admin/complaints/:id/status   ✅ Works
```

### Customer Booking
```javascript
GET /services                      ✅ Works
POST /orders                       ✅ Works (but booking will fail due to service.price bug)
```

### Vendor Job Management
```javascript
GET /vendor/jobs                   ❌ Broken (expects but doesn't exist)
POST /vendor/jobs/:id/accept       ❌ Broken (doesn't exist)
POST /vendor/jobs/:id/proof        ❌ Broken (doesn't exist)
```

### Chat
```javascript
Chat.jsx - All hardcoded          ❌ Broken (no backend)
```

---

## Deployment Readiness Check

| Component | Status | Blocker | Notes |
|-----------|--------|---------|-------|
| Auth Flow | ✅ | No | Working |
| User Management | ✅ | No | Working |
| Service Browsing | ✅ | No | Working |
| Customer Dashboard | ✅ | No | Working |
| Customer Ordering | ⚠️ | **YES** | service.price bug |
| Vendor Dashboard | ❌ | **YES** | /vendor/jobs mismatch |
| Vendor Job Management | ❌ | **YES** | Endpoints missing |
| Admin Panel | ✅ | No | Mostly working |
| Chat System | ❌ | **YES** | Hardcoded, no backend |
| Escrow Management | ⚠️ | **YES** | Missing releaseEscrow |

**Deployment Status**: 🔴 NOT READY - 6 critical blockers

---

**Generated**: June 3, 2026
**Last Updated**: Comprehensive Audit Complete
