import { NextResponse } from "next/server";

// Resolves the default language code from the backend, mirroring the logic that
// previously lived in app/page.jsx. Moved into middleware so the app root does
// not need a `page.jsx` (which would require a second root layout and conflict
// with app/[lang]/layout.jsx).
const getDefaultLanguageCode = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-system-languages-codes`
    );
    const data = await res.json();
    return data?.data?.default_language_code || "en";
  } catch (error) {
    console.log("middleware default-language error", error);
    return "en";
  }
};

export async function middleware(request) {
  // Only redirect the bare root path to the default localized route.
  if (request.nextUrl.pathname === "/") {
    const defaultLanguageCode = await getDefaultLanguageCode();
    return NextResponse.redirect(new URL(`/${defaultLanguageCode}`, request.url));
  }
  return NextResponse.next();
}

// Skip Next internals, static assets and API routes; localized routes are
// handled by app/[lang].
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
