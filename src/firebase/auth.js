import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './config';

// User roles and credentials mapping (ONLY for SuperAdmin, Admin, and test Client)
const userRoles = {
  'superadmin@tcg.com': { role: 'superadmin', name: 'Super Admin' },
  'TCGadmin01@tcg.com': { role: 'admin', name: 'Admin User', employeeId: 'TCGadmin01' },
  'client@tcg.com': { role: 'client', name: 'Client User' }
};

// Custom login function that handles both email and employee ID
export const loginUser = async (emailOrId, password) => {
  try {
    let email = emailOrId;
    let isEmployeeIdLogin = false;
    
    // Check if it's an employee ID (TT001, TD001, TB001, etc.)
    if (!emailOrId.includes('@')) {
      isEmployeeIdLogin = true;
      const employeeId = emailOrId.toUpperCase();
      
      console.log('🔍 Employee ID login detected:', employeeId);
      
      // Search for employee by employeeId in Firestore
      try {
        const q = query(collection(db, 'users'), where('employeeId', '==', employeeId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0];
          const employeeData = employeeDoc.data();
          email = employeeData.email;
          console.log('✅ Found employee in Firestore:', employeeData.name, 'Email:', email);
        } else {
          throw new Error(`Employee ID ${employeeId} not found`);
        }
      } catch (error) {
        console.error('❌ Error finding employee:', error);
        throw new Error(`Employee ID ${employeeId} not found in system`);
      }
    }

    console.log('🔐 Attempting login with email:', email);

    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Firebase Auth successful, UID:', user.uid);

    // Get user data from Firestore
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ Found user in Firestore:', userData);
        return {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          role: userData.role,
          specialization: userData.specialization || null,
          employeeId: userData.employeeId || null
        };
      }
    } catch (firestoreError) {
      console.log('⚠️ User not in Firestore, checking hardcoded mapping');
    }

    // Fallback to hardcoded mapping (only for SuperAdmin, Admin, Client)
    const userInfo = userRoles[email];
    
    if (userInfo) {
      console.log('✅ Found user in hardcoded mapping:', userInfo);
      return {
        uid: user.uid,
        email: user.email,
        name: userInfo.name,
        role: userInfo.role,
        specialization: userInfo.specialization || null,
        employeeId: userInfo.employeeId || null
      };
    }
    
    // If we reach here and it was an employee ID login, something is wrong
    if (isEmployeeIdLogin) {
      throw new Error('Employee data not found in system');
    }
    
    // Final fallback - treat as client
    console.log('⚠️ No user data found, defaulting to client role');
    return {
      uid: user.uid,
      email: user.email,
      name: user.email.split('@')[0],
      role: 'client'
    };
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('Invalid credentials');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('User not found');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};