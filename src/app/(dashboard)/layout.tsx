import { Suspense } from "react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-super-aman-123",
);

async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("session")?.value;

  if (!token) redirect("/login");

  let user;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    user = {
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar user={user} />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground animate-pulse">
            Memuat dashboard...
          </p>
        </div>
      }
    >
      <AuthWrapper>{children}</AuthWrapper>
    </Suspense>
  );
}
