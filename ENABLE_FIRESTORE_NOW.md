# 🚨 URGENT: Enable Firestore API

## The Problem
Firestore API is DISABLED in your Firebase project. That's why:
- Login is slow
- Users can't be created
- Data can't be saved

## Fix It NOW (2 minutes):

### Step 1: Enable Firestore API
Click this link and enable the API:
👉 https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=tcgerp-b7765

OR

1. Go to: https://console.firebase.google.com/project/tcgerp-b7765/firestore
2. Click "Create Database" if you haven't already
3. Choose "Start in production mode" or "Test mode"
4. Select a location (asia-southeast1 recommended for you)
5. Click "Enable"

### Step 2: Wait 2-3 Minutes
After enabling, wait 2-3 minutes for the API to propagate.

### Step 3: Run the Script Again
```bash
node create-users.js
```

This will create all 6 users:
- superadmin@tcg.com (already exists ✓)
- TCGadmin01@tcg.com
- client@tcg.com
- TT001@tcg.com
- TD001@tcg.com
- TB001@tcg.com

## Alternative: Create Users Manually in Firebase Console

If the script still doesn't work, create users manually:

1. Go to: https://console.firebase.google.com/project/tcgerp-b7765/authentication/users
2. Click "Add user" for each:

| Email | Password |
|-------|----------|
| TCGadmin01@tcg.com | admin@01 |
| client@tcg.com | client@123 |
| TT001@tcg.com | TCGT202601 |
| TD001@tcg.com | TCGD202601 |
| TB001@tcg.com | TCGB202601 |

3. After creating in Authentication, the app will automatically create Firestore documents on first login.

## Why This Happened
Firebase projects need Firestore API explicitly enabled. It's not enabled by default.
