import { NextResponse } from "next/server";

const withLangCookie = (response, lang) => {
    response.cookies.set("lang", lang, { path: "/", httpOnly: false });
    return response;
};

const getLangCodes = async (request) => {
    // fetch our own route on the origin this request came in on, so it works
    // on localhost, staging and production without depending on an env var
    try {
        const res = await fetch(new URL("/api/lang-codes", request.nextUrl.origin));
        if (!res.ok) throw new Error(`lang-codes responded ${res.status}`);
        return await res.json();
    } catch {
        return { supportedLangs: ["en"], defaultLangCode: "en" };
    }
};

export async function proxy(request) {
    const { supportedLangs, defaultLangCode } = await getLangCodes(request);

    const { pathname } = request.nextUrl;
    const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();

    // Step 2: default lang prefix → strip and redirect
    if (firstSegment === defaultLangCode) {
        const segments = pathname.split("/").filter(Boolean);
        const rest = segments.slice(1).join("/");
        const newPath = rest ? `/${rest}` : "/";
        const redirectUrl = new URL(newPath, request.url);
        redirectUrl.search = request.nextUrl.search;
        return withLangCookie(NextResponse.redirect(redirectUrl, { status: 301 }), defaultLangCode);
    }

    // Step 3: valid non-default lang prefix → pass through as-is
    if (firstSegment && supportedLangs.includes(firstSegment)) {
        return withLangCookie(NextResponse.next(), firstSegment);
    }

    // Step 4: no lang prefix → rewrite internally to /{defaultLang}{pathname}
    const rewritePath = pathname === "/" ? `/${defaultLangCode}` : `/${defaultLangCode}${pathname}`;
    const rewriteUrl = new URL(rewritePath, request.url);
    rewriteUrl.search = request.nextUrl.search;
    return withLangCookie(NextResponse.rewrite(rewriteUrl), defaultLangCode);
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
