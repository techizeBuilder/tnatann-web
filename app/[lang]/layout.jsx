import { Manrope } from "next/font/google";
import "../globals.css";
import { Providers } from "@/redux/store/providers";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/Layout/CookieBanner";
import { redirect } from "next/navigation";
import { getLanguageCodes } from "@/lib/seoApi";

const manrope = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const generateMetadata = () => {
  return {
    title: process.env.NEXT_PUBLIC_META_TITLE,
    description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
    keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    openGraph: {
      title: process.env.NEXT_PUBLIC_META_TITLE,
      description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
      keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    },
  };
};



export default async function LangLayout({ children,
  params
}) {
  const { lang } = await params;
  const { supportedLangs, defaultLangCode } = await getLanguageCodes();

  const normalizedLang = lang?.toLowerCase();

  if (!supportedLangs.includes(normalizedLang)) {
    redirect(`/${defaultLangCode}`);
  }

  return (
    <html
      lang={normalizedLang}
      web-version={process.env.NEXT_PUBLIC_WEB_VERSION}
      className="scroll-smooth"
    >
      <body className={`${manrope.className} pointer-events-auto!`}>
        <div
          id="scroll-sentinel"
          className="absolute top-0 h-1 w-1 opacity-0 pointer-events-none"
        />
        <Providers>
          {children}
          <Toaster position="top-center" theme="light" closeButton={true} />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}