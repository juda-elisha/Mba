import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["earn", "withdraw"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["completed", "pending", "failed"]);

export const transactionsTable = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  amountMwk: integer("amount_mwk"), // stored as MWK * 100 (cents), nullable
  description: text("description").notNull(),
  offerName: text("offer_name"),
  offerId: text("offer_id"),
  externalTransactionId: text("external_transaction_id").unique(), // RewardsRiver transaction ID for dedup
  status: transactionStatusEnum("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
