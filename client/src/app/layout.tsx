import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NarrativeX",
  description: "NarrativeX is a web-based system that collects social-media and news content, extracts and compares claims using NLP and semantic analysis, and tracks their evolution and spread. It categorizes claims based on available evidence and visualizes narrative and propagation patterns through an interactive dashboard.",
  authors: [
    { name: "Suhas Kanwar", url: "https://suhaskanwar.vercel.app" },
  ],
  keywords: [
    "narrative analysis",
    "claim verification",
    "social media monitoring",
    "news analysis",
    "NLP",
    "semantic analysis",
    "data visualization",
    "interactive dashboard",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
