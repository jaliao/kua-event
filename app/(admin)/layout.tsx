/*
 * ----------------------------------------------
 * 後台 Layout（Session 二次驗證）
 * 2026-05-26
 * app/(admin)/layout.tsx
 * ----------------------------------------------
 * middleware 已攔截未登入請求，此處於 Server Component 再次確認 session。
 */
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">跨團體票系統</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="underline">
              登出
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
