import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Vansh Vijay — Full Stack Developer & Founder",
  description: "MERN Stack Developer & founder of ConsistPay. Building real-world products, streaks engine, live payments, and AI-powered accountability systems.",
  keywords: ["Vansh Vijay", "ConsistPay", "Full Stack Developer", "MERN Stack", "React", "NodeJS", "Developer Portfolio"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#030308] text-[#f8fafc] noise-overlay relative">
        <div id="scroll-progress" />
        {children}
      </body>
    </html>
  );
}
