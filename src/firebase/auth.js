import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

// User roles and credentials mapping (for basic user data)
const userRoles = {
  'superadmin@tcg.com': { role: 'superadmin', name: 'Super Admin' },
  'TCGadmin01@tcg.com': { role: 'admin', name: 'Admin User', employeeId: 'TCGadmin01' },
  'client@tcg.com': { role: 'client', name: 'Client User' },
  'TT001@tcg.com': { role: 'employee', name: 'Software Employee', specialization: 'Software Development', employeeId: 'TT001' },
  'TD001@tcg.com': { role: 'employee', name: 'Digital Marketing Employee', specialization: 'Digital Marketing', employeeId: 'TD001' },
  'TB001@tcg.com': { role: 'employee', name: 'BDO Employee', specialization: 'BDO', employeeId: 'TB001' }
};

// Custom login function that handles both email and employee ID
export const loginUser = async (emailOrId, password) => {
  try {
    // For Firebase Auth, we need to use email format
    let email = emailOrId;
    if (!emailOrId.includes('@')) {
      // Convert employee ID to email format for Firebase
      email = `${emailOrId}@tcg.com`;
    }

    console.log('🔐 Attempting login with email:', email);

    // Sign in with Firebase Authentication ONLY
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Firebase Auth successful, UID:', user.uid);

    // First, try to get user data from Firestore
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

    // Fallback to hardcoded mapping
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