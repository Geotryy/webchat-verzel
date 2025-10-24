import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /**
   * Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user.
   * This mirrors the Manus account and should be used for authentication lookups.
   */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversations table - stores chat sessions
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull().unique(),
  leadName: varchar("leadName", { length: 255 }),
  leadEmail: varchar("leadEmail", { length: 320 }),
  leadCompany: varchar("leadCompany", { length: 255 }),
  leadPhone: varchar("leadPhone", { length: 50 }),
  leadNeed: text("leadNeed"),
  leadTimeline: varchar("leadTimeline", { length: 100 }),
  interestConfirmed: boolean("interestConfirmed").default(false),
  meetingScheduled: boolean("meetingScheduled").default(false),
  meetingLink: text("meetingLink"),
  meetingDateTime: timestamp("meetingDateTime"),
  pipefyCardId: varchar("pipefyCardId", { length: 255 }),
  status: mysqlEnum("status", ["active", "qualified", "scheduled", "closed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - stores individual chat messages
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Leads table - stores qualified leads for admin panel
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  need: text("need"),
  timeline: varchar("timeline", { length: 100 }),
  interestConfirmed: boolean("interestConfirmed").default(false).notNull(),
  meetingScheduled: boolean("meetingScheduled").default(false).notNull(),
  meetingLink: text("meetingLink"),
  meetingDateTime: timestamp("meetingDateTime"),
  pipefyCardId: varchar("pipefyCardId", { length: 255 }),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "meeting_scheduled", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

