import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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
const db = getFirestore(app);

async function verifyEmployees() {
  console.log('🔍 Checking employees in Firestore...\n');
  
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'employee'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} employees:\n`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('---');
      console.log('ID:', doc.id);
      console.log('Name:', data.name);
      console.log('Email:', data.email);
      console.log('Role:', data.role);
      console.log('Specialization:', data.specialization);
      console.log('Employee ID:', data.employeeId);
      console.log('---\n');
    });
    
    if (querySnapshot.size === 0) {
      console.log('❌ No employees found in Firestore!');
      console.log('This means the users were created in Authentication but not in Firestore.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

verifyEmployees();
