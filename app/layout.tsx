import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: "Bullshit Tracker",
  description: "Track your loads, one dump at a time",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bullshit",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bullshit" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* iOS Splash Screens */}
        {/* iPhone 16 Pro Max, 17 Pro Max */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1320-2868.png"
              media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 16 Pro, 17 Pro */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1206-2622.png"
              media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 15 Pro Max, 15 Plus, 14 Pro Max, 16 Plus */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1290-2796.png"
              media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 15 Pro, 15, 14 Pro, 16 */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1179-2556.png"
              media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 14 Plus, 13 Pro Max, 12 Pro Max */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1284-2778.png"
              media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 14, 13, 13 Pro, 12, 12 Pro */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1170-2532.png"
              media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 13 mini, 12 mini */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1125-2436.png"
              media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 11 Pro Max, XS Max */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-1242-2688.png"
              media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        {/* iPhone 11, XR */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-828-1792.png"
              media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        {/* iPhone SE 3rd gen, SE 2nd gen, 8, 7, 6s */}
        <link rel="apple-touch-startup-image"
              href="/splash/apple-splash-750-1334.png"
              media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />

        {/* Prevent phone number detection */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
