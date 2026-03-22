import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './config';

// Tasks collection functions
export const createTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: taskData.status || 'pending',
          updatedBy: taskData.clientName,
          updatedAt: new Date().toISOString(),
          role: 'client'
        }
      ]
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getTasks = async (userId, userRole) => {
  try {
    let q;
    
    if (userRole === 'client') {
      q = query(
        collection(db, 'tasks'),
        where('clientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'admin') {
      q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'employee') {
      q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'superadmin') {
      q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
};

// Real-time tasks listener
export const subscribeToTasks = (userId, userRole, callback) => {
  try {
    let q;
    
    if (userRole === 'client') {
      q = query(
        collection(db, 'tasks'),
        where('clientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'admin') {
      q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'employee') {
      q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'superadmin') {
      q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
    }

    return onSnapshot(q, (querySnapshot) => {
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      callback(tasks);
    });
  } catch (error) {
    console.error('Error subscribing to tasks:', error);
    throw error;
  }
};

// Users collection functions
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'employee'));
    const querySnapshot = await getDocs(q);
    const employees = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    return employees;
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};

// Software Projects collection functions
export const createProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, 'softwareProjects'), {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'softwareProjects'));
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

export const updateProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, 'softwareProjects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};