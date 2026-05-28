/*
 * ----------------------------------------------
 * 後台登入頁（Google OAuth）
 * 2026-05-26
 * app/login/page.tsx
 * ----------------------------------------------
 * 樣式參考 shadcn login-01（卡片置中），保留白名單錯誤提示與 OAuth 行為。
 */
import { signIn } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">跨團體票系統</CardTitle>
          <CardDescription>後台管理員登入</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "NotWhitelisted" && (
            <p className="rounded-md bg-destructive/10 p-2 text-center text-sm text-destructive">
              此 Email 不在白名單中，無法登入。
            </p>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              使用 Google 登入
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
