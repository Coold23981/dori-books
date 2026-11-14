import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "./ui";
export const metadata: Metadata = { metadataBase: new URL("https://dori-botanical-artist-books.gfdffsgfsd.chatgpt.site"), title: { default: "Dori | Botanical Artist Books", template: "%s | Dori" }, description: "Collectible botanical artist books and original works, bound by hand. Draft site awaiting artist approval and catalogue photography.", openGraph: { title: "Dori Botanical Artist Books", description: "Collectible botanical artist books and original works, bound by hand.", type: "website" }, robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><a className="sr-only" href="#main">Skip to content</a><Header />{children}<Footer /></body></html>; }
