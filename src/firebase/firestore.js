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
    console.log('🔥 Creating task in Firebase:', taskData);
    
    const taskToCreate = {
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Only add default statusHistory if not provided
    if (!taskData.statusHistory) {
      taskToCreate.statusHistory = [
        {
          status: taskData.status || 'pending',
          updatedBy: taskData.createdBy || taskData.clientName || 'System',
          updatedAt: new Date().toISOString(),
          role: taskData.role || 'client'
        }
      ];
    }
    
    const docRef = await addDoc(collection(db, 'tasks'), taskToCreate);
    console.log('✅ Task created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating task:', error);
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

// Real-time tasks listener with timeout
export const subscribeToTasks = (userId, userRole, callback, userEmail = null) => {
  try {
    console.log('🔍 Subscribing to tasks:', { userId, userRole, userEmail });
    
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
      // Query by UID or email - get all tasks and filter client-side
      q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'superadmin') {
      q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
    }

    // Set a timeout for initial load
    let initialLoadTimeout = setTimeout(() => {
      console.warn('Firestore taking too long, using empty data');
      callback([]);
    }, 5000);

    let isFirstLoad = true;

    return onSnapshot(q, 
      (querySnapshot) => {
        if (isFirstLoad) {
          clearTimeout(initialLoadTimeout);
          isFirstLoad = false;
        }
        
        let tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`📊 Total tasks from Firebase: ${tasks.length}`);
        
        // Filter employee tasks by UID or email
        if (userRole === 'employee') {
          const beforeFilter = tasks.length;
          console.log('🔍 Filtering tasks for employee:', { userId, userEmail });
          
          // Log all tasks to see what we have
          tasks.forEach(task => {
            console.log('📋 Task data:', {
              id: task.id,
              title: task.title,
              assignedTo: task.assignedTo,
              assignedToEmail: task.assignedToEmail,
              assignedToName: task.assignedToName
            });
          });
          
          tasks = tasks.filter(task => {
            // Check multiple conditions for matching
            const matchByUid = task.assignedTo === userId;
            const matchByEmail = task.assignedTo === userEmail;
            const matchByAssignedToEmail = task.assignedToEmail === userEmail;
            
            const match = matchByUid || matchByEmail || matchByAssignedToEmail;
            
            console.log(`🔍 Task "${task.title}" match check:`, {
              taskId: task.id,
              assignedTo: task.assignedTo,
              assignedToEmail: task.assignedToEmail,
              userId,
              userEmail,
              matchByUid,
              matchByEmail,
              matchByAssignedToEmail,
              finalMatch: match
            });
            
            return match;
          });
          console.log(`✅ Employee tasks filtered: ${beforeFilter} -> ${tasks.length}`);
        }
        
        callback(tasks);
      },
      (error) => {
        console.error('❌ Error in tasks subscription:', error);
        clearTimeout(initialLoadTimeout);
        callback([]);
      }
    );
  } catch (error) {
    console.error('❌ Error subscribing to tasks:', error);
    callback([]);
    return () => {};
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
    console.log('🔍 Fetching employees from Firebase...');
    const q = query(collection(db, 'users'), where('role', '==', 'employee'));
    const querySnapshot = await getDocs(q);
    const employees = [];
    querySnapshot.forEach((doc) => {
      const employeeData = {
        uid: doc.id,
        id: doc.id,
        ...doc.data()
      };
      console.log('Found employee:', employeeData);
      employees.push(employeeData);
    });
    console.log(`✅ Total employees fetched: ${employees.length}`);
    return employees;
  } catch (error) {
    console.error('❌ Error getting employees:', error);
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


// Finance Software Projects
export const createFinanceSoftwareProject = async (projectData) => {
  try {
    console.log('Firestore: Creating software project...', projectData)
    const docRef = await addDoc(collection(db, 'financeSoftwareProjects'), {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Firestore: Software project created successfully with ID:', docRef.id)
    return docRef.id;
  } catch (error) {
    console.error('Firestore Error creating finance software project:', error);
    throw error;
  }
};

export const getFinanceSoftwareProjects = async () => {
  try {
    console.log('Firestore: Fetching software projects...')
    const querySnapshot = await getDocs(collection(db, 'financeSoftwareProjects'));
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    console.log('Firestore: Fetched', projects.length, 'software projects')
    return projects;
  } catch (error) {
    console.error('Firestore Error getting finance software projects:', error);
    throw error;
  }
};

export const updateFinanceSoftwareProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, 'financeSoftwareProjects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating finance software project:', error);
    throw error;
  }
};

export const deleteFinanceSoftwareProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'financeSoftwareProjects', projectId));
  } catch (error) {
    console.error('Error deleting finance software project:', error);
    throw error;
  }
};

// Finance Digital Marketing Projects
export const createFinanceDMProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, 'financeDMProjects'), {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating finance DM project:', error);
    throw error;
  }
};

export const getFinanceDMProjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'financeDMProjects'));
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (error) {
    console.error('Error getting finance DM projects:', error);
    throw error;
  }
};

export const updateFinanceDMProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, 'financeDMProjects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating finance DM project:', error);
    throw error;
  }
};

export const deleteFinanceDMProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'financeDMProjects', projectId));
  } catch (error) {
    console.error('Error deleting finance DM project:', error);
    throw error;
  }
};

// Real-time listeners for finance projects
export const subscribeToFinanceSoftwareProjects = (callback) => {
  try {
    console.log('Firestore: Setting up real-time listener for software projects')
    return onSnapshot(collection(db, 'financeSoftwareProjects'), (querySnapshot) => {
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      console.log('Firestore: Real-time update - software projects:', projects.length)
      callback(projects);
    }, (error) => {
      console.error('Firestore Error in finance software projects subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Firestore Error subscribing to finance software projects:', error);
    return () => {};
  }
};

export const subscribeToFinanceDMProjects = (callback) => {
  try {
    console.log('Firestore: Setting up real-time listener for DM projects')
    return onSnapshot(collection(db, 'financeDMProjects'), (querySnapshot) => {
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      console.log('Firestore: Real-time update - DM projects:', projects.length)
      callback(projects);
    }, (error) => {
      console.error('Firestore Error in finance DM projects subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Firestore Error subscribing to finance DM projects:', error);
    return () => {};
  }
};

// BDO Clients collection functions
export const createBDOClient = async (clientData) => {
  try {
    const docRef = await addDoc(collection(db, 'bdoClients'), {
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: clientData.notes || []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating BDO client:', error);
    throw error;
  }
};

export const getBDOClients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'bdoClients'));
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    return clients;
  } catch (error) {
    console.error('Error getting BDO clients:', error);
    throw error;
  }
};

export const updateBDOClient = async (clientId, updates) => {
  try {
    const clientRef = doc(db, 'bdoClients', clientId);
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating BDO client:', error);
    throw error;
  }
};

export const subscribeToBDOClients = (callback) => {
  try {
    return onSnapshot(collection(db, 'bdoClients'), (querySnapshot) => {
      const clients = [];
      querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
      });
      callback(clients);
    }, (error) => {
      console.error('Error in BDO clients subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to BDO clients:', error);
    return () => {};
  }
};

// Software Projects (for developer assignment) collection functions
export const createSoftwareProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, 'softwareProjects'), {
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: projectData.notes || []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating software project:', error);
    throw error;
  }
};

export const getSoftwareProjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'softwareProjects'));
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (error) {
    console.error('Error getting software projects:', error);
    throw error;
  }
};

export const updateSoftwareProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, 'softwareProjects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating software project:', error);
    throw error;
  }
};

export const subscribeToSoftwareProjects = (callback) => {
  try {
    return onSnapshot(collection(db, 'softwareProjects'), (querySnapshot) => {
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      callback(projects);
    }, (error) => {
      console.error('Error in software projects subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to software projects:', error);
    return () => {};
  }
};
