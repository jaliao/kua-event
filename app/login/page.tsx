/*
 * ----------------------------------------------
 * 後台登入頁（Google OAuth）
 * 2026-05-26
 * app/login/page.tsx
 * ----------------------------------------------
 */
import { signIn } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-lg border p-8 text-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold">跨團體票系統</h1>
          <p className="mt-1 text-sm text-muted-foreground">後台管理員登入</p>
        </div>

        {error === "NotWhitelisted" && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-700">
            此 Email 不在白名單中，無法登入。
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md border px-4 py-2 font-medium hover:bg-accent"
          >
            使用 Google 登入
          </button>
        </form>
      </div>
    </div>
  );
}
