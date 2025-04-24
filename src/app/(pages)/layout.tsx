import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QAS Portal",
  description: "A question and answer support portal",
  icons: {
    icon: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Prevent flash by applying stored theme before React mounts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const t = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.toggle('dark', t==='dark');
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} overscroll-none bg-slate-50 transition-colors duration-300 ease-in-out dark:bg-slate-900`}
      >
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
