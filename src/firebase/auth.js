import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// User roles and credentials mapping
const userCredentials = {
  'superadmin@tcg.com': { password: 'tcgtech@01', role: 'superadmin', name: 'Super Admin' },
  'TCGadmin01': { password: 'admin@01', role: 'admin', name: 'Admin User' },
  'client@tcg.com': { password: 'client@123', role: 'client', name: 'Client User' },
  'TT001': { password: 'TCGT202601', role: 'employee', name: 'Software Employee', specialization: 'Software Development' },
  'TD001': { password: 'TCGD202601', role: 'employee', name: 'Digital Marketing Employee', specialization: 'Digital Marketing' },
  'TB001': { password: 'TCGB202601', role: 'employee', name: 'BDO Employee', specialization: 'BDO' }
};

// Custom login function that handles both email and employee ID
export const loginUser = async (emailOrId, password) => {
  try {
    // Check if credentials match our predefined users
    const userCred = userCredentials[emailOrId];
    if (!userCred || userCred.password !== password) {
      throw new Error('Invalid credentials');
    }

    // For Firebase Auth, we need to use email format
    let email = emailOrId;
    if (!emailOrId.includes('@')) {
      // Convert employee ID to email format for Firebase
      email = `${emailOrId}@tcg.com`;
    }

    try {
      // Try to sign in with existing account
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return {
          uid: user.uid,
          email: user.email,
          ...userDoc.data()
        };
      }
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        // Create new user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        const userData = {
          name: userCred.name,
          role: userCred.role,
          email: emailOrId, // Store original email/ID
          specialization: userCred.specialization || null,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        return {
          uid: user.uid,
          email: user.email,
          ...userData
        };
      }
      throw authError;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
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