import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ログイン・サインアップ画面自体は保護対象から除外する
  // (以前は /admin 配下すべてが対象になっており、ログイン画面自体が
  //  無限リダイレクトを起こしうる状態だった)
  const isPublicAdminPath =
    pathname === "/admin/login" || pathname === "/admin/signup";

  if (pathname.startsWith("/admin") && !isPublicAdminPath && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}
