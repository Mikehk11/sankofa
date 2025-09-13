import "@/styles/theme.css";     // theme tokens first
import "@/styles/global.scss";   // component/global styles

import Header from "@/components/Header";
import RouteLoader from "@/components/RouteLoader";
import Footer from "@/components/Footer";
import HydrateStores from "@/components/HydrateStores";

export const metadata = { title: "Sankofa" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-set theme to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var m = localStorage.getItem('theme');
                  if (!m) m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', m);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="app-shell">
        <Header />
        <RouteLoader />
        {/* hydrate once from API/DB on first client render */}
        <HydrateStores />

        <main className="container">{children}</main>

        <Footer />
      </body>
    </html>
  );
}