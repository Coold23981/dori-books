import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "./ui";
export const metadata: Metadata = { metadataBase: new URL("https://dori-botanical-artist-books.gfdffsgfsd.chatgpt.site"), title: { default: "Dori | Botanical Art", template: "%s | Dori" }, description: "Original botanical drawings, mini canvases, hand bound Japanese journals and bookmarks by Dori.", openGraph: { title: "Dori Botanical Art", description: "Original botanical drawings, mini canvases, hand bound Japanese journals and bookmarks.", type: "website" }, robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><a className="sr-only" href="#main">Skip to content</a><Header />{children}<Footer /></body></html>; }
