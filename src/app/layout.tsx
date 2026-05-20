import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#EFE9E3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dapurumi.com"),
  title: {
    default: "Dapur Umi — Dari Dapur, Sampai Ke Hati",
    template: "%s | Dapur Umi",
  },
  description:
    "Bakeri buatan tangan premium yang menyajikan kek, pastri, dan kuih artisan dengan bahan terpilih. Tempah melalui WhatsApp untuk majlis istimewa anda.",
  keywords: [
    "bakeri",
    "kek",
    "kek tempahan",
    "pastri",
    "kuih",
    "kuih tradisional",
    "buatan tangan",
    "premium",
    "artisan",
    "Petaling Jaya",
    "Selangor",
    "Malaysia",
    "Dapur Umi",
  ],
  authors: [{ name: "Dapur Umi" }],
  creator: "Dapur Umi",
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "https://dapurumi.com",
    siteName: "Dapur Umi",
    title: "Dapur Umi — Dari Dapur, Sampai Ke Hati",
    description:
      "Bakeri buatan tangan premium yang menyajikan kek, pastri, dan kuih artisan dengan bahan terpilih.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Dapur Umi - Bakeri Buatan Tangan Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dapur Umi — Dari Dapur, Sampai Ke Hati",
    description:
      "Bakeri buatan tangan premium yang menyajikan kek, pastri, dan kuih artisan.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
          playfair.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
