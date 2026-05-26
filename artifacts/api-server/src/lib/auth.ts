import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const supabaseUrl = process.env["SUPABASE_URL"]!;
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"]!;

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    // Verify JWT with Supabase using the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Attach user to request
    (req as any).supabaseUser = user;

    // Fetch or create our app user record
    const [appUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id));

    if (!appUser) {
      res.status(401).json({ error: "User profile not found" });
      return;
    }

    (req as any).appUser = appUser;
    next();
  } catch (err) {
    req.log.error({ err }, "Auth middleware error");
    res.status(500).json({ error: "Authentication error" });
  }
}

export type AuthenticatedRequest = Request & {
  supabaseUser: { id: string; email?: string };
  appUser: {
    id: string;
    email: string;
    username: string;
    phone: string | null;
    avatarUrl: string | null;
    pointsBalance: number;
    totalEarned: number;
    totalWithdrawnMwk: number;
    offersCompleted: number;
    createdAt: Date;
    updatedAt: Date;
  };
};
