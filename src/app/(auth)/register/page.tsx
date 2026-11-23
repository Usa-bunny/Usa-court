"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.success) {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Buat akun penyewa</CardTitle>
          <CardDescription>
            Daftar untuk mulai memesan lapangan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-4 text-green-700 bg-green-50 rounded-md text-center">
              Pendaftaran berhasil! Mengalihkan ke halaman login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nama">Nama lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  placeholder="Contoh: Penyewa Satu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Buat username unik"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_hp">Nomor HP</Label>
                <Input
                  id="no_hp"
                  name="no_hp"
                  placeholder="08xxxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Konfirmasi password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Daftar akun"}
              </Button>
            </form>
          )}

          {!success && (
            <div className="mt-4 text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Masuk
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
