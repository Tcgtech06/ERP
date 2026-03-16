const bcrypt = require('bcryptjs');

async function testClientPassword() {
  const password = 'client@123';
  const hash = '$2b$10$.vuuIpOPDp7AATS70ptQH.7Kd6jkE9kC.ZS3AwehWP1fnTfyJejHC';
  
  console.log('Testing client password...');
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  const match = await bcrypt.compare(password, hash);
  console.log('Password match:', match);
  
  // Generate new hash for client@123
  const newHash = await bcrypt.hash(password, 10);
  console.log('\nNew hash for client@123:', newHash);
  
  console.log('\nSQL to update client:');
  console.log(`UPDATE users SET password = '${newHash}' WHERE email = 'client@tcg.com';`);
}

testClientPassword();