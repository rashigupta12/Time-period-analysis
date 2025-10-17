// pnpm tsx src/index.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from './db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function createAdmin() {
  const email = "amit.gupta@gennextit.com";
  const username = "amit_gupta";
  const plainPassword = "amit.gupta@gennextit"; // change to a secure one

  // check if admin already exists
  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    console.log("✅ Admin already exists:", existing[0]);
    return;
  }

  // hash password
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // insert new admin
  await db.insert(users).values({
    username,
    email,
    passwordHash,
    role: "ADMIN",
    isEmailVerified: true,   // optionally verified
    isFirstLogin: true,      // force reset password on first login if needed
  });

  console.log("🎉 Admin user created successfully with email:", email);
}

createAdmin()
  .catch((err) => {
    console.error("Error creating admin:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
