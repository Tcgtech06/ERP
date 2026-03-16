const bcrypt = require('bcryptjs');

const users = [
  { role: 'Digital Marketing Employee', email: 'TD001', password: 'TCGD202601' },
  { role: 'Software Employee', email: 'TT001', password: 'TCGT202601' },
  { role: 'Admin', email: 'TCGadmin01', password: 'admin@01' },
  { role: 'Super Admin', email: 'superadmin@tcg.com', password: 'tcgtech@01' },
  { role: 'BDO', email: 'TB001', password: 'TCGB202601' },
  { role: 'Developer', email: 'developer@tcg.com', password: 'dev@123' },
  { role: 'Client', email: 'client@tcg.com', password: 'client@123' }
];

async function generateSQL() {
  console.log('-- Copy and paste these SQL commands into Neon DB SQL Editor\n');
  console.log('-- First, let\'s update existing users or create new ones\n');
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    
    if (user.role === 'Digital Marketing Employee') {
      console.log(`-- Digital Marketing Employee`);
      console.log(`INSERT INTO users (name, email, password, role) VALUES ('Digital Marketing Employee', '${user.email}', '${hash}', 'employee')`);
      console.log(`ON CONFLICT (email) DO UPDATE SET password = '${hash}', name = 'Digital Marketing Employee';\n`);
    } else if (user.role === 'Software Employee') {
      console.log(`-- Software Employee`);
      console.log(`INSERT INTO users (name, email, password, role) VALUES ('Software Employee', '${user.email}', '${hash}', 'employee')`);
      console.log(`ON CONFLICT (email) DO UPDATE SET password = '${hash}', name = 'Software Employee';\n`);
    } else if (user.role === 'Admin') {
      console.log(`-- Admin`);
      console.log(`INSERT INTO users (name, email, password, role) VALUES ('Admin User', '${user.email}', '${hash}', 'admin')`);
      console.log(`ON CONFLICT (email) DO UPDATE SET password = '${hash}';\n`);
    } else if (user.role === 'Super Admin') {
      console.log(`-- Super Admin`);
      console.log(`UPDATE users SET password = '${hash}' WHERE email = '${user.email}';\n`);
    } else if (user.role === 'BDO') {
      console.log(`-- BDO`);
      console.log(`INSERT INTO users (name, email, password, role) VALUES ('BDO User', '${user.email}', '${hash}', 'bdo')`);
      console.log(`ON CONFLICT (email) DO UPDATE SET password = '${hash}';\n`);
    } else if (user.role === 'Developer') {
      console.log(`-- Developer`);
      console.log(`UPDATE users SET password = '${hash}' WHERE email = '${user.email}';\n`);
    } else if (user.role === 'Client') {
      console.log(`-- Client`);
      console.log(`UPDATE users SET password = '${hash}' WHERE email = '${user.email}';\n`);
    }
  }
  
  console.log('-- Verify all users');
  console.log('SELECT id, name, email, role FROM users ORDER BY role;');
}

generateSQL();
