import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const providerEnum = pgEnum("mobile_provider", ["airtel", "tnm"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "processing", "completed", "failed"]);

export const withdrawalsTable = pgTable("withdrawals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
  amountMwk: integer("amount_mwk").notNull(), // stored as MWK * 100 (cents)
  provider: providerEnum("provider").notNull(),
  phoneNumber: text("phone_number").notNull(),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  paychanguRef: text("paychangu_ref"),
  paychanguTxRef: text("paychangu_tx_ref"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
