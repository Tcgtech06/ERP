import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBNrYUBxtf6WumOt5weMhsc1xB_OMtSFAM",
  authDomain: "tcgerp-b7765.firebaseapp.com",
  projectId: "tcgerp-b7765",
  storageBucket: "tcgerp-b7765.firebasestorage.app",
  messagingSenderId: "1096589586286",
  appId: "1:1096589586286:web:b08c47982cfb87e2181b7f",
  measurementId: "G-H9R0ZW8DRL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
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

async function createUser(userData) {
  try {
    console.log(`\n📝 Creating: ${userData.email}...`);
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const uid = userCredential.user.uid;
    console.log(`✓ Auth created: ${uid}`);
    
    const userProfile = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: new Date().toISOString()
    };
    
    if (userData.specialization) userProfile.specialization = userData.specialization;
    if (userData.employeeId) userProfile.employeeId = userData.employeeId;
    
    try {
      await setDoc(doc(db, 'users', uid), userProfile);
      console.log(`✓ Firestore saved`);
    } catch (fsError) {
      console.log(`⚠️  Firestore failed (user can still login): ${fsError.message}`);
    }
    
    console.log(`✅ SUCCESS: ${userData.email}`);
    return { success: true, email: userData.email };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`ℹ️  Already exists: ${userData.email}`);
      return { success: true, email: userData.email, skipped: true };
    } else {
      console.error(`❌ FAILED: ${userData.email} - ${error.message}`);
      return { success: false, email: userData.email, error: error.message };
    }
  }
}

async function main() {
  console.log('🔥 Creating Firebase Users\n');
  console.log('================================\n');
  
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const userData of users) {
    const result = await createUser(userData);
    if (result.success) {
      if (result.skipped) skipped++;
      else created++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n================================');
  console.log('📊 SUMMARY');
  console.log('================================');
  console.log(`✅ Created: ${created}`);
  console.log(`ℹ️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('================================\n');
  
  if (failed === 0) {
    console.log('✨ All users ready! You can now login with any credentials.\n');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
