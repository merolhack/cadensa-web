import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cadensa — Encuentra el ritmo de tu voz",
  description:
    "Plataforma diaria que entrena tu ritmo al hablar para superar bloqueos y comunicarte con total seguridad. Basada en el habla rítmica silábica.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cadensa",
  },
  verification: {
    google: "n2GCgYUYH1CHgZTm_iYkWM-bXqGR7o-c8kXoy3jB5EQ",
    other: {
      "msvalidate.01": ["856757614FFC2C5582FBCB81B1B4E4CA"],
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="google-site-verification" content="n2GCgYUYH1CHgZTm_iYkWM-bXqGR7o-c8kXoy3jB5EQ" />
        <meta name="msvalidate.01" content="856757614FFC2C5582FBCB81B1B4E4CA" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        {children}

        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HCTT9146TJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HCTT9146TJ');
          `}
        </Script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
