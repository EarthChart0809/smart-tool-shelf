import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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

          response = NextResponse.next({ request });

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

  const isPublicAdminPath = pathname === "/admin/login";
  const isSetPasswordPath = pathname === "/admin/set-password";

  if (pathname.startsWith("/admin") && !isPublicAdminPath && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 招待直後でまだパスワードを設定していない管理者は、
  // 設定完了ページ以外の管理画面に入れないようにする
  if (user && pathname.startsWith("/admin") && !isSetPasswordPath) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    if (profile && !profile.passwordSet) {
      return NextResponse.redirect(new URL("/admin/set-password", request.url));
    }
  }

  return response;
}
