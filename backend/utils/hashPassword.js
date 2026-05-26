const bcrypt = require('bcryptjs');

// Script to generate hashed password for database seeding
const password = 'password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password for "password123":');
  console.log(hash);
  console.log('\nUse this hash in your database.sql file for user passwords');
});
