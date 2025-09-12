// File: src/lib/seed-admin.js
// This is the script you can run directly with Node.js

import { db } from '@/db';
import { users, userDetails } from '@/db/schema';
import { hashPassword } from './auth';

async function createAdmin() {
  const username = 'admin'
  const email = 'admin@gc.com'
  const password = 'admingc@1234' // Change this!
  const fullName = 'Dinesh Gupta'

  const hashedPassword = await hashPassword(password);

  const newUser = await db
    .insert(users)
    .values({
      username,
      email,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      isFirstLogin: false
    })
    .returning();

  await db
    .insert(userDetails)
    .values({
      userId: newUser[0].id,
      fullName,
      phoneNumber: null,
      aadharCardNumber: null
    });

  console.log('Admin user created successfully!');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log('Please change the password after first login!');
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdmin().catch(console.error);
}

export default createAdmin;