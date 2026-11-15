import type { Metadata } from "next";
import "./globals.css";
import "./storefront.css";
import "./reference-style.css";
import { Header, Footer } from "./ui";
export const metadata: Metadata = { metadataBase: new URL("https://dori-books.djnl.workers.dev"), title: { default: "Botanical Journals | Mandy Lebides", template: "%s | Botanical Journals" }, description: "Botanical drawings, mini canvases, hand bound Japanese journals and bookmarks by Mandy Lebides.", openGraph: { title: "Botanical Journals", description: "Botanical drawings, mini canvases, hand bound Japanese journals and bookmarks by Mandy Lebides.", type: "website" }, icons: { icon: "/favicon.svg" }, robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><a className="sr-only" href="#main">Skip to content</a><Header />{children}<Footer /></body></html>; }
