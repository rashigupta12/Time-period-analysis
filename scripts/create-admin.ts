//scripts/create-admin.ts
import { userDetails, users } from '../src/db/schema'
import { db } from '../src/db'

import { hashPassword } from '../src/lib/auth'

async function createAdmin() {
  const username = 'admin'
  const email = 'admin@gc.com'
  const password = 'admingc@1234' // Change this!
  const fullName = 'Dinesh Gupta'

  const hashedPassword = await hashPassword(password)
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
    .returning()

  await db
    .insert(userDetails)
    .values({
      userId: newUser[0].id,
      fullName,
      phoneNumber: null,
      aadharCardNumber: null
    })

  console.log('Admin user created successfully!')
  console.log(`Username: ${username}`)
  console.log(`Password: ${password}`)
  console.log('Please change the password after first login!')
}

createAdmin().catch(console.error)