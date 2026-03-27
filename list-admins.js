// Script to list all admins from Firebase
// Run this with: node list-admins.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration (from your src/firebase/config.js)
const firebaseConfig = {
  apiKey: "AIzaSyDEqAU7lg_L7dKCU_zxJPvVYqLWKKdxGWo",
  authDomain: "task-management-system-c5e8f.firebaseapp.com",
  projectId: "task-management-system-c5e8f",
  storageBucket: "task-management-system-c5e8f.firebasestorage.app",
  messagingSenderId: "655414909651",
  appId: "1:655414909651:web:e0e8e0e0e0e0e0e0e0e0e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listAdmins() {
  try {
    console.log('🔍 Fetching all admins from Firebase...\n');
    
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No admins found in Firebase.');
      console.log('\n💡 You need to create an admin first using the SuperAdmin dashboard.');
      return;
    }
    
    console.log(`✅ Found ${querySnapshot.size} admin(s):\n`);
    console.log('='.repeat(80));
    
    querySnapshot.forEach((doc) => {
      const admin = doc.data();
      console.log(`
Admin Name:     ${admin.name || 'N/A'}
Admin ID:       ${admin.adminId || 'N/A'}
Email:          ${admin.email || 'N/A'}
Department:     ${admin.department || 'N/A'}
Status:         ${admin.status || 'N/A'}
Created:        ${admin.createdAt || 'N/A'}
      `);
      console.log('='.repeat(80));
    });
    
    console.log('\n📝 NOTE: Passwords are encrypted and cannot be retrieved.');
    console.log('💡 To login, use: Admin ID + Password (that was set during creation)');
    console.log('💡 If you forgot the password, you need to reset it in Firebase Console.');
    
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
  }
  
  process.exit(0);
}

listAdmins();
