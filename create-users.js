import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNrYUBxtf6WumOt5weMhsc1xB_OMtSFAM",
  authDomain: "tcgerp-b7765.firebaseapp.com",
  projectId: "tcgerp-b7765",
  storageBucket: "tcgerp-b7765.firebasestorage.app",
  messagingSenderId: "1096589586286",
  appId: "1:1096589586286:web:b08c47982cfb87e2181b7f",
  measurementId: "G-H9R0ZW8DRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Users to create
const users = [
  {
    email: 'superadmin@tcg.com',
    password: 'tcgtech@01',
    name: 'Super Admin',
    role: 'superadmin'
  },
  {
    email: 'TCGadmin01@tcg.com',
    password: 'admin@01',
    name: 'Admin User',
    role: 'admin',
    employeeId: 'TCGadmin01'
  },
  {
    email: 'client@tcg.com',
    password: 'client@123',
    name: 'Client User',
    role: 'client'
  },
  {
    email: 'TT001@tcg.com',
    password: 'TCGT202601',
    name: 'Software Employee',
    role: 'employee',
    specialization: 'Software Development',
    employeeId: 'TT001'
  },
  {
    email: 'TD001@tcg.com',
    password: 'TCGD202601',
    name: 'Digital Marketing Employee',
    role: 'employee',
    specialization: 'Digital Marketing',
    employeeId: 'TD001'
  },
  {
    email: 'TB001@tcg.com',
    password: 'TCGB202601',
    name: 'BDO Employee',
    role: 'employee',
    specialization: 'BDO',
    employeeId: 'TB001'
  }
];

// Function to create a single user
async function createUser(userData) {
  try {
    console.log(`\n📝 Creating user: ${userData.email}...`);
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const uid = userCredential.user.uid;
    console.log(`✓ Authentication created with UID: ${uid}`);
    
    // Create user profile in Firestore
    const userProfile = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString()
    };
    
    // Add optional fields
    if (userData.specialization) {
      userProfile.specialization = userData.specialization;
    }
    if (userData.employeeId) {
      userProfile.employeeId = userData.employeeId;
    }
    
    await setDoc(doc(db, 'users', uid), userProfile);
    console.log(`✓ Firestore profile created`);
    console.log(`✅ SUCCESS: ${userData.email} created successfully!`);
    
    return { success: true, email: userData.email };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`ℹ️  SKIPPED: ${userData.email} already exists`);
      return { success: true, email: userData.email, skipped: true };
    } else {
      console.error(`❌ ERROR: Failed to create ${userData.email}`);
      console.error(`   Reason: ${error.message}`);
      return { success: false, email: userData.email, error: error.message };
    }
  }
}

// Main function to create all users
async function createAllUsers() {
  console.log('🔥 Firebase User Creation Script');
  console.log('================================\n');
  console.log(`Creating ${users.length} users...\n`);
  
  const results = {
    created: [],
    skipped: [],
    failed: []
  };
  
  for (const userData of users) {
    const result = await createUser(userData);
    
    if (result.success) {
      if (result.skipped) {
        results.skipped.push(result.email);
      } else {
        results.created.push(result.email);
      }
    } else {
      results.failed.push({ email: result.email, error: result.error });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print summary
  console.log('\n\n================================');
  console.log('📊 SUMMARY');
  console.log('================================\n');
  
  if (results.created.length > 0) {
    console.log(`✅ Created: ${results.created.length} users`);
    results.created.forEach(email => console.log(`   - ${email}`));
    console.log('');
  }
  
  if (results.skipped.length > 0) {
    console.log(`ℹ️  Skipped: ${results.skipped.length} users (already exist)`);
    results.skipped.forEach(email => console.log(`   - ${email}`));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.length} users`);
    results.failed.forEach(item => console.log(`   - ${item.email}: ${item.error}`));
    console.log('');
  }
  
  console.log('================================');
  console.log('✨ Script completed!');
  console.log('================================\n');
  
  // Exit the process
  process.exit(0);
}

// Run the script
createAllUsers().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
