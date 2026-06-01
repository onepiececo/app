import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { ThemeScript } from "@/components/theme-script";
import { Inter, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});

const interHeading = Inter({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Template",
  description: "Next.js 16 + Better-Auth + coss ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-mono", inter.variable, interHeading.variable, geistMono.variable)}>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
