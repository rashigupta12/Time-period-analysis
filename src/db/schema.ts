import { relations } from "drizzle-orm"
import { bigint, boolean, integer, pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core"

// --- Business Logic Tables ---

// Enums

export const userRolesEnum = pgEnum("user_role", ["ADMIN", "DATA_ANALYST"])

// Update the users table to include email and verification fields
export const users = pgTable("users", {
  id: bigint("id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(), // Add email field
  passwordHash: text("password_hash").notNull(),
  role: userRolesEnum("role").notNull().default("DATA_ANALYST"),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(), // Email verification status
  isFirstLogin: boolean("is_first_login").default(true).notNull(), // Track first login
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  flag: text("flag").default("1")
})

// Add OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: bigint("id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id, { onDelete: "cascade" }),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})


// Extended user details
export const userDetails = pgTable("user_details", {
  userId: bigint("user_id", { mode: "bigint" }).notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  aadharCardNumber: text("aadhar_card_number"),
})

// --- NextAuth.js Tables ---

// These tables are required for NextAuth.js to handle sessions and accounts.
export const accounts = pgTable("accounts", {
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<"oauth" | "oidc" | "email">().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey(account.provider, account.providerAccountId),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey(vt.identifier, vt.token),
}));



// --- Relations ---

export const otpVerificationsRelations = relations(otpVerifications, ({ one }) => ({
  user: one(users, {
    fields: [otpVerifications.userId],
    references: [users.id],
  }),
}))

// Update users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  details: one(userDetails, {
    fields: [users.id],
    references: [userDetails.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  otpVerifications: many(otpVerifications), // Add OTP relation
}))

// Add types
export type OtpVerification = typeof otpVerifications.$inferSelect
export type NewOtpVerification = typeof otpVerifications.$inferInsert


export const userDetailsRelations = relations(userDetails, ({ one }) => ({
  user: one(users, {
    fields: [userDetails.userId],
    references: [users.id],
  }),
}))



// --- Type definitions ---
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type UserDetail = typeof userDetails.$inferSelect
export type NewUserDetail = typeof userDetails.$inferInsert


export type UserRole = "ADMIN" | "DATA_ANALYST"
