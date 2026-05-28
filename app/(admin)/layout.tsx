/*
 * ----------------------------------------------
 * 後台 Layout（shadcn dashboard shell + Session 二次驗證）
 * 2026-05-26
 * app/(admin)/layout.tsx
 * ----------------------------------------------
 * middleware 已攔截未登入請求，此處於 Server Component 再次確認 session。
 * 側邊欄單一導覽「活動場次」；頂列顯示登入者 Email 與登出。
 */
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{session.user.email}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  登出
                </Button>
              </form>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
