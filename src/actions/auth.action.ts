"use server";

import { db } from "@/db";
import { users, auditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/services/auth.service";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";

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

export async function registerAction(formData: FormData) {
  const nama = formData.get("nama") as string;
  const username = formData.get("username") as string;
  const no_hp = formData.get("no_hp") as string;
  const password = formData.get("password") as string;
  const confirm_password = formData.get("confirm_password") as string;

  if (!nama || !username || !password || !confirm_password) {
    return { error: "Semua kolom wajib diisi" };
  }

  if (password !== confirm_password) {
    return { error: "Konfirmasi password tidak cocok" };
  }

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (existingUser.length > 0) {
      return { error: "Username sudah terdaftar" };
    }

    const hashedPassword = await hashPassword(password);
    await db.insert(users).values({
      nama,
      username,
      password: hashedPassword,
      role: "penyewa",
      no_hp,
    });

    return { success: true };
  } catch (error: any) {
    return { error: "Terjadi kesalahan sistem saat mendaftar" };
  }
}

export async function logoutAction() {
  (await cookies()).delete("session");
  redirect("/login");
}
