import { Manrope } from "next/font/google";
import "../globals.css";
import { Providers } from "@/redux/store/providers";
import { Toaster } from "@/components/ui/sonner";


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

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  const normalizedLang = lang?.toLowerCase();

  return (
    <html
      lang={normalizedLang}
      web-version={process.env.NEXT_PUBLIC_WEB_VERSION}
      data-scroll-behavior="smooth"
    >
      <body className={`${manrope.className} pointer-events-auto! overflow-x-hidden`}>
        <div
          id="scroll-sentinel"
          className="absolute top-0 h-1 w-1 opacity-0 pointer-events-none"
        />
        <Providers>
          {children}
          <Toaster position="top-center" theme="light" closeButton={true} />
        </Providers>
      </body>
    </html>
  );
}