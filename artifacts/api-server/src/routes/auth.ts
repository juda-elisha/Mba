import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

const supabaseUrl = process.env["SUPABASE_URL"]!;
const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"]!;
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;

function adminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation error" });
    return;
  }

  const { email, password, username, phone } = parsed.data;

  // Check username uniqueness first
  const [existingUser] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existingUser) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  // Register with Supabase Auth
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm for simplicity
  });

  if (error || !data.user) {
    if (error?.message?.includes("already registered") || error?.message?.includes("already exists")) {
      res.status(409).json({ error: "Email already registered" });
    } else {
      req.log.error({ error }, "Supabase register error");
      res.status(400).json({ error: error?.message ?? "Registration failed" });
    }
    return;
  }

  // Create app user record
  await db.insert(usersTable).values({
    id: data.user.id,
    email,
    username,
    phone: phone || null,
  });

  // Sign in to get a session token
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.session) {
    res.status(500).json({ error: "Registered but failed to sign in" });
    return;
  }

  res.status(201).json({
    user: {
      id: data.user.id,
      email,
      username,
      phone: phone || null,
      avatarUrl: null,
      createdAt: data.user.created_at,
    },
    token: signInData.session.access_token,
  });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password format" });
    return;
  }

  const { email, password } = parsed.data;

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Fetch app user record
  const [appUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, data.user.id));

  if (!appUser) {
    res.status(401).json({ error: "User account not found" });
    return;
  }

  res.json({
    user: {
      id: appUser.id,
      email: appUser.email,
      username: appUser.username,
      phone: appUser.phone,
      avatarUrl: appUser.avatarUrl,
      createdAt: appUser.createdAt,
    },
    token: data.session.access_token,
  });
});

// POST /api/auth/logout
router.post("/auth/logout", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = req.headers["authorization"];
  const token = authHeader!.slice(7);

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  await anonClient.auth.signOut();
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const u = authReq.appUser;
  res.json({
    id: u.id,
    email: u.email,
    username: u.username,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  });
});

export default router;
