# ResolveIt - Quick Start & Testing Guide

## 🚀 How to Start the Application

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Starts on port 5000
```

### Frontend Setup  
```bash
cd frontend
npm install
npm run dev  # Starts on port 5173
```

### Environment Variables
Create a `.env` file in the `backend/` directory:
```
MONGO_URI=mongodb://localhost:27017/resolveit
JWT_SECRET=your-secret-key-here
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

---

## ✅ What's Working

### Authentication
- ✅ User registration (any role: customer/vendor/admin)
- ✅ User login
- ✅ JWT token generation
- ✅ Password hashing with bcrypt

### Customer Features
- ✅ View services
- ✅ Create complaints/service requests
- ✅ View own orders/bookings
- ✅ Dashboard with real statistics
- ✅ Send chat messages

### Vendor Features  
- ✅ View pending jobs (bookings)
- ✅ Accept/reject jobs
- ✅ Submit proof of work
- ✅ View earnings

### Admin Features
- ✅ Dashboard with real statistics (customers, vendors, complaints, bookings)
- ✅ User management (verify, block, unblock)
- ✅ Vendor management (verify, block)
- ✅ Complaint management
- ✅ Booking overview
- ✅ Escrow management

### Chat System (NEW)
- ✅ Send and receive messages
- ✅ View conversations
- ✅ Delete messages
- ✅ Mark as read

### Proof of Work (NEW)
- ✅ Vendors can submit work proof
- ✅ Admin can approve/reject proofs
- ✅ Auto status updates

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Customer Flow
1. **Register Customer**
   - Go to signup page
   - Fill: name, email, password, phone, location
   - Select role: Customer

2. **Create Complaint**
   - Go to "New Complaint" page
   - Fill: title, description, category, location
   - Submit

3. **View in Admin Dashboard**
   - Login as admin
   - Go to Admin Dashboard
   - Check: Total Complaints count increased
   - Check: Open Complaints count increased
   - Go to Complaints page, see your complaint listed

### Scenario 2: Complete Vendor Flow
1. **Register Vendor**
   - Go to signup page
   - Fill all fields
   - Select role: Vendor

2. **View Pending Jobs**
   - Login as vendor
   - Go to Vendor Dashboard
   - Should see pending booking requests

3. **Accept a Job**
   - Click "Accept" on a pending job
   - Job status changes to "accepted"

4. **Submit Proof of Work**
   - Click on accepted job
   - Upload an image as proof
   - Submit

5. **Admin Approves**
   - Login as admin
   - Go to Proof of Work approval page (admin feature)
   - Approve or reject the proof

### Scenario 3: Chat Between Users
1. **Start Chat**
   - Both users must be logged in
   - Customer navigates to Chat page
   - Send a message to vendor

2. **Receive Message**
   - Vendor logs in
   - Goes to Chat page
   - Sees customer's message

3. **Reply**
   - Vendor types reply
   - Message appears in conversation

---

## 🔍 Key API Endpoints to Test

### Authentication
```bash
POST /auth/register
POST /auth/login
```

### Complaints  
```bash
POST /complaints
GET /complaints/my
GET /admin/complaints
```

### Orders
```bash
POST /orders
GET /orders/user
```

### Vendor Jobs
```bash
GET /vendor/jobs
GET /vendor/jobs/:id
POST /vendor/jobs/:id/accept
POST /vendor/jobs/:id/proof
```

### Chat
```bash
POST /chat/send
GET /chat/conversations
GET /chat/conversation/:conversationId
```

### Admin Stats
```bash
GET /admin/stats
```

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot read property 'price' of undefined"
- **Status**: ✅ FIXED - Now uses `basePrice` instead of `price`

### Issue: Vendor jobs endpoint returns 404
- **Status**: ✅ FIXED - Endpoint now maps to `/vendor/jobs`

### Issue: Chat shows hardcoded messages
- **Status**: ✅ FIXED - Now fetches real messages from database

### Issue: JobDetail can't find job
- **Status**: ✅ FIXED - Now fetches specific job with `GET /vendor/jobs/:id`

### Issue: Proof upload fails
- **Status**: ✅ FIXED - Now properly handles FormData and file upload

---

## 📊 Database Collections

After testing, your MongoDB should have these collections:
- `users` - Customers, vendors, admins
- `services` - Available services
- `bookings` - Service bookings
- `orders` - Service requests/orders
- `complaints` - Customer complaints
- `chats` - Chat messages
- `proofofworks` - Vendor proof submissions
- `escrowpayments` - Escrow fund tracking

---

## 🎯 Success Criteria

Application is working correctly when:
1. ✅ Customer can register and create a complaint
2. ✅ Complaint appears in admin dashboard stats
3. ✅ Vendor can register and view pending jobs
4. ✅ Vendor can accept job and submit proof
5. ✅ Admin can approve/reject proofs
6. ✅ Chat between users works in real-time
7. ✅ All dashboards show live data from MongoDB
8. ✅ No hardcoded dummy data anywhere

---

## 📝 Notes

- First time setup may need database seeding with test data
- Cloudinary credentials required for image uploads
- Chat uses polling (every 3 seconds) for now - works but not real-time
- Admin role must be created manually in MongoDB or through special registration
- Passwords are hashed with bcrypt - never stored as plain text

---

## 🆘 Need Help?

1. **Check backend logs** - See if API is responding
2. **Check frontend console** - Look for error messages
3. **Verify .env variables** - All required fields set
4. **Check MongoDB connection** - URI correct and MongoDB running
5. **Test API directly** - Use Postman to test endpoints

---

**Status: READY FOR END-TO-END TESTING** ✅
