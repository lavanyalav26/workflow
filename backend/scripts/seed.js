const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');

    // Read the seed SQL file
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../config/seed-data.sql'),
      'utf8'
    );

    // Execute the seed SQL
    await client.query(seedSQL);

    console.log('✅ Database seeded successfully!\n');
    console.log('📊 Sample data created:');
    console.log('   - 3 Users (User, Manager, Admin)');
    console.log('   - 5 Requests with different statuses');
    console.log('   - Multiple action logs showing workflow transitions\n');
    console.log('🔑 Login credentials:');
    console.log('   User:    user@example.com / password123');
    console.log('   Manager: manager@example.com / password123');
    console.log('   Admin:   admin@example.com / password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
