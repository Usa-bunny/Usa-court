"use server";

import { db } from "@/db";
import { users, auditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/services/auth.service";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-super-aman-123",
);

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password)
    return { error: "Username dan password wajib diisi" };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));
  if (!user) return { error: "User tidak ditemukan" };

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return { error: "Password salah" };

  const token = await new SignJWT({
    id: user.id,
    role: user.role,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(SECRET_KEY);

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  await db.insert(auditLog).values({
    user_id: user.id,
    aksi: "login",
  });

  return { success: true, role: user.role };
}
