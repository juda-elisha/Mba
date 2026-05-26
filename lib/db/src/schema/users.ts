import { pgTable, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // Supabase auth user ID
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  pointsBalance: integer("points_balance").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  totalWithdrawnMwk: integer("total_withdrawn_mwk").notNull().default(0), // stored as integer MWK * 100
  offersCompleted: integer("offers_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  pointsBalance: true,
  totalEarned: true,
  totalWithdrawnMwk: true,
  offersCompleted: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
